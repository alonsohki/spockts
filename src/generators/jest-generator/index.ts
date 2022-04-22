import { tsquery } from '@phenomnomnominal/tsquery';
import ts from 'typescript';
import { Generator } from '..';
import { ProcessorOutput } from '../../processor/output';
import { afterAll } from './after-all';
import { beforeAll } from './before-all';
import { describeEach } from './describe-each';
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

  const newCallExpression = describeEach(context, callExpression, input.where);
  const visitor = (node: ts.Node): ts.Node => {
    if (!ts.isArrowFunction(node)) return ts.visitEachChild(node, visitor, context);
    return factory.createArrowFunction(
      node.modifiers?.filter((m) => m.kind !== ts.SyntaxKind.AsyncKeyword),
      node.typeParameters,
      node.parameters,
      node.type,
      node.equalsGreaterThanToken,
      newBlock
    );
  };
  return ts.visitNode(newCallExpression, visitor);
};

export default generator;
