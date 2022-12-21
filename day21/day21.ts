#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/21

import { _ } from "../deps.ts";
import { assert, readLinesFromArgs, safeParseInt } from "../util.ts";

interface Literal {
  op: 'literal';
  num: number;
}
interface Op {
  op: '*' | '-' | '/' | '+' | '=';
  left: string;
  right: string;
}
type Rule = Op | Literal;

function parseRule(line: string): [string, Rule] {
  const [left, right] = line.split(': ');
  if (right.includes(' ')) {
    const [l, op, r] = right.split(' ');
    return [left, {op, left: l, right: r} as Rule];
  } else {
    return [left, {op: 'literal', num: safeParseInt(right)}];
  }
}

function produce(m: Map<string,number>, rules: _.Dictionary<Rule>) {
  let producedAny = false;
  for (const [name, rule] of Object.entries(rules)) {
    if (m.has(name)) continue;

    if (rule.op === 'literal') {
      producedAny = true;
      m.set(name, rule.num);
    } else {
      const left = m.get(rule.left);
      const right = m.get(rule.right);
      if (left !== undefined && right !== undefined) {
        let v;
        if (rule.op === '+') {
          v = left + right;
        } else if (rule.op === '-') {
          v = left - right;
        } else if (rule.op === '*') {
          v = left * right;
        } else if (rule.op === '/') {
          v = left / right;
        } else if (rule.op === '=') {
          console.log(name, left, '==', right, '?', '∆=', left - right);
          m.set(name, left === right ? 1 : 0);
          producedAny = true;
          continue;
        } else {
          throw new Error('Unknown op ' + rule.op);
        }
        producedAny = true;
        m.set(name, v);
      }
    }
  }
  return producedAny;
}

function getRootComparisonStep(m: Map<string,number>, rules: _.Dictionary<Rule>): [number, number] | null {
  for (const [name, rule] of Object.entries(rules)) {
    if (m.has(name)) continue;

    if (rule.op === 'literal') {
      m.set(name, rule.num);
    } else {
      const left = m.get(rule.left);
      const right = m.get(rule.right);
      if (left !== undefined && right !== undefined) {
        let v;
        if (rule.op === '+') {
          v = left + right;
        } else if (rule.op === '-') {
          v = left - right;
        } else if (rule.op === '*') {
          v = left * right;
        } else if (rule.op === '/') {
          v = left / right;
        } else if (rule.op === '=') {
          // console.log(name, left, '==', right, '?', '∆=', left - right);
          m.set(name, left === right ? 1 : 0);
          return [left, right];
        } else {
          throw new Error('Unknown op ' + rule.op);
        }
        m.set(name, v);
      }
    }
  }
  return null;
}

function getRootComparison(initM: Map<string, number>, humn: number, rules: _.Dictionary<Rule>): [number, number] {
  const thisM = new Map(initM);
  thisM.set('humn', humn);
  while (true) {
    const x = getRootComparisonStep(thisM, rules);
    if (x) {
      return x;
    }
  }
}

function evaluate(rules: _.Dictionary<Rule>): Map<string, number> {
  const m = new Map<string, number>();
  while (true) {
    if (!produce(m, rules)) {
     break;
    }
  }
  return m;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const rules = _.fromPairs(lines.map(parseRule));
  const part1 = evaluate(rules);
  console.log('part 1', part1.get('root'));

  rules['root'].op = '=';
  delete rules['humn'];
  const m = evaluate(rules);

  // console.log(m);
  // Can produce 2518 / 2586 numbers without humn.
  console.log(m.size, _.size(rules));

  const B = 1_000_000_000_000;
  const [zL, zR] = getRootComparison(m, 0, rules);
  const [bL, bR] = getRootComparison(m, B, rules);
  assert(zR === bR);

  // const left = zL + (bL - zL) / B * n;
  // zR = zL + (bL - zL) / B * n
  // (zR - zL) = (bL - zL) / B * n
  // B * (zR - zL) / (bL - zL) = n
  const n = B * (zR - zL) / (bL - zL);
  console.log('n=', n);

  for (const humn of [0, 1_000_000_000, 2_000_000_000, n, Math.floor(n), Math.ceil(n)]) {
    const [left, right] = getRootComparison(m, humn, rules);
    console.log(humn, left, right, right - left);
    if (left === right) {
      console.log('part 2', humn);
    }
  }

  // console.log('part 2', humn);
}

// 1566 = 59078404932615.1
// 1567 = 59078404932605.57
// 1568 = 59078404932596.04

// num = 59078404932615.1 + 9.53 * (i - 1566)
// 28379346560301 = 59078404932615.1 - 9.53 * (i - 1566)
// (59078404932615 - 28379346560301) / 9.53 + 1566 = i
// 3221307280927 = too high

// 3221207280927 ∆= 367325952.98828125
// 3221224000000 ∆= 207990147.46484375
// 3221240000000 ∆=  55507238.375
// 3221245000000 ∆=   7856329.28515625
// 3221245600000 ∆=   2138220.19921875
// 3221245800000 ∆=    232183.83203125
// 3221245824000 ∆=      3459.46484375
// 3221245824250 ∆=      1076.92578125
// 3221245824500 ∆=     -1305.625
// 3221245825000 ∆=     -6070.71484375
// 3221245828000 ∆=    -34661.26171875
// 3221245830000 ∆=    -53721.625
// 3221245835000 ∆=   -101372.53515625
// 3221246000000 ∆=  -1673852.53515625
// 3221250000000 ∆= -39794579.80078125
// 3221307280927 ∆= -585692228.8320312
