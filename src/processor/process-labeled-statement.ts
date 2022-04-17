import ts from 'typescript';
import { Block, BlockType } from './block';
import { State } from './state';

type RetType<T extends BlockType> = T extends 'given' | 'setup' | 'when' | 'cleanup'
  ? ts.Statement
  : T extends 'and'
  ? never
  : ts.ExpressionStatement;

const getLabelStatements = <T extends BlockType>(
  type: T,
  node: ts.LabeledStatement
): { title?: ts.StringLiteral; statements: RetType<T>[] } | null => {
  if (type === 'and') throw new Error(`Invalid block type 'and' when reading label statements`);

  const checkStatements = (statements: ts.Statement[]): RetType<T>[] => {
    if (type === 'given' || type === 'setup' || type === 'when') return statements as RetType<T>[];
    const nonExpression = statements.find((statement) => !ts.isExpressionStatement(statement));
    if (nonExpression) {
      throw new Error(`Blocks that are not 'given' or 'setup' cannot contain non-expression statements. Found: ${nonExpression.getText()}`);
    }
    return statements as RetType<T>[];
  };

  if (!ts.isBlock(node.parent)) return null;

  const parentIndex = node.parent.statements.findIndex((x) => x === node);
  const nextStatements = node.parent.statements.slice(parentIndex + 1);
  const nextLabel = nextStatements.findIndex((x) => x.kind === ts.SyntaxKind.LabeledStatement);
  const title = (ts.isExpressionStatement(node.statement) && ts.isStringLiteral(node.statement.expression) && node.statement.expression) || undefined;

  const statements = checkStatements([
    ...(title ? [] : [node.statement]),
    ...(nextLabel === -1 ? nextStatements : nextStatements.slice(0, nextLabel)),
  ]);
  return { title, statements };
};

const processBlockOfType = (node: ts.LabeledStatement, blockType: BlockType): Block | undefined => {
  switch (blockType) {
    case 'given':
    case 'setup':
    case 'when':
    case 'cleanup':
      {
        const data = getLabelStatements(blockType, node);
        if (data.statements) return { title: data.title, type: blockType, statements: data.statements };
      }
      break;

    case 'then':
    case 'expect':
    case 'where':
      {
        const data = getLabelStatements(blockType, node);
        if (data.statements) return { title: data.title, type: blockType, statements: data.statements };
      }
      break;

    default:
      throw new Error(`Unhandled block type ${blockType}`);
  }
};

const processBlock = (node: ts.LabeledStatement, state: State): void => {
  let blockType = node.label.text as BlockType;

  if (blockType === 'and') {
    const length = state.blocks.length;
    if (length === 0) throw new Error(`'and' is not allowed here; instead, use one of: [setup, given, expect, when, cleanup, where, end-of-method]`);

    const prevBlock = state.blocks[length - 1];
    const block = processBlockOfType(node, prevBlock.type);
    (prevBlock.statements as any[]).push(...block.statements);
    return;
  }

  state.blocks.push(processBlockOfType(node, blockType));
};

export const processLabeledStatement = (node: ts.LabeledStatement, state: State) => processBlock(node, state);
