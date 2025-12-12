import { encrypt } from './crypto/encrypt.js';

/**
 * Encrypts an array of secrets using the public key.
 * @param {string[]} secrets - The secrets to encrypt.
 * @param {Uint8Array} publicKey - The public key to use for encryption.
 * @returns {Promise<string>} The encrypted secrets.
 */
export async function encryptSecrets(secrets, publicKey) {
    const rawEncryptedSecrets = [];
    for(const secret of secrets){
        const encryptedSecret = await encrypt(publicKey, secret);
        rawEncryptedSecrets.push(Buffer.from(encryptedSecret).toString('hex'));
    }

    const encryptedSecretsString = rawEncryptedSecrets.join('\n');
    return Buffer.from(encryptedSecretsString).toString('base64');
}   