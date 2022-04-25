import { transpile } from './utils';

describe('where', () => {
  describe('when passing a well formed table', () => {
    it('should match the expected output', () => {
      expect(
        transpile(
          ` let A: number, B: number, C: number;
      describe('$A + $B equals $C', () => {
        expect:
        A + B === C

        where:
        A | B | C
        1 | 2 | 3
      })`,
          false
        )
      ).toMatchInlineSnapshot(`
        "let A: number, B: number, C: number;
        describe.each([
            { A: 1, B: 2, C: 3 }
        ])('$A + $B equals $C', ({ A, B, C }) => {
            describe(\\"\\", () => {
                let $__spockts_thrown: unknown;
                let $__spockts_thrown_accessed: boolean;
                const thrown = () => {
                    $__spockts_thrown_accessed = true;
                    return $__spockts_thrown;
                };
                const $__spockts_thrown_unhandled = () => !$__spockts_thrown_accessed && $__spockts_thrown;
                test(\\"\\", () => {
                    expect(A + B).toStrictEqual(C);
                });
            });
        });
        "
      `);
    });

    it('should handle double bars', () => {
      expect(
        transpile(
          `
      let A: number, B: number, C: number;
      describe('$A + $B equals $C', () => {
        expect:
        A + B === C

        where:
        A | B || C
        1 | 2 || 3
      })`,
          false
        )
      ).toMatchInlineSnapshot(`
        "let A: number, B: number, C: number;
        describe.each([
            { A: 1, B: 2, C: 3 }
        ])('$A + $B equals $C', ({ A, B, C }) => {
            describe(\\"\\", () => {
                let $__spockts_thrown: unknown;
                let $__spockts_thrown_accessed: boolean;
                const thrown = () => {
                    $__spockts_thrown_accessed = true;
                    return $__spockts_thrown;
                };
                const $__spockts_thrown_unhandled = () => !$__spockts_thrown_accessed && $__spockts_thrown;
                test(\\"\\", () => {
                    expect(A + B).toStrictEqual(C);
                });
            });
        });
        "
      `);
    });
  });

  describe('when appending where blocks using and', () => {
    it('should support adding extra rows', () => {
      expect(
        transpile(
          `
      let A: number, B: number, C: number;
      describe('$A + $B equals $C', () => {
        expect:
        A + B === C

        where:
        A | B || C
        1 | 2 || 3

        and:
        A | B || C
        4 | 5 || 9
      })`,
          false
        )
      ).toMatchInlineSnapshot(`
        "let A: number, B: number, C: number;
        describe.each([
            { A: 1, B: 2, C: 3 },
            { A: 4, B: 5, C: 9 }
        ])('$A + $B equals $C', ({ A, B, C }) => {
            describe(\\"\\", () => {
                let $__spockts_thrown: unknown;
                let $__spockts_thrown_accessed: boolean;
                const thrown = () => {
                    $__spockts_thrown_accessed = true;
                    return $__spockts_thrown;
                };
                const $__spockts_thrown_unhandled = () => !$__spockts_thrown_accessed && $__spockts_thrown;
                test(\\"\\", () => {
                    expect(A + B).toStrictEqual(C);
                });
            });
        });
        "
      `);
    });

    it('should support adding extra columns', () => {
      expect(
        transpile(
          `
      let A: number, B: number, C: number;
      describe('$A + $B equals $C', () => {
        expect:
        A + B === C

        where:
        A | B
        1 | 2
        4 | 5

        and:
        C
        3
        9
      })`,
          false
        )
      ).toMatchInlineSnapshot(`
        "let A: number, B: number, C: number;
        describe.each([
            { A: 1, B: 2, C: 3 },
            { A: 4, B: 5, C: 9 }
        ])('$A + $B equals $C', ({ A, B, C }) => {
            describe(\\"\\", () => {
                let $__spockts_thrown: unknown;
                let $__spockts_thrown_accessed: boolean;
                const thrown = () => {
                    $__spockts_thrown_accessed = true;
                    return $__spockts_thrown;
                };
                const $__spockts_thrown_unhandled = () => !$__spockts_thrown_accessed && $__spockts_thrown;
                test(\\"\\", () => {
                    expect(A + B).toStrictEqual(C);
                });
            });
        });
        "
      `);
    });

    it('should be okay with appending rows in different order', () => {
      expect(
        transpile(
          `
      let A: number, B: number, C: number;
      describe('$A + $B equals $C', () => {
        expect:
        A + B === C

        where:
        A | B || C
        1 | 2 || 3

        and:
        C || A | B
        9 || 4 | 5
      })`,
          false
        )
      ).toMatchInlineSnapshot(`
        "let A: number, B: number, C: number;
        describe.each([
            { A: 1, B: 2, C: 3 },
            { C: 9, A: 4, B: 5 }
        ])('$A + $B equals $C', ({ A, B, C }) => {
            describe(\\"\\", () => {
                let $__spockts_thrown: unknown;
                let $__spockts_thrown_accessed: boolean;
                const thrown = () => {
                    $__spockts_thrown_accessed = true;
                    return $__spockts_thrown;
                };
                const $__spockts_thrown_unhandled = () => !$__spockts_thrown_accessed && $__spockts_thrown;
                test(\\"\\", () => {
                    expect(A + B).toStrictEqual(C);
                });
            });
        });
        "
      `);
    });
  });

  describe('when doing bad appends of where blocks', () => {
    it('should fail with column appends with equal column names', () => {
      expect(() =>
        transpile(
          `
      let A: number, B: number, C: number;
      describe('$A + $B equals $C', () => {
        expect:
        A + B === C

        where:
        A | B || C
        1 | 2 || 3

        and:
        A | B || D
        4 | 5 || 9
      })`,
          false
        )
      ).toThrowErrorMatchingInlineSnapshot(`"Where clause columns must match either all or none of the colume names"`);
    });

    it('should fail with row appends with unequal column counts', () => {
      expect(() =>
        transpile(
          `
      let A: number, B: number, C: number;
      describe('$A + $B equals $C', () => {
        expect:
        A + B === C

        where:
        A | B || C
        1 | 2 || 3

        and:
        A | B
        4 | 5
      })`,
          false
        )
      ).toThrowErrorMatchingInlineSnapshot(`"Where clause columns must match either all or none of the colume names"`);
    });
  });
});
