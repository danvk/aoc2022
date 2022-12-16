#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/20

import { _ } from "../../deps.ts";
import { assert, readLinesFromArgs } from "../../util.ts";

export function extractParen(txt: string) {
  assert(txt.startsWith('('));
  let level = 1;
  for (let i = 1; i < txt.length; i++) {
    const c = txt[i];
    if (c === '(') {
      level++;
    } else if (c === ')') {
      level--;
      if (level === 0) {
        return txt.slice(1, i);
      }
    }
  }
  throw new Error(`No matching close paren for ${txt}`);
}

export function splitOnParens(txt: string) {
  const parts = [];
  let level = 0;
  let start = 0;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (c === '(') {
      if (level === 0) {
        if (start < i) {
          parts.push(txt.slice(start, i));
        }
        start = i;
      }
      level++;
    } else if (c === ')') {
      level--;
      if (level === 0) {
        if (start < i + 1) {
          parts.push(txt.slice(start, i + 1));
        }
        start = i + 1;
      }
    }
  }
  if (start < txt.length) {
    parts.push(txt.slice(start));
  }
  return parts;
}

export function extractAlternatives(txt: string) {
  const parts = [];
  let level = 0;
  let start = 0;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (c === '(') {
      level++;
    } else if (c === ')') {
      level--;
    } else if (c === '|' && level === 0) {
      parts.push(txt.slice(start, i));
      start = i + 1;
    }
  }
  if (start <= txt.length) {
    parts.push(txt.slice(start));
  }
  return parts;
}

interface Concat {
  type: 'concat';
  parts: Regex[];
}
interface Choose {
  type: 'choose';
  choices: Regex[];
}
interface Literal {
  type: 'literal';
  literal: string;
}
type Regex = Concat | Choose | Literal;

export function parseRegex(regex: string): Regex {
  if (regex.startsWith('(')) {
    assert(regex.endsWith(')'));
    return parseRegex(regex.slice(1, -1));
  }
  if (regex === '') {
    return {type: 'literal', literal: ''};
  }
  const parts = extractAlternatives(regex);
  if (parts.length > 1) {
    return {
      type: 'choose',
      choices: parts.map(parseRegex)
    };
  } else {
    const parts = splitOnParens(regex);
    if (parts.length === 1) {
      return {type: 'literal', literal: regex};
    }
    return {
      type: 'concat',
      parts: parts.map(parseRegex),
    };
  }
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  assert(lines.length === 1);
  let regex = lines[0];
  assert(regex.startsWith('^'));
  assert(regex.endsWith('$'));
  regex = regex.slice(1, -1);
  console.log('part 1');
  console.log(JSON.stringify(parseRegex(regex), null, 2));
  console.log('part 2');
}
