#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/12

import { _ } from "../deps.ts";
import { Coord, Grid } from "../grid.ts";
import { assert, coord2str, readLinesFromArgs, str2coord, tuple } from "../util.ts";

function readGrid(lines: readonly string[]) {
  const gS = Grid.fromLines(lines);
  let start: Coord | null = null;
  let end: Coord | null = null;
  const g = gS.mapValues((v, c) => {
    if (v === "S") {
      start = c;
      return 0;
    } else if (v === "E") {
      end = c;
      return 25;
    } else if (v >= "a" && v <= "z") {
      return v.charCodeAt(0) - "a".charCodeAt(0);
    }
    throw new Error("Surprise cell" + v);
  });
  if (!start || !end) {
    throw new Error("No start/end");
  }
  return tuple(g, start, end);
}

function dijkstra(g: Grid<number>, start: Coord, end: Coord) {
  const distance = g.mapValues(() => -1);
  distance.set(start, 0);
  let fringe = [start];
  // const parent: {[coord: string]: string} = {};

  const neighbors = (c: Coord) => {
    const [x, y] = c;
    const out = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        if (dx && dy) continue;  // no diagonals
        const n = tuple(x + dx, y + dy);
        const h0 = g.get(c);
        const h1 = g.get(n);
        if (h0 === undefined || h1 === undefined) {
          continue;
        }
        if (h1 - h0 <= 1) {
          out.push(n);
        }
      }
    }
    return out;
  };

  while (distance.get(end) === -1) {
    fringe = _.sortBy(fringe, c => distance.get(c));
    const c = fringe.shift();
    if (!c) {
      return null;
      // throw new Error('out of paths!');
    }
    const d = distance.get(c);
    if (d === undefined || d === -1) {
      throw new Error();
    }
    for (const n of neighbors(c)) {
      const dn = distance.get(n);
      assert(dn);
      if (dn === -1 || dn > 1 + d) {
        distance.set(n, 1 + d);
        fringe.push(n);
        // parent[coord2str(n)] = coord2str(c);
      }
    }
  }
  return distance.get(end);

  /*
  const path = [];
  let n = end;
  while (n) {
    path.push(n);
    const p = parent[coord2str(n)];
    if (!p) {
      break;
    }
    n = str2coord(p);
  }
  */

  // return tuple(distance.get(end)!, _.reverse(path));
}

function part2(g: Grid<number>, end: Coord): number {
  let minD: number | null = null;
  for (const [c, h] of g) {
    if (h !== 0) continue;
    const d = dijkstra(g, c, end)!;
    if (d !== null && (minD === null || d < minD)) {
      minD = d;
    }
  }
  assert(minD);
  return minD;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const [grid, start, end] = readGrid(lines);

  console.log(grid.format((v) => String.fromCharCode("a".charCodeAt(0) + v)));
  console.log("part 1", dijkstra(grid, start, end));
  console.log("part 2", part2(grid, end));
}
