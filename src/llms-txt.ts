import { cconsole } from "cconsole";
export type Link = {
  href: string;
  label: string;
  description?: string;
};

export class LlmsTxtError extends Error {
  override message: string;
  status: number;
  metadata: {
    [key: string]: unknown;
  };
  constructor(message: string, status: number, metadata = {}) {
    super(message);
    this.message = message;
    this.status = status;
    this.metadata = { ...metadata };
  }
}

export class LlmsTxtParseError extends LlmsTxtError {
}

export class LlmsTxtLoadError extends LlmsTxtError {
}

/**
 * Parses and represents the contents of a custom "llms.txt" formatted file.
 *
 * This class is responsible for processing a raw text input with a specific structure:
 * - The first line must be a title prefixed with "# ".
 * - The second line must be empty, acting as a separator.
 * - The third line may provide an optional summary if it starts with "> ".
 * - Subsequent lines are either extra information or sections specifying lists of markdown links.
 *
 * When encountering a section (a line starting with "## "), the parser collects bullet list entries (lines containing "- ")
 * and converts them to parsed Markdown link objects.
 *
 * @remarks
 * Parsing errors are thrown as {@link LlmsTxtParseError} if:
 * - The title does not start with "# " or is too short.
 * - The separator line (second line) is missing.
 * - There are multiple top-level headings.
 * - The summary block is incorrectly formatted when spanning multiple lines.
 *
 * @example
 * ```typescript
 * const rawText = `# My Project Title
 *
 * > A concise project summary
 *
 * Additional introductory text.
 *
 * ## Documentation
 * - [README](./README.md): Project overview document
 * - [CHANGELOG](./CHANGELOG.md): List of changes
 * `;
 *
 * const llmsTxt = new LlmsTxt(rawText);
 * console.log(llmsTxt.title);        // Outputs: "My Project Title"
 * console.log(llmsTxt.summary);       // Outputs: "A concise project summary"
 * console.log(llmsTxt.extraInfo);     // Outputs the extra introductory text
 * console.log(llmsTxt.linksLists);    // Outputs the parsed link sections
 * ```
 *
 * @public
 */
export class LlmsTxt {
  #rawText: string;
  title: string;
  summary: string | undefined;
  extraLines: string[];
  linksLists: Record<string, Link[]>;

  constructor(rawText: string) {
    this.#rawText = rawText;
    this.linksLists = {};

    const [t, blank, line3, line4, ...remainingLines] = this.#rawText.split(
      "\n",
    );

    if (!t?.startsWith("# ")) {
      throw new LlmsTxtParseError(
        'the first line of an "llms.txt" file must be a title beginning with "# "',
        1,
      );
    }

    if (t.length < 3) {
      throw new LlmsTxtParseError(
        `the first line of an "llms.txt" file must be at least 3 characters long`,
        2,
      );
    }

    if (blank !== "") {
      throw new LlmsTxtParseError(
        `the second line of an "llms.txt" file must be an empty separating the heading from the rest of the content`,
        3,
      );
    }

    this.title = t.slice(2);

    if (line3?.startsWith("> ")) {
      this.summary = line3.slice(2);
    }

    if (line4?.startsWith("> ")) {
      cconsole.warn('consider running "llms-txt fmt" before "llms-txt parse"');
      throw new LlmsTxtParseError(
        "blockquote summaries must be on a single line!",
        4,
      );
    }

    let filesListBeginsAtRemainingLineIndex = -1;

    if (Array.isArray(remainingLines)) {
      for (const line of remainingLines) {
        if (line.startsWith("## ")) {
          filesListBeginsAtRemainingLineIndex = remainingLines.indexOf(line);
          break;
        }
      }
    }

    this.extraLines = [];

    this.extraLines.push(
      ...remainingLines.slice(0, filesListBeginsAtRemainingLineIndex),
    );

    let cursor = "";

    const remainingLinesForFileLists = remainingLines.slice(
      filesListBeginsAtRemainingLineIndex,
    );

    for (const line of remainingLinesForFileLists) {
      if (line.startsWith("# ")) {
        throw new LlmsTxtParseError(
          "multiple top-level headings are not allowed",
          5,
        );
      }

      if (line.includes("## ")) {
        const [_, sectionName] = line.split("## ");
        cursor = sectionName;
        this.linksLists[cursor] = [];
      } else {
        const [_, listElement] = line.split("- ");
        if (listElement) {
          this.linksLists[cursor].push(this.#parseMarkdownLink(listElement));
        }
      }
    }
  }

  get extraInfo(): string {
    return this.extraLines.join("\n");
  }

  #parseMarkdownLink(
    link: string,
  ): Link {
    let label = "";
    let href = "";
    let description = "";
    label = link.split("[")[1].split("]")[0];
    href = link.split("(")[1].split(")")[0];
    description = link.split("): ")[1];

    const parsed: Link = {
      label: label,
      href: href,
    };

    if (description) {
      parsed.description = description;
    }

    if (label) {
      parsed.label = label;
    }
    if (href) {
      parsed.href = href;
    }

    return parsed;
  }

  toString(): string {
    return JSON.stringify(this, null, 2);
  }
}
