import ts from 'typescript';
import fs from 'fs';
import transformerFactory from './main';

const sourceText = fs.readFileSync(0).toString();
const sourceFile = ts.createSourceFile('index.ts', sourceText, ts.ScriptTarget.Latest, true);

const program = ts.createProgram({
  rootNames: ['index.ts'],
  options: {},
});

const result = ts.transform(sourceFile, [transformerFactory(program)]);
process.stdout.write(ts.createPrinter().printNode(ts.EmitHint.SourceFile, result.transformed[0], sourceFile));
