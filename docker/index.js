'use strict';

const aws = require('aws-sdk');
const util = require('util');
console.log('AWS SDK version: ', aws.VERSION);

aws.config.update({ region: process.env.AWS_REGION });

const kms = new aws.KMS();
const decryptAsync = util.promisify(kms.decrypt.bind(kms));

async function decrypt(data) {
    const params = {
        CiphertextBlob: Buffer.from(data, 'base64'),
        KeyId: process.env.AWS_KMS_ID
    };

    try {
        const decrypted = await decryptAsync(params);
        console.log("Decrypted: ", decrypted);
        return decrypted.Plaintext.toString('utf-8');
    } catch (err) {
        console.log('Error decrypting data: ', err);
    }
}

console.log("PASSWORD: ", process.env.DATABASE_PASSWORD);

process.env.DATABASE_PASSWORD = decrypt(process.env.DATABASE_PASSWORD);
process.env.INIT_CLIENT_API_TOKENS = decrypt(process.env.INIT_CLIENT_API_TOKENS);
process.env.INIT_FRONTEND_API_TOKENS = decrypt(process.env.INIT_FRONTEND_API_TOKENS);
process.env.AUTH0_API_CLIENT_SECRET = decrypt(process.env.AUTH0_API_CLIENT_SECRET);

console.log("PASSWORD: ", process.env.DATABASE_PASSWORD);

const unleash = require('unleash-server');
let options = {};
unleash.start(options);
