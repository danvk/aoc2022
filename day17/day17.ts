#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/17

import { _ } from "../deps.ts";
import { Coord, Grid } from "../grid.ts";
import { assert, readLinesFromArgs } from "../util.ts";

const shapes: Coord[][] = [
  [
    // '####'
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ],
  [
    // '.#.',
    // '###',
    // '.#.',
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 2],
  ], [
    // '..#',
    // '..#',
    // '###',
    [2, 0],
    [2, 1],
    [0, 2],
    [1, 2],
    [2, 2],
  ], [
    // '#',
    // '#',
    // '#',
    // '#',
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
  ], [
    // '##',
    // '##',
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ]
];
const pieceHeight = [1, 3, 3, 4, 2];

function willFit(g: Grid<string>, piece: number, [px, py]: Coord): boolean {
  const p = shapes[piece];
  for (const [dx, dy] of p) {
    const x = px + dx;
    const y = py + dy;
    if (x < 0 || x >= 7 || y >= 0 || g.get([x, y])) {
      return false;
    }
  }
  return true;
}

function drop(g: Grid<string>, piece: number, jets: number[], jetI: number): number {
  const {y: [minY]} = g.boundingBox();

  let x = 2;
  let y = minY - 3 - pieceHeight[piece];

  /*
  if (piece === 4) {
    const p = shapes[piece];
    for (const [dx, dy] of p) {
      const px = x + dx;
      const py = y + dy;
      g.set([px, py], '@');
    }
    return -1;
  }
  */

  while (true) {
    const jetDx = jets[jetI];
    // console.log(x, y, jetDx);
    jetI = (jetI + 1) % jets.length;
    if (willFit(g, piece, [x + jetDx, y])) {
      x += jetDx;
      // console.log('>', x, y);
    }
    if (willFit(g, piece, [x, y + 1])) {
      y++;
      // console.log('v', x, y);
    } else {
      const p = shapes[piece];
      for (const [dx, dy] of p) {
        const px = x + dx;
        const py = y + dy;
        g.set([px, py], '#');
      }
      return jetI;
    }
  }
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  assert(lines.length === 1);
  const jets = lines[0].split('').map(c => c === '<' ? -1 : +1);
  const g = Grid.fromLines(['-------'])
  console.log(g.format(v => v, '.'));
  console.log('');
  let jetI = 0;
  const heights = [];
  // const n = 40_000;

  for (let i = 0; i <= 5000; i++) {
    jetI = drop(g, i % shapes.length, jets, jetI);
    // console.log(i, ':');
    // console.log(g.format(v => v, '.'));
    // console.log('');
    // if (jetI === -1) {
    //   break;
    // }
    const {y: [minY]} = g.boundingBox();
    // const allFull = _.range(7).every(x => !!g.get([x, minY]));
    // console.log(i, -minY, allFull);
    // if (allFull) {
    //  console.log(i, -minY, jetI);
    // }
    heights.push(-minY);
    if (i === 2021) {
      console.log('part 1', -minY);
    }
    // if (i === n) {
    //   console.log('direct', n, ' ->', -minY);
    // }
  }

  const n = 1_000_000_000_000 - 1;
  // 2022 -> 3168 / 3171

  const cycles = Math.floor(n / 1700) - 1;
  const rem = n % 1700;
  console.log('part 2', 2642 * cycles + heights[1700 + rem]);
}

// Times when the top row is all full:
//  1485  2318 8772
//  3185  4960 8772    +1700, +2642
//  4885  7602 8772    +1700, +2642
//  6585 10244 8772
//  8285 12886 8772
//  9985 15528 8772
// 11685 18170 8772
// 13385 20812 8772
// 15085 23454 8772
// 16785 26096 8772
// 18485 28738 8772
// 20185 31380 8772
// 21885 34022 8772
// 23585 36664 8772
// 25285 39306 8772
// 26985 41948 8772
// 28685 44590 8772
// 30385 47232 8772
// 32085 49874 8772
// 33785 52516 8772
// 35485 55158 8772
// 37185 57800 8772
// 38885 60442 8772