import { assertEquals } from "./deps.ts";
import { Grid } from "./grid.ts";

Deno.test('Iterate grid', () => {
  const g = new Grid<string>();
  g.set([0, 0], 'o');
  g.set([1, 1], 'x');
  g.set([-1, 10], 'y');
  assertEquals([...g], [
    [[0, 0], 'o'],
    [[1, 1], 'x'],
    [[-1, 10], 'y'],
  ]);
});

Deno.test('boundingBox', () => {
  const g = new Grid<string>();
  g.set([0, 0], 'o');
  g.set([1, 1], 'x');
  g.set([-1, 10], 'y');
  assertEquals(g.boundingBox(), {x: [-1, 1], y: [0, 10]});
});

const lines = `abc
---
x x`;

Deno.test('Grid.fromLines', () => {
  const g = Grid.fromLines(lines.split('\n'));
  assertEquals(g.format(x => x), lines);
  assertEquals(g.get([0, 0]), 'a');
  assertEquals(g.get([2, 1]), '-');
  assertEquals(g.get([0, 2]), 'x');
  assertEquals(g.get([0, 3]), undefined);
});
