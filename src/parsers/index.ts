import ts from 'typescript';
import Frameworks from '../frameworks';

import jest from './jest-parser';

export type ParserCallback = {
  (title: ts.StringLiteral, block: ts.Block): ts.Node | undefined;
};

export type Parser = {
  (sourceFile: ts.SourceFile, context: ts.TransformationContext, callback: ParserCallback): ts.SourceFile;
};

const parsers: { [K in Frameworks]: Parser } = {
  jest,
};

export default parsers;
