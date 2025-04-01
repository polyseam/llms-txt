import { Command } from "@cliffy/command";
import * as path from "@std/path";

export type LLMSTxtLintResult = {
  ok: boolean;
  status: number;
  message: string;
  metadata?: {
    [key: string]: unknown;
  };
};

export const LLMSTxtLintResults: Record<number, LLMSTxtLintResult> = {
  0: { status: 0, message: "linting passed", ok: true },
  1: {
    message: "title missing",
    status: 1,
    ok: false,
  },
  2: {
    message: "title too short",
    status: 2,
    ok: false,
  },
  3: {
    message: "heading newline missing",
    status: 3,
    ok: false,
  },
  4: {
    message: "multi-line blockquote summary",
    status: 4,
    ok: false,
  },
  404: {
    message: "file not found",
    status: 404,
    ok: false,
  },
  500: {
    message: "failed to read file",
    status: 500,
    ok: false,
  },
};

export function lint(
  llmsTxtPath: string,
): LLMSTxtLintResult {
  try {
    const fileText = Deno.readTextFileSync(llmsTxtPath);
    const [heading, newline, byline, nextline, ..._rest] = fileText.split("\n");

    if (!heading.startsWith("# ")) {
      console.error(
        `the first line of an "llms.txt" file must begin with '# '`,
      );
      return LLMSTxtLintResults[1];
    }

    if (heading.length < 3) {
      console.error(
        `the first line of an "llms.txt" file must be at least 3 characters long`,
      );
      return LLMSTxtLintResults[2];
    }

    if (newline !== "") {
      console.error(
        `the second line of an "llms.txt" file must be an empty separating the heading from the rest of the content`,
      );
      return LLMSTxtLintResults[3];
    }

    if (byline.startsWith("> ")) {
      if (nextline.startsWith("> ")) {
        console.error("blockquote summaries must be on a single line!");
        console.error(
          `the second line of an "llms.txt" file must not begin with '> '`,
        );
        return LLMSTxtLintResults[4];
      }
    }
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.error(`File not found: ${llmsTxtPath}`);
      return LLMSTxtLintResults[404];
    }
    return {
      ...LLMSTxtLintResults[500],
      metadata: { llmsTxtPath },
    };
  }

  return LLMSTxtLintResults[0];
}

export const lintCommand = new Command().description(
  "lint llms.txt file.",
)
  .arguments("[dir:string]")
  .action((_options, dir) => {
    if (!dir) dir = Deno.cwd();
    const absPathToLlmsTxt = path.join(
      dir,
      dir.endsWith("llms.txt") ? "" : "llms.txt",
    );
    const result = lint(absPathToLlmsTxt);
    if (result.status !== 0) {
      Deno.exit(result.status);
    }
    return result;
  });
