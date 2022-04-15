import ts from 'typescript';
import transformerFactory from '~/main';

describe('Main test', () => {
  it('should do something', () => {
    const sourceFile = ts.createSourceFile(
      'index.ts',
      `
describe('Some test', () => {
  given:
  const x = 1;

  and:
  const y = 2;

  expect:
  x + 1 === 2

  and:
  x + 2 === 3
});
      `,
      ts.ScriptTarget.Latest,
      true
    );
    const program = ts.createProgram({
      rootNames: ['index.ts'],
      options: {},
    });
    const result = ts.transform(sourceFile, [transformerFactory(program)]);
    const printed = ts.createPrinter().printNode(ts.EmitHint.SourceFile, result.transformed[0], sourceFile);

    expect(printed).toMatchInlineSnapshot(`
      "describe('Some test', () => {
          const x = 1;
          const y = 2;
          x + 1 === 2;
          x + 2 === 3;
      });
      "
    `);
  });
});
