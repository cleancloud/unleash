import { Response } from 'express';
import Controller from '../../controller';
import {
    IArchivedQuery,
    IProjectParam,
    IUnleashConfig,
    IUnleashServices,
    NONE,
    CREATE_PROJECT,
    UPDATE_PROJECT,
    DELETE_PROJECT,
    serializeDates,
} from '../../../types';
import ProjectFeaturesController from './project-features';
import EnvironmentsController from './environments';
import ProjectHealthReport from './health-report';
import ProjectService from '../../../services/project-service';
import VariantsController from './variants';
import {
    createResponseSchema,
    createRequestSchema,
    projectSchema,
    ProjectSchema,
    ProjectOverviewSchema,
    projectOverviewSchema,
    projectsSchema,
    ProjectsSchema,
} from '../../../openapi';
import {
    getStandardResponses,
    emptyResponse,
} from '../../../openapi/util/standard-responses';
import { OpenApiService, SettingService } from '../../../services';
import { IAuthRequest } from '../../unleash-types';
import { ProjectApiTokenController } from './api-token';
import ProjectArchiveController from './project-archive';
import { createKnexTransactionStarter } from '../../../db/transaction';
import { Db } from '../../../db/db';

export default class ProjectApi extends Controller {
    private projectService: ProjectService;

    private settingService: SettingService;

    private openApiService: OpenApiService;

    constructor(config: IUnleashConfig, services: IUnleashServices, db: Db) {
        super(config);
        this.projectService = services.projectService;
        this.openApiService = services.openApiService;
        this.settingService = services.settingService;

        this.route({
            path: '',
            method: 'get',
            handler: this.getProjects,
            permission: NONE,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjects',
                    summary: 'Get a list of all projects.',
                    description:
                        'This endpoint returns an list of all the projects in the Unleash instance.',
                    responses: {
                        200: createResponseSchema('projectsSchema'),
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:projectId',
            handler: this.getProjectOverview,
            permission: NONE,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjectOverview',
                    summary: 'Get an overview of a project.',
                    description:
                        'This endpoint returns an overview of the specified projects stats, project health, number of members, which environments are configured, and the features in the project.',
                    responses: {
                        200: createResponseSchema('projectOverviewSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            path: '/validate',
            method: 'post',
            handler: this.validateId,
            permission: CREATE_PROJECT,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'validateId',
                    requestBody: createRequestSchema('idSchema'),
                    responses: {
                        200: emptyResponse,
                    },
                }),
            ],
        });

        this.route({
            path: '',
            method: 'post',
            handler: this.createProject,
            permission: CREATE_PROJECT,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'createProject',
                    requestBody: createRequestSchema('projectSchema'),
                    responses: {
                        200: createResponseSchema('projectSchema'),
                        ...getStandardResponses(401, 403, 409),
                    },
                }),
            ],
        });

        this.route({
            path: '/:projectId',
            method: 'put',
            handler: this.updateProject,
            permission: UPDATE_PROJECT,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'updateProject',
                    requestBody: createRequestSchema('projectSchema'),
                    responses: {
                        200: createResponseSchema('projectSchema'),
                        ...getStandardResponses(400, 401, 403, 404, 413, 415),
                    },
                }),
            ],
        });

        this.route({
            path: '/:projectId',
            method: 'delete',
            handler: this.deleteProject,
            permission: DELETE_PROJECT,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'deleteProject',
                    responses: {
                        200: emptyResponse,
                    },
                }),
            ],
        });

        this.use(
            '/',
            new ProjectFeaturesController(
                config,
                services,
                createKnexTransactionStarter(db),
            ).router,
        );
        this.use('/', new EnvironmentsController(config, services).router);
        this.use('/', new ProjectHealthReport(config, services).router);
        this.use('/', new VariantsController(config, services).router);
        this.use('/', new ProjectApiTokenController(config, services).router);
        this.use('/', new ProjectArchiveController(config, services).router);
    }

    async getProjects(
        req: IAuthRequest,
        res: Response<ProjectsSchema>,
    ): Promise<void> {
        const { user } = req;
        const projects = await this.projectService.getProjects({}, user.id);

        this.openApiService.respondWithValidation(
            200,
            res,
            projectsSchema.$id,
            { version: 1, projects: serializeDates(projects) },
        );
    }

    async getProjectOverview(
        req: IAuthRequest<IProjectParam, unknown, unknown, IArchivedQuery>,
        res: Response<ProjectOverviewSchema>,
    ): Promise<void> {
        const { projectId } = req.params;
        const { archived } = req.query;
        const { user } = req;
        const overview = await this.projectService.getProjectOverview(
            projectId,
            archived,
            user.id,
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            projectOverviewSchema.$id,
            serializeDates(overview),
        );
    }

    async validateId(req: IAuthRequest, res: Response<void>): Promise<void> {
        const project = req.body;

        await this.projectService.validateId(project.id);
        res.status(200).end();
    }

    async createProject(
        req: IAuthRequest,
        res: Response<ProjectSchema>,
    ): Promise<void> {
        const project = req.body;

        const createdProject = await this.projectService.createProject(
            project,
            req.user,
        );
        this.openApiService.respondWithValidation(
            201,
            res,
            projectSchema.$id,
            serializeDates(createdProject),
        );
    }

    async updateProject(
        req: IAuthRequest,
        res: Response<ProjectSchema>,
    ): Promise<void> {
        const { projectId } = req.params;
        const project = req.body;

        let projectToUpdate = await this.projectService.getProject(projectId);
        projectToUpdate = { ...projectToUpdate, ...project };

        await this.projectService.updateProject(projectToUpdate, req.user);
        this.openApiService.respondWithValidation(
            200,
            res,
            projectSchema.$id,
            serializeDates(projectToUpdate),
        );
    }

    async deleteProject(req: IAuthRequest, res: Response): Promise<void> {
        const { projectId } = req.params;

        await this.projectService.deleteProject(projectId, req.user);
        res.status(200).end();
    }
}
