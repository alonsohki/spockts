import ts from 'typescript';
import { ProcessorOutput } from '../processor/output';

import jest from './jest';

export type Framework = 'jest';

export type Generator = {
  (context: ts.TransformationContext, input: ProcessorOutput, node: ts.Node): ts.Node;
};

export type ParserCallback = {
  (title: ts.StringLiteral, block: ts.Block, node: ts.Node): ts.Node | undefined;
};

export type Parser = {
  (sourceFile: ts.SourceFile, context: ts.TransformationContext, callback: ParserCallback): ts.SourceFile;
};

export type FrameworkSpec = {
  parser: Parser;
  generator: Generator;
};

const frameworkSpecs: { [K in Framework]: FrameworkSpec } = {
  jest,
};

export const isKnownFramework = (framework: string): framework is Framework => Object.keys(frameworkSpecs).includes(framework);

export const getKnownFrameworks = (): Framework[] => Object.keys(frameworkSpecs) as Framework[];

export const getDefaultFramework = (): Framework => 'jest';

export const getFrameworkSpec = (framework: Framework) => frameworkSpecs[framework];
