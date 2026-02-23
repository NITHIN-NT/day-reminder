#!/usr/bin/env node
const crypto = require('crypto');
const password = process.argv[2];

if (!password) {
    console.log('Usage: node hash.js <your-password>');
    process.exit(1);
}

const hash = crypto.createHash('sha256').update(password).digest('hex');
console.log('Your HASHPWD for .env.local:');
console.log(hash);
