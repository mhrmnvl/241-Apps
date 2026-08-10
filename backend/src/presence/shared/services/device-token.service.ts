import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';

/** 32 bytes of entropy, URL-safe so it survives being pasted into a kiosk field. */
const TOKEN_BYTES = 32;

export interface IssuedDeviceToken {
  /** Returned to the operator exactly once, then unrecoverable. */
  token: string;
  hash: string;
}

/**
 * Device tokens are hashed with SHA-256, not bcrypt.
 *
 * That is deliberate and the opposite of the right answer for passwords. bcrypt
 * exists to make brute force expensive against *low-entropy* secrets a human
 * chose. A 256-bit random token has nothing to brute force, and a slow hash on
 * the gate's hottest path would cost every scan in the morning queue. SHA-256
 * over high entropy is the standard shape for API tokens.
 *
 * Hashing at all is what stops a database leak handing over a working gate
 * credential.
 */
@Injectable()
export class DeviceTokenService {
  issue(): IssuedDeviceToken {
    const token = randomBytes(TOKEN_BYTES).toString('base64url');
    return { token, hash: this.hash(token) };
  }

  hash(token: string): string {
    return createHash('sha256').update(token, 'utf8').digest('hex');
  }

  /** Constant-time comparison, so a wrong token leaks nothing through timing. */
  matches(token: string, expectedHash: string): boolean {
    const actual = Buffer.from(this.hash(token), 'hex');
    const expected = Buffer.from(expectedHash, 'hex');

    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  }
}
