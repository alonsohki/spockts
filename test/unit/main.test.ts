import ts from 'typescript';
import transformerFactory from '~/main';

describe('Main test', () => {
  it('should do something', () => {
    const sourceFile = ts.createSourceFile(
      'index.ts',
      `
describe('Some test', () => {
  given:
  const x: number = 1;

  and:
  const { p: P = 1, q: { r: R, s: [t, ...u] }, ...rest } = { p: 3, q: { r: 4, s: [0, 1, 2] } };
  P = 100;
  const [m = P + 12, n] = [2, 3];

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
          let x: number;
          let P, R, t, u, rest;
          let m, n;
          x = 1;
          ({ p: P = 1, q: { r: R, s: [t, ...u] }, ...rest } = { p: 3, q: { r: 4, s: [0, 1, 2] } });
          P = 100;
          ([m = P + 12, n] = [2, 3]);
      });
      "
    `);
  });
});
