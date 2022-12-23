#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/23

import { _ } from "../deps.ts";
import { addCoord, Coord, DELTAS, Dir4, Dir8, Grid } from "../grid.ts";
import { assert, coord2str, readLinesFromArgs } from "../util.ts";

const MOVES: [Dir8[], Dir4][] = [
  // If there is no Elf in the N, NE, or NW adjacent positions, the Elf proposes moving north one step.
  [['N', 'NE', 'NW'], 'N'],
  // If there is no Elf in the S, SE, or SW adjacent positions, the Elf proposes moving south one step.
  [['S', 'SE', 'SW'], 'S'],
  // If there is no Elf in the W, NW, or SW adjacent positions, the Elf proposes moving west one step.
  [['W', 'NW', 'SW'], 'W'],
  // If there is no Elf in the E, NE, or SE adjacent positions, the Elf proposes moving east one step.
  [['E', 'NE', 'SE'], 'E'],
];

function shift<T>(xs: T[], amount: number): T[] {
  const n = xs.length;
  return xs.map((_, i) => xs[(i + amount) % n]);
}

function doRound(g: Grid<string>, turnNum: number): Grid<string> | null {
  const moves = shift(MOVES, turnNum);
  // console.log(moves);
  const proposals: Record<string, Coord> = {}
  for (const [c, elf] of g) {
    if (elf !== '#') continue;
    // console.log('Considering', c);
    const neighbors = _.mapValues(DELTAS, d => g.get(addCoord(c, d)) === '#' ? 1 : 0);
    const numNeighbors = _.sum(Object.values(neighbors));
    if (numNeighbors === 0) {
      // If no other Elves are in one of those eight positions, the Elf does not do anything during this round.
      continue;
    }
    let proposal: Dir4 | null = null;
    for (const [ins, dir] of moves) {
      const match = ins.every(d => g.get(addCoord(c, DELTAS[d])) !== '#');
      if (match) {
        // console.log('  proposing moving', dir);
        proposal = dir;
        break;
      } else {
        // console.log('  will not move to', dir);
      }
    }
    if (proposal) {
      proposals[coord2str(c)] = addCoord(c, DELTAS[proposal]);
    }
  }
  const counts = _.countBy(Object.values(proposals).map(coord2str));
  // console.log(proposals);
  // console.log(counts);

  // Simultaneously, each Elf moves to their proposed destination tile
  // if they were the only Elf to propose moving to that position.
  let anyMoved = false;
  const nextGrid = new Grid<string>();
  for (const [c, elf] of g) {
    if (elf !== '#') continue;
    const cs = coord2str(c);
    const nextC = proposals[cs];
    if (!nextC) {
      // console.log('no proposal for', c, '; staying put.');
      nextGrid.set(c, '#');
      continue;
    }
    const count = counts[coord2str(nextC)];
    assert(count);
    if (count === 1) {
      // console.log('move', c, '->', nextC);
      nextGrid.set(nextC, '#');
      anyMoved = true;
    } else {
      // If two or more Elves propose moving to the same position,
      // none of those Elves move.
      nextGrid.set(c, '#');
      // console.log('contention for', c, ' at', nextC, '; does not move');
    }
  }

  return anyMoved ? nextGrid : null;
}

function numElves(g: Grid<string>): number {
  let n = 0;
  for (const [_, e] of g) {
    if (e === '#') n++;
  }
  return n;
}

function part1(g: Grid<string>): number {
  // console.log(g.boundingBox());
  const {x: [minX, maxX], y: [minY, maxY]} = g.boundingBox();
  let n = 0;
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      if (g.get([x, y]) !== '#') {
        n++;
      }
    }
  }
  return n;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  let g = Grid.fromLines(lines);
  console.log(g.format(v => v, '.'));
  console.log(numElves(g));

  let i;
  for (i = 0; true; i++) {
    // console.log(i);
    const nextG = doRound(g, i);
    if (i === 10) {
      console.log('part 1', part1(g));
    }
    if (!nextG) {
      break;
    } else {
      g = nextG;
    }
    // console.log(g.format(v => v, '.'));
    // console.log(numElves(g));
    // console.log('');
  }
  console.log('part 2', 1 + i);
}
