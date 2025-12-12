import { test, describe } from 'node:test';
import assert from 'node:assert';
import { generateKeyPair } from '../../../../src/ciphers/crypto/keygen.js';
import { encryptChainlinkSecrets } from '../../../../src/connectors/ChainlinkSecretsConnector/utils/encryptChainlinkSecrets.js';

describe('ChainlinkSecretsConnector - encryptChainlinkSecrets (Integration)', () => {
    test('encrypts secrets with valid key', async () => {
        const { publicKey } = generateKeyPair();
        const publicKeyHex = Buffer.from(publicKey).toString('hex');
        
        const secrets = ['API_KEY=123456'];
        
        const result = await encryptChainlinkSecrets(secrets, publicKeyHex);
        
        assert.strictEqual(typeof result, 'string');
        assert.doesNotThrow(() => atob(result));
    });
});
