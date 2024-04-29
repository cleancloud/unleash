/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */

/**
 * The [API token](https://docs.getunleash.io/reference/api-tokens-and-client-keys#api-tokens)'s **type**. Unleash supports three different types of API tokens ([ADMIN](https://docs.getunleash.io/reference/api-tokens-and-client-keys#admin-tokens), [CLIENT](https://docs.getunleash.io/reference/api-tokens-and-client-keys#client-tokens), [FRONTEND](https://docs.getunleash.io/reference/api-tokens-and-client-keys#front-end-tokens)). They all have varying access, so when validating a token it's important to know what kind you're dealing with
 */
export type EdgeTokenSchemaType =
    typeof EdgeTokenSchemaType[keyof typeof EdgeTokenSchemaType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const EdgeTokenSchemaType = {
    client: 'client',
    admin: 'admin',
    frontend: 'frontend',
} as const;
