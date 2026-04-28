globalThis.process ??= {}; globalThis.process.env ??= {};
import { renderers } from './renderers.mjs';
import { createExports } from './_@astrojs-ssr-adapter.mjs';
import { manifest } from './manifest_BHJ8WL7I.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/analyze-image.astro.mjs');
const _page2 = () => import('./pages/api/tweets/_id_/like.astro.mjs');
const _page3 = () => import('./pages/api/tweets.astro.mjs');
const _page4 = () => import('./pages/photos.astro.mjs');
const _page5 = () => import('./pages/tweet/_id_.astro.mjs');
const _page6 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", _page0],
    ["src/pages/api/analyze-image.js", _page1],
    ["src/pages/api/tweets/[id]/like.js", _page2],
    ["src/pages/api/tweets.js", _page3],
    ["src/pages/photos.astro", _page4],
    ["src/pages/tweet/[id].astro", _page5],
    ["src/pages/index.astro", _page6]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _exports = createExports(_manifest);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
