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

interface bundledDEK {
  dek: string;
  iv: string;
  auth: string;
}

interface simpleEncryption {
  dek: string;
  salt: string;
}
