import ts from 'typescript';

const transformer: ts.TransformerFactory<ts.SourceFile> =
  (context) => (sourceFile) => {
    /*const visitor = (node: ts.Node): ts.Node => {
    return ts.visitEachChild(node, visitor, context);
  };

  return ts.visitNode(sourceFile, visitor);*/
    return sourceFile;
  };

export default (_program: ts.Program) => transformer;
