#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/22

import { Grid } from "../grid.ts";
import { readLinesFromArgs } from "../util.ts";

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  let g = Grid.fromLines(lines).transpose();
  console.log(g.format(v => v));
}
