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
): asserts x is Exclude<T, null | undefined> {
  if (x === null || x === undefined) {
    throw new Error(message ?? String(x));
  }
}

// lodash does not have argmin/argmax: <https://github.com/lodash/lodash/issues/3141>
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

export function argmaxArray(xs: number[]): number {
  let maxKV = null;
  for (let k = 0; k < xs.length; k++) {
    const v = xs[k];
    if (maxKV === null || v > maxKV.v) {
      maxKV = { k, v };
    }
  }
  if (!maxKV) {
    throw new Error("map was empty");
  }
  return maxKV.k;
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

/** Returns an array of n zeros. */
export function zeros(n: number): number[] {
  return _.range(0, n).map(() => 0);
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
