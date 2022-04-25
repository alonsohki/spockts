let A: number, B: number, C: number;

describe('where', () => {
  describe('$A + $B when using a single table', () => {
    expect: "A + B equals C"
    A + B === C

    where:
    A | B || C
    1 | 2 || 3
    4 | 5 || 9
  });

  describe('$A + $B when using a appending rows', () => {
    expect: "A + B equals C"
    A + B === C

    where:
    A | B || C
    1 | 2 || 3

    and:
    A | B || C
    4 | 5 || 9
  });

  describe('$A + $B when using a appending columns', () => {
    expect: "A + B equals C"
    A + B === C

    where:
    A | B
    1 | 2
    4 | 5

    and:
    C
    3
    9
  });
});
