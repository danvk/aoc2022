#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/13

import { _ } from "../deps.ts";
import { chunkLines, readLinesFromArgs } from "../util.ts";

// returns true if a < b
function compare(a: any, b: any): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a === b ? 0 : a < b ? -1 : +1;
  } else if (typeof a === 'number') {
    return compare([a], b);
  } else if (typeof b === 'number') {
    return compare(a, [b]);
  } else {
    // both are lists
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
      const c = compare(a[i], b[i]);
      if (c !== 0) return c;
    }
    return a.length - b.length;
  }
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const pairs = chunkLines(lines);
  let i = 0;
  let sum = 0;
  for (const [a, b] of pairs) {
    console.log(a);
    console.log(b);
    const c = compare(JSON.parse(a), JSON.parse(b));
    console.log('');
    i++;
    if (c < 0) {
      sum += i;
      console.log(i, 'is ok');
    }
  }
  console.log('part 1', sum);
  console.log('part 2');
}
