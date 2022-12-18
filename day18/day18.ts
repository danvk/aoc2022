#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/18

import { _ } from "../deps.ts";
import { readInts, readLinesFromArgs } from "../util.ts";



if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const cubes = lines.map(line => readInts(line, {expect: 3}));
  const lookup = new Set(lines);

  const check = (x: number, y: number, z: number) => {
    if (!lookup.has(`${x},${y},${z}`)) {
      surfaces++;
    }
  }

  let surfaces = 0;
  for (const [x, y, z] of cubes) {
    for (let d = -1; d <= 1; d+=2) {
      check(x + d, y ,z);
      check(x, y + d, z);
      check(x, y, z + d);
    }
  }

  console.log('part 1', surfaces);
  console.log('part 2');
}
