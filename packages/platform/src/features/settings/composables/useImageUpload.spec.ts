import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useImageUpload } from './useImageUpload'

function makeFile(name = 'logo.png'): File {
  return new File(['content'], name, { type: 'image/png' })
}

describe('useImageUpload', () => {
  let createObjectURL: ReturnType<typeof vi.fn>
  let revokeObjectURL: ReturnType<typeof vi.fn>

  beforeEach(() => {
    createObjectURL = vi.fn(() => 'blob:mock-url')
    revokeObjectURL = vi.fn()
    // Only the two statics are used, so only the two are stubbed. Extending
    // the real `URL` to hang them off it dragged its whole static side along —
    // `canParse`, `parse`, a `prototype` — and an anonymous subclass cannot
    // satisfy that, which is a type error about a class nobody is
    // instantiating.
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('selectFile stores the file and creates a preview URL', () => {
    const { file, previewUrl, selectFile } = useImageUpload(vi.fn())

    selectFile(makeFile())

    expect(file.value?.name).toBe('logo.png')
    expect(previewUrl.value).toBe('blob:mock-url')
  })

  it('selectFile revokes the previous preview URL before creating a new one', () => {
    const { selectFile } = useImageUpload(vi.fn())

    selectFile(makeFile('a.png'))
    selectFile(makeFile('b.png'))

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    expect(revokeObjectURL).toHaveBeenCalledTimes(1)
  })

  it('reset clears the file and revokes the preview URL', () => {
    const { file, previewUrl, selectFile, reset } = useImageUpload(vi.fn())

    selectFile(makeFile())
    reset()

    expect(file.value).toBeNull()
    expect(previewUrl.value).toBeNull()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('reset is a no-op when nothing was selected', () => {
    const { file, previewUrl, reset } = useImageUpload(vi.fn())

    reset()

    expect(file.value).toBeNull()
    expect(previewUrl.value).toBeNull()
    expect(revokeObjectURL).not.toHaveBeenCalled()
  })

  it('apply is a no-op when no file was selected', async () => {
    const upload = vi.fn()
    const { apply } = useImageUpload(upload)

    await apply()

    expect(upload).not.toHaveBeenCalled()
  })

  it('apply uploads the selected file and resets on success', async () => {
    const upload = vi.fn().mockResolvedValue(undefined)
    const { file, isUploading, selectFile, apply } = useImageUpload(upload)

    selectFile(makeFile())
    const applyPromise = apply()
    expect(isUploading.value).toBe(true)
    await applyPromise

    expect(upload).toHaveBeenCalledWith(expect.any(File))
    expect(file.value).toBeNull()
    expect(isUploading.value).toBe(false)
  })

  it('apply keeps the selected file and resets isUploading when upload fails', async () => {
    const upload = vi.fn().mockRejectedValue(new Error('boom'))
    const { file, isUploading, selectFile, apply } = useImageUpload(upload)

    selectFile(makeFile())
    await expect(apply()).rejects.toThrow('boom')

    expect(file.value).not.toBeNull()
    expect(isUploading.value).toBe(false)
  })
})
