import { ethers } from 'ethers';

import { encrypt } from '../../ciphers/crypto/tdh2.js';
import initializeContracts from './utils/initializeContracts.js';
import { createGatewayMessage } from './utils/createGatewayMessage.js';
import FUNCTIONS_COORDINATOR_ABI from '../../chains/abis/chainlink/FUNCTIONS_COORDINATOR_ABI.js';
import { encryptWithPublicKey } from '../../ciphers/encrypt-with-public-key.js';
import SECRETS_ENDPOINTS_ADDRESSES from '../../chains/addresses/chainlink/SECRETS_ENDPOINTS_ADDRESSES.js';
import DON_IDS from '../../chains/configs/chainlink/DON_IDS.js';
import DON_IDS_HEXES from '../../chains/configs/chainlink/DON_IDS_HEXES.js';

class ChainlinkSecretsConnector {
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

        if (!SECRETS_ENDPOINTS_ADDRESSES[chain]?.[network]) {
            throw new Error(`Unsupported chain/network combination: ${chain}/${network}`);
        }

        const secretsEndpoints = SECRETS_ENDPOINTS_ADDRESSES[chain]?.[network];
    
        const donId = DON_IDS[chain]?.[network];
        const donIdHex = DON_IDS_HEXES[chain]?.[network];

        this.chain = chain;
        this.network = network;
        this.secretsEndpoints = secretsEndpoints;
        this.donId = donId;
        this.donIdHex = donIdHex;

        if(opts.provider || opts.providerURI){
            this.provider = opts.provider || new ethers.JsonRpcProvider(opts.providerURI);
        } else {
            this.provider = signer.provider;
        }

        this.signer = signer;
        this.address = signer.address;

        const { functionRouter, linkToken } = initializeContracts(this.provider, chain, network);
        this.functionRouter = functionRouter;
        this.linkToken = linkToken;

        this.functionCoordinator = null;
    }


    async fetchKeys() {
        try {
            const contractId = ethers.encodeBytes32String(this.donId);
            console.log('contractId', contractId);
            const contractAddress = await this.functionRouter.getContractById(contractId);
            console.log('contractAddress', contractAddress);
            this.functionCoordinator = new ethers.Contract(contractAddress, FUNCTIONS_COORDINATOR_ABI, this.provider);
            const thresholdPublicKeyBytes = await this.functionCoordinator.getThresholdPublicKey();

            const thresholdPublicKeyBytesString = Buffer.from(thresholdPublicKeyBytes.slice(2), 'hex').toString('utf-8')
            const thresholdPublicKey = JSON.parse(thresholdPublicKeyBytesString)
          
            const donPublicKeyBytes = await this.functionCoordinator.getDONPublicKey();
            const donPublicKey = donPublicKeyBytes.slice(2);

            return { thresholdPublicKey, donPublicKey };
        } catch (error) {
            console.error('Unexpected error calling getThresholdPublicKey:', error.message);
            throw error;
        }
    }

    async encryptSecrets(secrets) {
        const { thresholdPublicKey, donPublicKey } = await this.fetchKeys()

        const message = JSON.stringify(secrets)
        const signature = await this.signer.signMessage(message)
        const signedSecrets = JSON.stringify({
            message,
            signature,
        })

        console.log('signedSecrets', signedSecrets);
        const encryptedSignedSecrets = await encryptWithPublicKey(donPublicKey, signedSecrets)
        console.log(encryptedSignedSecrets);
        const stringifiedEncryptedSignedSecrets = JSON.stringify(encryptedSignedSecrets)

        const donKeyEncryptedSecrets = {
            '0x0': Buffer.from(stringifiedEncryptedSignedSecrets, 'hex').toString('base64'),
        }

        const encryptedThresholdSecretsBytes = encrypt(thresholdPublicKey, Buffer.from(JSON.stringify(donKeyEncryptedSecrets)))
        const encryptedThresholdSecretsHexstring = Buffer.from(encryptedThresholdSecretsBytes).toString('hex')
        const encryptedSecretsHexstring = '0x' + encryptedThresholdSecretsHexstring
       
  
        return {
            encryptedSecrets: encryptedSecretsHexstring,
        }
    }

    async encryptSecretsUrls(urls) {
        if (!Array.isArray(urls) || urls.length === 0) {
            throw Error('Must provide an array of secrets URLs')
        }
        if (!urls.every(url => typeof url === 'string')) {
            throw Error('All secrets URLs must be strings')
        }
        try {
            urls.forEach(url => new URL(url))
        } catch (e) {
            throw Error(`Error encountered when attempting to validate a secrets URL: ${e}`)
        }
        const donPublicKey = (await this.fetchKeys()).donPublicKey
        const encrypted = await encryptWithPublicKey(donPublicKey, urls.join(' '))
        return '0x' + Buffer.from(JSON.stringify(encrypted)).toString('hex')
    }


    async encryptAndUploadSecrets(secrets, options) {
        const encryptedSecrets = await this.encryptSecrets(secrets)
        return this.sendEncryptedSecretsToDON(encryptedSecrets, options?.slotId, options?.ttl);
    }

    async sendEncryptedSecretsToDON(encryptedSecrets, slotId = 0, ttl = 72 * 60) {
        const request = {
            method: 'secrets_set',
            don_id: this.donId,
            payload: encryptedSecrets,
            slotId: slotId,
            ttl: ttl, // 72 hours in testnet or 2160 hours in mainnet. Value in minutes.
        }

        const gatewayMessage = await createGatewayMessage(this.signer, request.method, this.donId, request.payload)
        const response = await fetch(this.secretsEndpoints[0], {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: gatewayMessage,
        })
        return response.json()
    }

    async listHostedSecrets() {
        const request = {
            method: 'secrets_list',
            don_id: this.donId,
        }

        const gatewayMessage = await createGatewayMessage(this.signer, request.method, this.donId, request.payload)
        const response = await fetch(this.secretsEndpoints[0], {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: gatewayMessage,
        })
        return response.json()
    }


    async verifyOffchainSecrets(secretsUrls) {
        let lastFetchedEncryptedSecrets;

        for (const url of secretsUrls) {
          let response;
          let data;
          try {
            response = await fetch(url)
            if (!response.ok) {
                throw Error(`Error encountered when attempting to fetch URL ${url}: ${response.statusText}`)
            }
            data = await response.json()
          } catch (e) {
            throw Error(`Error encountered when attempting to fetch URL ${url}: ${e}`)
          }
    
          if (!data?.encryptedSecrets) {
            throw Error(`URL ${url} did not return a JSON object with an encryptedSecrets field`)
          }
    
          if (!ethers.isHexString(data.encryptedSecrets)) {
            throw Error(`URL ${url} did not return a valid hex string for the encryptedSecrets field`)
          }
    
          if (
            lastFetchedEncryptedSecrets &&
            lastFetchedEncryptedSecrets !== data.encryptedSecrets
          ) {
            throw Error(`URL ${url} returned a different encryptedSecrets field than the previous URL`)
          }
    
          lastFetchedEncryptedSecrets = data.encryptedSecrets
        }
    
        return true
    }
}

export { ChainlinkSecretsConnector };
export default ChainlinkSecretsConnector;
