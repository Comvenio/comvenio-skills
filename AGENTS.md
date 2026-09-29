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

1. Laufzeit: `comvenio action list --json` (Action-IDs, Teilaktionen und
   `input_schema` für die aktuelle Anmeldung)
2. Öffentliches CLI-Repository: `comvenio-cli/AGENTS.md`,
   `comvenio-cli/docs/cli-reference.md` und die jeweilige Themen-Dokumentation
   mit ihrem Abschnitt „Befehle und Actions“
3. Der Action-Katalog `catalog/actions.json` in diesem Repository (Kopie aus
   diesem Abschnitt, erneuert mit
   `node scripts/sync-action-catalog.mjs <pfad-zu-comvenio-cli> --ref origin/main`)
4. Dieser Skill-Text

Ein Skill darf keine Felder, Enum-Werte oder Aktionen erfinden. Ändert sich das
CLI, werden Skill und Eval-Fälle im selben Arbeitsgang nachgezogen.

## Verbindliche Sicherheitsgrenzen

- Comvenio-Produktoperationen ausschließlich über das `comvenio` CLI.
- Keine direkten HTTP-Aufrufe oder versteckten Backend-Schnittstellen.
- Für Agentenbefehle `--json` verwenden; Fehlercodes nicht als leere Ergebnisse
  behandeln.
- Einziger Anmeldeweg ist der browserbasierte OAuth-Login mit `comvenio login`.
  Fachoperationen laufen ausschließlich über `comvenio action list|call|confirm`
  und nur über die dort sichtbaren kanonischen Action-IDs; Teilaktionen wählt
  das Feld `"operation"` in `--input`.
- Skills nennen nur die Befehlsfläche des CLI: `login`, `logout`, `whoami`,
  `action list|call|confirm`, `agent chat`, `finance` und `help`. Klassische
  Domänenbefehle sind entfallen. `club_id` und `confirmation` stehen nie in
  `--input`; kritische Actions werden mit `comvenio action confirm
  --preview-id … --confirmation-token … --idempotency-key …` bestätigt.
- Ein Beispiel, das einen alten Befehl absichtlich als falsch zeigt, steht in
  einem Block „nicht mehr verfügbar“ direkt nach der Marke
  `<!-- klassisch-beispiel -->`.
- Zugriffstoken nie lesen, protokollieren, committen oder im Chat anfordern.
- Vor Mutationen den aktuellen Zustand lesen.
- Bei Löschen, Zurücksetzen, Vollersatz, öffentlicher Freischaltung oder
  finanziell/rechtlich relevanten Änderungen eine eindeutige Bestätigung
  verlangen, sofern der Auftrag dies nicht bereits ausdrücklich umfasst.
- Vorschau, Trockenlauf und Verifier verwenden, wenn die Domain sie anbietet.
- Fehlende CLI-Funktionen werden als Lücke benannt, nicht technisch umgangen.
  Hat ein Schritt keine passende Action, beschreibt der Skill den Weg in der
  Comvenio-Web-App mit Menüpfad statt eines Befehls.

## Skill-Struktur

```text
skills/<skill-name>/
├── SKILL.md
├── README.md
└── evals/
    └── evals.json
```

- Verzeichnisname und `name` im Frontmatter müssen übereinstimmen.
- Die `description` benennt Aufgabe und Trigger deutlich.
- `SKILL.md` bleibt unter 500 Zeilen.
- `README.md` erklärt Kundennutzen, Beispiele, Sicherheitsgrenzen und bekannte
  Einschränkungen ohne Backend- oder Infrastrukturdetails.
- Jeder Skill enthält mindestens drei realistische Kunden-Testfälle.
- `SKILL.md` beginnt mit `comvenio whoami --json` und `comvenio action list`.
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
3. Grenzfall mit fehlendem Recht, fehlender Action oder unvollständigen
   Kundendaten.

`npm test` prüft zusätzlich jeden `comvenio`-Aufruf gegen die Befehlsfläche und
jede genannte Action-ID gegen `catalog/actions.json`. Fehlt der Katalog, endet
die Prüfung mit Exit 2.
