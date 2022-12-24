#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/24

// Idea:
// sample grid is 5x5 (gcd=5)
// input grid is 120x25 (gcd=600)
//
// The blizzards cycle with period of height or width.
// So do Dijkstra with (x, y, t % lcm(w, h)) as the state.

import { _ } from "../deps.ts";
import { dijkstra } from "../dijkstra.ts";
import { Grid } from "../grid.ts";
import { readInts, readLinesFromArgs, safeParseInt, tuple, zeros } from "../util.ts";

function gcd(a: number, b: number) {
  let temp;
  while (b !== 0) {
    temp = a % b;
    a = b;
    b = temp;
  }
  return a;
}

type State = [x: number, y: number, t: number];

function ser([x, y, t]: State): string {
  return `${x},${y},${t}`;
}
function deser(txt: string): State {
  return txt.split(',').map(safeParseInt) as State;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const g = Grid.fromLines(lines);
  console.log(g.boundingBox());
  const {x: [minX, maxX], y: [minY, maxY]} = g.boundingBox();
  const w = maxX - minX - 1;
  const h = maxY - minY - 1;
  const period = w  * h / gcd(w, h);
  console.log(w, h, gcd(w, h), period);

  const ewBliz: [number, number][][] = zeros(h).map(() => []);
  const nsBliz: [number, number][][] = zeros(w).map(() => []);
  for (const [[x, y], m] of g) {
    if (m === '>' || m === '<') {
      ewBliz[y - 1].push(tuple(x - 1, m === '>' ? 1 : -1));
    } else if (m === '^' || m === 'v') {
      nsBliz[x - 1].push(tuple(y - 1, m === 'v' ? 1 : -1));
    }
  }

  console.log('ew', ewBliz);
  console.log('ns', nsBliz);

  const DELTAS: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [0, 0],
  ];
  const init: State = [0, -1, 0];
  const done = (s: State) => s[1] === h;
  const neighbors = function* ([x, y, t]: State) {
    for (const [dx, dy] of DELTAS) {
      const nx = x + dx;
      const ny = y + dy;
      const nt = t + 1;
      // Is this the start or end square? (always valid)
      if ((nx === 0 && ny === -1) || (nx === w - 1 && ny === h)) {
        yield tuple(tuple(nx, ny, nt), 1);
      }
      // Is this on the grid?
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) {
        continue;
      }
      // Are there any blizzards at this coordinate?
      const ewB = ewBliz[ny];
      const nsB = nsBliz[nx];
      // console.log(nx, ny, nt);
      let isBliz = false;
      for (const [bxInit, bxD] of ewB) {
        if ((bxInit + bxD * nt) % period === nx) {
          isBliz=true;
        }
      }
      for (const [byInit, byD] of nsB) {
        if ((byInit + byD * nt) % period === ny) {
          isBliz=true;
        }
      }

      if (!isBliz) {
        yield tuple(tuple(nx, ny, nt), 1);
      }
    }
  };

  const [steps, path] = dijkstra(
    init,
    done,
    neighbors,
    ser,
    deser,
  )!;

  console.log('part 1', steps);
  console.log(path);
  console.log('part 2');
}
