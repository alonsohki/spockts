import { transpile } from './utils';

describe('when-then', () => {
  describe('when there are multiple when-then blocks', () => {
    it('should run one after the other', () => {
      expect(
        transpile(`
      when:
      const a = 1;
      
      then:
      a === 1
      
      when:
      const b = 2;

      then:
      a === b
    `)
      ).toMatchInlineSnapshot(`
        "describe('My test', () => {
            let a;
            let b;
            beforeAll(() => {
            });
            describe(\\"\\", () => {
                beforeAll(() => {
                    a = 1;
                });
                test(\\"a strictly equals 1\\", () => {
                    expect(a).toStrictEqual(1);
                });
            });
            describe(\\"\\", () => {
                beforeAll(() => {
                    b = 2;
                });
                test(\\"a strictly equals b\\", () => {
                    expect(a).toStrictEqual(b);
                });
            });
        });
        "
      `);
    });
  });
});
