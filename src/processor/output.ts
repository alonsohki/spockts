import ts from 'typescript';
import { Setup } from './setup-blocks';
import { State } from './state';

export type ProcessorOutput = {
  title: ts.StringLiteral;
  setup: Setup;
  state: State;
};
