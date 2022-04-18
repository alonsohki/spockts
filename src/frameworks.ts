export type Framework = 'jest';

const knownFrameworks: { [K in Framework]: true } & { [K in string]: boolean } = {
  jest: true,
};

export const isKnownFramework = (framework: string): framework is Framework => !!knownFrameworks[framework];

export const getKnownFrameworks = (): Framework[] => Object.keys(knownFrameworks) as Framework[];

export const getDefaultFramework = (): Framework => 'jest';
