---
name: comvenio-tournaments
description: >
  Plant und steuert Turniere mit dem Comvenio CLI: Turnierserie, konkrete
  Ausführung, Teilnehmer, Anmeldung, Auslosung, Gruppen und K.-o.-Phase,
  Spielplan, Zeiten, Ergebnisse, Sonderwertungen und Tabelle. Verwende diesen
  Skill immer bei Turnier, Meisterschaft, Mannschaften, Teilnehmern, Auslosung,
  Spielplan, Re-Draw, Ergebnis oder Platzierung.
---

# Comvenio Turniere

## Ziel

Führe den Verein kontrolliert vom wiederverwendbaren Turnierkonzept bis zum
abgeschlossenen Ergebnis. Schütze insbesondere Auslosung, Spielplan und
Ergebnisse vor versehentlichen Vollersatz- oder Reset-Aktionen.

## Vorbereitung

```bash
comvenio whoami --json
comvenio club info --json
comvenio schema tournament --json
comvenio tournament --help
```

Kläre:

- Sportart und Turnierformat,
- internes oder öffentliches Turnier,
- Einzel, Doppel oder Mannschaft,
- Termin, Anmeldeschluss und Teilnehmergrenzen,
- Gruppen-/K.-o.-Regeln,
- Felder, Spieldauer und Pausen,
- automatische oder manuelle Auslosung,
- Wertungsart und mögliche Sonderergebnisse.

Erfinde keine Template-, Format- oder Statuswerte. Nutze das aktuelle Schema und
vorhandene Serien.

## Kanonischer Ablauf

```text
Serie → Ausführung → Anmeldung → Teilnehmer → Auslosung → Spielplan → Aktiv → Ergebnisse → Abschluss
```

### Serie und Ausführung

```bash
comvenio tournament series-list --json
comvenio tournament series-create --file series.json --json
comvenio tournament execution-create <series-id> --file execution.json --json
comvenio tournament show <tournament-id> --json
```

Lege keine zweite Serie an, wenn eine vorhandene Serie fachlich passt. Eine
konkrete Austragung wird als Ausführung der Serie erstellt und kann mit einer
Veranstaltung verbunden werden.

### Teilnehmer

```bash
comvenio tournament participants <tournament-id> --json
comvenio tournament participant <tournament-id> \
  --name "<name>" --kind individual --json
comvenio tournament mannschaft <tournament-id> \
  --name "<name>" --seed <nummer> --json
```

Ein Turnierteilnehmer ist nicht automatisch ein Comvenio-Team. `team`,
`individual` und `pair` beschreiben die Teilnahmeart.

Prüfe Namen, Teilnahmeart und Setzpositionen vor der Auslosung.

## Auslosung

Erstelle eine nachvollziehbare Draw-Datei aus dem aktuellen Teilnehmerbestand:

```bash
comvenio tournament draw <tournament-id> --file draw.json --json
```

Zeige dem Nutzer Gruppen, feste Zuordnungen, Qualifikationsregeln und
Platzierungsmodus. Erst nach Bestätigung:

```bash
comvenio tournament draw-confirm <tournament-id> --json
```

`draw-confirm` ergänzt materialisierte Spiele. Für eine vollständige
Neuauslosung ist der vorgesehene Workflow:

```bash
comvenio tournament redraw <tournament-id> --file draw.json --json
```

Ein Re-Draw verändert den bestehenden Spielplan weitreichend und benötigt immer
eine eindeutige Bestätigung.

## Spielplan

Erzeuge zuerst einen Trockenlauf:

```bash
comvenio tournament schedule-generate <tournament-id> \
  --match-minutes <minuten> \
  --break-minutes <minuten> \
  --field-count <anzahl> \
  --first-kickoff <iso> \
  --dry-run \
  --json
```

Prüfe Überschneidungen, Pausen, Felder und Endzeit. Wende den Plan erst danach
ohne `--dry-run` an. Einzelne Spiele können gezielt terminiert werden.

## Ergebnisse

Lies vor jedem Ergebnis das konkrete Spiel und nenne beide Teilnehmer:

```bash
comvenio tournament matches <tournament-id> --json
comvenio tournament match-result <match-id> --home <zahl> --away <zahl> --json
comvenio tournament standings <tournament-id> --json
```

Für Satzresultate und Sonderwertungen verwende ausschließlich die Syntax aus
`comvenio tournament --help`. Bei Walkover, Nichtantritt oder Aufgabe müssen
Gewinner und vorhandener Teilstand fachlich geklärt sein.

## Vorschau und Prüfung

```bash
comvenio tournament preview <tournament-id> --json
comvenio tournament standings <tournament-id> --json
```

Zeige dem Nutzer vor Start beziehungsweise Veröffentlichung die Vorschau von
Teilnehmern, Gruppen und Spielplan.

## Schutzregeln

Eine ausdrückliche Bestätigung ist erforderlich, sofern nicht bereits eindeutig
beauftragt, vor:

- `draw-confirm` und insbesondere `redraw`,
- `reset`, `matches-clear` oder Löschen eines Spiels,
- Entfernen oder Zurückziehen eines Teilnehmers,
- Löschen einer Serie oder Ausführung,
- Eintragen oder Korrigieren eines Ergebnisses mit unklarer Zuordnung,
- Statuswechsel zu aktiv, abgeschlossen oder abgebrochen.

Weitere Regeln:

- Verwende ausschließlich das `comvenio` CLI.
- Setze für Agentenaufrufe `--json`.
- Nutze vor dem Spielplan immer den Trockenlauf.
- Wiederhole Mutationen nach einem unklaren Fehler nicht blind.
- Berichte Namen, Uhrzeiten, Felder und Ergebnisse statt roher IDs.

## Abschluss

Melde:

- Serie und konkrete Austragung,
- Teilnehmerzahl und Teilnahmearten,
- bestätigte Auslosung und Spielplan,
- offene Konflikte oder fehlende Ergebnisse,
- Stand der Tabelle und durchgeführte Prüfung.
