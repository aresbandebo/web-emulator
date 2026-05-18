import { Client } from "./Client";
import type { ProxyTransport, RawHeaders, TransferrableResponse } from "@mercuryworkshop/proxy-transports";
export default class ClientV3 extends Client implements ProxyTransport {
    ws: URL;
    http: URL;
    ready: boolean;
    constructor(server: URL);
    init(): Promise<void>;
    connect(url: URL, protocols: string[], requestHeaders: RawHeaders | undefined, onopen: (protocol: string, extensions: string) => void, onmessage: (data: Blob | ArrayBuffer | string) => void, onclose: (code: number, reason: string) => void, onerror: (error: string) => void): [
        (data: Blob | ArrayBuffer | string) => void,
        (code: number, reason: string) => void
    ];
    request(remote: URL, method: string, body: BodyInit | null, headers: RawHeaders, signal: AbortSignal | undefined): Promise<TransferrableResponse>;
    private readBareResponse;
    createBareHeaders(remote: URL, bareHeaders: RawHeaders, forwardHeaders?: string[], passHeaders?: string[], passStatus?: number[]): Headers;
}
