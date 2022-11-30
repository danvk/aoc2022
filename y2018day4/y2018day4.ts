#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/4

import { readLinesFromArgs } from "../util.ts";

interface Timestamp {
  year: number;
  month: number;
  date: number;
  hour: number;
  minute: number;
}

interface StartShift extends Timestamp {
  type: 'start';
  id: number;
}
interface FallAsleep extends Timestamp {
  type: 'fall-asleep';
}
interface WakeUp extends Timestamp {
  type: 'wake-up';
}

type Record = StartShift | FallAsleep | WakeUp;

export function parseRecord(txt: string): Record {
  // [1518-11-01 00:00] Guard #10 begins shift
  const m = txt.match(/^\[(\d+)-(\d+)-(\d+) (\d+):(\d+)\] (.*)$/);
  if (!m) {
    throw new Error(`Unable to parse ${txt}`);
  }
  const [, year, month, date, hour, minute, message] = m;
  const timestamp: Timestamp = {
    year: Number(year),
    month: Number(month),
    date: Number(date),
    hour: Number(hour),
    minute: Number(minute),
  };
  if (message === 'falls asleep') {
    return {...timestamp, type: 'fall-asleep'};
  } else if (message === 'wakes up') {
    return {...timestamp, type: 'wake-up'};
  }
  const m2 = message.match(/Guard #(\d+) begins shift/);
  if (!m2) {
    throw new Error(`Unable to parse ${message}`);
  }
  const [, id] = m2;
  return {...timestamp, type: 'start', id: Number(id)};
}

function elapsedMinutes(a: Timestamp, b: Timestamp): number {
  if (a.year !== b.year || a.month !== b.month) {
    throw new Error();
  }
  return (b.minute - a.minute) + 60 * (b.hour - a.hour) + 24 * 60 * (b.date - a.date);
}

function argmax<K>(m: Map<K, number>): K {
  let maxKV = null;
  for (const [k, v] of m.entries()) {
    if (maxKV === null || v > maxKV.v) {
      maxKV = {k, v};
    }
  }
  if (!maxKV) {
    throw new Error('map was empty');
  }
  return maxKV.k;
}

function argmaxArray(xs: number[]): number {
  let maxKV = null;
  for (let k = 0; k < xs.length; k++) {
    const v = xs[k];
    if (maxKV === null || v > maxKV.v) {
      maxKV = {k, v};
    }
  }
  if (!maxKV) {
    throw new Error('map was empty');
  }
  return maxKV.k;
}

function minutesAsleep(records: readonly Record[]): Map<number, number> {
  const minutes = new Map<number, number>();
  let onShift = -1;
  const first = records[0];
  if (first.type !== 'start') {
    throw new Error();
  }
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (record.type === 'start') {
      onShift = record.id;
      continue;
    } else if (record.type === 'fall-asleep') {
      const next = records[i + 1];
      if (next.type !== 'wake-up') {
        throw new Error();
      }
      const m = elapsedMinutes(record, next);
      if (m > 60) {
        throw new Error(`${record}, ${next}`);
      }
      minutes.set(onShift, m + (minutes.get(onShift) ?? 0));
    }
  }

  return minutes;
}

function zeros(n: number): number[] {
  const xs = new Array(n);
  for (let i = 0; i < n; i++) {
    xs[i] = 0;
  }
  return xs;
}

function mostAsleepMinute(records: readonly Record[], id: number): [number, number] {
  const asleep = zeros(60);
  let onShift = -1;
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (record.type === 'start') {
      onShift = record.id;
      continue;
    } else if (record.type === 'fall-asleep' && onShift === id) {
      const next = records[i + 1];
      if (next.type !== 'wake-up') {
        throw new Error();
      }
      const m = elapsedMinutes(record, next);
      if (m > 60) {
        throw new Error(`${record}, ${next}`);
      }
      if (record.hour !== 0 || next.hour !== 0) {
        throw new Error();
      }
      for (let m = record.minute; m < next.minute; m++) {
        asleep[m]++;
      }
    }
  }

  const minute = argmaxArray(asleep);
  const timesAsleep = asleep[minute];
  return [minute, timesAsleep];
}

function allIds(records: readonly Record[]): Set<number> {
  const ids = new Set<number>();
  for (const record of records) {
    if (record.type === 'start') {
      ids.add(record.id);
    }
  }
  return ids;
}

function tuple<T extends Array<unknown>>(...x: T) {
  return x;
}

function mostSleepyMinute(records: readonly Record[]): [number, number] {
  let max = null;
  for (const id of allIds(records)) {
    const [minute, timesAsleep] = mostAsleepMinute(records, id);
    if (!max || timesAsleep > max.v) {
      max = {k: tuple(id, minute), v: timesAsleep};
    }
  }
  if (!max) {
    throw new Error();  // TODO: add assert
  }
  return max.k;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  lines.sort();
  const records = lines.map(parseRecord);
  const minutes = minutesAsleep(records);
  const mostAsleep = argmax(minutes);
  console.log(minutes);
  console.log(mostAsleep);
  const [sleepiestMinute] = mostAsleepMinute(records, mostAsleep);
  console.log(sleepiestMinute)
  // console.log(records);
  console.log('part 1', mostAsleep * sleepiestMinute);

  const [sleepyId, sleepyMinute] = mostSleepyMinute(records);
  console.log('part 2', sleepyId * sleepyMinute, sleepyId, sleepyMinute);
}
