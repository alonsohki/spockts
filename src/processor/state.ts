import { Block } from './block';

export type State = {
  blocks: Block[];
};

export const createState = (): State => {
  return {
    blocks: [],
  };
};
