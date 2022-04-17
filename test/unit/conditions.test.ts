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
          });
      });
      "
    `);
  });
});
