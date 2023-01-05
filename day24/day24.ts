#!/usr/bin/env -S deno run --allow-read --allow-write
// --inspect-brk
// --v8-flags=--prof
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
import { assert, readLinesFromArgs, safeParseInt, tuple, zeros } from "../util.ts";

function gcd(a: number, b: number) {
  let temp;
  while (b !== 0) {
    temp = a % b;
    a = b;
    b = temp;
  }
  return a;
}

// Legs:
const OUT = 0;
const BACK = 1;
const OUT_AGAIN = 2;
type State = [x: number, y: number, t: number, leg: number];

function ser([x, y, t, leg]: State): string {
  return `${x},${y},${t},${leg}`;
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

  // console.log('ew', ewBliz);
  // console.log('ns', nsBliz);

  const DELTAS: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [0, 0],
  ];
  const init: State = [0, -1, 0, OUT];
  const done1 = (s: State) => (s[1] === h);
  const done2 = (s: State) => (s[1] === h && s[3] === OUT_AGAIN);
  // const done = (s: State) => (s[1] === h);
  const neighbors = function* ([x, y, t, leg]: State): Generator<[State, number]> {
    for (const [dx, dy] of DELTAS) {
      const nx = x + dx;
      const ny = y + dy;
      const nt = t + 1;
      // Is this the start or end square? (always valid)
      if (nx === 0 && ny === -1) {
        if (leg === BACK) {
          // console.log('OUT AGAIN');
          yield tuple(tuple(nx, ny, nt, OUT_AGAIN), 1);
        } else {
          yield tuple(tuple(nx, ny, nt, leg), 1);
        }
      } else if (nx === w - 1 && ny === h) {
        if (leg === OUT) {
          // console.log('BACK');
          yield tuple(tuple(nx, ny, nt, BACK), 1);
        } else {
          yield tuple(tuple(nx, ny, nt, leg), 1);
        }
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
        if (((bxInit + bxD * nt) % w + w) % w === nx) {
          isBliz=true;
        }
      }
      for (const [byInit, byD] of nsB) {
        if (((byInit + byD * nt) % h + h) % h === ny) {
          isBliz=true;
        }
      }

      if (!isBliz) {
        yield tuple(tuple(nx, ny, nt, leg), 1);
      }
    }
  };

  const printGrid = (s: State) => {
    const t = s[2];
    const g = new Grid<string>();
    for (const [y, ewB] of ewBliz.entries()) {
      for (const [bxInit, bxD] of ewB) {
        const x = ((bxInit + bxD * t) % w + w) % w;
        const c = tuple(x, y);
        const old = g.get(c);
        if (!old) {
          g.set(c, bxD < 0 ? '<' : '>');
        } else if (isNaN(Number(old))) {
          g.set(c, '2');
        } else {
          g.set(c, String(1 + Number(old)));
        }
      }
    }
    for (const [x, nsB] of nsBliz.entries()) {
      for (const [byInit, byD] of nsB) {
        const y = ((byInit + byD * t) % h + h) % h;
        const c = tuple(x, y);
        const old = g.get(c);
        if (!old) {
          g.set(c, byD < 0 ? '^' : 'v');
        } else if (isNaN(Number(old))) {
          g.set(c, '2');
        } else {
          g.set(c, String(1 + Number(old)));
        }
      }
    }

    for (let x = -1; x <= w; x++) {
      g.set([x, -1], '#');
      g.set([x, h], '#');
    }
    for (let y = -1; y <= h; y++) {
      g.set([-1, y], '#');
      g.set([w, y], '#');
    }
    g.set([0, -1], '.');
    g.set([w-1, h], '.');

    const e = tuple(s[0], s[1]);
    assert(!g.get(e) || g.get(e) === '.', `Found ${g.get(e)} at ${e}`);
    g.set(e, 'E');
    console.log(g.format(v => v, '.'));
  };

  const [steps1, path1] = dijkstra(
    init,
    done1,
    neighbors,
    ser,
    deser,
  )!;
  console.log(path1);
  console.log('part 1', steps1);  // 147=too low

  const [steps2, path2] = dijkstra(
    init,
    done2,
    neighbors,
    ser,
    deser,
  )!;

  // for (const s of path) {
  //   console.log(s[2], ':');
  //   printGrid(s);
  //   console.log('');
  // }

  console.log(path2);
  console.log('part 2', steps2);
}
