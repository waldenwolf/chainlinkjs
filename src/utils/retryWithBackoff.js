import { sleep } from './sleep.js';

/**
 * Retry utility with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} initialDelay - Initial delay in ms
 * @returns {Promise} Result of the function
 */
export async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt > maxRetries) {
                throw error;
            }

            console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
            await sleep(delay);
            delay *= 2; // Exponential backoff (2x the previous delay)
        }
    }
}

export default retryWithBackoff;