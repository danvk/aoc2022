// https://adventofcode.com/2018/day/1

import { readLinesFromArgs } from "../../util.ts";

const lines = await readLinesFromArgs();
const nums = lines.map(Number);

const sum = nums.reduce((a, b) => a + b);
console.log('part 1', sum);

const seen = new Set<number>();
let tally = 0;
seen.add(0);
while (true) {
    for (const num of nums) {
        tally += num;
        if (seen.has(tally)) {
            console.log('part 2', tally);
            Deno.exit();
        }
        seen.add(tally);
    }
}
