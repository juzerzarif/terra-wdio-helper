export default {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', 'src/**/*.svelte'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['src/types'],
  coverageReporters: ['json', 'html', 'text'],
  coverageThreshold: {
    global: {
      statements: -10,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
  moduleNameMapper: {
    '\\.html$': '<rootDir>/__mocks__/htmlMock.ts',
  },
  preset: 'ts-jest',
  roots: [process.cwd()],
  setupFiles: ['mutationobserver-shim'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.ts'],
};
