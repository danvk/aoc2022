#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/24

import { _ } from "../deps.ts";
import { Grid } from "../grid.ts";
import { readLinesFromArgs } from "../util.ts";

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const g = Grid.fromLines(lines);
  console.log(g.boundingBox());
  console.log('part 1', lines.length);
  console.log('part 2');
}
