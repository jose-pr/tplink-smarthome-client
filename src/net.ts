import udp from "dgram"
import net from "net"

export interface IpConnectionOptions {
    host: string
    port: number
    ipv?: 6 | 4
}

export interface IpSocket {
    isConnected(): boolean
    open(): Promise<void>
    close(): Promise<void>
    read(input: Buffer, fill?: (msg: Buffer, offset: number, data: Buffer) => [Buffer, boolean]): Promise<Buffer>
}
export class TcpSocket implements IpSocket {
    private _connected: boolean = false
    private _reading: boolean = false
    private _socket: net.Socket
    private _host: string
    private _port: number

    constructor({ host, port }: IpConnectionOptions) {
        this._socket = new net.Socket();
        this._host = host
        this._port = port
    }
    isConnected() {
        return this._connected;
    }
    open() {
        return new Promise<void>((resolve, reject) => {
            this._socket.connect(this._port, this._host, () => {
                this._connected = true;
                resolve();
            });
        });
    }
    _onClose(reject: (err: any) => void) {
        this._socket.once('error', (err) => {
            if (err) {
                reject(err);
            }
        });
        this._socket.once('close', (err) => {
            console.log("Connection Closed", err);
            this._socket.destroy();
            if (err)
                reject(new Error('Socket closed duee to transmission error'));
            else if (this._reading) {
                reject(new Error('Socket closed without receiving any data'));
            }
        });
    }
    close() {
        return new Promise<void>((resolve, reject) => this._socket.end(() => {
            this._socket.once("close", (e) => {
                this._connected = false;
                if (e)
                    reject(e);
                else
                    resolve();
            });
        }));
    }
    read(buffer: Buffer, fill: (msg: Buffer, offset: number, data: Buffer) => [Buffer, boolean] = (data) => [data, true]) {
        this._socket.ref();
        this._reading = true;
        return new Promise<Buffer>((resolve, reject) => {
            let received = 0;
            let done;
            let data: Buffer;
            this._socket.on('data', (msg) => {
                [data, done] = fill(msg, received, data);
                received += msg.length;
                if (done) {
                    received = 0;
                    this._reading = false;
                    this._socket.removeAllListeners();
                    resolve(data);
                }
            });
            this._onClose(reject);
            this._socket.write(buffer, (err) => {
                if (err !== undefined) {
                    reject(err);
                }
            });
        });
    }
}
export class UdpSocket implements IpSocket {
    private _connected: boolean = false
    private _reading: boolean = false
    private _socket: udp.Socket
    private _host: string
    private _port: number
    constructor({ host, port, ipv }: IpConnectionOptions) {
        this._host = host
        this._port = port
        this._socket = udp.createSocket(ipv !== 6 ? 'udp4' : 'udp6');
    }
    isConnected() {
        return this._connected;
    }
    open() {
        return new Promise<void>((resolve, reject) => {
            this._socket.connect(this._port, this._host, () => {
                resolve();
            });
        });
    }
    close() {
        return new Promise<void>((resolve, reject) => this._socket.close(() => {
            this._socket.once("error", (e) => {
                if (e)
                    reject(e);
                else
                    resolve();
            });
        }));
    }
    read(send: Buffer, fill: (msg: Buffer, offset: number, data: Buffer) => [Buffer, boolean] = (msg) => [msg, true]) {
        return new Promise<Buffer>((resolve, reject) => {
            let received = 0;
            let done;
            let data: Buffer;
            this._socket.on('message', (msg) => {
                [data, done] = fill(msg, received, data);
                received += msg.length;
                if (done) {
                    received = 0;
                    this._reading = false;
                    this._socket.removeAllListeners();
                    resolve(data);
                }
            });
            this._socket.send(send, (err) => {
                if (err) {
                    reject(err);
                }
            });
        });
    }
}