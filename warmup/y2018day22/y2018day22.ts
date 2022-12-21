#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/22

import { _ } from "../../deps.ts";
import { Coord, Grid } from "../../grid.ts";
import { assert, readInts, readLinesFromArgs, tuple } from "../../util.ts";

// 20183 is prime.
const P = 20183;

function makeGrid(depth: number, target: Coord): Grid<string> {
  const erosion = new Grid<number>();
  const [tx, ty] = target;

  erosion.set([0, 0], depth % P);
  for (let i = 1; i < tx + ty; i++) {
    for (let x = 0; x <= i; x++) {
      const y = i - x;
      if (y < 0 || y > ty || x > tx) {
        continue;
      }
      const c: Coord = [x, y];
      if (x === 0) {
        erosion.set(c, (y * 48271 + depth) % P);
      } else if (y === 0) {
        erosion.set(c, (x * 16807 + depth) % P);
      } else {
        const a = erosion.get([x - 1, y]);
        const b = erosion.get([x, y - 1]);
        assert(a)
        assert(b);
        erosion.set(c, (a * b + depth) % P);
      }
    }
  }
  erosion.set(target, depth % P);

  for (const c of [
    tuple(0, 0),
    tuple(1, 0),
    tuple(0, 1),
    tuple(1, 1),
    tuple(10, 10),
  ]) {
    console.log(c, erosion.get(c));
  }

  return erosion.mapValues(v => {
    const erosion = (v + depth) % P;
    const m = erosion % 3;
    return m === 0 ? '.' : m === 1 ? '=' : '|';
  });
}

// . = rocky
// = = wet
// | = narrow

function riskLevel(c: string) {
  // 0 for rocky regions, 1 for wet regions, and 2 for narrow regions.
  if (c === '.') return 0;
  if (c === '=') return 1;
  if (c === '|') return 2;
  throw new Error('Surprise terrain: ' + c);
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  assert(lines.length === 2);
  const [depth] = readInts(lines[0], {expect: 1});
  const target = readInts(lines[1], {expect: 2}) as Coord;
  const g = makeGrid(depth, [15, 15]);
  console.log(g.format(v => v));

  console.log('part 1', _.sum([...g.mapValues(riskLevel)].map(([, v]) => v)));

  // 9705=too high

  // console.log('part 1', depth, target);
  // console.log('part 2');
}
