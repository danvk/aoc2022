/** Closed interval, inclusive of both endpoints */
export type Interval = [number, number];

/** Do two intervals overlap one another? */
export function intervalOverlaps([a1, a2]: Interval, [b1, b2]: Interval) {
  return (a1 <= b2) && (b1 <= a2);
}

/**
 * Find the union of an interval and a set of disjoint intervals.
 * No ordering is assumed, but input intervals must be disjoint for output to be disjoint.
 */
export function unionIntervals(intervals: readonly Interval[], newInterval: Interval): Interval[] {
  for (let i = 0; i < intervals.length; i++) {
    const r = intervals[i];
    if (intervalOverlaps(r, newInterval)) {
      const combined: Interval = [
        Math.min(r[0], newInterval[0]),
        Math.max(r[1], newInterval[1]),
      ];
      return unionIntervals(intervals.slice(0, i).concat(intervals.slice(i+1)), combined);
    }
  }
  return [...intervals, newInterval];
}

/**
 * Merge ranges that are exactly touching: [1, 4], [5, 10] --> [1, 10].
 * The intervals must be sorted.
 */
export function mergeIntIntervals(ranges: readonly Interval[]): Interval[] {
  const out = [ranges[0]];
  for (let i = 1; i < ranges.length; i++) {
    const r = ranges[i];
    if (r[0] === out[out.length - 1][1] + 1) {
      out[out.length - 1][1] = r[1];
    } else {
      out.push(r);
    }
  }
  return out;
}
