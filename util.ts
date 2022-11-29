/** Read lines from a file specified as a command line argument */
export async function readLinesFromArgs(): Promise<string[]> {
    const [path] = Deno.args;

    // There's a std stream option for reading files line by line it feels like overkill here.
    // https://deno.land/std@0.166.0/streams/mod.ts?s=TextLineStream
    const contents = await Deno.readTextFile(path);
    const lines = contents.split('\n');

    // Ignore trailing newline if relevant
    if (lines[lines.length - 1] === '') {
        lines.pop();
    }
    return lines;
}
