import type { Component } from 'vue'

export type SchoolUnitStatus = 'PUBLIC' | 'PRIVATE'
export type SchoolUnitType = 'SMP' | 'SMPT' | 'MTS' | 'OTHER'
export interface SchoolUnitTypeObject {
  code: SchoolUnitType
}

export interface SchoolUnitProfile {
  id?: string
  name: string
  surname: string
  nsm: string
  npsn: string
  status: SchoolUnitStatus
  typeId?: string | null
  type?: {
    id: string
    code: string
    name: string
  } | null
  npwp: string
  phone: string
  email: string
  website: string
}

export interface SchoolUnitAddress {
  street: string
  rt: string
  rw: string
  village: string
  district: string
  city: string
  province: string
  country: string
  postalCode: string
  /**
   * Where this address is. A pin belongs to the place, not to the
   * institution — the school profile draws its map from the primary
   * address, and a school with no address has no pin to draw.
   */
  latitude?: number | null
  longitude?: number | null
}

export interface SchoolUnitApiResponse {
  id: string
  name: string
  surname?: string
  nsm?: string
  npsn?: string
  status?: string
  type?: string
  npwp?: string
  phone?: string
  email?: string
  website?: string
  createdAt: string
  updatedAt: string
}

export interface AddressApiResponse {
  id: string
  street: string
  rt: string
  rw: string
  village: string
  district: string
  city: string
  province: string
  country: string
  postalCode: string
  createdAt: string
  updatedAt: string
}

export interface DisplayItem {
  label: string
  value: string
  icon?: Component
  href?: string
}
