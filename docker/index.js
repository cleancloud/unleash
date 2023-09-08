'use strict';

const aws = require('aws-sdk');
aws.config.update({ region: process.env.AWS_REGION });
console.log('AWS SDK version: ', aws.VERSION);

const kms = new aws.KMS();

async function decrypt(data) {
    const params = {
        CiphertextBlob: Buffer.from(data, 'base64'),
        KeyId: process.env.AWS_KMS_ID
    };

    try {
        const decrypted = await kms.decrypt(params).promise();
        return decrypted.Plaintext.toString('utf-8');
    } catch (err) {
        console.error('Error decrypting data: ', err);
    }
}

process.env.DATABASE_PASSWORD = decrypt(process.env.DATABASE_PASSWORD);
process.env.INIT_CLIENT_API_TOKENS = decrypt(process.env.INIT_CLIENT_API_TOKENS);
process.env.INIT_FRONTEND_API_TOKENS = decrypt(process.env.INIT_FRONTEND_API_TOKENS);
process.env.AUTH0_API_CLIENT_SECRET = decrypt(process.env.AUTH0_API_CLIENT_SECRET);

const unleash = require('unleash-server');
let options = {};
unleash.start(options);
