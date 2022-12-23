#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/24

// I'm confused why my original solution doesn't work for part 2.
// Where in the text does it say you can only target a group that you'd do damage to?
// Ah!
// "If it cannot deal any defending groups damage, it does not choose a target."
//
// I didn't love this problem. There wasn't anything particulary clever
// about it, and it had lots of instructions and was evidently quite error
// prone.

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

let DEBUG=false;

function selectTargets(groups: Group[]): Map<string, number | null> {
  const out = new Map<string, number | null>();
  const targeted = new Set<string>();  // "immune1" / "infection2"
  const inOrder = _(groups)
    .sortBy(g => -g.initiative)
    .sortBy(g => -effectivePower(g))
    .value();
  // _.sortBy(groups, [
  //   g => -effectivePower(g),
  //   g => -g.initiative
  // ]);
  for (const g of inOrder) {
    const other = g.side === 'immune' ? 'infection' : 'immune';
    const targets = groups.filter(g => g.side === other && !targeted.has(`${g.side}${g.num}`));
    // const target = _.sortBy(targets, [
    //   t => -potentialDamage(g, t),
    //   t => -effectivePower(t),
    //   t => -t.initiative,
    // ]);
    const target = _(targets)
      .filter(t => potentialDamage(g, t) > 0)
      .sortBy(t => -t.initiative)
      .sortBy(t => -effectivePower(t))
      .sortBy(t => -potentialDamage(g, t))
      .value();
    if (target.length > 0) {
      const t = target[0];
      out.set(`${g.side},${g.num}`, t.num);
      targeted.add(`${t.side}${t.num}`);
      if (DEBUG) {
        console.log(`${g.side} ${g.num} would attack ${t.side} ${t.num}`);
      }
    } else {
      out.set(`${g.side},${g.num}`, null);
    }
  }
  return out;
}

function fight(groups: Group[]): Group[] {
  const index = {
    immune: _.keyBy(groups.filter(g => g.side === 'immune'), 'num'),
    infection: _.keyBy(groups.filter(g => g.side === 'infection'), 'num'),
  };

  // console.log(groups);
  const targets = selectTargets(groups);
  for (const attacker of _.sortBy(groups, g => -g.initiative)) {
    const {side, num, units} = attacker;
    if (!units) continue;
    const other = side === 'immune' ? 'infection' : 'immune';
    const targetNum = targets.get(`${side},${num}`);
    if (targetNum === null) continue;
    assert(targetNum);
    const target = index[other][targetNum];
    const damage = potentialDamage(attacker, target);
    const kills = Math.min(target.units, Math.floor(damage / target.hitPoints));
    // if (DEBUG) {
    //   console.log(`${side} ${num} attacks ${other} ${targetNum} killing ${kills} units.`);
    // }
    // console.log(side === 'immune' ? 'Immune System' : 'Infection', `group ${attacker.num} attacks defending group ${targetNum}, killing ${kills} units`);
    target.units -= kills;
    if (target.units === 0) {
      if (DEBUG) {
        console.log(`${other} ${targetNum} is eliminated.`);
      }
      // "Groups never have zero or negative units; instead, the group is removed from combat."
      groups = _.without(groups, target);
    }
  }
  return groups;
}

function boost(groups: Group[], boostAmount: number): Group[] {
  return groups.map(g => ({
    ...g,
    damage: g.damage + (g.side === 'immune' ? boostAmount : 0)
  }));
}

function isDone(groups: Group[]): boolean {
  let immune = 0;
  let infection = 0;
  for (const g of groups) {
    if (g.side === 'immune') {
      immune += g.units;
    } else {
      infection += g.units;
    }
  }
  return immune === 0 || infection === 0;
}

function result(lines: string[], amount: number): number {
  const [immune, infection] = chunkLines(lines);
  assert(immune[0] === 'Immune System:');
  assert(infection[0] === 'Infection:');
  let groups = [
    ...immune.slice(1).map((line, i) => parseGroup(line, 'immune', 1 + i)),
    ...infection.slice(1).map((line, i) => parseGroup(line, 'infection', 1 + i)),
  ];
  groups = boost(groups, amount);

  let i = 0;
  let lastPrint = null;
  while (!isDone(groups)) {
    groups = fight(groups);
    i++;
    if (i % 10_000 === 0) {
      // console.log(i, _.sum(groups.map(g => g.units)));
      // console.log(groups);
      if (lastPrint === JSON.stringify(groups)) {
        return NaN;
      }
      lastPrint = JSON.stringify(groups);
    }
    /*
    console.log('Immune System:');
    for (const g of groups.filter(g => g.side === 'immune')) {
      console.log(`Group ${g.num} contains ${g.units} units`);
    }
    console.log('Infection:');
    for (const g of groups.filter(g => g.side === 'infection')) {
      console.log(`Group ${g.num} contains ${g.units} units`);
    }
    */
    // console.log(groups);
    // console.log();
  }
  // console.log('final', groups);
  return _.sum(groups.map(g => (g.side === 'immune' ? 1 : -1) * g.units));
}

function minPositive(
  f: (n: number) => number,
  low: number,  // may produce negative result, or is min positive.
  hi: number,  // produces positive result
): [number, number] {
  console.log(low, hi);
  if (low === hi) {
    return [low, f(low)];
  } else if (low === hi - 1) {
    const v = f(low);
    if (v > 0) {
      return [low, low];
    }
    return [hi, hi];
  }
  const mid = Math.floor((low + hi) / 2);
  const v = f(mid);
  if (v <= 0) {
    return minPositive(f, mid + 1, hi);
  } else {
    return minPositive(f, low, mid);
  }
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  // console.log(groups);
  // const terms = _.countBy(groups.flatMap(g => [g.damageType, ...g.weaknesses, ...g.immunities]));
  // console.log(terms);

  console.log('part 1', result(lines, 0));

  // console.log(result(groups, 1_000_000));
  // console.log('part 2', minPositive(amount => result(groups, amount), 0, 1_000_000));

  // 400 = stall
  // for (const b of [67, 68, 69, 70, 80, 90, 100, 150, 200, 300, 401, 500, 550, 600, 1000]) {
  // for (const b of _.range(0, 100)) {
  //   console.log(b, result(groups, b));
  // }

  // console.log(1570, result(groups, 1570));
  // console.log(67, result(groups, 67));
  // console.log(68, result(groups, 68));

  // 1290 = too high
  // 1291 = too high
  //  626 = too low
  for (let boost = 10; boost < 100; boost++) {
    console.log(boost, result(lines, boost));
  }
  // console.log(67, result(groups, 67));
  // console.log(69, result(groups, 69));
  // "A boost is an integer increase"
  // console.log(68.5, result(groups, 68.5));
  // console.log(68.25, result(groups, 68.25));
  // console.log(68.2, result(groups, 68.2));
  // console.log(68.195, result(groups, 68.195));
  // console.log(68.19, result(groups, 68.19));
  // console.log(68.18, result(groups, 68.18));
  // console.log(68.17, result(groups, 68.17));
  // console.log(68.125, result(groups, 68.125));
}
