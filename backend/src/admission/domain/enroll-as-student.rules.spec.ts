import {
  isEligibleAdmissionParent,
  hasCompleteAddress,
} from './enroll-as-student.rules.js';

describe('isEligibleAdmissionParent', () => {
  it('returns true when nik, birthPlace, birthDate, and occupationId are all present', () => {
    expect(
      isEligibleAdmissionParent({
        nik: '1234567890123456',
        birthPlace: 'Bandung',
        birthDate: new Date('1980-01-01'),
        occupationId: 'occ-1',
      }),
    ).toBe(true);
  });

  it.each([
    [
      'nik',
      {
        nik: null,
        birthPlace: 'Bandung',
        birthDate: new Date(),
        occupationId: 'occ-1',
      },
    ],
    [
      'birthPlace',
      {
        nik: '123',
        birthPlace: null,
        birthDate: new Date(),
        occupationId: 'occ-1',
      },
    ],
    [
      'birthDate',
      {
        nik: '123',
        birthPlace: 'Bandung',
        birthDate: null,
        occupationId: 'occ-1',
      },
    ],
    [
      'occupationId',
      {
        nik: '123',
        birthPlace: 'Bandung',
        birthDate: new Date(),
        occupationId: null,
      },
    ],
  ])('returns false when %s is missing', (_field, parent) => {
    expect(isEligibleAdmissionParent(parent)).toBe(false);
  });
});

describe('hasCompleteAddress', () => {
  const completeAddress = {
    street: 'Jl. Merdeka',
    rt: '001',
    rw: '002',
    village: 'Sukamaju',
    district: 'Cibeunying',
    city: 'Bandung',
    province: 'Jawa Barat',
  };

  it('returns true when every required field is present (postalCode not required)', () => {
    expect(hasCompleteAddress(completeAddress)).toBe(true);
  });

  it.each(Object.keys(completeAddress))(
    'returns false when %s is missing',
    (field) => {
      expect(hasCompleteAddress({ ...completeAddress, [field]: null })).toBe(
        false,
      );
    },
  );
});
