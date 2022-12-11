/** Utility functions for working with maps */

// Notes on Map: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
// - Maps remember insertion order of keys
// - Any value (primitive or object) may be used as either a value or a key
// - for..of on a map iterates over key/value pairs
// - .get() is guaranteed to be sublinear, not necessarily constant
// - You can call new Map([['k', 'v'], ['k2', 'v2'], ...])
// - new Map(oldMap) creates a shallow clone
// - new Map([...m1, ...m2]) is a succinct way to merge two maps

import { assert } from "./util.ts";

export function mapValues<K, U, V>(
  m: Map<K, U>,
  fn: (v: U, k: K) => V,
): Map<K, V> {
  const out = new Map<K, V>();
  for (const [k, v] of m.entries()) {
    out.set(k, fn(v, k));
  }
  return out;
}

export function groupBy<T, K>(
  xs: Iterable<T>,
  fn: (x: T, i: number) => K,
): Map<K, T[]> {
  const out = new Map<K, T[]>();
  let i = 0;
  for (const x of xs) {
    const k = fn(x, i);
    const v = out.get(k);
    if (v) {
      v.push(x);
    } else {
      out.set(k, [x]);
    }
    i++;
  }
  return out;
}

export function minMaxKey<K extends number|string>(m: Map<K, unknown>): [K, K] {
  let min: K | null = null;
  let max: K | null = null;
  for (const k of m.keys()) {
    if (min === null || max === null) {
      min = max = k;
    } else {
      if (k < min) {
        min = k;
      } else if (k > max) {
        max = k;
      }
    }
  }
  if (min === null || max === null) {
    throw new Error('Called minMaxKey on empty Map');
  }
  return [min, max];
}

export function argmax<K>(m: Map<K, number>): K {
  let maxKV = null;
  for (const [k, v] of m.entries()) {
    if (maxKV === null || v > maxKV.v) {
      maxKV = { k, v };
    }
  }
  assert(maxKV, "map was empty");
  return maxKV.k;
}
