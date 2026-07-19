module.exports = {
  '*.{ts,vue}': ['eslint --fix --no-warn-ignored --max-warnings=0', 'prettier --write'],
  '*.{js,cjs,mjs}': ['eslint --fix --no-warn-ignored --max-warnings=0', 'prettier --write'],
  '*.{json,md,yml,yaml,css,scss,html}': ['prettier --write'],
}
