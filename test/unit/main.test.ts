import { transpile } from './utils';

describe('Main test', () => {
  it('should do something', () => {
    expect(
      transpile(`
  given:
  const x: number = 1;

  and:
  const { p: P = 1, q: { r: R, s: [t, ...u] }, ...rest } = { p: 3, q: { r: 4, s: [0, 1, 2] } };
  P = 100;
  const [m = P + 12, n] = [2, 3];

  when: "setting w to 1"
  const w = 1;

  then:
  w > 0

  and:
  w === 1
      `)
    ).toMatchInlineSnapshot(`
      "describe('My test', () => {
          let x: number;
          let P, R, t, u, rest;
          let m, n;
          let w;
          beforeAll(() => {
              x = 1;
              ({ p: P = 1, q: { r: R, s: [t, ...u] }, ...rest } = { p: 3, q: { r: 4, s: [0, 1, 2] } });
              P = 100;
              ([m = P + 12, n] = [2, 3]);
          });
          describe(\\"setting w to 1\\", () => {
              beforeAll(() => {
                  w = 1;
              });
              test(\\"w is greater than 0\\", () => {
                  expect(w).toBeGreaterThan(0);
              });
              test(\\"w strictly equals 1\\", () => {
                  expect(w).toStrictEqual(1);
              });
          });
      });
      "
    `);
  });
});
