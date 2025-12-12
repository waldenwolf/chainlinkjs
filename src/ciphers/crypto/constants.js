/**
 * ECIES constants
 */

export const KDF_SALT = new Uint8Array(32);
export const KDF_INFO = new TextEncoder().encode('noble-xchacha-ecies');
export const KEY_LENGTH = 32;
export const PUB_KEY_LEN = 33;
