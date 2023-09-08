'use strict';

const aws = require('aws-sdk');
const unleash = require('unleash-server');
const kms = new aws.KMS({ region: process.env.AWS_REGION });

const decrypt = async (secret) => {
    const secretBuffer = Buffer.from(secret, 'base64');
    const response = await kms.decrypt({ CiphertextBlob: secretBuffer }).promise();
    return response.Plaintext.toString()
};

process.env.DATABASE_PASSWORD = await decrypt(process.env.DATABASE_PASSWORD);
process.env.INIT_CLIENT_API_TOKENS = await decrypt(process.env.INIT_CLIENT_API_TOKENS);
process.env.INIT_FRONTEND_API_TOKENS = await decrypt(process.env.INIT_FRONTEND_API_TOKENS);
process.env.AUTH0_API_CLIENT_SECRET = await decrypt(process.env.AUTH0_API_CLIENT_SECRET);

let options = {};
unleash.start(options);
