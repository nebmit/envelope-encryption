# Node.js - Envelope Encryption

[![CI](https://github.com/nebmit/envelope-encryption/actions/workflows/main.yml/badge.svg)](https://github.com/nebmit/envelope-encryption/actions/workflows/main.yml)
[![size](https://github.com/nebmit/envelope-encryption/actions/workflows/size.yml/badge.svg)](https://github.com/nebmit/envelope-encryption/actions/workflows/size.yml)

Simple native implementation of envelope encryption to increase ease of use of encryption in your application.

Supplies a **simple** mode to massively simplify the process

* [Simple Mode](#simple-mode-example)
* [Example Application](#express-example-authentication)


## Installation

```bash
npm install envelope-encryption
```


# Simple mode example:

```typescript
import { simple as envelope } from 'envelope-encryption';

var myKeyphrase = 'secret';
var myData = 'my data';

// This will return an object { dek: string, salt: string }
// Store these somewhere safe, next to the hashed keyphrase for example
const encryption = envelope.initialize(myKeyphrase);

var dek = encryption.dek;
var salt = encryption.salt;

// Generate the KEK from the keyphrase and salt. 
// This has to be done every time you want to encrypt/decrypt data. 
// Do not store this in any persistent storage. This is effectively the password.
const kek = envelope.generateKey(myKeyphrase, salt);

// Encrypt the data
const encrypted = envelope.encrypt(dek, kek, myData);

// ... do something with the encrypted data ...

// Decrypt the data at a later date
const decrypted = envelope.decrypt(dek, kek, encrypted);
```

# Express example authentication:


**On Sign-Up**
```typescript
import { initialize } from 'envelope-encryption';
var userPassword = 'password';

// Initialize the library with a password
var encryption = initialize(userPassword);

// Important: 
// Store these variables wherever you store your user's information
// They are required to encrypt and decrypt data
fs.writeFileSync('user.json', JSON.stringify({
    userName: 'user',
    dek: encryption.wrappedDEK,
    dekIv: encryption.dekIv,
    dekAuthTag: encryption.dekAuthTag,
    kekSalt: encryption.kekSalt
}));

// Add the key to the user's session
req.session.key = encryption.KEK;
```

**On Sign-In**
```typescript
import { generateKey } from 'envelope-encryption';
var userPassword = 'password';

// Get the user's information from wherever you store it
var user = JSON.parse(fs.readFileSync('user.json'));

// Generate the key from the password
var key = generateKey(userPassword, user.kekSalt);

// Add the key to the user's session
req.session.key = key;
```

**On Data Encryption**
```typescript
import { encryptData } from 'envelope-encryption';
var data = 'This is some data';

var key = req.session.key;

// Get the user's information from wherever you store it
var user = JSON.parse(fs.readFileSync('user.json'));

var encrypted = encryptData(
    data,
    user.wrappedDEK,
    user.dekIv,
    user.dekAuthTag,
    key
);

// Store the encrypted data next to the authentication tag
fs.writeFileSync('data.json', JSON.stringify({
    data: encrypted.data,
    dataAuthTag: encrypted.authTag
}));
```

**On Data Decryption**
```typescript
import { decryptData } from 'envelope-encryption';
var key = req.session.key;

// Get the user's information from wherever you store it
var user = JSON.parse(fs.readFileSync('user.json'));
// Get the encrypted data from wherever you store it
var encrypted = JSON.parse(fs.readFileSync('data.json'));

var decrypted = decryptData(
    encrypted.data,
    encrypted.dataAuthTag,
    user.wrappedDEK,
    user.dekIv,
    user.dekAuthTag,
    key
);
```