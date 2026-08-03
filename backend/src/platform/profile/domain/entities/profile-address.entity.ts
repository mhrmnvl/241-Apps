/** Address projection returned to profile consumers (ownership columns omitted). */
export interface AddressPublic {
  id: string;
  street: string;
  rt?: string | null;
  rw?: string | null;
  village: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
}
