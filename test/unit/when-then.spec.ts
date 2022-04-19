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
                        a = 1;
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
                    expect(a).toStrictEqual(1);
                });
            });
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
                        b = 2;
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
                    expect(a).toStrictEqual(b);
                });
            });
        });
        "
      `);
    });
  });

  describe('when combining when-then with and', () => {
    it('should produce the expected output', () => {
      expect(
        transpile(`
      when:
      const a = 1;
      and:
      const b = 2;
      then:
      a < b
      and:
      b > a
      `)
      ).toMatchInlineSnapshot(`
        "describe('My test', () => {
            let a;
            let b;
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
                        a = 1;
                        b = 2;
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
                    expect(a).toBeLessThan(b);
                });
                test(\\"\\", () => {
                    expect(b).toBeGreaterThan(a);
                });
            });
        });
        "
      `);
    });
  });
});
