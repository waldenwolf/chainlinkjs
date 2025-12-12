import { ethers } from 'ethers';

/**
 * Derive Ethereum address from raw public key
 * @param {string} publicKeyRaw - Raw public key hex string (64 bytes)
 * @returns {string} Ethereum address
 */
export function deriveAddressFromPublicKey(publicKeyRaw) {
    // If raw key doesn't have 0x prefix, add it.
    // Also assume it's the raw X+Y (64 bytes), so we need to prepend '04' for uncompressed format expected by computeAddress if it's strictly raw.
    // However, the original code added '04'.
    
    let key = publicKeyRaw;
    if (key.startsWith('0x')) {
        key = key.slice(2);
    }
    
    // Add 04 prefix for uncompressed public key
    const uncompressedKey = '0x04' + key;
    
    return ethers.computeAddress(uncompressedKey);
}

export default deriveAddressFromPublicKey;
