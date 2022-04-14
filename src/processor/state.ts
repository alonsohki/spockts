import ts from 'typescript';
import { BlockType } from '../block-types';

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
