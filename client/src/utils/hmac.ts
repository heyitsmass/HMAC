import { base64ToBytes, bytesToBase64 } from ".";

const DEBUG = false;

/**
 * Represents an HMAC (Hash-based Message Authentication Code) class.
 * 
 * - Provides methods for generating and verifying HMAC signatures.
 */
export default class HMAC {
  /**The literal key representation */
  protected key: CryptoKey;
  /**The buffer key representation */
  protected buffer: ArrayBuffer;

  private closed:boolean = false; 


  /**
   * Constructs a new instance of the HMAC class.
   * @param key The cryptographic key used for HMAC calculation.
   * @param buffer The buffer to be used for HMAC calculation.
   */
  private constructor(key: CryptoKey, buffer: ArrayBuffer) {
    this.key = key;
    this.buffer = buffer;
  }

  /**
   * Reloads the HMAC key from localStorage if it exists.
   * @returns A Promise that resolves to an instance of the HMAC class.
   */
  private static async reload() {
    const key = localStorage.getItem("secretKey");
    if (key) {
      DEBUG && console.log("Restoring key from localStorage");
      const buffer = Uint8Array.from(atob(key), (c) => c.charCodeAt(0));

      return new this(
        await crypto.subtle.importKey(
          "raw",
          buffer,
          {
            name: "HMAC",
            hash: "SHA-256",
          },
          false, //keys can only be exported to save them on generation.
          ["sign", "verify"]
        ),
        buffer
      );
    }
    DEBUG && console.log("No HMAC key found in localStorage.");
  }

  /**
   * Generates an HMAC key.
   * @returns A Promise that resolves to the generated HMAC key.
   */
  private static async generate() {
    DEBUG && console.log("Generating HMAC key");
    const key = await crypto.subtle.generateKey(
      {
        name: "HMAC",
        hash: "SHA-256",
        length: 256,
      },
      true,
      ["sign", "verify"]
    );

    const buffer = await crypto.subtle.exportKey("raw", key);

    const encoded = btoa(
      String.fromCharCode(...new Uint8Array(buffer))
    );

    localStorage.setItem("secretKey", encoded);

    DEBUG && console.log("Saved HMAC key.");

    return new this(key, buffer);
  }

  /**
   * Flattens the given data into a Uint8Array.
   * If the data is a string, it is encoded as is.
   * If the data is an object, it is first converted to a JSON string and then encoded.
   * @param data - The data to be flattened.
   * @returns The flattened data as a Uint8Array.
   */
  protected flatten = (data: string | NonNullable<unknown>) =>
    new TextEncoder().encode(
      typeof data === "string" ? data : JSON.stringify(data)
    );

  /**
   * Signs the given data using the HMAC key and returns the result as a base64-encoded string.
   * @param data - The data to be signed.
   * @returns A Promise that resolves to the base64-encoded signature.
   */
  protected signBase64 = async (data: string | NonNullable<unknown>) =>
    bytesToBase64(
      await crypto.subtle.sign("HMAC", this.key, this.flatten(data))
    );

  /**
   * Signs the provided data and caches the signature in the local storage.
   * @param data The data to be signed.
   * @returns The generated signature.
   */
  private sign = async (data: string | NonNullable<unknown>) => {


    const lastSignature = await this.signBase64(data);

    localStorage.setItem("signature", lastSignature);

    DEBUG && console.log("Cached signature:", lastSignature);

    return lastSignature;
  };

  /**
   * Verifies the integrity of the provided data by comparing it with the given signature.
   * @param data - The data to be verified.
   * @param signature - The signature to compare against.
   * @returns A promise that resolves to a boolean indicating whether the data is valid or not.
   */
  private verify = async (
    data: string | NonNullable<unknown>,
    signature: string
  ) => {

    DEBUG && console.log("Verifying data.");
    const lastSignature = localStorage.getItem("signature");
    if (lastSignature !== signature) {
      DEBUG && console.log(
        "Failed to validate provided signature against known signature."
      );
      return false;
    }
    return crypto.subtle.verify(
      "HMAC",
      this.key,
      base64ToBytes(signature),
      this.flatten(data)
    );
  };

  /**
   * Initializes the HMAC with optional data.
   * If no data is provided, it checks for data in localStorage.
   * If data is found, it restores it from localStorage.
   * If data is provided, it initializes it and stores it in localStorage.
   * It then tries to reload the key, and if it fails, it generates a new key.
   * @param data Optional data to initialize the HMAC with.
   * @returns The initialized key.
   * @throws Throws an error if failed to initialize the HMAC.
   */
  public static init = async <T>(data?: NonNullable<T>) => {
    console.log("Initializing HMAC");

    if (!data) {
      if (!(data = localStorage.getItem("data") as NonNullable<T>)) {
        DEBUG && console.log(
          "No data passed as initializer or found in localStorage."
        );
      } else {
        DEBUG && console.log("Restoring data from localStorage.");
      }
    } else {
      localStorage.setItem("data", JSON.stringify(data, null, 2));
      DEBUG && console.log(
        "Initializing data to:",
        typeof data === "string" ? data : JSON.stringify(data, null, 2)
      );
    }

    try {
      const key = (await this.reload()) ?? (await this.generate());

      console.log(
        "Key initialized:",
        JSON.stringify(
          {
            ...key.key.algorithm,
          },
          null,
          2
        )
      );

      return key;
    } catch (e) {
      DEBUG && console.error("Failed to initialize HMAC", (e as Error).message);
      throw e;
    }
  };

  /**
   * Checks if two values are equal by comparing their JSON string representations.
   * @param value1 - The first value to compare.
   * @param value2 - The second value to compare.
   * @returns True if the values are equal, false otherwise.
   */
  protected is(value1: NonNullable<unknown>, value2: NonNullable<unknown>) {
    return JSON.stringify(value1) === JSON.stringify(value2);
  }

  /**
   * Validates the provided data against the stored data and signature.
   * @param data - The data to be validated.
   * @returns A boolean indicating whether the data is valid.
   * @throws Error if the data is invalid.
   */
  private validateData = async <T>(data: NonNullable<T>) => {
    DEBUG && console.log('Validating data.');

    const d = await this.getData<T>();

    if (!this.is(d, data)) throw new Error("Invalid data");

    DEBUG && console.log("Data validated.");

    return (
      (await this.sign(data)) === localStorage.getItem("signature")
    );
  };

  /**
   * Fetches data from the server and verifies its signature.
   * @returns A promise that resolves to the fetched data.
   * @throws An error if the request fails, the signature is missing, or the signature is invalid.
   */
  public async getData<T>(): Promise<NonNullable<T>> {
    if(this.closed) throw new Error("HMAC is closed.");
    const tmp = localStorage.getItem("data") ?? '';

    DEBUG && console.log("Fetching data");

    const signature = await this.sign(tmp);

    const response = await fetch("http://localhost:3000", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${signature}`,
      },
    });

    if (!response.ok) throw new Error("Request failed");

    const sig = response.headers.get("x-signature");

    if (!sig) throw new Error("Missing signature");

    if (sig !== signature) throw new Error("Invalid signature");

    DEBUG && console.log("Signature verified.");

    const json = await response.json();

    if (!(await this.verify(json, sig)))
      throw new Error("Invalid signature");

    DEBUG && console.log("Data verified.");

    return json;
  }

  /**
   * Posts data to a server endpoint.
   * @param data The data to be posted.
   * @returns A promise that resolves to the response data.
   * @throws An error if the request fails.
   */
  public async postData<T>(data: NonNullable<T>) {
    if(this.closed) throw new Error("HMAC is closed.");
    const signature = await this.sign(data);
    const body = JSON.stringify(data);

    localStorage.setItem("data", body);

    DEBUG && console.log("Cached data:", JSON.stringify(body, null, 2));

    const response = await fetch("http://localhost:3000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${signature}`,
      },
      body,
    });

    if (!response.ok) throw new Error("Request failed");

    console.log("Data posted.");

    return this.getData<T>();
  }

  /**
   * Verifies the data stored in the local storage.
   * @returns A promise that resolves with the result of data validation.
   */
  public verifyData = async () => {
    if(this.closed) throw new Error("HMAC is closed.");
    DEBUG && console.log("Referencing cached data.", localStorage.getItem("data"));

    return this.validateData(
      JSON.parse(localStorage.getItem("data") ?? "")
    );
  };

  /**
   * Closes the HMAC connection.
   * @returns A promise that resolves when the connection is closed.
   */
  public close(){
    return this.closed = true; 
  }

  /**
   * Checks if the HMAC connection is closed.
   * @returns A boolean indicating whether the connection is closed.
   */
  public isClosed(){
    return this.closed;
  }

  /**
   * Resets the HMAC connection.
   * @returns A promise that resolves when the connection is reset.
   */

  public async reset(){
    if(this.closed) throw new Error("HMAC is closed.");
    localStorage.clear();
    this.close();
    return HMAC.init();
  }

  /**
   * Opens the HMAC connection.
   */
  public open(){
    return this.closed = false;
  }

  /**
   * Checks if the HMAC connection is open.
   * @returns A boolean indicating whether the connection is open.
   */
  public isOpen(){
    return !this.closed;
  }
  

}
