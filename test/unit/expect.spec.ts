import { transpile } from './utils';

describe('Expect blocks', () => {
  it('generates the expected output', () => {
    expect(transpile(`expect: "Expect block" 1 === 1`)).toMatchInlineSnapshot(`
      "describe('My test', () => {
          describe(\\"Expect block\\", () => {
              let $__spockts_thrown: unknown;
              let $__spockts_thrown_accessed: boolean;
              const thrown = () => {
                  $__spockts_thrown_accessed = true;
                  return $__spockts_thrown;
              };
              const $__spockts_thrown_unhandled = () => !$__spockts_thrown_accessed && $__spockts_thrown;
              test(\\"1 strictly equals 1\\", () => {
                  expect(1).toStrictEqual(1);
              });
          });
      });
      "
    `);
  });

  it('generates the same output as an equivalent when-then block', () => {
    const a = transpile(`expect: "My test" 1 === 1`);
    const b = transpile(`when: "My test" then: 1 === 1`);

    expect(a).toEqual(b);
  });
});
