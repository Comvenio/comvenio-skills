// Renews catalog/actions.json from the customer documentation of comvenio-cli.
//
// The generated section "Befehle und Actions" (<!-- gen:docs befehle -->) of
// every topic article lists the published connector actions with their
// operations, risk and scopes. The skill check (validate-skills.mjs) accepts
// only action ids from this copy, so the skills name exactly the actions a
// customer signed in with OAuth can see.
//
// Usage:
//   node scripts/sync-action-catalog.mjs <path-to-comvenio-cli> [--ref <git-ref>]
//
// Without --ref the working tree of the checkout is read; with --ref (for
// example origin/main) the files are read from that git revision.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogFile = path.join(repositoryRoot, "catalog", "actions.json");

const GEN_START = "<!-- gen:docs befehle -->";
const GEN_END = "<!-- /gen:docs -->";
const RISK_LABELS = ["ändern mit Bestätigung", "ändern", "lesen"];

function fail(message) {
  console.error(`Katalog-Sync fehlgeschlagen: ${message}`);
  process.exit(2);
}

const args = process.argv.slice(2);
const cliRoot = args.find((value, index) => !value.startsWith("--") && args[index - 1] !== "--ref");
const refIndex = args.indexOf("--ref");
const ref = refIndex >= 0 ? args[refIndex + 1] : null;

if (!cliRoot) {
  fail("Pfad zum comvenio-cli-Repository fehlt (node scripts/sync-action-catalog.mjs <pfad> [--ref <git-ref>]).");
}
if (refIndex >= 0 && !ref) {
  fail("--ref braucht einen Wert, etwa origin/main.");
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

const actions = new Map();
for (const name of listArticles().sort()) {
  const text = readArticle(name);
  let offset = 0;
  while (true) {
    const start = text.indexOf(GEN_START, offset);
    if (start < 0) break;
    const end = text.indexOf(GEN_END, start);
    if (end < 0) {
      fail(`docs/${name}: Abschnitt „Befehle und Actions“ ist nicht geschlossen.`);
    }
    let area = null;
    for (const line of text.slice(start, end).split(/\r?\n/)) {
      const heading = line.match(/^\*\*(.+)\*\*$/);
      if (heading) {
        area = heading[1];
        continue;
      }
      const entry = line.match(/^- `(cai\.[^`]+)` — (.+?) \((.+?)\)(?: · Scopes: (.+))?$/);
      if (!entry) continue;
      const [, id, operationText, riskText, scopeText] = entry;
      const risks = parseRisks(riskText);
      if (!risks) {
        fail(`docs/${name}: unbekannte Risikoangabe „${riskText}“ bei ${id}.`);
      }
      actions.set(id, {
        id,
        bereich: area,
        teilaktionen: operationText.split(/,\s*/),
        risiko: risks,
        scopes: scopeText ? [...scopeText.matchAll(/`([^`]+)`/g)].map((match) => match[1]) : [],
        artikel: `docs/${name}`,
      });
    }
    offset = end + GEN_END.length;
  }
}

if (actions.size === 0) {
  fail("keine Action in den Abschnitten „Befehle und Actions“ gefunden.");
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
console.log(`${actions.size} Actions nach catalog/actions.json geschrieben.`);
