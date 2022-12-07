#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/7

import { _ } from "../../deps.ts";
import { argminArray, assert, makeObject, readLinesFromArgs } from "../../util.ts";

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
  const beforeToAfter = _.mapValues(_.groupBy(edges, e => e.before), es => es.map(e => e.after));
  const allSteps = _.uniq(edges.map(({before, after}) => [before, after]).flat());
  const preReqs = makeObject(allSteps, () => new Set<string>());
  for (const {before, after} of edges) {
    preReqs[after].add(before);
  }

  const seq = [];
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

interface Event {
  elf: number;
  step: string;
  freeAt: number;
}

function process2(edges: Edge[], numElves: number, delay: number): number {
  const beforeToAfter = _.mapValues(_.groupBy(edges, e => e.before), es => es.map(e => e.after));
  const allSteps = _.uniq(edges.map(({before, after}) => [before, after]).flat());
  const preReqs = makeObject(allSteps, () => new Set<string>());
  for (const {before, after} of edges) {
    preReqs[after].add(before);
  }

  const timeForStep = (step: string) => delay + 1 + step.charCodeAt(0) - 'A'.charCodeAt(0);

  const initReady = _.keys(preReqs).filter(k => preReqs[k].size === 0);
  assert(initReady.length <= numElves);
  const events: Event[] = initReady.map((initStep, i) => ({
    elf: i,
    step: initStep,
    freeAt: timeForStep(initStep),
  }));
  for (const step of initReady) {
    delete preReqs[step];
  }
  let t = 0;
  while (events.length) {
    const nextEventI = argminArray(events.map(e => e.freeAt));
    const [nextEvent] = events.splice(nextEventI, 1);
    t = nextEvent.freeAt;

    const c = nextEvent.step;
    console.log(t, 'elf', nextEvent.elf, 'completes', c);

    for (const after of (beforeToAfter[c] ?? [])) {
      assert(preReqs[after].has(c));
      preReqs[after].delete(c);
    }

    // Put some elves to work
    const ready = _.keys(preReqs).filter(k => preReqs[k].size === 0);
    const freeElves = _.difference(_.range(0, numElves), events.map(e => e.elf));
    console.log(ready, freeElves);
    // assert(ready.length <= freeElves.length);
    for (const [i, step] of ready.entries()) {
      if (i < freeElves.length) {
        const elf = freeElves[i];
        events.push({elf, step, freeAt: t + timeForStep(step)});
        delete preReqs[step];
      }
    }
    console.log(preReqs);
    console.log(events);
    console.log('---');
  }

  return t;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const edges = lines.map(parseLine);
  console.log('part 1', process(edges));
  // console.log('part 2', process2(edges, 2, 0));
  console.log('part 2', process2(edges, 5, 60));
}
