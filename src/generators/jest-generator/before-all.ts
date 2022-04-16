import ts from 'typescript';

export const beforeAll = (context: ts.TransformationContext, statements: ts.Statement[]): ts.ExpressionStatement => {
  const factory = context.factory;

  return factory.createExpressionStatement(
    factory.createCallExpression(factory.createIdentifier('beforeAll'), undefined, [
      factory.createArrowFunction(
        [factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
        undefined,
        [],
        undefined,
        factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        factory.createBlock(statements, true)
      ),
    ])
  );
};
