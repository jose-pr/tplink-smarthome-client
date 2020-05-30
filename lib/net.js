"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UdpSocket = exports.TcpSocket = void 0;
const dgram_1 = __importDefault(require("dgram"));
const net_1 = __importDefault(require("net"));
class TcpSocket {
    constructor({ host, port }) {
        this._connected = false;
        this._reading = false;
        this._socket = new net_1.default.Socket();
        this._host = host;
        this._port = port;
    }
    isConnected() {
        return this._connected;
    }
    open() {
        return new Promise((resolve, reject) => {
            this._socket.connect(this._port, this._host, () => {
                this._connected = true;
                resolve();
            });
        });
    }
    _onClose(reject) {
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
        return new Promise((resolve, reject) => this._socket.end(() => {
            this._socket.once("close", (e) => {
                this._connected = false;
                if (e)
                    reject(e);
                else
                    resolve();
            });
        }));
    }
    read(buffer, fill = (msg) => msg) {
        this._socket.ref();
        this._reading = true;
        return new Promise((resolve, reject) => {
            let received = 0;
            let done;
            this._socket.on('data', (msg) => {
                done = fill(msg, received);
                received += msg.length;
                if (done !== undefined) {
                    received = 0;
                    this._reading = false;
                    resolve(done);
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
exports.TcpSocket = TcpSocket;
exports.TcpSocket = TcpSocket;
class UdpSocket {
    constructor({ host, port, ipv }) {
        this._connected = false;
        this._reading = false;
        this._host = host;
        this._port = port;
        this._socket = dgram_1.default.createSocket(ipv !== 6 ? 'udp4' : 'udp6');
    }
    isConnected() {
        return this._connected;
    }
    open() {
        return new Promise((resolve, reject) => {
            this._socket.connect(this._port, this._host, () => {
                resolve();
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => this._socket.close(() => {
            this._socket.once("error", (e) => {
                if (e)
                    reject(e);
                else
                    resolve();
            });
        }));
    }
    read(send, fill = (msg) => msg) {
        return new Promise((resolve, reject) => {
            this._socket.once('message', (msg) => {
                resolve(msg);
            });
            this._socket.send(send, (err) => {
                if (err) {
                    reject(err);
                }
            });
        });
    }
}
exports.UdpSocket = UdpSocket;
