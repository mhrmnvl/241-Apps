#!/usr/bin/env node
/**
 * SC-001 and SC-002, measured rather than assumed. (tasks.md T209)
 *
 * SC-002 asks that one gate device sustain **at least 20 accepted scans per
 * minute**, and SC-001 that each scan be confirmed **within 2 seconds**. Both
 * are claims about a deployment under load, so neither can be settled by a unit
 * test — this is the executable form of that quickstart step.
 *
 * What it does: replays real card codes through `POST /presence/scans` at a
 * fixed rate, as a real device would, and reports throughput and the latency
 * distribution. It measures the server; it does not simulate the scanner's
 * keyboard-wedge input.
 *
 * Usage:
 *
 *   node specs/002-qr-attendance-payroll/load-check.mjs \
 *     --url http://localhost:3000 \
 *     --token <device token from Perangkat Gerbang> \
 *     --codes codes.txt \
 *     --rate 20 --seconds 60
 *
 * `codes.txt` is one card code per line. Take them from the credential list of
 * a **non-production** environment: this writes real attendance rows, and
 * running it against the school's live data would put a morning of fictional
 * arrivals on people's records.
 *
 * A second device is simulated by running a second copy with that device's own
 * token — SC-002's sizing assumption is two gates, and the two must be measured
 * as two clients rather than as one client at double the rate.
 */

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .map((part, index, all) =>
      part.startsWith('--') ? [part.slice(2), all[index + 1]] : null,
    )
    .filter(Boolean),
)

const BASE_URL = args.url ?? 'http://localhost:3000'
const TOKEN = args.token
const RATE = Number(args.rate ?? 20)
const SECONDS = Number(args.seconds ?? 60)
const CODES_FILE = args.codes

if (!TOKEN || !CODES_FILE) {
  console.error(
    'Missing --token or --codes. See the header of this file for usage.',
  )
  process.exit(1)
}

const { readFile } = await import('node:fs/promises')
const codes = (await readFile(CODES_FILE, 'utf8'))
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)

if (codes.length === 0) {
  console.error(`${CODES_FILE} holds no codes.`)
  process.exit(1)
}

/**
 * A distinct `clientEventId` per attempt.
 *
 * Reusing one would be absorbed by the idempotency constraint and the run would
 * measure the duplicate path instead of the scan path — flattering and wrong.
 */
function newEventId() {
  return crypto.randomUUID()
}

const latencies = []
const outcomes = new Map()
let failures = 0

async function scanOnce(code) {
  const startedAt = performance.now()

  try {
    const response = await fetch(`${BASE_URL}/presence/scans`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ code, clientEventId: newEventId() }),
    })

    const elapsed = performance.now() - startedAt
    latencies.push(elapsed)

    if (!response.ok) {
      failures++
      outcomes.set(
        `HTTP ${response.status}`,
        (outcomes.get(`HTTP ${response.status}`) ?? 0) + 1,
      )
      return
    }

    const body = await response.json()
    const outcome = body?.data?.outcome ?? 'UNKNOWN'
    outcomes.set(outcome, (outcomes.get(outcome) ?? 0) + 1)
  } catch (error) {
    failures++
    latencies.push(performance.now() - startedAt)
    outcomes.set('TRANSPORT', (outcomes.get('TRANSPORT') ?? 0) + 1)
    if (failures === 1) console.error('First transport failure:', error.message)
  }
}

function percentile(sorted, fraction) {
  if (sorted.length === 0) return 0
  const index = Math.min(
    sorted.length - 1,
    Math.floor(sorted.length * fraction),
  )
  return sorted[index]
}

console.log(
  `Scanning ${RATE}/min for ${SECONDS}s against ${BASE_URL} (${codes.length} codes)…`,
)

const intervalMs = 60_000 / RATE
const startedAt = Date.now()
const inFlight = []
let issued = 0

while (Date.now() - startedAt < SECONDS * 1000) {
  inFlight.push(scanOnce(codes[issued % codes.length]))
  issued++
  await new Promise((resolve) => setTimeout(resolve, intervalMs))
}

await Promise.all(inFlight)

const elapsedMinutes = (Date.now() - startedAt) / 60_000
const sorted = [...latencies].sort((a, b) => a - b)
const accepted =
  (outcomes.get('ACCEPTED') ?? 0) + (outcomes.get('DUPLICATE') ?? 0)
const perMinute = accepted / elapsedMinutes
const p95 = percentile(sorted, 0.95)

console.log('\n--- Results ---')
console.log(`Issued:            ${issued}`)
console.log(`Accepted:          ${accepted}`)
console.log(`Accepted / minute: ${perMinute.toFixed(1)}   (SC-002 needs ≥ 20)`)
console.log(`Latency p50:       ${percentile(sorted, 0.5).toFixed(0)} ms`)
console.log(`Latency p95:       ${p95.toFixed(0)} ms   (SC-001 needs < 2000)`)
console.log(`Latency max:       ${(sorted.at(-1) ?? 0).toFixed(0)} ms`)
console.log('Outcomes:', Object.fromEntries(outcomes))

const meetsThroughput = perMinute >= 20
const meetsLatency = p95 < 2000

console.log(
  `\nSC-002 ${meetsThroughput ? 'PASS' : 'FAIL'} · SC-001 ${meetsLatency ? 'PASS' : 'FAIL'}`,
)

// A non-zero exit so this can gate a release rather than merely inform one.
process.exit(meetsThroughput && meetsLatency ? 0 : 1)
