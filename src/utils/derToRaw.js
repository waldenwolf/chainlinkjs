
/**
 * Parse DER-encoded EC public key to extract raw 64-byte key (x + y coordinates)
 * @param {Buffer} derBuffer - DER-encoded public key
 * @returns {string} Raw public key hex string
 */
export function derToRaw(derBuffer) {
    const der = Buffer.from(derBuffer);

    // Find the BIT STRING tag (0x03) which contains the public key
    let bitStringOffset = -1;
    for (let i = 0; i < der.length; i++) {
        if (der[i] === 0x03) {
            bitStringOffset = i;
            break;
        }
    }

    if (bitStringOffset === -1) {
        throw new Error('Could not find BIT STRING in DER-encoded public key');
    }

    // Skip BIT STRING tag (1 byte) and length (1 byte), then skip the unused bits byte (1 byte) (required for KMS)
    const keyStart = bitStringOffset + 3;
    const rawKey = der.subarray(keyStart);

    if (rawKey[0] !== 0x04) {
        throw new Error('Expected uncompressed public key point');
    }

    // Return x + y coordinates (64 bytes)
    return rawKey.subarray(1).toString('hex');
}

export default derToRaw;