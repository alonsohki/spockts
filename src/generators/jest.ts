import ts from 'typescript';
import { State } from '~/state';
import { Generator } from '.';

const generator: Generator = (title: ts.StringLiteral, state: State, context: ts.TransformationContext): ts.Node => {
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
          factory.createBlock([...state.expect, ...state.where], true)
        ),
      ]
    )
  );
};

export default generator;
