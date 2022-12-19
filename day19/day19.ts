#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/19

import { _ } from "../deps.ts";
import { assert, readInts, readLinesFromArgs, tuple } from "../util.ts";

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
    const costs = costsStr.matchAll(/(\d+) ([a-z]+)/g);
    const costObj = _.fromPairs([...costs].map(([, num, type]) => tuple(type, Number(num))));
    const r = {
      type: robotType,
      cost: costObj,
    } as Robot;
    blueprint.robots[robotType as RobotType] = r;
  }
  return blueprint;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const blueprints = lines.map(parseBlueprint);
  for (const blueprint of blueprints) {
    console.log(JSON.stringify(blueprint));
  }
  console.log('part 1', lines.length);
  console.log('part 2');
}
