'use strict';

const aws = require('aws-sdk');
const unleash = require('unleash-server');

aws.config.update({ region: process.env.AWS_REGION });
const kms = new aws.KMS();

async function decrypt(data) {
    const params = {
        CiphertextBlob: Buffer.from(data, 'base64')
    };

    try {
        const decrypted = await kms.decrypt(params).promise();
        return decrypted.Plaintext.toString('utf-8');
    } catch (err) {
        console.error('Error decrypting data: ', err);
    }
}

async function decryptAll() {
    process.env.DATABASE_PASSWORD = await decrypt(process.env.DATABASE_PASSWORD);
    process.env.INIT_CLIENT_API_TOKENS = await decrypt(process.env.INIT_CLIENT_API_TOKENS);
    process.env.INIT_FRONTEND_API_TOKENS = await decrypt(process.env.INIT_FRONTEND_API_TOKENS);
    process.env.AUTH0_API_CLIENT_SECRET = await decrypt(process.env.AUTH0_API_CLIENT_SECRET);
}

decryptAll();
let options = {};
unleash.start(options);
