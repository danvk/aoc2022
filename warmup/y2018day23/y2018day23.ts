#!/usr/bin/env -S deno run --allow-read --allow-write --v8-flags=--max-old-space-size=16000
// https://adventofcode.com/2018/day/23

// I really liked this one!
// Once I came up with the idea of starting the grid very coarse and
// making it increasingly fine, I was very excited about implementing it.
// I was a bit disappointed that my first version blew my stack.
// This was the critical sequence after that:
// - Increase Deno's memory limit
// - Filter as you expand the list 8x (not after)
// - Ditch `.flatMap` in favor of a for loop
// - Raise the lower bound a bit (I went from 870 -> 900)
//
// My program reported a real result of 929 at some point during this.
// I tried plugging in an initial lower bound of 920 but got a crash since
// all cells were filtered out. This indicates that there's a bug in my code.
// But running with an initial threshold of 905 worked and produced the correct
// answer. So I'm not sure what's going on with that.
//
// Going from scale=128->64 took the longest time. At that point the lower
// bound increased and the search space shrank dramatically (362013 -> 112 cells).
// Maybe I could speed this up by using the new bound earlier in the search.
//
// I'm glad there was only a 672-way tie and not, say, a billion-way tie.
//
// How would I parallelize this in Deno?

import { _ } from "../../deps.ts";
import { assert, minmax, readInts, readLinesFromArgs, tuple } from "../../util.ts";

type Coord = [number, number, number];
interface Nanobot {
  pos: Coord;
  r: number;
}

function parseNanobot(line: string): Nanobot {
  const [a, b] = line.split(', ');
  const pos = readInts(a, {expect: 3});
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

function botsInRange(bots: readonly Nanobot[], c: Coord): number {
  let n = 0;
  for (const bot of bots) {
    if (distance(bot.pos, c) <= bot.r) {
      n++;
    }
  }
  return n;
}

const DELTAS: Coord[] = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 1, 0],
  [0, 1, 1],
  [1, 0, 1],
  [1, 1, 1],
];

function maxWithArg<T>(xs: Iterable<T>, fn: (x: T, i: number) => number): [number, T] {
  let max: [number, T] | null = null;
  let i = 0;
  for (const x of xs) {
    const v = fn(x, i);
    if (!max || v > max[0]) {
      max = [v, x];
    }
    i++;
  }
  assert(max, `Cannot call maxWithArg with empty list`);
  return max;
}

function minWithArg<T>(xs: Iterable<T>, fn: (x: T, i: number) => number): [number, T] {
  let max: [number, T] | null = null;
  let i = 0;
  for (const x of xs) {
    const v = fn(x, i);
    if (!max || v < max[0]) {
      max = [v, x];
    }
    i++;
  }
  assert(max, `Cannot call maxWithArg with empty list`);
  return max;
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

  console.log('902?', botsInRange(bots, [ 18091136, 52427648, 58925440 ]));
  console.log('929?', botsInRange(bots, [ 18090912, 52427488, 58925792 ]));
  console.log('937?', botsInRange(bots, [ 18090902, 52427514, 58925762 ]));

  // const botsInRange = (c: Coord) => bots.filter(b => distance(b.pos, c) <= b.r).length;
  const coords: Coord[] = [
    ...bots.map(b => b.pos),
    ...bots.flatMap(corners),
  ];
  const ds = _.sortBy(coords.map(c => tuple(botsInRange(bots, c), c)), c => -c[0]);
  console.log(ds.slice(0, 5));
  let lowerBound = 905;  // ds[0][0];  // 873
  // ^^ Using a larger value here (like 920) crashes, which seems like a bug!
  // 879 [ 1134, 3227, 3539 ]
  // 902 [ 70668, 204795, 230177 ]
  // 929 [ 282670, 819179, 920715 ]

  // > Math.log2(235_151_681)
  // 27.809016404548867
  let scale = 2 << 28;
  // When positions and radii are scaled down by scale, this is
  // the set of coordinates with >= lowerBound bots in range.
  let candidates: Coord[] = [
    [0, 0, 0],
    [-1, 0, 0],
    [0, -1, 0],
    [0, 0, -1],
    [-1, -1, 0],
    [0, -1, -1],
    [-1, 0, -1],
    [-1, -1, -1],
  ];
  // box [x, y, z] is from:
  // [
  //   x*scale .. (x+1)*scale - 1,
  //   y*scale .. (y+1)*scale - 1,
  //   z*scale .. (z+1)*scale - 1,
  // ]
  // At each iteration:
  // - divide each cell in eight
  // - calculate the new number of bots in range
  // - filter out cells with fewer than the lower bound.
  // - calculate the true value at the center of each cell and possibly update the lower bound.
  // When we're down to scale=1, hopefully there are only a few left.

  while (scale > 0) {
    // const scaledBots: Nanobot[] = bots.map(({r, pos: [x, y, z]}) => ({
    //   pos: [Math.floor(x / scale), Math.floor(y / scale), Math.floor(z / scale)],
    //   r: Math.ceil(r / scale),
    // }));

    const keepers = candidates;  // .filter(c => botsInRange(scaledBots, c) >= lowerBound);

    const [sampledRealCount, bestThisGen] = maxWithArg(keepers, (([x, y, z]) => {
      const c = tuple((x + 0.5) * scale, (y+0.5)*scale, (z+0.5)*scale);
      return botsInRange(bots, c);
    }));

    const volume = keepers.length * Math.pow(scale, 3);
    console.log('scale=', scale, 'keeping', keepers.length, '/', candidates.length, 'real count=', sampledRealCount, bestThisGen, 'volume=', volume);

    if (sampledRealCount > lowerBound) {
      lowerBound = sampledRealCount;
      const [x, y, z] = bestThisGen;
      const c = tuple((x + 0.5) * scale, (y+0.5)*scale, (z+0.5)*scale);
      console.log(c, 'raises lower limit to', lowerBound);
    }

    if (scale > 1) {
      scale = scale >> 1;
      const nextBots: Nanobot[] = bots.map(({r, pos: [x, y, z]}) => ({
        pos: [Math.floor(x / scale), Math.floor(y / scale), Math.floor(z / scale)],
        r: Math.ceil(r / scale),
      }));
      // console.log('r range=', minmax(nextBots.map(b => b.r)));
      // console.log('x range=', minmax(nextBots.map(b => b.pos[0])));
      // console.log('y range=', minmax(nextBots.map(b => b.pos[1])));
      // console.log('z range=', minmax(nextBots.map(b => b.pos[2])));

      candidates = [];
      for (const [x, y, z] of keepers) {
        // split in 8
        for (const [dx, dy, dz] of DELTAS) {
          const c = tuple(2*x+dx, 2*y+dy, 2*z+dz);
          // I wish there were an easy way to parallelize this!
          if (botsInRange(nextBots, c) >= lowerBound) {
            candidates.push(c);
          }
        }
      }
      console.log('Keeping', candidates.length, '/', 8 * keepers.length);
    } else {
      candidates = keepers;
      scale = scale >> 1;
    }
  }

  const inters = candidates.map(c => botsInRange(bots, c));
  const mostIntersections = _.max(inters)!;
  candidates = candidates.filter((_, i) => inters[i] === mostIntersections);
  // 672 -way tie at 939
  console.log(candidates.length, '-way tie at', mostIntersections);

  const origin = tuple(0, 0, 0);
  const best = minWithArg(candidates, c => distance(c, origin));
  console.log('part 2:', best);
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
