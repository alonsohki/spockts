import ts from 'typescript';
import Frameworks from '../frameworks';
import { State } from '../processor/state';

import jest from './jest-generator';

export type GeneratorInput = {
  title: ts.StringLiteral;
  state: State;
};

export type Generator = {
  (context: ts.TransformationContext, input: GeneratorInput): ts.Node;
};

const generators: { [K in Frameworks]: Generator } = {
  jest,
};

export default generators;
