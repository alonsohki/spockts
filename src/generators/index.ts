import ts from 'typescript';
import { State } from '~/state';

import jest from './jest';

export type Generator = {
  (title: ts.StringLiteral, state: State, context: ts.TransformationContext): ts.Node;
};

export default {
  jest,
};
