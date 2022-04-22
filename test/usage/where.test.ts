let A: number, B: number, C: number;

describe.skip('where $A + $B = $C', () => {
  expect: "A + B equals C"
  A + B === C

  where:
  A | B || C
  1 | 2 || 3
  4 | 5 || 9
});
