import { headers } from 'utils/apiUtils';
import useAPI from '../useApi/useApi';

type PasswordLogin = (
    path: string,
    username: string,
    password: string
) => Promise<Response>;

type Auth0Login = (
    path: string,
    token: string
) => Promise<Response>;

type EmailLogin = (path: string, email: string) => Promise<Response>;

interface IUseAuthApiOutput {
    auth0Auth: Auth0Login;
    passwordAuth: PasswordLogin;
    emailAuth: EmailLogin;
    errors: Record<string, string>;
    loading: boolean;
}

export const useAuthApi = (): IUseAuthApiOutput => {
    const { makeRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const auth0Auth = (path: string, token: string) => {
        const req = {
            caller: () => {
                return fetch(path, {
                    headers,
                    method: 'POST',
                    body: JSON.stringify({ token }),
                });
            },
            id: 'auth0Auth',
        };

        return makeRequest(req.caller, req.id);
    };

    const passwordAuth = (path: string, username: string, password: string) => {
        const req = {
            caller: () => {
                return fetch(path, {
                    headers,
                    method: 'POST',
                    body: JSON.stringify({ username, password }),
                });
            },
            id: 'passwordAuth',
        };

        return makeRequest(req.caller, req.id);
    };

    const emailAuth = (path: string, email: string) => {
        const req = {
            caller: () => {
                return fetch(path, {
                    headers,
                    method: 'POST',
                    body: JSON.stringify({ email }),
                });
            },
            id: 'emailAuth',
        };

        return makeRequest(req.caller, req.id);
    };

    return {
        auth0Auth,
        passwordAuth,
        emailAuth,
        errors,
        loading,
    };
};
