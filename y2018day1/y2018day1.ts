// https://adventofcode.com/2018/day/1

const [path] = Deno.args;

const contents = await Deno.readTextFile(path);
const lines = contents.split('\n');
if (lines[lines.length - 1] === '') {
    lines.pop();
}
const nums = lines.map(Number);

const sum = nums.reduce((a, b) => a + b);
console.log('part 1', sum);
console.log(nums[nums.length - 1]);

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
