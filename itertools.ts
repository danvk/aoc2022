export function map<U, V>(
  input: IterableIterator<U>,
  fn: (x: U) => V,
): IterableIterator<V> {
  const f = function*() {
    for (const x of input) {
      yield fn(x);
    }
  };
  return f();
}
