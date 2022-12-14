#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/14

import { _ } from "../deps.ts";
import { Grid } from "../grid.ts";
import { assert, readLinesFromArgs, safeParseInt } from "../util.ts";

function sgn(x: number): number {
  if (x < 0) {
    return -1;
  } else if (x > 0) {
    return +1;
  }
  return 0;
}

function read(lines: readonly string[]): Grid<string> {
  const g = new Grid<string>();
  for (const line of lines) {
    const coords = line.split(' -> ').map(c => c.split(',').map(safeParseInt));
    for (let i = 0; i < coords.length - 1; i++) {
      const [ax, ay] = coords[i];
      const [bx, by] = coords[i + 1];
      const dx = sgn(bx - ax);
      const dy = sgn(by - ay);
      assert(Math.abs(dx) + Math.abs(dy) === 1);
      let x = ax;
      let y = ay;
      while (x != bx || y != by) {
        g.set([x, y], '#');
        x += dx;
        y += dy;
      }
    }
  }

  /*
  const {x: [ax, bx], y: [ay, by]} = g.boundingBox();
  for (let x = ax; x <= bx; x++) {
    for (let y = ay; y <= by; y++) {
      if (!g.get([x, y])) {
        g.set([x, y], '.');
      }
    }
  }
  */

  return g;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const g=  read(lines);
  // console.log(g);
  // console.log(g.boundingBox());

  console.log(g.format(x => x));
  console.log('part 1', lines.length);
  console.log('part 2');
}
