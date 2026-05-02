globalThis.process ??= {}; globalThis.process.env ??= {};
import { r as renderers } from './chunks/_@astro-renderers_C7YAWX8s.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_D6HH_wum.mjs';
import { manifest } from './manifest_Bl76qSOj.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/analyze-image.astro.mjs');
const _page2 = () => import('./pages/api/tweets/_id_/like.astro.mjs');
const _page3 = () => import('./pages/api/tweets.astro.mjs');
const _page4 = () => import('./pages/archive.astro.mjs');
const _page5 = () => import('./pages/blog/_slug_.astro.mjs');
const _page6 = () => import('./pages/blog.astro.mjs');
const _page7 = () => import('./pages/bookmarks.astro.mjs');
const _page8 = () => import('./pages/design-preview.astro.mjs');
const _page9 = () => import('./pages/photos.astro.mjs');
const _page10 = () => import('./pages/profile.astro.mjs');
const _page11 = () => import('./pages/tweet/_id_.astro.mjs');
const _page12 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", _page0],
    ["src/pages/api/analyze-image.ts", _page1],
    ["src/pages/api/tweets/[id]/like.ts", _page2],
    ["src/pages/api/tweets.ts", _page3],
    ["src/pages/archive.astro", _page4],
    ["src/pages/blog/[slug].astro", _page5],
    ["src/pages/blog.astro", _page6],
    ["src/pages/bookmarks.astro", _page7],
    ["src/pages/design-preview.astro", _page8],
    ["src/pages/photos.astro", _page9],
    ["src/pages/profile.astro", _page10],
    ["src/pages/tweet/[id].astro", _page11],
    ["src/pages/index.astro", _page12]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = undefined;
const _exports = createExports(_manifest);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
