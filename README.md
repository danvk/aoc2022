# Advent of Code 2022

See my _Effective TypeScript_ blog post for a high-level overview: [A first look at Deno through the Advent of Code 2022][post].

## Daily Notes

### Day 25 (7159 / 5127)

I wanted to stay up until midnight (11pm local time) but once it got to around 10:05pm I just couldn't keep my eyes open. So not a great overall finish! Today's problem was fine, just a little fiddly. I'm curious if there's a good way to get the solution with just a `snafuToNum` function and binary search, but implementing `numToSnafu` was easy enough.

- Start 06:11:45 (05:11:45 local time)
- ⭐️: 06:29:15 (17m30s)
- ⭐️⭐️: 06:29:19 (17m34s)

### Day 24 (6284 / 6073)

Another nice application of Dijkstra. The blizzards initially make it seem like it will be time-dependent and that Dijkstra won't apply. But the blizzards cycle with period `600=lcm(width=120, height=25)`. So you can add `t % 600` to the state and Dijkstra works just great. For part 2, you just need to add the "leg" (out, back, out again) to the state.

Things that tripped me up:

- part 1: I initially had `x % period` and `y % period` for the blizzard positions. But it's actually more like `x % w` and `y % h`. Since those can be negative, it's specifically `((x % w) + w) % w`. Not sure if there's a name for this sort of modulus but I feel like it comes up a lot in AoC problems. I only figured out what was going on when I implemented a function to print the grid and the blizzards.
- part 2: I was getting to the "back" state but never to the "out again" state. My logic looked just right. I eventually realized that I'd updated my state type and my neighbors function, but had forgotten to update my serialization/deserialization function. So "leg" was getting quietly dropped.

- Start: 09:13:50 (08:13:50 local time)
- ⭐️: 10:01:31 (48m)
- ⭐️⭐️: 10:23:16 (1h10m)

### Day 23 (8080 / 7796)

Easy day. My one screwup was writing `'E': [1, 0]` instead of `'E': [-1, 0]` in my directions dictionary. This took a while to track down. I should just have a canonical version of this instead of writing it out each time. I thought I had a bug printing the grid (I was seeing a lone `.` disconnected from the rest of the grid), but this mysteriously disappeared.

Having struggled with y2018day24 last night and eventually realizing it was a small detail I hadn't implemented, I was very careful to read all the rules today. I worried about the word "simultaneously" to describe the Elf movement, but it turned out to be irrelevant.

Overall very happy for my `Grid` class! Making a fresh grid each time turned out to be smart since I didn't need to invalidate the bounding box as elves moved for part 1. And talking with others, part 2 would use a lot of memory with a 2D array. Instead, I use memory proportional to the number of elves independent of grid size.

Just 1.5 puzzles left!

- Start: 09:20:00 (08:20ish local time; not exactly sure)
- ⭐️: 10:01:37 (41m)
- ⭐️⭐️: 10:06:53 (46m)

### Day 22 (8786 / 4298)

Part 1 was easy, part two was unbelievably annoying. In particular, I was annoyed that the sample had a completely different folding pattern than the input. I assumed they were just transpose of one another, so I wrote some code to transpose the sample input and solve that problem. But they're actually totally unrelated. I'd written out the face transitions for the transposed sample, so I was kinda stuck with my mistake.

Visualizing how the cube folded up was hard, particularly since you needed to know how the coordinates lined up on the faces as they connected. If I'd had access to scissors, I would have folded up a cube. Apparently Tay did this! Instead I drew a janky one on paper. I was so, so relieved that I got the right answer the first time. This would have been even more of a PITA to debug than it was to implement.

- Start: 09:23:55 (08:23:55 local time)
- ⭐️: 09:59:31 (36m)
- ⭐️⭐️: 12:08:04 (2h44m)

### Day 21 (11694 / 8776)

An easy one. We flew to Costa Rica yesterday and gained an hour, so the puzzle was posted at 11pm rather than midnight. If I'd known it would be an easy one, I would have just done it last night!

Some minor bugs on part 1 but otherwise straightforward. For part 2 I evaluated the equations to the extent I could without `humn`. This eliminated most of the equations. I ran through to the final comparison on `root` with a few values of `humn` and observed that one side of the comparison was constant while the other was decreasing linearly with `humn`. I fit a line to this and solved for the solution, but for whatever reason this didn't work. I was close, though, so I did binary search by hand to get a narrow-ish range and then did a linear search for the solution.

- Start: 07:31:31 (06:31:31 local time)
- ⭐️: 07:46:48 (15m)
- ⭐️⭐️: 08:16:18 (45m)

Update: Linear interpolation doesn't work due to floating point issues. By getting a really long baseline (humn=0 and humn=1 trillion) you can mostly eliminate this. The value I get is within epsilon.

### Day 20 (7780 / 6961)

This was extremely frustrating! The problem is so simple and yet I kept getting the wrong answer. I had the right answer on the sample input, so there wasn't much to go on. I wound up implementing the mixing algorithm three different ways before I got the right answer.

My initial instinct to use a circular linked list was fine, though I think an array would have worked here, too. Implementing circular linked lists is always annoying since your mistakes lead to infinite loops rather than obvious errors. After some bug bashing, I was able to reproduce the example sequence and answer… but I had the wrong answer on my input!

I thought I might have a bug where a number gets rotated forward or backwards exactly N times (where N=length of list). So I tested that, got the wrong answer, and fixed the bug. But still the wrong answer on my input!

I tried a few more tests but couldn't find the issue. I tried reimplementing part 1 with an array but got the _same_ wrong answer as before.

Finally I implemented the move forward/backward in terms of very simple primitives: shift one left and shift one right. I found a good trick for implementing this correctly: write out the relevant part of the list as "A B C D" and use those as your variable names:

```ts
export function shiftLeft(c: Node) {
  // A B C D
  //     |
  // A C B D

  const b = c.prev;
  const d = c.next;
  const a = c.prev.prev;

  a.next = c;
  c.prev = a;
  c.next = b;
  b.prev = c;
  b.next = d;
  d.prev = b;
}
```

To make this work in part 2, I needed to shift by the number mod the list length. This gave me the wrong answer. I'd noticed while implementing the array solution that I needed to mod negative shifts by `(n-1)` rather than `n`. Doing this gave me the right answer. Thinking through it later, I realized that it's `n-1` because you remove the number from the list before you shift it, so the list has length `n-1` for purposes of the shifting.

Note to self: before doing AoC next year, have a (circular) linked list implementation handy! There's always one problem that uses it.

Overall spent 1h45m on this, but I feel like it really should have been closer to 45m.

- Start: 06:43:36
- ⭐️: 08:22:27 (1h39m)
- ⭐️⭐️: 08:26:21 (1h43m)

I fixed my original implementation later (062fd7852252ec9b35a9c1fefbfd6caf009e9435). The issue isn't just the modulus -- you really do have to remove the element from the list before shifting. Several of the test cases that I'd written were just wrong because of this.

### Day 19 (7649 / 6570)

Hardest problem yet! I implemented a BFS and quickly blew the stack after t=19 on the sample input. First instinct was to do various forms of greedy searching as I got closer to the end time to reduce the number of active states, but I couldn't get this to work. I tried pruning the list of states to the most promising ones, but convinced myself that this didn't work. After looking at more example states, I realized that I needed two different ranking functions -- one for pruning which considered the number of robots of each type and one for counting the geodes which didn't. This is important because you sometimes need credit for producing a robot before it produces any resources.

I kicked this off with a filter to the top million states at each time. While this was running I tried pruning based on the max possible geodes you could produce near the max time (could you ever produce a geode?) but had trouble getting this to work. While I was hacking away at it my solution that pruned to the top million finished and gave me the correct answer. It worked without change for part two as well. I was able to reduce the state size from 1M to 10k and still get the right answer, but 1k was too small.

So I got my stars but I'm not sure why my code works! Maybe there's some greedy structure to the problem?

- Start: 08:21:17
- ⭐️: 17:16:36 (8h55m)
- ⭐️⭐️: 17:27:53 (9h06m)

Vaguely reminiscent of https://adventofcode.com/2019/day/14.

I learned later that my approach here is called "Beam Search" and the number of states you save is the beam size. [BULB][] is a fancier algorithm that blends the optimality of BFS with the low memory requirements of DFS. It might be fun to implement, though I'm not sure how applicable it would be to this problem where the goal is to find the global optimal path, rather than just _a_ good path using limited memory.

[bulb]: https://www.ijcai.org/Proceedings/05/Papers/0596.pdf

### Day 18 (11204 / 8025)

A surprisingly easy one -- maybe Erik is giving us the weekend off?

Part 1 was very straightforward. I'm curious what my seven minutes would have earned me had I done it at midnight!

For part 2 I figured I'd use my flood fill function in three dimensions to fill in the interior. I filtered out surfaces from part 1 that were obviously on the outside by looking at whether I could go `diameter` cells in any of the six directions without hitting anything. This left exactly one candidate for the sample and 1627 for my input. I tried guessing `part1 - 1627` for part 2, but I guess the shape was more complex.

The two tricks for flood fill were to:

1. Throw an exception if I ever got to the exterior (early out). This wasn't a capability that I realized my flood fill code had until today!
2. Add newly-discovered interior / exterior points to working sets to more aggressively prune future searches.

All in all this runs in 173ms!

Afterwards I updated my Dijkstra/Flood Fill neighbor funtion from

    -  neighbors: (n: N) => [N, number][],
    +  neighbors: (n: N) => Iterable<[N, number]>,

This requires no code changes (either in the `neighbors` functions or in the implementation) but does let me pass in a generator, which is quite convenient. Most of my previous implementations involved building an array and returning it.

- Start: 06:56:20
- ⭐️: 07:03:22 (7m2s)
- ⭐️⭐️: 07:33:43 (37m13s)

### Day 17 (9939 / 5946)

Today was much easier than yesterday. I did today's while watching the World Cup third place match and baking bread, so I was a bit distracted. My only trouble in part 1 was mistyping the coordinates for the square -- I had two of the coordinates identical which took a while to debug.

For part 2 I printed out the heights at the first few thousand times to look for periodicity. Then I realized I had no idea how to look for that (side note: how would you do this?). But if the top row was ever all full, it would have to repeat. Maybe? It would depend on the position in the jet sequence. So I printed that out, too, and low and behold it was always the same (i=8772) when the top row was full. After some fiddliness and off-by-one errors, that gave me my answer.

I took the opportunity to track the bounding box in my `Grid` class as you update the grid. This makes calling `boundingBox` instant rather than `O(# cells)`. For printing the height at every step, this made an enormous difference.

- Start: 10:33:17
- ⭐️: 11:37:55 (1h4m)
- ⭐️⭐️: 12:21:20 (1h48m)

### Day 16 (6564 / 4162)

This was by far the hardest puzzle for me so far this year. I'm quite glad I didn't start it at midnight as that would have made for a very late night.

I noticed that many of the valves had zero flow (4/10 in the sample, 41/56 in my input). So I started by writing some code to eliminate these from the graph (`collapse`). Notably this also removed zero-value cycles from the graph. This proved unnecessary in the end but helped me get the first star.

My initial approach was a DFS. This proved too slow, so I added some pruning: I set the flow rate of valves to zero as I opened them, and then re-ran `collapse` to further simplify the graph. One thing that tripped me up here was that you could visit a valve but not open it. This is because opening the valve costs one unit of time. Allowing this significantly slowed down the search.

I was eventually able to get this approach to work for the first star by adding some pruning: if the max remaining flow couldn't get you over some known lower bound on the answer, then there was no point in searching further. I implemented all-pairs distance calculation (using `dijkstra`) to try and improve this heuristic but couldn't quite get it to work.

My solution for the first star took maybe 90 seconds to run. I had the inkling that I was missing some insight and part two bore this out. After a brief attempt to adapt my part 1 solution, I realized I needed a different approach.

The key insight was that the only thing that matters is the order in which you open the valves. You'll always take the shortest path between them and that determines the pressure you release. You still have `15!` possible visitation orders, but in practice all of them will exceed the maximum time/distance quite quickly. I wrote a new part 1 solution to recur based just on the sequence of valves and it ran in maybe a second. Progress!

I'd hoped this would adapt straightaway to part 2. It almost did, but things still seemed too slow. I tried pruning based on the number of valves opened, but this gave me incorrect answers (too low). I ran the code with a `console.log` on every recursive call and noticed lots of large times (`t=42`). So I added another early out that I didn't think was necessary. This got me the right answer in maybe 70s, but I do think I have a bug still.

Overall: cool problem! I wish I'd realized that the valve order is all that matters more quickly. But based on my rank for part 2 (4162 after 10.5h) it seems like lots of other people had trouble with this one, too.

- Start: 07:09:28
- ⭐️: 08:29:33 (1h20m)
- ⭐️⭐️: 10:29:47 (3h20m)

Update: Jack pointed out that for part two, you can just enumerate all possible partitions of the valves between you and the elephant and use your solution from part 1. This winds up being much faster and simpler than my original solution to part 2.

### Day 15 (1184 / 831)

I was in bed at 11:50 PM, wasn't _totally_ tired and figured this might just be my opportunity to do an Advent of Code puzzle when it came out. It was exciting to see the "15" on the calendar fade in at midnight.

Doing this one at midnight made it much more of an emotional rollercoaster. If I didn't get my stars, I would have cost myself a good night of sleep for no reason! Debugging off-by-one errors while you're sleepy is no fun. This isn't something I've done since college.

I had an off-by-one on part 1 because I didn't realize that one end of the span for each sensor/beacon pair could possibly be a beacon (it's an inclusive interval) and I needed to just not overwrite the beacons. This probably cost me 10–15 minutes of debugging on part 1.

For part 2, I realized quickly that I needed to separate the x and y search. I'd hoped that a single sensor might be enough to exclude an entire y value, but it wasn't. So I switched to tracking a set of disjoint intervals, which worked perfectly to eliminate all but one y. I had some more confusion at this point where I thought I needed to feed that y value back into part 1. But actually finding the x value was much simpler. I just needed to print the two intervals and use the x value that was in between them.

Overall I really liked this problem! And I was very happy to see AoC report my overall ranking, I think that's my first time cracking the top 1,000.

- Start: 00:00:00
- ⭐️: 00:26:51
- ⭐️⭐️: 00:51:12

### Day 14 (17110 / 15870)

Ironically, I'd done days 1–16 of 2018's Advent of Code before today, but this problem references day 17! I think the problems are different enough that it didn't really matter in the end. Probably the biggest time waste on this problem was debugging an existing issue in my `Grid` class's `format` method.

Paired with @mshron on this one. He said that having helpers (especially the `Grid` class), not worrying too much about code efficiency / compactness, and speed at debugging finnicky things really helped me with my time vs. how he does these.

- Start: 07:18:37
- ⭐️: 07:46:27 (28m)
- ⭐️⭐️: 07:54:17 (36m)

### Day 13 (16516 / 15428)

One of the rare cases where passing a `compare` function to `sort` is more convenient than passing a `key` function. Very convenient that the inputs are all valid JSON.

I ran into some trouble with a stack overflow on part 2. I wasted some time trying to increase the stack size before realizing that I'd forgotten to `JSON.parse` the packets and was comparing the strings.

- Start: 07:24:14
- ⭐️: 07:34:59 (11m)
- ⭐️⭐️: 07:41:53 (18m)

### Day 12 (18690 / 17813)

I regret not preemptively implementing Dijkstra!

I was happy I'd implemented a `Grid` class yesterday for 2018 day 13. Representing a grid as a `dict` with `(x, y)` tuples for keys is [one of my favorite tricks in Python][1] but it doesn't work very well in JS/TS since `[number, number]` doesn't work well as a `Map` key (it uses reference equality, not structural equality). The records/tuples proposal would help immensely here. Hence my `Grid` class, which uses a `Map<string, T>` internally and does all the `string` ↔ `[number, number]` mapping for you.

My Dijkstra is a hack, but good enough. For part 2, implementing a search out from the end point would be more efficient, but I was relieved that iterating over all the `a` start points wound up being fast enough.

- Start: 08:12:08
- ⭐️: 08:34:38 (22m)
- ⭐️⭐️: 08:38:39 (26m)

[1]: https://danvdk.medium.com/python-tips-tricks-for-the-advent-of-code-2019-89ec23a595dd

### Day 11 (27219 / 19839)

Got my first stack trace from Deno -- quite ugly! Was trying to do math on `undefined`.

My answers on part two were slightly off. Turns out it's loss of precision on `new = old * old`. Time to bust out `BigInt`!

... or not!

    error: Uncaught RangeError: Maximum BigInt size exceeded
        op = (old: bigint) => old * old;
                            ^

Fortunately all the "test" divisors are prime, so you can just multiply them all and do the arithmetic in a ring. This was the first day that required some thought on part 2.

- Start: 08:13:19
- ⭐️: 08:32:41 (19m)
- ⭐️⭐️: 08:51:19 (38m)

### Day 10 (32665 / 28284)

IntCode returns?? Union types are a great way to represent commands.

I got tripped up on part two by confusing which index was x and which was y on my display.

Star 1: 8 minutes
Star 2: 24 minutes

### Day 9 (31369 / 23800)

Key part for part 2 today was to realize that the tail's movement is independent of the head's movement. Rather, it's just a function of the head and tail's position. I was very happy that my solution just worked the first time on this one, I think it would have been a PITA to debug.

Star 1: ~23 minutes
Star 2: ~40 minutes

### Day 8 (41149 / 34438)

Good opportunity to implement `transpose` in part 1. I thought part 2 was easier than part 1, though I'm curious why `3a494d6` gave me an infinite loop until I refactored it from a `for` loop to a `while` loop.

Star 1: ~11 minutes
Both: ~20 minutes

### Day 7 (35036 / 33194)

Eerily reminiscent of one of Sidewalk's interview questions! Storing a pointer to the parent node was helpful for that question, and was also a good strategy here.

### Day 6 (62854 / 61636)

I got the samples wrong on part two but the answer right. What's going on?

Here was the bug:

```
 function findFirstMarker(chars: readonly string[], n: number): number {
-  for (let i = n - 1; i < chars.length; i++) {
+  for (let i = 0; i < chars.length - n; i++) {
     const s = new Set(chars.slice(i, i + n));
```

So if the first marker was in the first N characters, I'd miss it, which is much more likely to happen in the sample inputs than the real input.

For kicks, I also added a linear implementation that performs the same regardless of sliding window length.

Deno's aggressive autocomplete when you hit the `,` key is quite annoying. Filed <https://github.com/denoland/vscode_deno/issues/757>.

### Day 5 (49161 / 47164)

Immediate reaction after seeing the input: "crap, they're going to make us do Towers of Hanoi on day 5!?" Fortunately not but maybe that will come later.

My parser was pretty half-assed, but even so, converting the inputs to JSON might have been the speedier move today.

The only tricky bit today was remembering which direction all your arrays went. Was zero the top or the bottom?

### Day 4 (68911 / 66646)

Saw the clock was midnight when I was going to bed last night and thought about opening up AoC. But I couldn't find my laptop so I just went to bed. Probably the right decision!

I remember that there's a simple expression for whether two intervals overlap, but it always takes some head scratching to remember what that expression is.

[deno_dom](https://deno.land/x/deno_dom@v0.1.36-alpha) is nice. I used it today to make my setup script write out all the code samples to text files.

### Day 3 (58736 / 53036)

Had a few off-by-one errors, as well as an off-by-26 error.

### Day 2 (69695 / 64681)

An opportunity to use one of my favorite tricks: exhaustiveness checking with a cross product of unions using template literal types.

### Day 1 (58706 / 55390)

Reading the input file into "chunks" has been a theme in past years, too.
I got a wrong answer on part two because of an annoying JS footgun:

```ts
declare let sums: number[];
sums.sort();  // sorts sums lexicographically!
```

Reference for using lodash with Deno: <https://github.com/lodash/lodash/issues/5411>. Getting types seems like a real headache https://stackoverflow.com/a/66073607/388951.

Solution via Twitter https://twitter.com/brenelz/status/1598503663097503744

```ts
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";
```

## Setup

https://deno.land/manual@v1.28.2/getting_started/setup_your_environment

    $ brew install deno
    $ deno --version
    deno 1.28.2 (release, aarch64-apple-darwin)
    v8 10.9.194.1
    typescript 4.8.3

Hopefully they release a new version with TS 4.9 soon, so I can try `satisfies`.

There's a plugin for VS Code, as well as for zsh completions.

Deno's non-web APIs are documented at <https://deno.land/api@v1.28.2>

Do you actually have to specify a version number for all std imports? This seems crazy. <https://deno.land/manual@v1.28.2/getting_started/first_steps#reading-a-file>

```ts
import { copy } from "https://deno.land/std@0.166.0/streams/conversion.ts";
```

I got an error on this in VS Code until I used the "Quick Fix" to cache it.

Ah!

> Since it can be unwieldy to import URLs everywhere, best practice is actually to import and re-export your external libraries into a central deps.ts file

The marketing is that `deps.ts` serves the same role as `package.json`.

There are some slightly weird things about the tutorial, e.g. referring to the author's personal website and an unused variable in this example <https://deno.land/manual@v1.28.2/getting_started/first_steps#putting-it-all-together-in-an-http-server>. Filed <https://github.com/denoland/manual/issues/464>.

Some of the example in docs look like this:

```ts
import { copy } from "https://deno.land/std@$STD_VERSION/streams/conversion.ts";
```

Is `$STD_VERSION` actual syntax or is the idea that you fill this in yourself?

This may be a helpful reference for debugging Deno code in VSCode <https://deno.land/manual@v1.12.2/getting_started/debugging_your_code#vscode>.

- "All APIs that are not web standard are contained in the global Deno namespace."
- You can use threads via Web Workers <https://deno.land/manual@v1.12.2/runtime/workers>
- Modules are cached in `~/Library/Caches/deno`
- You can use `deno --no-check` to skip type-checking
- Deno runs TypeScript with `--strict` by default
- Deno always runs TypeScript with the `isolatedModules` option.
- Deno uses `swc` under the hood so it doesn't support `const enum` and other runtime features
- Deno supports top-level `await`
- You can spawn subprocesses with `Deno.run`
- Reference for built-in unit test runner https://deno.land/manual@v1.12.2/testing
- Deno has built-in code coverage tools. I should look at `genhtml` https://deno.land/manual@v1.12.2/testing/coverage
- You get a REPL with `deno repl`
- Deno has a standard code formatter (`deno fmt`)
- `deno info file.ts` will print all the transitive dependencies it pulls in
- `deno lint` is a built-in linter. This seems to be a Rust rewrite of the recommended eslint rules with a goal of being very fast.

## Questions

- Is the `deps.ts` system ubiquitous? Do people also create a `devDeps.ts`?
- What are some large projects built using Deno?
- Is it typical to use lodash with Deno? Is there a more Deno-y equivalent?
- Is there a deno equivalent of a shebang line?

## Notes

I'm using `Set` and `Map` a lot more than I usually do. One footgun is that `key in set` does not work like you'd hope.
I'm thinking that <code>obj[`${x},${y}`]</code> is the JS equivalent of a Python dict keyed by `(x, y)` tuples.

## Background

My first recollection of Deno is from a talk at tsconf 2019. My mental model is "an attempt to redo Node.js with the benefit of hindsight." I liked Deno's approach to security (you can't do much without explicit permissions) but I also remember having some questions about how transitive dependencies would work.

When they announced deno.land, I was briefly bummed that someone else had already published a CSV parser (a perennial interest of mine and a source of dissatisfaction with Node.js). Then I realized I had no interest in maintaining a CSV parser for a runtime I didn't actively use.

I'm interested in Deno as "a new way to TypeScript" and curious to what extent it feels different than Node. My sense is that they've converged a bit over the past few years since Node now includes more web-compatible APIs like `fetch`.

I'm also curious to use JS / TS for more numerical, performance-sensitive work. My sense is that it's not as nice as Python for this sort of thing, but it will be a new domain for me to use a familiar language. Plus, I haven't been writing much TypeScript (or code in general) the past few months, and I'd like to get back into it!

## Overview

- Deno
  - The low config dream really is true.
  - I like that the linter is on by default, as is strict mode.
  - The editor integration needs some work.
  - Mostly it doesn't feel that different, which I think they would say is a win.
  - As a follow-up, I'd like to try using a service worker to get some parallelism.
- JS thoughts
  - Map/Set will be nicer with tuples
  - The object/dict thing is really the original sin of JS
  - Iterables/generators are quite nice.
    When you write `T[]`, could you write `Iterable<T>`?
  - No operator overloading means no DSLs -- can't implement `operator+` for `Coord`, for example.
  - My `Grid` class was a godsend, but the constant serialization/deserialization makes it pretty annoying to work with (and presumably slower than necessary).
  - Dijkstra
    - As always, implementing a very generic Dijkstra is very helpful.
    - I was happy with my `flood` variation as well, and how it was able to do some things I hadn't expected when I first wrote it.
    - I implemented Dijkstra by sorting the frontier before removing an element because I figured this was slow but clearly correct and wouldn't matter too much in practice. That was mostly true, but with some glaring exceptions. When I plugged in a binary heap instead I saw some huge speedups:
    - Day 24 3:32.63 -> 12.259
    - y2018 day22: 4:21.56 -> 3.152
    So note to self: use a priority queue!
  - Tay pointed out that when your distance is always 1, Dijkstra is just bread-th first search. For that, you just need a plain old queue. I assume JS arrays are bad for this, maybe use a linked list? It would be an interesting exercise to have a specialized Dijkstra for BFS that shares as much code as possible.
    - Using a simple array for Dijkstra outperforms a binary heap. V8 must optimize `Array.prototype.shift`.
  - `flood` is mostly `dijkstra` with no goal and you return more information (the distance to every node).
- AoC thoughts:
  - No matrix math this year
  - As before, very heavy on Dijkstra / BFS! I enjoyed some of the creative takes on Dijkstra like day 24.
  - Day 16 (valves), Day 19 (robot factories), Day 22 (cube) were the hardest
  - A thing I learned about this year was Beam search.
  - Having a setup script was really nice.
  - But overall, pretty easy -- I think easier than 2018 which I did simultaneously.

Deno debugger notes:

- You can run with `--v8-flags=--prof` to get a profile, but the lines numbers don't match up.
- You also need to run with `--inspect-brk` to get them.

[post]: https://effectivetypescript.com/2023/04/27/aoc2022/
