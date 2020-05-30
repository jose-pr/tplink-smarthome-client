
const IV = 171;
export function Encrypt(plaintext:Buffer) {
    let key = IV;
    const ciphertext = Buffer.allocUnsafe(plaintext.length);
    for (let i = 0; i < plaintext.length; i++) {
        key = ciphertext[i] = key ^ plaintext[i];
    }
    return ciphertext;
}
export function EncryptInPlace(plaintext:Buffer) {
    let key = IV;
    for (let i = 0; i < plaintext.length; i++) {
        key = plaintext[i] = key ^ plaintext[i];
    }
    return plaintext;
}
export function DencryptInPlace(ciphertext:Buffer) {
    let key = IV;
    let nextKey;
    for (let i = 0; i < ciphertext.length; i++) {
        nextKey = ciphertext[i];
        ciphertext[i] = key ^ ciphertext[i];
        key = nextKey;
    }
    return ciphertext;
}
function Decrypt(ciphertext:Buffer) {
    const plaintext = Buffer.allocUnsafe(ciphertext.length);
    let key = IV;
    for (let i = 0; i < ciphertext.length; i++) {
        plaintext[i] = key ^ ciphertext[i];
        key = ciphertext[i];
    }
    return plaintext;
}