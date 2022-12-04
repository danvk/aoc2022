import * as conversion from "https://deno.land/std@0.166.0/streams/conversion.ts";

const filenames = Deno.args;
for (const filename of filenames) {
  const file = await Deno.open(filename);
  await conversion.copy(file, Deno.stdout);
  file.close();
}
