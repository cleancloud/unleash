import { FromSchema } from 'json-schema-to-ts';
import { segmentSchema } from './segment-schema';

export const segmentsSchema = {
    $id: '#/components/schemas/segmentsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['segments'],
    properties: {
        version: {
            type: 'integer',
        },
        segments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/segmentSchema',
            },
            nullable: true,
        },
    },
    components: {
        schemas: {
            segmentSchema,
        },
    },
} as const;

export type SegmentsSchema = FromSchema<typeof segmentsSchema>;
