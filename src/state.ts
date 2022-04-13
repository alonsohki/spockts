import ts from 'typescript';

export type BlockType = 'expect' | 'where';

export type State = {
  [K in BlockType]: ts.Statement[];
};

export const createState = (): State => {
  return {
    expect: [],
    where: [],
  };
};
