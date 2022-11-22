# Envelope Encryption

Simple native implementation of envelope encryption to increase ease of use for encrypting user data.


## Express example authentication:


**On Sign-Up**
```typescript
var userPassword = 'password';

// Initialize the library with a password
var encryption = initialize(userPassword);

// Important: 
// Store these variables wherever you store your user's information
// They are required to encrypt and decrypt data
fs.writeFileSync('data.json', JSON.stringify({
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
var userPassword = 'password';

// Get the user's information from wherever you store it
var user = JSON.parse(fs.readFileSync('data.json'));

// Generate the key from the password
var key = generateKey(userPassword, user.kekSalt);

// Add the key to the user's session
req.session.key = key;
```

**On Data Encryption**
```typescript
var data = 'This is some data';

var key = req.session.key;

// Get the user's information from wherever you store it
var user = JSON.parse(fs.readFileSync('data.json'));

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
var key = req.session.key;

// Get the user's information from wherever you store it
var user = JSON.parse(fs.readFileSync('data.json'));
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