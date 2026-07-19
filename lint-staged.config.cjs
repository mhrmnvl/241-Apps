const quote = (f) => `"${f}"`

// Files under the backend workspace are linted by the backend's own ESLint
// config, not the root (frontend) one. Exclude them from the root eslint task
// (they still get prettier). The regex is case-insensitive so it is robust to
// Windows path-casing differences between git and the ESLint cwd.
const isBackend = (f) => /[\\/]backend[\\/]/i.test(f)

module.exports = {
  '*.{ts,vue}': (files) => {
    const frontend = files.filter((f) => !isBackend(f))
    const tasks = []
    if (frontend.length > 0) {
      tasks.push(
        `eslint --fix --no-warn-ignored --max-warnings=0 ${frontend.map(quote).join(' ')}`,
      )
    }
    tasks.push(`prettier --write ${files.map(quote).join(' ')}`)
    return tasks
  },
  '*.{js,cjs,mjs}': [
    'eslint --fix --no-warn-ignored --max-warnings=0',
    'prettier --write',
  ],
  '*.{json,md,yml,yaml,css,scss,html}': ['prettier --write'],
}
