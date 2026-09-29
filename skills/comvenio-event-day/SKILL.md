---
name: comvenio-event-day
description: >
  Bereitet einen Veranstaltungstag domänenübergreifend vor und prüft Bereiche,
  Helfer, Programm, Ressourcen, Aufgaben, Buchungen, Speisekarten, Dateien,
  Sponsoren und Geländeplan mit dem Comvenio CLI. Verwende diesen Skill bei
  Ablaufcheck, Festvorbereitung, Einsatzleitung oder Veranstaltungsabschluss.
---

# Comvenio Veranstaltungstag

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

Gib dem Verein eine verständliche Einsatzübersicht und führe Änderungen in
kleinen, getrennt prüfbaren Etappen aus. Es gibt keinen atomaren
Event-Day-Befehl und keinen automatischen Rollback über mehrere Bereiche.

## Bestandsaufnahme

```bash
comvenio whoami --json
comvenio action list --json
comvenio action call cai.event.02.show --input '{"event_id":"<event-id>"}' --json
comvenio action call cai.event.09.area_list_add_show_update_delete_bulk_copy \
  --input '{"operation":"list","event_id":"<event-id>"}' --json
comvenio action call cai.event.13.program_list_add_update_delete_reorder \
  --input '{"operation":"list","event_id":"<event-id>"}' --json
comvenio action call cai.event.20.registration_list_add_stats_show_update_adjust_delete_aggregate \
  --input '{"operation":"stats","event_id":"<event-id>"}' --json
comvenio action call cai.plan.01.list --input '{"event_id":"<event-id>"}' --json
```

Lies zusätzlich Zuweisungen (`cai.event.10.assignment_list_add_remove_clear`),
Bereichsleitungen (`cai.event.11.lead_list_add_update_delete`), Ressourcen,
Anhänge, Menüs (`cai.event.28.menu_list_assign_unassign`), Sponsoren,
relevante Aufgaben, Buchungen und Dateien mit den `"operation":"list"`- bzw.
Listen-Actions der Fachskills. Bei einem mehrtägigen
Fest gehören Programm und Tagesinhalte an das jeweilige Child-Event.

## Tagescheck berichten

Strukturiere den Stand nach:

1. Termin, Status und Sichtbarkeit,
2. Bereiche, Leitungen und Helfer,
3. Programm und Kontakte,
4. Räume, Objekte und Buchungen,
5. Aufgaben und Checklisten,
6. Speisekarten, Dateien, Sponsoren und Geländeplan,
7. offene Risiken und Entscheidungen.

Erfinde keine automatische Vollständigkeits- oder Konfliktbewertung. Belege
jeden Hinweis mit den gelesenen Daten.

## Änderungen etappenweise ausführen

Verwende die Fachabläufe aus `comvenio-events`, `comvenio-volunteers`,
`comvenio-tasks`, `comvenio-bookings`, `comvenio-supply`, `comvenio-data`,
`comvenio-sponsors` und `comvenio-plans`. Zeige pro Fachbereich die geplanten
Änderungen und prüfe den neuen Stand, bevor du zum nächsten Block wechselst.

Eine allgemeine Benachrichtigungsaktion ist nicht belegt. Sage offen, wenn der
Nutzer Helfer außerhalb des CLI informieren muss.

## Schutzregeln

Eine ausdrückliche Bestätigung ist erforderlich vor Veröffentlichung,
Löschung, Leeren von Zuweisungen, vollständigem Ersetzen von Ressourcen,
Korrektur oder Löschung von Anmeldungen, Buchungsentscheidungen, öffentlichen
Dateien, Bulk-Aufgaben sowie dem Entfernen von Sponsor- oder Menüverknüpfungen.

Verwende ausschließlich `comvenio`, für Agentenaufrufe `--json`, und wiederhole
unklare Mutationen nicht automatisch. Bei einem Fehler stoppt der aktuelle
Block; bereits erfolgreiche andere Blöcke werden transparent genannt.

## Abschluss

Lies Event und betroffene Fachlisten erneut und verwende
`comvenio action call cai.verify.02.event --input '{"event_id":"<event-id>"}' --json`. Melde erledigte, geprüfte und offene
Punkte als Einsatzübersicht.
