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

/*
export function mapObject<K extends PropertyKey, T, U>(obj: Record<K, T>, fn: (v: T, k: K) => U): Record<K, U> {
  const o = {} as Record<K, U>;
  for (const [k, v] of Object.entries(obj) as any) {
    o[k] = fn(v, k);
  }
  return o;
}
*/

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

export function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b);
}

/** Sorts an array of numbers in-place, returning a reference to the array. */
export function sortNums(xs: number[]): number[] {
  return xs.sort((a, b) => a - b);
}

export function assertUnreachable(x: never): never {
  throw new Error("should be unreachable " + x);
}
