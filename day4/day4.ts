#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/4

import { _ } from "../deps.ts";
import { Interval, intervalOverlaps } from "../intervals.ts";
import { assert, readLinesFromArgs } from "../util.ts";

function parseLine(line: string): [Interval, Interval] {
  const parts = line.split(/[-,]/);
  assert(parts.length === 4);
  const ns = parts.map(Number);
  const [a1, a2, b1, b2] = ns;
  return [[a1, a2], [b1, b2]];
}

/** Is a fully contained in b? */
function contained(a: Interval, b: Interval) {
  const [a1, a2] = a;
  const [b1, b2] = b;
  return (a1 >= b1) && (a2 <= b2);
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const pairs = lines.map(parseLine);
  const n = pairs.filter(([a, b]) => contained(a, b) || contained(b, a)).length;
  console.log('part 1', n);
  const p2 = pairs.filter(([a, b]) => intervalOverlaps(a, b)).length;
  console.log('part 2', p2);
}
