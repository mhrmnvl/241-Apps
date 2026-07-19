import type { Organization } from './types'

export const EMPTY_ORGANIZATION: Organization = {
  name: '',
  code: '',
  email: '',
  phoneNumber: '',
}

export const breadcrumbs = [
  { title: 'Dasbor', href: '/' },
  { title: 'Profil Yayasan', href: '/organization' },
]

export const editBreadcrumbs = [
  { title: 'Dasbor', href: '/' },
  { title: 'Profil Yayasan', href: '/organization' },
  { title: 'Ubah Data', href: '/organization/edit' },
]
