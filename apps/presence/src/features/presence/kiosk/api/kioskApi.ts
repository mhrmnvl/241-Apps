import axios from 'axios'
import type {
  BatchScanResult,
  ClockAnchor,
  QueuedScan,
  ScanResult,
} from '../types'

const API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:3000'
).replace(/\/+$/, '')

/**
 * The kiosk gets its own axios instance rather than the shared `@/shared/utils/api`.
 *
 * That client attaches the signed-in user's bearer token and silently refreshes
 * it on a 401. The kiosk has no user — it authenticates as a *device*, and
 * borrowing a staff session would attribute every scan to whoever logged in
 * that morning and leave a full-privilege session unattended at the gate
 * (research R7). No interceptors here on purpose: a 401 means the device token
 * is wrong, and the pairing screen is the only correct response.
 */
const deviceApi = axios.create({ baseURL: API_BASE_URL })

function auth(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export const kioskApi = {
  getClockAnchor: (token: string) =>
    deviceApi.get<{ data: ClockAnchor }>('/presence/scans/clock', auth(token)),

  scan: (token: string, payload: QueuedScan) =>
    deviceApi.post<{ data: ScanResult }>(
      '/presence/scans',
      payload,
      auth(token),
    ),

  flush: (token: string, scans: QueuedScan[]) =>
    deviceApi.post<{ data: BatchScanResult[] }>(
      '/presence/scans/batch',
      { scans },
      auth(token),
    ),
}
