import { _ } from "./deps.ts";
import { assert, coord2str, map2d, str2coord, tuple, zeros } from "./util.ts";

export type Coord = [number, number];

/** A two dimensional grid, implemented as a sparse Map */
export class Grid<V> implements Iterable<[[number, number], V]> {
  m: Map<string, V>;
  xRange: [number, number] | null;
  yRange: [number, number] | null;

  constructor() {
    this.m = new Map();
    this.xRange = null;
    this.yRange = null;
  }

  static fromLines(lines: readonly string[]): Grid<string> {
    const g = new Grid<string>();
    const numRows = lines.length;
    const numCols = _.max(lines.map(line => line.length))!;
    for (let y = 0; y < numRows; y++) {
      for (let x = 0; x < numCols; x++ ) {
        const c = lines[y][x];
        if (c && c !== ' ') {
          g.set([x, y], c);
        }
      }
    }
    return g;
  }

  get(c: Coord): V | undefined {
    return this.m.get(coord2str(c));
  }

  set(c: Coord, v: V) {
    const [x, y] = c;
    if (!this.xRange || !this.yRange) {
      this.xRange = [x, x];
      this.yRange = [y, y];
    } else {
      if (x < this.xRange[0]) {
        this.xRange[0] = x;
      } else if (x > this.xRange[1]) {
        this.xRange[1] = x;
      }
      if (y < this.yRange[0]) {
        this.yRange[0] = y;
      } else if (y > this.yRange[1]) {
        this.yRange[1] = y;
      }
    }
    return this.m.set(coord2str(c), v);
  }

  boundingBox(): {x: Coord, y: Coord} {
    assert(this.xRange);
    assert(this.yRange);
    return {x: [...this.xRange], y: [...this.yRange]};
    // const coords = [...this.m.keys()].map(str2coord);
    // return {
    //   x: minmax(coords.map(c => c[0])),
    //   y: minmax(coords.map(c => c[1])),
    // };
  }

  // TODO: make formatter optional if V=string
  formatCells(format: (v: V, c: Coord) => string, blank: string | ((c: Coord) => string) =' '): string[][] {
    const {x: [minX, maxX], y: [minY, maxY]} = this.boundingBox();

    const blanker = typeof blank === 'string' ? () => blank : (_: unknown, i: number, j: number) => blank([minX + i, minY + j]);
    const txt = map2d(zeros(maxY - minY + 1, maxX - minX + 1), blanker);
    for (const [c, v] of this.m) {
      const coord = str2coord(c);
      const [x, y] = coord;
      txt[y - minY][x - minX] = format(v, [x, y]);
    }
    return txt;
  }

  format(format: (v: V, c: Coord) => string, blank: string | ((c: Coord) => string) = ' '): string {
    return this.formatCells(format, blank).map(row => row.join('')).join('\n');
  }

  mapValues<U>(fn: (v: V, c: Coord) => U): Grid<U> {
    const out = new Grid<U>();
    for (const [c, v] of this) {
      out.set(c, fn(v, c));
    }
    return out;
  }

  counts(): Record<V & string, number> {
    const out = {} as Record<V & string, number>;
    for (const v of this.m.values()) {
      const vS = v as V & string;
      out[vS] = (out[vS] ?? 0) + 1;
    }
    return out;
  }

  findIndices(pred: (v: V, c: Coord) => boolean): Coord[] {
    const out = [];
    for (const [cStr, v] of this.m) {
      const c = str2coord(cStr);
      if (pred(v, c)) {
        out.push(c);
      }
    }
    return out;
  }

  [Symbol.iterator](): Iterator<[[number,number],V], unknown, undefined> {
    // It's nice that Generator is assignable to Iterator.
    // Questions here:
    // - any way to avoid that = this?
    // - why do I need to `return fn()` instead of `return fn`?
    // deno-lint-ignore no-this-alias
    const that = this;
    const fn = function*() {
      for (const [k, v] of that.m) {
        yield tuple(str2coord(k), v);
      }
    };
    return fn();
    // Why can't I do this? What's the difference between Iterable, Iterator and IterableIterator?
    // return itertools.map(this.m, (cStr, v) => tuple(str2coord(cStr), v));
  }

  transpose(): Grid<V> {
    const g = new Grid<V>();
    for (const [[x, y], v] of this) {
      g.set([y, x], v);
    }
    return g;
  }
}

export function neighbors4(c: Coord): Coord[] {
  const [x, y] = c;
  return [
    tuple(x - 1, y),
    tuple(x + 1, y),
    tuple(x, y - 1),
    tuple(x, y + 1),
  ];
}

export function neighbors8(c: Coord): Coord[] {
  const [x, y] = c;
  return [
    tuple(x - 1, y - 1),
    tuple(x - 1, y),
    tuple(x - 1, y + 1),
    tuple(x, y - 1),
    tuple(x, y + 1),
    tuple(x + 1, y - 1),
    tuple(x + 1, y),
    tuple(x + 1, y + 1),
  ];
}

/** Manhattan distance aka L1 */
export function manhattan(a: Coord, b: Coord) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

/** Yields each coordinate in a rectangle. All boundaries are inclusive. */
export function* range2d(topLeft: Coord, bottomRight: Coord): Generator<Coord> {
  const [x1, y1] = topLeft;
  const [x2, y2] = bottomRight;

  for (let x = x1; x <= x2; x++) {
    for (let y = y1; y <= y2; y++) {
      yield tuple(x, y);
    }
  }
}

export type Dir4 = 'N' | 'S' | 'E' | 'W';
export type Dir8 = Dir4 | "NW" | "NE" | "SW" | "SE";

export const DELTAS: Record<Dir8, Coord> = {
  'NW': [-1, -1],
  'N': [0, -1],
  'NE': [1, -1],
  'E': [1, 0],
  'W': [-1, 0],
  'SW': [-1, 1],
  'S': [0, 1],
  'SE': [1, 1],
};

export function addCoord([ax, ay]: Coord, [bx, by]: Coord): Coord {
  return [ax + bx, ay + by];
}
