import { tsquery } from '@phenomnomnominal/tsquery';
import ts from 'typescript';
import { Generator } from '..';
import { ProcessorOutput } from '../../processor/output';
import { afterAll } from './after-all';
import { beforeAll } from './before-all';
import { whenThen } from './when-then';

const generator: Generator = (context: ts.TransformationContext, input: ProcessorOutput, callExpression: ts.CallExpression): ts.Node => {
  const factory = context.factory;

  const arrowFunction = tsquery(callExpression, 'ArrowFunction')[0] as ts.ArrowFunction;
  if (!arrowFunction) return callExpression;

  const newBlock = factory.createBlock(
    [
      ...input.setup.declarations,
      ...(input.setup.statements.length > 0 ? [beforeAll(context, input.setup.async, input.setup.statements)] : []),
      ...(input.cleanup.statements.length > 0 ? [afterAll(context, input.cleanup.async, input.cleanup.statements)] : []),
      ...whenThen(context, input.whenThen),
    ],
    true
  );

  const newArrowFunction = factory.createArrowFunction(
    arrowFunction.modifiers?.filter((m) => m.kind !== ts.SyntaxKind.AsyncKeyword),
    arrowFunction.typeParameters,
    arrowFunction.parameters,
    arrowFunction.type,
    arrowFunction.equalsGreaterThanToken,
    newBlock
  );

  const visitor = (node: ts.Node): ts.Node => {
    return node === arrowFunction ? newArrowFunction : ts.visitEachChild(node, visitor, context);
  };
  return ts.visitNode(callExpression, visitor);
};

export default generator;
