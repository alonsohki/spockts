import { transpile } from './utils';

describe('Spockts', () => {
  describe('When the describe callback is declared async', () => {
    it('should remove the async modifier', () => {
      expect(transpile(`describe('Some test', async() => { when: const x = 1; then: x === 1; });`, false)).toMatchInlineSnapshot(`
        "describe('Some test', () => {
            let x;
            describe(\\"\\", () => {
                let $__spockts_thrown: unknown;
                let $__spockts_thrown_accessed: boolean;
                const thrown = () => {
                    $__spockts_thrown_accessed = true;
                    return $__spockts_thrown;
                };
                const $__spockts_thrown_unhandled = () => !$__spockts_thrown_accessed && $__spockts_thrown;
                beforeAll(() => {
                    try {
                        $__spockts_thrown_accessed = false;
                        x = 1;
                    }
                    catch ($__err: unknown) {
                        $__spockts_thrown = $__err;
                    }
                });
                afterAll(() => {
                    const unhandled = $__spockts_thrown_unhandled();
                    if (unhandled)
                        throw unhandled;
                });
                test(\\"\\", () => {
                    expect(x).toStrictEqual(1);
                });
            });
        });
        "
      `);
    });
  });

  describe('when there are empty labels', () => {
    it('should parse them correctly', () => {
      expect(
        transpile(`
      given:
      and:
      and:
      when:
      then:
      1 + 1
      cleanup:
      and:
      cleanup();
      and:
      moreCleanup();`)
      ).toMatchInlineSnapshot(`
        "describe('My test', () => {
            afterAll(() => {
                cleanup();
                moreCleanup();
            });
            describe(\\"\\", () => {
                let $__spockts_thrown: unknown;
                let $__spockts_thrown_accessed: boolean;
                const thrown = () => {
                    $__spockts_thrown_accessed = true;
                    return $__spockts_thrown;
                };
                const $__spockts_thrown_unhandled = () => !$__spockts_thrown_accessed && $__spockts_thrown;
                test(\\"\\", () => {
                    expect(1 + 1).toBeTruthy();
                });
            });
        });
        "
      `);
    });
  });
});
