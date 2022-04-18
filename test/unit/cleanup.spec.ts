import { transpile } from './utils';

describe('Cleanup', () => {
  describe('when chaining multiple cleanup steps', () => {
    it('should throw an error', () => {
      expect(() =>
        transpile(`
      cleanup:
      x.cleanup();

      cleanup:
      y.cleanup();
      `)
      ).toThrowErrorMatchingInlineSnapshot(`"'cleanup' is not allowed here; instead, use one of: [and, where, end-of-method]"`);
    });
  });

  describe(`when using 'cleanup'`, () => {
    it('should produce the expected output', () => {
      expect(
        transpile(`
      cleanup:
      let x = {};
      x.cleanup();
      `)
      ).toMatchInlineSnapshot(`
        "describe('My test', () => {
            afterAll(() => {
                let x = {};
                x.cleanup();
            });
        });
        "
      `);
    });
  });

  describe(`when using await`, () => {
    it('should produce the expected output', () => {
      expect(
        transpile(`
      cleanup:
      await x.cleanup();
      `)
      ).toMatchInlineSnapshot(`
        "describe('My test', () => {
            afterAll(async () => {
                await x.cleanup();
            });
        });
        "
      `);
    });
  });

  describe(`when combinding 'cleanup' with 'and'`, () => {
    it('should throw an error', () => {
      expect(
        transpile(`
      cleanup:
      x.cleanup();

      and:
      y.cleanup();
      `)
      ).toMatchInlineSnapshot(`
        "describe('My test', () => {
            afterAll(() => {
                x.cleanup();
                y.cleanup();
            });
        });
        "
      `);
    });
  });
});
