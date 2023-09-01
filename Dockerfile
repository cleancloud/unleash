ARG NODE_VERSION=18-alpine

FROM node:$NODE_VERSION as builder

WORKDIR /unleash

COPY . /unleash

ENV DATABASE_HOST=$DATABASE_HOST

ENV DATABASE_NAME=$DATABASE_NAME

ENV DATABASE_USERNAME=$DATABASE_USERNAME

ENV DATABASE_PASSWORD=$DATABASE_PASSWORD

ENV DATABASE_SSL=$DATABASE_SSL

ENV ENABLED_ENVIRONMENTS=$ENABLED_ENVIRONMENTS

ENV INIT_CLIENT_API_TOKENS=$INIT_CLIENT_API_TOKENS

ENV INIT_FRONTEND_API_TOKENS=$INIT_FRONTEND_API_TOKENS

ENV AUTH0_DOMAIN=$AUTH0_DOMAIN

ENV AUTH0_API_CLIENT_ID=$AUTH0_API_CLIENT_ID

ENV AUTH0_API_CLIENT_SECRET=$AUTH0_API_CLIENT_SECRET

ENV REACT_APP_AUTH0_DOMAIN=$REACT_APP_AUTH0_DOMAIN

ENV REACT_APP_AUTH0_CLIENT_ID=$REACT_APP_AUTH0_CLIENT_ID

RUN yarn config set network-timeout 300000

RUN yarn install --ignore-scripts && yarn copy-templates && yarn build:backend && yarn local:package && yarn --cwd ./frontend && yarn build:frontend

# frontend/build should already exist (it needs to be built in the local filesystem
RUN mkdir -p /unleash/build/frontend && mv /unleash/frontend/build /unleash/build/frontend/build

WORKDIR /unleash/docker

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
