import { ethers } from 'ethers';
import { estimateGasLimit } from './estimateGasLimit.js';

/**
 * Prepare a complete transaction object
 * @param {Object} provider - Ethers provider
 * @param {Object} txParams - Transaction parameters
 * @param {string} fromAddress - Sender address
 * @param {number} nonce - Transaction nonce
 * @returns {Promise<Object>} Prepared transaction object
 */
export async function prepareTransaction(provider, txParams, fromAddress, nonce) {
    let gasPrice, maxFeePerGas, maxPriorityFeePerGas;

    if (txParams.maxFeePerGas && txParams.maxPriorityFeePerGas) {
        maxFeePerGas = txParams.maxFeePerGas;
        maxPriorityFeePerGas = txParams.maxPriorityFeePerGas;
    } else if (txParams.gasPrice) {
        gasPrice = txParams.gasPrice;
    } else {
        try {
            const feeData = await provider.getFeeData();
            maxFeePerGas = feeData.maxFeePerGas;
            maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
        } catch (error) {
            gasPrice = (await provider.getFeeData()).gasPrice;
        }
    }

    const gasLimit = await estimateGasLimit(provider, txParams, fromAddress);
    const chainId = (await provider.getNetwork()).chainId;

    const tx = {
        to: txParams.to,
        value: typeof txParams.value === 'string' ? ethers.parseEther(txParams.value) : txParams.value,
        data: txParams.data || '0x',
        nonce: nonce,
        gasLimit: gasLimit,
        chainId: chainId
    };

    if (maxFeePerGas && maxPriorityFeePerGas) {
        tx.maxFeePerGas = maxFeePerGas;
        tx.maxPriorityFeePerGas = maxPriorityFeePerGas;
    } else {
        // if legacy
        tx.gasPrice = gasPrice;
    }

    return tx;
}

export default prepareTransaction;