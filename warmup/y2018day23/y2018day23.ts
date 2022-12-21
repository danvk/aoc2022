#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/23

import { _ } from "../../deps.ts";
import { readLinesFromArgs } from "../../util.ts";

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  console.log('part 1', lines.length);
  console.log('part 2');
}
