import ts from 'typescript';
import { Framework } from '../frameworks';

import jest from './jest-parser';

export type ParserCallback = {
  (title: ts.StringLiteral, block: ts.Block, node: ts.Node): ts.Node | undefined;
};

export type Parser = {
  (sourceFile: ts.SourceFile, context: ts.TransformationContext, callback: ParserCallback): ts.SourceFile;
};

const parsers: { [K in Framework]: Parser } = {
  jest,
};

export default parsers;
