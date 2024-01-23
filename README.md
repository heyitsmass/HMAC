# Tamper Proof Data

`SecureConnection`: A simple, zero dependency HMAC wrapper for the native browser crypto module to send and receive validated messages between server and client.

- `establish():Promise<SecureConnection>`
	- Establishes a secure '*connection*' between the client and server. 
	- For a connection to be secure the client must have 
		- An HMAC key present in `localStorage` (auto-generated).
		- Initial data.
		- Signature to reference data against.
		
-  `get<T,>() => Promise<T>` 
	- Provides `GET` functionality from the server.
	- Messages are signed by the client and transmitted to the server.
	- The response must contain the signature sent by the client, re-validated on return.
  
-  `send<T,>(data:T) => Promise<T>`
	-  Provides `POST` functionality to the server from the client.
	- Messages are signed by the client, data is saved into the `localStorage`.
	- Upon saving the data, the get process is repeated to validate and update the data.

-  `verify() => Promise<boolean>` 
	- Provides verification functionality of the client data.
	- Known data and signature is collected from the client.
	- Data is requested from the server and validated against the client's known data.
	- If the data is *invalid*, the user is prompted to restore the data from the preexisting client data.
