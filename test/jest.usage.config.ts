import type { Config } from '@jest/types';
import getBaseConfig from './jest.config';

export default async (): Promise<Config.InitialOptions> => {
  const baseConfig = await getBaseConfig();

  return {
    ...baseConfig,
    globals: {
      'ts-jest': {
        compiler: 'ttypescript',
        tsconfig: '<rootDir>/test/tsconfig.usage.json',
      },
    },
    cache: false,
    testMatch: ['<rootDir>/test/usage/**/*.ts'],
  };
};
