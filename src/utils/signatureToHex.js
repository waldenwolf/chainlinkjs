import { ethers } from 'ethers';

/**
 * Convert signature components to hex string
 * @param {string} r - r component
 * @param {string} s - s component
 * @param {number} v - recovery id
 * @returns {string} Formatted signature
 */
export function formatSignature(r, s, v) {
    return ethers.Signature.from({
        r: r.startsWith('0x') ? r : '0x' + r,
        s: s.startsWith('0x') ? s : '0x' + s,
        v: v
    }).serialized;
}

export default formatSignature;