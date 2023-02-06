// eslint-disable-next-line @typescript-eslint/no-var-requires
var path = require('path');

module.exports = {
  extends: ['plugin:@typescript-eslint/recommended'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: path.join(__dirname, 'tsconfig.json'),
      },
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/ban-types': ['error', { extendDefaults: true, types: { '{}': false } }],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' }],
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  plugins: ['@typescript-eslint', 'import'],
  root: true,
  rules: {
    'import/no-anonymous-default-export': 'off',
    'no-console': ['warn', { allow: ['error'] }],
    'no-console': ['warn', { allow: ['error'] }],
    'no-extra-boolean-cast': ['error', { enforceForLogicalOperands: true }],
    'no-extra-boolean-cast': ['error', { enforceForLogicalOperands: true }],
    'no-implicit-coercion': ['error', {}],
    'no-implicit-coercion': ['error', {}],
    'no-restricted-syntax': [
      'error',
      { message: 'Switch cases without blocks are disallowed.', selector: 'SwitchCase > *.consequent[type!="BlockStatement"]' },
    ],
    'no-restricted-syntax': [
      'error',
      { message: 'Switch cases without blocks are disallowed.', selector: 'SwitchCase > *.consequent[type!="BlockStatement"]' },
    ],
    'object-shorthand': 'warn',
    'object-shorthand': 'warn',
    'require-await': 'warn',
  },
};
