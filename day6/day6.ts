#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/6

import { _ } from "../deps.ts";
import { assert, readLinesFromArgs, zeros } from "../util.ts";

function findFirstMarker(chars: readonly string[], n: number): number {
  for (let i = 0; i < chars.length - n; i++) {
    const s = new Set(chars.slice(i, i + n));
    if (s.size === n) {
      return i + n;
    }
  }
  throw new Error('No marker found');
}

// Alternative implementation that's O(N), not O(N*M) where M=sliding window length.
function firstFirstMarkerLinear(chars: readonly string[], n: number): number {
  const xs = chars.map(c => c.charCodeAt(0) - 'a'.charCodeAt(0));
  const counts = zeros(26);
  let numDupes = 0;

  for (let i = 0; i < xs.length; i++) {
    if (i >= n) {
      const old = xs[i - n];
      const prevOld = counts[old];
      assert(prevOld > 0);
      counts[old]--;
      if (prevOld === 2) {
        assert(numDupes > 0);
        numDupes--;
      }
    }

    const x = xs[i];
    counts[x] += 1;
    if (counts[x] == 2) {
      numDupes++;
    }

    if (numDupes === 0 && i >= n) {
      return i + 1;
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
  console.log('part 1 alt', firstFirstMarkerLinear(chars, 4));
  console.log('part 2', findFirstMarker(chars, 14));
  console.log('part 2 alt', firstFirstMarkerLinear(chars, 14));
}
