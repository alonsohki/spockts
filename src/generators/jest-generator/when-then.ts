import ts from 'typescript';
import { ThenBlock, WhenThenBlock } from '../../processor/output';
import { transformCondition } from './transform-condition';
import { afterAll } from './after-all';
import { beforeAll } from './before-all';
import { describe } from './describe';
import { it } from './it';
import { checkUnhandledExceptions, declareTryCatch, wrapInTryCatch } from './try-catch';

const mapThen = (context: ts.TransformationContext, then: ThenBlock): ts.Statement => {
  const factory = context.factory;

  const transformedConditions = then.conditions.map((condition) => transformCondition(context, condition));
  const expectExpressions = transformedConditions.map((tc) => factory.createExpressionStatement(tc.expression));

  const testBlock = factory.createBlock(expectExpressions, true);
  return it(context, then.title ?? factory.createStringLiteral(''), then.async, testBlock);
};

const mapWhenThen = (context: ts.TransformationContext, whenThen: WhenThenBlock): ts.Block => {
  const factory = context.factory;

  const when = whenThen.when;
  const thenSetup = whenThen.then.map((then) => then.setup);

  if (whenThen.then.length === 0) {
    return factory.createBlock([], false);
  }

  const async = when.async || thenSetup.some((setup) => setup.async);
  const beforeAllBody = [
    ...(when.statements.length > 0 ? [wrapInTryCatch(context, when.statements)] : []),
    ...thenSetup.flatMap((setup) => setup.statements),
  ];
  const beforeAllStatements = beforeAllBody.length === 0 ? [] : [beforeAll(context, async, beforeAllBody)];
  const unhandledExceptionStatements = when.statements.length > 0 ? [afterAll(context, false, checkUnhandledExceptions(context))] : [];

  return factory.createBlock(
    [...declareTryCatch(context), ...beforeAllStatements, ...unhandledExceptionStatements, ...whenThen.then.map((then) => mapThen(context, then))],
    true
  );
};

export const whenThen = (context: ts.TransformationContext, blocks: WhenThenBlock[]): ts.Statement[] => {
  const factory = context.factory;

  return [
    ...blocks.flatMap((whenThen) => [...whenThen.when.declarations, ...whenThen.then.flatMap((then) => then.setup.declarations)]),
    ...blocks.map((whenThen) => describe(context, whenThen.title ?? factory.createStringLiteral(''), mapWhenThen(context, whenThen))),
  ];
};
