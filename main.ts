import { llmsTxt } from "./src/cli.ts";

if (import.meta.main) {
  console.log();
  await llmsTxt();
  console.log();
}
