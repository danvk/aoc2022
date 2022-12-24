#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/24

// Idea:
// sample grid is 5x5 (gcd=5)
// input grid is 120x25 (gcd=600)
//
// The blizzards cycle with period of height or width.
// So do Dijkstra with (x, y, t % lcm(w, h)) as the state.

import { _ } from "../deps.ts";
import { Grid } from "../grid.ts";
import { readLinesFromArgs, tuple, zeros } from "../util.ts";

function gcd(a: number, b: number) {
  let temp;
  while (b !== 0) {
    temp = a % b;
    a = b;
    b = temp;
  }
  return a;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const g = Grid.fromLines(lines);
  console.log(g.boundingBox());
  const {x: [minX, maxX], y: [minY, maxY]} = g.boundingBox();
  const w = maxX - minX - 1;
  const h = maxY - minY - 1;
  const period = w  * h / gcd(w, h);
  console.log(w, h, gcd(w, h), period);

  const ewBliz: [number, number][][] = zeros(h).map(() => []);
  const nsBliz: [number, number][][] = zeros(w).map(() => []);
  for (const [[x, y], m] of g) {
    if (m === '>' || m === '<') {
      ewBliz[y - 1].push(tuple(x - 1, m === '>' ? 1 : -1));
    } else if (m === '^' || m === 'v') {
      nsBliz[x - 1].push(tuple(y - 1, m === 'v' ? 1 : -1));
    }
  }

  console.log('ew', ewBliz);
  console.log('ns', nsBliz);

  console.log('part 1', lines.length);
  console.log('part 2');
}
