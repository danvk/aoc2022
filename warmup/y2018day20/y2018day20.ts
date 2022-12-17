#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/20

import { _ } from "../../deps.ts";
import { Coord, Grid } from "../../grid.ts";
import { assert, assertUnreachable, readLinesFromArgs } from "../../util.ts";

export function extractParen(txt: string) {
  assert(txt.startsWith("("));
  let level = 1;
  for (let i = 1; i < txt.length; i++) {
    const c = txt[i];
    if (c === "(") {
      level++;
    } else if (c === ")") {
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
    if (c === "(") {
      if (level === 0) {
        if (start < i) {
          parts.push(txt.slice(start, i));
        }
        start = i;
      }
      level++;
    } else if (c === ")") {
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
    if (c === "(") {
      level++;
    } else if (c === ")") {
      level--;
    } else if (c === "|" && level === 0) {
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
  type: "concat";
  parts: Regex[];
}
interface Choose {
  type: "choose";
  choices: Regex[];
}
interface Literal {
  type: "literal";
  literal: string;
  delta: Coord;
}
interface OptionalLoop {
  type: "optional-loop";
  delta: Coord;
  sequence: string;
}
type Regex = Concat | Choose | Literal | OptionalLoop;

export function parseRegex(regex: string): Regex {
  if (regex.startsWith("(")) {
    assert(regex.endsWith(")"));
    return parseRegex(regex.slice(1, -1));
  }
  if (regex === "") {
    return { type: "literal", literal: "", delta: [0, 0] };
  }
  const parts = extractAlternatives(regex);
  if (parts.length > 1) {
    return {
      type: "choose",
      choices: parts.map(parseRegex),
    };
  } else {
    const parts = splitOnParens(regex);
    if (parts.length === 1) {
      return { type: "literal", literal: regex, delta: simplifyNSWE(regex) };
    }
    return {
      type: "concat",
      parts: parts.map(parseRegex),
    };
  }
}

function numMatches(regex: Regex): number {
  switch (regex.type) {
    case "literal":
    case "optional-loop":
      return 1;
    case "choose":
      if (regex.choices.length === 2) {
        const c = regex.choices;
        if (
          c[0].type === "literal" &&
          c[1].type === "literal" &&
          c[0].literal === c[1].literal
        ) {
          return 1;
        }
      }
      return _.sum(regex.choices.map(numMatches));
    case "concat":
      return regex.parts.map(numMatches).reduce((a, b) => a * b, 1);
    default:
      assertUnreachable(regex);
  }
}

function simplifyNSWE(txt: string): Coord {
  let x = 0;
  let y = 0;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (c === "N") {
      y -= 1;
    } else if (c === "S") {
      y += 1;
    } else if (c === "E") {
      x += 1;
    } else if (c === "W") {
      x -= 1;
    }
  }
  return [x, y];
}

function simplifyRegex(regex: Regex): Regex {
  switch (regex.type) {
    case "literal":
    case "optional-loop":
      return regex;
    case "concat":
      return {
        type: "concat",
        parts: regex.parts.map(simplifyRegex),
      };
    case "choose":
      if (regex.choices.length === 2) {
        const c = regex.choices;
        if (
          c[0].type === "literal" &&
          c[1].type === "literal" &&
          (c[0].literal === "" || c[1].literal === "") &&
          _.isEqual(c[0].delta, c[1].delta)
        ) {
          return {
            type: "optional-loop",
            delta: c[0].delta,
            sequence: c[0].literal || c[1].literal,
          };
        }
      }
      return {
        type: "choose",
        choices: regex.choices.map(simplifyRegex),
      };
    default:
      assertUnreachable(regex);
  }
}

function traceLiteral(literal: string, g: Grid<string>, pt: Coord): Coord {
  let [x, y] = pt;
  for (let i = 0; i < literal.length; i++) {
    const c = literal[i]
    if (c === 'N') {
      g.set([x, y - 1], '-');
      y -= 2;
    } else if (c === 'S') {
      g.set([x, y + 1], '-');
      y += 2;
    } else if (c === 'E') {
      g.set([x + 1, y], '|');
      x += 2;
    } else if (c === 'W') {
      g.set([x - 1, y], '|');
      x -= 2;
    } else {
      throw new Error('Invalid direction ' + c);
    }
  }
  return [x, y];
}

function trace(regex: Regex, g: Grid<string>, pt: Coord): Coord[] {
  switch (regex.type) {
    case 'literal':
      return [traceLiteral(regex.literal, g, pt)];
    case 'optional-loop':
      traceLiteral(regex.sequence, g, pt);
      return [pt];
    case 'concat': {
      const {parts} = regex;
      const points = trace(parts[0], g, pt);
      if (parts.length === 1) {
        return points;
      } else {
        const rest: Regex = {
          type: 'concat',
          parts: parts.slice(1),
        };
        return points.flatMap(p => trace(rest, g, p));
      }
    }
    case 'choose':
      return regex.choices.flatMap(choice => trace(choice, g, pt));
    default:
      assertUnreachable(regex);
  }
}

function pad<T>(g: Grid<T>, c: T) {
  const {x: [x1, x2], y: [y1, y2]} = g.boundingBox();
  for (let x = x1 - 1; x <= x2 + 1; x++) {
    g.set([x, y1 - 1], c);
    g.set([x, y2 + 1], c);
  }
  for (let y = y1; y <= y2; y++) {
    g.set([x1 - 1, y], c);
    g.set([x2 + 1, y], c);
  }
}

function fill(g: Grid<string>) {
  const {x: [x1, x2], y: [y1, y2]} = g.boundingBox();
  for (let x = x1; x <= x2; x++) {
    for (let y = y1; y <= y2; y++) {
      const evenX = x % 2 === 0;
      const evenY = y % 2 === 0;
      if ((!evenX || !evenY) && !g.get([x, y])) {
        g.set([x, y], '#');
      }
    }
  }
}

function printGrid(g: Grid<string>) {
  console.log(g.format(v => v, '.'));
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  assert(lines.length === 1);
  let regexStr = lines[0];
  assert(regexStr.startsWith("^"));
  assert(regexStr.endsWith("$"));
  regexStr = regexStr.slice(1, -1);
  // console.log('part 1');
  let regex = parseRegex(regexStr);
  regex = simplifyRegex(regex);
  // console.log(JSON.stringify(regex, null, 2));

  const g = new Grid<string>();
  g.set([0, 0], 'X');
  trace(regex, g, [0, 0]);
  // printGrid(g);
  fill(g);
  pad(g, '#');
  // console.log('');
  // console.log(`^${regexStr}$\n`);
  printGrid(g);

  // console.log("Num matches", numMatches(regex));
  // console.log('part 2');
}

// 4_838_127_116_046_323 strings would match the input regex!
// There must either be repetitions or alternate routes that take you to the same place.
// ... it's the latter.
// After pruning choices that are equivalent, there are only 761 paths!
