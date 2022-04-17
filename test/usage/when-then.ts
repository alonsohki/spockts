describe('when-then tests', () => {
  given:
  const a = 1, b = 2;

  when: "when adding a and b"
  const c = a + b;

  then:
  c === a + b
  c > a
  c > b

  when: "when assigning c to d"
  const d = c;

  then:
  d === a + b
  d > a
  d > b
});
