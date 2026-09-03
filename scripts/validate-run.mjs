import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROUTING_MARKERS = [
  "Off-home",
  "Dense game",
  "Conflicts",
  "Audit reopen",
  "Audit must reopen",
  "operator splits",
  "Scout does not propose",
  "not previously carded",
  "not a flip",
];

function splitMarkdownRow(line) {
  const cells = [];
  let cell = "";

  for (let index = 1; index < line.length - 1; index += 1) {
    const character = line[index];
    if (character === "|" && line[index - 1] !== "\\") {
      cells.push(cell.trim().replaceAll("\\|", "|"));
      cell = "";
    } else {
      cell += character;
    }
  }

  cells.push(cell.trim().replaceAll("\\|", "|"));
  return cells;
}

function isSeparatorRow(cells) {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function isEmptyPlaceholder(row) {
  const id = row.pundit || row.proposedId || "";
  return !id || /^\*?\(empty\)\*?$/i.test(id);
}

function wordCount(value) {
  return value.trim() ? value.trim().split(/\s+/u).length : 0;
}

function rowLabel(filePath, row) {
  const id = row.pundit || row.proposedId || "unknown";
  const event = row.eventSlug || "unmapped";
  return `${filePath}:${row.line} ${row.pass} ${row.section} ${id}/${event}`;
}

export function parseRunFile(contents) {
  const lines = contents.split(/\r?\n/u);
  const rows = [];
  let pass = "";
  let section = "";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^##\s+/.test(line)) pass = line.replace(/^##\s+/, "").trim();
    if (/^###\s+(Intake|Candidates)\s*$/i.test(line)) {
      section = line.replace(/^###\s+/, "").trim();
      continue;
    }
    if (/^###\s+/.test(line)) {
      section = "";
      continue;
    }
    if (!section || !line.startsWith("|") || !line.endsWith("|")) continue;

    const headers = splitMarkdownRow(line);
    const normalized = headers.map((header) => header.toLowerCase());
    const idHeader = section.toLowerCase() === "intake" ? "pundit" : "proposedid";
    if (!normalized.includes(idHeader) || !normalized.includes("verbatim quote")) continue;

    const separator = lines[index + 1];
    if (!separator?.startsWith("|") || !isSeparatorRow(splitMarkdownRow(separator))) continue;

    for (let rowIndex = index + 2; rowIndex < lines.length; rowIndex += 1) {
      const rowLine = lines[rowIndex];
      if (!rowLine.startsWith("|") || !rowLine.endsWith("|")) break;
      const cells = splitMarkdownRow(rowLine);
      if (cells.length !== headers.length) break;
      const reasoningIndex = normalized.indexOf("reasoning");
      const noteIndex = normalized.indexOf("note");
      const row = {
        line: rowIndex + 1,
        pass,
        section,
        hasNoteColumn: noteIndex >= 0,
        noteAfterReasoning: reasoningIndex >= 0 && noteIndex === reasoningIndex + 1,
      };
      for (let cellIndex = 0; cellIndex < headers.length; cellIndex += 1) {
        const key = headers[cellIndex].trim().replace(/\s+(.)/gu, (_, letter) => letter.toUpperCase());
        row[key] = cells[cellIndex];
      }
      if (!isEmptyPlaceholder(row)) rows.push(row);
    }
  }

  return rows;
}

export function validateRunContents(
  contents,
  { filePath = "run.md", eventSlugs = [], allowLegacySchema = false } = {}
) {
  const errors = [];
  const knownEvents = new Set(eventSlugs);
  const seenMappedRows = new Map();

  for (const row of parseRunFile(contents)) {
    const label = rowLabel(filePath, row);
    const reasoning = row.reasoning || "";
    const quote = row.verbatimQuote || "";
    const eventSlug = row.eventSlug || "";
    const side = (row.side || "").toLowerCase();
    const sourceUrl = row.sourceUrl || "";
    const sourceDate = row.sourceDate || "";

    if ((!row.hasNoteColumn || !row.noteAfterReasoning) && !allowLegacySchema) {
      describeError(errors, label, "Intake and Candidates tables must include note after reasoning");
    }

    if (wordCount(reasoning) > 60) {
      describeError(errors, label, `reasoning has ${wordCount(reasoning)} words; maximum is 60`);
    }
    if (/[\r\n]/u.test(reasoning) || /<br\s*\/?\s*>/iu.test(reasoning)) {
      describeError(errors, label, "reasoning must be a single paragraph");
    }
    if (row.hasNoteColumn) {
      for (const marker of ROUTING_MARKERS) {
        if (reasoning.toLowerCase().includes(marker.toLowerCase())) {
          describeError(errors, label, `reasoning contains routing marker "${marker}"; move it to note`);
        }
      }
    }

    if (!quote) describeError(errors, label, "verbatim quote is required");
    if (row.hasNoteColumn && /^Overflow:\s*/iu.test(quote)) {
      describeError(errors, label, "verbatim quote must not start with an Overflow label; move it to note");
    }

    if (eventSlug) {
      if (!new Set(["yes", "no"]).has(side)) {
        describeError(errors, label, "mapped row side must be yes or no");
      }
      if (knownEvents.size > 0 && !knownEvents.has(eventSlug)) {
        describeError(errors, label, `eventSlug "${eventSlug}" does not exist in data/events.json`);
      }
    } else if (side) {
      describeError(errors, label, "unmapped row side must be blank");
    }

    if (!/^\d{4}-\d{2}-\d{2}$/u.test(sourceDate)) {
      describeError(errors, label, "sourceDate must match YYYY-MM-DD");
    }
    if (!sourceUrl) {
      describeError(errors, label, "sourceUrl is required");
    } else if (/^X pass\b/iu.test(row.pass) && !/^https?:\/\/(?:www\.)?(?:x|twitter)\.com\/[^/]+\/status\/\d+(?:[/?#].*)?$/iu.test(sourceUrl)) {
      describeError(errors, label, "X row sourceUrl must be an x.com/<handle>/status/<id> or twitter.com equivalent");
    }

    if (eventSlug) {
      const id = row.pundit || row.proposedId;
      const duplicateKey = `${id}\u0000${eventSlug}`;
      if (seenMappedRows.has(duplicateKey)) {
        describeError(errors, label, `duplicates ${id}/${eventSlug} from line ${seenMappedRows.get(duplicateKey)}`);
      } else {
        seenMappedRows.set(duplicateKey, row.line);
      }
    }
  }

  return errors;
}

function describeError(errors, label, check) {
  errors.push(`${label}: ${check}`);
}

function markdownFiles(targetPath) {
  if (!statSync(targetPath).isDirectory()) return [targetPath];
  return readdirSync(targetPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(targetPath, entry.name));
}

export function validateRunPath(targetPath, { root = process.cwd() } = {}) {
  const resolvedTarget = path.resolve(root, targetPath);
  if (!existsSync(resolvedTarget)) throw new Error(`Run path does not exist: ${targetPath}`);

  const eventsPath = path.resolve(root, "data", "events.json");
  const eventsDocument = existsSync(eventsPath)
    ? JSON.parse(readFileSync(eventsPath, "utf8"))
    : [];
  const events = Array.isArray(eventsDocument) ? eventsDocument : eventsDocument.events || [];
  const eventSlugs = events.map((event) => event.slug);
  const errors = [];

  for (const file of markdownFiles(resolvedTarget)) {
    const displayPath = path.relative(root, file) || file;
    const datedName = path.basename(file).match(/^(\d{4}-\d{2}-\d{2})/u);
    const allowLegacySchema = Boolean(datedName && datedName[1] < "2026-09-03");
    errors.push(
      ...validateRunContents(readFileSync(file, "utf8"), {
        filePath: displayPath,
        eventSlugs,
        allowLegacySchema,
      })
    );
  }

  return errors;
}

export function runCli(argv = process.argv.slice(2)) {
  if (argv.length !== 1) {
    console.error("Usage: node scripts/validate-run.mjs <run-file-or-directory>");
    return 2;
  }

  const errors = validateRunPath(argv[0]);
  if (errors.length > 0) {
    console.error(`Run validation failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`- ${error}`);
    return 1;
  }

  console.log(`Run validation passed: ${argv[0]}`);
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  process.exitCode = runCli();
}
