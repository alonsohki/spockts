import ts from 'typescript';
import { tsquery } from '@phenomnomnominal/tsquery';
import { Parser, ParserCallback } from '../parsers';

const parser: Parser = (sourceFile: ts.SourceFile, context: ts.TransformationContext, callback: ParserCallback): ts.SourceFile => {
  return tsquery.map(
    sourceFile,
    'CallExpression:has(Identifier[name=describe]) ExpressionStatement:has(CallExpression:has(Identifier[name=it]):has(StringLiteral):has(ArrowFunction))',
    (callExpression: ts.CallExpression) => {
      const titleStringLiteral = tsquery(callExpression, 'CallExpression > StringLiteral')[0] as ts.StringLiteral;
      const blocks = tsquery(callExpression, 'ArrowFunction > Block');
      if (!blocks || !blocks.length || !ts.isBlock(blocks[0])) return callExpression;
      return callback(titleStringLiteral, blocks[0]);
    }
  );
};

export default parser;
