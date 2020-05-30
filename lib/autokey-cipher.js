"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DencryptInPlace = exports.EncryptInPlace = exports.Encrypt = void 0;
const IV = 171;
function Encrypt(plaintext) {
    let key = IV;
    const ciphertext = Buffer.allocUnsafe(plaintext.length);
    for (let i = 0; i < plaintext.length; i++) {
        key = ciphertext[i] = key ^ plaintext[i];
    }
    return ciphertext;
}
exports.Encrypt = Encrypt;
function EncryptInPlace(plaintext) {
    let key = IV;
    for (let i = 0; i < plaintext.length; i++) {
        key = plaintext[i] = key ^ plaintext[i];
    }
    return plaintext;
}
exports.EncryptInPlace = EncryptInPlace;
function DencryptInPlace(ciphertext) {
    let key = IV;
    let nextKey;
    for (let i = 0; i < ciphertext.length; i++) {
        nextKey = ciphertext[i];
        ciphertext[i] = key ^ ciphertext[i];
        key = nextKey;
    }
    return ciphertext;
}
exports.DencryptInPlace = DencryptInPlace;
function Decrypt(ciphertext) {
    const plaintext = Buffer.allocUnsafe(ciphertext.length);
    let key = IV;
    for (let i = 0; i < ciphertext.length; i++) {
        plaintext[i] = key ^ ciphertext[i];
        key = ciphertext[i];
    }
    return plaintext;
}
