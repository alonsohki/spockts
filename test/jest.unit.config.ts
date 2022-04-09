import type { Config } from '@jest/types';
import getBaseConfig from './jest.config';

export default async (): Promise<Config.InitialOptions> => {
  const baseConfig = await getBaseConfig();

  return {
    ...baseConfig,
    globals: {
      'ts-jest': {
        ...(baseConfig.globals['ts-jest'] as {}),
        tsconfig: '<rootDir>/test/tsconfig.unit.json',
      },
    },
    testMatch: ['<rootDir>/test/unit/**/*.test.ts'],
  };
};
