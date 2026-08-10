/**
 * 16 bytes = 128 bits of entropy, base64url-encoded to 22 characters.
 *
 * Sized so the code is not enumerable: a sequential NIS on a card means a scan
 * of the next number is a valid card for another pupil. 128 bits makes forging
 * one infeasible without stealing it (research R12).
 */
export const CREDENTIAL_CODE_BYTES = 16;

export const CREDENTIAL_AUDIT_RESOURCE = 'presence-credential';
