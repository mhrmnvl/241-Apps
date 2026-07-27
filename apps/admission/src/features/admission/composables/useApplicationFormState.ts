import { ref } from 'vue'
import type { AdmissionApplication, ParentRelation } from '../types'

export interface PersonalForm {
  fullName: string
  nickname: string
  gender: string
  birthPlace: string
  birthDate: string
  nik: string
  nisn: string
  phone: string
}

export interface ParentForm {
  relation: ParentRelation
  name: string
  nik: string
  birthPlace: string
  birthDate: string
  phone: string
  isPrimary: boolean
}

export interface AddressForm {
  street: string
  rt: string
  rw: string
  village: string
  district: string
  city: string
  province: string
  postalCode: string
}

export interface SchoolForm {
  previousSchoolName: string
  previousSchoolNpsn: string
  previousSchoolAddress: string
  graduationYear: string
}

export interface PaymentForm {
  bankName: string
  senderAccountName: string
  transferDate: string
}

export function useApplicationFormState() {
  const personal = ref<PersonalForm>({
    fullName: '',
    nickname: '',
    gender: '',
    birthPlace: '',
    birthDate: '',
    nik: '',
    nisn: '',
    phone: '',
  })

  const parents = ref<ParentForm[]>([])

  const address = ref<AddressForm>({
    street: '',
    rt: '',
    rw: '',
    village: '',
    district: '',
    city: '',
    province: '',
    postalCode: '',
  })

  const school = ref<SchoolForm>({
    previousSchoolName: '',
    previousSchoolNpsn: '',
    previousSchoolAddress: '',
    graduationYear: '',
  })

  const payment = ref<PaymentForm>({
    bankName: '',
    senderAccountName: '',
    transferDate: '',
  })

  function hydrate(app: AdmissionApplication) {
    personal.value = {
      fullName: app.fullName ?? '',
      nickname: app.nickname ?? '',
      gender: app.gender ?? '',
      birthPlace: app.birthPlace ?? '',
      birthDate: app.birthDate ? app.birthDate.slice(0, 10) : '',
      nik: app.nik ?? '',
      nisn: app.nisn ?? '',
      phone: app.phone ?? '',
    }
    parents.value = app.parents.map((p) => ({
      relation: p.relation,
      name: p.name,
      nik: p.nik ?? '',
      birthPlace: p.birthPlace ?? '',
      birthDate: p.birthDate ? p.birthDate.slice(0, 10) : '',
      phone: p.phone ?? '',
      isPrimary: p.isPrimary,
    }))
    if (parents.value.length === 0) {
      parents.value = [
        {
          relation: 'FATHER',
          name: '',
          nik: '',
          birthPlace: '',
          birthDate: '',
          phone: '',
          isPrimary: true,
        },
      ]
    }
    address.value = {
      street: app.street ?? '',
      rt: app.rt ?? '',
      rw: app.rw ?? '',
      village: app.village ?? '',
      district: app.district ?? '',
      city: app.city ?? '',
      province: app.province ?? '',
      postalCode: app.postalCode ?? '',
    }
    school.value = {
      previousSchoolName: app.previousSchoolName ?? '',
      previousSchoolNpsn: app.previousSchoolNpsn ?? '',
      previousSchoolAddress: app.previousSchoolAddress ?? '',
      graduationYear: app.graduationYear ? String(app.graduationYear) : '',
    }
    if (app.payment) {
      payment.value = {
        bankName: app.payment.bankName ?? '',
        senderAccountName: app.payment.senderAccountName ?? '',
        transferDate: app.payment.transferDate
          ? app.payment.transferDate.slice(0, 10)
          : '',
      }
    }
  }

  function addParent() {
    parents.value.push({
      relation: parents.value.some((p) => p.relation === 'FATHER')
        ? 'MOTHER'
        : 'FATHER',
      name: '',
      nik: '',
      birthPlace: '',
      birthDate: '',
      phone: '',
      isPrimary: parents.value.length === 0,
    })
  }

  function removeParent(index: number) {
    parents.value.splice(index, 1)
  }

  function buildStepPayload(step: number): Record<string, unknown> | null {
    if (step === 0) {
      return {
        fullName: personal.value.fullName || undefined,
        nickname: personal.value.nickname || undefined,
        gender: personal.value.gender || undefined,
        birthPlace: personal.value.birthPlace || undefined,
        birthDate: personal.value.birthDate || undefined,
        nik: personal.value.nik || undefined,
        nisn: personal.value.nisn || undefined,
        phone: personal.value.phone || undefined,
      }
    }
    if (step === 1) {
      const validParents = parents.value.filter((p) => p.name.trim())
      return {
        parents: validParents.map((p) => ({
          relation: p.relation,
          name: p.name.trim(),
          nik: p.nik || undefined,
          birthPlace: p.birthPlace || undefined,
          birthDate: p.birthDate || undefined,
          phone: p.phone || undefined,
          isPrimary: p.isPrimary,
        })),
      }
    }
    if (step === 2) {
      return {
        street: address.value.street || undefined,
        rt: address.value.rt || undefined,
        rw: address.value.rw || undefined,
        village: address.value.village || undefined,
        district: address.value.district || undefined,
        city: address.value.city || undefined,
        province: address.value.province || undefined,
        postalCode: address.value.postalCode || undefined,
      }
    }
    if (step === 3) {
      return {
        previousSchoolName: school.value.previousSchoolName || undefined,
        previousSchoolNpsn: school.value.previousSchoolNpsn || undefined,
        previousSchoolAddress: school.value.previousSchoolAddress || undefined,
        graduationYear: school.value.graduationYear
          ? Number(school.value.graduationYear)
          : undefined,
      }
    }
    return null
  }

  return {
    personal,
    parents,
    address,
    school,
    payment,
    hydrate,
    addParent,
    removeParent,
    buildStepPayload,
  }
}
