import { Command } from "@cliffy/command";
import * as path from "@std/path";
import { parse } from "src/parse.ts";
import { LlmsTxt } from "src/llms-txt.ts";

const parseCommand = new Command()
  .description(
    "parse llms.txt file.",
  )
  .arguments("[dir:string]")
  .action((_options, dir) => {
    if (!dir) dir = Deno.cwd();
    const absPathToLlmsTxt = path.join(
      dir,
      dir.endsWith("llms.txt") ? "" : "llms.txt",
    );
    const result = parse(absPathToLlmsTxt);
    if (result instanceof LlmsTxt) {
      Deno.exit(0);
    }
    if (result.status !== 0) {
      Deno.exit(result.status);
    }
    return result;
  });

export { parseCommand };
