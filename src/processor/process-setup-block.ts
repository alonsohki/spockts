import { tsquery } from '@phenomnomnominal/tsquery';
import ts from 'typescript';

export type SetupBlockInfo = {
  declarations: ts.VariableStatement[];
  statements: ts.Statement[];
  async: boolean;
};

const extractIdentifiersFromBindingPattern = (pattern: ts.BindingPattern): ts.Identifier[] => {
  return pattern.elements.flatMap((element: ts.BindingElement) => {
    if (ts.isIdentifier(element.name)) return element.name;
    if (ts.isArrayBindingPattern(element.name) || ts.isObjectBindingPattern(element.name)) return extractIdentifiersFromBindingPattern(element.name);
  });
};

const convertObjectBindingElement = (context: ts.TransformationContext, element: ts.BindingElement) => {
  const factory = context.factory;

  if (!element.propertyName) {
    if (element.dotDotDotToken) return factory.createSpreadAssignment(element.name as ts.Identifier);
    else return factory.createShorthandPropertyAssignment(element.name as ts.Identifier, element.initializer);
  }

  const name = ts.isIdentifier(element.name) ? element.name : transformLHS(context, element.name);
  if (element.dotDotDotToken) return factory.createSpreadAssignment(name);
  else if (element.initializer)
    return factory.createPropertyAssignment(
      element.propertyName,
      factory.createBinaryExpression(name, ts.SyntaxKind.EqualsToken, element.initializer)
    );
  else return factory.createPropertyAssignment(element.propertyName, name);
};

const convertArrayBindingElement = (context: ts.TransformationContext, element: ts.BindingElement) => {
  const factory = context.factory;

  if (element.dotDotDotToken) return factory.createSpreadElement(element.name as ts.Identifier);
  else if (!element.initializer) return transformLHS(context, element.name);
  else return factory.createBinaryExpression(transformLHS(context, element.name), ts.SyntaxKind.EqualsToken, element.initializer);
};

const transformLHS = (context: ts.TransformationContext, node: ts.BindingName): ts.Expression => {
  const factory = context.factory;

  if (ts.isIdentifier(node)) {
    return node;
  } else if (ts.isObjectBindingPattern(node)) {
    return factory.createObjectLiteralExpression(node.elements.map(convertObjectBindingElement.bind(null, context)));
  } else if (ts.isArrayBindingPattern(node)) {
    return factory.createArrayLiteralExpression(node.elements.map(convertArrayBindingElement.bind(null, context)));
  }

  throw new Error(`Unknown binding pattern type`);
};

const processBindingDeclaration = (
  context: ts.TransformationContext,
  node: ts.VariableDeclaration,
  info: SetupBlockInfo
): ts.VariableDeclaration[] => {
  const factory = context.factory;

  if (!node.initializer) {
    throw new Error(`Cannot have binding patterns without initializers`);
  }

  const lhs = transformLHS(context, node.name as ts.BindingPattern);
  const initializationStatement = factory.createExpressionStatement(
    factory.createParenthesizedExpression(factory.createBinaryExpression(lhs, ts.SyntaxKind.EqualsToken, node.initializer))
  );
  info.statements.push(initializationStatement);

  return extractIdentifiersFromBindingPattern(node.name as ts.BindingPattern).map((i) =>
    factory.createVariableDeclaration(i.text, node.exclamationToken, node.type)
  );
};

const processRegularDeclaration = (context: ts.TransformationContext, node: ts.VariableDeclaration, info: SetupBlockInfo): ts.VariableDeclaration => {
  const factory = context.factory;

  if (node.initializer) {
    const initializationStatement = factory.createExpressionStatement(
      factory.createBinaryExpression(node.name as ts.Identifier, ts.SyntaxKind.EqualsToken, node.initializer)
    );
    info.statements.push(initializationStatement);
  }

  return factory.createVariableDeclaration(node.name, node.exclamationToken, node.type);
};

const extractVariablesAndInitializers = (context: ts.TransformationContext, statement: ts.VariableStatement, info: SetupBlockInfo): void => {
  const factory = context.factory;

  const transformVariableDeclaration = (node: ts.VariableDeclaration): ts.VariableDeclaration | ts.VariableDeclaration[] =>
    ts.isIdentifier(node.name) ? processRegularDeclaration(context, node, info) : processBindingDeclaration(context, node, info);

  const visitor = (node: ts.Node): ts.Node => {
    if (ts.isVariableDeclarationList(node)) {
      const newNode = factory.createVariableDeclarationList(node.declarations.flatMap(transformVariableDeclaration), ts.NodeFlags.Let);
      return newNode;
    }
    return ts.visitEachChild(node, visitor, context);
  };
  info.declarations.push(ts.visitNode(statement, visitor));
};

export const processSetupBlock = (context: ts.TransformationContext, statements: ts.Statement[]): SetupBlockInfo => {
  const info: SetupBlockInfo = {
    declarations: [],
    statements: [],
    async: false,
  };

  statements.forEach((statement) => {
    if (ts.isVariableStatement(statement)) {
      extractVariablesAndInitializers(context, statement, info);
    } else {
      info.statements.push(statement);
    }

    const awaitTokens = tsquery(statement, 'AwaitExpression');
    if (awaitTokens.length > 0) info.async = true;
  });

  return info;
};

export const mergeSetupBlocks = (a: SetupBlockInfo, b: SetupBlockInfo): SetupBlockInfo => {
  return {
    declarations: [...a.declarations, ...b.declarations],
    statements: [...a.statements, ...b.statements],
    async: a.async || b.async,
  };
};
