
/**
 * Converts a Uint8Array or ArrayBuffer of bytes to a base64 string.
 * @param bytes The bytes to convert.
 * @returns The bytes as a base64 string.
 */
const bytesToBase64 = (bytes: Uint8Array | ArrayBuffer) =>
  btoa(
    String.fromCharCode(
      ...(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes))
    )
  );


/**
 * Converts a base64 string to a Uint8Array of bytes.
 * 
 * @param base64 The base64 string to convert.
 * @returns The Uint8Array of bytes.
 */
const base64ToBytes = (base64: string) =>
  Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

export {
  base64ToBytes, bytesToBase64
};
