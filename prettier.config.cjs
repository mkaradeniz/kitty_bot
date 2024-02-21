module.exports = {
  arrowParens: 'avoid',
  bracketSpacing: true,
  printWidth: 140,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  useTabs: false,

  plugins: ['@ianvs/prettier-plugin-sort-imports'],

  // * @ianvs/prettier-plugin-sort-imports config. See: https://github.com/IanVS/prettier-plugin-sort-imports#options
  importOrder: [
    '<BUILTIN_MODULES>',
    '<THIRD_PARTY_MODULES>',
    '',
    '^@(config)/(.*)$',
    '',
    '^@(db)/(.*)$',
    '^@(db-prisma)/(.*)$',
    '',
    '^@(command)/(.*)$',
    '^@(message)/(.*)$',
    '^@(middleware)/(.*)$',
    '',
    '^@(utils)/(.*)$',
    '',
    '^@(app-types)/(.*)$',
    '',
    '^[.]',
  ],
  importOrderTypeScriptVersion: '5.0.0',
};
