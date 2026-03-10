import tseslint from 'typescript-eslint';

export default tseslint.config({
  files: ['**/*.ts', '**/*.tsx'],
  ignores: ['node_modules', 'dist', 'build', '.changeset'],
  languageOptions: {
    parserOptions: {
      sourceType: 'module',
    },
  },
  rules: {
    'no-console': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
});
