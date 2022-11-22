import {
  decryptData,
  encryptData,
  generateKey,
  initialize,
  changeKeyphrase,
} from '../src/index';

test('initialize', () => {
  const encryption = initialize('test');
  expect(encryption.wrappedDEK).toBeDefined();
  expect(encryption.dekIv).toBeDefined();
  expect(encryption.dekAuthTag).toBeDefined();
  expect(encryption.KEK).toBeDefined();
  expect(encryption.kekSalt).toBeDefined();
});

test('get kek', () => {
  const encryption = initialize('test');
  const KEK = generateKey('test', encryption.kekSalt);
  expect(KEK).toBe(encryption.KEK);
});

test('encrypt and decrypt data', () => {
  const encryption = initialize('test');
  const encrypted = encryptData(
    'test',
    encryption.wrappedDEK,
    encryption.dekIv,
    encryption.dekAuthTag,
    encryption.KEK
  );
  expect(encrypted.data).toBeDefined();
  expect(encrypted.authTag).toBeDefined();
  const decrypted = decryptData(
    encrypted.data,
    encrypted.authTag,
    encrypted.iv,
    encryption.wrappedDEK,
    encryption.dekIv,
    encryption.dekAuthTag,
    encryption.KEK
  );
  expect(decrypted).toBe('test');
});

test('encrypt and decrypt data with different KEK', () => {
  const encryption = initialize('test');
  const encrypted = encryptData(
    'test',
    encryption.wrappedDEK,
    encryption.dekIv,
    encryption.dekAuthTag,
    encryption.KEK
  );
  expect(encrypted.data).toBeDefined();
  expect(encrypted.authTag).toBeDefined();
  const KEK = generateKey('test', encryption.kekSalt);
  const decrypted = decryptData(
    encrypted.data,
    encrypted.authTag,
    encrypted.iv,
    encryption.wrappedDEK,
    encryption.dekIv,
    encryption.dekAuthTag,
    KEK
  );
  expect(decrypted).toBe('test');
});

test('change keyphrase', () => {
  const encryption = initialize('test');
  const encrypted = encryptData(
    'data',
    encryption.wrappedDEK,
    encryption.dekIv,
    encryption.dekAuthTag,
    encryption.KEK
  );

  const newEncryption = changeKeyphrase(
    'test',
    'test2',
    encryption.wrappedDEK,
    encryption.dekIv,
    encryption.dekAuthTag,
    encryption.kekSalt
  );
  expect(newEncryption.wrappedDEK).toBeDefined();
  expect(newEncryption.dekIv).toBeDefined();
  expect(newEncryption.dekAuthTag).toBeDefined();
  expect(newEncryption.kekSalt).toBeDefined();
  const decrypted = decryptData(
    encrypted.data,
    encrypted.authTag,
    encrypted.iv,
    newEncryption.wrappedDEK,
    newEncryption.dekIv,
    newEncryption.dekAuthTag,
    newEncryption.KEK
  );
  expect(decrypted).toBe('data');
});
