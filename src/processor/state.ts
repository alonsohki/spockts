import ts from 'typescript';
import { BlockType } from '../block-types';

export type Block = {
  type: BlockType;
  statements: ts.Statement[];
};

export type State = {
  blocks: Block[];
};

export const createState = (): State => {
  return {
    blocks: [],
  };
};
