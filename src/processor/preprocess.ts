import { Block, BlockType } from './block';
import { State } from './state';

const expect = (block: Block, _state: State, _index: number): Block | Block[] => {
  //---------------------------------------------------------------------------
  // Transform expect blocks to When-Then
  return [
    { type: 'when', title: undefined, statements: [] },
    { type: 'then', title: block.title, statements: block.statements },
  ];
};

const given = (block: Block, _state: State, _index: number): Block | Block[] => {
  return { type: 'setup', title: block.title, statements: block.statements };
};

const and = (block: Block, state: State, index: number): Block | Block[] => {
  return {
    type: state.blocks[index - 1].type,
    title: block.title,
    statements: block.statements,
  } as Block;
};

type PreProcessorMap = {
  [K in BlockType]?: (block: Block, state: State, index: number) => Block | Block[];
};

export const preprocess = (state: State): State => {
  const preprocessors: PreProcessorMap = {
    given,
    expect,
    and,
  };

  return {
    blocks: state.blocks.flatMap((block, index) => {
      const preprocessor = preprocessors[block.type];
      return preprocessor ? preprocessor(block, state, index) : block;
    }),
  };
};
