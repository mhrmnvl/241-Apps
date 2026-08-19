import { InternalServerErrorException } from '@nestjs/common';

/**
 * Raised when the loan lifecycle cannot find a reference row it binds to by
 * code — an asset status system role, or a transaction type.
 *
 * A 5xx rather than a 4xx on purpose: the caller asked for something perfectly
 * valid, and the deployment is missing rows it cannot run without. The message
 * names each missing row individually, because whoever reads it has to go and
 * supply exactly those.
 *
 * Extends the framework's exception so the HTTP status and the global filter
 * keep working unchanged — the subclass exists to name the rule, not to alter
 * transport behaviour.
 */
export class InventoryReferenceDataMissingException extends InternalServerErrorException {
  constructor(missing: string[]) {
    super(
      `The inventory loan flow cannot run because reference data is missing: ${missing.join(
        ', ',
      )}. Asset status roles are assigned under Referensi > Status Aset; transaction types ship with the database migration.`,
    );
  }
}
