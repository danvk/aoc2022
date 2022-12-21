#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/21

import { _ } from "../deps.ts";
import { readLinesFromArgs, safeParseInt } from "../util.ts";

interface Literal {
  op: 'literal';
  num: number;
}
interface Op {
  op: '*' | '-' | '/' | '+';
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
  for (const [name, rule] of Object.entries(rules)) {
    if (m.has(name)) continue;

    if (rule.op === 'literal') {
      m.set(name, rule.num);
    } else {
      const left = m.get(rule.left);
      const right = m.get(rule.right);
      // if (name === 'drzm') {
      //   console.log(rule);
      //   console.log(left, right);
      // }
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
        } else {
          throw new Error('Unknown op ' + rule.op);
        }
        m.set(name, v);
      }
    }
  }
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const rules = _.fromPairs(lines.map(parseRule));
  // console.log(rules);
  const m = new Map<string, number>();
  while (!m.has('root')) {
    produce(m, rules);
    // console.log(m);
  }
  console.log('part 1', m.get('root'));
  console.log('part 2');
}
