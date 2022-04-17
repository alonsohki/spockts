import ts from 'typescript';
import { BlockInfo as SetupBlockInfo } from './process-setup-block';
import { State } from './state';

export type WhenThenBlock = {
  when: SetupBlockInfo;
  then: ts.ExpressionStatement[];
};

export type ProcessorOutput = {
  title: ts.StringLiteral;
  setup: SetupBlockInfo;
  whenThen: WhenThenBlock[];
  state: State;
};
