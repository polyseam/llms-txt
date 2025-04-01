import { llmsTxt } from "./src/llms-txt.ts";

if (import.meta.main) {
  console.log();
  await llmsTxt();
  console.log();
}
