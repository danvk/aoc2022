import { assertEquals } from "./deps.ts";
import { argmaxArray, powerset, transpose } from "./util.ts";

Deno.test("argmaxArray", () => {
  assertEquals(argmaxArray([0, 10, 2, 8]), 1);
});

Deno.test("transpose", () => {
  const grid = [
    [1, 2],
    [3, 4],
  ];
  transpose(grid);
  assertEquals(grid, [
    [1, 3],
    [2, 4],
  ]);
});

Deno.test("powerset", () => {
  assertEquals(
    [...powerset(["A", "B", "C"])],
    [
      [],
      ["C"],
      ["B"],
      ["B", "C"],
      ["A"],
      ["A", "C"],
      ["A", "B"],
      ["A", "B", "C"],
    ]
  );
});
