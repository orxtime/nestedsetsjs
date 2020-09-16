module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    mocha: true
  },
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint'
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parserOptions: {
    ecmaVersion: 6
  },
  rules: {
  }
}
