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
    (u) => u.type === target && u.hitPoints > 0 && manhattan(u.pos, me.pos) === 1
  );
}

function round(g: Grid<string>, units: Unit[], elfPower: number): boolean {
  // Find the order in which the units move
  const orderedUnits = _.sortBy(
    units,
    (u) => u.pos[1],
    (u) => u.pos[0]
  );
  // console.log(orderedUnits);
  for (const unit of orderedUnits) {
    if (unit.hitPoints <= 0) {
      continue;  // already dead
    }
    const power = unit.type === 'E' ? elfPower : 3;
    // console.log("Considering", unit);
    // Are any targets in range?
    const targets = findTargets(unit, units);
    // If yes, pick one to attack.
    if (targets.length) {
      // Attack!
      const t = _.sortBy(targets, t => t.hitPoints, t => t.pos[1], t => t.pos[0])[0];
      t.hitPoints -= power;
      if (t.hitPoints <= 0) {
        g.set(t.pos, '.');
      }
    } else {
      // If not, figure out which direction to move.
      const others = units.filter((u) => u.type !== unit.type && u.hitPoints > 0);
      if (!others.length) {
        return false;
        // continue;  // we're the last one!
      }
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

      // try to attack
      const targets2 = findTargets(unit, units);
      if (targets2.length) {
        // Attack!
        const t = _.sortBy(targets2, t => t.hitPoints, t => t.pos[1], t => t.pos[0])[0];
        t.hitPoints -= power;
        if (t.hitPoints <= 0) {
          g.set(t.pos, '.');
        }
      }
    }
  }
  return true;
}

// 192848 = too high

function part1(g: Grid<string>, units: Unit[], elfPower=3) {
  let roundNum = 0;
  let wasCompleteRound = true;
  while (new Set(units.map(u => u.type)).size > 1) {
    wasCompleteRound = round(g, units, elfPower);
    const nextUnits = units.filter(u => u.hitPoints > 0);
    units = nextUnits;
    roundNum++;
    // console.log('After', roundNum, 'rounds');
    // console.log(g.format((x) => x));
    // console.log(units.map(u => [u.type, u.hitPoints]));
    // console.log('');
  }
  const fullRounds = (roundNum - (wasCompleteRound ? 0 : 1));
  const points = _.sum(units.map(u => u.hitPoints));
  return tuple(
    units[0].type,
    fullRounds,
    points,
    fullRounds * points,
    units,
  );
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

// 7169 = too low
function part2(lines: readonly string[]): number {
  for (let elfPower = 4; elfPower < 1000; elfPower++) {
    const [g, units] = read(lines);
    const initElves = units.filter(u => u.type === 'E').length;
    const [winner, rounds, points, score, endUnits] = part1(g, units, elfPower);
    console.log('Elf Power=', elfPower);
    console.log('Done after', rounds, 'full rounds');
    console.log(points, score);
    console.log(g.format(v=>v));
    console.log('');

    const finalElves = endUnits.filter(u => u.type === 'E').length;
    if (winner === 'E' && initElves === finalElves) {
      return score;
    }
  }
  throw new Error('Elves are hopeless');
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const [g, units] = read(lines);
  console.log(g.format((x) => x));
  console.log("part 1", part1(g, units));
  console.log("part 2", part2(lines));
}
