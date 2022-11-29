// https://adventofcode.com/2021/day/1

// There's a std stream option for reading files line by line it feels like overkill here.
// https://deno.land/std@0.166.0/streams/mod.ts?s=TextLineStream
const [path] = Deno.args;

const contents = await Deno.readTextFile(path);
const lines = contents.split('\n');

const nums = lines.map(Number);
const sums = [];
for (let i = 2; i < nums.length; i++) {
    sums.push(nums[i - 2] + nums[i - 1] + nums[i]);
}

let prev = null;
let numIncs = 0;
for (const num of sums) {
    if (prev !== null && num > prev) {
        numIncs++;
    }
    prev = num;
}

console.log(numIncs);
