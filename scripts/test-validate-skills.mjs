// Fixture tests for validate-skills.mjs (TC-01, TC-02, TC-03, TC-06 of the
// command check, K1-1 to K1-3 of the external review) and for
// sync-action-catalog.mjs (K1-4). Each validator case copies
// scripts/fixtures/basis into a temporary directory, overlays its case folder
// onto the example skill and runs the check against that copy. Each sync case
// copies scripts/fixtures/sync-basis, overlays its case folder and writes the
// catalog into the temporary directory.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptsRoot = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.join(scriptsRoot, "fixtures");
const validator = path.join(scriptsRoot, "validate-skills.mjs");
const syncScript = path.join(scriptsRoot, "sync-action-catalog.mjs");
const skillRoot = path.join("skills", "comvenio-beispiel");
const skillFile = path.join(skillRoot, "SKILL.md");
const evalFile = path.join(skillRoot, "evals", "evals.json");

const cases = [
  {
    name: "Basis ist grün",
    prepare: () => {},
    exitCode: 0,
    expect: [],
  },
  {
    name: "TC-01 klassischer Befehl",
    prepare: (root) => copyCase("tc-01-klassischer-befehl", root),
    exitCode: 1,
    expect: [`comvenio-beispiel: ${skillFile}:12 befehl-ausserhalb-der-flaeche comvenio club info`],
  },
  {
    name: "TC-02 unbekannte Action",
    prepare: (root) => copyCase("tc-02-action-unbekannt", root),
    exitCode: 1,
    expect: ["action-unbekannt cai.xyz.99.gibtsnicht"],
  },
  {
    name: "TC-03 Katalog fehlt",
    prepare: (root) => fs.rmSync(path.join(root, "catalog", "actions.json")),
    exitCode: 2,
    expect: [path.join("catalog", "actions.json")],
  },
  {
    name: "TC-06 Gegenbeispiel mit Ausnahmemarke",
    prepare: (root) => copyCase("tc-06-ausnahmemarke", root),
    exitCode: 0,
    expect: [],
  },
  {
    name: "TC-06 Gegenbeispiel ohne Ausnahmemarke",
    prepare: (root) => copyCase("tc-06-ohne-marke", root),
    exitCode: 1,
    expect: ["befehl-ausserhalb-der-flaeche comvenio club info"],
  },
  {
    name: "K1-1 Fortsetzungszeilen und Schreibweise im Codeblock",
    prepare: (root) => copyCase("tc-07-fortsetzung", root),
    exitCode: 1,
    expect: [
      `${skillFile}:12 befehl-ausserhalb-der-flaeche comvenio club info`,
      `${skillFile}:14 action-unbekannt cai.club.03.settings_other`,
      `${skillFile}:16 befehl-ausserhalb-der-flaeche Comvenio club info`,
      `${skillFile}:17 befehl-ausserhalb-der-flaeche COMVENIO CLUB INFO`,
    ],
  },
  {
    name: "K1-1 Fortsetzungszeile im JSON-String",
    prepare: (root) => copyCase("tc-07-fortsetzung-json", root),
    exitCode: 1,
    expect: [`${evalFile}:4 action-unbekannt cai.club.03.settings_other`],
  },
  {
    name: "K1-2 verbotene Eingabefelder und geteilter Geräte-Token",
    prepare: (root) => copyCase("tc-08-input-felder", root),
    exitCode: 1,
    expect: [
      `${skillFile}:12 input-feld-verboten club_id`,
      `${skillFile}:13 input-feld-verboten confirmation`,
      `${skillFile}:14 geraetetoken --device-token`,
      `${evalFile}:4 input-feld-verboten club_id`,
    ],
  },
  {
    name: "K1-3 Ausnahmemarke ohne unmittelbar folgenden Block",
    prepare: (root) => copyCase("tc-09-marke-ohne-block", root),
    exitCode: 1,
    expect: [
      `${skillFile}:14 ausnahmemarke-ohne-block <!-- klassisch-beispiel -->`,
      `${skillFile}:19 befehl-ausserhalb-der-flaeche comvenio club info`,
    ],
  },
];

// Sync cases: exit code, expected output, and whether (and with which action
// ids) the catalog was written.
const syncCases = [
  {
    name: "Sync-Basis schreibt den Katalog",
    caseName: null,
    exitCode: 0,
    expect: [],
    written: ["cai.club.03.settings", "cai.club.10.department_delete"],
  },
  {
    name: "K1-4 eingerückte Action-Zeile wird gelesen",
    caseName: "sync-eingerueckt",
    exitCode: 0,
    expect: [],
    written: ["cai.club.03.settings", "cai.club.10.department_delete"],
  },
  {
    name: "K1-4 Themenartikel ohne generierten Abschnitt",
    caseName: "sync-ohne-block",
    exitCode: 2,
    expect: ["docs/aufgaben.md: Themenartikel ohne Abschnitt"],
    written: null,
  },
  {
    name: "K1-4 nicht lesbare Action-Zeile",
    caseName: "sync-unlesbar",
    exitCode: 2,
    expect: ["docs/verein.md:13: Action-Zeile nicht lesbar"],
    written: null,
  },
];

// Overlays every file of a case folder onto the example skill.
function copyCase(caseName, root) {
  fs.cpSync(path.join(fixturesRoot, caseName), path.join(root, skillRoot), { recursive: true });
}

const failures = [];
for (const testCase of cases) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "comvenio-skills-fixture-"));
  try {
    fs.cpSync(path.join(fixturesRoot, "basis"), root, { recursive: true });
    testCase.prepare(root);
    const run = spawnSync(process.execPath, [validator, root], { encoding: "utf8" });
    const output = `${run.stdout}${run.stderr}`;
    if (run.status !== testCase.exitCode) {
      failures.push(`${testCase.name}: Exit ${run.status} statt ${testCase.exitCode}\n${output}`);
      continue;
    }
    for (const text of testCase.expect) {
      if (!output.includes(text)) {
        failures.push(`${testCase.name}: Ausgabe enthält „${text}“ nicht\n${output}`);
      }
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

for (const testCase of syncCases) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "comvenio-skills-sync-"));
  try {
    const cliRoot = path.join(root, "cli");
    const outFile = path.join(root, "actions.json");
    fs.cpSync(path.join(fixturesRoot, "sync-basis"), cliRoot, { recursive: true });
    if (testCase.caseName) {
      fs.cpSync(path.join(fixturesRoot, testCase.caseName), cliRoot, { recursive: true });
    }
    const run = spawnSync(process.execPath, [syncScript, cliRoot, "--out", outFile], { encoding: "utf8" });
    const output = `${run.stdout}${run.stderr}`;
    if (run.status !== testCase.exitCode) {
      failures.push(`${testCase.name}: Exit ${run.status} statt ${testCase.exitCode}\n${output}`);
      continue;
    }
    for (const text of testCase.expect) {
      if (!output.includes(text)) {
        failures.push(`${testCase.name}: Ausgabe enthält „${text}“ nicht\n${output}`);
      }
    }
    if (!testCase.written) {
      if (fs.existsSync(outFile)) {
        failures.push(`${testCase.name}: Katalog wurde trotz Fehler geschrieben`);
      }
      continue;
    }
    const ids = fs.existsSync(outFile)
      ? JSON.parse(fs.readFileSync(outFile, "utf8")).actions.map((action) => action.id)
      : [];
    for (const id of testCase.written) {
      if (!ids.includes(id)) {
        failures.push(`${testCase.name}: Katalog enthält ${id} nicht`);
      }
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

if (failures.length > 0) {
  console.error("Fixture-Tests der Skill-Prüfung fehlgeschlagen:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`${cases.length + syncCases.length} Fixture-Fälle der Skill-Prüfung und des Katalog-Syncs bestanden.`);
