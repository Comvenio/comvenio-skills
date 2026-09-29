---
name: comvenio-volunteers
description: >
  Koordiniert Helfer, Bereichsleitungen und zugehörige Aufgaben für
  Veranstaltungen mit dem Comvenio CLI. Verwende diesen Skill bei
  Helfereinteilung, Bereichsbesetzung, Einsatzleitung, Verantwortlichkeiten,
  Schichtwünschen oder Aufgabenverteilung.
---

# Comvenio Helferkoordination

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

Ordne vorhandene Vereinsmitglieder nachvollziehbar zu Bereichen und Aufgaben
zu. Behaupte keine Verfügbarkeit und kein automatisches Matching, wenn diese
Informationen nicht im CLI vorliegen.

## Vorbereitung

```bash
comvenio whoami --json
comvenio action list --json
comvenio action call cai.event.02.show --input '{"event_id":"<event-id>"}' --json
comvenio action call cai.event.09.area_list_add_show_update_delete_bulk_copy \
  --input '{"operation":"list","event_id":"<event-id>"}' --json
comvenio action call cai.member.01.list --input '{"limit":100,"offset":0}' --json
comvenio action call cai.task.11.context_list_show_create_update_delete \
  --input '{"operation":"list","limit":50,"offset":0}' --json
```

Lies pro Bereich bestehende Assignments und Leads sowie passende Aufgaben.
Kläre benötigte Personenanzahl, bekannte Wünsche, Verantwortlichkeiten und
Fälligkeiten. Zuweisungen verwenden Member-IDs; Event-Einladungen können andere
Kennungen erwarten und werden nicht verwechselt.

## Vorschlag erstellen

Zeige vor Änderungen eine Tabelle oder Liste mit:

- Bereich und Zeitraum,
- bereits zugewiesenen Helfern,
- Bereichsleitung,
- zugehörigen Aufgaben,
- offenen Besetzungen,
- nicht belegbaren Annahmen wie Verfügbarkeit.

Eine gleichmäßige Verteilung ist nur ein Vorschlag. Ohne belegte
Verfügbarkeiten darf sie nicht als konfliktfrei bezeichnet werden.

## Zuweisen und prüfen

Verwende `cai.event.10.assignment_list_add_remove_clear` (Teilaktionen
`list`, `add`, `remove`, `clear`), `cai.event.11.lead_list_add_update_delete`
sowie die belegten Aufgaben-Actions `cai.task.05.create`, `cai.task.08.assign`,
`cai.task.12.assignment_list_show_update_delete` und
`cai.task.14.checklist_list_add_update_toggle_delete_reorder`.

```bash
comvenio action call cai.event.10.assignment_list_add_remove_clear \
  --input '{"operation":"add","area_id":"<area-id>","event_id":"<event-id>","member_id":"<member-id>"}' --json
```

Entfernen und Leeren von Zuweisungen sind kritisch und laufen über Vorschau
und `comvenio action confirm`. Prüfe nach
jeder Etappe Assignments, Leads und Aufgaben erneut.

Eine allgemeine automatische Benachrichtigung an Helfer ist nicht belegt. Sage
offen, welcher Kommunikationsschritt beim Verein verbleibt.

## Schutzregeln

Eine ausdrückliche Bestätigung ist erforderlich vor der Teilaktion `clear`,
Entfernen oder Ersetzen von Helfern, Entfernen einer Bereichsleitung,
Bulk-Aufgaben, Umhängen einer Verantwortlichkeit sowie Abbrechen oder Löschen
einer Aufgabe.

Zeige vor Zuweisungen immer die aufgelösten Mitgliedsnamen. Verwende
ausschließlich `comvenio`, für Agentenaufrufe `--json`, und wiederhole unklare
Schreibvorgänge nicht automatisch.

## Abschluss

Melde je Bereich Leitung, Helfer, Aufgaben, offene Plätze und noch nötige
Kommunikation nach erneuter Prüfung.
