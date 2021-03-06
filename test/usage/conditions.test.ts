// @ts-nocheck

describe('Conditions', async () => {
  when: "value expressions"
  const a = 1, b = 2, c = [1, 2, 3], e = new Error();

  then: "passes all conditions"
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

  when: "Exception throwing"
  let V: any;
  V!.prop;

  then: "exceptions are caught"
  thrown() instanceof TypeError
  thrown().toString() === "TypeError: Cannot read properties of undefined (reading 'prop')"

  when: "NaN numbers"
  const nan = 0/0;

  then: "passes all conditions"
  a != NaN
  NaN != a
  a !== NaN
  NaN !== a

  nan == NaN
  NaN == nan
  nan === NaN
  NaN === nan

  when: "truthy expressions"
  then: "passes all conditions"
  Number.isFinite(3)
  !Number.isFinite(3/0)

  when: "falsy expressions"
  const n: null = null, u: undefined = undefined, d = true;

  then: "passes all conditions"
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

  when: "async/await"
  const asyncFn = async() => Promise.resolve(42);
  const p = await asyncFn();

  then: "passes all conditions"
  await asyncFn() === 42
  p === 42
});
