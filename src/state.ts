import ts from 'typescript';

export type BlockType = 'given' | 'then' | 'expect' | 'when' | 'where';

export type State = {
  [K in BlockType]: ts.Statement[];
};

export const createState = (): State => {
  return {
    given: [],
    then: [],
    expect: [],
    when: [],
    where: [],
  };
};
