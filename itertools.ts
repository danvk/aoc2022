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

// wu.js seemed to be the standard iterator library:
// https://fitzgen.github.io/wu.js/
// but it's archived and not maintained in several years.

// lodash says that you should just use the spread operator:
// https://github.com/lodash/lodash/issues/737
// I guess that's OK? But doesn't that materialize your iterator?
