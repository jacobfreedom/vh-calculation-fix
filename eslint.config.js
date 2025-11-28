import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.{ts,js}'],
    languageOptions: {
      parser: tsParser,
      sourceType: 'module'
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn'
    }
  }
];

