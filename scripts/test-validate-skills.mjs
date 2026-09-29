// Fixture tests for validate-skills.mjs (TC-01, TC-02, TC-03, TC-06 of the
// command check). Each case copies scripts/fixtures/basis into a temporary
// directory, applies its change and runs the check against that copy.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptsRoot = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.join(scriptsRoot, "fixtures");
const validator = path.join(scriptsRoot, "validate-skills.mjs");
const skillFile = path.join("skills", "comvenio-beispiel", "SKILL.md");

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
];

function copyCase(caseName, root) {
  fs.copyFileSync(path.join(fixturesRoot, caseName, "SKILL.md"), path.join(root, skillFile));
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

if (failures.length > 0) {
  console.error("Fixture-Tests der Skill-Prüfung fehlgeschlagen:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`${cases.length} Fixture-Fälle der Skill-Prüfung bestanden.`);
