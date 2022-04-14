import ts from 'typescript';
import { tsquery } from '@phenomnomnominal/tsquery';
import { processLabeledStatement } from '../process-labeled-statement';
import { createState } from '../state';
import { Parser, ParserCallback } from '../parsers';

const parser: Parser = (sourceFile: ts.SourceFile, context: ts.TransformationContext, callback: ParserCallback): ts.SourceFile => {
  return tsquery.map(
    sourceFile,
    'CallExpression:has(Identifier[name=describe]) ExpressionStatement:has(CallExpression:has(Identifier[name=it]):has(StringLiteral):has(ArrowFunction))',
    (callExpression: ts.CallExpression) => {
      const titleStringLiteral = tsquery(callExpression, 'CallExpression > StringLiteral')[0] as ts.StringLiteral;
      const state = createState();
      tsquery(callExpression, 'ArrowFunction LabeledStatement:has(Identifier[name=/expect|where/])').forEach(
        (labeledStatement: ts.LabeledStatement) => {
          processLabeledStatement(labeledStatement, state);
        }
      );
      return callback(titleStringLiteral, state);
    }
  );
};

export default parser;
