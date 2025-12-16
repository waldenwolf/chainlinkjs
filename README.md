# Chainlink JS

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This package contains tooling to work with Chainlink and ethers v6. 

### Connectors

`ChainlinkVRFConnector`: Connector for Chainlink VRF.

Manages Chainlink VRF v2.5 subscriptions

**Environment Variables Required:**
- `RPC_URL` - Blockchain RPC endpoint URL
- `PRIVATE_KEY` - Wallet private key for signing transactions
- `CHAINLINK_NETWORK` - Network name (ethereum, polygon, arbitrum, optimism, base)
- `CHAINLINK_CHAIN` - Chain name (mainnet, sepolia, mumbai, etc.)

**Usage:**
```javascript
import { ChainlinkVRFConnector } from "./src/connectors/ChainlinkVRFConnector.js";

const vrf = new ChainlinkVRFConnector();

const subscriptions = await vrf.listSubscriptions([
  "102692964286750664259499016255520300419720563719633059324084515380375060412330"
]);

const subscriptionResult = await vrf.createSubscription();
const isOwned = await vrf.isSubscriptionOwned(subscriptionResult.subscriptionId);
const subscriptionDetails = await vrf.getSubscription(subscriptionResult.subscriptionId);
```

#### Methods


- fundSubscription(subscriptionId, amount, currency = 'ETH') // Fund the subscription with ETH or LINK
- createSubscription() // Create a new subscription
- isSubscriptionOwned(subscriptionId) // Check if a subscription is owned by us
- getSubscription(subscriptionId) // Get subscription details
- listSubscriptions([subscriptionId]) // List all subscriptions
- cancelSubscription(subscriptionId) // Cancel a subscription
- addConsumer(subscriptionId, consumerAddress) // Add a consumer to a subscription
- removeConsumer(subscriptionId, consumerAddress) // Remove a consumer from a subscription


`ChainlinkSecretsConnector`: Connector for Chainlink Secrets.

Manages Chainlink Secrets for Chainlink Functions.

**Environment Variables Required:**
- `RPC_URL` - Blockchain RPC endpoint URL
- `PRIVATE_KEY` - Wallet private key for signing transactions
- `CHAINLINK_NETWORK` - Network name (ethereum, polygon, arbitrum, optimism, base)
- `CHAINLINK_CHAIN` - Chain name (mainnet, sepolia, mumbai, etc.)

**Usage:**
```javascript
import { ChainlinkSecretsConnector } from "./src/connectors/ChainlinkSecretsConnector.js";

const secrets = new ChainlinkSecretsConnector();

const secrets = await secrets.listHostedSecrets();
```

#### Methods

- fetchKeys() // Fetch the keys from the Chainlink Functions contract
- listHostedSecrets() // List all hosted secrets
- encryptSecrets(secrets) // Encrypt secrets
- encryptSecretsUrls(urls) // Encrypt secrets URLs
- encryptAndUploadSecrets(secrets) // Encrypt secrets and upload to the DON
- sendEncryptedSecretsToDON(encryptedSecrets, slotId, ttl) // Send encrypted secrets to the DON
- listHostedSecrets() // List all hosted secrets

`ChainlinkFunctionsConnector`: Connector for Chainlink Functions.

Manages Chainlink Functions for Chainlink Secrets.

**Environment Variables Required:**
- `RPC_URL` - Blockchain RPC endpoint URL
- `PRIVATE_KEY` - Wallet private key for signing transactions
- `CHAINLINK_NETWORK` - Network name (ethereum, polygon, arbitrum, optimism, base)
- `CHAINLINK_CHAIN` - Chain name (mainnet, sepolia, mumbai, etc.)

**Usage:**
```javascript
import { ChainlinkFunctionsConnector } from "./src/connectors/ChainlinkFunctionsConnector.js";

const functions = new ChainlinkFunctionsConnector();

const subscription = await functions.createSubscription();
```

#### Methods

- createSubscription() // Create a new subscription
- listSubscriptions() // List all subscriptions
- getSubscription(subscriptionId) // Get subscription details
- cancelSubscription(subscriptionId) // Cancel a subscription
- addConsumer(subscriptionId, consumerAddress) // Add a consumer to a subscription
- removeConsumer(subscriptionId, consumerAddress) // Remove a consumer from a subscription

#### Ciphers

#### Encrypting / Decrypting Secrets and Key pair generation

Generate a key pair:
```javascript
import { generateKeyPair } from "./src/ciphers/crypto/keygen.js";

const { privateKey, publicKey } = generateKeyPair();
```

We can then share the public key with Instruxi for them to encrypt the secrets.

Encrypt and decrypt secrets:
```javascript
import { encryptSecrets } from "./src/ciphers/encryptSecrets.js";
import { decryptSecrets } from "./src/ciphers/decryptSecrets.js";

const secrets = ["SECRET1=value1", "SECRET2=value2"];
const privateKey = Buffer.from(process.env.ENCRYPT_PRIVATE_KEY, 'hex');
const publicKey = Buffer.from(process.env.ENCRYPT_PUBLIC_KEY, 'hex');
const encryptedSecrets = await encryptSecrets(secrets, publicKey);
const decryptedSecrets = await decryptSecrets(encryptedSecrets, privateKey);
```


### Utils:


```javascript
import { utils } from './src/index.js';


utils.canonicalizeSignature(sig)                         // Canonicalize signature format
utils.decomposeFromChainId(chainId)                      // Decompose chain ID into chain and network (e.g. 11155111 -> { chain: 'ethereum', network: 'sepolia' })
utils.deriveAddressFromPublicKey(key)                    // Derive address from public key
utils.derivePublicKeyFromPrivateKey(privateKey)          // Derive public key from private key
utils.derSignatureToRSV(der, digest, expectedAddress)   // Convert DER to RSV format (optional: expected address for recovery validation)
utils.derToRaw(derSignature)                             // Convert DER to raw signature
utils.estimateGasLimit(provider, params, from)           // Estimate gas limit
utils.getProvider()                                      // Get provider
utils.parseSignature(signature)                          // Parse signature from hex
utils.prepareTransaction(provider, params, from, nonce)  // Prepare transaction
utils.signatureToHex(signature)                          // Convert signature to hex
utils.sleep(ms)                                          // Sleep utility
utils.retryWithBackoff(fn, options)                      // Retry with exponential backoff
utils.rawToDer(rawSignature)                             // Convert raw signature to DER
```



## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.  