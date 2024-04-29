import { FromSchema } from 'json-schema-to-ts';

export const loginSchema = {
    $id: '#/components/schemas/loginSchema',
    type: 'object',
    additionalProperties: false,
    required: [],
    properties: {
        username: {
            type: 'string',
        },
        password: {
            type: 'string',
        },
        token: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type LoginSchema = FromSchema<typeof loginSchema>;
