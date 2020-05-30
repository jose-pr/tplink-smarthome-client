/// <reference types="node" />
export interface IpConnectionOptions {
    host: string;
    port: number;
    ipv?: 6 | 4;
}
export interface IpSocket {
    isConnected(): boolean;
    open(): Promise<void>;
    close(): Promise<void>;
    read(input: Buffer, fill?: (msg: Buffer, offset: number, data: Buffer) => [Buffer, boolean]): Promise<Buffer>;
}
export declare class TcpSocket implements IpSocket {
    private _connected;
    private _reading;
    private _socket;
    private _host;
    private _port;
    constructor({ host, port }: IpConnectionOptions);
    isConnected(): boolean;
    open(): Promise<void>;
    _onClose(reject: (err: any) => void): void;
    close(): Promise<void>;
    read(buffer: Buffer, fill?: (msg: Buffer, offset: number, data: Buffer) => [Buffer, boolean]): Promise<Buffer>;
}
export declare class UdpSocket implements IpSocket {
    private _connected;
    private _reading;
    private _socket;
    private _host;
    private _port;
    constructor({ host, port, ipv }: IpConnectionOptions);
    isConnected(): boolean;
    open(): Promise<void>;
    close(): Promise<void>;
    read(send: Buffer, fill?: (msg: Buffer, offset: number, data: Buffer) => [Buffer, boolean]): Promise<Buffer>;
}
