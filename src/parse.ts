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

/**
 * Parses the content of an "llms.txt" formatted text file located at the specified path.
 *
 * This function attempts to synchronously read the file at the given `llmsTxtPath` using Deno. It handles
 * file reading errors by returning a `LlmsTxtLoadError`:
 * - If the file is not found, it returns an error with a 404 status code.
 * - For any other reading error, it returns an error with a 500 status code.
 *
 * After successfully reading the file, the function attempts to create a new `LlmsTxt` object. If the
 * parsing of the raw text fails, a `LlmsTxtParseError` is returned.
 *
 * @param llmsTxtPath - The filesystem path to the text file to be parsed.
 * @returns An instance of `LlmsTxt` if parsing is successful, or an instance of `LlmsTxtLoadError`
 *          or `LlmsTxtParseError` if an error occurs.
 */
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
