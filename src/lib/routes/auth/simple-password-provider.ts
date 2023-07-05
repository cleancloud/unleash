import { Response } from 'express';
import { OpenApiService } from '../../services/openapi-service';
import { Logger } from '../../logger';
import { IUnleashConfig } from '../../server-impl';
import { IUser } from '../../types/user';
import UserService from '../../services/user-service';
import { IUnleashServices } from '../../types';
import { NONE } from '../../types/permissions';
import Controller from '../controller';
import { IAuthRequest } from '../unleash-types';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { userSchema, UserSchema } from '../../openapi/spec/user-schema';
import { LoginSchema } from '../../openapi/spec/login-schema';
import { serializeDates } from '../../types/serialize-dates';

export class SimplePasswordProvider extends Controller {
    private logger: Logger;

    private openApiService: OpenApiService;

    private userService: UserService;

    constructor(
        config: IUnleashConfig,
        {
            userService,
            openApiService,
        }: Pick<IUnleashServices, 'userService' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/auth/password-provider.js');
        this.openApiService = openApiService;
        this.userService = userService;

        this.route({
            method: 'post',
            path: '/login',
            handler: this.login,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Auth'],
                    operationId: 'login',
                    requestBody: createRequestSchema('loginSchema'),
                    responses: {
                        200: createResponseSchema('userSchema'),
                    },
                }),
            ],
        });
    }

    async login(
        req: IAuthRequest<void, void, LoginSchema>,
        res: Response<UserSchema>,
    ): Promise<void> {
        const { username, password, token } = req.body;

        let user: IUser;
        if (token) {
            const { AuthenticationClient, ManagementClient } = require('auth0');

            const auth0Client = new AuthenticationClient({
                domain: process.env.AUTH0_DOMAIN,
                clientId: process.env.AUTH0_API_CLIENT_ID,
                clientSecret: process.env.AUTH0_API_CLIENT_SECRET,
            });

            const { access_token: accessToken } =
                await auth0Client.clientCredentialsGrant({
                    audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
                });
            const auth0Management = new ManagementClient({
                domain: process.env.AUTH0_DOMAIN,
                token: accessToken,
            });

            const authUser = await auth0Management.getUser({
                id: token,
                scope: 'openid',
            });
            user = await this.userService.loginUserAuth0(
                authUser.email,
                authUser.name,
                authUser.picture,
            );
        } else {
            user = await this.userService.loginUser(username, password);
        }

        req.session.user = user;
        this.openApiService.respondWithValidation(
            200,
            res,
            userSchema.$id,
            serializeDates(user),
        );
    }
}
