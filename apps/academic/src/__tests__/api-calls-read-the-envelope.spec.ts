import { readFile } from 'node:fs/promises'
import { glob } from 'node:fs/promises'
import { join, sep } from 'node:path'
import { describe, it, expect, beforeAll } from 'vitest'

/**
 * Every response is wrapped, so every call has to say so.
 *
 * The backend's global interceptor returns `{ statusCode, message, data, meta? }`
 * around everything. A call that types the body as the payload itself is a lie
 * the compiler then enforces: `res.data.items` reads a field the wrapper does
 * not have, `?? []` turns the undefined into an empty list, and the screen
 * renders its own empty state over a request that worked.
 *
 * That shipped twice in one day. The promotion screen's class filter had
 * nothing to offer because `getPromotionRecommendation` was typed as the
 * recommendation; the report-card detail dialog showed a dash for every figure
 * because `fetchRaporDetail` returned `res.data` and the type agreed. Neither
 * failed. Both looked like a screen waiting for input.
 *
 * This sweep is repo-wide rather than academic-only: the same `api` client is
 * used from every app and from `packages/`, and the defect does not care which.
 */

const ROOT = join(process.cwd(), '..', '..')
const SCAN = ['apps', 'packages']

/** The wrappers in `@241/shared`'s `types/api`, which describe the envelope. */
const ENVELOPES = [
  'ApiSingleResponse',
  'ApiPaginatedResponse',
  'ApiEnvelope',
  'ApiListResponse',
]

/**
 * Bodies that are not enveloped and are not meant to be.
 *
 * `void` throws the response away. A binary download leaves as a
 * `StreamableFile`, which the interceptor returns untouched — see
 * `response.interceptor.ts`.
 */
const UNWRAPPED = ['void', 'ArrayBuffer', 'Blob']

function code(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
}

/**
 * Reads the generic argument of `api.get<...>` by matching angle brackets,
 * because plenty of them span several lines and a line-wise regex reported
 * every one of those as a violation.
 */
export function apiCallGenerics(source: string): string[] {
  const found: string[] = []
  const opener = /\bapi\.(get|post|patch|put|delete)\s*</g

  let match: RegExpExecArray | null
  while ((match = opener.exec(source)) !== null) {
    let depth = 1
    let i = match.index + match[0].length
    const start = i

    while (i < source.length && depth > 0) {
      if (source[i] === '<') depth++
      else if (source[i] === '>') depth--
      i++
    }

    if (depth === 0) found.push(source.slice(start, i - 1).trim())
  }

  return found
}

export function isEnveloped(generic: string): boolean {
  const t = generic.trim()
  if (UNWRAPPED.includes(t)) return true
  if (ENVELOPES.some((name) => t.startsWith(`${name}<`))) return true
  // `{ data: ... }` written inline is the envelope spelled out rather than
  // named — the shape is what matters, so it passes.
  return /^\{\s*data\s*[:?]/.test(t)
}

describe('every API call reads the envelope it is sent', () => {
  let files: { path: string; text: string }[]

  // Reading a few hundred files is legitimately slow, and slower still when
  // the root `pnpm test` runs six vitest processes against one Windows disk.
  // The default ten seconds is enough alone and not enough alongside, which is
  // a sweep that fails for being busy rather than for finding anything.
  beforeAll(async () => {
    const found: { path: string; text: string }[] = []
    for (const dir of SCAN) {
      for await (const entry of glob(`*/src/**/*.{ts,vue}`, {
        cwd: join(ROOT, dir),
      })) {
        const path = [dir, ...entry.split(sep)].join('/')
        if (path.includes('__tests__') || path.endsWith('.spec.ts')) continue
        found.push({
          path,
          text: code(await readFile(join(ROOT, dir, entry), 'utf8')),
        })
      }
    }
    files = found
  }, 60_000)

  it('finds the call sites', () => {
    const total = files.reduce((n, f) => n + apiCallGenerics(f.text).length, 0)
    expect(total).toBeGreaterThan(200)
  })

  it('never types a response body as the payload itself', () => {
    const offenders: string[] = []

    for (const file of files) {
      for (const generic of apiCallGenerics(file.text)) {
        if (!isEnveloped(generic)) {
          offenders.push(`${file.path}: api.<verb><${generic}>`)
        }
      }
    }

    expect(offenders.sort()).toEqual([])
  })

  /**
   * Guards the guard. A matcher that found nothing would pass the assertion
   * above while checking nothing, so assert it still recognises the exact
   * shapes that shipped — and does not flag the ones that were fine.
   */
  describe('the matcher itself', () => {
    it('flags the two that shipped', () => {
      expect(isEnveloped('PromotionRecommendationResponse')).toBe(false)
      expect(isEnveloped('RaporDetailData')).toBe(false)
    })

    it('accepts the wrappers, a discarded body, and a download', () => {
      expect(isEnveloped('ApiSingleResponse<Semester>')).toBe(true)
      expect(isEnveloped('ApiPaginatedResponse<Student>')).toBe(true)
      expect(isEnveloped('void')).toBe(true)
      expect(isEnveloped('ArrayBuffer')).toBe(true)
    })

    it('accepts the envelope written out instead of named', () => {
      expect(isEnveloped('{ data: EmploymentTypeOption[] }')).toBe(true)
    })

    it('reads a generic that spans several lines', () => {
      const wrapped = `api.get<
        ApiSingleResponse<{ id: string }>
      >('/roles')`

      expect(apiCallGenerics(wrapped)).toEqual([
        'ApiSingleResponse<{ id: string }>',
      ])
    })

    it('is not fooled by the nested angle brackets inside one', () => {
      const nested = `api.get<ApiPaginatedResponse<Map<string, number>>>('/x')`
      expect(apiCallGenerics(nested)).toEqual([
        'ApiPaginatedResponse<Map<string, number>>',
      ])
    })
  })
})
