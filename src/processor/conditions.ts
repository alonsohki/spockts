import ts from 'typescript';
import { tsquery } from '@phenomnomnominal/tsquery';

type BaseCondition = {
  expression: ts.Expression;
  async: boolean;
};

export type ExpressionCondition = BaseCondition & {
  __type: 'expression';
};

export type UnaryCondition = BaseCondition & {
  __type: 'unary';
  operand: ts.Expression;
  operator: ts.SyntaxKind.ExclamationToken;
};

export type BinaryCondition = BaseCondition & {
  __type: 'binary';
  lhs: ts.Expression;
  op: ts.BinaryOperatorToken;
  rhs: ts.Expression;
};

export type Condition = ExpressionCondition | UnaryCondition | BinaryCondition;

export const isUnaryCondition = (cond: Condition): cond is UnaryCondition => cond.__type === 'unary';
export const isBinaryCondition = (cond: Condition): cond is BinaryCondition => cond.__type === 'binary';
export const isExpressionCondition = (cond: Condition): cond is ExpressionCondition => cond.__type === 'expression';

export const processCondition = (statement: ts.ExpressionStatement): Condition => {
  const async = tsquery(statement, 'AwaitExpression').length > 0;

  if (ts.isBinaryExpression(statement.expression)) {
    return {
      __type: 'binary',
      async,
      expression: statement.expression,
      lhs: statement.expression.left,
      op: statement.expression.operatorToken,
      rhs: statement.expression.right,
    };
  } else if (ts.isPrefixUnaryExpression(statement.expression) && statement.expression.operator === ts.SyntaxKind.ExclamationToken) {
    return {
      __type: 'unary',
      async,
      expression: statement.expression,
      operand: statement.expression.operand,
      operator: ts.SyntaxKind.ExclamationToken,
    };
  } else {
    return {
      __type: 'expression',
      async,
      expression: statement.expression,
    };
  }
};

export const looksLikeACondition = (statement: ts.Statement): statement is ts.ExpressionStatement => {
  return ts.isExpressionStatement(statement);
};
