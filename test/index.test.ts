import {
  decryptData,
  encryptData,
  generateKey,
  initialize,
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
