import { _ } from "./deps.ts";

/** Read lines from a file specified as a command line argument */
export async function readLinesFromArgs(): Promise<string[]> {
  const [path] = Deno.args;

  // There's a std stream option for reading files line by line it feels like overkill here.
  // https://deno.land/std@0.166.0/streams/mod.ts?s=TextLineStream
  const contents = await Deno.readTextFile(path);
  const lines = contents.split("\n");

  // Ignore trailing newline if relevant
  if (lines[lines.length - 1] === "") {
    lines.pop();
  }
  return lines;
}

/** Group lines into blank-delimited "chunks". */
export function chunkLines(lines: readonly string[]): string[][] {
  let current = [];
  const output = [];
  for (const line of lines) {
    if (line === "") {
      output.push(current);
      current = [];
    } else {
      current.push(line);
    }
  }
  output.push(current);
  return output;
}

/** Helper for inserting / updating a value in an object. */
export function upsert<T>(
  obj: { [key: string]: T },
  key: string,
  base: T,
  update: (oldValue: T) => T
) {
  if (key in obj) {
    obj[key] = update(obj[key]);
  } else {
    obj[key] = base;
  }
}

/** Helper for using an object as a counter */
export const increment = (
  obj: { [key: string]: number },
  key: string,
  amount = 1
) => upsert(obj, key, amount, (v) => amount + v);

export function tuple<T extends Array<unknown>>(...x: T) {
  return x;
}

/** type-safe assertion, useful for narrowing */
export function assert<T>(
  x: T,
  message?: string
): asserts x is Exclude<T, null | undefined | false> {
  if (x === null || x === undefined || x === false) {
    throw new Error(message ?? String(x));
  }
}

// lodash does not have argmin/argmax: <https://github.com/lodash/lodash/issues/3141>
export function argmaxArray(xs: number[]): number {
  let maxKV = null;
  for (let k = 0; k < xs.length; k++) {
    const v = xs[k];
    if (maxKV === null || v > maxKV.v) {
      maxKV = { k, v };
    }
  }
  if (!maxKV) {
    throw new Error("array was empty");
  }
  return maxKV.k;
}

export function argminArray(xs: number[]): number {
  let minKV = null;
  for (let k = 0; k < xs.length; k++) {
    const v = xs[k];
    if (minKV === null || v < minKV.v) {
      minKV = { k, v };
    }
  }
  if (!minKV) {
    throw new Error("array was empty");
  }
  return minKV.k;
}

export function assertUnreachable(x: never): never {
  throw new Error("should be unreachable " + x);
}

/** Closed interval -- both endpoints are in the range. */
export type Range = [number, number];

/** Do two ranges overlap one another? */
export function rangeOverlaps([a1, a2]: Range, [b1, b2]: Range) {
  // return !((a1 > b2) || (b1 > a2));
  return (a1 <= b2) && (b1 <= a2);
}

/** Returns the intersection of two sets. */
export function intersect<T>(a: Set<T>, b: Set<T>): Set<T> {
  const out = new Set<T>();
  for (const x of a.keys()) {
    if (b.has(x)) {
      out.add(x);
    }
  }
  return out;
}

/** Return a 1- or 2-dimensional array of zeros */
export function zeros<A extends [number] | []>(n: number, ...rest: A): (A extends [] ? number[] : number[][]) {
  if (rest.length > 0) {
    const m = rest[0]!;
    // deno-lint-ignore no-explicit-any
    return _.range(0, n).map(() => zeros(m)) as any;
  }
  // deno-lint-ignore no-explicit-any
  return _.range(0, n) as any;
}

export function map2d<U, V>(
  xs: readonly U[][],
  fn: (x: U, i: number, j: number) => V,
): V[][] {
  return xs.map((row, i) => row.map((val, j) => fn(val, i, j)));
}

export function safeParseInt(txt: string): number {
  const n = parseInt(txt, 10);
  if (n !== n) {
    throw new Error(`Unable to parse ${txt} as an integer.`);
  }
  return n;
}

export function coord2str([x, y]: readonly [number, number]): string {
  return `${x},${y}`
}

export function str2coord(coord: string): [number, number] {
  const comma = coord.indexOf(',');
  if (comma === -1) {
    throw new Error(`"${coord}" is not a valid coordinate`);
  }
  return [
    safeParseInt(coord.slice(0, comma)),
    safeParseInt(coord.slice(comma + 1)),
  ];
}

/** Simultaneously calculate the min and max of a sequence */
export function minmax(xs: readonly number[]): [number, number] {
  assert(xs.length > 0);
  let min = xs[0], max = xs[0];
  for (let i = 1; i < xs.length; i++) {
    const x = xs[i];
    if (x < min) {
      min = x;
    } else if (x > max) {
      max = x;
    }
  }
  return [min, max];
}

/** Sort by something, preserving the original indices in a tuple with the values */
export function sortWithIndex<T>(xs: readonly T[], sortBy: (x: T, index: number) => string|number): [T, number][] {
  return _.sortBy(xs.map((x, i) => tuple(x, i)), ([x, i]) => sortBy(x, i));
}

/** Make an object using a list of keys and a function. */
export function makeObject<K extends string, T>(keys: readonly K[], fn: (k: string, i: number) => T): Record<K, T> {
  return _.fromPairs(keys.map((k, i) => [k, fn(k, i)])) as Record<K, T>;
}

/** Transpose a square matrix in-place */
export function transpose<T>(grid: T[][]) {
  assert(grid.length === grid[0].length);
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < i; j++) {
      const t = grid[i][j];
      grid[i][j] = grid[j][i];
      grid[j][i] = t;
    }
  }
}

/** Extract all (possibly negative) integers from a string. */
export function readInts(txt: string, options?: {expect: number}): number[] {
  const matches = txt.matchAll(/(-?\d+)/g);
  const nums = [...matches].map(m => safeParseInt(m[1]));
  if (options) {
    if (nums.length !== options.expect) {
      throw new Error(`Got ${nums.length} nums, expected ${options.expect}: '${txt}'`);
    }
  }
  return nums;
}

export function isNonNullish<T>(x: T): x is Exclude<T, null | undefined> {
  return x !== null && x !== undefined;
}
