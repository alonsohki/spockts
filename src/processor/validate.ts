import ts from 'typescript';
import { Block, BlockType } from './block';
import { State } from './state';

type OrderingTable = { [K in BlockType]?: (BlockType | 'end-of-method')[] };
const orderingTable: OrderingTable = {
  given: ['expect', 'when', 'cleanup', 'where', 'end-of-method'],
  setup: ['expect', 'when', 'cleanup', 'where', 'end-of-method'],
  when: ['then'],
  then: ['expect', 'when', 'then', 'cleanup', 'where', 'end-of-method'],
  expect: ['when', 'cleanup', 'where', 'end-of-method'],
  cleanup: ['where', 'end-of-method'],
  where: ['end-of-method'],
};

const validateOrdering = (state: State): void => {
  // Check that the first type is not 'then' or 'and'
  const firstType = state.blocks[0].type;
  if (firstType === 'then' || firstType === 'and')
    throw new Error(`'${firstType}' is not allowed here; instead, use one of: [setup, given, expect, when, cleanup, where, end-of-method]`);

  // Guarantee the correct ordering of blocks
  const getBlockTypes = (blocks: Block[], fn: (type: BlockType, next: BlockType | 'end-of-method') => void) => {
    if (blocks.length > 0) {
      let prev = blocks[0].type;
      for (let index = 1; index < blocks.length; ++index) {
        let next = blocks[index].type;
        if (next === 'and') continue;
        fn(prev, next);
        prev = next;
      }
      fn(prev, 'end-of-method');
    }
  };

  getBlockTypes(state.blocks, (type, next) => {
    const ordering = orderingTable[type];
    if (ordering && !ordering.includes(next)) {
      throw new Error(`'${next}' is not allowed here; instead, use one of: [and, ${ordering.join(', ')}]`);
    }
  });
};

const hasBlocksMatching = (context: ts.TransformationContext, root: ts.Node, predicate: (node: ts.Node) => boolean): boolean => {
  let conditionMet = false;
  const visitor = (node: ts.Node): ts.Node => {
    if (predicate(node)) {
      conditionMet = true;
      return node;
    } else {
      return ts.visitEachChild(node, visitor, context);
    }
  };
  ts.visitNode(root, visitor);
  return conditionMet;
};

const validateWhereStatements = (context: ts.TransformationContext, state: State): void => {
  const whereStatements = state.blocks.filter((block) => block.type === 'where').flatMap((block) => block.statements);
  const nonExpressionStatement = whereStatements.find((statement) =>
    hasBlocksMatching(
      context,
      statement,
      (node) => node.kind >= ts.SyntaxKind.FirstStatement && node.kind <= ts.SyntaxKind.LastStatement && !ts.isExpressionStatement(node)
    )
  );

  if (nonExpressionStatement) throw new Error(`Unexpected non-expression statement in "where" block: ${nonExpressionStatement.getText()}`);
};

export const validate = (context: ts.TransformationContext, state: State): void => {
  if (state.blocks.length === 0) return;

  validateOrdering(state);
  validateWhereStatements(context, state);
};
