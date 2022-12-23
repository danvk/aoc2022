#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/24

import { _ } from "../../deps.ts";
import { assert, chunkLines, readInts, readLinesFromArgs } from "../../util.ts";

// 989 units each with 1274 hit points (immune to fire; weak to bludgeoning,
//  slashing) with an attack that does 25 slashing damage at initiative 3

interface Group {
  num: number;
  side: 'immune' | 'infection';
  units: number;
  hitPoints: number;
  damage: number;
  damageType: string;
  initiative: number;
  weaknesses: Set<string>;
  immunities: Set<string>;
}

function parseGroup(text: string, side: 'immune' | 'infection', num: number): Group {
  const [units, hitPoints, damage, initiative] = readInts(text, {expect: 4});
  let weaknesses = new Set<string>;
  let immunities = new Set<string>;
  const mP = /\((.*)\)/.exec(text);
  if (mP) {
    const [, parenTxt] = mP;
    const parts = parenTxt.split('; ');
    for (const part of parts) {
      const types = part.split(' to ')[1].split(', ');
      if (part.startsWith('weak to')) {
        weaknesses = new Set(types);
      } else if (part.startsWith('immune to')) {
        immunities = new Set(types);
      } else {
        throw new Error(part);
      }
    }
  }
  const m = /\d+ ([a-z]+) damage/.exec(text);
  assert(m, text);
  const [, damageType] = m;

  return {
    num, side, units, hitPoints, damage, damageType, initiative, weaknesses, immunities
  }
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const [immune, infection] = chunkLines(lines);
  assert(immune[0] === 'Immune System:');
  assert(infection[0] === 'Infection:');
  const groups = [
    immune.slice(1).map((line, i) => parseGroup(line, 'immune', 1 + i)),
    infection.slice(1).map((line, i) => parseGroup(line, 'infection', 1 + i)),
  ];
  console.log(groups);
  console.log('part 1', lines.length);
  console.log('part 2');
}
