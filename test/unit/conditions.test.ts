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
              beforeAll(() => {
                  a = 1;
                  b = 2;
                  c = [1, 2, 3];
                  d = new Error();
              });
              test(\\"a equals 1\\", () => {
                  expect(a).toEqual(1);
              });
              test(\\"a strictly equals 1\\", () => {
                  expect(a).toStrictEqual(1);
              });
              test(\\"a does not equal b\\", () => {
                  expect(a).not.toEqual(b);
              });
              test(\\"a does not strictly equal b\\", () => {
                  expect(a).not.toStrictEqual(b);
              });
              test(\\"a is less than b\\", () => {
                  expect(a).toBeLessThan(b);
              });
              test(\\"a is less or equal than b\\", () => {
                  expect(a).toBeLessThanOrEqual(b);
              });
              test(\\"b is greater than a\\", () => {
                  expect(b).toBeGreaterThan(a);
              });
              test(\\"b is greater or equal than a\\", () => {
                  expect(b).toBeGreaterThanOrEqual(a);
              });
              test(\\"c contains 1\\", () => {
                  expect(c).toContain(1);
              });
              test(\\"d is an instance of Error\\", () => {
                  expect(d).toBeInstanceOf(Error);
              });
              test(\\"!a equals null\\", () => {
                  expect(!a).toEqual(null);
              });
              test(\\"a equals null\\", () => {
                  expect(a).toEqual(null);
              });
              test(\\"a is null\\", () => {
                  expect(a).toBeNull();
              });
              test(\\"null equals a\\", () => {
                  expect(null).toEqual(a);
              });
              test(\\"a is null\\", () => {
                  expect(a).toBeNull();
              });
              test(\\"a does not equal null\\", () => {
                  expect(a).not.toEqual(null);
              });
              test(\\"a is not null\\", () => {
                  expect(a).not.toBeNull();
              });
              test(\\"null does not equal a\\", () => {
                  expect(null).not.toEqual(a);
              });
              test(\\"a is not null\\", () => {
                  expect(a).not.toBeNull();
              });
              test(\\"a equals undefined\\", () => {
                  expect(a).toEqual(undefined);
              });
              test(\\"a is undefined\\", () => {
                  expect(a).toBeUndefined();
              });
              test(\\"undefined equals a\\", () => {
                  expect(undefined).toEqual(a);
              });
              test(\\"a is undefined\\", () => {
                  expect(a).toBeUndefined();
              });
              test(\\"a does not equal undefined\\", () => {
                  expect(a).not.toEqual(undefined);
              });
              test(\\"a is not undefined\\", () => {
                  expect(a).not.toBeUndefined();
              });
              test(\\"undefined does not equal a\\", () => {
                  expect(undefined).not.toEqual(a);
              });
              test(\\"a is not undefined\\", () => {
                  expect(a).not.toBeUndefined();
              });
              test(\\"a is falsy\\", () => {
                  expect(a).toBeFalsy();
              });
          });
      });
      "
    `);
  });
});
