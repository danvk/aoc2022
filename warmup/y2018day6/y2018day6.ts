#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/6

import { _ } from "../../deps.ts";
import { assert, coord2str, minmax, readLinesFromArgs, sortWithIndex, str2coord, tuple, zeros } from "../../util.ts";

function readLine(line: string): [number, number] {
  const m = /(\d+), (\d+)/.exec(line);
  assert(m, line);
  const [, x, y] = m;
  return [Number(x), Number(y)];
}

function _neighbors8(coord: string): string[] {
  const [x, y] = str2coord(coord);
  const out = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx || dy) {
        out.push(coord2str([x + dx, y + dy]));
      }
    }
  }
  return out;
}

function _neighbors4(coord: string): string[] {
  const [x, y] = str2coord(coord);
  return [
    tuple(x - 1, y),
    tuple(x + 1, y),
    tuple(x, y - 1),
    tuple(x, y + 1),
  ].map(coord2str);
}

function countByKey(m: Map<string, number>): number[] {
  const vals = [...m.values()];
  const b = _.max(vals)!;
  const counts = zeros(1 + b);
  for (const val of vals) {
    if (val >= 0) {
      counts[val]++;
    }
  }
  return counts;
}

// This is a BFS implementation that turns out to be way overkill
function _search(
  seeds: string[],
  neighbors: (node: string) => string[],
  rounds: number,
): number {
  // maps node string --> closest source
  const results = new Map<string, number>();
  for (const [i, seed] of seeds.entries()) {
    results.set(seed, i);
  }

  let fringe = new Map(results);
  for (let i = 0; i < rounds; i++) {
    const nextFringe = new Map<string, number>();
    for (const [node, src] of fringe.entries()) {
      if (src === -1) {
        continue;
      }
      for (const n of neighbors(node)) {
        if (results.has(n)) {
          // already a shorter path here
        } else if (nextFringe.has(n)) {
          const other = nextFringe.get(n);
          if (other !== src) {
            // equidistant to two sources
            nextFringe.set(n, -1);
          }
        } else {
          nextFringe.set(n, src);
        }
      }
    }

    for (const [node, src] of nextFringe.entries()) {
      assert(!results.has(node));
      results.set(node, src);
    }
    fringe = nextFringe;
    /*
    console.log('After round', i + 1);
    console.log(results);
    console.log(countByKey(results));
    console.log(countByKey(fringe));
    console.log('');
    */
  }

  const areas = countByKey(results);
  const fringeCounts = countByKey(fringe);
  const finiteAreas = [];
  for (const [i, count] of fringeCounts.entries()) {
    if (count === 0) {
      console.log(i, areas[i]);
      finiteAreas.push(areas[i]);
    }
  }

  return _.max(finiteAreas)!;
}

function maxFiniteArea(seeds: readonly [number, number][]): number {
  const [xmin, xmax] = minmax(seeds.map(([x, _y]) => x));
  const [ymin, ymax] = minmax(seeds.map(([_x, y]) => y));
  const infiniteSeeds = new Set<number>();

  const closestSeed = (x: number, y: number) => {
    // const ds = _.sortBy(seeds.map(([sx, sy], i) => tuple(Math.abs(x - sx) + Math.abs(y - sy), i)), ([d, _i]) => d);
    const ds = sortWithIndex(seeds, ([sx, sy]) => Math.abs(x - sx) + Math.abs(y - sy));
    const d0 = ds[0][0];
    const d1 = ds[1][0];
    if (d0 !== d1) {
      return ds[0][1];
    }
    return -1;
  }

  // If it's closest to the bounding rect, then it's infinite.
  for (let x = xmin; x <= xmax; x++) {
    infiniteSeeds.add(closestSeed(x, ymin));
    infiniteSeeds.add(closestSeed(x, ymax));
  }
  for (let y = ymin; y <= ymax; y++) {
    infiniteSeeds.add(closestSeed(xmin, y));
    infiniteSeeds.add(closestSeed(xmax, y));
  }

  const counts = new Map<number, number>();
  for (let x = xmin; x <= xmax; x++) {
    for (let y = ymin; y <= ymax; y++) {
      const s = closestSeed(x, y);
      if (s >= 0 && !infiniteSeeds.has(s)) {
        counts.set(s, 1 + (counts.get(s) ?? 0));
      }
    }
  }
  console.log(counts);
  return _.max([...counts.values()])!;
}

function oneAxisBound(xs: readonly number[], n: number): [number, number] {
  const [a, b] = minmax(xs);
  return [a - Math.ceil(n / xs.length), b + Math.ceil(n / xs.length)];
}

function areaWithinN(seeds: readonly [number, number][], n: number): number {
  // This rectangle contains all possible coordinates within n of all seeds
  const [xmin, xmax] = oneAxisBound(seeds.map(([x, _y]) => x), n);
  const [ymin, ymax] = oneAxisBound(seeds.map(([_x, y]) => y), n);

  let area = 0;
  for (let x = xmin; x <= xmax; x++) {
    for (let y = ymin; y <= ymax; y++) {
      const d = _.sumBy(seeds, ([sx, sy]) => Math.abs(x - sx) + Math.abs(y - sy));
      if (d < n) {
        area++;
      }
    }
  }
  return area;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const inits = lines.map(readLine);
  // const seeds = inits.map(coord2str);
  // const max = _.max(inits.flat())!;
  // console.log(max, 'rounds');
  // const largestFinite = search(seeds, neighbors4, max);
  // console.log('part 1', largestFinite);
  console.log('part 1', maxFiniteArea(inits));
  console.log('part 2', areaWithinN(inits, 10000));
}
