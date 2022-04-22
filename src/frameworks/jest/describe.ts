import ts from 'typescript';

export const describe = (context: ts.TransformationContext, title: ts.StringLiteral, block: ts.Block): ts.ExpressionStatement => {
  const factory = context.factory;
  return factory.createExpressionStatement(
    factory.createCallExpression(factory.createIdentifier('describe'), undefined, [
      title,
      factory.createArrowFunction(undefined, undefined, [], undefined, factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken), block),
    ])
  );
};
