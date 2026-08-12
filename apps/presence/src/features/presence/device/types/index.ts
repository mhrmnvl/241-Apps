export interface GateDevice {
  id: string
  name: string
  location?: string | null
  isActive: boolean
  lastSeenAt?: string | null
  tokenIssuedAt: string
}

export interface DeviceWithToken {
  device: GateDevice
  /** Shown once. Only its hash is stored server-side. */
  token: string
}

export interface RegisterDevicePayload {
  name: string
  location?: string
}
