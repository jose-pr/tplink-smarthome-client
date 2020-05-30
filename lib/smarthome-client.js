"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartHomeClient = void 0;
const net_1 = require("./net");
const autokey_cipher_1 = require("./autokey-cipher");
class SmartHomeClient {
    constructor({ host, port, proto }) {
        this._busy = false;
        this._host = host;
        this._port = port !== null && port !== void 0 ? port : 9999;
        this._proto = proto !== null && proto !== void 0 ? proto : 'tcp';
    }
    _getSocket() {
        const options = {
            port: this._port,
            host: this._host
        };
        return this._proto == "tcp" ? new net_1.TcpSocket(options) : new net_1.UdpSocket(options);
    }
    _prepareMsg(req) {
        const stringReq = JSON.stringify(req);
        const byteLength = Buffer.byteLength(stringReq);
        const msg = Buffer.allocUnsafe(byteLength + 4);
        msg.writeUInt32BE(byteLength);
        msg.fill(stringReq, 4);
        autokey_cipher_1.EncryptInPlace(msg.slice(4));
        return this._proto == "tcp" ? msg : msg.slice(4);
    }
    _unpackMsg(msg) {
        const content = this._proto == 'tcp' ? msg.slice(4) : msg;
        if (this._proto == 'tcp' && msg.slice(0, 4).readUInt32BE() !== content.length)
            throw new Error("Received a bad response");
        const stringResp = autokey_cipher_1.DencryptInPlace(content).toString('utf-8');
        return JSON.parse(stringResp);
    }
    async disconnect() {
        if (this._socket)
            await this._socket.close();
        this._socket = undefined;
    }
    async connect() {
        if (this._socket === undefined) {
            this._socket = this._getSocket();
            await this._socket.open();
        }
    }
    async request(request) {
        if (this._busy)
            throw new Error("Can only do one request at a time");
        if (this._socket === undefined)
            throw new Error("Client is disconnected");
        this._busy = true;
        let response;
        await this._socket.read(this._prepareMsg(request), this._proto == "tcp" ? (msg, offset) => {
            if (offset == 0) {
                response = Buffer.allocUnsafe(msg.slice(0, 4).readUInt32BE() + 4);
            }
            response.fill(msg, offset);
            return offset + msg.length >= response.length ? response : undefined;
        } : undefined);
        this._busy = false;
        return this._unpackMsg(response);
    }
}
exports.SmartHomeClient = SmartHomeClient;
