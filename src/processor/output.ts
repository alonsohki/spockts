import ts from 'typescript';
import { Condition } from './conditions';
import { SetupBlockInfo } from './process-setup-block';

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

export type WhereInfo = {
  cases: Record<string, ts.Expression>[];
};

export type ProcessorOutput = {
  title: ts.StringLiteral;
  setup: SetupBlockInfo;
  cleanup: CleanupInfo;
  whenThen: WhenThenBlock[];
  where: WhereInfo;
};
