import { LlmsTxt, LlmsTxtLoadError } from "./llms-txt.ts";
import type { LlmsTxtError, LlmsTxtParseError } from "./llms-txt.ts";

export type LLMSTxtParseResult = {
  ok: boolean;
  status: number;
  message: string;
  metadata?: {
    [key: string]: unknown;
  };
};

export function parse(
  llmsTxtPath: string,
): LlmsTxtError | LlmsTxt {
  let rawText = "";
  try {
    rawText = Deno.readTextFileSync(llmsTxtPath);
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      return new LlmsTxtLoadError("file not found", 404);
    } else {
      return new LlmsTxtLoadError(
        `failed to read file`,
        500,
      );
    }
  }

  try {
    const llmsTxt = new LlmsTxt(rawText);
    return llmsTxt;
  } catch (e) {
    const error = e as LlmsTxtParseError;
    return error;
  }
}
