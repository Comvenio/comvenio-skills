---
name: comvenio-tasks
description: >
  Erstellt und verwaltet Vereinsaufgaben mit dem Comvenio CLI, einschließlich
  Kontext, Zuständigkeiten, Fälligkeiten, Prioritäten, Notizen, Checklisten,
  Sammelanlagen und Abschluss. Verwende diesen Skill immer bei Aufgabe, To-do,
  Helfereinteilung, Zuständigkeit, Checkliste, Fälligkeit oder offenen Punkten
  aus Veranstaltung, Sitzung, Objekt oder Versorgung.
---

# Comvenio Aufgaben

## Ziel

Ordne jede Aufgabe dem richtigen fachlichen Kontext zu und mache
Verantwortlichkeit, Fälligkeit und Fortschritt für den Verein verständlich.

## Vorbereitung

```bash
comvenio whoami --json
comvenio club info --json
comvenio schema task --json
comvenio task --help
comvenio task context list --json
```

Kläre:

- Titel und gewünschtes Ergebnis,
- Bezug zu Verein, Veranstaltung, Objekt, Sitzung oder Versorgung,
- verantwortliches Mitglied,
- Fälligkeit und Priorität,
- Checkliste oder Unteraufgaben,
- Einzelaufgabe oder mehrere Aufgaben im Schwung.

Ermittle Mitglieder- und Kontext-IDs über lesende CLI-Befehle. Eine
Aufgabenzuweisung benötigt eine Member-ID, nicht die Benutzer-ID.

## Kontext richtig verwenden

Jede Aufgabe braucht einen Task-Kontext. Prüfe zuerst, ob ein passender Kontext
existiert:

```bash
comvenio task context list --json
```

Nur wenn keiner passt:

```bash
comvenio task context create \
  --context-type <typ> \
  --ref-id <fach-id> \
  --json
```

Die zurückgegebene Context-ID wird bei der Aufgabe als `--context-id`
verwendet. Verwechsle sie nicht mit der referenzierten Veranstaltung oder
Sitzung.

## Aufgabe anlegen und zuweisen

```bash
comvenio task create \
  --title "<titel>" \
  --context-id <task-context-id> \
  --description "<beschreibung>" \
  --priority <priorität> \
  --due-date <iso> \
  --json

comvenio task assign <task-id> \
  --member-id <member-id> \
  --responsible \
  --json
```

Lies die Aufgabe anschließend erneut:

```bash
comvenio task show <task-id> --json
```

Für mehrere Aufgaben mit Checklisten und Zuweisungen kann eine geprüfte
Bulk-Datei verwendet werden:

```bash
comvenio task bulk --file tasks.json --json
```

Zeige dem Nutzer vor dem Bulk-Aufruf Anzahl, Titel, Verantwortliche und
Fälligkeiten.

## Fortschritt, Notizen und Checklisten

```bash
comvenio task note list <task-id> --json
comvenio task note add <task-id> --file note.json --json
comvenio task checklist list <task-id> --json
comvenio task checklist add <task-id> --file checklist-item.json --json
comvenio task checklist toggle <item-id> --json
comvenio task update <task-id> --status in_progress --json
```

Schließe eine Aufgabe mit dem vorgesehenen Befehl ab:

```bash
comvenio task done <task-id> --json
```

Abgeschlossene oder abgebrochene Aufgaben werden nicht ohne Prüfung wieder auf
offen gesetzt.

## Schutzregeln

Eine ausdrückliche Bestätigung ist erforderlich, sofern der Nutzer es nicht
schon eindeutig beauftragt hat, vor:

- Löschen einer Aufgabe, Notiz, Checkliste oder eines Kontexts,
- Abbrechen mehrerer Aufgaben,
- Bulk-Anlage mit vielen Verantwortlichkeiten,
- Änderung bereits abgeschlossener Arbeit.

Weitere Regeln:

- Vor Änderungen immer `task show` oder die passende Unterliste lesen.
- Namen statt IDs kommunizieren.
- Nur `comvenio` CLI verwenden.
- Für Agentenaufrufe `--json` setzen.
- Schreibende Aufrufe bei unklarem Ergebnis nicht automatisch wiederholen.

## Abschluss

Melde:

- Aufgabe und fachlichen Bezug,
- verantwortliche Person,
- Fälligkeit und Priorität,
- Stand der Checkliste,
- Ergebnis der erneuten Prüfung.
