---
name: comvenio-plans
description: >
  Erstellt und pflegt Gelände-, Flucht- und Detailpläne für Veranstaltungen
  mit dem Comvenio CLI: Zonen, Tische, Marker, Gastvereine, Export und
  Illustration. Verwende diesen Skill bei Lageplan, Geländeplan, Festzelt,
  Besucherkarte, Parkplätzen oder Fluchtwegen.
---

# Comvenio Geländepläne

## Ziel

Baue einen fachlich korrekten Veranstaltungsplan schrittweise auf und bewahre
bei visuellen Varianten die räumliche Struktur und exakten Beschriftungen.

## Vorbereitung

```bash
comvenio whoami --json
comvenio club info --json
comvenio plan --help
comvenio event show <event-id> --json
comvenio plan list <event-id> --json
```

Lies einen vorhandenen Plan mit `plan show`. Kläre Veranstaltung oder Festtag,
Planart, Abmessungen, Zonen, Wege, Tische, Marker, Gäste und ob ein Plan für
alle Festtage gelten soll.

## Plan aufbauen

```bash
comvenio plan create <event-id> --name '<name>' --json
comvenio plan zone create <plan-id> --name '<zone>' --length <m> --width <m> --json
comvenio plan marker create <plan-id> --marker-type parking --label 'Parken' --json
comvenio plan show <plan-id> --json
```

Ergänze Zonen, Tische, Marker und Gäste in kleinen, prüfbaren Schritten. Verlinke
eine Zone nur nach Prüfung mit dem passenden Event-Bereich. `--inherit` ist für
einen allgemeinen Parent-Plan gedacht und braucht wegen der Wirkung auf alle
Festtage eine Bestätigung.

## Export und Illustration

`plan export` erzeugt eine lokale Darstellung. `plan illustrate` erzeugt
Layout-Referenz, Strukturdaten und Prompt, aber kein fertiges Bild. Ein
Bildmodell erstellt die Illustration außerhalb des CLI; `plan compose` legt
anschließend die echten Beschriftungen deterministisch darüber.

Zeige lokale Zielpfade und beachte: Export, Illustration und Komposition
benötigen `playwright-cli`. Erfinde keine serverseitige Bildgenerierung.

## Schutzregeln

Eine ausdrückliche Bestätigung ist erforderlich vor:

- Löschen eines Plans, einer Zone, eines Tisches, Markers oder Gastvereins,
- Lösen einer Zone-Area-Verknüpfung,
- `--inherit` für alle Festtage,
- größeren Duplikationen oder weitreichenden Koordinatenänderungen.

Lies vor Positionsänderungen immer den aktuellen Plan. Verwende ausschließlich
`comvenio`, für Agentenaufrufe `--json`, und wiederhole unklare Mutationen nicht
automatisch.

## Abschluss

Prüfe `plan show` erneut und berichte Planart, enthaltene Elemente,
Festtagsbezug sowie erzeugte Export- oder Bilddateien.
