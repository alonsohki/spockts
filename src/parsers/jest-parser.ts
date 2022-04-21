import ts, { VisitResult } from 'typescript';
import { tsquery } from '@phenomnomnominal/tsquery';
import { Parser, ParserCallback } from '../parsers';

const parser: Parser = (sourceFile: ts.SourceFile, context: ts.TransformationContext, callback: ParserCallback): ts.SourceFile => {
  const callExpressionCb = (callExpression: ts.CallExpression) => {
    const results = tsquery(callExpression, 'CallExpression > StringLiteral');
    if (results.length === 0) return callExpression;
    const titleStringLiteral = results[0] as ts.StringLiteral;

    const blocks = tsquery(callExpression, 'Block');
    if (blocks.length === 0 || !ts.isBlock(blocks[0])) return callExpression;

    return callback(titleStringLiteral, blocks[0], callExpression);
  };

  const matches = tsquery(sourceFile, 'CallExpression:has(Identifier[name=describe]):has(StringLiteral):has(ArrowFunction:has(Block))');

  const selectorVisitor = (node: ts.Node): VisitResult<ts.Node> => {
    if (matches.includes(node)) {
      const replacement = callExpressionCb(node as ts.CallExpression);
      if (replacement !== node) return replacement;
    }
    return ts.visitEachChild(node, selectorVisitor, context);
  };

  return ts.visitNode(sourceFile, selectorVisitor);
};

export default parser;
