import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => {
  return {
    preset: 'ts-jest',
    testEnvironment: 'node',
    globals: {
      'ts-jest': {
        compiler: 'ttypescript',
      },
    },
    verbose: true,

    rootDir: '..',
  };
};
