import ts from 'typescript';
import Frameworks from '~/frameworks';
import { State } from '~/state';

import jest from './jest-generator';

export type GeneratorInput = State;

export type Generator = {
  (context: ts.TransformationContext, title: ts.StringLiteral, input: GeneratorInput): ts.Node;
};

const generators: { [K in Frameworks]: Generator } = {
  jest,
};

export default generators;
