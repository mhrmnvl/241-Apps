import { describe, it, expect } from 'vitest'
import type { AdmissionApplication } from '../types'
import { useApplicationFormState } from './useApplicationFormState'

function makeApplication(
  overrides: Partial<AdmissionApplication> = {},
): AdmissionApplication {
  return {
    id: 'app-1',
    userId: 'user-1',
    waveId: 'wave-1',
    registrationNumber: 'REG-001',
    status: 'DRAFT',
    fullName: 'Budi',
    nickname: null,
    gender: null,
    birthPlace: null,
    birthDate: null,
    nik: null,
    nisn: null,
    religionId: null,
    phone: null,
    email: null,
    childOrder: null,
    siblingCount: null,
    street: null,
    rt: null,
    rw: null,
    village: null,
    district: null,
    city: null,
    province: null,
    postalCode: null,
    previousSchoolName: null,
    previousSchoolNpsn: null,
    previousSchoolAddress: null,
    graduationYear: null,
    submittedAt: null,
    revisionNote: null,
    verifiedAt: null,
    decidedAt: null,
    decisionNote: null,
    enrolledAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    wave: {
      id: 'wave-1',
      name: 'Gelombang 1',
      code: 'W1',
      startDate: '2026-01-01',
      endDate: '2026-02-01',
      quota: 100,
      registrationFee: 100000,
    },
    parents: [],
    documents: [],
    payment: null,
    ...overrides,
  }
}

describe('useApplicationFormState', () => {
  it('hydrate fills personal/address/school from the application', () => {
    const { personal, address, school, hydrate } = useApplicationFormState()

    hydrate(
      makeApplication({
        fullName: 'Budi Santoso',
        birthDate: '2010-05-01T00:00:00.000Z',
        street: 'Jl. Merdeka',
        previousSchoolName: 'SD Negeri 1',
        graduationYear: 2023,
      }),
    )

    expect(personal.value.fullName).toBe('Budi Santoso')
    expect(personal.value.birthDate).toBe('2010-05-01')
    expect(address.value.street).toBe('Jl. Merdeka')
    expect(school.value.previousSchoolName).toBe('SD Negeri 1')
    expect(school.value.graduationYear).toBe('2023')
  })

  it('hydrate seeds a default FATHER parent when the application has none', () => {
    const { parents, hydrate } = useApplicationFormState()

    hydrate(makeApplication({ parents: [] }))

    expect(parents.value).toEqual([
      {
        relation: 'FATHER',
        name: '',
        nik: '',
        birthPlace: '',
        birthDate: '',
        phone: '',
        isPrimary: true,
      },
    ])
  })

  it('hydrate maps existing parents as-is without seeding a default', () => {
    const { parents, hydrate } = useApplicationFormState()

    hydrate(
      makeApplication({
        parents: [
          {
            relation: 'MOTHER',
            name: 'Siti',
            isPrimary: true,
            nik: null,
            birthPlace: null,
            birthDate: null,
            phone: null,
          },
        ],
      }),
    )

    expect(parents.value).toEqual([
      {
        relation: 'MOTHER',
        name: 'Siti',
        nik: '',
        birthPlace: '',
        birthDate: '',
        phone: '',
        isPrimary: true,
      },
    ])
  })

  it('hydrate only overwrites payment fields when payment is present', () => {
    const { payment, hydrate } = useApplicationFormState()

    hydrate(makeApplication({ payment: null }))
    expect(payment.value).toEqual({
      bankName: '',
      senderAccountName: '',
      transferDate: '',
    })

    hydrate(
      makeApplication({
        payment: {
          id: 'pay-1',
          applicationId: 'app-1',
          amount: 100000,
          bankName: 'BSI',
          senderAccountName: 'Budi',
          transferDate: '2026-01-05T00:00:00.000Z',
          proofFileId: null,
          status: 'PENDING',
          note: null,
          proofFile: null,
        },
      }),
    )
    expect(payment.value).toEqual({
      bankName: 'BSI',
      senderAccountName: 'Budi',
      transferDate: '2026-01-05',
    })
  })

  it('addParent alternates between FATHER and MOTHER, marking the first as primary', () => {
    const { parents, addParent } = useApplicationFormState()

    addParent()
    expect(parents.value[0]).toMatchObject({
      relation: 'FATHER',
      isPrimary: true,
    })

    addParent()
    expect(parents.value[1]).toMatchObject({
      relation: 'MOTHER',
      isPrimary: false,
    })
  })

  it('removeParent removes the parent at the given index', () => {
    const { parents, addParent, removeParent } = useApplicationFormState()
    addParent()
    addParent()

    removeParent(0)

    expect(parents.value).toHaveLength(1)
    expect(parents.value[0]?.relation).toBe('MOTHER')
  })

  describe('buildStepPayload', () => {
    it('builds the personal-data payload for step 0, omitting empty fields', () => {
      const { personal, buildStepPayload } = useApplicationFormState()
      personal.value.fullName = 'Budi'

      expect(buildStepPayload(0)).toEqual({
        fullName: 'Budi',
        nickname: undefined,
        gender: undefined,
        birthPlace: undefined,
        birthDate: undefined,
        nik: undefined,
        nisn: undefined,
        phone: undefined,
      })
    })

    it('builds the parents payload for step 1, dropping parents without a name', () => {
      const { parents, buildStepPayload } = useApplicationFormState()
      parents.value = [
        {
          relation: 'FATHER',
          name: 'Budi',
          nik: '123',
          birthPlace: '',
          birthDate: '',
          phone: '',
          isPrimary: true,
        },
        {
          relation: 'MOTHER',
          name: '',
          nik: '',
          birthPlace: '',
          birthDate: '',
          phone: '',
          isPrimary: false,
        },
      ]

      const payload = buildStepPayload(1) as { parents: unknown[] }
      expect(payload.parents).toHaveLength(1)
    })

    it('builds the address payload for step 2', () => {
      const { address, buildStepPayload } = useApplicationFormState()
      address.value.city = 'Bandung'

      const payload = buildStepPayload(2)!
      expect(payload.city).toBe('Bandung')
      expect(payload.street).toBeUndefined()
    })

    it('builds the school payload for step 3, converting graduationYear to a number', () => {
      const { school, buildStepPayload } = useApplicationFormState()
      school.value.graduationYear = '2024'

      const payload = buildStepPayload(3)!
      expect(payload.graduationYear).toBe(2024)
    })

    it('returns null for steps with no dedicated payload', () => {
      const { buildStepPayload } = useApplicationFormState()
      expect(buildStepPayload(4)).toBeNull()
      expect(buildStepPayload(5)).toBeNull()
      expect(buildStepPayload(6)).toBeNull()
    })
  })
})
