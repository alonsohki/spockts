import ts from 'typescript';
import { Generator, GeneratorInput } from '.';

const generator: Generator = (context: ts.TransformationContext, title: ts.StringLiteral, input: GeneratorInput): ts.Node => {
  const factory = context.factory;

  return factory.createExpressionStatement(
    factory.createCallExpression(
      factory.createCallExpression(
        factory.createPropertyAccessExpression(factory.createIdentifier('it'), factory.createIdentifier('each')),
        undefined,
        [factory.createArrayLiteralExpression([factory.createObjectLiteralExpression([], false)], false)]
      ),
      undefined,
      [
        title,
        factory.createArrowFunction(
          undefined,
          undefined,
          [],
          undefined,
          factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          factory.createBlock([...input.expect, ...input.where], true)
        ),
      ]
    )
  );
};

export default generator;
