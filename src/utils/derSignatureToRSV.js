import { ethers } from 'ethers';
import { canonicalizeSignature } from './canonicalizeSignature.js';
import { formatSignature } from './signatureToHex.js';
/**
     * Convert DER signature to RSV format
     * @param {Buffer} derSignature - DER-encoded signature
     * @param {string} digest - Original digest
     * @param {string} expectedAddress - Expected Ethereum address for recovery validation
     * @returns {Promise<string>} RSV signature
     */
export async function derSignatureToRSV(derSignature, digest, expectedAddress = null) {
    const sigBuffer = Buffer.from(derSignature);

    let offset = 2; // Skip sequence tag and length

    // Get r
    const rLength = sigBuffer[offset + 1];
    const rStart = offset + 2;
    const rEnd = rStart + rLength;
    let r = sigBuffer.slice(rStart, rEnd);

    // Get s
    offset = rEnd;
    const sLength = sigBuffer[offset + 1];
    const sStart = offset + 2;
    const sEnd = sStart + sLength;
    let s = sigBuffer.slice(sStart, sEnd);

    // Ensure r and s are 32 bytes
    if (r.length < 32) r = Buffer.concat([Buffer.alloc(32 - r.length), r]);
    if (s.length < 32) s = Buffer.concat([Buffer.alloc(32 - s.length), s]);

    // Canonicalize signature
    const canonical = canonicalizeSignature(
        r.toString('hex'),
        s.toString('hex')
    );

    let recoveryId = canonical.recoveryId;

    // If expected address is provided, verify which recovery ID recovers the correct address
    if (expectedAddress) {
        const sig0 = formatSignature(canonical.r, canonical.s, 0);
        const sig1 = formatSignature(canonical.r, canonical.s, 1);

        try {
            const recovered0 = ethers.recoverAddress(digest, sig0);
            if (recovered0.toLowerCase() === expectedAddress.toLowerCase()) {
                recoveryId = 0;
            } else {
                const recovered1 = ethers.recoverAddress(digest, sig1);
                if (recovered1.toLowerCase() === expectedAddress.toLowerCase()) {
                    recoveryId = 1;
                } else {
                    console.warn('Could not recover expected address with either recovery ID');
                    console.log('Expected:', expectedAddress);
                    console.log('Recovered 0:', recovered0);
                    console.log('Recovered 1:', recovered1);
                }
            }
        } catch (error) {
            console.warn('Error during address recovery:', error.message);
        }
    }

    return formatSignature(canonical.r, canonical.s, recoveryId);
}

export default derSignatureToRSV;