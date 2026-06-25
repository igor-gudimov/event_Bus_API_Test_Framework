export default {
  testEnvironment: 'node',
  globalSetup: '<rootDir>/setup/globalSetup.js',
  globalTeardown: '<rootDir>/setup/globalTeardown.js',
  reporters: [
    'default',
    '<rootDir>/reporters/EventReporter.cjs',
  ],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  testTimeout: 15000,
  transform: {},
};
