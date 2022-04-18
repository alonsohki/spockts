import ts from 'typescript';

export type UnaryCondition = {
  expression: ts.Expression;
  operand: ts.Expression;
  operator: ts.SyntaxKind.ExclamationToken;
};

export type BinaryCondition = {
  expression: ts.Expression;
  lhs: ts.Expression;
  op: ts.BinaryOperatorToken;
  rhs: ts.Expression;
};

export type Condition = UnaryCondition | BinaryCondition;

export const isUnaryCondition = (cond: Condition): cond is UnaryCondition => (cond as any).operand !== undefined;
export const isBinaryCondition = (cond: Condition): cond is BinaryCondition => (cond as any).lhs !== undefined;

export const processCondition = (statement: ts.ExpressionStatement): Condition => {
  if (ts.isBinaryExpression(statement.expression)) {
    return {
      expression: statement.expression,
      lhs: statement.expression.left,
      op: statement.expression.operatorToken,
      rhs: statement.expression.right,
    };
  } else if (ts.isPrefixUnaryExpression(statement.expression) && statement.expression.operator === ts.SyntaxKind.ExclamationToken) {
    return {
      expression: statement.expression,
      operand: statement.expression.operand,
      operator: ts.SyntaxKind.ExclamationToken,
    };
  }

  throw new Error(`Only unary negation or binary expressions are allowed as conditions. Got: ${statement.getText()}`);
};
