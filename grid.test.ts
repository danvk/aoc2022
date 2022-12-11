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
