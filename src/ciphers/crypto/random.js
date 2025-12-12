import crypto from 'crypto';

export const random = {
    bytes: (length) => {
        return crypto.randomBytes(length);
    }
}