/**
 * Canonicalize signature to prevent malleability 
 * @param {string} r - r component
 * @param {string} s - s component
 * @returns {Object} Canonicalized {r, s, recoveryId}
 */
export function canonicalizeSignature(r, s) {
    const secp256k1n = BigInt('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141');
    const sValue = BigInt(s.startsWith('0x') ? s : '0x' + s);
    const halfOrder = secp256k1n / 2n;

    let canonicalS = sValue;
    let recoveryId = 0;

    // If s > half order, canonicalize
    if (sValue > halfOrder) {
        canonicalS = secp256k1n - sValue;
        recoveryId = 1; // Will be flipped when used
    }

    return {
        r: r.startsWith('0x') ? r : '0x' + r,
        s: '0x' + canonicalS.toString(16).padStart(64, '0'),
        recoveryId
    };
}

export default canonicalizeSignature;