#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/4

import { _ } from "../deps.ts";
import { assert, readLinesFromArgs } from "../util.ts";

type Pair = [number, number];

function parseLine(line: string): [Pair, Pair] {
  const parts = line.split(/[-,]/);
  assert(parts.length === 4);
  const ns = parts.map(Number);
  const [a1, a2, b1, b2] = ns;
  return [[a1, a2], [b1, b2]];
}

function contained(a: Pair, b: Pair) {
  const [a1, a2] = a;
  const [b1, b2] = b;
  return (a1 >= b1) && (a2 <= b2);
}

function overlaps([a1, a2]: Pair, [b1, b2]: Pair) {
  // return !((a1 > b2) || (b1 > a2));
  return (a1 <= b2) && (b1 <= a2);
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const pairs = lines.map(parseLine);
  const n = pairs.filter(([a, b]) => contained(a, b) || contained(b, a)).length;
  console.log('part 1', n);
  const p2 = pairs.filter(([a, b]) => overlaps(a, b)).length;
  console.log('part 2', p2);
}
