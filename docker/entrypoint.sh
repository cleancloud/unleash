#!/bin/bash -eu

function decrypt() {
    echo "$1" | base64 --decode > decrypt_blob
    aws kms decrypt --ciphertext-blob fileb://decrypt_blob --query Plaintext --output text | base64 --decode
}

export DATABASE_PASSWORD=$(decrypt "$DATABASE_PASSWORD")

export INIT_CLIENT_API_TOKENS=$(decrypt "$INIT_CLIENT_API_TOKENS")

export INIT_FRONTEND_API_TOKENS=$(decrypt "$INIT_FRONTEND_API_TOKENS")

export AUTH0_API_CLIENT_SECRET=$(decrypt "$AUTH0_API_CLIENT_SECRET")

node index.js