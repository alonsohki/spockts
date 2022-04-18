describe('Conditions', () => {
  when: "value expressions"
  const a = 1, b = 2, c = [1, 2, 3], e = new Error();

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
  e instanceof Error

  when: "falsy expressions"
  const n: null = null, u: undefined = undefined, d = true;

  then:
  n == null
  n === null
  null == n
  null === n

  d != null
  u !== null
  null != d
  null !== u

  u == undefined
  u === undefined
  undefined == u
  undefined === u

  d != undefined
  n !== undefined
  undefined != d
  undefined !== n

  n != d
  d != n
  u != d
  d != u

  !n
  !u
});
