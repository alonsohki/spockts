import ts from 'typescript';
import { createState, State } from './state';
import { tsquery } from '@phenomnomnominal/tsquery';
import generators from './generators';

const getLabelStatements = (node: ts.LabeledStatement): ts.Statement[] => {
  if (ts.isBlock(node.statement)) return [...node.statement.statements];

  if (!ts.isBlock(node.parent)) throw Error('The parent of a labeled statement must be a block');

  const parentIndex = node.parent.statements.findIndex((x) => x === node);
  const nextStatements = node.parent.statements.slice(parentIndex + 1);
  const nextLabel = nextStatements.findIndex((x) => x.kind === ts.SyntaxKind.LabeledStatement);

  return [node.statement, ...(nextLabel === -1 ? nextStatements : nextStatements.slice(0, nextLabel))];
};

const processLabeledStatement = (node: ts.LabeledStatement, state: State): void => {
  switch (node.label.text) {
    case 'expect':
    case 'where':
      const statements = getLabelStatements(node);
      state[node.label.text].push(...statements);
      break;
    default:
      break;
  }
};

export const parseGrammar = (sourceFile: ts.SourceFile, context: ts.TransformationContext) => {
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
      return generators.jest(titleStringLiteral, state, context);
    }
  );
};
