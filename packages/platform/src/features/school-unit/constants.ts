import type {
  SchoolUnitAddress,
  SchoolUnitProfile,
  SchoolUnitStatus,
} from './types'

export const EMPTY_SCHOOL_UNIT: SchoolUnitProfile = {
  name: '',
  surname: '',
  nsm: '',
  npsn: '',
  status: 'PUBLIC',
  typeId: null,
  type: null,
  npwp: '',
  phone: '',
  email: '',
  website: '',
}

export const EMPTY_ADDRESS: SchoolUnitAddress = {
  street: '',
  rt: '',
  rw: '',
  village: '',
  district: '',
  city: '',
  province: '',
  country: 'Indonesia',
  postalCode: '',
}

export const breadcrumbs = [{ title: 'Unit Sekolah', href: '/school-unit' }]

export const editBreadcrumbs = [
  { title: 'Unit Sekolah', href: '/school-unit' },
  { title: 'Ubah Data', href: '/school-unit/edit' },
]

export const statusOptions: { value: SchoolUnitStatus; label: string }[] = [
  { value: 'PUBLIC', label: 'Negeri' },
  { value: 'PRIVATE', label: 'Swasta' },
]
