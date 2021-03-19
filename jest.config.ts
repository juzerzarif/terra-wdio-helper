import type { Config } from '@jest/types';

export default {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    // Svelte coverage is funky until mihar-22/svelte-jester #33 is fixed
    // 'src/**/*.svelte'
  ],
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
  moduleFileExtensions: ['js', 'ts', 'svelte'],
  moduleNameMapper: {
    '\\.html$': '<rootDir>/__mocks__/htmlMock.ts',
  },
  preset: 'ts-jest',
  roots: [process.cwd()],
  setupFiles: ['mutationobserver-shim', './jest-setup/resize-observer.ts'],
  setupFilesAfterEnv: ['./jest-setup/expect.ts', './jest-setup/vscode-api.ts'],
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.ts'],
  transform: {
    '^.+\\.svelte$': ['svelte-jester', { preprocess: true }],
    '^.+\\.ts$': 'ts-jest',
  },
} as Config.InitialOptions;
