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
  for (let i = 0; i < 2022; i++) {
    jetI = drop(g, i % shapes.length, jets, jetI);
    // console.log(i, ':');
    // console.log(g.format(v => v, '.'));
    // console.log('');
    // if (jetI === -1) {
    //   break;
    // }
  }
  const {y: [minY]} = g.boundingBox();
  console.log('part 1', -minY);
  console.log('part 2');
}
