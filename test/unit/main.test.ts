import { transpile } from './utils';

describe('Main test', () => {
  it('should do something', () => {
    expect(transpile(`
  given:
  const x: number = 1;

  and:
  const { p: P = 1, q: { r: R, s: [t, ...u] }, ...rest } = { p: 3, q: { r: 4, s: [0, 1, 2] } };
  P = 100;
  const [m = P + 12, n] = [2, 3];

  when:
  const w = 1;

  then:
  w > 0

  and:
  w === 1
      `))
      .toMatchInlineSnapshot(`
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
          describe(\\"\\", () => {
              beforeAll(() => {
                  w = 1;
              });
              it(\\"w > 0\\", () => {
                  expect(w > 0).toBeTruthy();
              });
              it(\\"w === 1\\", () => {
                  expect(w === 1).toBeTruthy();
              });
          });
      });
      "
    `);
  });
});
