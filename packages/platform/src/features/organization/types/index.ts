import type { Component } from 'vue'
import type { SchoolUnitProfile } from '../../school-unit/types'

export interface Organization {
  id?: string
  name: string
  code: string
  email: string | null
  phoneNumber: string | null
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  schoolUnits?: SchoolUnitProfile[]
}

export interface DisplayItem {
  label: string
  value: string
  icon?: Component
  href?: string
}
