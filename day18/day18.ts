#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/18

import { _ } from "../deps.ts";
import { flood } from "../dijkstra.ts";
import { minmax, readInts, readLinesFromArgs, tuple } from "../util.ts";

const ser = (([x, y, z]: [number, number, number]) => `${x},${y},${z}`);
const deser = (xyz: string) => readInts(xyz, {expect: 3});

function neighbors6([x, y, z]: [number, number, number]): [number, number, number][] {
  return [
    [x - 1, y, z],
    [x + 1, y, z],
    [x, y - 1, z],
    [x, y + 1, z],
    [x, y, z - 1],
    [x, y, z + 1],
  ];
}

class InfiniteFloodException extends Error {}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const cubes = lines.map(line => readInts(line, {expect: 3}));
  const lookup = new Set(lines);

  const knownInterior = new Set<string>();
  const interiorCandidatesStr = new Set<string>();
  const check = (x: number, y: number, z: number) => {
    const str = ser([x, y, z]);
    if (!lookup.has(str) && !knownInterior.has(str)) {
      surfaces++;
      interiorCandidatesStr.add(`${x},${y},${z}`);
    }
  }

  let surfaces = 0;
  for (const [x, y, z] of cubes) {
    for (let d = -1; d <= 1; d+=2) {
      check(x + d, y, z);
      check(x, y + d, z);
      check(x, y, z + d);
    }
  }
  console.log('part 1', surfaces);

  const [x1, x2] = minmax(cubes.map(c => c[0]));
  const [y1, y2] = minmax(cubes.map(c => c[1]));
  const [z1, z2] = minmax(cubes.map(c => c[2]));
  const diam = Math.max(x2-x1, y2-y1, z2-z1);
  console.log('diam=', diam);  // sample: 5; input: 19

  // Idea:
  // - Do a quick scan in each of the six directions to make sure we're not (obviously) on the exterior.
  // - Do flood fill with maxDistance = diameter; if it terminates then we're good.

  const isClearlyOutside = (x: number, y: number, z: number) => {
    const checkDir = (dx: number, dy: number, dz: number) => {
      for (let i = 0; i < diam; i++) {
        if (lookup.has(`${x+dx*i},${y+dy*i},${z+dz*i}`)) {
          return false;
        }
      }
      return true;
    };
    for (let d = -1; d <= 1; d+=2) {
      if (checkDir(d, 0, 0) || checkDir(0, d, 0) || checkDir(0, 0, d)) {
        return true;
      }
    }
    return false;
  };

  const interiorCandidates = [...interiorCandidatesStr].map(line => readInts(line, {expect: 3}));
  console.log('interior candidates', interiorCandidates.length);
  const [definitelyOutsideList, possiblyInside] = _.partition(interiorCandidates, ([x, y, z]) => isClearlyOutside(x, y, z));
  console.log('num to check', possiblyInside.length);  // 548 for input
  console.log(possiblyInside);
  const definitelyOutside = new Set(definitelyOutsideList.map(ser));

  const interiorNeighbors = function *(xyz: [number, number, number]) {
    for (const n of neighbors6(xyz)) {
      const s = ser(n);
      if (lookup.has(s)) {
        continue;
      }
      if (definitelyOutside.has(s)) {
        throw new InfiniteFloodException();
      } else {
        yield tuple(n, 1);
      }
    }
  };

  for (const seed of possiblyInside) {
    const str = ser(seed);
    if (knownInterior.has(str)) {
      continue;
    }
    // Flood fill with a max diameter; throw if we hit a cell that's open to the outside.
    try {
      const ds = flood(seed, interiorNeighbors, ser, deser, diam + 1);
      for (const [, n] of ds) {
        knownInterior.add(ser(n));
      }
    } catch (e) {
      if (e instanceof InfiniteFloodException) {
        definitelyOutside.add(str);
        continue;
      }
      throw e;
    }
  }

  surfaces = 0;
  for (const [x, y, z] of cubes) {
    for (let d = -1; d <= 1; d+=2) {
      check(x + d, y, z);
      check(x, y + d, z);
      check(x, y, z + d);
    }
  }
  console.log('part 2', surfaces);

  // console.log('part 2', knownInterior.size);
  // 2826 = too high
  // 1038 = too low
}
