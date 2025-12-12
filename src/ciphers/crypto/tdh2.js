import { p256 } from '@noble/curves/nist.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { randomBytes } from '@noble/hashes/utils.js';
import { gcm } from '@noble/ciphers/aes.js';

/*
This is from Chainlink's implementation of TDH2 that we changed to use noble packages
Reference:
- https://github.com/smartcontractkit/functions-toolkit/blob/0d918da87eafe0c26b34c2e04eaacf9c960827a1/src/tdh2.js
*/

const groupName = 'P256';
const tdh2InputSize = 32;
// NIST P256 curve order
const P256_ORDER = 0xffffffff00000000ffffffffffffffffbce6faada7179e84b5cfaaf2895c2a2cn;

/**
 * Converts a byte array to hex string
 */
function toHexString(byteArray) {
  return Array.from(byteArray, function (byte) {
    return ('0' + (byte & 0xff).toString(16)).slice(-2);
  }).join('');
}

/**
 * Convert bigint to 32-byte big-endian array
 */
function bigintToBytes32(value) {
  const bytes = new Uint8Array(32);
  for (let i = 31; i >= 0; i--) {
    bytes[i] = Number(value & 0xffn);
    value >>= 8n;
  }
  return bytes;
}

/**
 * Convert 32-byte array to bigint scalar (mod curve order)
 */
function bytesToScalar(bytes) {
  let result = 0n;
  for (let i = 0; i < bytes.length; i++) {
    result = (result << 8n) | BigInt(bytes[i]);
  }
  return result % P256_ORDER;
}

/**
 * XOR two buffers of equal length
 */
function xor(a, b) {
  if (a.length !== b.length) throw new Error('buffers with different lengths');

  const out = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i] ^ b[i];
  }
  return out;
}

/**
 * Concatenates points for hashing
 */
function concatenate(points) {
  let out = groupName;
  for (let i = 0; i < points.length; i++) {
    out += ',' + points[i].toHex(false);
  }
  return new TextEncoder().encode(out);
}

/**
 * Hash function 1 for TDH2
 */
function hash1(point) {
  const pointBytes = concatenate([point]);
  const data = new Uint8Array([...new TextEncoder().encode('tdh2hash1'), ...pointBytes]);
  return sha256(data);
}

/**
 * Hash function 2 for TDH2
 */
function hash2(msg, label, p1, p2, p3, p4) {
  if (msg.length !== tdh2InputSize) throw new Error('message has incorrect length');
  if (label.length !== tdh2InputSize) throw new Error('label has incorrect length');

  const pointsBytes = concatenate([p1, p2, p3, p4]);
  const data = new Uint8Array([
    ...new TextEncoder().encode('tdh2hash2'),
    ...msg,
    ...label,
    ...pointsBytes
  ]);

  const hashResult = sha256(data);
  // Convert hash to scalar by interpreting as big-endian bigint and reducing mod n
  let scalar = 0n;
  for (let i = 0; i < 32; i++) {
    scalar = (scalar << 8n) | BigInt(hashResult[i]);
  }
  return scalar % P256_ORDER;
}

/**
 * TDH2 encryption of a message using a public key
 */
function tdh2Encrypt(pub, msg, label) {
  if (pub.Group !== groupName) throw new Error('invalid group');

  // Decode public key points from base64
  const gBarBytes = Buffer.from(pub.G_bar, 'base64');
  const hBytes = Buffer.from(pub.H, 'base64');
  const gBar = p256.Point.fromBytes(gBarBytes);
  const h = p256.Point.fromBytes(hBytes);

  // Generate random scalars
  const rBytes = p256.utils.randomSecretKey();
  const sBytes = p256.utils.randomSecretKey();
  const r = bytesToScalar(rBytes);
  const s = bytesToScalar(sBytes);

  // Compute c = hash1(h * r) XOR msg
  const hr = h.multiply(r);
  const hash1Result = hash1(hr);
  const c = xor(hash1Result, msg);

  // Compute points
  const u = p256.Point.BASE.multiply(r);
  const w = p256.Point.BASE.multiply(s);
  const uBar = gBar.multiply(r);
  const wBar = gBar.multiply(s);

  // Compute e = hash2(c, label, u, w, uBar, wBar)
  const e = hash2(c, label, u, w, uBar, wBar);

  // Compute f = (s + r * e) mod n
  const re = (r * e) % P256_ORDER;
  const f = (s + re) % P256_ORDER;

  return JSON.stringify({
    Group: groupName,
    C: Buffer.from(c).toString('base64'),
    Label: Buffer.from(label).toString('base64'),
    U: Buffer.from(u.toBytes(false)).toString('base64'),
    U_bar: Buffer.from(uBar.toBytes(false)).toString('base64'),
    E: Buffer.from(bigintToBytes32(e)).toString('base64'),
    F: Buffer.from(bigintToBytes32(f)).toString('base64'),
  });
}

/**
 * Encrypt a message using hybrid encryption (AES-256-GCM + TDH2)
 */
export function encrypt(pub, msg) {
  // symmetric key and nonce
  const key = randomBytes(tdh2InputSize);
  const nonce = randomBytes(12);

  // Encrypt message with AES-256-GCM
  const cipher = gcm(key, nonce);
  const msgBytes = new TextEncoder().encode(msg);
  const ctxt = cipher.encrypt(msgBytes); // @noble/ciphers GCM returns ciphertext + auth tag concatenated

  // Encrypt symmetric key with TDH2
  const label = new Uint8Array(tdh2InputSize); // zero label
  const tdh2Ctxt = tdh2Encrypt(pub, key, label);

  return JSON.stringify({
    TDH2Ctxt: Buffer.from(tdh2Ctxt).toString('base64'),
    SymCtxt: Buffer.from(ctxt).toString('base64'),
    Nonce: Buffer.from(nonce).toString('base64'),
  });
}
