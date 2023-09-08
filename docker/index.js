'use strict';

const aws = require('aws-sdk');
const unleash = require('unleash-server');

aws.config.update({ region: process.env.AWS_REGION });
console.log('AWS SDK version: ', aws.VERSION);

async function decryptData(data) {
    const params = {
        CiphertextBlob: Buffer.from(data, 'base64'),
        KeyId: process.env.AWS_KMS_ID
    };

    console.log("Input: ", data);

    try {
        const decrypted = await new aws.KMS().decrypt(params).promise();
        console.log("Decrypted: ", decrypted.Plaintext.toString());
        return decrypted.Plaintext.toString('utf-8');
    } catch (err) {
        console.error('Error decrypting data: ', err);
    }
}

process.env.DATABASE_PASSWORD = decryptData(process.env.DATABASE_PASSWORD);
process.env.INIT_CLIENT_API_TOKENS = decryptData(process.env.INIT_CLIENT_API_TOKENS);
process.env.INIT_FRONTEND_API_TOKENS = decryptData(process.env.INIT_FRONTEND_API_TOKENS);
process.env.AUTH0_API_CLIENT_SECRET = decryptData(process.env.AUTH0_API_CLIENT_SECRET);


let options = {};
unleash.start(options);
