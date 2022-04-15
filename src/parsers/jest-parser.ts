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

      const titleStringLiteral = results[0] as ts.StringLiteral;
      const blocks = tsquery(callExpression, 'ArrowFunction > Block');
      if (blocks.length === 0 || !ts.isBlock(blocks[0])) return callExpression;

      const replacedBlock = callback(titleStringLiteral, blocks[0]);
      if (!replacedBlock) return callExpression;

      const visitor = (node: ts.Node): ts.Node => (node == blocks[0] ? replacedBlock : ts.visitEachChild(node, visitor, context));
      return ts.visitNode(callExpression, visitor);
    }
  );
};

export default parser;
