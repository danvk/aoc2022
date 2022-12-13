#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/15

import { _ } from "../../deps.ts";
import { dijkstra, flood } from "../../dijkstra.ts";
import { Coord, Grid, neighbors4 } from "../../grid.ts";
import {
  assert,
  coord2str,
  isNonNullish,
  readLinesFromArgs,
  str2coord,
  tuple,
} from "../../util.ts";

interface Unit {
  id: number;
  type: "G" | "E";
  pos: Coord;
  hitPoints: number;
}

function manhattan(a: Coord, b: Coord) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function findTargets(me: Unit, units: Unit[]): Unit[] {
  const target = me.type === "G" ? "E" : "G";
  return units.filter(
    (u) => u.type === target && manhattan(u.pos, me.pos) === 1
  );
}

function round(g: Grid<string>, units: Unit[]) {
  // Find the order in which the units move
  const orderedUnits = _.sortBy(
    units,
    (u) => u.pos[1],
    (u) => u.pos[0]
  );
  // console.log(orderedUnits);
  for (const unit of orderedUnits) {
    // console.log("Considering", unit);
    // Are any targets in range?
    const targets = findTargets(unit, units);
    // If yes, pick one to attack.
    if (targets.length) {
      // Attack!
      console.log("Attack!");
    } else {
      // If not, figure out which direction to move.
      const others = units.filter((u) => u.type !== unit.type);
      const target = others[0].type;
      const neighborFn = (n: Coord) =>
        neighbors4(n)
          .filter((c) => g.get(c) === "." || g.get(c) === target)
          .map((c) => tuple(c, 1));
      // console.log(others);
      const ds = _.sortBy(
        others
          .map((target) =>
            dijkstra(unit.pos, target.pos, neighborFn, coord2str, str2coord)
          )
          .filter(isNonNullish),
        0
      );
      if (ds.length === 0) {
        continue;  // end turn
      }

      const closest = _.sortBy(
        ds
          .filter((d) => d[0] === ds[0][0])
          .map(([, path]) => path[path.length - 1]),
        1,
        0
      )[0];
      // console.log("Closest to", unit.id, "is", closest);
      // Search again, finding the closest node according to reading order.
      const distances = flood(
        closest,
        neighborFn,
        coord2str,
        str2coord,
        ds[0][0]
      );
      const next = _.sortBy(
        distances.filter(([_, c]) => manhattan(c, unit.pos) === 1),
        0,
        "1.1",
        "1.0"
      )[0][1];
      // console.log("Moving", unit.type, "from", unit.pos, "to", next);
      g.set(unit.pos, ".");
      unit.pos = next;
      g.set(unit.pos, unit.type);
    }
  }
}

function part1(g: Grid<string>, units: Unit[]): number {
  for (let i = 0; i < 3; i++) {
    round(g, units);
    console.log(i);
    console.log(g.format((x) => x));
  }
  return 0;
}

function read(lines: readonly string[]): [Grid<string>, Unit[]] {
  const g = Grid.fromLines(lines);
  const unitPos = g.findIndices((v) => v === "G" || v === "E");
  const units: Unit[] = unitPos.map((pos, i) => ({
    id: i,
    pos,
    type: g.get(pos) as "G" | "E",
    hitPoints: 200,
  }));
  return [g, units];
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const [g, units] = read(lines);
  console.log(g.format((x) => x));
  console.log("part 1", part1(g, units));
  console.log("part 2");
}
