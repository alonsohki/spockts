import ts from 'typescript';
import { BlockType } from '../block-types';
import { State } from './state';

const getLabelStatements = (node: ts.LabeledStatement): ts.Statement[] | null => {
  if (ts.isBlock(node.statement)) return [...node.statement.statements];

  if (!ts.isBlock(node.parent)) return null;

  const parentIndex = node.parent.statements.findIndex((x) => x === node);
  const nextStatements = node.parent.statements.slice(parentIndex + 1);
  const nextLabel = nextStatements.findIndex((x) => x.kind === ts.SyntaxKind.LabeledStatement);

  return [node.statement, ...(nextLabel === -1 ? nextStatements : nextStatements.slice(0, nextLabel))];
};

export const processLabeledStatement = (node: ts.LabeledStatement, state: State): void => {
  const blockType: BlockType = node.label.text as BlockType;

  switch (blockType) {
    case 'and':
      const length = state.blocks.length;
      if (length === 0)
        throw new Error(`'and' is not allowed here; instead, use one of: [setup, given, expect, when, cleanup, where, end-of-method]`);

      const andStatements = getLabelStatements(node);
      if (andStatements) state.blocks[length - 1].statements.push(...andStatements);
      break;

    case 'given':
    case 'setup':
    case 'when':
    case 'then':
    case 'expect':
    case 'cleanup':
    case 'where':
      const statements = getLabelStatements(node);
      if (statements) state.blocks.push({ type: blockType, statements });
      break;

    default:
      throw new Error(`Unhandled block type ${blockType}`);
  }
};
