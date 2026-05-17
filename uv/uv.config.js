/*global Ultraviolet*/
self.__uv$config = {
    prefix: '/web-emulator/uv/service/',
    bare: 'https://password-genotator-aresbandebocamb.replit.app/bare/',
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/web-emulator/uv/uv.handler.js',
    client: '/web-emulator/uv/uv.client.js',
    bundle: '/web-emulator/uv/uv.bundle.js',
    config: '/web-emulator/uv/uv.config.js',
    sw: '/web-emulator/uv/uv.sw.js',
};
