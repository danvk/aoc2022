import { _ } from "./deps.ts";
import { coord2str, map2d, minmax, str2coord, tuple, zeros } from "./util.ts";

export type Coord = readonly [number, number];

/** A two dimensional grid, implemented as a sparse Map */
export class Grid<V> implements Iterable<[[number, number], V]> {
  m: Map<string, V>;
  constructor() {
    this.m = new Map();
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
    return this.m.set(coord2str(c), v);
  }

  boundingBox(): {x: Coord, y: Coord} {
    const coords = [...this.m.keys()].map(str2coord);
    return {
      x: minmax(coords.map(c => c[0])),
      y: minmax(coords.map(c => c[1])),
    };
  }

  // TODO: make formatter optional if V=string
  formatCells(format: (v: V, c: Coord) => string, blank=' '): string[][] {
    const {x: [minX, maxX], y: [minY, maxY]} = this.boundingBox();

    const txt = map2d(zeros(maxY - minY + 1, maxX - minX + 1), () => blank);
    for (const [c, v] of this.m) {
      const coord = str2coord(c);
      const [x, y] = coord;
      txt[y - minY][x - minX] = format(v, [x, y]);
    }
    return txt;
  }

  format(format: (v: V, c: Coord) => string, blank=' '): string {
    return this.formatCells(format, blank).map(row => row.join('')).join('\n');
  }

  mapValues<U>(fn: (v: V, c: Coord) => U): Grid<U> {
    const out = new Grid<U>();
    for (const [c, v] of this) {
      out.set(c, fn(v, c));
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