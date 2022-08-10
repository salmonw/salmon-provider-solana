/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|ts)$': 'babel-jest',
  },
  moduleDirectories: ['node_modules', 'src'],
  collectCoverage: false,
  collectCoverageFrom: ['**/*.{js,ts}', '!**/*.d.ts'],
  testTimeout: 240000,
};
