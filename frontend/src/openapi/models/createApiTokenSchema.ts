/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { CreateApiTokenSchemaAnyOf } from './createApiTokenSchemaAnyOf';
import type { CreateApiTokenSchemaAnyOfTwo } from './createApiTokenSchemaAnyOfTwo';

export type CreateApiTokenSchema =
    | (CreateApiTokenSchemaAnyOf & {
          secret?: string;
          /** One of client, admin, frontend */
          type: string;
          environment?: string;
          project?: string;
          projects?: string[];
          expiresAt?: string | null;
      })
    | (CreateApiTokenSchemaAnyOfTwo & {
          secret?: string;
          /** One of client, admin, frontend */
          type: string;
          environment?: string;
          project?: string;
          projects?: string[];
          expiresAt?: string | null;
      });
