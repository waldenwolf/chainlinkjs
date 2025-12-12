import { ethers } from 'ethers';

/**
 * Estimate gas limit for a transaction
 * @param {Object} provider - Ethers provider
 * @param {Object} txParams - Transaction parameters
 * @param {string} fromAddress - Sender address
 * @returns {Promise<bigint>} Gas limit
 */
export async function estimateGasLimit(provider, txParams, fromAddress) {
    let gasLimit = txParams.gasLimit;
    if (!gasLimit) {
        const estimateTx = {
            to: txParams.to,
            value: typeof txParams.value === 'string' ? ethers.parseEther(txParams.value) : txParams.value,
            data: txParams.data || '0x',
            from: fromAddress
        };
        gasLimit = await provider.estimateGas(estimateTx);
        gasLimit = (gasLimit * 120n) / 100n; // Add 20% buffer
    }
    return gasLimit;
}

export default estimateGasLimit;