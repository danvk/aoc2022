#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/13

// Notes:
// - Debugging experience w/ Deno is pretty bad
//   - You need `--inspet-brk`, same as Node.js
//   - There are no docs on setting up debugging in VS Code.
//   - No source map in Chrome debugger
// - You can use a tuple as a key in a Map, but it's a bad idea.
//   - No type errors or anything
//   - Lookups use reference equality, not structural equality
//   - This will be much better with Records + Tuples

import { _ } from "../../deps.ts";
import { Grid } from "../../grid.ts";
import { assert, assertUnreachable, readLinesFromArgs, tuple } from "../../util.ts";

type Dir = 'up' | 'left' | 'down' | 'right';
const dirs: Record<Dir, [number, number]> = {
  'up': [0, -1],
  'left': [-1, 0],
  'down': [0, 1],
  'right': [1, 0],
};
const clockwise: Record<Dir, Dir> = {
  'up': 'right',
  'right': 'down',
  'down': 'left',
  'left': 'up',
};
const ccw = _.invert(clockwise) as Record<Dir, Dir>;
const sym: Record<Dir, string> = {
  'up': '^',
  'left': '<',
  'right': '>',
  'down': 'v',
};

const intDirs = ['left', 'straight', 'right'] as const;

interface Cart {
  x: number;
  y: number;
  dir: Dir;
  numIntersections: number;
}

type Track = Grid<string>;

function readTrack(lines: readonly string[]): [Track, Cart[]] {
  const numRows = lines.length;
  const numCols = _.max(lines.map(line => line.length))!;

  const tracks = new Grid<string>();
  const carts: Cart[] = [];

  for (let y = 0; y < numRows; y++) {
    for (let x = 0; x < numCols; x++ ) {
      const c = lines[y][x];
      if (c === ' ' || !c) {
        continue;
      } else if ('-|\\/+'.includes(c)) {
        tracks.set([x, y], c);
      } else {
        const base = {x, y, numIntersections: 0};
        const pos = tuple(x, y);
        if (c === '>') {
          tracks.set(pos, '-');
          carts.push({...base, dir: 'right'});
        } else if (c === '<') {
          tracks.set(pos, '-');
          carts.push({...base, dir: 'left'});
        } else if (c === '^') {
          tracks.set(pos, '|');
          carts.push({...base, dir: 'up'});
        } else if (c === 'v') {
          tracks.set(pos, '|');
          carts.push({...base, dir: 'down'});
        } else {
          throw new Error('Invalid symbol ' + c);
        }
      }
    }
  }
  return tuple(tracks, carts);
}

function move(track: Track, cart: Cart) {
  const [dx, dy] = dirs[cart.dir];
  cart.x += dx;
  cart.y += dy;
  const c = track.get([cart.x, cart.y]);
  if (!c) {
    throw new Error('Train off the track!');
  }
  if (c === '-') {
    assert(dy === 0);
  } else if (c === '|') {
    assert(dx === 0);
  } else if (c === '/') {
    if (cart.dir === 'right' || cart.dir === 'left') {
      cart.dir = ccw[cart.dir];
    } else {
      cart.dir = clockwise[cart.dir];
    }
  } else if (c === '\\') {
    if (cart.dir === 'left' || cart.dir === 'right') {
      cart.dir = clockwise[cart.dir];
    } else {
      cart.dir = ccw[cart.dir];
    }
  } else if (c === '+') {
    const n = cart.numIntersections;
    cart.numIntersections++;
    const turn = intDirs[n % 3];
    if (turn === 'left') {
      cart.dir = ccw[cart.dir];
    } else if (turn === 'right') {
      cart.dir = clockwise[cart.dir];
    } else if (turn === 'straight') {
      // noop
    } else {
      assertUnreachable(turn);
    }
  }
}

function printTrack(track: Track, carts: Cart[]) {
  const txt = track.formatCells(c => c);
  for (const cart of carts) {
    // TODO: check for collisions
    txt[cart.y][cart.x] = sym[cart.dir];
  }

  console.log(txt.map(row => row.join('')).join('\n'));
}

function tick(track: Track, carts: Cart[]): Cart[] {
  carts = _.sortBy(carts, 'y', 'x');
  const toDelete = [];
  for (const cart of carts) {
    move(track, cart);
    const {x, y} = cart;

    for (const other of carts) {
      if (other !== cart && other.x === cart.x && other.y === cart.y) {
        console.log('Collision at', x, y);
        toDelete.push(other);
        toDelete.push(cart);
      }
    }
  }

  return _.difference(carts, toDelete);
}

function part1(track: Track, carts: Cart[]) {
  while (true) {
    const numCarts = carts.length;
    carts = tick(track, carts);
    if (carts.length < numCarts) {
      return;
    }
    // printTrack(track, carts);
    // console.log('');
  }
}

function part2(track: Track, carts: Cart[]) {
  while (carts.length > 1) {
    carts = tick(track, carts);
  }
  console.log(carts[0].x, carts[0].y);
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const [tracks, carts] = readTrack(lines);
  printTrack(tracks, carts);
  part1(tracks, carts);

  const [tracks2, carts2] = readTrack(lines);
  part2(tracks2, carts2);
}
