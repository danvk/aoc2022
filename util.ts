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

export function mapObject<K extends PropertyKey, T, U>(obj: Record<K, T>, fn: (v: T, k: K) => U): Record<K, U> {
  const o = {} as Record<K, U>;
  for (const [k, v] of Object.entries(obj) as any) {
    o[k] = fn(v, k);
  }
  return o;
}
