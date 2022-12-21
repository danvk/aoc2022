#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/22

import { _ } from "../../deps.ts";
import { dijkstra } from "../../dijkstra.ts";
import { Coord, Grid, neighbors4 } from "../../grid.ts";
import { assert, readInts, readLinesFromArgs, str2coord } from "../../util.ts";

// 20183 is prime.
const P = 20183;

function fillGrid(erosion: Grid<number>, g: Grid<Terrain>, c: Coord, depth: number): Terrain {
  const existing = g.get(c);
  if (existing) {
    return existing;
  }

  const [x, y] = c;
  let v;
  if (x === 0) {
    v = (y * 48271 + depth) % P;
  } else if (y === 0) {
    v = (x * 16807 + depth) % P;
  } else {
    fillGrid(erosion, g, [x - 1, y], depth);
    fillGrid(erosion, g, [x, y - 1], depth);
    const a = erosion.get([x-1, y]);
    const b = erosion.get([x, y-1]);
    assert(a, `For ${x},${y} Missing ${x-1},${y}`);
    assert(b, `For ${x},${y} Missing ${x},${y-1}`);
    v = (a * b + depth) % P;
  }

  const m = v % 3;
  erosion.set(c, v);
  const r = m === 0 ? '.' : m === 1 ? '=' : '|';
  g.set(c, r);
  return r;
}

type Terrain = '.' | '=' | '|';
const ROCKY: Terrain = '.';
const WET: Terrain = '=';
const NARROW: Terrain = '|';

function initGrid(depth: number, target: Coord): [Grid<number>, Grid<Terrain>] {
  const g = new Grid<Terrain>();
  const erosion = new Grid<number>();
  const [tx, ty] = target;

  erosion.set([0, 0], depth % P);
  g.set([0, 0], ROCKY);

  for (let i = 1; i < tx + ty; i++) {
    for (let x = 0; x <= i; x++) {
      const y = i - x;
      if (y < 0 || y > ty || x > tx) {
        continue;
      }
      fillGrid(erosion, g, [x, y], depth);
    }
  }
  erosion.set(target, depth % P);
  g.set(target, ROCKY);

  return [erosion, g];
}

function riskLevel(c: string) {
  // 0 for rocky regions, 1 for wet regions, and 2 for narrow regions.
  if (c === ROCKY) return 0;
  if (c === WET) return 1;
  if (c === NARROW) return 2;
  throw new Error('Surprise terrain: ' + c);
}

type Tool = 'torch' | 'gear';
type State = [Coord, Tool|null];

function serState(s: State): string {
  const [[x, y], tool] = s;
  return `${x},${y};${tool}`;
}

function deserState(txt: string): State {
  const [coord, tool] = txt.split(';');
  return [
    str2coord(coord),
    tool === 'null' ? null : tool === 'torch' ? 'torch' : 'gear',
  ];
}

const ALLOWED_TOOLS: Record<Terrain, (Tool|null)[]> = {
  // In rocky regions, you can use the climbing gear or the torch.
  //    You cannot use neither (you'll likely slip and fall).
  [ROCKY]: ['gear', 'torch'],
  // In wet regions, you can use the climbing gear or neither tool.
  //    You cannot use the torch (if it gets wet, you won't have a light source).
  [WET]: ['gear', null],
  // In narrow regions, you can use the torch or neither tool.
  //    You cannot use the climbing gear (it's too bulky to fit).
  [NARROW]: ['torch', null],
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  assert(lines.length === 2);
  const [depth] = readInts(lines[0], {expect: 1});
  const target = readInts(lines[1], {expect: 2}) as Coord;
  const [erosion, g] = initGrid(depth, target);
  console.log(g.format(v => v));

  console.log('part 1', _.sum([...g.mapValues(riskLevel)].map(([, v]) => v)));

  const neighbors = function* ([c, tool]: [Coord, Tool|null]): Generator<[State, number]> {
    const r = g.get(c);
    assert(r);
    const okTools = ALLOWED_TOOLS[r];
    assert(okTools.includes(tool));
    for (const nextT of okTools) {
      if (nextT !== tool) {
        yield [[c, nextT], 7];
      }
    }

    for (const n of neighbors4(c)) {
      const [x, y] = n;
      if (x < 0 || y < 0) continue;
      let rn = g.get(n);
      if (!rn) {
        rn = fillGrid(erosion, g, n, depth);  // lazily expand grid
      }
      const nextTools = ALLOWED_TOOLS[rn];
      if (nextTools.includes(tool)) {
        yield [[n, tool], 1];
      }
    }
  }

  const init: State = [[0, 0], 'torch'];
  const final: State = [target, 'torch'];
  assert(_.isEqual(init, deserState(serState(init))));
  assert(_.isEqual(final, deserState(serState(final))));

  const result = dijkstra(
    init,
    final,
    neighbors,
    serState,
    deserState,
  );
  assert(result);
  const [d, _path] = result;

  // 9705=too high
  // 9659

  // console.log('part 1', depth, target);
  console.log('part 2', d);
}
