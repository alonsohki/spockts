import { transpile } from './utils';

describe('Conditions', () => {
  it('should generate the expected output for each possible condition', () => {
    expect(
      transpile(`
    when:
    const a = 1, b = 2, c = [1, 2, 3], d = new Error();

    then:
    a == 1
    a === 1
    a != b
    a !== b
    a < b
    a <= b
    b > a
    b >= a
    1 in c

    d instanceof Error

    Number.isFinite(3)
    !Number.isFinite(3/0)

    a == NaN
    a === NaN

    !a == null
    a == null
    a === null
    null == a
    null === a

    a != null
    a !== null
    null != a
    null !== a

    a == undefined
    a === undefined
    undefined == a
    undefined === a

    a != undefined
    a !== undefined
    undefined != a
    undefined !== a

    !a
    `)
    ).toMatchInlineSnapshot(`
      "describe('My test', () => {
          let a, b, c, d;
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
                      c = [1, 2, 3];
                      d = new Error();
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
                  expect(a).toEqual(1);
                  expect(a).toStrictEqual(1);
                  expect(a).not.toEqual(b);
                  expect(a).not.toStrictEqual(b);
                  expect(a).toBeLessThan(b);
                  expect(a).toBeLessThanOrEqual(b);
                  expect(b).toBeGreaterThan(a);
                  expect(b).toBeGreaterThanOrEqual(a);
                  expect(c).toContain(1);
                  expect(d).toBeInstanceOf(Error);
                  expect(Number.isFinite(3)).toBeTruthy();
                  expect(Number.isFinite(3 / 0)).toBeFalsy();
                  expect(a).toEqual(NaN);
                  expect(a).toBeNaN();
                  expect(!a).toEqual(null);
                  expect(a).toEqual(null);
                  expect(a).toBeNull();
                  expect(null).toEqual(a);
                  expect(a).toBeNull();
                  expect(a).not.toEqual(null);
                  expect(a).not.toBeNull();
                  expect(null).not.toEqual(a);
                  expect(a).not.toBeNull();
                  expect(a).toEqual(undefined);
                  expect(a).toBeUndefined();
                  expect(undefined).toEqual(a);
                  expect(a).toBeUndefined();
                  expect(a).not.toEqual(undefined);
                  expect(a).not.toBeUndefined();
                  expect(undefined).not.toEqual(a);
                  expect(a).not.toBeUndefined();
                  expect(a).toBeFalsy();
              });
          });
      });
      "
    `);
  });
});
