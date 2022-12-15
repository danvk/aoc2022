#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/17

import { _ } from "../../deps.ts";
import { Coord, Grid } from "../../grid.ts";
import { assert, readInts, readLinesFromArgs } from "../../util.ts";

function read(lines: string[]): Grid<string> {
  // x=603, y=265..269
  const g = new Grid<string>();
  for (const line of lines) {
    const nums = readInts(line, {expect: 3});
    if (line.startsWith('x')) {
      const [x, y1, y2] = nums;
      for (let y = y1; y <= y2; y++) {
        g.set([x, y], '#');
      }
    } else if (line.startsWith('y')) {
      const [y, x1, x2] = nums;
      for (let x = x1; x <= x2; x++) {
        g.set([x, y], '#');
      }
    } else {
      throw new Error('Surprise line ' + line);
    }
  }
  return g;
}

// Returns last unblocked x in that direction.
// true = hit a wall
// false = can drip down
function seep(g: Grid<string>, [x, y]: Coord, dx: number): [number, boolean] {
  while (true) {
    const below = g.get([x, y + 1]);
    if (!below || below === '|') {
      return [x, false];  // can drip down.
    }
    const side = g.get([x + dx, y]);
    // assert(side !== '~' && side !== '|', `Surprise: ${side}`);
    if (side === '#') {
      return [x, true];  // hit a wall
    }

    x += dx;
  }
}

function drip(g: Grid<string>, maxY: number, x=500, y=0): boolean {
  // drip down until you hit something.
  // if it's contained on both sides, fill it in and we're done.
  // if it's contained on one side, fill to the cap and recur to the other drop.
  // if it's not contained on either side, fill to both ends and double-recur.

  while (true) {
    if (y > maxY) {
      return false;  // done
    }
    const c = g.get([x, y+1]);
    if (!c || c === '|') {
      g.set([x, y], '|');
      y += 1;  // keep dripping
      continue;
    }
    assert(c === '~' || c === '#');

    const [leftX, leftWall] = seep(g, [x, y], -1);
    const [rightX, rightWall] = seep(g, [x, y], 1);

    if (leftWall && rightWall) {
      // fill!
      for (let fx = leftX; fx <= rightX; fx++) {
        g.set([fx, y], '~');
      }
      return true;
    } else {
      for (let fx = leftX; fx <= rightX; fx++) {
        g.set([fx, y], '|');
      }
      if (leftWall) {
        // fill with | to the left and drip to the right.
        return drip(g, maxY, rightX, y);
      } else if (rightWall) {
        // fill with | to the right and drip to the left
        return drip(g, maxY, leftX, y);
      } else {
        // drip on both sides
        const a = drip(g, maxY, leftX, y);
        const b = drip(g, maxY, rightX, y);
        return a || b;
      }
    }
  }
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const g = read(lines);
  const {y: [minY, maxY]} = g.boundingBox();
  console.log(g.format(x => x, '.'));
  while (drip(g, maxY)) {
    // keep going
    // console.log('\n');
    // console.log(g.format(x => x, '.'));
  }
  g.set([500, 0], '+');
  console.log('\n');
  console.log(g.format(x => x, '.'));
  const water = g.findIndices((v, [, y]) => (v === '~' || v === '|' && y >= minY && y <= maxY));

  // 7938 = too low
  // 31476 = too high
  // 31475 = too high
  // 31471
  console.log('part 1', water.length);
  console.log('part 2');
}
