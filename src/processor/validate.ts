import ts from 'typescript';
import { BlockType } from './block';
import { State } from './state';

export const validate = (state: State, context: ts.TransformationContext): void => {
  if (state.blocks.length === 0) return;

  const findNotFollowedBy = (types: BlockType[], followedBy: BlockType[], acceptEndOfMethod: boolean) => {
    const idx = state.blocks.findIndex(
      (block, index, blocks) =>
        types.some((t) => t === block.type) &&
        ((blocks.length <= index + 1 && !acceptEndOfMethod) || (blocks.length > index + 1 && !followedBy.some((t) => t === blocks[index + 1].type)))
    );

    return idx !== -1 ? [state.blocks[idx], state.blocks[idx + 1]] : [];
  };

  const validateOrder = (check: BlockType[], followedBy: BlockType[], acceptEndOfMethod: boolean) => {
    const [block, follower] = findNotFollowedBy(check, followedBy, acceptEndOfMethod);
    if (block) {
      const allowedStr = `[${followedBy.join(', ') + (acceptEndOfMethod ? ', end-of-method' : '')}]`;
      throw new Error(`'${follower?.type || 'end-of-method'}' is not allowed here; instead, use one of: ${allowedStr}`);
    }
  };

  if (state.blocks[0].type === 'then')
    throw new Error(
      `'${state.blocks[0].type}' is not allowed here; instead, use one of: [setup, given, expect, when, cleanup, where, end-of-method]`
    );

  validateOrder(['given', 'setup'], ['and', 'expect', 'when', 'cleanup', 'where'], true);
  validateOrder(['when'], ['and', 'then'], false);
  validateOrder(['then'], ['and', 'expect', 'when', 'then', 'cleanup', 'where'], true);
  validateOrder(['expect'], ['and', 'when', 'cleanup', 'where'], true);
  validateOrder(['cleanup'], ['and', 'where'], true);
  validateOrder(['where', 'and'], ['and'], true);

  const hasBlocksMatching = (root: ts.Node, predicate: (node: ts.Node) => boolean): boolean => {
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

  const nonSetupStatements = state.blocks
    .filter((block) => !['given', 'setup', 'when'].includes(block.type as string))
    .flatMap((block) => block.statements);
  if (nonSetupStatements.some((statement) => hasBlocksMatching(statement, ts.isVariableDeclarationList)))
    throw new Error(`Only 'given', 'setup' and 'when' blocks can have variable declarations`);

  if (nonSetupStatements.some((statement) => !ts.isExpressionStatement(statement)))
    throw new Error(`Only expression statements are allowed in blocks that are not 'given' or 'setup'`);
};
