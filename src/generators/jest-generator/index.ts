import ts from 'typescript';
import { Generator } from '..';
import { ProcessorOutput } from '../../processor/output';
import { beforeAll } from './before-all';
import { whenThen } from './when-then';

const generator: Generator = (context: ts.TransformationContext, input: ProcessorOutput): ts.Node => {
  const factory = context.factory;

  const root = factory.createBlock(
    [
      ...input.setup.declarations,
      ...(input.setup.statements.length > 0 ? [beforeAll(context, input.setup.async, input.setup.statements)] : []),
      ...whenThen(context, input.whenThen),
    ],
    true
  );
  return root;
};

export default generator;
