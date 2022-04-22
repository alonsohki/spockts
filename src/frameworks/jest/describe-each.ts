import { WhereInfo } from 'src/processor/output';
import ts from 'typescript';

const mapWhereInfo = (context: ts.TransformationContext, whereInfo: WhereInfo): ts.Expression[] => {
  const factory = context.factory;

  return whereInfo.cases.map((c) =>
    factory.createObjectLiteralExpression(
      Object.entries(c).map(([key, value]) => factory.createPropertyAssignment(factory.createIdentifier(key), value)),
      false
    )
  );
};

const createBindingParameter = (context: ts.TransformationContext, whereInfo: WhereInfo): ts.ParameterDeclaration => {
  const factory = context.factory;
  const keys = Object.keys(whereInfo.cases[0]);

  return factory.createParameterDeclaration(
    undefined,
    undefined,
    undefined,
    factory.createObjectBindingPattern(
      keys.map((key) => factory.createBindingElement(undefined, undefined, factory.createIdentifier(key), undefined))
    ),
    undefined,
    undefined,
    undefined
  );
};

const mapArguments = (context: ts.TransformationContext, args: ts.NodeArray<ts.Expression>, whereInfo: WhereInfo): ts.NodeArray<ts.Expression> => {
  const factory = context.factory;
  return ts.visitNodes(args, (node: ts.Node) => {
    if (!ts.isArrowFunction(node)) return node;

    return factory.updateArrowFunction(
      node,
      node.modifiers,
      node.typeParameters,
      [createBindingParameter(context, whereInfo)],
      node.type,
      node.equalsGreaterThanToken,
      node.body
    );
  });
};

export const describeEach = (context: ts.TransformationContext, callExpression: ts.CallExpression, whereInfo: WhereInfo): ts.CallExpression => {
  if (whereInfo.cases.length === 0) return callExpression;

  const factory = context.factory;

  const newCallExpression = factory.createCallExpression(
    factory.createCallExpression(
      factory.createPropertyAccessExpression(factory.createIdentifier('describe'), factory.createIdentifier('each')),
      undefined,
      [factory.createArrayLiteralExpression(mapWhereInfo(context, whereInfo), true)]
    ),
    callExpression.typeArguments,
    mapArguments(context, callExpression.arguments, whereInfo)
  );

  return newCallExpression;
};
