import { BlockType } from 'src/block-types';
import { State } from './state';

export const validate = (state: State): void => {
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
};
