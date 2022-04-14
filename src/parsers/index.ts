import ts from 'typescript';
import Frameworks from '~/frameworks';
import { State } from '~/state';

import jest from './jest-parser';

export type ParserCallback = {
  (title: ts.StringLiteral, state: State): ts.Node | undefined;
};

export type Parser = {
  (sourceFile: ts.SourceFile, context: ts.TransformationContext, callback: ParserCallback): ts.SourceFile;
};

const parsers: { [K in Frameworks]: Parser } = {
  jest,
};

export default parsers;
