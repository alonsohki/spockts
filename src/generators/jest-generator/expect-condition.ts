import ts from 'typescript';
import { it } from './it';
import { Condition } from '../../processor/conditions';

const parseCondition = (context: ts.TransformationContext, cond: Condition): { title: string; accessor: ts.CallExpression } => {
  const factory = context.factory;

  const call = (fn: ts.Expression, ...params: ts.Expression[]): ts.CallExpression => factory.createCallExpression(fn, undefined, params);

  const expect = (expr: ts.Expression, expected: ts.Expression, ...properties: string[]): ts.CallExpression => {
    const expectCall: ts.Expression = call(factory.createIdentifier('expect'), expr);
    const propertyAccess = properties.reduce(
      (expr, propertyName) => factory.createPropertyAccessExpression(expr, factory.createIdentifier(propertyName)),
      expectCall
    );
    return call(propertyAccess, expected);
  };

  const text = (expr: ts.Expression, opName: string, expr2: ts.Expression) => `${expr.getText()} ${opName} ${expr2.getText()}`;

  switch (cond.op.kind) {
    case ts.SyntaxKind.EqualsEqualsToken:
      return {
        title: text(cond.lhs, 'equals', cond.rhs),
        accessor: expect(cond.lhs, cond.rhs, 'toEqual'),
      };

    case ts.SyntaxKind.EqualsEqualsEqualsToken:
      return {
        title: text(cond.lhs, 'strictly equals', cond.rhs),
        accessor: expect(cond.lhs, cond.rhs, 'toStrictEqual'),
      };

    case ts.SyntaxKind.ExclamationEqualsToken:
      return {
        title: text(cond.lhs, 'does not equal', cond.rhs),
        accessor: expect(cond.lhs, cond.rhs, 'not', 'toEqual'),
      };

    case ts.SyntaxKind.ExclamationEqualsEqualsToken:
      return {
        title: text(cond.lhs, 'does not strictly equal', cond.rhs),
        accessor: expect(cond.lhs, cond.rhs, 'not', 'toStrictEqual'),
      };

    case ts.SyntaxKind.LessThanToken:
      return {
        title: text(cond.lhs, 'is less than', cond.rhs),
        accessor: expect(cond.lhs, cond.rhs, 'toBeLessThan'),
      };

    case ts.SyntaxKind.LessThanEqualsToken:
      return {
        title: text(cond.lhs, 'is less or equal than', cond.rhs),
        accessor: expect(cond.lhs, cond.rhs, 'toBeLessThanOrEqual'),
      };

    case ts.SyntaxKind.GreaterThanToken:
      return {
        title: text(cond.lhs, 'is greater than', cond.rhs),
        accessor: expect(cond.lhs, cond.rhs, 'toBeGreaterThan'),
      };

    case ts.SyntaxKind.GreaterThanEqualsToken:
      return {
        title: text(cond.lhs, 'is greater or equal than', cond.rhs),
        accessor: expect(cond.lhs, cond.rhs, 'toBeGreaterThanOrEqual'),
      };

    case ts.SyntaxKind.InstanceOfKeyword:
      return {
        title: text(cond.lhs, 'is an instance of', cond.rhs),
        accessor: expect(cond.lhs, cond.rhs, 'toBeInstanceOf'),
      };

    case ts.SyntaxKind.InKeyword:
      return {
        title: text(cond.rhs, 'contains', cond.lhs),
        accessor: expect(cond.rhs, cond.lhs, 'toContain'),
      };

    default:
      return {
        title: cond.expression.getText(),
        accessor: factory.createCallExpression(
          factory.createPropertyAccessExpression(
            factory.createCallExpression(factory.createIdentifier('expect'), undefined, [cond.expression]),
            factory.createIdentifier('toBeTruthy')
          ),
          undefined,
          []
        ),
      };
  }
};

export const expectCondition = (context: ts.TransformationContext, condition: Condition): ts.ExpressionStatement => {
  const factory = context.factory;

  const parsedCondition = parseCondition(context, condition);
  const expectExpression = factory.createExpressionStatement(parsedCondition.accessor);

  return it(context, factory.createStringLiteral(parsedCondition.title), false, factory.createBlock([expectExpression], true));
};
