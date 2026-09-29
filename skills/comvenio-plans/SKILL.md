---
name: comvenio-plans
description: >
  Erstellt und pflegt Gelände-, Flucht- und Detailpläne für Veranstaltungen
  mit dem Comvenio CLI: Zonen, Tische, Marker, Gastvereine, Export und
  Illustration. Verwende diesen Skill bei Lageplan, Geländeplan, Festzelt,
  Besucherkarte, Parkplätzen oder Fluchtwegen.
---

# Comvenio Geländepläne

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

Baue einen fachlich korrekten Veranstaltungsplan schrittweise auf und bewahre
bei visuellen Varianten die räumliche Struktur und exakten Beschriftungen.

## Vorbereitung

```bash
comvenio whoami --json
comvenio action list --json
comvenio action call cai.event.02.show --input '{"event_id":"<event-id>"}' --json
comvenio action call cai.plan.01.list --input '{"event_id":"<event-id>"}' --json
```

Lies einen vorhandenen Plan mit `cai.plan.02.show`. Kläre Veranstaltung oder Festtag,
Planart, Abmessungen, Zonen, Wege, Tische, Marker, Gäste und ob ein Plan für
alle Festtage gelten soll.

## Plan aufbauen

```bash
comvenio action call cai.plan.03.create \
  --input '{"event_id":"<event-id>","plan":{"name":"<name>"}}' --json
comvenio action call cai.plan.06.zone_list_create_update_delete_link_unlink \
  --input '{"operation":"create","plan_id":"<plan-id>","zone":{"name":"<zone>","length_m":<m>,"width_m":<m>}}' --json
comvenio action call cai.plan.08.marker_create_update_delete \
  --input '{"operation":"create","marker":{"event_id":"<event-id>","plan_id":"<plan-id>","marker_type":"parking","label":"Parken"}}' --json
comvenio action call cai.plan.02.show --input '{"plan_id":"<plan-id>"}' --json
```

Ergänze Zonen, Tische (`cai.plan.07.table_create_duplicate_update_delete`),
Marker und Gäste (`cai.plan.09.guest_list_add_update_delete`) in kleinen,
prüfbaren Schritten. Verlinke eine Zone nur nach Prüfung mit dem passenden
Event-Bereich (Teilaktion `link`). `inherit_to_days` im Plan ist für einen
allgemeinen Parent-Plan gedacht und braucht wegen der Wirkung auf alle
Festtage eine Bestätigung.

## Export und Illustration

`cai.plan.11.export` erzeugt eine Darstellung als PNG oder PDF.
`cai.plan.12.illustrate` erzeugt Layout-Referenz, Strukturdaten und Prompt, aber
kein fertiges Bild. Ein Bildmodell erstellt die Illustration außerhalb von
Comvenio; nach dem Upload (`cai.data.06.upload`) legt `cai.plan.13.compose` mit
der `illustration_file_id` die echten Beschriftungen deterministisch darüber.

Export, Illustration und Komposition sind kritisch und laufen über Vorschau und
`comvenio action confirm`. Nenne die erzeugten Dateien. Erfinde keine
serverseitige Bildgenerierung.

## Schutzregeln

Eine ausdrückliche Bestätigung ist erforderlich vor:

- Löschen eines Plans, einer Zone, eines Tisches, Markers oder Gastvereins,
- Lösen einer Zone-Area-Verknüpfung,
- `inherit_to_days` für alle Festtage,
- größeren Duplikationen oder weitreichenden Koordinatenänderungen.

Lies vor Positionsänderungen immer den aktuellen Plan. Verwende ausschließlich
`comvenio`, für Agentenaufrufe `--json`, und wiederhole unklare Mutationen nicht
automatisch.

## Abschluss

Prüfe `cai.plan.02.show` erneut und berichte Planart, enthaltene Elemente,
Festtagsbezug sowie erzeugte Export- oder Bilddateien.
