'use strict';

const aws = require('aws-sdk');
const unleash = require('unleash-server');
const kms = new aws.KMS({ region: process.env.AWS_REGION });

const decryptAndSet = async (name, secret) => {
    const secretBuffer = Buffer.from(secret, 'base64');
    const response = await kms.decrypt({ CiphertextBlob: secretBuffer }).promise();
    const decryptedSecret = response.Plaintext.toString();
    process.env[name] = decryptedSecret;
    return decryptedSecret;
};

async function batchDecrypt() {
    const promises = [
        decryptAndSet('DATABASE_PASSWORD', process.env.DATABASE_PASSWORD),
        decryptAndSet('INIT_CLIENT_API_TOKENS', process.env.INIT_CLIENT_API_TOKENS),
        decryptAndSet('INIT_FRONTEND_API_TOKENS', process.env.INIT_FRONTEND_API_TOKENS),
        decryptAndSet('AUTH0_API_CLIENT_SECRET', process.env.AUTH0_API_CLIENT_SECRET)
    ];

    try {
        await Promise.all(promises);
        console.log(process.env.DATABASE_PASSWORD);
        console.log(process.env.INIT_CLIENT_API_TOKENS);
        console.log(process.env.INIT_FRONTEND_API_TOKENS);
        console.log(process.env.AUTH0_API_CLIENT_SECRET);
    } catch (error) {
        console.error('Error awaiting batch decrypt: ', error);
    }
}

batchDecrypt().then(() => {
    let options = {};
    unleash.start(options);
});