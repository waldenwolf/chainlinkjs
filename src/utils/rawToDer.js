export function rawToDer(rawSignature) {
    // raw is 
    // r (32 bytes) 
    // + s (32 bytes)
    //  + v (1 byte)
    const r = rawSignature.slice(0, 32);
    const s = rawSignature.slice(32, 64);

    const rTrimmed = r.slice(r.findIndex(byte => byte !== 0) || 0);
    const sTrimmed = s.slice(s.findIndex(byte => byte !== 0) || 0);

    // If high bit, add leading zero
    const rEncoded = rTrimmed[0] & 0x80 ? Buffer.concat([Buffer.from([0x00]), rTrimmed]) : rTrimmed;
    const sEncoded = sTrimmed[0] & 0x80 ? Buffer.concat([Buffer.from([0x00]), sTrimmed]) : sTrimmed;

    // DER sequence: 
    // 0x30 + length (of the sequence)
    // + 0x02 + rLength + r
    // + 0x02 + sLength + s
    const rPart = Buffer.concat([Buffer.from([0x02, rEncoded.length]), rEncoded]);
    const sPart = Buffer.concat([Buffer.from([0x02, sEncoded.length]), sEncoded]);
    const sequence = Buffer.concat([rPart, sPart]);

    const derSignature = Buffer.concat([Buffer.from([0x30, sequence.length]), sequence]);

    return derSignature;
}

export default rawToDer;