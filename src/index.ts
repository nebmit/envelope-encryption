import {
  createCipheriv,
  createDecipheriv,
  pbkdf2Sync,
  randomBytes,
} from 'crypto';

const iterations = 320000;
const keyLength = 32;
const saltLength = 16;
const ivLength = 16;

interface encryption {
  wrappedDEK: string;
  dekIv: string;
  dekAuthTag: string;
  KEK: string;
  kekSalt: string;
}

interface encryptedData {
  data: string;
  iv: string;
  authTag: string;
}

/**
 * Generate all encryption requirements.
 * @param keyphrase The keyphrase to use for this encryption
 * @returns The encryption object
 */
function initialize(keyphrase: string): encryption {
  var kekSalt = randomBytes(saltLength).toString('hex');

  var KEK = pbkdf2Sync(keyphrase, kekSalt, iterations, keyLength, 'sha512');
  var DEK = randomBytes(keyLength);
  var dekIv = randomBytes(ivLength).toString('hex');

  var encryptedDEK = _encrypt(DEK, KEK, dekIv);

  DEK.fill(0);

  return {
    wrappedDEK: encryptedDEK.data,
    dekIv: dekIv,
    dekAuthTag: encryptedDEK.authTag,
    KEK: KEK.toString('hex'),
    kekSalt: kekSalt,
  };
}

function changeKeyphrase(
  oldKeyphrase: string,
  newKeyphrase: string,
  wrappedDEK: string,
  dekIv: string,
  dekAuthTag: string,
  kekSalt: string
): encryption {
  var newKekSalt = randomBytes(saltLength).toString('hex');
  var bufferOldKEK = Buffer.from(generateKey(oldKeyphrase, kekSalt), 'hex');
  var bufferNewKEK = Buffer.from(generateKey(newKeyphrase, newKekSalt), 'hex');

  var DEK = _decrypt(wrappedDEK, bufferOldKEK, dekIv, dekAuthTag);
  var encryptedDEK = _encrypt(DEK, bufferNewKEK, dekIv);

  DEK.fill(0);

  return {
    wrappedDEK: encryptedDEK.data,
    dekIv: dekIv,
    dekAuthTag: encryptedDEK.authTag,
    KEK: bufferNewKEK.toString('hex'),
    kekSalt: newKekSalt,
  };
}

/**
 * Generate the Key Encryption Key (KEK) from the keyphrase.
 * @param keyphrase The keyphrase used to initialize the encryption
 * @param kekSalt The salt used to generate the key encryption key
 * @returns The key encryption key
 */
function generateKey(keyphrase: string, kekSalt: string): string {
  const KEK = pbkdf2Sync(keyphrase, kekSalt, iterations, keyLength, 'sha512');
  return KEK.toString('hex');
}

/**
 * Encrypt data for storage
 * @param dataToEncrypt The data to encrypt
 * @param wrappedDEK The wrapped data encryption key
 * @param dekIv The initialization vector used to encrypt the data encryption key
 * @param dekAuthTag The authentication tag used to encrypt the data encryption key
 * @param KEK The key encryption key
 * @returns Encrypted data
 */
function encryptData(
  dataToEncrypt: string,
  wrappedDEK: string,
  dekIv: string,
  dekAuthTag: string,
  KEK: string
): encryptedData {
  var bufferKEK = Buffer.from(KEK, 'hex');
  var DEK = _decrypt(wrappedDEK, bufferKEK, dekIv, dekAuthTag);
  var dataIv = randomBytes(ivLength).toString('hex');
  var encrypted = _encrypt(Buffer.from(dataToEncrypt), DEK, dataIv);
  DEK.fill(0);
  return encrypted;
}

/**
 * Decrypt stored data
 * @param dataToDecrypt The encrypted data
 * @param decryptionAuthTag The authentication tag used to encrypt the data
 * @param decryptionIv The initialization vector used to encrypt the data
 * @param wrappedDEK The wrapped data encryption key
 * @param dekIv The initialization vector used to encrypt the data encryption key
 * @param dekAuthTag The authentication tag used to encrypt the data encryption key
 * @param KEK The key encryption key
 * @returns The decrypted data
 */
function decryptData(
  dataToDecrypt: string,
  decryptionAuthTag: string,
  decryptionIv: string,
  wrappedDEK: string,
  dekIv: string,
  dekAuthTag: string,
  KEK: string
): string {
  var bufferKEK = Buffer.from(KEK, 'hex');
  var DEK = _decrypt(wrappedDEK, bufferKEK, dekIv, dekAuthTag);
  var decryptedData = _decrypt(
    dataToDecrypt,
    DEK,
    decryptionIv,
    decryptionAuthTag
  );
  DEK.fill(0);
  return decryptedData.toString();
}

function _encrypt(
  dataToEncrypt: Buffer,
  key: Buffer,
  iv: string
): encryptedData {
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(dataToEncrypt),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag().toString('hex');
  return {
    data: encrypted.toString('hex'),
    authTag: authTag,
    iv: iv,
  };
}

function _decrypt(
  dataToDecrypt: string,
  key: Buffer,
  iv: string,
  authTag: string
): Buffer {
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataToDecrypt, 'hex')),
    decipher.final(),
  ]);
  return decrypted;
}

export { initialize, changeKeyphrase, generateKey, encryptData, decryptData };
