import ts from 'typescript';
import { Framework } from '../frameworks';
import { State } from '../processor/state';

import jest from './jest-generator';

export type GeneratorInput = {
  title: ts.StringLiteral;
  state: State;
};

export type Generator = {
  (context: ts.TransformationContext, input: GeneratorInput): ts.Node;
};

type GeneratorRecord = { [K in Framework]: Generator };

const generators: GeneratorRecord = {
  jest,
};

const wrap = (record: GeneratorRecord): GeneratorRecord =>
  Object.fromEntries(Object.entries(record).map(([key, value]) => [key, (context, input) => input && value(context, input)])) as GeneratorRecord;

export default wrap(generators);
