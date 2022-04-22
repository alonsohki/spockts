import ts from 'typescript';

export const beforeAll = (context: ts.TransformationContext, async: boolean, statements: ts.Statement[]): ts.ExpressionStatement => {
  const factory = context.factory;

  return factory.createExpressionStatement(
    factory.createCallExpression(factory.createIdentifier('beforeAll'), undefined, [
      factory.createArrowFunction(
        async ? [factory.createModifier(ts.SyntaxKind.AsyncKeyword)] : undefined,
        undefined,
        [],
        undefined,
        factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        factory.createBlock(statements, true)
      ),
    ])
  );
};
