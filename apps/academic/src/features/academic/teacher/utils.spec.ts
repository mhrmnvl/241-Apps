import { describe, it, expect } from 'vitest'
import {
  buildTeacherCreatePayload,
  buildTeacherUpdatePayload,
  resolvePositionChange,
} from './utils'

describe('buildTeacherCreatePayload', () => {
  it('maps form values into a create payload, using nip as identifier/password when present', () => {
    const payload = buildTeacherCreatePayload({
      name: 'Budi',
      nik: '1234567890123456',
      gender: 'MALE',
      birthPlace: 'Bandung',
      birthDate: '1990-01-01',
      employmentTypeId: 'et-1',
      positionId: 'pos-1',
      nip: '987654321',
      nuptk: '',
      email: '',
      phone: '',
    })

    expect(payload).toEqual({
      name: 'Budi',
      nik: '1234567890123456',
      gender: 'MALE',
      birthPlace: 'Bandung',
      birthDate: '1990-01-01',
      employmentTypeId: 'et-1',
      positionId: 'pos-1',
      identifier: '987654321',
      password: '987654321',
      email: undefined,
      phone: undefined,
      nip: '987654321',
      nuptk: undefined,
    })
  })

  it('falls back to nik as identifier/password when nip is empty', () => {
    const payload = buildTeacherCreatePayload({
      name: 'Budi',
      nik: '1234567890123456',
      gender: 'MALE',
      birthPlace: 'Bandung',
      birthDate: '1990-01-01',
      employmentTypeId: 'et-1',
      positionId: '',
      nip: '',
      nuptk: '',
    })

    expect(payload.identifier).toBe('1234567890123456')
    expect(payload.password).toBe('1234567890123456')
    expect(payload.positionId).toBeUndefined()
  })
})

describe('buildTeacherUpdatePayload', () => {
  it('maps only nip/nuptk/employmentTypeId', () => {
    const payload = buildTeacherUpdatePayload({
      nip: '111',
      nuptk: '',
      employmentTypeId: 'et-2',
      name: 'ignored',
    })

    expect(payload).toEqual({
      nip: '111',
      nuptk: undefined,
      employmentTypeId: 'et-2',
    })
  })
})

describe('resolvePositionChange', () => {
  it('returns null when the position did not change', () => {
    expect(resolvePositionChange('t-1', 'pos-1', 'pos-1', 'link-1')).toBeNull()
  })

  it('returns null when there is no new position selected', () => {
    expect(resolvePositionChange('t-1', '', 'pos-1', 'link-1')).toBeNull()
  })

  it('returns null when there is no teacher id (create flow)', () => {
    expect(
      resolvePositionChange(undefined, 'pos-2', 'pos-1', 'link-1'),
    ).toBeNull()
  })

  it('returns the change details when the position changed', () => {
    expect(resolvePositionChange('t-1', 'pos-2', 'pos-1', 'link-1')).toEqual({
      teacherId: 't-1',
      positionId: 'pos-2',
      oldPositionLinkId: 'link-1',
    })
  })
})
