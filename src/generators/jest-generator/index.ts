import ts from 'typescript';
import { Generator } from '..';
import { ProcessorOutput } from 'src/processor/output';
import { beforeAll } from './before-all';

const generator: Generator = (context: ts.TransformationContext, input: ProcessorOutput): ts.Node => {
  const factory = context.factory;

  const root = factory.createBlock([...input.setup.declarations, beforeAll(context, input.setup.async, input.setup.statements)], true);
  return root;
};

export default generator;
