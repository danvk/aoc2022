#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/7

import { _ } from "../../deps.ts";
import { assert, readLinesFromArgs } from "../../util.ts";

interface Edge {
  before: string;
  after: string;
}

function parseLine(txt: string) {
  const m = /Step (.) must be finished before step (.) can begin/.exec(txt);
  assert(m, txt);
  const [, before, after] = m;
  return {before, after};
}

function process(edges: Edge[]): string {
  const seq = [];
  const beforeToAfter = _.mapValues(_.groupBy(edges, e => e.before), es => es.map(e => e.after));
  const allSteps = _.uniq(edges.map(({before, after}) => [before, after]).flat());
  const preReqs = _.fromPairs(allSteps.map(step => [step, new Set<string>()]));
  for (const {before, after} of edges) {
    preReqs[after].add(before);
  }

  while (!_.isEmpty(preReqs)) {
    const ready = _.keys(preReqs).filter(k => preReqs[k].size === 0);
    assert(ready.length);
    const c = _.min(ready)!;
    seq.push(c);
    delete preReqs[c];

    for (const after of (beforeToAfter[c] ?? [])) {
      assert(preReqs[after].has(c));
      preReqs[after].delete(c);
    }
  }

  return seq.join('');
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const edges = lines.map(parseLine);
  console.log('part 1', process(edges));
  console.log('part 2');
}
