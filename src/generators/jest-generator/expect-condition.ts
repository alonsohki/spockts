import ts from 'typescript';
import { it } from './it';

const createExpect = (context: ts.TransformationContext, condition: ts.ExpressionStatement): ts.ExpressionStatement => {
  const factory = context.factory;
  return factory.createExpressionStatement(
    factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createCallExpression(factory.createIdentifier('expect'), undefined, [condition.expression]),
        factory.createIdentifier('toBeTruthy')
      ),
      undefined,
      []
    )
  );
};

export const expectCondition = (context: ts.TransformationContext, condition: ts.ExpressionStatement): ts.ExpressionStatement => {
  const factory = context.factory;
  return it(context, factory.createStringLiteral(condition.getText()), false, factory.createBlock([createExpect(context, condition)], true));
};
