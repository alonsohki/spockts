import ts from 'typescript';
import { Condition } from './conditions';
import { SetupBlockInfo } from './process-setup-block';
import { State } from './state';

export type WhenThenBlock = {
  when: SetupBlockInfo;
  then: Condition[];
};

export type ProcessorOutput = {
  title: ts.StringLiteral;
  setup: SetupBlockInfo;
  whenThen: WhenThenBlock[];
  state: State;
};
