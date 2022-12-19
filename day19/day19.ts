#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/19

import { _ } from "../deps.ts";
import { assert, readInts, readLinesFromArgs, tuple } from "../util.ts";

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

interface State {
  time: number;
  robots: Record<RobotType, number>;
  resources: Record<RobotType, number>;
}

// some patterns:
// - clay and ore robots only ever require ore
// - clay robots can require more _or_ less ore than ore robots
// - obsidian robots require ore and clay; always more clay than ore.
// - geode robots require ore and obsidian; always much more obsidian than ore.
// - greedy strategy would be to always build the most expensive robot, but I assume that doesn't work.

function canBuild(blueprint: Blueprint, s: State, robot: RobotType): boolean {
  const res = s.resources;
  const req = blueprint.robots[robot].cost;
  // console.log(types, res, req);
  return types.every(t => res[t] >= (req[t] ?? 0));
}

function* step(blueprint: Blueprint, state: State): Generator<State> {
  // can build exactly one type of robot per turn, or none.
  const buildable = types.filter(type => canBuild(blueprint, state, type));
  // console.log(buildable);

  for (const buildType of [...buildable, null]) {
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

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const blueprints = lines.map(parseBlueprint);
  for (const blueprint of blueprints) {
    console.log(JSON.stringify(blueprint));
  }

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

  console.log(init);
  let states = [init];
  const blueprint = blueprints[0];
  for (let t = 1; t < 4; t++) {
    const nexts = states.flatMap(state => [...step(blueprint, state)]);
    console.log('t=', t, 'num states=', nexts.length);
    console.log(nexts);
    states = nexts;
  }

  console.log('part 1', lines.length);
  console.log('part 2');
}
