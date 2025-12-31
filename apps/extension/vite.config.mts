import { defineConfig, loadEnv } from 'vite';
import { resolve, join } from 'path';
import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets';
import manifest from './manifest.js';
import fs from 'fs';
import makeManifestPlugin from './utils/plugins/make-manifest-plugin';
import { watchPublicPlugin, watchRebuildPlugin } from '@extension/hmr';
import { watchOption } from '@extension/vite-config';

const rootDir = resolve(__dirname);
const srcDir = resolve(rootDir, 'src');
const outDir = resolve(rootDir, '../../dist');
const shimPath = resolve(__dirname, 'utils/node-shims.ts');
const publicDir = resolve(rootDir, 'public');
const localesSourceDir = resolve(rootDir, '../packages/i18n/locales');

const isDev = process.env.__DEV__ === 'true';
const isProduction = !isDev;

function copyRecursiveSync(src: string, dest: string) {
    if (!fs.existsSync(src)) return;
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(join(src, childItemName), join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

export default defineConfig(({ mode }) => {
    // Load ALL env variables (not just VITE_ prefixed) from both the extension and monorepo root
    const viteEnv = loadEnv(mode, resolve(rootDir, '..'), 'VITE_');
    const allEnv = loadEnv(mode, resolve(rootDir, '../..'), ''); // Load from monorepo root

    return {
        publicDir: publicDir,
        resolve: {
            alias: [
                { find: '@src', replacement: srcDir },
                { find: '@root', replacement: rootDir },
                { find: '@assets', replacement: resolve(srcDir, 'assets') },

                // === Polyfills ===
                { find: 'node-shim', replacement: shimPath },

                // Crypto (FIX for get-uri)
                { find: 'node:crypto', replacement: shimPath },
                { find: 'crypto', replacement: shimPath },

                // FS Promises (FIX for [vite:load-fallback] error)
                // We point these directly to the file to prevent directory lookups
                { find: 'node:fs/promises', replacement: shimPath },
                { find: 'fs/promises', replacement: shimPath },

                // Other Modules
                { find: 'node:fs', replacement: shimPath },
                { find: 'fs', replacement: shimPath },
                { find: 'node:url', replacement: shimPath },
                { find: 'url', replacement: shimPath },
                { find: 'node:http', replacement: shimPath },
                { find: 'http', replacement: shimPath },
                { find: 'node:https', replacement: shimPath },
                { find: 'https', replacement: shimPath },
                { find: 'node:stream', replacement: shimPath },
                { find: 'stream', replacement: shimPath },
                { find: 'node:zlib', replacement: shimPath },
                { find: 'zlib', replacement: shimPath },
                { find: 'node:path', replacement: shimPath },
                { find: 'path', replacement: shimPath },
                { find: 'node:os', replacement: shimPath },
                { find: 'os', replacement: shimPath },
                { find: 'node:child_process', replacement: shimPath },
                { find: 'child_process', replacement: shimPath },
                { find: 'node:readline', replacement: shimPath },
                { find: 'node:events', replacement: shimPath },
                { find: 'events', replacement: shimPath },
                { find: 'node:assert', replacement: shimPath },
                { find: 'assert', replacement: shimPath },
                { find: 'node:util', replacement: shimPath },
                { find: 'util', replacement: shimPath },
                { find: 'node:buffer', replacement: shimPath },
                { find: 'buffer', replacement: shimPath },
                { find: 'node:process', replacement: shimPath },
                { find: 'process', replacement: shimPath },
                { find: 'node:tty', replacement: shimPath },
                { find: 'tty', replacement: shimPath },
                { find: 'node:net', replacement: shimPath },
                { find: 'net', replacement: shimPath },
                { find: 'node:tls', replacement: shimPath },
                { find: 'tls', replacement: shimPath },
                { find: 'node:vm', replacement: shimPath },
                { find: 'vm', replacement: shimPath },
                { find: 'node:dgram', replacement: shimPath },
                { find: 'dgram', replacement: shimPath },
            ],
        },
        plugins: [
            libAssetsPlugin({
                outputPath: 'assets',
            }) as any,
            watchPublicPlugin(),
            makeManifestPlugin({ outDir }),
            isDev && watchRebuildPlugin({ reload: true, id: 'chrome-extension-hmr' }),
            {
                name: 'copy-locales',
                writeBundle() {
                    const dest = resolve(outDir, '_locales');
                    if (fs.existsSync(localesSourceDir)) {
                        copyRecursiveSync(localesSourceDir, dest);
                    }
                }
            },
        ],
        build: {
            lib: {
                entry: resolve(srcDir, 'background/index.ts'),
                name: 'background',
                fileName: 'background',
                formats: ['iife'],
            },
            outDir: outDir,
            copyPublicDir: true,
            emptyOutDir: false,
            sourcemap: isDev,
            minify: isProduction,
            reportCompressedSize: isProduction,
            watch: isDev ? watchOption : null,
            rollupOptions: {
                output: {
                    entryFileNames: 'background.iife.js',
                    extend: true,
                },
                external: ['chrome'],
            },
        },
        define: {
            'import.meta.env.VITE_POSTHOG_API_KEY': JSON.stringify(viteEnv.VITE_POSTHOG_API_KEY || process.env.VITE_POSTHOG_API_KEY || ''),
            // Inject API keys for the extension initialization
            'process.env.GEMINI_API_KEY': JSON.stringify(allEnv.GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''),
            'process.env.OPENAI_API_KEY': JSON.stringify(allEnv.OPENAI_API_KEY || process.env.OPENAI_API_KEY || ''),
        }
    };
});