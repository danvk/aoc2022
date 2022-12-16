#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/18

// This one was quite easy.
// Part 2 was tricky in that the part 1 solution obviously wouldn't work
// and the sample input was useless (it all turns to open space).
// I animated printing the large grid and saw that it seemed to be following
// a pattern, so I pursued that and got the solution.
// This felt much easier than day 17.

import { _ } from "../../deps.ts";
import { Grid, neighbors8, range2d } from "../../grid.ts";
import { assert, isNonNullish, readLinesFromArgs } from "../../util.ts";

function advance(g: Grid<string>, size: number): Grid<string> {
  // open ground (.), trees (|), or a lumberyard (#)

  const out = new Grid<string>();
  for (const xy of range2d([0, 0], [size - 1, size - 1])) {
    const c = g.get(xy);
    assert(c);
    const ns = _.countBy(neighbors8(xy).map(c => g.get(c)).filter(isNonNullish));

    if (c === '.') {
      // An open acre will become filled with trees if three or more adjacent acres
      // contained trees. Otherwise, nothing happens.
      if ((ns['|'] ?? 0) >= 3) {
        out.set(xy, '|');
      } else {
        out.set(xy, '.');
      }
    } else if (c === '|') {
      // An acre filled with trees will become a lumberyard if three or more adjacent
      // acres were lumberyards. Otherwise, nothing happens.
      if ((ns['#'] ?? 0) >= 3) {
        out.set(xy, '#');
      } else {
        out.set(xy, '|');
      }
    } else if (c === '#') {
      // An acre containing a lumberyard will remain a lumberyard if it was adjacent
      // to at least one other lumberyard and at least one acre containing trees.
      // Otherwise, it becomes open.
      if ((ns['#'] ?? 0) >= 1 && (ns['|'] ?? 0) >= 1) {
        out.set(xy, '#');
      } else {
        out.set(xy, '.');
      }
    }
  }
  return out;
}

function scoreAfterN(g: Grid<string>, n: number): number {
  const {x: [, maxX]} = g.boundingBox();
  const size = 1 + maxX;
  for (let step = 1; step <= n; step++) {
    g = advance(g, size);
  }
  const counts = g.counts();
  return counts['#'] * counts['|'];
}

function findPeriod(g: Grid<string>): [number, number] {
  const {x: [, maxX]} = g.boundingBox();
  const size = 1 + maxX;
  const seen: Record<string, number> = {};
  let step = 1;
  while (true) {
    const s = g.format(v => v);
    if (seen[s]) {
      console.log('step', step, '=', seen[s]);
      return [seen[s], step - seen[s]];
    } else {
      seen[s] = step;
    }
    g = advance(g, size);
    step++;
  }
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const g = Grid.fromLines(lines);

  console.log('part 1', scoreAfterN(g, 10));

  const [a, b] = findPeriod(g);
  const steps = a + (1_000_000_000 - a) % b;
  console.log('part 1', scoreAfterN(g, steps));
}
