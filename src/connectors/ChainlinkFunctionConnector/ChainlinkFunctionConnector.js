import { ethers } from 'ethers';

import transferAndCall from './utils/transferAndCall.js';
import initializeContracts from './utils/initializeContracts.js';
import getChainID from '../../utils/getChainID.js';
import TERMS_OF_SERVICE_ALLOW_LIST_ABI from '../../chains/abis/chainlink/TERMS_OF_SERVICE_ALLOW_LIST_ABI.js';
import TERMS_OF_SERVICE_ALLOW_LIST_ADDRESSES from '../../chains/addresses/chainlink/TERMS_OF_SERVICE_ALLOW_LIST_ADDRESSES.js';
import FUNCTIONS_ROUTER_ADDRESSES from '../../chains/addresses/chainlink/FUNCTIONS_ROUTER_ADDRESSES.js';
import DON_IDS from '../../chains/configs/chainlink/DON_IDS.js';
import DON_IDS_HEXES from '../../chains/configs/chainlink/DON_IDS_HEXES.js';
import FUNCTIONS_COORDINATOR_ABI from '../../chains/abis/chainlink/FUNCTIONS_COORDINATOR_ABI.js';

class ChainlinkFunctionConnector {
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

        if (!FUNCTIONS_ROUTER_ADDRESSES[chain]?.[network]) {
            throw new Error(`Unsupported chain/network combination: ${chain}/${network}`);
        }

        this.chain = chain;
        this.network = network;

        if(opts.provider || opts.providerURI){
            this.provider = opts.provider || new ethers.JsonRpcProvider(opts.providerURI);
        } else {
            this.provider = signer.provider;
        }

        const donId = DON_IDS[chain]?.[network];
        const donIdHex = DON_IDS_HEXES[chain]?.[network];

        this.donId = donId;
        this.donIdHex = donIdHex;

        this.signer = signer;
        this.address = signer.address;

        const { functionRouter, linkToken } = initializeContracts(this.provider, chain, network);
        this.functionRouter = functionRouter;
        this.linkToken = linkToken;
    }

    /**
     * Create a new Chainlink Function subscription
     * @returns {Promise<{subscriptionId: string, transactionHash: string}>}
     */
    async createSubscription() {
        let subscriptionId = null;
        try {
            const data = this.functionRouter.interface.encodeFunctionData('createSubscription', []);
            const tx = await this.signer.sendTransaction({
                to: this.functionRouter.target,
                data: data,
                // gasLimit: gasEstimate ? (gasEstimate * BigInt(120)) / BigInt(100) : undefined // Add 20% buffer
            });
            const result = await tx.wait();

            for (let i = 0; i < result.logs.length; i++) {
                const log = result.logs[i];

                try {
                    const parsed = this.functionRouter.interface.parseLog(log);
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
     * Fund a subscription with LINK tokens
     * @param {string} subscriptionId - The subscription ID to fund
     * @param {string} amount - Amount to fund (in LINK for LINK tokens)
     * @param {string} currency - Currency to use ('LINK')
     * @returns {Promise<{transactionHash: string, unitAmount: string, amount: string, currency: string, subscriptionId: string}>}
     */
    async fundSubscription(subscriptionId, amount, currency = 'LINK') {
        try {
            currency = currency.toUpperCase();

            if (currency !== 'LINK') {
                throw new Error(`Unsupported currency: ${currency}. Use 'LINK'`);
            } 
            
            console.log('Funding subscription', subscriptionId, amount, currency);

            const transferResult = await transferAndCall(this.linkToken, this.functionRouter.target, amount, subscriptionId, this.signer);
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
            const data = this.functionRouter.interface.encodeFunctionData('addConsumer', [subscriptionId, consumerAddress]);
            const tx = await this.signer.sendTransaction({
                to: this.functionRouter.target,
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
            const data = this.functionRouter.interface.encodeFunctionData('removeConsumer', [subscriptionId, consumerAddress]);
            const tx = await this.signer.sendTransaction({
                to: this.functionRouter.target,
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
     * @returns {Promise<{subscriptionId: string, balance: string, blockedBalance: string, proposedOwner: string, owner: string, consumers: string[], flags: string}>}
     */
    async getSubscription(subscriptionId) {
        const { balance, owner, blockedBalance, proposedOwner, consumers, flags } = await this.functionRouter.getSubscription(subscriptionId);

        return {
            subscriptionId,
            balance: ethers.formatEther(balance),
            blockedBalance: ethers.formatEther(blockedBalance),
            proposedOwner,
            owner,
            consumers,
            flags
        };
    }

    /**
     * Cancel a subscription and refund remaining balance
     * @param {string} subscriptionId - The subscription ID
     * @param {string} refundAddress - Address to receive the refund
     * @returns {Promise<{success: boolean, transactionHash: string, subscriptionId: string, refundAddress: string}>}
     */
    async cancelSubscription(subscriptionId, refundAddress = this.address) {
        try {

            if(!await this.isOwnSubscription(subscriptionId)) {
                throw new Error(`Subscription ${subscriptionId} is not owned by ${this.address}`);
            }

            const data = this.functionRouter.interface.encodeFunctionData('cancelSubscription', [subscriptionId, refundAddress]);
            const tx = await this.signer.sendTransaction({
                to: this.functionRouter.target,
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
            return subscription.owner?.toLowerCase() === this.address.toLowerCase();
        } catch (error) {
            // getSubscription can revert if the subscription does not exist
            return false;
        }
    }

    async hasAccess(address = this.address) {
        const tosAddress = TERMS_OF_SERVICE_ALLOW_LIST_ADDRESSES[this.chain]?.[this.network];
        if (!tosAddress) {
            throw new Error(`Terms of Service contract address not found for ${this.chain} ${this.network}`);
        }

        const tosContract = new ethers.Contract(tosAddress, TERMS_OF_SERVICE_ALLOW_LIST_ABI, this.provider);
        return await tosContract.hasAccess(address, "0x");
    }
    /**
     * Accept the Chainlink Functions Terms of Service
     * @param {Object} signature - The signature
     * @param {string} signature.r - The r component of the signature
     * @param {string} signature.s - The s component of the signature
     * @param {number} signature.v - The v component of the signature
     * @returns {Promise<{success: boolean, transactionHash: string}>}
     */
    async acceptTOS(signature) {
        try {
            const tosAddress = TERMS_OF_SERVICE_ALLOW_LIST_ADDRESSES[this.chain]?.[this.network];
            if (!tosAddress) {
                throw new Error(`Terms of Service contract address not found for ${this.chain} ${this.network}`);
            }

            const tosContract = new ethers.Contract(tosAddress, TERMS_OF_SERVICE_ALLOW_LIST_ABI, this.signer);

            const hasAccess = await this.hasAccess(this.address);
            if (hasAccess) return { success: true, transactionHash: null, alreadyAccepted: true };

            let r, s, v;

            throw new Error('Signature must be an object with r, s, v properties');
           
            // TODO: Implement sig verif when able. Right now the endpoint errors with UNAUTHORIZED.
            // Function signature: acceptTermsOfService(address acceptor, address recipient, bytes32 r, bytes32 s, uint8 v)
            // We assume acceptor == recipient == signer.address
            const tx = await tosContract.acceptTermsOfService(this.address, this.address, r, s, v);
            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: receipt.hash
            };

        } catch (error) {
            console.error('Error accepting TOS:', error);
            throw error;
        }
    }

    /**
     * Get the message to be signed for TOS acceptance
     * @param {string} acceptor - The address accepting the TOS (defaults to signer address)
     * @param {string} recipient - The address to be allowed (defaults to signer address)
     * @returns {Promise<string>} The message hash
     */
    async getTOSMessage(acceptor = this.address, recipient = this.address) {
        const tosAddress = TERMS_OF_SERVICE_ALLOW_LIST_ADDRESSES[this.chain]?.[this.network];
        if (!tosAddress) {
            throw new Error(`Terms of Service contract address not found for ${this.chain} ${this.network}`);
        }

        const tosContract = new ethers.Contract(tosAddress, TERMS_OF_SERVICE_ALLOW_LIST_ABI, this.provider);
        return await tosContract.getMessage(acceptor, recipient);
    }

    /**
     * Get the signature for the TOS acceptance
     * @param {string} acceptor - The address accepting the TOS (defaults to signer address)
     * @param {string} recipient - The address to be allowed (defaults to signer address)
     * @returns {Promise<string>} The signature
     */
    async getTOSSignature(acceptor = this.address, recipient = this.address) {
        const tosAddress = TERMS_OF_SERVICE_ALLOW_LIST_ADDRESSES[this.chain]?.[this.network];
        if (!tosAddress) {
            throw new Error(`Terms of Service contract address not found for ${this.chain} ${this.network}`);
        }
        const data = await fetch(`https://functions.chain.link/api/proof?userAddress=${acceptor}&recipientAddress=${recipient}&chainId=${getChainID()}`);
        const dataJson = await data.json();
        return dataJson;
    }

    async estimateFunctionsRequestCost(options) {
        const { donId, subscriptionId, callbackGasLimit, gasPriceWei } = options;
       
        if (typeof donId !== 'string') {
            throw Error('donId has invalid type')
          }
      
          const donIdBytes32 = ethers.encodeBytes32String(donId)
      
          await this.getSubscription(subscriptionId)
      
          let subscriptionIdBigInt = BigInt(subscriptionId.toString())
      
          if (typeof callbackGasLimit !== 'number' || callbackGasLimit <= 0) {
            throw Error('Invalid callbackGasLimit')
          }
      
          if (typeof gasPriceWei !== 'bigint' || gasPriceWei <= 0) {
            throw Error('Invalid gasPriceWei')
          }
      
          let functionsCoordinatorAddress = null;
          try {
            functionsCoordinatorAddress = await this.functionRouter.getContractById(donIdBytes32)
          } catch (error) {
            throw Error(
              `${error}\n\nError encountered when attempting to fetch the FunctionsCoordinator address.\nEnsure the FunctionsRouter address and donId are correct and that that the provider is able to connect to the blockchain.`,
            )
          }
      
          try {
            await this.functionRouter.isValidCallbackGasLimit(subscriptionIdBigInt, callbackGasLimit)
          } catch (error) {
            throw Error(
              'Invalid callbackGasLimit. Ensure the callbackGasLimit is less than the max limit for your subscription tier.\n',
            )
          }
      
          const functionsCoordinator = new ethers.Contract(
            functionsCoordinatorAddress,
            FUNCTIONS_COORDINATOR_ABI,
            this.signer,
          )
      
          try {
            const data = ethers.encodeBytes32String(donId);
            const estimatedCostInJuels = await functionsCoordinator.estimateCost(
              subscriptionIdBigInt,
              data,
              callbackGasLimit,
              gasPriceWei,
            )
            return BigInt(estimatedCostInJuels.toString())
          } catch (error) {
            throw Error(`Unable to estimate cost':\n${error}`)
          }
    }
}

export { ChainlinkFunctionConnector };
export default ChainlinkFunctionConnector;
