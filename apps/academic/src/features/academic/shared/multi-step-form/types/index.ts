export interface WizardStep {
  value: number
  title: string
}

export interface StepGate<TField = string> {
  fields: TField[]
  unlocksStep: number
}

export interface AddressFormState {
  street: string
  rt: string
  rw: string
  village: string
  district: string
  city: string
  province: string
  postalCode: string
  country: string
}
