import ts from 'typescript';
import transformerFactory from '~/main';

describe('Main test', () => {
  it('should do something', () => {
    const sourceFile = ts.createSourceFile(
      'index.ts',
      `
describe('My test', () => {
  it('should sum #a + #b === #c', () => {
    expect:
    a + b === c

    where:
    a | b || c
    1 | 2 || 3
    4 | 5 || 9
  });
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
      "describe('My test', () => {
          it.each([{}])('should sum #a + #b === #c', () => {
              a + b === c;
              a | b || c;
              1 | 2 || 3;
              4 | 5 || 9;
          });
      });
      "
    `);
  });
});
