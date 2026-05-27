/*global Ultraviolet*/

// Calculate base path dynamically
const _uv_base = (typeof importScripts === 'function' ? location.pathname.replace(/\/sw\.js$/, '/') : location.pathname.replace(/\/[^\/]*$/, '/'));

self.__uv$config = {
    prefix: _uv_base + 'uv/service/',
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: _uv_base + 'uv/uv.handler.js',
    bare: 'https://07bc515f-002a-4c2b-b629-0b79c3e12484-00-12paqk670eu4s.riker.replit.dev/bare/',
    client: _uv_base + 'uv/uv.client.js',
    bundle: _uv_base + 'uv/uv.bundle.js',
    config: _uv_base + 'uv/uv.config.js',
    sw: _uv_base + 'uv/uv.sw.js',
};
