import ts from 'typescript';
import { tsquery } from '@phenomnomnominal/tsquery';
import { Parser, ParserCallback } from '../parsers';

const parser: Parser = (sourceFile: ts.SourceFile, context: ts.TransformationContext, callback: ParserCallback): ts.SourceFile => {
  return tsquery.map(
    sourceFile,
    'CallExpression:has(Identifier[name=describe]):has(StringLiteral):has(ArrowFunction)',
    (callExpression: ts.CallExpression) => {
      const results = tsquery(callExpression, 'CallExpression > StringLiteral');
      if (results.length === 0) return callExpression;

      const arrowFunction = tsquery(callExpression, 'ArrowFunction')[0];

      const titleStringLiteral = results[0] as ts.StringLiteral;
      const blocks = tsquery(arrowFunction, 'Block');
      if (blocks.length === 0 || !ts.isBlock(blocks[0])) return callExpression;

      const replacedBlock = callback(titleStringLiteral, blocks[0]);
      if (!replacedBlock) return callExpression;

      const visitor = (node: ts.Node): ts.Node => {
        if (node == blocks[0]) {
          return replacedBlock;
        }

        // We might need to declare the describe block as async for promise tests,
        // but jest does not like async callbacks in describe() calls. Simply remove
        // the async modifier from the arrow function.
        if (node == arrowFunction && ts.isArrowFunction(node) && node.modifiers) {
          if (node.modifiers.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword)) {
            const newModifiers = node.modifiers.filter((m) => m.kind !== ts.SyntaxKind.AsyncKeyword);
            const newNode = context.factory.createArrowFunction(
              newModifiers,
              node.typeParameters,
              node.parameters,
              node.type,
              node.equalsGreaterThanToken,
              node.body
            );
            return ts.visitEachChild(newNode, visitor, context);
          }
        }

        return ts.visitEachChild(node, visitor, context);
      };
      return ts.visitNode(callExpression, visitor);
    }
  );
};

export default parser;
