import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { CREDENTIAL_CODE_BYTES } from '../constants/credential.constants.js';

/**
 * Mints the opaque token printed as a QR on a kartu pelajar or kartu pegawai.
 *
 * Two properties matter more than they first appear (research R12):
 *
 * A found card leaks nothing. A code encoding `NIS 2024001` tells whoever picks
 * it up which child it belongs to, and school ID cards are lost constantly. An
 * opaque token identifies the holder only to a system that already knows them.
 *
 * And codes are not guessable. This is why the value is random rather than
 * derived from anything about the person — a derivation is an enumeration
 * waiting to be noticed.
 */
@Injectable()
export class CredentialCodeService {
  generate(): string {
    return randomBytes(CREDENTIAL_CODE_BYTES).toString('base64url');
  }
}
