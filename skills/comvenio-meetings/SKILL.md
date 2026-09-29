---
name: comvenio-meetings
description: >
  Begleitet Vereinsverantwortliche durch Sitzungsserien, konkrete Sitzungen,
  Tagesordnungen, Teilnehmer, Notizen, Abstimmungen, Beschlüsse, Protokolle und
  Veröffentlichung mit dem Comvenio CLI. Verwende diesen Skill immer bei
  Vorstandssitzung, Mitgliederversammlung, TOP, Protokoll, Abstimmung,
  Entscheidung oder Beschluss.
---

# Comvenio Meetings und Protokolle

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

Führe den Verein durch den gesamten Sitzungsablauf, ohne Phasen oder
Freigabeschritte zu überspringen. Unterscheide Sitzungsserie, konkrete Sitzung,
Tagesordnungspunkt, Entscheidung, Beschluss und veröffentlichte Reinschrift.

## Vorbereitung

1. Prüfe Nutzer und Verein:

   ```bash
   comvenio whoami --json
   ```

2. Lade die sichtbaren Actions und ihre Eingabeschemata:

   ```bash
   comvenio action list --json
   comvenio action call cai.schema.02.show_domain_schema --input '{"domain":"meeting"}' --json
   ```

3. Kläre:
   - Art und Abteilung der Sitzung,
   - einmalige Sitzung oder wiederkehrende Serie,
   - zugehöriger Veranstaltungstermin,
   - Protokollart und notwendige Freigabe,
   - Tagesordnung, Teilnehmer und geplante Entscheidungen.

Übergib komplexe Daten als JSON in `--input`. Für eigene CLI-Aufrufe ist
`--json` verbindlich. Die Sitzungs-Actions und ihre Teilaktionen (`"operation"`):

| Bereich | Action-ID |
|---|---|
| Sitzungsserien | `cai.meeting.01.series_list_show_create_update_delete` |
| Protokolle, Phasen, Veröffentlichung | `cai.meeting.02.protocol_list_show_create_update_delete_advance_revert_updates_validat` |
| Tagesordnung | `cai.meeting.03.agenda_list_show_create_update_delete_reorder_start_complete_skip_appr` |
| Notizen | `cai.meeting.04.note_list_list_protocol_create_update_delete` |
| Teilnehmer | `cai.meeting.05.participant_list_add_update_remove_validate_unvalidate` |
| Entscheidungen | `cai.meeting.06.decision_create_agenda_update_cancel_option_add_options_add_promote` |
| Abstimmungen | `cai.meeting.07.voting_open_close_results_eligible_tally` |
| Protokolleinträge | `cai.meeting.10.entry_list_show_show_agenda_create_update_delete` |

## Sitzungsserie und konkretes Protokoll

Lies zuerst vorhandene Serien:

```bash
comvenio action call cai.meeting.01.series_list_show_create_update_delete \
  --input '{"operation":"list"}' --json
comvenio action call cai.meeting.02.protocol_list_show_create_update_delete_advance_revert_updates_validat \
  --input '{"operation":"list"}' --json
```

Lege bei einem regelmäßigen Gremium zuerst eine Serie und anschließend für den
konkreten Termin ein Protokoll an:

```bash
comvenio action call cai.meeting.01.series_list_show_create_update_delete \
  --input '{"operation":"create","series":{<serie nach input_schema>}}' --json
comvenio action call cai.meeting.02.protocol_list_show_create_update_delete_advance_revert_updates_validat \
  --input '{"operation":"create","protocol":{<protokoll nach input_schema>}}' --json
comvenio action call cai.meeting.02.protocol_list_show_create_update_delete_advance_revert_updates_validat \
  --input '{"operation":"show","protocol_id":"<protocol-id>"}' --json
```

Schreibende Teilaktionen können eine Vorschau liefern; dann erst nach Freigabe
mit `comvenio action confirm` ausführen.

Vermeide doppelte Serien. Verknüpfe einen echten Termin mit der passenden
Veranstaltung.

## Tagesordnung vorbereiten

```bash
comvenio action call cai.meeting.03.agenda_list_show_create_update_delete_reorder_start_complete_skip_appr \
  --input '{"operation":"list","protocol_id":"<protocol-id>"}' --json
comvenio action call cai.meeting.03.agenda_list_show_create_update_delete_reorder_start_complete_skip_appr \
  --input '{"operation":"create","protocol_id":"<protocol-id>","agenda_item":{<top nach input_schema>}}' --json
comvenio action call cai.meeting.03.agenda_list_show_create_update_delete_reorder_start_complete_skip_appr \
  --input '{"operation":"reorder","protocol_id":"<protocol-id>","agenda_item_ids":["<agenda-item-id>"]}' --json
```

Zeige dem Nutzer die sortierte Tagesordnung mit geschätzten Zeiten. Löschen oder
vollständiges Umsortieren erfordert eine Bestätigung, wenn es nicht schon
ausdrücklich beauftragt wurde.

## Sitzung durchführen

- Markiere Teilnehmer und Anwesenheit vor Abstimmungen korrekt.
- Starte immer nur den tatsächlich behandelten TOP.
- Erstelle Entscheidungen nur am aktuell behandelten TOP.
- Unterscheide Diskussion, Notiz, Zusammenfassung und offizielle Reinschrift.
- Carry-over-TOPs können zusätzlich die konkrete Protokoll-ID benötigen.

Typischer Ablauf:

```bash
comvenio action call cai.meeting.05.participant_list_add_update_remove_validate_unvalidate \
  --input '{"operation":"list","protocol_id":"<protocol-id>"}' --json
comvenio action call cai.meeting.03.agenda_list_show_create_update_delete_reorder_start_complete_skip_appr \
  --input '{"operation":"start","protocol_id":"<protocol-id>","agenda_item_id":"<agenda-item-id>"}' --json
comvenio action call cai.meeting.04.note_list_list_protocol_create_update_delete \
  --input '{"operation":"create","note":{<notiz nach input_schema>}}' --json
comvenio action call cai.meeting.03.agenda_list_show_create_update_delete_reorder_start_complete_skip_appr \
  --input '{"operation":"complete","protocol_id":"<protocol-id>","agenda_item_id":"<agenda-item-id>"}' --json
```

## Entscheidungen und Abstimmungen

Vor einer Abstimmung müssen TOP, Teilnehmerkreis, Stimmberechtigung,
Mehrfachauswahl, Vertretungswahl und Sichtbarkeit fachlich feststehen.

```bash
comvenio action call cai.meeting.06.decision_create_agenda_update_cancel_option_add_options_add_promote \
  --input '{"operation":"create","agenda_item_id":"<agenda-item-id>","decision":{<entscheidung nach input_schema>}}' --json
comvenio action call cai.meeting.07.voting_open_close_results_eligible_tally \
  --input '{"operation":"open","decision_id":"<decision-id>"}' --json
comvenio action call cai.meeting.07.voting_open_close_results_eligible_tally \
  --input '{"operation":"results","decision_id":"<decision-id>"}' --json
comvenio action call cai.meeting.07.voting_open_close_results_eligible_tally \
  --input '{"operation":"close","decision_id":"<decision-id>"}' --json
comvenio action confirm \
  --preview-id <preview-id> \
  --confirmation-token <confirmation-token> \
  --idempotency-key <idempotency-key>
```

Offline-Zähler dürfen nicht geraten werden. Vor absolutem Setzen oder
Korrigieren eines Zählers (Teilaktion `tally`) muss der Nutzer den Wert
bestätigen.

Eine Entscheidung wird nur dann als Beschluss übernommen, wenn dies fachlich
gewollt ist:

```bash
comvenio action call cai.meeting.06.decision_create_agenda_update_cancel_option_add_options_add_promote \
  --input '{"operation":"promote","decision_id":"<decision-id>","resolution_number":"<nummer>"}' --json
comvenio action confirm \
  --preview-id <preview-id> \
  --confirmation-token <confirmation-token> \
  --idempotency-key <idempotency-key>
```

## Reinschrift und Veröffentlichung

Die offizielle Reinschrift entsteht erst in der vorgesehenen Protokollphase.
Jeder behandelte TOP benötigt einen Eintrag, bevor die Freigabephase erreicht
werden kann.

```bash
comvenio action call cai.meeting.02.protocol_list_show_create_update_delete_advance_revert_updates_validat \
  --input '{"operation":"validation","protocol_id":"<protocol-id>"}' --json
comvenio action call cai.meeting.10.entry_list_show_show_agenda_create_update_delete \
  --input '{"operation":"list","protocol_id":"<protocol-id>"}' --json
comvenio action call cai.meeting.02.protocol_list_show_create_update_delete_advance_revert_updates_validat \
  --input '{"operation":"publish","protocol_id":"<protocol-id>"}' --json
comvenio action confirm \
  --preview-id <preview-id> \
  --confirmation-token <confirmation-token> \
  --idempotency-key <idempotency-key>
```

Phasenwechsel und Rücksprung laufen über die Teilaktionen `advance` und
`revert` derselben Action.

Vor Phasenwechsel, Rücksprung oder Veröffentlichung:

1. aktuellen Protokollstand lesen,
2. fehlende Einträge und Bestätigungen nennen,
3. ausdrückliche Bestätigung des Nutzers einholen, sofern der Auftrag dies nicht
   bereits eindeutig umfasst,
4. Aktion ausführen und Ergebnis erneut lesen.

Die vorgegebene Phasenfolge wird nicht umgangen.

## Schutzregeln

- Ausschließlich das `comvenio` CLI verwenden.
- Keine privaten Assistentenentwürfe oder technische Spezialzugänge imitieren.
- Keine Abstimmung für abwesende oder nicht stimmberechtigte Personen erfinden.
- Löschen, Rücksprung, Schließen einer Abstimmung und Veröffentlichen sind
  weitreichende Schritte.
- Bei fehlendem Recht den betroffenen Sitzungsablauf benennen und nicht auf
  technische Auswege wechseln.

## Abschluss

Melde:

- Sitzung und aktuellen Stand,
- erledigte TOPs und offene Punkte,
- Ergebnis einer Abstimmung oder eines Beschlusses,
- fehlende Freigaben vor der Veröffentlichung.

Zeige Namen und verständliche Statusbegriffe statt roher Kennungen.
