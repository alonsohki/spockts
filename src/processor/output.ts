import ts from 'typescript';
import { Condition } from './conditions';
import { SetupBlockInfo } from './process-setup-block';
import { State } from './state';

export type ThenBlock = {
  title: ts.StringLiteral;
  async: boolean;
  setup: SetupBlockInfo;
  conditions: Condition[];
};

export type WhenThenBlock = {
  title?: ts.StringLiteral;
  when: SetupBlockInfo;
  then: ThenBlock[];
};

export type CleanupInfo = {
  statements: ts.Statement[];
  async: boolean;
};

export type ProcessorOutput = {
  title: ts.StringLiteral;
  setup: SetupBlockInfo;
  cleanup: CleanupInfo;
  whenThen: WhenThenBlock[];
  state: State;
};
