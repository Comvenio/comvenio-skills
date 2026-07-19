# Comvenio Skills – Pflegevertrag

Dieses öffentliche Repository enthält Kundenskills für externe
Vereinsverantwortliche. Es enthält keine internen Entwicklungs-, RTS-,
Infrastruktur- oder Backend-Betriebsanweisungen.

## Zielgruppe und Sprache

- Der Nutzer ist Vereinsverantwortlicher, kein Comvenio-Entwickler.
- Antworte in seiner Sprache über Mitglieder, Veranstaltungen, Aufgaben,
  Sitzungen, Speisekarten, Homepage und Turniere.
- Zeige Namen statt UUIDs, sobald die CLI Namen liefert.
- Erkläre keine Gateways, Services, Umgebungen oder internen Datenmodelle.
- Sichtbare deutsche Texte verwenden echte Umlaute.

## Autoritative Quellen

1. Laufzeit: `comvenio <domain> --help` und
   `comvenio schema <domain> --json`
2. Öffentliches CLI-Repository: `comvenio-cli/AGENTS.md`,
   `comvenio-cli/docs/cli-reference.md` und die jeweilige Domain-Dokumentation
3. Dieser Skill-Text

Ein Skill darf keine Felder, Enum-Werte oder Aktionen erfinden. Ändert sich das
CLI, werden Skill und Eval-Fälle im selben Arbeitsgang nachgezogen.

## Verbindliche Sicherheitsgrenzen

- Comvenio-Produktoperationen ausschließlich über das `comvenio` CLI.
- Keine direkten HTTP-Aufrufe oder versteckten Backend-Schnittstellen.
- Für Agentenbefehle `--json` verwenden; Fehlercodes nicht als leere Ergebnisse
  behandeln.
- Zugriffstoken nie lesen, protokollieren, committen oder im Chat anfordern.
- Vor Mutationen den aktuellen Zustand lesen.
- Bei Löschen, Zurücksetzen, Vollersatz, öffentlicher Freischaltung oder
  finanziell/rechtlich relevanten Änderungen eine eindeutige Bestätigung
  verlangen, sofern der Auftrag dies nicht bereits ausdrücklich umfasst.
- Vorschau, Trockenlauf und Verifier verwenden, wenn die Domain sie anbietet.
- Fehlende CLI-Funktionen werden als Lücke benannt, nicht technisch umgangen.

## Skill-Struktur

```text
skills/<skill-name>/
├── SKILL.md
└── evals/
    └── evals.json
```

- Verzeichnisname und `name` im Frontmatter müssen übereinstimmen.
- Die `description` benennt Aufgabe und Trigger deutlich.
- `SKILL.md` bleibt unter 500 Zeilen.
- Jeder Skill enthält mindestens drei realistische Kunden-Testfälle.
- Fachdetails gehören nur in den betroffenen Skill.

## Änderung prüfen

```bash
npm test
npx skills add . --list
```

Bei einem neuen oder geänderten Skill zusätzlich mindestens diese Fälle
prüfen:

1. normaler Lese- oder Anlageworkflow,
2. öffentlicher oder destruktiver Workflow mit Freigabe,
3. Grenzfall mit fehlendem Recht, fehlendem CLI-Befehl oder unvollständigen
   Kundendaten.
