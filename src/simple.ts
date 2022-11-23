import * as _default from './default';

/**
 * Generate all encryption requirements.
 * @param keyphrase The keyphrase to use for this encryption
 * @returns The simple encryption object
 */
function initialize(keyphrase: string): simpleEncryption {
  const encryption = _default.initialize(keyphrase);
  const base64DEK = _assembleDEK(
    encryption.wrappedDEK,
    encryption.dekIv,
    encryption.dekAuthTag
  );
  return {
    dek: base64DEK,
    salt: encryption.kekSalt,
  };
}

/**
 * Change the keyphrase used to encrypt the Data Encryption Key ( DEK ).
 * @param DEK The bundled Data Encryption Key ( DEK )
 * @param KEK The Key Encryption Key ( KEK )
 * @param newKeyphrase The new keyphrase to use
 * @returns The new simple encryption object
 */
function changeKeyphrase(
  DEK: string,
  KEK: string,
  newKeyphrase: string
): simpleEncryption {
  const bundledDEK = _dismantleDEK(DEK);
  const encryption = _default.changeKeyphrase(
    bundledDEK.dek,
    bundledDEK.iv,
    bundledDEK.auth,
    KEK,
    newKeyphrase
  );
  const base64DEK = _assembleDEK(
    encryption.wrappedDEK,
    encryption.dekIv,
    encryption.dekAuthTag
  );
  return {
    dek: base64DEK,
    salt: encryption.kekSalt,
  };
}

/**
 * Generate the Key Encryption Key ( KEK ) from the keyphrase.
 * @param keyphrase The keyphrase used to initialize the encryption
 * @param salt The salt that was returned when the encryption was initialized
 * @returns The Key Encryption Key ( KEK )
 */
function generateKey(keyphrase: string, salt: string): string {
  return _default.generateKey(keyphrase, salt);
}

/**
 * Encrypt some data using the Data Encryption Key ( DEK ).
 * @param DEK The Data Encryption Key ( DEK )
 * @param KEK The Key Encryption Key ( KEK )
 * @param data The data to encrypt
 * @returns The encrypted data
 */
function encryptData(DEK: string, KEK: string, data: string): string {
  const bundledDEK = _dismantleDEK(DEK);
  const encrypted = _default.encryptData(
    data,
    bundledDEK.dek,
    bundledDEK.iv,
    bundledDEK.auth,
    KEK
  );
  const base64Encrypted = Buffer.from(JSON.stringify(encrypted)).toString(
    'base64'
  );
  return base64Encrypted;
}

/**
 * Decrypt previously encrypted data using the Data Encryption Key ( DEK ).
 * @param DEK The Data Encryption Key ( DEK )
 * @param KEK The Key Encryption Key ( KEK )
 * @param data The data to decrypt
 * @returns The decrypted data
 */
function decryptData(DEK: string, KEK: string, data: string): string {
  const bundledDEK = _dismantleDEK(DEK);
  const parsedData = JSON.parse(Buffer.from(data, 'base64').toString());
  const decrypted = _default.decryptData(
    parsedData.data,
    parsedData.authTag,
    parsedData.iv,
    bundledDEK.dek,
    bundledDEK.iv,
    bundledDEK.auth,
    KEK
  );
  return decrypted;
}

function _dismantleDEK(
  bundledDEK: string
): { dek: string; iv: string; auth: string } {
  const parsedDEK = JSON.parse(Buffer.from(bundledDEK, 'base64').toString());
  return parsedDEK;
}

function _assembleDEK(dek: string, iv: string, auth: string): string {
  const bundledDEK = {
    dek: dek,
    iv: iv,
    auth: auth,
  };
  const base64DEK = Buffer.from(JSON.stringify(bundledDEK)).toString('base64');
  return base64DEK;
}

export default {
  initialize,
  changeKeyphrase,
  generateKey,
  encryptData,
  decryptData,
};
