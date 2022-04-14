import ts from 'typescript';
import { State } from './state';

const getLabelStatements = (node: ts.LabeledStatement): ts.Statement[] => {
  if (ts.isBlock(node.statement)) return [...node.statement.statements];

  if (!ts.isBlock(node.parent)) throw Error('The parent of a labeled statement must be a block');

  const parentIndex = node.parent.statements.findIndex((x) => x === node);
  const nextStatements = node.parent.statements.slice(parentIndex + 1);
  const nextLabel = nextStatements.findIndex((x) => x.kind === ts.SyntaxKind.LabeledStatement);

  return [node.statement, ...(nextLabel === -1 ? nextStatements : nextStatements.slice(0, nextLabel))];
};

export const processLabeledStatement = (node: ts.LabeledStatement, state: State): void => {
  switch (node.label.text) {
    case 'given':
    case 'then':
    case 'expect':
    case 'when':
    case 'where':
      const statements = getLabelStatements(node);
      state[node.label.text].push(...statements);
      break;
    default:
      break;
  }
};