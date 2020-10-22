export function ExpectIterable(i: Iterable<any>) {
  for (const _ of i) {
  }
}

export function ExpectSameCollection(a: Iterable<any>, b: Iterable<any>) {
  const a_ = Array.from(a);
  const b_ = Array.from(b);
  expect(a_).toEqual(b_);
}
