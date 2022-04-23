import ts from 'typescript';
import { Condition, isTruthyCondition, isFalsyCondition, BinaryCondition } from '../../processor/conditions';

export type TransformedCondition = {
  title: string;
  expression: ts.CallExpression;
};

//---------------------------------------------------------------------------
// Helper functions
const call = (context: ts.TransformationContext, fn: ts.Expression, ...params: ts.Expression[]): ts.CallExpression =>
  context.factory.createCallExpression(fn, undefined, params);

const createExpect =
  (context: ts.TransformationContext) =>
  (expr: ts.Expression, expected?: ts.Expression, ...properties: string[]): ts.CallExpression => {
    const factory = context.factory;
    const expectCall: ts.Expression = call(context, factory.createIdentifier('expect'), expr);
    const propertyAccess = properties.reduce(
      (expr, propertyName) => factory.createPropertyAccessExpression(expr, factory.createIdentifier(propertyName)),
      expectCall
    );
    return expected ? call(context, propertyAccess, expected) : call(context, propertyAccess);
  };

const text = (expr: ts.Expression, opName: string, expr2?: ts.Expression) => `${expr.getText()} ${opName}${expr2 ? ` ${expr2.getText()}` : ''}`;

//---------------------------------------------------------------------------
// Special case handling
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

const getSpecialCase = (context: ts.TransformationContext, cond: BinaryCondition) => {
  const findSpecialCase = (expr: ts.Expression) => specialCases.find((c) => c.check(expr));
  let inverse: boolean;

  if (cond.op.kind === ts.SyntaxKind.EqualsEqualsEqualsToken) inverse = false;
  else if (cond.op.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken) inverse = true;
  else return null;

  const leftCase = findSpecialCase(cond.lhs);
  const rightCase = findSpecialCase(cond.rhs);

  const ret = (lhs: ts.Expression, special: SpecialCase): TransformedCondition => {
    const expect = createExpect(context);
    return {
      title: inverse ? text(lhs, special.notText) : text(lhs, special.text),
      expression: inverse ? expect(lhs, undefined, 'not', special.fn) : expect(lhs, undefined, special.fn),
    };
  };

  if (leftCase && !rightCase) return ret(cond.rhs, leftCase);
  else if (rightCase) return ret(cond.lhs, rightCase);
  else return null;
};

export const transformCondition = (context: ts.TransformationContext, cond: Condition): TransformedCondition => {
  const expect = createExpect(context);

  //---------------------------------------------------------------------------
  // Check for the straightforward cases: truthy and falsy conditions
  if (isTruthyCondition(cond)) {
    return {
      title: `${cond.expression.getText()} is truthy`,
      expression: expect(cond.expression, undefined, 'toBeTruthy'),
    };
  } else if (isFalsyCondition(cond)) {
    return {
      title: `${cond.operand.getText()} is falsy`,
      expression: expect(cond.operand, undefined, 'toBeFalsy'),
    };
  }

  //---------------------------------------------------------------------------
  // Check for special cases
  const specialCase = getSpecialCase(context, cond);
  if (specialCase) return specialCase;

  //---------------------------------------------------------------------------
  // Process the known default conditions using Jest's special functions
  switch (cond.op.kind) {
    case ts.SyntaxKind.EqualsEqualsEqualsToken:
      return {
        title: text(cond.lhs, 'strictly equals', cond.rhs),
        expression: expect(cond.lhs, cond.rhs, 'toStrictEqual'),
      };

    case ts.SyntaxKind.ExclamationEqualsEqualsToken:
      return {
        title: text(cond.lhs, 'does not strictly equal', cond.rhs),
        expression: expect(cond.lhs, cond.rhs, 'not', 'toStrictEqual'),
      };

    case ts.SyntaxKind.EqualsEqualsToken:
      return {
        title: text(cond.lhs, 'equals', cond.rhs),
        expression: expect(cond.lhs, cond.rhs, 'toEqual'),
      };

    case ts.SyntaxKind.ExclamationEqualsToken:
      return {
        title: text(cond.lhs, 'does not equal', cond.rhs),
        expression: expect(cond.lhs, cond.rhs, 'not', 'toEqual'),
      };

    case ts.SyntaxKind.LessThanToken:
      return {
        title: text(cond.lhs, 'is less than', cond.rhs),
        expression: expect(cond.lhs, cond.rhs, 'toBeLessThan'),
      };

    case ts.SyntaxKind.LessThanEqualsToken:
      return {
        title: text(cond.lhs, 'is less or equal than', cond.rhs),
        expression: expect(cond.lhs, cond.rhs, 'toBeLessThanOrEqual'),
      };

    case ts.SyntaxKind.GreaterThanToken:
      return {
        title: text(cond.lhs, 'is greater than', cond.rhs),
        expression: expect(cond.lhs, cond.rhs, 'toBeGreaterThan'),
      };

    case ts.SyntaxKind.GreaterThanEqualsToken:
      return {
        title: text(cond.lhs, 'is greater or equal than', cond.rhs),
        expression: expect(cond.lhs, cond.rhs, 'toBeGreaterThanOrEqual'),
      };

    case ts.SyntaxKind.InstanceOfKeyword:
      return {
        title: text(cond.lhs, 'is an instance of', cond.rhs),
        expression: expect(cond.lhs, cond.rhs, 'toBeInstanceOf'),
      };

    case ts.SyntaxKind.InKeyword:
      return {
        title: text(cond.rhs, 'contains', cond.lhs),
        expression: expect(cond.rhs, cond.lhs, 'toContain'),
      };

    default:
      return {
        title: `${cond.expression.getText()} is truthy`,
        expression: expect(cond.expression, undefined, 'toBeTruthy'),
      };
  }
};
