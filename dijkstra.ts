/** Generic implementation of Dijkstra */

import { _ } from "./deps.ts";
import { BinaryHeap } from "./binary-heap.ts";
import { assert, tuple } from "./util.ts";

interface Queue<T> {
  enqueue(val: T, priority: number): void;
  dequeue(): [number, T] | undefined;
  size(): number;
}

// Shared logic between dijkstra and bfs.
function shortestPath<N>(
  start: N,
  end: N | ((n: N) => boolean),
  neighbors: (n: N) => Iterable<readonly [N, number]>,
  serialize: (n: N) => string,
  deserialize: (txt: string) => N,
  queue: Queue<N>,
): [number, N[]] | null {
  let endFn: (n: N) => boolean;
  if (typeof end === 'function') {
    endFn = end as any;
  } else {
    const endS = serialize(end);
    endFn = (n: N) => serialize(n) === endS;
  }

  const [lastState, distance, parent] = dijkstraCore(start, endFn, neighbors, serialize, deserialize, queue);
  if (lastState === null) {
    return null;
  }

  const path = [];
  const lastStateStr = serialize(lastState);
  let n = lastStateStr;
  while (n) {
    path.push(deserialize(n));
    const p = parent.get(n);
    if (!p) {
      break;
    }
    n = p;
  }

  return [distance.get(lastStateStr)!, _.reverse(path)];
}

// Core logic for dijkstra / bfs / flood fill
function dijkstraCore<N>(
  start: N,
  end: (n: N) => boolean,
  neighbors: (n: N) => Iterable<readonly [N, number]>,
  serialize: (n: N) => string,
  deserialize: (txt: string) => N,
  queue: Queue<N>,
  maxDistance?: number,
): [N|null, Map<string, number>, Map<string, string>] {
  assert(_.isEqual(start, deserialize(serialize(start))), 'Invalid ser/deser');
  const distance = new Map<string, number>();


  // TODO: change this to [distance, string]? Might reduce ser/deser.
  queue.enqueue(start, 0);
  const parent = new Map<string, string>();
  let steps = 0;
  let lastState;
  while (true) {
    const next = queue.dequeue();
    if (!next) {
      // Out of options -- there can't be a path
      return [null, distance, parent];
    }
    const [d0, n] = next;
    const ns = serialize(n);
    const prevD = distance.get(ns);
    if (prevD && prevD <= d0) {
      continue;  // already found a shorter path; must be a dupe in the queue
    }
    distance.set(ns, d0);

    if (end(n)) {
      lastState = n;
      break;  // we're done!
    }

    for (const [m, dm] of neighbors(n)) {
      const d = d0 + dm;
      if (maxDistance !== undefined && d > maxDistance) {
        continue;
      }

      const ms = serialize(m);
      const prevD = distance.get(ms);
      if (prevD === undefined || d < prevD) {
        queue.enqueue(m, d);
        parent.set(ms, ns);
      }
    }
    if (++steps % 10_000 === 0) {
      console.log(steps, queue.size());
    }
  }

  return [lastState, distance, parent];
}

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
  end: N | ((n: N) => boolean),
  neighbors: (n: N) => Iterable<readonly [N, number]>,
  serialize: (n: N) => string,
  deserialize: (txt: string) => N,
) {
  return shortestPath(start, end, neighbors, serialize, deserialize, new BinaryHeap);
}

/** Specialization of Dijkstra where all distances are 1. */
export function bfs<N>(
  start: N,
  end: N | ((n: N) => boolean),
  neighbors: (n: N) => Iterable<N>,
  serialize: (n: N) => string,
  deserialize: (txt: string) => N,
) {
  const neighborsWithDistance = function* (node: N) {
    for (const n of neighbors(node)) {
      yield tuple(n, 1);
    }
  };

  return shortestPath(start, end, neighborsWithDistance, serialize, deserialize, new BFSQueue);
}

class BFSQueue<T> implements Queue<T> {
  values: [number, T][];
  constructor() {
    this.values = [];
  }

  enqueue(val: T, priority: number): void {
    this.values.push([priority, val]);
  }

  dequeue(): [number, T] | undefined {
    return this.values.shift();
  }

  size(): number {
    return this.values.length;
  }
}

/** Flood fill from a starting node */
export function flood<N>(
  start: N,
  neighbors: (n: N) => Iterable<N>,
  serialize: (n: N) => string,
  deserialize: (txt: string) => N,
  maxDistance?: number,
): [number, N][] {
  const neighborsWithDistance = function* (node: N) {
    for (const n of neighbors(node)) {
      yield tuple(n, 1);
    }
  };

  return floodWithDistance(start, neighborsWithDistance, serialize, deserialize, maxDistance);
}

/** Flood fill from a starting node with varying distances */
export function floodWithDistance<N>(
  start: N,
  neighbors: (n: N) => Iterable<[N, number]>,
  serialize: (n: N) => string,
  deserialize: (txt: string) => N,
  maxDistance?: number,
): [number, N][] {
  const [, distance, _parent] = dijkstraCore(start, () => false, neighbors, serialize, deserialize, new BinaryHeap, maxDistance);
  return _.sortBy([...distance].map(([cStr, d]) => tuple(d, deserialize(cStr))), 0);
}
