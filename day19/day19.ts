#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/19

import { blue } from "https://deno.land/std@0.166.0/fmt/colors.ts";
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

// some patterns:
// - clay and ore robots only ever require ore
// - clay robots can require more _or_ less ore than ore robots
// - obsidian robots require ore and clay; always more clay than ore.
// - geode robots require ore and obsidian; always much more obsidian than ore.
// - greedy strategy would be to always build the most expensive robot, but I assume that doesn't work.
// - in the example input, it's impossible to get even one geode before t=19


function canBuild(blueprint: Blueprint, s: State, robot: RobotType): boolean {
  const res = s.resources;
  const req = blueprint.robots[robot].cost;
  // console.log(types, res, req);
  return types.every(t => res[t] >= (req[t] ?? 0));
}

export function canProduceAGeode(blueprint: Blueprint, state: State) {
  if (state.time < 21) {
    return true;
  }

  const maxObsidianT23 = state.resources.obsidian + 2*state.robots.obsidian + 1;
  return maxObsidianT23 >= blueprint.robots.geode.cost.obsidian;
}

function* step(blueprint: Blueprint, state: State): Generator<State> {
  // can build exactly one type of robot per turn, or none.
  // const okTypes = types.filter((t, i) => {
  //   if (i + 1 < types.length && state.resources[types[i+1]] > 0) {
  //     return false;
  //   }
  //   return true;
  // });
  const buildable = types.filter(type => canBuild(blueprint, state, type));
  // console.log(buildable);
  const choices = [...buildable, null];
  // if (buildable[0] === 'geode' || buildable[0] === 'obsidian') {
  //   // Build geodes and obsidian greedily
  //   // console.log('greedy!');
  //   choices = [buildable[0]];
  // } else {
  //
  // }

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

/*
function* stepGreedy(blueprint: Blueprint, state: State): Generator<State> {
  const buildable = _.reverse(types).filter(type => canBuild(blueprint, state, type));
  // console.log(buildable);

  let choices;
  if (buildable[0] === 'geode' || buildable[0] === 'obsidian') {
    // Build geodes and obsidian greedily
    console.log('greedy!');
    choices = [buildable[0]];
  } else {
    choices = [...buildable, null];
  }
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
    break;
  }
}
*/

export function resourceScore(s: State) {
  const r = s.resources;
  return ((r.geode * 1000 + r.obsidian) * 1000 + r.clay) * 1000 + r.ore;
}

export function resourceAndRobotsScore(s: State) {
  const r = s.resources;
  const r2 = s.robots;
  return (((r.geode + r2.geode) * 1000 + (r.obsidian + r2.obsidian)) * 1000 + (r.clay + r2.clay)) * 1000 + (r.ore + r2.ore);
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
  // const init: State = {
  //  time: 22,
  //  robots: { ore: 4, clay: 7, obsidian: 4, geode: 0 },
  //  resources: { ore: 24, clay: 23, obsidian: 21, geode: 0 }
  // };

  const CAP = 1_000_000;
  let tally = 0;
  for (const blueprint of blueprints) {
    console.log(blueprint);
    console.log(init);
    let states = [init];
    let numGeodes = 0;
    for (let t = init.time + 1; t < 25; t++) {
      const nexts = states.flatMap(
        state => [...step(blueprint, state)].filter(s => canProduceAGeode(blueprint, s))
      );
      // if (t < 25) {
      // nexts
      // } else {
      // nexts = states.flatMap(state => [...stepGreedy(blueprint, state)]);
      // }
      console.log('t=', t, 'num states=', nexts.length, nexts.length > CAP ? 'hit cap!' : '');
      // console.log(nexts);
      // states = nexts;
      states = _.sortBy(nexts, resourceAndRobotsScore).toReversed().slice(0, CAP);
      // console.log(states[0]);
      // states = nexts;
      const best = _.maxBy(states, resourceScore)!;
      if (t >= 24) {
        console.log(best);
      }
      numGeodes = best.resources.geode;
    }
    console.log('input', blueprint.id, 'geodes', numGeodes, '->', blueprint.id * numGeodes);
    tally += blueprint.id * numGeodes;
  }

  console.log('part 1', tally);  // 2123 = too low  2193 = correct
  console.log('part 2');
}

// I blow the stack after t=19 on the sample input.
// need some way to prune unproductive states.
// does it ever make sense to not build a robot when you can?
//   ... absolutely; you'll never get a geode if you don't save up.

// what's an upper bound on the number of geodes you'll produce?
// - assume ore is irrelevant
// -

// Feels vaguely like https://adventofcode.com/2019/day/14 but I don't think it's exactly the same.
// How many ore/clay does it take for a geode?