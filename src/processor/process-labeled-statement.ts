import ts from 'typescript';
import { Block, BlockType } from './block';
import { State } from './state';

type BlockInfo<T extends BlockType> = {
  title?: ts.StringLiteral;
  statements: RetType<T>[];
};

type RetType<T extends BlockType> = T extends 'expect' | 'when' | 'then' | 'setup' | 'given' | 'cleanup' ? ts.Statement : ts.ExpressionStatement;

const getLabelStatements = <T extends BlockType>(_type: T, node: ts.LabeledStatement): BlockInfo<T> | null => {
  // Check for labels followed by labels, which can be considered as empty blocks. For example:
  //
  // when:
  // then:
  // a + b == c
  //
  if (ts.isLabeledStatement(node.statement)) return { statements: [] };

  // There might be a chain of nested labels, such as:
  //
  // when:
  // then:
  // when:
  // then:
  // a + b === c
  //
  // In these cases, all the nested labels are considered as child of each other, so we need to iteratively
  // resolve who is the topmost parent and the immediate child (prev).
  let parent: ts.Node = node;
  let prev: ts.Node;
  do {
    prev = parent;
    parent = parent.parent;
  } while (ts.isLabeledStatement(parent));

  // A spockts block should be part of a Block node. Otherwise, something went wrong.
  if (!ts.isBlock(parent)) return null;

  const parentIndex = parent.statements.findIndex((x) => x === prev);
  const nextStatements = parent.statements.slice(parentIndex + 1);
  const nextLabel = nextStatements.findIndex((x) => x.kind === ts.SyntaxKind.LabeledStatement);
  const title = (ts.isExpressionStatement(node.statement) && ts.isStringLiteral(node.statement.expression) && node.statement.expression) || undefined;

  const statements = [
    ...(title ? [] : [node.statement]),
    ...(nextLabel === -1 ? nextStatements : nextStatements.slice(0, nextLabel)),
  ] as RetType<T>[];

  return { title, statements };
};

const processBlockOfType = (node: ts.LabeledStatement, blockType: BlockType): Block | undefined => {
  switch (blockType) {
    case 'given':
    case 'setup':
    case 'when':
    case 'cleanup':
    case 'then':
    case 'expect':
    case 'and':
      {
        const data = getLabelStatements(blockType, node);
        if (data) return { type: blockType, title: data.title, statements: data.statements };
      }
      break;

    case 'where':
      {
        const data = getLabelStatements(blockType, node);
        if (data) return { type: blockType, title: data.title, statements: data.statements };
      }
      break;

    default:
      throw new Error(`Unhandled block type ${blockType}`);
  }
};

const processBlock = (node: ts.LabeledStatement, state: State): void => {
  let blockType = node.label.text as BlockType;
  const block = processBlockOfType(node, blockType);
  if (block) state.blocks.push(block);
};

export const processLabeledStatement = (node: ts.LabeledStatement, state: State) => processBlock(node, state);
