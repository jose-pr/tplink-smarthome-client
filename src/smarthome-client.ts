import { IpConnectionOptions, IpSocket, TcpSocket, UdpSocket } from "./net";
import { EncryptInPlace, DencryptInPlace } from "./autokey-cipher";
import { SmartHomeApiRequest, SmartHomeApi, SmartHomeApiResponse, SmartHomeApiMethod, GenericSmartHomeApi } from "./smarthome-api";

export interface SmartHomeClientOptions {
    host: string
    port?: number
    proto?: 'tcp' | 'udp'
}

export class SmartHomeClient<Api extends GenericSmartHomeApi> {
    private _busy: boolean = false
    private _socket?: IpSocket
    private _host: string
    private _port: number
    private _proto: 'tcp' | 'udp'

    constructor({ host, port, proto }: SmartHomeClientOptions) {
        this._host = host;
        this._port = port ?? 9999;
        this._proto = proto ?? 'tcp';
    }
    _getSocket() {
        const options = {
            port: this._port,
            host: this._host
        }
        return this._proto == "tcp" ? new TcpSocket(options) : new UdpSocket(options);
    }
    _prepareMsg(req: {}) {
        const stringReq = JSON.stringify(req);
        const byteLength = Buffer.byteLength(stringReq);
        const msg = Buffer.allocUnsafe(byteLength + 4);
        msg.writeUInt32BE(byteLength);
        msg.fill(stringReq, 4);
        EncryptInPlace(msg.slice(4));
        return this._proto == "tcp" ? msg : msg.slice(4);
    }
    _unpackMsg<R>(msg: Buffer) {
        const content = this._proto == 'tcp' ? msg.slice(4) : msg;
        if (this._proto == 'tcp' && msg.slice(0, 4).readUInt32BE() !== content.length)
            throw new Error("Received a bad response");
        const stringResp = DencryptInPlace(content).toString('utf-8');
        return JSON.parse(stringResp) as SmartHomeApiResponse<R, Api>
    }
    async disconnect() {
        if (this._socket) await this._socket.close();
        this._busy = false;
        this._socket = undefined;
    }
    async connect() {
        if (this._socket === undefined) {
            this._socket = this._getSocket();
            await this._socket.open();
        }
    }
    _fill(msg: Buffer, offset: number, data: Buffer): [Buffer, boolean] {
        if (this._proto == 'udp') {
            return [msg, true]
        }
        if (offset == 0) {
            data = Buffer.allocUnsafe(msg.slice(0, 4).readUInt32BE() + 4);
        }
        data.fill(msg, offset);
        return [data, offset + msg.length >= data.length ? true : false];
    }
    async request<R extends SmartHomeApiRequest<Api>>(request: R): Promise<SmartHomeApiResponse<R, Api>> {
        if (this._busy) throw new Error("Can only do one request at a time")
        if (this._socket === undefined) throw new Error("Client is disconnected")
        this._busy = true;
        const response: Buffer = await this._socket.read(this._prepareMsg(request), this._fill.bind(this)).catch(async (e) => {
            await this.disconnect();
            throw e;
        });
        this._busy = false;
        return this._unpackMsg<R>(response);
    }
}