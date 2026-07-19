import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = path.join(repositoryRoot, "skills");
const errors = [];

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
  const skillFile = path.join(skillRoot, "SKILL.md");
  const evalFile = path.join(skillRoot, "evals", "evals.json");

  if (!fs.existsSync(skillFile)) {
    errors.push(`${directoryName}: SKILL.md fehlt.`);
    continue;
  }

  const content = fs.readFileSync(skillFile, "utf8");
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

  for (const requiredText of ["comvenio", "--json", "Bestätigung"]) {
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

if (errors.length > 0) {
  console.error("Skill-Validierung fehlgeschlagen:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`${skillDirectories.length} Comvenio Skills erfolgreich validiert.`);
