# spockts
TypeScript transformer inspired in the [Spock framework](https://spockframework.org/).
This project is still Work In Progress, but should be soon available in npmjs.

## Example
```typescript
describe('where', () => {
  describe('$A + $B when using a single table', () => {
    expect: "A + B equals C"
    A + B === C

    where:
    A | B || C
    1 | 2 || 3
    4 | 5 || 9
  });

  describe('$A + $B when appending rows', () => {
    expect: "A + B equals C"
    A + B === C

    where:
    A | B || C
    1 | 2 || 3

    and:
    A | B || C
    4 | 5 || 9
  });

  describe('$A + $B when appending columns', () => {
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
```
