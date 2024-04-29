import { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema';
import { parametersSchema } from './parameters-schema';

export const featureStrategyBySegmentSchema = {
    $id: '#/components/schemas/featureStrategyBySegmentSchema',
    description:
        'A single activation strategy configuration schema for a feature',
    type: 'object',
    additionalProperties: false,
    required: ['name'],
    properties: {
        id: {
            type: 'string',
            description: 'A uuid for the feature strategy',
            example: '6b5157cb-343a-41e7-bfa3-7b4ec3044840',
        },
        title: {
            type: 'string',
            description: 'A descriptive title for the strategy',
            example: 'Gradual Rollout 25-Prod',
            nullable: true,
        },
        disabled: {
            type: 'boolean',
            description:
                'A toggle to disable the strategy. defaults to false. Disabled strategies are not evaluated or returned to the SDKs',
            example: false,
            nullable: true,
        },
        featureName: {
            type: 'string',
            example: 'best-feature',
            description: 'The name of the feature that contains this strategy.',
        },
        projectId: {
            type: 'string',
            description: 'The ID of the project that contains this feature.',
        },
        environment: {
            type: 'string',
            description: 'The ID of the environment where this strategy is in.',
        },
        strategyName: {
            type: 'string',
            description: 'The name of the strategy.',
        },
        sortOrder: {
            type: 'number',
            description: 'The order of the strategy in the list',
            example: 9999,
        },
        segments: {
            type: 'array',
            description: 'A list of segment ids attached to the strategy',
            example: [1, 2],
            items: {
                type: 'number',
            },
        },
        createdAt: {
            description: 'When this context field was created',
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-06-29T10:19:00.000Z',
        },
        constraints: {
            type: 'array',
            description: 'A list of the constraints attached to the strategy',
            items: {
                $ref: '#/components/schemas/constraintSchema',
            },
        },
        parameters: {
            $ref: '#/components/schemas/parametersSchema',
        },
    },
    components: {
        schemas: {
            constraintSchema,
            parametersSchema,
        },
    },
} as const;

export type FeatureStrategyBySegmentSchema = FromSchema<
    typeof featureStrategyBySegmentSchema
>;
