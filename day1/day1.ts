#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/1

import { readLinesFromArgs } from "../util.ts";

function getSums(lines: readonly string[]): number[] {
  let tally = 0;
  const sums = [];
  for (const line of lines) {
    if (line === '') {
      sums.push(tally);
      tally = 0;
    } else {
      tally += Number(line);
    }
  }
  sums.push(tally);
  return sums;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const sums = getSums(lines);
  sums.sort().reverse();
  console.log('part 1', sums[0]);
  console.log('part 2', sums[0] + sums[1] + sums[2]);
}
