import { simple as envelope } from '../src/index';

test('initialize', () => {
  const encryption = envelope.initialize('test');
  expect(encryption.dek).toBeDefined();
  expect(encryption.salt).toBeDefined();
});

test('get kek', () => {
  const encryption = envelope.initialize('test');
  const KEK = envelope.generateKey('test', encryption.salt);
  expect(KEK).toBeDefined();
});

test('encrypt and decrypt data', () => {
  const data = 'some data';
  const encryption = envelope.initialize('test');
  const KEK = envelope.generateKey('test', encryption.salt);
  const encrypted = envelope.encryptData(encryption.dek, KEK, data);
  const decrypted = envelope.decryptData(encryption.dek, KEK, encrypted);
  expect(decrypted).toBe(data);
});

test('encrypt and decrypt data with different KEK', () => {
  const data = 'some data';
  const encryption = envelope.initialize('test');
  const KEK = envelope.generateKey('test', encryption.salt);
  const encrypted = envelope.encryptData(encryption.dek, KEK, data);
  const KEK2 = envelope.generateKey('test', encryption.salt);
  const decrypted = envelope.decryptData(encryption.dek, KEK2, encrypted);
  expect(decrypted).toBe(data);
});

test('change keyphrase', () => {
  const data = 'some data';
  const encryption = envelope.initialize('test');
  const KEK = envelope.generateKey('test', encryption.salt);
  const encrypted = envelope.encryptData(encryption.dek, KEK, data);
  const newEncryption = envelope.changeKeyphrase(encryption.dek, KEK, 'test2');
  const KEK2 = envelope.generateKey('test2', newEncryption.salt);
  const decrypted = envelope.decryptData(newEncryption.dek, KEK2, encrypted);
  expect(decrypted).toBe(data);
});
