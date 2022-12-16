#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/18

import { _ } from "../../deps.ts";
import { Grid, neighbors8 } from "../../grid.ts";
import { assert, isNonNullish, readLinesFromArgs, tuple } from "../../util.ts";

function advance(g: Grid<string>, size: number): Grid<string> {
  // open ground (.), trees (|), or a lumberyard (#)

  const out = new Grid<string>();
  for (const x of _.range(0, size)) {
    for (const y of _.range(0, size)) {
      const xy = tuple(x, y);
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
  }
  return out;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  let g = Grid.fromLines(lines);
  const {x: [, maxX]} = g.boundingBox();
  const size = 1 + maxX;
  console.log('size=', size);
  console.log(g.format(v => v));
  console.log();
  const seen: Record<string, number> = {};
  for (let step = 1; step <= 468; step++) {
    const s = g.format(v => v);
    if (seen[s]) {
      console.log('step', step, '=', seen[s]);
    } else {
      seen[s] = step;
    }
    g = advance(g, size);
    console.log(step, ':');
    console.log(g.format(v => v));
    const counts = g.counts();
    console.log(counts);
    console.log();
  }
  // step 481 = 453 (period of 28)
  // step 907 = 459

  // So if n >= 453, then
  // grid(n) = grid(453 + (n - 453) % 28)

  const counts = g.counts();

  // 1_000_000_000

  console.log('part 1', counts['#'] * counts['|']);
  console.log('part 2');
}
