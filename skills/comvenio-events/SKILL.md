---
name: comvenio-events
description: >
  Plant und verwaltet Veranstaltungen eines Vereins mit dem Comvenio CLI:
  Einzeltermine, wiederkehrende Trainings, mehrtägige Feste, Bereiche,
  Programm, Einladungen, Anmeldungen, Ressourcen und Veranstaltungsdesign.
  Verwende diesen Skill immer, wenn ein Kunde Events, Termine, Feste,
  Trainingsserien, Helferbereiche oder öffentliche Veranstaltungsseiten erwähnt.
---

# Comvenio Veranstaltungen

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

Setze den Veranstaltungswunsch eines Vereins in einen sicheren, nachvollziehbaren
CLI-Ablauf um. Halte wiederverwendbare Vorlagen, konkrete Termine und
mehrtägige Festtage fachlich auseinander.

## Vor dem ersten Befehl

1. Prüfe Identität und Verein mit `comvenio whoami --json`.
2. Lade die sichtbaren Actions und ihre Eingabeschemata:

   ```bash
   comvenio action list --json
   ```

   Maßgeblich ist das `input_schema` der jeweiligen `cai.event.*`-Action.

3. Kläre nur die fachlich fehlenden Angaben:
   - Titel und Art der Veranstaltung,
   - einzelner Termin, wiederkehrende Serie oder mehrtägiges Fest,
   - Datum, Uhrzeit, Zeitzone und Dauer,
   - Sichtbarkeit,
   - Abteilung und verantwortliche Person,
   - Ort sowie gewünschte Anmeldung oder Einladung.

Erfinde keine Enum-Werte oder IDs. Ermittle Abteilungen
(`cai.club.06.department_list`), Mitglieder (`cai.member.01.list`) und
bestehende Veranstaltungen (`cai.event.01.list`) lesend über das CLI.

## Passenden Veranstaltungsweg wählen

### Einzeltermin

Lies zuerst ähnliche Termine. Lege dann einen Entwurf oder geplanten Termin an:

```bash
comvenio action call cai.event.01.list \
  --input '{"range":{"from":"2026-09-01","to":"2026-10-01","timezone":"Europe/Berlin"}}' --json
comvenio action call cai.event.03.create --input '{"event":<event nach input_schema>}' --json
comvenio action call cai.event.02.show --input '{"event_id":"<event-id>"}' --json
```

Veröffentliche erst, wenn Inhalt, Sichtbarkeit und Zeitpunkt stimmen. Die
Veröffentlichung ist kritisch und läuft über Vorschau und Freigabe:

```bash
comvenio action call cai.verify.02.event --input '{"event_id":"<event-id>"}' --json
comvenio action call cai.event.05.publish \
  --input '{"event_id":"<event-id>","make_public":true}' --json
comvenio action confirm \
  --preview-id <preview-id> \
  --confirmation-token <confirmation-token> \
  --idempotency-key <idempotency-key>
```

`cai.event.05.publish` bestätigt die Veranstaltung; es gibt keinen eigenen Status
`published`.

### Wiederkehrendes Training

Lege eine Serie mit Wiederholungsregel an und erzeuge danach die konkreten
Termine für einen Zeitraum. Wiederverwendbare Vorlagen verwaltet
`cai.event.07.template_list_create_clone_instantiate`.

```bash
comvenio action call cai.event.08.series_list_show_create_materialize_promote_recurring_promote_yearly_n \
  --input '{"operation":"create","series":{"name":"Darttraining","department_id":"<department-id>","event_type":"training","visibility_scope":"member","timezone":"Europe/Berlin","rrule":"FREQ=WEEKLY;BYDAY=WE","dtstart":"2026-09-02T19:00:00+02:00","duration_minutes":120}}' --json
comvenio action call cai.event.08.series_list_show_create_materialize_promote_recurring_promote_yearly_n \
  --input '{"operation":"materialize","series_id":"<series-id>","range":{"from":"2026-09-01","to":"2027-01-01","timezone":"Europe/Berlin"}}' --json
comvenio action confirm \
  --preview-id <preview-id> \
  --confirmation-token <confirmation-token> \
  --idempotency-key <idempotency-key>
```

Kläre den Zeitraum der konkreten Termine. `materialize` ist kritisch und kann für dasselbe
Zeitfenster erneut ausgeführt werden, ohne vorhandene Termine zu duplizieren.

### Jährliche Veranstaltung

Nutze eine jährlich geplante Serie (Teilaktion `promote_yearly` an einem
bestehenden Termin) und lege jeden nächsten Termin bewusst an
(`materialize_next`).
Verwende keine wöchentliche Regel nur deshalb, weil das Ereignis wiederkehrt.

### Mehrtägiges Fest

Modelliere das Gesamtfest als öffentliches Parent-Event und jeden Festtag als
Child-Event (`cai.event.27.child_list_create_invitation_summary`). Programm, Galerie und tagesbezogene Inhalte gehören an den
jeweiligen Festtag. Zeige dem Nutzer das Gesamtfest als eine zusammengehörige
Veranstaltung.

## Bereiche und Programm

- Lies vorhandene Bereiche vor Änderungen.
- Die automatisch angelegte Default-Area wird niemals gelöscht.
- Mehrere Bereiche legt die Teilaktion `bulk` von
  `cai.event.09.area_list_add_show_update_delete_bulk_copy` in einem Aufruf an.
- Programmpunkte eines mehrtägigen Fests gehören an den Festtag.
- In `cai.event.15.resource_list_add_set_remove_link_show_link_update_link_delete_usage_u`
  ergänzt `add` Ressourcen. `set` ersetzt die vollständige Menge und ist nur
  zulässig, wenn alle Ziele bekannt sind.
- Dateien werden zuerst mit `cai.data.06.upload` hochgeladen (Skill
  `comvenio-data`) und danach mit
  `cai.event.16.attachment_list_show_add_update_delete` als Anhang verknüpft.

Typische Prüfungen:

```bash
comvenio action call cai.event.09.area_list_add_show_update_delete_bulk_copy \
  --input '{"operation":"list","event_id":"<event-id>"}' --json
comvenio action call cai.event.13.program_list_add_update_delete_reorder \
  --input '{"operation":"list","event_id":"<event-id>"}' --json
comvenio action call cai.event.20.registration_list_add_stats_show_update_adjust_delete_aggregate \
  --input '{"operation":"stats","event_id":"<event-id>"}' --json
```

## Einladungen und Anmeldungen

Unterscheide:

- Vereinsmitglieder einladen,
- andere Comvenio-Vereine einladen,
- externe Vereine per E-Mail einladen,
- Teilnehmer manuell anmelden.

Einladungen laufen über
`cai.event.19.invitation_and_club_invitation_workflows` (Teilaktionen
`member_*` und `club_*`), Anmeldungen über `cai.event.20.registration_list_add_stats_show_update_adjust_delete_aggregate`.

Prüfe Empfänger und Sichtbarkeit vor dem Versand. Gib dem Kunden eine
verständliche Zusammenfassung nach Namen und Anzahl, nicht nur technische IDs.

## Freigabe- und Sicherheitsregeln

Eine ausdrückliche Bestätigung ist erforderlich, sofern nicht bereits eindeutig
beauftragt, vor:

- öffentlicher Veröffentlichung,
- Löschen einer Veranstaltung oder Unterressource,
- Ersetzen einer vollständigen Ressourcenmenge,
- gruppenweisen Einladungen,
- Zurücksetzen von DJ-Wünschen oder öffentlichen Texten.

Verwende ausschließlich das `comvenio` CLI und für Agentenaufrufe `--json`.
Schreibende Befehle werden bei unklarem Ausgang nicht blind wiederholt.

## Abschluss

Lies die Veranstaltung erneut und nutze bei öffentlichen Events
`cai.verify.02.event` mit `{"event_id":"<event-id>"}`. Berichte:

- welche Veranstaltung oder Serie angelegt beziehungsweise geändert wurde,
- welche Termine und Sichtbarkeit gelten,
- was geprüft wurde,
- welche Veröffentlichung oder organisatorische Entscheidung noch offen ist.
