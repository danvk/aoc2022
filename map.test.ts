import { assertEquals } from "./deps.ts";
import { groupBy, minMaxKey } from './map.ts';

Deno.test('minMaxKey', () => {
  const m = new Map([[10, 'x'], [20, 'y'], [5, 'z']]);
  assertEquals(minMaxKey(m), [5, 20]);
});

Deno.test('groupBy', () => {
  const xs = [0, 1, 2, 3, 4, 5, 6, 7];
  const m = groupBy(xs, x => x % 3);
  assertEquals(m, new Map([
    [0, [0, 3, 6]],
    [1, [1, 4, 7]],
    [2, [2, 5]]
  ]));
});
