import { coord2str, map2d, minmax, str2coord, tuple, zeros } from "./util.ts";

export type Coord = [number, number];

/** A two dimensional grid, implemented as a sparse Map */
export class Grid<V> implements Iterable<[[number, number], V]> {
  m: Map<string, V>;
  constructor() {
    this.m = new Map();
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

  formatCells(format: (v: V, c: Coord) => string): string[][] {
    const {x: [minX, maxX], y: [minY, maxY]} = this.boundingBox();

    const txt = map2d(zeros(maxY - minY + 1, maxX - minX + 1), () => ' ');
    for (const [c, v] of this.m) {
      const coord = str2coord(c);
      const [x, y] = coord;
      txt[y][x] = format(v, [x, y]);
    }
    return txt;
  }

  format(format: (v: V, c: Coord) => string): string {
    return this.formatCells(format).map(row => row.join('')).join('\n');
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
  }
}
