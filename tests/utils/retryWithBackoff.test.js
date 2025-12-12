import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { retryWithBackoff } from '../../src/utils/retryWithBackoff.js';

describe('Utils - retryWithBackoff', () => {
    test('succeeds immediately if function does not throw', async () => {
        const fn = async () => 'success';
        const result = await retryWithBackoff(fn);
        assert.strictEqual(result, 'success');
    });

    test('retries on failure and eventually succeeds', async () => {
        let attempts = 0;
        const fn = async () => {
            attempts++;
            if (attempts < 2) {
                throw new Error('Fail');
            }
            return 'success';
        };

        const result = await retryWithBackoff(fn, 3, 10);
        assert.strictEqual(result, 'success');
        assert.strictEqual(attempts, 2);
    });

    test('throws after max retries', async () => {
        let attempts = 0;
        const fn = async () => {
            attempts++;
            throw new Error('Fail');
        };

        try {
            await retryWithBackoff(fn, 2, 10);
            assert.fail('Should have thrown');
        } catch (error) {
            assert.strictEqual(error.message, 'Fail');
            assert.strictEqual(attempts, 3);
        }
    });
});

