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

function effectivePower(g: Group) {
  return g.damage * g.units;
}

function potentialDamage(attacker: Group, defender: Group) {
  if (defender.immunities.has(attacker.damageType)) {
    return 0;
  }
  const mult = defender.weaknesses.has(attacker.damageType) ? 2 : 1;
  return mult * effectivePower(attacker);
}

function selectTargets(groups: Group[]): Map<string, number> {
  const out = new Map<string, number>();
  const taken = new Set<string>();  // "immune1" / "infection2"
  const inOrder = _.sortBy(groups, [
    g => -effectivePower(g),
    g => -g.initiative
  ]);
  for (const g of inOrder) {
    const other = g.side === 'immune' ? 'infection' : 'immune';
    const targets = groups.filter(g => g.side === other && !taken.has(`${g.side}${g.num}`));
    const target = _.sortBy(targets, [
      target => -potentialDamage(g, target),
      target => -effectivePower(target),
      target => -target.initiative,
    ]);
    if (target.length > 0) {
      const t = target[0];
      out.set(`${g.side},${g.num}`, t.num);
      taken.add(`${t.side}${t.num}`);
      console.log(`${g.side} ${g.num} would attack ${t.side} ${t.num}`);
    } else {
      // don't attack
    }
  }
  return out;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const [immune, infection] = chunkLines(lines);
  assert(immune[0] === 'Immune System:');
  assert(infection[0] === 'Infection:');
  const groups = [
    ...immune.slice(1).map((line, i) => parseGroup(line, 'immune', 1 + i)),
    ...infection.slice(1).map((line, i) => parseGroup(line, 'infection', 1 + i)),
  ];

  console.log(groups);
  console.log(selectTargets(groups));

  // console.log(groups);
  console.log('part 1', lines.length);
  console.log('part 2');
}
