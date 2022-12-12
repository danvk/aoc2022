#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2018/day/14

import { _ } from "../../deps.ts";
import { assert, safeParseInt } from "../../util.ts";

function part1(n: number): string {
  const recipes = [3, 7];
  const elves = [0, 1];
  let step = 0;
  while (recipes.length < n + 10) {
    const newRecipes = _.sum(elves.map(i => recipes[i])).toString().split('').map(Number);
    for (const r of newRecipes) {
      recipes.push(r);
    }
    for (const [i, e] of elves.entries()) {
      elves[i] = (e + 1 + recipes[e]) % recipes.length;
    }
    step++;
    // console.log(step, elves, recipes);
  }
  return recipes.slice(n, n+10).map(String).join('');
}


function part2(n: number): number {
  const recipes = [3, 7];
  const elves = [0, 1];
  let step = 0;
  const search = String(n).split('').map(Number);
  const nDigits = search.length;
  while (true) {
    const newRecipes = _.sum(elves.map(i => recipes[i])).toString().split('').map(Number);
    for (const r of newRecipes) {
      recipes.push(r);
    }
    for (const [i, e] of elves.entries()) {
      elves[i] = (e + 1 + recipes[e]) % recipes.length;
    }
    step++;
    for (let i = recipes.length - nDigits - newRecipes.length; i < recipes.length - nDigits; i++) {
      if (_.isEqual(recipes.slice(i, i + nDigits), search)) {
        return i;
      }
    }
  }
}

if (import.meta.main) {
  const [num] = Deno.args.map(safeParseInt);
  console.log('part 1', part1(num));
  console.log('part 2', part2(num));
}
