/**
 * Minimal, dependency-light lint config. We keep rules focused on catching
 * real bugs rather than enforcing stylistic preferences that .editorconfig
 * and human review already handle.
 */

export default [
  {
    files: ['packages/*/src/**/*.js', 'packages/*/bin/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      eqeqeq: ['warn', 'smart'],
      'prefer-const': 'warn',
    },
  },
];
