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
      while (true) {
        g.set([x, y], '#');
        if (x === bx && y === by) {
          break;
        }
        x += dx;
        y += dy;
      }
    }
  }

  return g;
}

function dropSand(g: Grid<string>, maxY: number): boolean {
  let x = 500;
  let y = 0;
  while (y < maxY) {
    const c = g.get([x, y + 1]);
    if (c === undefined) {
      y++;
    } else if (c === '#' || c === 'o') {
      // try down and left
      if (g.get([x - 1, y + 1]) === undefined) {
        x -= 1;
        y += 1;
      } else if (g.get([x + 1, y + 1]) === undefined) {
        x += 1;
        y += 1;
      } else {
        g.set([x, y], 'o');
        if (y === 0) {
          return false;  // part 2 exit condition
        }
        return true;
      }
    } else {
      throw new Error();
    }
  }
  return false;  // part 1 exit condition
}

function part1(lines: string[]) {
  const g = read(lines);
  console.log(g.format(x => x));
  console.log();
  console.log(g.boundingBox());
  console.log();

  const {y: [, maxY]} = g.boundingBox();
  let numDrops = 0;
  while (dropSand(g, maxY)) {
    // console.log(g.format(x => x));
    // console.log();
    numDrops++;
  }
  return numDrops;
}

function part2(lines: string[]) {
  const g = read(lines);
  const {x: [ax, bx], y: [ay, by]} = g.boundingBox();
  const newY = by + 2;
  const h = (newY - ay);
  for (let x = ax - h * 2; x < bx + h * 2; x++) {
    g.set([x, newY], '#');
  }

  let numDrops = 0;
  while (dropSand(g, newY)) {
    // console.log(g.format(x => x));
    // console.log();
    numDrops++;
  }
  return 1 + numDrops;  // need to count the last drop
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();

  console.log('part 1', part1(lines));
  console.log('part 2', part2(lines));
}
