import ts from 'typescript';
import { State } from './state';

export type ProcessorOutput = {
  title: ts.StringLiteral;
  state: State;
};
