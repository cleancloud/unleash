import { Response } from 'express';
import Controller from '../controller';
import {
    ISegmentParam,
    IArchivedQuery,
    IUnleashConfig,
    IUnleashServices,
    NONE,
    CREATE_SEGMENT,
    UPDATE_SEGMENT,
    DELETE_SEGMENT,
    serializeDates,
} from '../../types';
import { ISegmentService } from '../../segments/segment-service-interface';
import { Logger } from '../../logger';
import { OpenApiService } from '../../services/openapi-service';
import { IAuthRequest } from '../unleash-types';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import {
    segmentSchema,
    SegmentSchema,
} from '../../openapi/spec/segment-schema';
// import {
//     segmentsSchema,
//     SegmentsSchema,
// } from '../../openapi/spec/segments-schema';
import {
    upsertSegmentSchema,
    UpsertSegmentSchema,
} from '../../openapi/spec/upsert-segment-schema';
import {
    featureStrategyBySegmentSchema,
    FeatureStrategyBySegmentSchema,
} from '../../openapi/spec/feature-strategy-by-segment-schema';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses';

export class SegmentsController extends Controller {
    private logger: Logger;

    private openApiService: OpenApiService;

    private service: ISegmentService;

    constructor(config: IUnleashConfig, services: IUnleashServices) {
        super(config);
        this.logger = config.getLogger('admin-api/segments-controller.ts');
        this.openApiService = services.openApiService;
        this.service = services.segmentService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getSegments,
            permission: NONE,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Segments'],
                    operationId: 'getSegments',
                    responses: {
                        200: createResponseSchema('segmentsSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:segmentId',
            handler: this.getSegment,
            permission: NONE,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Segments'],
                    operationId: 'getSegment',
                    responses: {
                        200: createResponseSchema('segmentSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:segmentId/strategies',
            handler: this.getSegmentStrategies,
            permission: NONE,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Segments'],
                    operationId: 'getSegmentStrategies',
                    responses: {
                        200: createResponseSchema(
                            'featureStrategyBySegmentSchema',
                        ),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/validate',
            handler: this.validateName,
            permission: CREATE_SEGMENT,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Segments'],
                    operationId: 'validateName',
                    requestBody: createRequestSchema('nameSchema'),
                    responses: {
                        200: emptyResponse,
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '',
            handler: this.createSegment,
            permission: CREATE_SEGMENT,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Segments'],
                    operationId: 'createSegment',
                    requestBody: createRequestSchema('upsertSegmentSchema'),
                    responses: {
                        200: createResponseSchema('upsertSegmentSchema'),
                        ...getStandardResponses(401, 403, 409),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: '/:segmentId',
            handler: this.updateSegment,
            permission: UPDATE_SEGMENT,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Segments'],
                    operationId: 'updateSegment',
                    requestBody: createRequestSchema('upsertSegmentSchema'),
                    responses: {
                        200: emptyResponse,
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/:segmentId',
            handler: this.deleteSegment,
            permission: DELETE_SEGMENT,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Segments'],
                    operationId: 'deleteSegment',
                    responses: {
                        200: emptyResponse,
                    },
                }),
            ],
        });
    }

    async getSegments(
        req: IAuthRequest,
        res: Response<SegmentSchema[]>,
    ): Promise<void> {
        const allSegments = await this.service.getAll();

        this.openApiService.respondWithValidation(
            200,
            res,
            segmentSchema.$id,
            serializeDates(allSegments),
        );
    }

    async getSegment(
        req: IAuthRequest,
        res: Response<SegmentSchema>,
    ): Promise<void> {
        const { segmentId } = req.params;
        const segment = await this.service.get(segmentId);

        this.openApiService.respondWithValidation(
            200,
            res,
            segmentSchema.$id,
            serializeDates(segment),
        );
    }

    async getSegmentStrategies(
        req: IAuthRequest<ISegmentParam, unknown, unknown, IArchivedQuery>,
        res: Response<FeatureStrategyBySegmentSchema>,
    ): Promise<void> {
        const { segmentId } = req.params;
        const segmentStrategies = await this.service.getStrategies(segmentId);

        this.openApiService.respondWithValidation(
            200,
            res,
            featureStrategyBySegmentSchema.$id,
            serializeDates(segmentStrategies),
        );
    }

    async validateName(req: IAuthRequest, res: Response<void>): Promise<void> {
        const segment = req.body;

        await this.service.validateName(segment.name);
        res.status(200).end();
    }

    async createSegment(
        req: IAuthRequest,
        res: Response<UpsertSegmentSchema>,
    ): Promise<void> {
        const segment = req.body;
        const createdSegment = await this.service.create(segment, req.user);
        this.openApiService.respondWithValidation(
            201,
            res,
            upsertSegmentSchema.$id,
            serializeDates(createdSegment),
        );
    }

    async updateSegment(
        req: IAuthRequest,
        res: Response<UpsertSegmentSchema>,
    ): Promise<void> {
        const segment = req.body;
        const { segmentId } = req.params;

        await this.service.update(segmentId, segment, req.user);
        res.status(200).end();
    }

    async deleteSegment(req: IAuthRequest, res: Response): Promise<void> {
        const { segmentId } = req.params;

        await this.service.delete(segmentId, req.user);
        res.status(200).end();
    }
}
