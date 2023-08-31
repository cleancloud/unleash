import { defineConfig, mergeConfig, loadEnv } from 'vite';
import {
    configDefaults,
    defineConfig as vitestDefineConfig,
} from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import envCompatible from 'vite-plugin-env-compatible';

const UNLEASH_API =
    loadEnv('', process.cwd(), '').UNLEASH_API || 'http://localhost:4242';
const UNLEASH_BASE_PATH =
    loadEnv('', process.cwd(), '').UNLEASH_BASE_PATH || '/';

if (!UNLEASH_BASE_PATH.startsWith('/') || !UNLEASH_BASE_PATH.endsWith('/')) {
    console.error('UNLEASH_BASE_PATH must both start and end with /');
    process.exit(1);
}

const vitestConfig = vitestDefineConfig({
    test: {
        globals: true,
        setupFiles: 'src/setupTests.ts',
        environment: 'jsdom',
        exclude: [...configDefaults.exclude, '**/cypress/**'],
    },
});

const envs = Object.keys(loadEnv('', process.cwd(), '')).reduce(
    (env, key) => ({ ...env, [key]: JSON.stringify(key) }),
    {} as Record<string, string>
);

export default mergeConfig(
    defineConfig({
        base: UNLEASH_BASE_PATH,
        define: {
            UNLEASH_API: envs.UNLEASH_API,
            UNLEASH_OPENAPI_URL: envs.UNLEASH_OPENAPI_URL,
            UNLEASH_BASE_PATH: envs.UNLEASH_BASE_PATH,
            REACT_APP_AUTH0_DOMAIN: envs.REACT_APP_AUTH0_DOMAIN,
            REACT_APP_AUTH0_CLIENT_ID: envs.REACT_APP_AUTH0_CLIENT_ID,
            DEV: envs.DEV,
            BASE_URL: envs.BASE_URL,
        },
        build: {
            outDir: 'build',
            assetsDir: 'static',
            modulePreload: false,
        },
        server: {
            open: true,
            host: true,
            port: 3000,
            proxy: {
                [`${UNLEASH_BASE_PATH}api`]: {
                    target: UNLEASH_API,
                    changeOrigin: true,
                },
                [`${UNLEASH_BASE_PATH}auth`]: {
                    target: UNLEASH_API,
                    changeOrigin: true,
                },
                [`${UNLEASH_BASE_PATH}logout`]: {
                    target: UNLEASH_API,
                    changeOrigin: true,
                },
                [`${UNLEASH_BASE_PATH}health`]: {
                    target: UNLEASH_API,
                    changeOrigin: true,
                },
                [`${UNLEASH_BASE_PATH}invite`]: {
                    target: UNLEASH_API,
                    changeOrigin: true,
                },
                [`${UNLEASH_BASE_PATH}edge`]: {
                    target: UNLEASH_API,
                    changeOrigin: true,
                },
            },
            fs: {
                allow: ['..'],
            },
        },
        plugins: [react(), tsconfigPaths(), svgr(), envCompatible()],
        esbuild: {
            logOverride: { 'this-is-undefined-in-esm': 'silent' },
        },
    }),
    vitestConfig
);
