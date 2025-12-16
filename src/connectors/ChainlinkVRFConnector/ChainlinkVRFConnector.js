import { ethers } from 'ethers';

import transferAndCall from './utils/transferAndCall.js';
import initializeContracts from './utils/initializeContracts.js';
import VRF_COORDINATOR_ADDRESSES from '../../chains/addresses/chainlink/VRF_COORDINATOR_ADDRESSES.js';

class ChainlinkVRFConnector {
    constructor(signer = null, opts = {}) {
        if(!opts.chain){
            opts.chain = 'ethereum';
        }
        if(!opts.network){
            opts.network = 'mainnet';
        }
        if(!opts.providerURI && !opts.provider && !signer.provider){
            throw new Error('providerURI, provider or signer.provider is required');
        }

        const network = opts.network.toLowerCase();
        const chain = opts.chain.toLowerCase();

        if (!VRF_COORDINATOR_ADDRESSES[chain]?.[network]) {
            throw new Error(`Unsupported chain/network combination: ${chain}/${network}`);
        }

        this.chain = chain;
        this.network = network;

        if(opts.provider || opts.providerURI){
            this.provider = opts.provider || new ethers.JsonRpcProvider(opts.providerURI);
        } else {
            this.provider = signer.provider;
        }

        this.signer = signer;
        this.address = signer.address;

        const { vrfCoordinator, linkToken } = initializeContracts(this.provider, chain, network);
        this.vrfCoordinator = vrfCoordinator;
        this.linkToken = linkToken;
    }

    /**
     * Create a new Chainlink VRF subscription
     * @returns {Promise<{subscriptionId: string, transactionHash: string}>}
     */
    async createSubscription() {
        try {
            const data = this.vrfCoordinator.interface.encodeFunctionData('createSubscription', []);
            const tx = await this.signer.sendTransaction({
                to: this.vrfCoordinator.target,
                data: data
            });
            const result = await tx.wait();

            let subscriptionId = null;
            for (let i = 0; i < result.logs.length; i++) {
                const log = result.logs[i];

                try {
                    const parsed = this.vrfCoordinator.interface.parseLog(log);
                    if(parsed.name === 'SubscriptionCreated') {
                        subscriptionId = parsed.args[0]?.toString();
                        break;
                    }
                } catch (e) {
                    console.error('Error parsing log:', e);
                    subscriptionId = null;
                }
            }

            return {
                success: true,
                subscriptionId,
                transactionHash: result.hash,
            };
        } catch (error) {
            console.error('Error creating subscription:', error);
            throw error;
        }
    }

    /**
     * Fund a subscription with either ETH or LINK tokens
     * @param {string} subscriptionId - The subscription ID to fund
     * @param {string} amount - Amount to fund (in ether for ETH, in LINK for LINK tokens)
     * @param {string} currency - Currency to use ('ETH' or 'LINK')
     * @returns {Promise<{transactionHash: string, unitAmount: string, amount: string, currency: string, subscriptionId: string}>}
     */
    async fundSubscription(subscriptionId, amount, currency = 'ETH') {
        try {
            currency = currency.toUpperCase();

            if (currency === 'ETH') {
                const unitAmount = ethers.parseEther(amount);
                const data = this.vrfCoordinator.interface.encodeFunctionData('fundSubscriptionWithNative', [subscriptionId]);
                const tx = await this.signer.sendTransaction({
                    to: this.vrfCoordinator.target,
                    data: data,
                    value: unitAmount
                });

                const receipt = await tx.wait();

                return {
                    success: true,
                    transactionHash: receipt.hash,
                    unitAmount: unitAmount,
                    amount: amount,
                    currency: 'ETH',
                    subscriptionId
                };
            } else if (currency === 'LINK') {
                const transferResult = await transferAndCall(this.linkToken, this.vrfCoordinator.target, amount, subscriptionId, this.signer);
                if (!transferResult.success) {
                    throw new Error(`Failed to fund subscription ${subscriptionId} with LINK`);
                }

                return {
                    success: true,
                    transactionHash: transferResult.transactionHash,
                    unitAmount: transferResult.unitAmount,
                    amount: amount,
                    currency: 'LINK',
                    subscriptionId: transferResult.subscriptionId
                };
            } else {
                throw new Error(`Unsupported currency: ${currency}. Use 'ETH' or 'LINK'`);
            }
        } catch (error) {
            console.error(`Error funding subscription with ${currency}:`, error);
            throw error;
        }
    }

    /**
     * Add a consumer contract to a subscription
     * @param {string} subscriptionId - The subscription ID
     * @param {string} consumerAddress - The consumer contract address
     * @returns {Promise<{success: boolean, transactionHash: string, subscriptionId: string, consumerAddress: string}>}
     */
    async addConsumer(subscriptionId, consumerAddress) {
        try {
            const data = this.vrfCoordinator.interface.encodeFunctionData('addConsumer', [subscriptionId, consumerAddress]);
            const tx = await this.signer.sendTransaction({
                to: this.vrfCoordinator.target,
                data: data
            });
            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: receipt.hash,
                subscriptionId,
                consumerAddress
            };
        } catch (error) {
            console.error('Error adding consumer:', error);
            throw error;
        }
    }

    /**
     * Remove a consumer contract from a subscription
     * @param {string} subscriptionId - The subscription ID
     * @param {string} consumerAddress - The consumer contract address
     * @returns {Promise<{success: boolean, transactionHash: string, subscriptionId: string, consumerAddress: string}>}
     */
    async removeConsumer(subscriptionId, consumerAddress) {
        try {
            const data = this.vrfCoordinator.interface.encodeFunctionData('removeConsumer', [subscriptionId, consumerAddress]);
            const tx = await this.signer.sendTransaction({
                to: this.vrfCoordinator.target,
                data: data
            });
            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: receipt.hash,
                subscriptionId,
                consumerAddress
            };
        } catch (error) {
            console.error('Error removing consumer:', error);
            throw error;
        }
    }

    /**
     * Get subscription details
     * @param {string} subscriptionId - The subscription ID
     * @returns {Promise<{balance: string, nativeBalance: string, requestCount: string, owner: string, consumers: string[]}>}
     */
    async getSubscription(subscriptionId) {
        try {
            const [balance, nativeBalance, requestCount, owner, consumers] = await this.vrfCoordinator.getSubscription(subscriptionId);

            return {
                subscriptionId,
                balance: ethers.formatEther(balance),
                nativeBalance: ethers.formatEther(nativeBalance),
                requestCount: requestCount.toString(),
                owner,
                consumers
            };
        } catch (error) {
            console.error('Error getting subscription details:', error);
            throw error;
        }
    }

    /**
     * Cancel a subscription and refund remaining balance
     * @param {string} subscriptionId - The subscription ID
     * @param {string} refundAddress - Address to receive the refund
     * @returns {Promise<{success: boolean, transactionHash: string, subscriptionId: string, refundAddress: string}>}
     */
    async cancelSubscription(subscriptionId, refundAddress = this.address) {
        try {
            const data = this.vrfCoordinator.interface.encodeFunctionData('cancelSubscription', [subscriptionId, refundAddress]);
            const tx = await this.signer.sendTransaction({
                to: this.vrfCoordinator.target,
                data: data
            });
            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: receipt.hash,
                subscriptionId,
                refundAddress
            };
        } catch (error) {
            console.error('Error canceling subscription:', error);
            throw error;
        }
    }

    /**
     * Check if a subscription is owned by the current signer
     * @param {string} subscriptionId - The subscription ID to check
     * @returns {Promise<boolean>} True if owned by signer, false otherwise
     */
    async isOwnSubscription(subscriptionId) {
        try {
            const subscription = await this.getSubscription(subscriptionId);
            return subscription.owner.toLowerCase() === this.address.toLowerCase();
        } catch (error) {
            console.error(`Error checking subscription ownership for ${subscriptionId}:`, error);
            return false;
        }
    }
}

export { ChainlinkVRFConnector };
export default ChainlinkVRFConnector;
