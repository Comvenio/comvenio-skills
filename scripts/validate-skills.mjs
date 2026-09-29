import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

// Optional first argument: another repository root (used by the fixture tests).
const repositoryRoot = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = path.join(repositoryRoot, "skills");
const catalogFile = path.join(repositoryRoot, "catalog", "actions.json");
const errors = [];

// Command surface after the device token removal: the only comvenio commands a
// skill may name. Everything else (classic domain commands, agent approval,
// function, automation, schema) ends in a usage error.
const COMMAND_SURFACE = {
  login: null,
  logout: null,
  whoami: null,
  action: new Set(["list", "call", "confirm"]),
  agent: new Set(["chat"]),
  finance: null,
  help: null,
};

// Marks a deliberate counter-example ("nicht mehr verfügbar"): on a line of its
// own and directly followed (blank lines allowed) by a fenced code block, it
// exempts the commands of that block from the check. A mark without such a
// block is a finding of its own.
const EXCEPTION_MARK = "<!-- klassisch-beispiel -->";

// A comvenio command: program name, command and optional subcommand.
const COMMAND_PATTERN = /(?<![\w-])comvenio\s+([a-z][a-z-]*)(?:\s+([a-z][a-z-]*))?/;

// A missing or unreadable catalog is a tool failure (exit 2), never a green run.
let knownActions;
try {
  const catalog = JSON.parse(fs.readFileSync(catalogFile, "utf8"));
  if (!Array.isArray(catalog.actions) || catalog.actions.length === 0) {
    throw new Error("keine Actions im Katalog");
  }
  knownActions = new Set(catalog.actions.map((action) => action.id));
} catch (error) {
  console.error(`Werkzeugfehler: Action-Katalog ${catalogFile} fehlt oder ist unlesbar (${error.message}).`);
  console.error("Katalog erneuern: node scripts/sync-action-catalog.mjs <pfad-zu-comvenio-cli> --ref origin/main");
  process.exit(2);
}

function listFiles(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return listFiles(fullPath);
      return /\.(md|json)$/.test(entry.name) ? [fullPath] : [];
    })
    .sort();
}

// Joins shell continuation lines the way the shell does: a line ending in an
// odd number of backslashes continues on the next line, and the backslash and
// the line break are dropped. "cai.club.03.settings\" followed by "_other"
// therefore becomes one identifier, "--device-\" followed by "token" one flag.
// Returns logical lines, each with the number of its first physical line.
function joinContinuations(lines, firstLine) {
  const logical = [];
  let current = null;
  lines.forEach((line, index) => {
    const text = current ? current.text + line : line;
    const start = current ? current.line : firstLine + index;
    const trailing = text.match(/\\+$/)?.[0].length ?? 0;
    if (trailing % 2 === 1) {
      current = { line: start, text: text.slice(0, -1) };
    } else {
      logical.push({ line: start, text });
      current = null;
    }
  });
  if (current) logical.push(current);
  return logical;
}

// Splits a file into the text the checks see.
// - commands: where a comvenio command may stand. Markdown: fenced blocks
//   (continuations joined) and inline code; the program name is matched in any
//   case there. JSON: backtick spans inside strings (any case) and the rest of
//   each string, which is prose, so only the lower-case program name counts
//   there ("Comvenio die Plattformseite" is a sentence, not a command).
// - texts: everything the input, token and action checks read. Markdown: each
//   prose line, and each fenced block as one text of its joined lines (a quoted
//   --input may span lines). JSON: every string, decoded (escaped quotes
//   resolved) and with continuations joined. `starts` holds the physical line
//   of each logical line of a text.
function scanFile(text, isJson, report) {
  const commands = [];
  const texts = [];

  if (isJson) {
    let line = 1;
    let position = 0;
    for (const literal of text.matchAll(/"(?:[^"\\\r\n]|\\.)*"/g)) {
      line += (text.slice(position, literal.index).match(/\n/g) ?? []).length;
      position = literal.index;
      let value;
      try {
        value = JSON.parse(literal[0]);
      } catch {
        value = literal[0].slice(1, -1);
      }
      const joined = joinContinuations(value.split(/\r?\n/), line)
        .map((logical) => logical.text)
        .join("\n");
      texts.push({ starts: [line], text: joined });
      for (const span of joined.matchAll(/`([^`]+)`/g)) {
        commands.push({ line, text: span[1], exempt: false, anyCase: true });
      }
      commands.push({ line, text: joined.replace(/`[^`]*`/g, " "), exempt: false, anyCase: false });
    }
    return { commands, texts };
  }

  const lines = text.split(/\r?\n/);
  let fence = null;
  let pendingMark = null;
  const flushFence = () => {
    const logicals = joinContinuations(fence.body, fence.start);
    for (const logical of logicals) {
      commands.push({ ...logical, exempt: fence.exempt, anyCase: true });
    }
    texts.push({ starts: logicals.map((logical) => logical.line), text: logicals.map((logical) => logical.text).join("\n") });
    fence = null;
  };
  const dropMark = () => {
    report(pendingMark, "ausnahmemarke-ohne-block", EXCEPTION_MARK);
    pendingMark = null;
  };
  lines.forEach((line, index) => {
    const number = index + 1;
    if (/^\s*(```|~~~)/.test(line)) {
      if (!fence) {
        fence = { exempt: pendingMark !== null, body: [], start: number + 1 };
        pendingMark = null;
      } else {
        flushFence();
      }
      return;
    }
    if (fence) {
      fence.body.push(line);
      return;
    }
    if (line.trim() === EXCEPTION_MARK) {
      if (pendingMark !== null) dropMark();
      pendingMark = number;
      return;
    }
    if (pendingMark !== null && line.trim() !== "") dropMark();
    texts.push({ starts: [number], text: line });
    for (const match of line.matchAll(/`([^`]+)`/g)) {
      commands.push({ line: number, text: match[1], exempt: false, anyCase: true });
    }
  });
  if (fence) flushFence();
  if (pendingMark !== null) dropMark();
  return { commands, texts };
}

// Payloads of every --input form: --input '…', --input "…" (escaped quotes
// resolved), --input=… and an unquoted word. Each payload keeps the offset of
// its first character in the text.
function inputPayloads(text) {
  const payloads = [];
  for (const flag of text.matchAll(/--input(?:\s+|=)/g)) {
    const offset = flag.index + flag[0].length;
    const rest = text.slice(offset);
    if (rest.startsWith("'")) {
      const end = rest.indexOf("'", 1);
      payloads.push({ offset: offset + 1, text: rest.slice(1, end < 0 ? undefined : end) });
    } else if (rest.startsWith('"')) {
      const quoted = rest.match(/^"((?:[^"\\]|\\.)*)/s)[1];
      payloads.push({ offset: offset + 1, text: quoted.replace(/\\(["\\$`])/g, "$1") });
    } else {
      payloads.push({ offset, text: rest.match(/^\S*/)[0] });
    }
  }
  return payloads;
}

function checkCommands(skill, file, text) {
  const relative = path.relative(repositoryRoot, file);
  const report = (line, art, fundtext) => errors.push(`${skill}: ${relative}:${line} ${art} ${fundtext}`);
  const { commands, texts } = scanFile(text, file.endsWith(".json"), report);

  for (const segment of commands) {
    if (segment.exempt) continue;
    const pattern = new RegExp(COMMAND_PATTERN.source, segment.anyCase ? "gi" : "g");
    for (const match of segment.text.matchAll(pattern)) {
      const whole = match[0].trim().replace(/\s+/g, " ");
      const command = match[1].toLowerCase();
      const subcommand = match[2]?.toLowerCase();
      if (!Object.hasOwn(COMMAND_SURFACE, command)) {
        report(segment.line, "befehl-ausserhalb-der-flaeche", whole);
        continue;
      }
      const allowed = COMMAND_SURFACE[command];
      if (allowed && subcommand && !allowed.has(subcommand)) {
        report(segment.line, "befehl-ausserhalb-der-flaeche", whole);
      }
    }
  }

  for (const segment of texts) {
    const lineAt = (offset) => {
      const index = (segment.text.slice(0, offset).match(/\n/g) ?? []).length;
      return segment.starts[Math.min(index, segment.starts.length - 1)];
    };
    // --input may never carry club_id or confirmation; the sign-in binds the
    // club and action confirm carries the confirmation.
    for (const payload of inputPayloads(segment.text)) {
      for (const field of payload.text.matchAll(/\\?"(club_id|confirmation)\\?"\s*:/g)) {
        report(lineAt(payload.offset), "input-feld-verboten", field[1]);
      }
    }
    for (const match of segment.text.matchAll(/--device-token|\bcvn_[A-Za-z0-9_]*|\bdevice[- _]?token\b/gi)) {
      report(lineAt(match.index), "geraetetoken", match[0]);
    }
    for (const match of segment.text.matchAll(/(?<![\w.])cai\.[a-z][a-z0-9-]*(?:\.[a-z0-9_-]+)+/g)) {
      const id = match[0].replace(/[.-]+$/, "");
      if (!knownActions.has(id)) {
        report(lineAt(match.index), "action-unbekannt", id);
      }
    }
  }
}

if (!fs.existsSync(skillsRoot)) {
  errors.push("Der Ordner skills/ fehlt.");
}

const skillDirectories = fs.existsSync(skillsRoot)
  ? fs
      .readdirSync(skillsRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
  : [];

if (skillDirectories.length === 0) {
  errors.push("Es wurden keine Skills gefunden.");
}

for (const directoryName of skillDirectories) {
  const skillRoot = path.join(skillsRoot, directoryName);
  const readmeFile = path.join(skillRoot, 'README.md');
  const skillFile = path.join(skillRoot, "SKILL.md");
  const evalFile = path.join(skillRoot, "evals", "evals.json");

  if (!fs.existsSync(skillFile)) {
    errors.push(`${directoryName}: SKILL.md fehlt.`);
    continue;
  }

  const content = fs.readFileSync(skillFile, "utf8");
  if (!fs.existsSync(readmeFile)) {
    errors.push(directoryName + ': README.md fehlt.');
  } else {
    const readme = fs.readFileSync(readmeFile, 'utf8');
    if (!readme.startsWith('# ')) {
      errors.push(directoryName + ': README.md braucht eine Kundenüberschrift.');
    }
    if (!readme.includes('Bestätigung') && !readme.includes('bestätig')) {
      errors.push(directoryName + ': README.md erklärt die Freigabegrenzen nicht.');
    }
  }

  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!frontmatter) {
    errors.push(`${directoryName}: gültiges YAML-Frontmatter fehlt.`);
    continue;
  }

  const name = frontmatter[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  if (name !== directoryName) {
    errors.push(
      `${directoryName}: Frontmatter-Name "${name ?? ""}" stimmt nicht mit dem Verzeichnis überein.`,
    );
  }

  if (!/^description:\s*(>|\|)?.*$/m.test(frontmatter[1])) {
    errors.push(`${directoryName}: description fehlt.`);
  }

  if (content.split(/\r?\n/).length > 500) {
    errors.push(`${directoryName}: SKILL.md überschreitet 500 Zeilen.`);
  }

  for (const requiredText of ["comvenio whoami --json", "comvenio action list", "--json", "Bestätigung"]) {
    if (!content.includes(requiredText)) {
      errors.push(`${directoryName}: Pflichtinhalt "${requiredText}" fehlt.`);
    }
  }

  const forbiddenPatterns = [
    [/api\.comvenio\.app/i, "direkte API-URL"],
    [/\bcurl\b/i, "curl"],
    [/Invoke-RestMethod/i, "Invoke-RestMethod"],
    [/\bfetch\s*\(/i, "fetch"],
    [/\brequests\./i, "Python requests"],
  ];

  for (const [pattern, label] of forbiddenPatterns) {
    if (pattern.test(content)) {
      errors.push(`${directoryName}: verbotener API-Ausweg gefunden (${label}).`);
    }
  }

  for (const file of listFiles(skillRoot)) {
    checkCommands(directoryName, file, fs.readFileSync(file, "utf8"));
  }

  if (!fs.existsSync(evalFile)) {
    errors.push(`${directoryName}: evals/evals.json fehlt.`);
    continue;
  }

  let evalDocument;
  try {
    evalDocument = JSON.parse(fs.readFileSync(evalFile, "utf8"));
  } catch (error) {
    errors.push(`${directoryName}: evals.json ist ungültig (${error.message}).`);
    continue;
  }

  if (evalDocument.skill_name !== directoryName) {
    errors.push(`${directoryName}: skill_name in evals.json stimmt nicht überein.`);
  }

  if (!Array.isArray(evalDocument.evals) || evalDocument.evals.length < 3) {
    errors.push(`${directoryName}: mindestens drei Eval-Fälle sind erforderlich.`);
    continue;
  }

  const ids = new Set();
  for (const evaluation of evalDocument.evals) {
    if (!Number.isInteger(evaluation.id) || ids.has(evaluation.id)) {
      errors.push(`${directoryName}: Eval-IDs müssen eindeutig und ganzzahlig sein.`);
    }
    ids.add(evaluation.id);

    if (!evaluation.prompt || !evaluation.expected_output) {
      errors.push(`${directoryName}: Prompt oder erwartete Ausgabe fehlt.`);
    }
    if (!Array.isArray(evaluation.expectations) || evaluation.expectations.length < 3) {
      errors.push(`${directoryName}: jeder Eval-Fall braucht mindestens drei Erwartungen.`);
    }
  }
}

for (const file of ["README.md", "AGENTS.md", "CONTRIBUTING.md"]) {
  const fullPath = path.join(repositoryRoot, file);
  if (fs.existsSync(fullPath)) {
    checkCommands("(Repository)", fullPath, fs.readFileSync(fullPath, "utf8"));
  }
}

if (errors.length > 0) {
  console.error("Skill-Validierung fehlgeschlagen:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`${skillDirectories.length} Comvenio Skills erfolgreich validiert.`);
