import { encrypt } from '../../../ciphers/crypto/encrypt.js';

/**
 * Encrypts secrets for Chainlink Functions using the DON's public key.
 * The DON public key should be provided as a hex string.
 * @param {string[]} secrets - Array of secret strings in format "KEY=value"
 * @param {string} donPublicKeyHex - DON public key as hex string
 * @returns {Promise<string>} Base64 encoded encrypted secrets
 */
export async function encryptChainlinkSecrets(secrets, donPublicKeyHex) {
    try {
        // Convert hex string to Uint8Array
        const donPublicKey = Buffer.from(donPublicKeyHex.replace('0x', ''), 'hex');

        const encryptedSecrets = [];
        for (const secret of secrets) {
            const encryptedSecret = await encrypt(donPublicKey, secret);
            encryptedSecrets.push(Buffer.from(encryptedSecret).toString('hex'));
        }

        // Join encrypted secrets with newlines and encode as base64
        const encryptedSecretsString = encryptedSecrets.join('\n');
        return Buffer.from(encryptedSecretsString).toString('base64');
    } catch (error) {
        console.error('Error encrypting secrets for Chainlink Functions:', error);
        throw error;
    }
}

export default encryptChainlinkSecrets;


