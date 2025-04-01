import { Command } from "@cliffy/command";
import { parseCommand } from "src/commands/parse.ts";
import { fmtCommand } from "src/commands/fmt.ts";
import deno_json from "../deno.json" with { type: "json" };

export async function llmsTxt() {
  return await new Command()
    .name("llms-txt")
    .description("uility for parsing and formatting llms.txt files")
    .version(deno_json.version)
    .command("parse", parseCommand)
    .command("fmt", fmtCommand)
    .parse(Deno.args);
}
