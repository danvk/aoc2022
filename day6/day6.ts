#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/6

import { _ } from "../deps.ts";
import { assert, readLinesFromArgs } from "../util.ts";

function findFirstMarker(chars: readonly string[], n: number): number {
  for (let i = n - 1; i < chars.length; i++) {
    const s = new Set(chars.slice(i, i + n));
    if (s.size === n) {
      return i + n;
    }
  }
  throw new Error('No marker found');
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  assert(lines.length === 1);

  const line = lines[0];
  const chars = line.split('');
  const num = findFirstMarker(chars, 4);

  // 1763 = too low
  console.log('part 1', num);
  console.log('part 2', findFirstMarker(chars, 14));
}
