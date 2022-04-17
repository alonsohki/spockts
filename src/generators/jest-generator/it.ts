import ts from 'typescript';

export const it = (context: ts.TransformationContext, title: ts.StringLiteral, async: boolean, block: ts.Block): ts.ExpressionStatement => {
  const factory = context.factory;

  return factory.createExpressionStatement(
    factory.createCallExpression(factory.createIdentifier('it'), undefined, [
      title,
      factory.createArrowFunction(
        async ? [factory.createModifier(ts.SyntaxKind.AsyncKeyword)] : undefined,
        undefined,
        [],
        undefined,
        factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        block
      ),
    ])
  );
};
