import ts from 'typescript';

const exceptionIdentifier = '$__spockts_thrown';
const accessorFnIdentifier = 'thrown';

export const declareTryCatch = (context: ts.TransformationContext): ts.Statement[] => {
  const factory = context.factory;
  const statements = [
    factory.createVariableStatement(
      undefined,
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            factory.createIdentifier(exceptionIdentifier),
            undefined,
            factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
            undefined
          ),
        ],
        ts.NodeFlags.Let
      )
    ),
    factory.createVariableStatement(
      undefined,
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            factory.createIdentifier(`${exceptionIdentifier}_accessed`),
            undefined,
            factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
            undefined
          ),
        ],
        ts.NodeFlags.Let
      )
    ),
    factory.createVariableStatement(
      undefined,
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            factory.createIdentifier(accessorFnIdentifier),
            undefined,
            undefined,
            factory.createArrowFunction(
              undefined,
              undefined,
              [],
              undefined,
              factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
              factory.createBlock(
                [
                  factory.createExpressionStatement(
                    factory.createBinaryExpression(
                      factory.createIdentifier(`${exceptionIdentifier}_accessed`),
                      factory.createToken(ts.SyntaxKind.EqualsToken),
                      factory.createTrue()
                    )
                  ),
                  factory.createReturnStatement(factory.createIdentifier(exceptionIdentifier)),
                ],
                true
              )
            )
          ),
        ],
        ts.NodeFlags.Const
      )
    ),
    factory.createVariableStatement(
      undefined,
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            factory.createIdentifier(`${exceptionIdentifier}_unhandled`),
            undefined,
            undefined,
            factory.createArrowFunction(
              undefined,
              undefined,
              [],
              undefined,
              factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
              factory.createBinaryExpression(
                factory.createPrefixUnaryExpression(ts.SyntaxKind.ExclamationToken, factory.createIdentifier(`${exceptionIdentifier}_accessed`)),
                factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
                factory.createIdentifier(exceptionIdentifier)
              )
            )
          ),
        ],
        ts.NodeFlags.Const
      )
    ),
  ];
  return statements;
};

export const wrapInTryCatch = (context: ts.TransformationContext, statements: ts.Statement[]): ts.TryStatement => {
  const factory = context.factory;

  return factory.createTryStatement(
    factory.createBlock(
      [
        factory.createExpressionStatement(
          factory.createBinaryExpression(
            factory.createIdentifier(`${exceptionIdentifier}_accessed`),
            factory.createToken(ts.SyntaxKind.EqualsToken),
            factory.createFalse()
          )
        ),
        ...statements,
      ],
      true
    ),
    factory.createCatchClause(
      factory.createVariableDeclaration(
        factory.createIdentifier('$__err'),
        undefined,
        factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
        undefined
      ),
      factory.createBlock(
        [
          factory.createExpressionStatement(
            factory.createBinaryExpression(
              factory.createIdentifier(exceptionIdentifier),
              factory.createToken(ts.SyntaxKind.EqualsToken),
              factory.createIdentifier('$__err')
            )
          ),
        ],
        true
      )
    ),
    undefined
  );
};

export const checkUnhandledExceptions = (context: ts.TransformationContext): ts.Statement[] => {
  const factory = context.factory;

  return [
    factory.createVariableStatement(
      undefined,
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            factory.createIdentifier('unhandled'),
            undefined,
            undefined,
            factory.createCallExpression(factory.createIdentifier(`${exceptionIdentifier}_unhandled`), undefined, [])
          ),
        ],
        ts.NodeFlags.Const
      )
    ),
    factory.createIfStatement(factory.createIdentifier('unhandled'), factory.createThrowStatement(factory.createIdentifier('unhandled')), undefined),
  ];
};
