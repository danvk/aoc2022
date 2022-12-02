#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/2

import { _ } from "../deps.ts";
import { assert, assertUnreachable, readLinesFromArgs } from "../util.ts";

type Play = 'rock' | 'paper' | 'scissors';
interface Game {
  me: Play;
  them: Play;
}

function readPlay(play: string): Play {
  if (play === 'A' || play === 'X') {
    return 'rock';
  } else if (play === 'B' || play === 'Y') {
    return 'paper';
  } else if (play === 'C' || play === 'Z') {
    return 'scissors';
  }
  throw new Error('Invalid move ' + play);
}

function readGame(line: string): Game {
  const parts = line.split(' ');
  assert(parts.length === 2);
  const [them, me] = parts;
  return {
    me: readPlay(me),
    them: readPlay(them),
  };
}

function readGameAlt(line: string): Game {
  const parts = line.split(' ');
  assert(parts.length === 2);
  const [themStr, myPlan] = parts;
  const them = readPlay(themStr);
  const myPoints = {
    X: 0,
    Y: 3,
    Z: 6,
  }[myPlan]!;
  for (const me of ['rock', 'paper', 'scissors'] as const) {
    if (outcome({them, me}) === myPoints) {
      return {them, me};
    }
  }
  throw new Error('invalid line: ' + line);
}

function outcome(game: Game): number {
  const {me, them} = game;
  const g: `${Play},${Play}` = `${me},${them}`;
  switch (g) {
    case 'paper,paper':
    case 'rock,rock':
    case 'scissors,scissors':
      return 3;
    case 'paper,rock':
    case 'rock,scissors':
    case 'scissors,paper':
      return 6;
    case 'rock,paper':
    case 'paper,scissors':
    case 'scissors,rock':
      return 0;
    default:
      assertUnreachable(g);
  }
}

function pointsForPlay(play: Play): number {
  if (play === 'rock') {
    return 1;
  } else if (play === 'paper') {
    return 2;
  } else if (play === 'scissors') {
    return 3;
  }
  assertUnreachable(play);
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const games = lines.map(readGame);
  const sum = _.sum(games.map(g => outcome(g) + pointsForPlay(g.me)));
  console.log('part 1', sum);

  const gamesAlt = lines.map(readGameAlt);
  const sum2 = _.sum(gamesAlt.map(g => outcome(g) + pointsForPlay(g.me)));
  console.log('part 2', sum2);
}
