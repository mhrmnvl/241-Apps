export interface MasterDataTextField {
  key: string
  kind: 'text'
  label: string
  required?: boolean
  maxLength?: number
  placeholder?: string
  /** Editable on create; rendered read-only and dropped from the update payload once a record exists. */
  readOnlyOnEdit?: boolean
}

/**
 * A whole number, for the rare reference field that is one — an ordering
 * column, a weight. Kept deliberately plain: no step, no float, because every
 * use so far is "which comes first".
 */
export interface MasterDataNumberField {
  key: string
  kind: 'number'
  label: string
  required?: boolean
  min?: number
  max?: number
  default?: number
  placeholder?: string
  /** Explains what the number means, since a bare integer rarely does. */
  hint?: string
}

export interface MasterDataBooleanField {
  key: string
  kind: 'boolean'
  label: string
  default?: boolean
  trueLabel?: string
  falseLabel?: string
}

export type MasterDataField =
  | MasterDataTextField
  | MasterDataNumberField
  | MasterDataBooleanField

export interface MasterDataEntity {
  id: string
}

export interface MasterDataDeleteCallbacks {
  closeAlert: () => void
  setLoading: (state: boolean) => void
}

/**
 * `TCreate` / `TUpdate` are the payload types the feature's own service takes.
 * They default to the dynamic record the form produces, so a config that has no
 * dedicated payload types can still be written as `MasterDataConfig<Thing>`.
 * Declaring them is what lets a feature drop the cast on every service call.
 */
export interface MasterDataConfig<
  T extends MasterDataEntity,
  TCreate = Record<string, unknown>,
  TUpdate = TCreate,
> {
  entityLabel: {
    singular: string
    plural: string
  }
  permissions: {
    canCreate: boolean
    canUpdate: boolean
    canDelete: boolean
  }
  service: {
    list: () => Promise<T[]>
    create: (payload: TCreate) => Promise<boolean>
    update: (id: string, payload: TUpdate) => Promise<boolean>
    remove: (
      id: string,
      callbacks: MasterDataDeleteCallbacks,
    ) => Promise<boolean>
  }
  fields: MasterDataField[]
}

/** The parts of a config that describe the table, independent of payload types. */
export type MasterDataDisplayConfig<T extends MasterDataEntity> = Pick<
  MasterDataConfig<T>,
  'entityLabel' | 'permissions' | 'fields'
>
