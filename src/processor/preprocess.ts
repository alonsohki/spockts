import { Block, BlockType } from './block';
import { State } from './state';

const expect = (block: Block): Block[] => {
  //---------------------------------------------------------------------------
  // Transform expect blocks to When-Then
  return [
    { type: 'when', title: undefined, statements: [] },
    { type: 'then', title: block.title, statements: block.statements },
  ];
};

const given = (block: Block): Block => {
  return { type: 'setup', title: block.title, statements: block.statements };
};

const and = (block: Block, _oldState: ReadonlyArray<Block>, _index: number, newState: ReadonlyArray<Block>): Block => {
  return {
    type: newState[newState.length - 1].type,
    title: block.title,
    statements: block.statements,
  } as Block;
};

export const preprocess = (state: State): State => {
  type PreProcessor = (block: Block, oldState: ReadonlyArray<Block>, index: number, newState: ReadonlyArray<Block>) => Block | Block[];

  type PreProcessorMap = {
    [K in BlockType]?: PreProcessor;
  };

  const preprocessors: PreProcessorMap = {
    given,
    expect,
    and,
  };

  const newBlocks = state.blocks.reduce((newState, block, index, oldState) => {
    const preprocessor = preprocessors[block.type];
    const newBlocks = preprocessor ? preprocessor(block, oldState, index, newState) : block;
    newState.push(...(Array.isArray(newBlocks) ? newBlocks : [newBlocks]));
    return newState;
  }, [] as Block[]);

  return {
    blocks: newBlocks,
  };
};
