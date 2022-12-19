#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/19

import { _ } from "../deps.ts";
import { assert, readInts, readLinesFromArgs } from "../util.ts";

const types: RobotType[] = ['ore', 'clay', 'obsidian', 'geode'];
type RobotType = 'ore' | 'clay' | 'obsidian' | 'geode';
interface Robot {
  type: RobotType;
  cost: Record<RobotType, number>;
}
interface Blueprint {
  id: number;
  robots: Record<RobotType, Robot>;
}

function parseBlueprint(line: string): Blueprint {
  const [pbStr, robotStr] = line.split(': ');
  const [id] = readInts(pbStr, {expect: 1});
  const robots = robotStr.split('. ');
  const blueprint = {
    id,
    robots: {},
  } as Blueprint;
  for (const robot of robots) {
    const m = robot.match(/Each ([a-z]+) robot costs (.*)$/);
    assert(m, robot);
    const [, robotType, costsStr] = m;
    const costObj: Record<RobotType, number> = {
      ore: 0,
      clay: 0,
      obsidian: 0,
      geode: 0,
    };
    const costs = costsStr.matchAll(/(\d+) ([a-z]+)/g);
    for (const [, num, type] of costs) {
      assert(types.includes(type as RobotType));
      costObj[type as RobotType] = Number(num);
    }

    const r = {
      type: robotType,
      cost: costObj,
    } as Robot;
    blueprint.robots[robotType as RobotType] = r;
  }
  return blueprint;
}

export interface State {
  time: number;
  robots: Record<RobotType, number>;
  resources: Record<RobotType, number>;
}

function canBuild(blueprint: Blueprint, s: State, robot: RobotType): boolean {
  const res = s.resources;
  const req = blueprint.robots[robot].cost;
  return types.every(t => res[t] >= (req[t] ?? 0));
}

function* step(blueprint: Blueprint, state: State): Generator<State> {
  // can build exactly one type of robot per turn, or none.
  const buildable = types.filter(type => canBuild(blueprint, state, type));
  const choices = [...buildable, null];

  for (const buildType of choices) {
    const nextState: State = _.cloneDeep(state);
    // mine NOW, after we've decided what's buildable.
    for (const robot of types) {
      nextState.resources[robot] += nextState.robots[robot];
    }
    if (buildType) {
      const resources = nextState.resources;
      const cost = blueprint.robots[buildType].cost;
      for (const [resType, amount] of Object.entries(cost)) {
        resources[resType as RobotType] -= amount;
      }
      nextState.robots[buildType]++;  // will produce next turn.
    }
    nextState.time++;
    yield nextState;
  }
}

export function resourceScore(s: State) {
  const r = s.resources;
  return ((r.geode * 1000 + r.obsidian) * 1000 + r.clay) * 1000 + r.ore;
}

export function resourceAndRobotsScore(s: State) {
  const r = s.resources;
  const r2 = s.robots;
  return (((r.geode + r2.geode) * 1000 + (r.obsidian + r2.obsidian)) * 1000 + (r.clay + r2.clay)) * 1000 + (r.ore + r2.ore);
}

const CAP = 10_000;
function maxGeodes(blueprint: Blueprint, maxT: number) {
  const init: State = {
    time: 0,
    robots: {
      ore: 1,
      clay: 0,
      obsidian: 0,
      geode: 0,
    },
    resources:  {
      ore: 0,
      clay: 0,
      obsidian: 0,
      geode: 0,
    },
  };
  let states = [init];
  let numGeodes = 0;
  for (let t = init.time + 1; t < maxT + 1; t++) {
    const nexts = states.flatMap(
      state => [...step(blueprint, state)]
    );
    console.log('t=', t, 'num states=', nexts.length, nexts.length > CAP ? 'hit cap!' : '');
    states = _.sortBy(nexts, resourceAndRobotsScore).toReversed().slice(0, CAP);
    const best = _.maxBy(states, resourceScore)!;
    if (t >= maxT) {
      console.log(best);
    }
    numGeodes = best.resources.geode;
  }
  return numGeodes;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const blueprints = lines.map(parseBlueprint);

  // 1M works, 100k works, 10k works, 1k does not.
  let tally = 0;
  for (const blueprint of blueprints) {
    const numGeodes = maxGeodes(blueprint, 24);
    console.log('input', blueprint.id, 'geodes', numGeodes, '->', blueprint.id * numGeodes);
    tally += blueprint.id * numGeodes;
  }
  console.log('part 1', tally);  // 2123 = too low  2193 = correct

  const geodes = [];
  for (const blueprint of blueprints.slice(0, 3)) {
    const numGeodes = maxGeodes(blueprint, 32);
    geodes.push(numGeodes);
  }
  console.log('part 2', _.reduce(geodes, (a, b) => a * b, 1), geodes);
}
