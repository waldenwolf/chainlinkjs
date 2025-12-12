import { ethers } from 'ethers';

export function derivePublicKeyFromPrivateKey(privateKey) {
    const publicKey = new ethers.Wallet(privateKey).signingKey.publicKey;
    return new Uint8Array(Buffer.from(publicKey.slice(2), 'hex'));
}

export default derivePublicKeyFromPrivateKey;