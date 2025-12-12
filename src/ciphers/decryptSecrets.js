import { decrypt } from './crypto/decrypt.js';
/**
 * Decrypts an array of secrets using the private key.
 * @param {string} encryptedSecrets - The encrypted secrets.
 * @param {Uint8Array} privateKey - The private key to use for decryption.
 * @returns {Promise<string>} The decrypted secrets.
 */
export async function decryptSecrets(encryptedSecrets, privateKey) {
    const decryptedSecrets = {};

    const decodedEncryptedSecrets = Buffer.from(encryptedSecrets, 'base64').toString('utf-8');
    const encryptedSecretsArray = decodedEncryptedSecrets.split('\n');

    for (const secret of encryptedSecretsArray) {
        const decryptedSecret = await decrypt(Buffer.from(secret, 'hex'), privateKey);
        const keyName = decryptedSecret.split('=')[0];
        const keyValue = decryptedSecret.split('=')[1];
        decryptedSecrets[keyName] = keyValue;
    }
    return decryptedSecrets;
}