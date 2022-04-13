import ts from 'typescript';
import { parseGrammar } from './grammar';

export default (_program: ts.Program): ts.TransformerFactory<ts.SourceFile> =>
  (context) =>
  (sourceFile) => {
    return parseGrammar(sourceFile, context);
  };
