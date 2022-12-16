#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/16

import { _ } from "../deps.ts";
import { dijkstra } from "../dijkstra.ts";
import { assert, makeObject, readLinesFromArgs, safeParseInt, tuple } from "../util.ts";

interface Valve {
  valve: string;
  flow: number;
  tunnels: {[valve: string]: number};
}

// Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
function readLine(line: string): Valve {
  const m = line.match(
    /Valve ([A-Z]+) has flow rate=(\d+); tunnels? leads? to valves? (.*)/
  );
  assert(m, line);
  const [, valve, flowStr, tunnels] = m;
  return { valve, flow: safeParseInt(flowStr), tunnels: makeObject(tunnels.split(", "), () => 1)};
}

// Input: 41/56 valves have zero flow

function collapse(valves: _.Dictionary<Valve>, killAA=false) {
  // find a valve with flow rate of zero and eliminate it.
  const zeros = _.values(valves).filter(v => v.flow === 0).filter(v => v.valve !== 'AA' || killAA);
  if (zeros.length === 0) {
    return;
  }

  const valve = zeros[0];
  const ins = _.values(valves).filter(v => v.tunnels[valve.valve]);
  // console.log('Will eliminate', valve);
  // console.log('ins', ins);
  for (const inValve of ins) {
    const oldD = inValve.tunnels[valve.valve];
    for (const [outValve, d] of Object.entries(valve.tunnels)) {
      if (outValve === inValve.valve) continue;  // no self-loops
      const newD = d + oldD;
      if (!(outValve in inValve.tunnels) || inValve.tunnels[outValve] > newD) {
        inValve.tunnels[outValve] = newD;
      }
    }
    delete inValve.tunnels[valve.valve];
  }
  delete valves[valve.valve];
  collapse(valves);
}

function part1(valves: _.Dictionary<Valve>) {
  const cur = "AA";
  const t = 0;
  const pressure = 0;
  const v = valves[cur];
  collapse(valves, true);  // this optimization does seem quite important.

  const paths = Object.entries(v.tunnels).map(([next, d]) => search(valves, next, t + d, pressure));
  return _.maxBy(paths, n => n[0])!;
}

function distance(
  valves: _.Dictionary<Valve>,
  start: string,
  stop: string,
): number {
  return dijkstra(
    start,
    stop,
    v => Object.entries(valves[v].tunnels),
    v => v,
    v => v,
  )![0];
}

function search(
  valves: _.Dictionary<Valve>,
  cur: string,
  t: number,
  pressure: number,
): [number, string[]] {
  // console.log(t, cur, pressure, valves);
  if (t >= 30) {
    return tuple(pressure, []);
  }

  // early out if this isn't working.
  const maxAdditional = _.sum(
    Object.values(valves).map(v => v.flow * (30 - t))
  );
  if (pressure + maxAdditional < 1250) {
    return tuple(pressure, []);
  }

  const v = valves[cur];
  let nexts = Object.entries(v.tunnels).map(([next, d]) => search(valves, next, t + d, pressure));

  // let event = '';
  if (v.flow) {
    const newPressure = v.flow * (30 - t - 1);
    pressure += newPressure;
    const newValves = _.cloneDeep(valves);
    newValves[cur].flow = 0;
    collapse(newValves);
    const event = `Open ${v.valve} at t=${t} releasing total of ${newPressure}`;

    nexts = nexts.concat(Object.entries(v.tunnels).map(([next, d]) => {
      const [newP, newPath] = search(newValves, next, t + 1 + d, pressure);
      return [newP, [event, ...newPath]];
    }));
  }

  if (!nexts.length) {
    return [pressure, [`Stay at ${cur}`]];
  }
  const [bestP, bestPath] = _.maxBy(nexts, n => n[0])!;
  return [bestP, [`Walk to ${cur}`, ...bestPath]];
}

function search2(
  valves: _.Dictionary<Valve>,
  man: string,
  manT: number,
  ele: string,
  eleT: number,
  pressure: number,
): [number, string[]] {
  if (manT >= 26 && eleT >= 26) {
    return tuple(pressure, []);
  }

  // early out if this isn't working.
  const t = Math.min(manT, eleT);
  const maxAdditional = _.sum(Object.values(valves).map(v => v.flow * (26 - t)));
  if (pressure + maxAdditional < 1500) {
    return tuple(pressure, []);
  }

  // Assume man acts; we'll flip as we recur to get the elephant in on the action.
  const v = valves[man];
  let nexts = Object.entries(v.tunnels).map(
    ([next, d]) => search2(valves, ele, eleT, next, manT + d, pressure)
  );

  // let event = '';
  if (v.flow) {
    const newPressure = v.flow * (26 - t - 1);
    pressure += newPressure;
    const newValves = _.cloneDeep(valves);
    newValves[man].flow = 0;
    if (ele !== man) {
      collapse(newValves);  // can't collapse the elephant's node.
    }
    const event = `Open ${v.valve} at t=${t} releasing total of ${newPressure}`;
    assert(newValves[man]);
    assert(newValves[ele]);

    nexts = nexts.concat(Object.entries(v.tunnels).map(([next, d]) => {
      const [newP, newPath] = search2(newValves, ele, eleT, next, t + 1 + d, pressure);
      return [newP, [event, ...newPath]];
    }));
  }

  if (!nexts.length) {
    return [pressure, [`Stay at ${man} / ${ele}`]];
  }
  const [bestP, bestPath] = _.maxBy(nexts, n => n[0])!;
  return [bestP, [`${man}@${manT}, ${ele}@${eleT}`, ...bestPath]];
}

function part2(valves: _.Dictionary<Valve>) {
  const t = 0;
  const pressure = 0;
  const v = valves['AA'];
  collapse(valves, true);

  const paths = [];
  for (const [nextMan, manD] of Object.entries(v.tunnels)) {
    for (const [nextElephant, eleD] of Object.entries(v.tunnels)) {
      paths.push(search2(valves, nextMan, t + manD, nextElephant, t + eleD, pressure));
    }
  }
  return _.maxBy(paths, n => n[0])!;
}

function flowForSeq(valves: _.Dictionary<Valve>, seq: string[], maxT: number): number {
  let t = 0;
  let pressure = 0;
  let cur = 'AA';
  for (const node of seq) {
    const d = distances[`${cur},${node}`];
    t += d;
    if (t >= maxT) {
      return -1;
    }
    t++;  // open valve
    const newPressure = valves[node].flow * (maxT - t);
    pressure += newPressure;
    cur = node;

    // console.log(`opened ${cur} at ${t} releasing ${newPressure}`);
  }
  return pressure;
}

function explore(
  valves: _.Dictionary<Valve>,
  cur: string,
  t: number,
  pressure: number,
  closedValves: string[],
  numOpened: number,
  maxT: number,
  beingsLeft: number,
): number {
  if (t > maxT) {
    return pressure;
  }
  // console.log(beingsLeft, t, cur, pressure);
  // if (numOpened > 9) {
  //   return pressure;
  // }

  const choices = [];
  for (const valve of closedValves) {
    const d = distances[`${cur},${valve}`];
    let nt = t + d;
    if (t >= maxT) {
      continue;
    }
    const remainingValves = closedValves.filter(v => v !== valve);
    nt++;  // open valve
    const newPressure = valves[valve].flow * Math.max(maxT - nt, 0);
    const p = explore(valves, valve, nt, pressure + newPressure, remainingValves, 1 + numOpened, maxT, beingsLeft);
    choices.push(p);
  }

  // With beings left, we can always stop and let the next one start.
  if (beingsLeft > 0) {
    const p = explore(
      valves, 'AA', 0, pressure, closedValves, numOpened, maxT, beingsLeft - 1
    );
    choices.push(p);
  }

  // const best = _.maxBy(choices, c => c[0]);
  const best = _.max(choices);
  if (best === undefined) {
    // return [pressure, []];
    return pressure;
  }
  return best;
}

const distances: {[pair: string]: number} = {};

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const valvesArray = lines.map(readLine);
  console.log("total vales:", valvesArray.length);
  console.log("zero counts:", valvesArray.filter((v) => v.flow === 0).length);
  const valves = _.keyBy(valvesArray, (v) => v.valve);
  console.log(valves);
  collapse(valves);
  console.log(valves);

  for (const start of Object.keys(valves)) {
    for (const stop of Object.keys(valves)) {
      distances[`${start},${stop}`] = distance(valves, start, stop);
    }
  }

  const closedValves = Object.values(valves).filter(v => v.flow > 0).map(v => v.valve);
  console.log(explore(valves, 'AA', 0, 0, closedValves, 0, 30, 0));
  console.log(explore(valves, 'AA', 0, 0, closedValves, 0, 26, 1));

  // 1460; takes 1:34.02 to run part 1.
  // console.log("part 1", part1(valves));  // 1000 = too low, 1500 = too high

  // console.log("part 2", part2(valves));  // 1500 = too low
  // 1869 = too low
  // 1967 = too low (54.269s for numOpened <= 7)
  // 2051 = wrong (3:18.54 <= 8)

  // Elephant sample
  // console.log(
  //   flowForSeq(valves, ['DD', 'HH', 'EE'], 26) +
  //   flowForSeq(valves, ['JJ', 'BB', 'CC'], 26)
  // )
}

// 15! is 1T which is too large
// In the solution for part 1, I only open 6/14 valves.
// 14^6 = 7,529,536 which is quite manageable.

