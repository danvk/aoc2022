#!/usr/bin/env -S deno run --allow-read --allow-write
// https://adventofcode.com/2022/day/7

import { _ } from "../deps.ts";
import { assert, readLinesFromArgs, safeParseInt } from "../util.ts";

function extractCommands(lines: readonly string[]): string[][] {
  const out = []
  let cur: string[] = [];
  for (const line of lines) {
    if (line.startsWith('$')) {
      if (cur.length) {
        out.push(cur);
      }
      cur = [line];
    } else {
      cur.push(line);
    }
  }
  if (cur.length) {
    out.push(cur);
  }
  return out;
}

interface Directory {
  type: 'dir';
  name: string;
  parent: Directory;
  contents: Node[];
  totalSize?: number;
}
interface File {
  type: 'file';
  bytes: number;
  name: string;
}
type Node = Directory | File;
function isDir(n: Node): n is Directory {
  return n.type === 'dir';
}

function readDirectoryTree(commands: readonly string[][]): Directory {
  const root: Directory = {
    type: 'dir',
    name: '',
    parent: null!,
    contents: [],
  }
  root.parent = root;
  let cd = root;

  for (const chunk of commands) {
    const rawCommand = chunk[0];
    assert(rawCommand.startsWith('$ '));
    const command = rawCommand.slice(2);
    const output = chunk.slice(1);
    if (command.startsWith('cd ')) {
      assert(output.length === 0);
      const [, where] = command.split(' ');
      if (where === '/') {
        cd = root;
      } else if (where === '..') {
        cd = cd.parent;
      } else {
        const node = cd.contents.find(n => n.name === where);
        if (node) {
          // XXX why doesn't this narrow?
          // assert(node.type === 'dir');
          if (node.type !== 'dir') {
            throw new Error('Cannot cd into file: ' + where);
          }
          cd = node;
        }
      }
    } else if (command === 'ls') {
      for (const line of output) {
        const [desc, name] = line.split(' ');
        if (desc === 'dir') {
          cd.contents.push({
            type: 'dir',
            name,
            parent: cd,
            contents: [],
          });
        } else {
          cd.contents.push({
            type: 'file',
            name,
            bytes: safeParseInt(desc),
          })
        }
      }
    } else {
      throw new Error('Unknown command ' + command);
    }
  }

  return root;
}

function attachSizes(node: Directory): number {
  let sum = 0;
  for (const child of node.contents) {
    if (child.type === 'dir') {
      sum += attachSizes(child);
    } else {
      sum += child.bytes;
    }
  }
  node.totalSize = sum;
  return sum;
}

function part1(node: Directory, x: number): number {
  let sum = 0;
  if (node.totalSize && node.totalSize <= x) {
    sum += node.totalSize;
  }
  return sum + _.sum(node.contents.filter(isDir).map(n => part1(n, x)));
}

function allSizes(node: Directory): number[] {
  assert(node.totalSize);
  return [node.totalSize, ...node.contents.filter(isDir).map(allSizes).flat()];
}

function part2(root: Directory, totalSize: number): number {
  const sizes = _.sortBy(allSizes(root));
  console.log(sizes);
  for (const size of sizes) {
    if (totalSize - size <= (70000000 - 30000000)) {
      return size;
    }
  }
  return 0;
}

if (import.meta.main) {
  const lines = await readLinesFromArgs();
  const commands = extractCommands(lines);
  const root = readDirectoryTree(commands);
  const totalSize = attachSizes(root);
  console.log('total bytes', totalSize);
  console.log(root);
  console.log('part 1', part1(root, 100_000));
  console.log('part 2', part2(root, totalSize));
}
