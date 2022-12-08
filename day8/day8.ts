#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/8

import { _ } from "../deps.ts";
import { readLinesFromArgs, safeParseInt, transpose, zeros } from "../util.ts";

function markVisible(xs: number[]): boolean[] {
  const out = zeros(xs.length).map(() => false);
  let top = xs[0];
  out[0] = true;
  for (let i = 1; i < xs.length; i++) {
    const x = xs[i];
    if (x > top) {
      top = x;
      out[i] = true;
    }
  }
  return out;
}

function markVisibleLR(xs: number[]): boolean[] {
  const left = markVisible(xs);
  const right = _.reverse(markVisible(_.reverse([...xs])));
  return left.map((v, i) => v || right[i]);
}

function markGridVisibleLR(xs: number[][]): boolean[][] {
  return xs.map(markVisibleLR);
}

function markVisibleGrid(xs: number[][]): number {
  const horiz = markGridVisibleLR(xs);
  transpose(xs);
  const vert = markGridVisibleLR(xs);
  transpose(vert);
  transpose(xs);

  let num = 0;
  for (let i = 0; i < xs.length; i++) {
    for (let j = 0; j < xs.length; j++) {
      if (horiz[i][j] || vert[i][j]) {
        num++;
      }
    }
  }
  return num;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const grid = lines.map(line => line.split('').map(safeParseInt));
  console.log('part 1', markVisibleGrid(grid));
  console.log('part 2');
}
