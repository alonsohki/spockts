import { transpile } from './utils';

describe('Setup', () => {
  describe('when chaining multiple setup steps', () => {
    it('should throw an error', () => {
      expect(() =>
        transpile(`
      given:
      const x = 1;

      given:
      const y = 1;
      `)
      ).toThrowErrorMatchingInlineSnapshot(`"'given' is not allowed here; instead, use one of: [and, expect, when, cleanup, where, end-of-method]"`);
    });
  });

  describe(`when using 'given'`, () => {
    it('should produce the expected output', () => {
      expect(
        transpile(`
      given:
      const x: number = 1, y: number = 2;
      `)
      ).toMatchInlineSnapshot(`
        "describe('My test', () => {
            let x: number, y: number;
            beforeAll(() => {
                x = 1;
                y = 2;
            });
        });
        "
      `);
    });
  });

  describe(`when using 'setup'`, () => {
    it('should produce the expected output', () => {
      expect(
        transpile(`
      setup:
      const x: number = 1;
      `)
      ).toMatchInlineSnapshot(`
        "describe('My test', () => {
            let x: number;
            beforeAll(() => {
                x = 1;
            });
        });
        "
      `);
    });
  });

  describe(`when combinding 'given' with 'setup'`, () => {
    it('should throw an error', () => {
      expect(() =>
        transpile(`
      given:
      const x: number = 1;

      setup:
      const y: number = 1;
      `)
      ).toThrowErrorMatchingInlineSnapshot(`"'setup' is not allowed here; instead, use one of: [and, expect, when, cleanup, where, end-of-method]"`);
    });
  });

  describe(`when combinding 'given' with 'and'`, () => {
    it('should throw an error', () => {
      expect(
        transpile(`
      given:
      const x: number = 1;

      and:
      const y: number = 1;
      `)
      ).toMatchInlineSnapshot(`
        "describe('My test', () => {
            let x: number;
            let y: number;
            beforeAll(() => {
                x = 1;
                y = 1;
            });
        });
        "
      `);
    });
  });

  describe(`when using destructuring patterns`, () => {
    it('processes object destructuring patterns', () => {
      expect(
        transpile(`
      given:
      const { a = 1, b: B, c: { d: D = 3, ...e }, ...f } = { a: 1, b: 2, c: { d: 3, e1: 4, e2: 5 }, f1: 6, f2: 7 };
        `)
      ).toMatchInlineSnapshot(`
        "describe('My test', () => {
            let a, B, D, e, f;
            beforeAll(() => {
                ({ a = 1, b: B, c: { d: D = 3, ...e }, ...f } = { a: 1, b: 2, c: { d: 3, e1: 4, e2: 5 }, f1: 6, f2: 7 });
            });
        });
        "
      `);
    });

    it('processes array destructuring patterns', () => {
      expect(
        transpile(`
      given:
      const [ a, b, ...rest ] = [ 1, 2, 3, 4, 5 ];
        `)
      ).toMatchInlineSnapshot(`
        "describe('My test', () => {
            let a, b, rest;
            beforeAll(() => {
                ([a, b, ...rest] = [1, 2, 3, 4, 5]);
            });
        });
        "
      `);
    });

    it('processes combined destructuring patterns', () => {
      expect(
        transpile(`
      given:
      const { a, b: [c, ...d], ...e } = fn();
        `)
      ).toMatchInlineSnapshot(`
        "describe('My test', () => {
            let a, c, d, e;
            beforeAll(() => {
                ({ a, b: [c, ...d], ...e } = fn());
            });
        });
        "
      `);
    });
  });
});
