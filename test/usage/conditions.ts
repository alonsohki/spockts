describe('Conditions', () => {
  when:
  const a = 1, b = 2, c = [1, 2, 3], d = new Error();

  then:
  a == 1
  a === 1
  a != a + 1
  a !== a + 1
  a < b
  a <= b
  b > a
  b >= a
  1 in c
  d instanceof Error
});
