import ts from 'typescript';
import transformerFactory from '~/main';

describe('Main test', () => {
  it('should do something', () => {
    const sourceFile = ts.createSourceFile(
      'index.ts',
      'let a: number = 5; console.log(a);',
      ts.ScriptTarget.ES2015
    );
    const program = ts.createProgram({
      rootNames: ['index.ts'],
      options: {},
    });
    const result = ts.transform(sourceFile, [transformerFactory(program)]);
    const printed = ts
      .createPrinter()
      .printNode(ts.EmitHint.SourceFile, result.transformed[0], sourceFile);

    expect(printed).toMatchInlineSnapshot(`
      "let a: number = 5;
      console.log(a);
      "
    `);
  });
});
