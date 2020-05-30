/// <reference types="node" />
import { TcpSocket, UdpSocket } from "./net";
import { SmartHomeApiRequest, SmartHomeApiResponse, GenericSmartHomeApi } from "./smarthome-api";
export interface SmartHomeClientOptions {
    host: string;
    port?: number;
    proto?: 'tcp' | 'udp';
}
export declare class SmartHomeClient<Api extends GenericSmartHomeApi> {
    private _busy;
    private _socket?;
    private _host;
    private _port;
    private _proto;
    constructor({ host, port, proto }: SmartHomeClientOptions);
    _getSocket(): TcpSocket | UdpSocket;
    _prepareMsg(req: {}): Buffer;
    _unpackMsg(msg: Buffer): {};
    disconnect(): Promise<void>;
    connect(): Promise<void>;
    request<R extends SmartHomeApiRequest<Api>>(request: R): Promise<SmartHomeApiResponse<R, Api>>;
}
