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

## Verbindlicher Arbeitsweg

Zuerst `comvenio whoami --json` und `comvenio action list --json` ausführen.
Fachoperationen laufen ausschließlich über
`comvenio action call <action-id> --input '<json>' --json` mit einer dort
sichtbaren Action-ID und ihrem `input_schema`; Teilaktionen wählt das Feld
`"operation"`. `club_id` gehört nie in `--input`, der Verein kommt aus der
Anmeldung. Kritische Actions liefern eine Vorschau und werden erst nach
Freigabe mit `comvenio action confirm` ausgeführt. Fehlt eine Action, nennt der
Skill den Weg in der Comvenio-Web-App; niemals direkte HTTP-Aufrufe.

## Ziel

Ordne jede Aufgabe dem richtigen fachlichen Kontext zu und mache
Verantwortlichkeit, Fälligkeit und Fortschritt für den Verein verständlich.

## Vorbereitung

```bash
comvenio whoami --json
comvenio action list --json
comvenio action call cai.schema.02.show_domain_schema --input '{"domain":"task"}' --json
comvenio action call cai.task.11.context_list_show_create_update_delete \
  --input '{"operation":"list","limit":50,"offset":0}' --json
```

Kläre:

- Titel und gewünschtes Ergebnis,
- Bezug zu Verein, Veranstaltung, Objekt, Sitzung oder Versorgung,
- verantwortliches Mitglied,
- Fälligkeit und Priorität,
- Checkliste oder Unteraufgaben,
- Einzelaufgabe oder mehrere Aufgaben im Schwung.

Ermittle Mitglieder- und Kontext-IDs über lesende Actions
(`cai.member.01.list`, `cai.task.11.context_list_show_create_update_delete`). Eine
Aufgabenzuweisung benötigt eine Member-ID, nicht die Benutzer-ID.

## Kontext richtig verwenden

Jede Aufgabe braucht einen Task-Kontext. Prüfe zuerst, ob ein passender Kontext
existiert:

```bash
comvenio action call cai.task.11.context_list_show_create_update_delete \
  --input '{"operation":"list","limit":50,"offset":0}' --json
```

Nur wenn keiner passt:

```bash
comvenio action call cai.task.11.context_list_show_create_update_delete \
  --input '{"operation":"create","context":{"context_type":"event","context_id":"<event-id>","is_default":false}}' --json
```

Die zurückgegebene Context-ID wird bei der Aufgabe als `task_context_id`
verwendet. Verwechsle sie nicht mit der referenzierten Veranstaltung oder
Sitzung.

## Aufgabe anlegen und zuweisen

```bash
comvenio action call cai.task.05.create \
  --input '{"task":{"title":"<titel>","task_context_id":"<task-context-id>","description":"<beschreibung>","priority":"medium","due_date":"2026-10-15T18:00:00+02:00"}}' --json

comvenio action call cai.task.08.assign \
  --input '{"task_id":"<task-id>","assignment":{"member_id":"<member-id>","is_responsible":true}}' --json
```

Lies die Aufgabe anschließend erneut:

```bash
comvenio action call cai.task.02.show --input '{"task_id":"<task-id>"}' --json
```

Für mehrere Aufgaben mit Checklisten und Zuweisungen gibt es eine geprüfte
Sammelanlage; sie ist kritisch und läuft über Vorschau und Freigabe:

```bash
comvenio action call cai.task.06.bulk \
  --input '{"items":[{"task":{"title":"<titel>","task_context_id":"<task-context-id>"},"checklist_items":[],"assignments":[]}]}' --json
comvenio action confirm \
  --preview-id <preview-id> \
  --confirmation-token <confirmation-token> \
  --idempotency-key <idempotency-key>
```

Zeige dem Nutzer vor dem Bulk-Aufruf Anzahl, Titel, Verantwortliche und
Fälligkeiten.

## Fortschritt, Notizen und Checklisten

```bash
comvenio action call cai.task.13.note_list_add_update_delete \
  --input '{"operation":"list","task_id":"<task-id>"}' --json
comvenio action call cai.task.13.note_list_add_update_delete \
  --input '{"operation":"add","task_id":"<task-id>","content":"<notiz>"}' --json
comvenio action call cai.task.14.checklist_list_add_update_toggle_delete_reorder \
  --input '{"operation":"list","task_id":"<task-id>"}' --json
comvenio action call cai.task.14.checklist_list_add_update_toggle_delete_reorder \
  --input '{"operation":"add","task_id":"<task-id>","item":{"title":"<punkt>","order_index":0}}' --json
comvenio action call cai.task.14.checklist_list_add_update_toggle_delete_reorder \
  --input '{"operation":"toggle","item_id":"<item-id>"}' --json
comvenio action call cai.task.07.update \
  --input '{"task_id":"<task-id>","changes":{"status":"in_progress"}}' --json
```

Schließe eine Aufgabe mit der vorgesehenen Action ab:

```bash
comvenio action call cai.task.09.done \
  --input '{"task_id":"<task-id>","completed_at":"2026-10-15T20:00:00+02:00"}' --json
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

- Vor Änderungen immer `cai.task.02.show` oder die passende Unterliste lesen.
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
