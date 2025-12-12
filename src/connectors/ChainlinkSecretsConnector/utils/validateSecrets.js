/**
 * Validates that secrets are in the correct format for Chainlink Functions.
 * Each secret should be in the format "KEY=value"
 * @param {string[]} secrets - Array of secret strings
 * @returns {boolean} True if all secrets are valid
 */
export const validateSecrets = (secrets) => {
    if (!Array.isArray(secrets)) {
        throw new Error('Secrets must be an array');
    }

    if (secrets.length === 0) {
        throw new Error('At least one secret is required');
    }

    for (let i = 0; i < secrets.length; i++) {
        const secret = secrets[i];
        if (typeof secret !== 'string') {
            throw new Error(`Secret at index ${i} must be a string`);
        }

        // Check if secret contains an equals sign (KEY=value format)
        if (!secret.includes('=')) {
            throw new Error(`Secret at index ${i} must be in format "KEY=value"`);
        }

        // Check for empty key or value
        const [key, ...valueParts] = secret.split('=');
        const value = valueParts.join('=');

        if (!key.trim()) {
            throw new Error(`Secret at index ${i} has an empty key`);
        }

        if (!value.trim()) {
            throw new Error(`Secret at index ${i} has an empty value`);
        }
    }

    return true;
}

export default validateSecrets;


