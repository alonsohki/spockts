import ts from 'typescript';

export type ExpressionCondition = {
  __type: 'expression';
  expression: ts.Expression;
};

export type UnaryCondition = {
  __type: 'unary';
  expression: ts.Expression;
  operand: ts.Expression;
  operator: ts.SyntaxKind.ExclamationToken;
};

export type BinaryCondition = {
  __type: 'binary';
  expression: ts.Expression;
  lhs: ts.Expression;
  op: ts.BinaryOperatorToken;
  rhs: ts.Expression;
};

export type Condition = ExpressionCondition | UnaryCondition | BinaryCondition;

export const isUnaryCondition = (cond: Condition): cond is UnaryCondition => cond.__type === 'unary';
export const isBinaryCondition = (cond: Condition): cond is BinaryCondition => cond.__type === 'binary';
export const isExpressionCondition = (cond: Condition): cond is ExpressionCondition => cond.__type === 'expression';

export const processCondition = (statement: ts.ExpressionStatement): Condition => {
  if (ts.isBinaryExpression(statement.expression)) {
    return {
      __type: 'binary',
      expression: statement.expression,
      lhs: statement.expression.left,
      op: statement.expression.operatorToken,
      rhs: statement.expression.right,
    };
  } else if (ts.isPrefixUnaryExpression(statement.expression) && statement.expression.operator === ts.SyntaxKind.ExclamationToken) {
    return {
      __type: 'unary',
      expression: statement.expression,
      operand: statement.expression.operand,
      operator: ts.SyntaxKind.ExclamationToken,
    };
  } else {
    return {
      __type: 'expression',
      expression: statement.expression,
    };
  }
};
