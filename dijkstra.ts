/** Generic implementation of Dijkstra */

import { _ } from "./deps.ts";
import { tuple } from "./util.ts";

/**
 * Find the shortest path from start to end.
 *
 * The neighbor function should return a list of neighbors and the
 * distance from the node to that neighbor.
 *
 * Returns the distance and the path.
 */
export function dijkstra<N>(
  start: N,
  end: N,
  neighbors: (n: N) => [N, number][],
  serialize: (n: N) => string,
  deserialize: (txt: string) => N,
): [number, N[]] | null {
  const distance = new Map<string, number>();
  distance.set(serialize(start), 0);
  const endS = serialize(end);

  // TODO: change this to [distance, string]? Might reduce ser/deser.
  // TODO: pick a better structure here.
  let fringe = [tuple(0, start)];
  const parent = new Map<string, string>();
  while (true) {
    fringe = _.sortBy(fringe, ([d, _c]) => d);
    const next = fringe.shift();
    if (!next) {
      return null;  // Out of options -- there can't be a path
    }
    const [d0, n] = next;
    const ns = serialize(n);
    if (ns === endS) {
      break;  // we're done!
    }
    for (const [m, dm] of neighbors(n)) {
      const d = d0 + dm;
      const ms = serialize(m);
      const prevD = distance.get(ms);
      if (prevD === undefined || d < prevD) {
        distance.set(ms, d);
        // Filter out any existing occurrence of this node in the fringe.
        fringe = fringe.filter(([_, s]) => serialize(s) !== ms);
        fringe.push([d, m]);
        parent.set(ms, ns);
      }
    }
  }

  const path = [];
  let n = serialize(end);
  while (n) {
    path.push(deserialize(n));
    const p = parent.get(n);
    if (!p) {
      break;
    }
    n = p;
  }

  return tuple(distance.get(serialize(end))!, _.reverse(path));
}
