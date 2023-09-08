ARG NODE_VERSION=18-alpine

FROM node:$NODE_VERSION as builder

WORKDIR /unleash

COPY . /unleash

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

COPY --from=builder /unleash/docker/entrypoint.sh /unleash/entrypoint.sh

RUN chmod +x entrypoint.sh

RUN rm -rf /usr/local/lib/node_modules/npm/

EXPOSE 4242

USER node

ENTRYPOINT ["./entrypoint.sh"]

CMD ["ls"]
