import { assert } from '../deps.ts';
import {State, resourceScore} from './day19.ts';

Deno.test("stateScore", () => {
  const state1: State = {
    time: 23,
    robots: { ore: 4, clay: 8, obsidian: 5, geode: 0 },
    resources: { ore: 20, clay: 25, obsidian: 26, geode: 0 }
  };
  const state2: State = {
    time: 24,
    robots: { ore: 4, clay: 8, obsidian: 5, geode: 1 },
    resources: { ore: 18, clay: 25, obsidian: 6, geode: 1 }
  }
  assert(resourceScore(state2) > resourceScore(state1));
});
