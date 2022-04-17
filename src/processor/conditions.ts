import ts from 'typescript';

export type Condition = {
  expression: ts.Expression;
  lhs: ts.Expression;
  op: ts.BinaryOperatorToken;
  rhs: ts.Expression;
};

export const processCondition = (statement: ts.ExpressionStatement): Condition => {
  if (!ts.isBinaryExpression(statement.expression)) {
    throw new Error(`Only binary expressions are allowed as conditions. Got: ${statement.getText()}`);
  }

  return {
    expression: statement.expression,
    lhs: statement.expression.left,
    op: statement.expression.operatorToken,
    rhs: statement.expression.right,
  };
};
