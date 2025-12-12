import { secp256k1 } from '@noble/curves/secp256k1.js';

export function generateKeyPair() {
    const { secretKey, publicKey } = secp256k1.keygen();

    return {
        privateKey: secretKey,
        publicKey
    };
}
