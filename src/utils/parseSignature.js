import { ethers } from 'ethers';

/**
 * Parse signature into components rsv
 * @param {string} signature - Full signature
 * @returns {Object} {r, s, v}
 */
export function parseSignature(signature) {
    const sig = ethers.Signature.from(signature);
    return {
        r: sig.r,
        s: sig.s,
        v: sig.v
    };
}

export default parseSignature;