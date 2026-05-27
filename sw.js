/*global UVServiceWorker,__uv$config*/
/*
 * Stock service worker script.
 * Users can provide their own sw.js if they need to extend the functionality of the service worker.
 * Ideally, this will be registered under the scope in uv.config.js so it will not need to be modified.
 * However, if a user changes the location of uv.bundle.js/uv.config.js or sw.js is not relative to them, they will need to modify this script locally.
 */
const basePath = location.pathname.replace(/\/sw\.js$/, '/');
importScripts(basePath + 'uv/bare-mux/worker.js');
importScripts(basePath + 'uv/uv.bundle.js');
importScripts(basePath + 'uv/uv.config.js');
importScripts(basePath + 'uv/uv.sw.js');

const uv = new UVServiceWorker();

async function handleRequest(event) {
    if (uv.route(event)) {
        let response = await uv.fetch(event);
        
        // Inject headers to allow SharedArrayBuffer (Fixes gx.games and high-perf engines)
        let newHeaders = new Headers(response.headers);
        newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
        newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
        
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    }
    
    return await fetch(event.request)
}

self.addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event));
});