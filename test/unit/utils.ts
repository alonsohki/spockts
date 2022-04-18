import ts from 'typescript';
import transformerFactory from '~/main';

export const transpile = (sourceCode: string, addDescribe: boolean = true): string => {
  const text = !addDescribe ? sourceCode : `
    describe('My test', () => {
      ${sourceCode}
    });`;

  const sourceFile = ts.createSourceFile('index.ts', text, ts.ScriptTarget.Latest, true);

  const program = ts.createProgram({
    rootNames: ['index.ts'],
    options: {},
  });
  
  const result = ts.transform(sourceFile, [transformerFactory(program)]);
  return ts.createPrinter().printNode(ts.EmitHint.SourceFile, result.transformed[0], sourceFile);
};
