#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/1

import { _ } from '../deps.ts';
import { chunkLines, readLinesFromArgs } from "../util.ts";

function getSums(lines: readonly string[]): number[] {
  return chunkLines(lines).map((chunkLines) =>
    _.sum(chunkLines.map(Number))
  );
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const sums = getSums(lines);
  sums.sort((a, b) => a - b).reverse();
  console.log("part 1", sums[0]);
  console.log("part 2", sums[0] + sums[1] + sums[2]);
}
