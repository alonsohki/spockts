import ts from 'typescript';
import { tsquery } from '@phenomnomnominal/tsquery';

type BaseCondition = {
  expression: ts.Expression;
  async: boolean;
};

export type TruthyCondition = BaseCondition & {
  __type: 'truthy';
};

export type FalsyCondition = BaseCondition & {
  __type: 'falsy';
  operand: ts.Expression;
};

export type BinaryCondition = BaseCondition & {
  __type: 'binary';
  lhs: ts.Expression;
  op: ts.BinaryOperatorToken;
  rhs: ts.Expression;
};

export type Condition = TruthyCondition | FalsyCondition | BinaryCondition;

export const isTruthyCondition = (cond: Condition): cond is TruthyCondition => cond.__type === 'truthy';
export const isFalsyCondition = (cond: Condition): cond is FalsyCondition => cond.__type === 'falsy';
export const isBinaryCondition = (cond: Condition): cond is BinaryCondition => cond.__type === 'binary';

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
      __type: 'falsy',
      async,
      expression: statement.expression,
      operand: statement.expression.operand,
    };
  } else {
    return {
      __type: 'truthy',
      async,
      expression: statement.expression,
    };
  }
};

export const looksLikeACondition = (statement: ts.Statement): statement is ts.ExpressionStatement => {
  return ts.isExpressionStatement(statement);
};
