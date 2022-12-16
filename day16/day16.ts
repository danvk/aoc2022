#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/16

import { _ } from "../deps.ts";
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

function collapse(valves: _.Dictionary<Valve>) {
  // find a valve with flow rate of zero and eliminate it.
  const zeros = _.values(valves).filter(v => v.flow === 0).filter(v => v.valve !== 'AA');
  if (zeros.length === 0) {
    return;
  }

  const valve = zeros[0];
  const ins = _.values(valves).filter(v => v.tunnels[valve.valve]);
  console.log('Will eliminate', valve);
  console.log('ins', ins);
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

  return search(valves, cur, t, pressure);
}

function search(
  valves: _.Dictionary<Valve>,
  cur: string,
  t: number,
  pressure: number,
): [number, string[]] {
  if (t > 30) {
    return tuple(pressure, []);
  }

  let event = '';
  const v = valves[cur];
  if (v.flow) {
    const newPressure = v.flow * (30 - t);
    pressure += newPressure;
    valves = _.cloneDeep(valves);
    valves[cur].flow = 0;
    collapse(valves);
    event = `Open ${v.valve} at t=${t} releasing total of ${newPressure}`;
  }

  const nexts = Object.entries(v.tunnels).map(([next, d]) => search(valves, next, t + d, pressure));
  if (!nexts.length) {
    return [pressure, [event + `; stay at ${cur}`]];
  }
  const [bestP, bestPath] = _.maxBy(nexts, n => n[0])!;
  return [bestP, [event + `; walk to ${cur}`, ...bestPath]];
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const valvesArray = lines.map(readLine);
  console.log("total vales:", valvesArray.length);
  console.log("zero counts:", valvesArray.filter((v) => v.flow === 0).length);
  const valves = _.keyBy(valvesArray, (v) => v.valve);
  console.log(valves);
  collapse(valves);
  console.log(valves);
  console.log("part 1", part1(valves));
  console.log("part 2");
}
