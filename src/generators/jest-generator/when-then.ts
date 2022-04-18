import ts from 'typescript';
import { WhenThenBlock } from '../../processor/output';
import { expectCondition } from './expect-condition';
import { afterAll } from './after-all';
import { beforeAll } from './before-all';
import { describe } from './describe';
import { checkUnhandledExceptions, declareTryCatch, wrapInTryCatch } from './try-catch';

const mapWhenThen = (context: ts.TransformationContext, whenThen: WhenThenBlock): ts.Block => {
  const factory = context.factory;

  const when = whenThen.when;
  const thenSetup = whenThen.then.setup;
  const conditions = whenThen.then.conditions;

  if (conditions.length === 0) {
    return factory.createBlock([], false);
  }

  const async = when.async || thenSetup.async;
  const beforeAllBody = [...(when.statements.length > 0 ? [wrapInTryCatch(context, when.statements)] : []), ...thenSetup.statements];
  const beforeAllStatements = beforeAllBody.length === 0 ? [] : [beforeAll(context, async, beforeAllBody)];
  const unhandledExceptionStatements = when.statements.length > 0 ? [afterAll(context, false, checkUnhandledExceptions(context))] : [];

  return factory.createBlock(
    [
      ...declareTryCatch(context),
      ...beforeAllStatements,
      ...unhandledExceptionStatements,
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
