export interface MasterDataTextField {
  key: string
  kind: 'text'
  label: string
  required?: boolean
  maxLength?: number
  placeholder?: string
}

export interface MasterDataBooleanField {
  key: string
  kind: 'boolean'
  label: string
  default?: boolean
  trueLabel?: string
  falseLabel?: string
}

export type MasterDataField = MasterDataTextField | MasterDataBooleanField

export interface MasterDataEntity {
  id: string
  [key: string]: unknown
}

export interface MasterDataDeleteCallbacks {
  closeAlert: () => void
  setLoading: (state: boolean) => void
}

export interface MasterDataConfig<T extends MasterDataEntity> {
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
    create: (payload: Record<string, unknown>) => Promise<boolean>
    update: (id: string, payload: Record<string, unknown>) => Promise<boolean>
    remove: (
      id: string,
      callbacks: MasterDataDeleteCallbacks,
    ) => Promise<boolean>
  }
  fields: MasterDataField[]
}
