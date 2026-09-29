// Renews catalog/actions.json from the customer documentation of comvenio-cli.
//
// The generated section "Befehle und Actions" (<!-- gen:docs befehle -->) of
// every topic article lists the published connector actions with their
// operations, risk and scopes. The skill check (validate-skills.mjs) accepts
// only action ids from this copy, so the skills name exactly the actions a
// customer signed in with OAuth can see.
//
// Usage:
//   node scripts/sync-action-catalog.mjs <path-to-comvenio-cli> [--ref <git-ref>] [--out <file>]
//
// Without --ref the working tree of the checkout is read; with --ref (for
// example origin/main) the files are read from that git revision. --out writes
// the catalog elsewhere (used by the fixture tests).
//
// The sync never writes a partial catalog: a topic article (kategorie: thema)
// without the generated section, or a line in a section that names an action
// but cannot be parsed, or a topic section with neither an action line nor the
// line "Noch keine Action", aborts the run before anything is written.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const GEN_START = "<!-- gen:docs befehle -->";
const GEN_END = "<!-- /gen:docs -->";
const RISK_LABELS = ["ändern mit Bestätigung", "ändern", "lesen"];

function fail(message) {
  console.error(`Katalog-Sync fehlgeschlagen: ${message}`);
  process.exit(2);
}

const args = process.argv.slice(2);
const VALUE_FLAGS = new Set(["--ref", "--out"]);
const cliRoot = args.find((value, index) => !value.startsWith("--") && !VALUE_FLAGS.has(args[index - 1]));
const refIndex = args.indexOf("--ref");
const ref = refIndex >= 0 ? args[refIndex + 1] : null;
const outIndex = args.indexOf("--out");
const catalogFile = outIndex >= 0 && args[outIndex + 1]
  ? path.resolve(args[outIndex + 1])
  : path.join(repositoryRoot, "catalog", "actions.json");

if (!cliRoot) {
  fail("Pfad zum comvenio-cli-Repository fehlt (node scripts/sync-action-catalog.mjs <pfad> [--ref <git-ref>]).");
}
if (refIndex >= 0 && !ref) {
  fail("--ref braucht einen Wert, etwa origin/main.");
}
if (outIndex >= 0 && !args[outIndex + 1]) {
  fail("--out braucht einen Dateipfad.");
}

function git(...gitArgs) {
  return execFileSync("git", ["-C", cliRoot, ...gitArgs], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function listArticles() {
  if (ref) {
    return git("ls-tree", "--name-only", `${ref}:docs`)
      .split("\n")
      .filter((name) => name.endsWith(".md"));
  }
  const docsRoot = path.join(cliRoot, "docs");
  if (!fs.existsSync(docsRoot)) {
    fail(`Ordner ${docsRoot} fehlt.`);
  }
  return fs.readdirSync(docsRoot).filter((name) => name.endsWith(".md"));
}

function readArticle(name) {
  return ref ? git("show", `${ref}:docs/${name}`) : fs.readFileSync(path.join(cliRoot, "docs", name), "utf8");
}

function parseRisks(text) {
  const risks = [];
  let rest = text;
  while (rest.length > 0) {
    const label = RISK_LABELS.find((candidate) => rest.startsWith(candidate));
    if (!label) {
      return null;
    }
    risks.push(label);
    rest = rest.slice(label.length).replace(/^,\s*/, "");
  }
  return risks;
}

// Category from the front matter; only topic articles must carry the section.
function category(text) {
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  return frontmatter?.[1].match(/^kategorie:\s*(.+?)\s*$/m)?.[1] ?? null;
}

// Every problem is collected first; one of them is enough to write nothing.
const problems = [];
const actions = new Map();
for (const name of listArticles().sort()) {
  const text = readArticle(name);
  const isTopic = category(text) === "thema";
  if (isTopic && !text.includes(GEN_START)) {
    problems.push(`docs/${name}: Themenartikel ohne Abschnitt „Befehle und Actions“ (${GEN_START}).`);
  }
  let offset = 0;
  while (true) {
    const start = text.indexOf(GEN_START, offset);
    if (start < 0) break;
    const end = text.indexOf(GEN_END, start);
    if (end < 0) {
      problems.push(`docs/${name}: Abschnitt „Befehle und Actions“ ist nicht geschlossen.`);
      break;
    }
    const firstLine = text.slice(0, start).split(/\r?\n/).length;
    let area = null;
    let entries = 0;
    let declaredEmpty = false;
    text
      .slice(start, end)
      .split(/\r?\n/)
      .forEach((line, index) => {
        const heading = line.match(/^\s*\*\*(.+)\*\*\s*$/);
        if (heading) {
          area = heading[1];
          return;
        }
        // Indentation and the list marker (- or *) are tolerated.
        if (/Noch keine Action/.test(line)) declaredEmpty = true;
        const entry = line.match(/^\s*[-*]\s+`(cai\.[^`]+)`\s+—\s+(.+?)\s+\((.+?)\)(?:\s+·\s+Scopes:\s+(.+?))?\s*$/);
        if (!entry) {
          // A line that names an action but does not parse would silently drop
          // that action from the catalog.
          if (/\bcai\.[a-z]/.test(line)) {
            problems.push(`docs/${name}:${firstLine + index}: Action-Zeile nicht lesbar: „${line.trim()}“.`);
          }
          return;
        }
        entries += 1;
        const [, id, operationText, riskText, scopeText] = entry;
        const risks = parseRisks(riskText);
        if (!risks) {
          problems.push(`docs/${name}: unbekannte Risikoangabe „${riskText}“ bei ${id}.`);
          return;
        }
        actions.set(id, {
          id,
          bereich: area,
          teilaktionen: operationText.split(/,\s*/),
          risiko: risks,
          scopes: scopeText ? [...scopeText.matchAll(/`([^`]+)`/g)].map((match) => match[1]) : [],
          artikel: `docs/${name}`,
        });
      });
    // A topic section lists at least one action or says "Noch keine Action";
    // an empty section would silently drop that topic from the catalog.
    if (isTopic && entries === 0 && !declaredEmpty) {
      problems.push(`docs/${name}:${firstLine}: Abschnitt „Befehle und Actions“ ohne Action-Zeile und ohne „Noch keine Action“.`);
    }
    offset = end + GEN_END.length;
  }
}

if (actions.size === 0) {
  problems.push("keine Action in den Abschnitten „Befehle und Actions“ gefunden.");
}

if (problems.length > 0) {
  console.error("Katalog-Sync fehlgeschlagen, nichts geschrieben:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(2);
}

let stand = null;
try {
  stand = git("rev-parse", ref ?? "HEAD").trim();
} catch {
  stand = null;
}

const catalog = {
  quelle: "comvenio-cli docs/*.md, Abschnitt „Befehle und Actions“",
  quelle_ref: ref ?? "Arbeitsstand",
  quelle_commit: stand,
  erzeugt_am: new Date().toISOString().slice(0, 10),
  anzahl: actions.size,
  actions: [...actions.values()].sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true })),
};

fs.mkdirSync(path.dirname(catalogFile), { recursive: true });
fs.writeFileSync(catalogFile, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`${actions.size} Actions nach ${path.relative(process.cwd(), catalogFile) || catalogFile} geschrieben.`);
