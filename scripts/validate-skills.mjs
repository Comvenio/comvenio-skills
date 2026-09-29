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
// own, it exempts the commands of the next fenced code block from the check.
const EXCEPTION_MARK = "<!-- klassisch-beispiel -->";

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

// Code segments of a file: fenced blocks and inline code in Markdown; every
// line of a JSON file (eval texts are prose inside strings).
function codeSegments(text, isJson) {
  const lines = text.split(/\r?\n/);
  const segments = [];
  if (isJson) {
    lines.forEach((line, index) => segments.push({ line: index + 1, text: line, exempt: false }));
    return segments;
  }
  let inFence = false;
  let fenceExempt = false;
  let pendingMark = false;
  lines.forEach((line, index) => {
    const number = index + 1;
    if (/^\s*(```|~~~)/.test(line)) {
      if (!inFence) {
        inFence = true;
        fenceExempt = pendingMark;
        pendingMark = false;
      } else {
        inFence = false;
        fenceExempt = false;
      }
      return;
    }
    if (inFence) {
      segments.push({ line: number, text: line, exempt: fenceExempt });
      return;
    }
    if (line.trim() === EXCEPTION_MARK) {
      pendingMark = true;
      return;
    }
    for (const match of line.matchAll(/`([^`]+)`/g)) {
      segments.push({ line: number, text: match[1], exempt: false });
    }
  });
  return segments;
}

function checkCommands(skill, file, text) {
  const relative = path.relative(repositoryRoot, file);
  const report = (line, art, fundtext) => errors.push(`${skill}: ${relative}:${line} ${art} ${fundtext}`);
  const segments = codeSegments(text, file.endsWith(".json"));

  for (const segment of segments) {
    if (!segment.exempt) {
      for (const match of segment.text.matchAll(/(?<![\w-])comvenio\s+([a-z][a-z-]*)(?:\s+([a-z][a-z-]*))?/g)) {
        const [whole, command, subcommand] = match;
        if (!Object.hasOwn(COMMAND_SURFACE, command)) {
          report(segment.line, "befehl-ausserhalb-der-flaeche", whole.trim());
          continue;
        }
        const allowed = COMMAND_SURFACE[command];
        if (allowed && subcommand && !allowed.has(subcommand)) {
          report(segment.line, "befehl-ausserhalb-der-flaeche", whole.trim());
        }
      }
    }
  }

  // --input may never carry club_id or confirmation; the sign-in binds the club
  // and action confirm carries the confirmation.
  const lineOf = (offset) => text.slice(0, offset).split(/\r?\n/).length;
  for (const input of text.matchAll(/--input\s+'([^']*)'/g)) {
    const start = input.index + input[0].indexOf("'") + 1;
    for (const field of input[1].matchAll(/"(club_id|confirmation)"\s*:/g)) {
      report(lineOf(start + field.index), "input-feld-verboten", field[1]);
    }
  }

  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const match of line.matchAll(/--device-token|\bcvn_[A-Za-z0-9_]*|\bdevice[- _]?token\b/gi)) {
      report(index + 1, "geraetetoken", match[0]);
    }
    for (const match of line.matchAll(/(?<![\w.])cai\.[a-z][a-z0-9-]*(?:\.[a-z0-9_-]+)+/g)) {
      const id = match[0].replace(/[.-]+$/, "");
      if (!knownActions.has(id)) {
        report(index + 1, "action-unbekannt", id);
      }
    }
  });
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
