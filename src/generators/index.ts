import { ProcessorOutput } from 'src/processor/output';
import ts from 'typescript';
import { Framework } from '../frameworks';

import jest from './jest-generator';

export type Generator = {
  (context: ts.TransformationContext, input: ProcessorOutput, node: ts.Node): ts.Node;
};

type GeneratorRecord = { [K in Framework]: Generator };

const generators: GeneratorRecord = {
  jest,
};

const wrap = (record: GeneratorRecord): GeneratorRecord =>
  Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, (context, input, node) => input && value(context, input, node)])
  ) as GeneratorRecord;

export default wrap(generators);
