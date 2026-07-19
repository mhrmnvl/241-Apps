export interface StructureFormValues {
  supervisorId: string
  presidentId: string
  vicePresidentId: string
  secretaryId: string
  treasurerId: string
}

export interface PopoverState {
  open: boolean
}

export interface PopoverStates {
  supervisorId: PopoverState
  presidentId: PopoverState
  vicePresidentId: PopoverState
  secretaryId: PopoverState
  treasurerId: PopoverState
}
