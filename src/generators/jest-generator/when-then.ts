import ts from 'typescript';
import { WhenThenBlock } from '../../processor/output';
import { expectCondition } from './expect-condition';
import { beforeAll } from './before-all';
import { describe } from './describe';

const mapWhenThen = (context: ts.TransformationContext, whenThen: WhenThenBlock): ts.Block => {
  const factory = context.factory;

  const when = whenThen.when;
  const thenSetup = whenThen.then.setup;
  const conditions = whenThen.then.conditions;

  const async = when.async || thenSetup.async;

  return factory.createBlock(
    [
      ...(when.statements.length > 0 ? [beforeAll(context, async, [...when.statements, ...thenSetup.statements])] : []),
      ...conditions.map((then) => expectCondition(context, then)),
    ],
    true
  );
};

export const whenThen = (context: ts.TransformationContext, blocks: WhenThenBlock[]): ts.Statement[] => {
  const factory = context.factory;

  return [
    ...blocks.flatMap((whenThen) => [...whenThen.when.declarations, ...whenThen.then.setup.declarations]),
    ...blocks.map((whenThen) => describe(context, whenThen.title ?? factory.createStringLiteral(''), mapWhenThen(context, whenThen))),
  ];
};
