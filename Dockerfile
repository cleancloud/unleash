ARG NODE_VERSION=18-alpine

FROM node:$NODE_VERSION as builder

WORKDIR /unleash

COPY . /unleash

RUN yarn config set network-timeout 300000

RUN yarn install --ignore-scripts && yarn copy-templates && yarn build:backend && yarn local:package && yarn --cwd ./frontend && yarn build:frontend

# frontend/build should already exist (it needs to be built in the local filesystem
RUN mkdir -p /unleash/build/frontend && mv /unleash/frontend/build /unleash/build/frontend/build

WORKDIR /unleash/docker

RUN cat <<EOL >> config.json
{
    "DATABASE_HOST": "$DATABASE_HOST",
    "DATABASE_NAME": "$DATABASE_NAME",
    "DATABASE_USERNAME": "$DATABASE_USERNAME",
    "DATABASE_PASSWORD": "$DATABASE_PASSWORD",
    "DATABASE_SSL": "$DATABASE_SSL",
    "ENABLED_ENVIRONMENTS": "$ENABLED_ENVIRONMENTS",
    "INIT_CLIENT_API_TOKENS": "$INIT_CLIENT_API_TOKENS",
    "INIT_FRONTEND_API_TOKENS": "$INIT_FRONTEND_API_TOKENS",
    "AUTH0_DOMAIN": "$AUTH0_DOMAIN",
    "AUTH0_API_CLIENT_ID": "$AUTH0_API_CLIENT_ID",
    "AUTH0_API_CLIENT_SECRET": "$AUTH0_API_CLIENT_SECRET",
    "REACT_APP_AUTH0_DOMAIN": "$REACT_APP_AUTH0_DOMAIN",
    "REACT_APP_AUTH0_CLIENT_ID": "$REACT_APP_AUTH0_CLIENT_ID"
}
EOL

RUN yarn install --frozen-lockfile --production=true

FROM node:$NODE_VERSION

ENV NODE_ENV production

ENV TZ UTC

WORKDIR /unleash

COPY --from=builder /unleash/docker /unleash

RUN rm -rf /usr/local/lib/node_modules/npm/

EXPOSE 4242

USER node

CMD ["node", "index.js"]
