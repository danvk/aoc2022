import { assertEquals, _ } from '../../deps.ts';
import {} from './y2018day24.ts';

Deno.test("sorting", () => {
  const lst = [
    [20, 10],
    [0, 15],
    [15, 0],
    [0, 16],
  ];
  const r = _.sortBy(lst, [
    v => -v[0],
    v => -v[1],
  ]);
  assertEquals(r, [
    [20, 10],
    [15, 0],
    [0, 16],
    [0, 15],
  ]);
});

Deno.test("sorting3", () => {
  const lst = [
    [20, 10, 3],
    [20, 10, 2],
    [20, 10, 5],
    [20, 10, 6],
  ];
  const r = _.sortBy(lst, [
    v => -v[0],
    v => -v[1],
    v => -v[2],
  ]);
  assertEquals(r, [
    [20, 10, 6],
    [20, 10, 5],
    [20, 10, 3],
    [20, 10, 2],
  ]);
});
