import ts from 'typescript';
import { it } from './it';
import { Condition, isTruthyCondition, isFalsyCondition } from '../../processor/conditions';

const parseCondition = (context: ts.TransformationContext, cond: Condition): { title: string; accessor: ts.CallExpression } => {
  const factory = context.factory;

  //---------------------------------------------------------------------------
  // Helper functions
  const call = (fn: ts.Expression, ...params: ts.Expression[]): ts.CallExpression => factory.createCallExpression(fn, undefined, params);

  const expect = (expr: ts.Expression, expected?: ts.Expression, ...properties: string[]): ts.CallExpression => {
    const expectCall: ts.Expression = call(factory.createIdentifier('expect'), expr);
    const propertyAccess = properties.reduce(
      (expr, propertyName) => factory.createPropertyAccessExpression(expr, factory.createIdentifier(propertyName)),
      expectCall
    );
    return expected ? call(propertyAccess, expected) : call(propertyAccess);
  };

  const text = (expr: ts.Expression, opName: string, expr2?: ts.Expression) => `${expr.getText()} ${opName}${expr2 ? ` ${expr2.getText()}` : ''}`;

  //---------------------------------------------------------------------------
  // Check for the straightforward cases: truthy and falsy conditions
  if (isTruthyCondition(cond)) {
    return {
      title: `${cond.expression.getText()} is truthy`,
      accessor: expect(cond.expression, undefined, 'toBeTruthy'),
    };
  } else if (isFalsyCondition(cond)) {
    return {
      title: `${cond.operand.getText()} is falsy`,
      accessor: expect(cond.operand, undefined, 'toBeFalsy'),
    };
  }

  //---------------------------------------------------------------------------
  // Declare the special cases for which Jest has special functions
  type SpecialCase = { check: (expr: ts.Expression) => boolean; text: string; notText: string; fn: string };
  const specialCases: SpecialCase[] = [
    { check: (expr) => expr.kind === ts.SyntaxKind.NullKeyword, text: 'is null', notText: 'is not null', fn: 'toBeNull' },
    {
      check: (expr) => ts.isIdentifier(expr) && expr.escapedText === 'undefined',
      text: 'is undefined',
      notText: 'is not undefined',
      fn: 'toBeUndefined',
    },
    { check: (expr) => ts.isIdentifier(expr) && expr.escapedText === 'NaN', text: 'is NaN', notText: 'is not NaN', fn: 'toBeNaN' },
  ];
  const findSpecialCase = (expr: ts.Expression) => specialCases.find((c) => c.check(expr));

  //---------------------------------------------------------------------------
  // Helper function for use in the strict equality checks, to handle the
  // special cases
  const strictEquality = ({ inverse }: { inverse: boolean }) => {
    const ret = (lhs: ts.Expression, rhs: ts.Expression) => {
      const special = findSpecialCase(rhs);
      return special
        ? {
            title: inverse ? text(lhs, special.notText) : text(lhs, special.text),
            accessor: inverse ? expect(lhs, undefined, 'not', special.fn) : expect(lhs, undefined, special.fn),
          }
        : {
            title: inverse ? text(lhs, 'does not strictly equal', rhs) : text(lhs, 'strictly equals', rhs),
            accessor: inverse ? expect(lhs, rhs, 'not', 'toStrictEqual') : expect(lhs, rhs, 'toStrictEqual'),
          };
    };

    if (findSpecialCase(cond.lhs) && !findSpecialCase(cond.rhs)) return ret(cond.rhs, cond.lhs);
    return ret(cond.lhs, cond.rhs);
  };

  //---------------------------------------------------------------------------
  // Process the known default conditions using Jest's special functions
  switch (cond.op.kind) {
    case ts.SyntaxKind.EqualsEqualsToken:
      return {
        title: text(cond.lhs, 'equals', cond.rhs),
        accessor: expect(cond.lhs, cond.rhs, 'toEqual'),
      };

    case ts.SyntaxKind.EqualsEqualsEqualsToken:
      return strictEquality({ inverse: false });

    case ts.SyntaxKind.ExclamationEqualsToken:
      return {
        title: text(cond.lhs, 'does not equal', cond.rhs),
        accessor: expect(cond.lhs, cond.rhs, 'not', 'toEqual'),
      };

    case ts.SyntaxKind.ExclamationEqualsEqualsToken:
      return strictEquality({ inverse: true });

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
        title: `${cond.expression.getText()} is truthy`,
        accessor: expect(cond.expression, undefined, 'toBeTruthy'),
      };
  }
};

export const expectCondition = (context: ts.TransformationContext, condition: Condition): ts.ExpressionStatement => {
  const factory = context.factory;

  const parsedCondition = parseCondition(context, condition);
  const expectExpression = factory.createExpressionStatement(parsedCondition.accessor);

  const testBlock = factory.createBlock([expectExpression], true);
  return it(context, factory.createStringLiteral(parsedCondition.title), condition.async, testBlock);
};
