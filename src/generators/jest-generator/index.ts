import ts from 'typescript';
import { Generator } from '..';
import { ProcessorOutput, WhenThenBlock } from '../../processor/output';
import { beforeAll } from './before-all';
import { describe } from './describe';
import { expectCondition } from './expect-condition';

const mapWhenThen = (context: ts.TransformationContext, whenThen: WhenThenBlock): ts.Block => {
  const factory = context.factory;
  return factory.createBlock(
    [
      ...(whenThen.when.statements.length > 0 ? [beforeAll(context, whenThen.when.async, [...whenThen.when.statements])] : []),
      ...whenThen.then.map((then) => expectCondition(context, then)),
    ],
    true
  );
};

const generator: Generator = (context: ts.TransformationContext, input: ProcessorOutput): ts.Node => {
  const factory = context.factory;

  const root = factory.createBlock(
    [
      ...input.setup.declarations,
      ...input.whenThen.flatMap((whenThen) => whenThen.when.declarations),

      ...(input.setup.statements.length > 0 ? [beforeAll(context, input.setup.async, input.setup.statements)] : []),

      ...input.whenThen.map((whenThen) => describe(context, factory.createStringLiteral(''), mapWhenThen(context, whenThen))),
    ],
    true
  );
  return root;
};

export default generator;
