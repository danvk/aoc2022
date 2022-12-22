#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/23

import { _ } from "../../deps.ts";
import { minmax, readInts, readLinesFromArgs, tuple } from "../../util.ts";

type Coord = [number, number, number];
interface Nanobot {
  pos: Coord;
  r: number;
}

function parseNanobot(line: string): Nanobot {
  const [a, b] = line.split(', ');
  const pos = readInts(a, {expect: 3}) as Coord;
  const [r] = readInts(b, {expect: 1});
  return {pos, r};
}

function distance(a: Coord, b: Coord): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
}

function* neighbors8(c: Coord): Generator<Coord> {
  const [x, y, z] = c;
  for (let d = -1; d <= 1; d += 2) {
    yield [x + d, y, z];
    yield [x, y + d, z];
    yield [x, y, z + d];
  }
}

function corners(b: Nanobot): Coord[] {
  const [x, y, z] = b.pos;
  const {r} = b;
  return [
    [x - r, y, z],
    [x + r, y, z],
    [x, y - r, z],
    [x, y + r, z],
    [x, y, z - r],
    [x, y, z + r],
  ]
}

function* pairs<T>(xs: T[]): Generator<[T, T]> {
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = i + 1; j < xs.length; j++) {
      yield [xs[i], xs[j]];
    }
  }
}

const DIRS: Coord[] = [
  [-1, 0,  0],
  [1,  0,  0],
  [0,  -1, 0],
  [0,  1,  0],
  [0,  0,  -1],
  [0,  0,  1],
]

function* edges(b: Nanobot): Generator<Coord> {
  const [x, y, z] = b.pos;
  const {r} = b;
  for (const [a, b] of pairs(DIRS)) {
    if (a[0] * b[0] + a[1] * b[1] + a[2] * b[2] !== 0) {
      continue;  // not an outside edge
    }
    for (let i = 0; i <= r; i++) {
      yield [
        x + a[0] * i + b[0] * (r - i),
        y + a[1] * i + b[1] * (r - i),
        z + a[2] * i + b[2] * (r - i),
      ];
    }
  }
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const bots = lines.map(parseNanobot);
  const strongest = _.maxBy(bots, b => b.r)!;
  const inRange = bots.filter(b => distance(b.pos, strongest.pos) <= strongest.r);
  console.log('part 1', inRange.length);  // 674
  console.log('part 2');

  console.log('r range=', minmax(bots.map(b => b.r)));
  console.log('x range=', minmax(bots.map(b => b.pos[0])));
  console.log('y range=', minmax(bots.map(b => b.pos[1])));
  console.log('z range=', minmax(bots.map(b => b.pos[2])));

  const botsInRange = (c: Coord) => bots.filter(b => distance(b.pos, c) <= b.r).length;
  const coords: Coord[] = [
    ...bots.map(b => b.pos),
    ...bots.flatMap(corners),
  ];
  const ds = _.sortBy(coords.map(c => tuple(botsInRange(c), c)), c => -c[0]);
  console.log(ds.slice(0, 5));
  const botsLowerBound = ds[0];  // 873

  /*
  for (const [i, b] of bots.entries()) {
    console.log(i, b);
    for (const c of edges(b)) {
      const n = botsInRange(c);
      if (n > botsLowerBound[0]) {
        botsLowerBound = [n, c];
        console.log(botsLowerBound);
      }
    }
  }
  */

  // 873 is a lower bound on the most bots in range
  console.log(botsLowerBound);
}

// There are 1,000 bots.
// r range = [   49_956_879,  99_575_145 ]
// x range = [ -177_382_187, 217_323_467 ]
// y range = [  -74_661_685, 155_828_966 ]
// z range = [  -49_800_667, 235_151_681 ]
//
// Ideas:
// - The diamond shapes that manhattan distance induces are hard to work with.
//   This problem could be transformed to cubes using (x+y, x-y) coordinates.
//   This would make the intersections be "cuboids".
//   -> this works for real numbers but not for integers.
//      a diamond w/ r=1 has five points, which isn't square.
// - How many intersections are there? Potentially 1M but much smaller volume.
// - Take inspiration from interlaced images.
//   Start with a low resolution grid. How many diamonds intersect each cell?
//   This is an upper bound on the cell in range of the most bots.
//   Take the highest-bounded cell and subdivide it, recalculating bounds on the smaller cell.
//   If cells have a lower bound than the best known point, they can be discarded.
// - The eight points on the corners of a bot's range are worth checking.
//   There should be at most 8,000 of these. The solution isn't guaranteed to be one
//   of them, but it might be! The edges might be interesting, too.
//   If nothing else, this would be a good lower bound on the answer.
//   -> It's six points, and these are interesting points!
//   -> The diamonds are large enough that even edges are infeasible.

// Some interesting points:
// [
//   [ 873, [ 23792020, 48909379, 59224869 ] ],
//   [ 855, [ 23721203, 49916980, 62688174 ] ],
//   [ 852, [ 25666789, 46566129, 59857685 ] ],
//   [ 849, [ 22021283, 48754222, 62532173 ] ],
//   [ 848, [ 22696479, 51282152, 60502056 ] ]
// ]
// part 2: 131926268 is too high