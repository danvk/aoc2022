#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/9

import { _ } from "../deps.ts";
import { assert, coord2str, readLinesFromArgs, safeParseInt, tuple } from "../util.ts";

type Point = [number, number];

const dirs: {[dir: string]: Point} = {
  L: [-1, 0],
  R: [1, 0],
  U: [0, 1],
  D: [0, -1],
};

function touching(a: Point, b: Point): boolean {
  return Math.abs(a[0] - b[0]) <= 1 && Math.abs(a[1] - b[1]) <= 1;
}

function move(head: Point, tail: Point, dir: string): [Point, Point] {
  const [dx, dy] = dirs[dir];
  const [tx, ty] = tail;
  const h: Point = [head[0] + dx, head[1] + dy];
  if (touching(h, tail)) {
    return [h, tail];
  }
  if (h[0] === tx) {
    assert(dir === 'U' || dir === 'D');
    const t: Point = [tx, ty + dy];
    assert(touching(h, t));
    return [h, t];
  } else if (h[1] == ty) {
    assert(dir === 'L' || dir === 'R');
    const t: Point = [tx + dx, ty];
    assert(touching(h, t));
    return [h, t];
  } else {
    for (let dx2 = -1; dx2 <= 1; dx2 += 2) {
      for (let dy2 = -1; dy2 <= 1; dy2 += 2) {
        const t: Point = [tx + dx2, ty + dy2];
        if (touching(h, t)) {
          return [h, t];
        }
      }
    }
  }
  throw new Error('no touch!');
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const moves = lines.map(line => {
    const [dir, num] = line.split(' ');
    return tuple(dir, safeParseInt(num));
  });
  let head: Point = [0, 0];
  let tail: Point = [0, 0];
  const spots = new Set<string>([coord2str([0, 0])]);
  for (const [dir, num] of moves) {
    for (let i = 0; i < num; i++) {
      [head, tail] = move(head, tail, dir);
      console.log(tail);
      spots.add(coord2str(tail));
    }
  }
  console.log('part 1', spots.size);
  console.log('part 2');
}
