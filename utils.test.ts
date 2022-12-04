import { assertEquals } from "./deps.ts";
import { argmaxArray } from "./util.ts";

Deno.test("argmaxArray", () => {
  assertEquals(argmaxArray([0, 10, 2, 8]), 1);
});
