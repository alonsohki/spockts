import ts from 'typescript';
import { Block } from './block';
import { WhereInfo } from './output';

const isValidSeparator: { [K in ts.SyntaxKind]?: true } = {
  [ts.SyntaxKind.BarToken]: true,
  [ts.SyntaxKind.BarBarToken]: true,
};

const extractExpressions = (statement: ts.ExpressionStatement): ts.Expression[] => {
  const fn = (expression: ts.Expression): ts.Expression[] => {
    if (!ts.isBinaryExpression(expression) || !isValidSeparator[expression.operatorToken.kind]) return [expression];
    return [...fn(expression.left), ...fn(expression.right)];
  };
  return fn(statement.expression);
};

const getCasesFromWhereBlock = (block: Block & { type: 'where' }): WhereInfo['cases'] => {
  if (block.type !== 'where') throw new Error(`Received an unexpected block type "${block.type}"`);
  if (block.statements.length < 2) throw new Error('Where blocks must contain at least 2 statements');

  const headers = extractExpressions(block.statements[0]);
  if (headers.some((header) => !ts.isIdentifier(header))) throw new Error('The first row of a "where" block can only contain identifiers');

  const cases = block.statements.slice(1).map(extractExpressions);
  const invalidCase = cases.findIndex((c) => c.length !== headers.length);
  if (invalidCase > -1) {
    throw new Error(`All rows in a where block must have the same number of columns, but found "${block.statements[invalidCase + 1].getText()}"`);
  }

  return cases.map((c) => Object.fromEntries(c.map((expr, index) => [(headers[index] as ts.Identifier).escapedText, expr])));
};

const mergeWhereCases = (a: Record<string, ts.Expression>[], b: Record<string, ts.Expression>[]): Record<string, ts.Expression>[] => {
  if (a.length === 0) return b;
  if (b.length === 0) return a;
  const aHeaders = Object.keys(a[0]);
  const bHeaders = Object.keys(b[0]);

  // In case of a full match of headers, just append.
  if (aHeaders.length === bHeaders.length && aHeaders.every((h) => bHeaders.includes(h))) {
    return [...a, ...b];
  }

  // Otherwise, all the headers must be different and number of rows must match
  if (aHeaders.some((h) => bHeaders.includes(h))) {
    throw new Error(`Where clause columns must match either all or none of the colume names`);
  }
  if (a.length !== b.length) {
    throw new Error(`When adding additional fields to where clauses, you must match the amount of rows of the previous where clause`);
  }

  return a.map((aCase, index) => ({
    ...aCase,
    ...b[index],
  }));
};

export const processWhereBlocks = (context: ts.TransformationContext, blocks: Block[]): WhereInfo => {
  const cases = blocks.map(getCasesFromWhereBlock).reduce(mergeWhereCases, []);

  return {
    cases,
  };
};
