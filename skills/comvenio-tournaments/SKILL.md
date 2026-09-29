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

Führe den Verein kontrolliert vom wiederverwendbaren Turnierkonzept bis zum
abgeschlossenen Ergebnis. Schütze insbesondere Auslosung, Spielplan und
Ergebnisse vor versehentlichen Vollersatz- oder Reset-Aktionen.

## Vorbereitung

```bash
comvenio whoami --json
comvenio action list --json
```

Maßgeblich ist das `input_schema` der jeweiligen `cai.tournament.*`-Action.

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
comvenio action call cai.tournament.01.series_list --input '{"limit":50,"offset":0}' --json
comvenio action call cai.tournament.03.series_create \
  --input '{"series":{<serie nach input_schema>}}' --json
comvenio action call cai.tournament.06.execution_create \
  --input '{"series_id":"<series-id>","execution":{<ausführung nach input_schema>}}' --json
comvenio action call cai.tournament.09.show --input '{"tournament_id":"<tournament-id>"}' --json
```

Lege keine zweite Serie an, wenn eine vorhandene Serie fachlich passt. Eine
konkrete Austragung wird als Ausführung der Serie erstellt und kann mit
`cai.tournament.07.execution_link` mit einer Veranstaltung verbunden werden.

### Teilnehmer

```bash
comvenio action call cai.tournament.13.participants --input '{"tournament_id":"<tournament-id>"}' --json
comvenio action call cai.tournament.15.participant \
  --input '{"tournament_id":"<tournament-id>","name":"<name>","participant_kind":"individual"}' --json
comvenio action call cai.tournament.14.mannschaft \
  --input '{"tournament_id":"<tournament-id>","name":"<name>","participant_kind":"team","seed":<nummer>}' --json
```

Ein Turnierteilnehmer ist nicht automatisch ein Comvenio-Team. `team`,
`individual` und `pair` beschreiben die Teilnahmeart.

Prüfe Namen, Teilnahmeart und Setzpositionen vor der Auslosung.

## Auslosung

Erstelle einen nachvollziehbaren `draw_plan` aus dem aktuellen
Teilnehmerbestand:

```bash
comvenio action call cai.tournament.26.draw \
  --input '{"tournament_id":"<tournament-id>","draw_plan":{"strategy":"seeded"}}' --json
```

Zeige dem Nutzer Gruppen, feste Zuordnungen, Qualifikationsregeln und
Platzierungsmodus. Erst nach Bestätigung:

```bash
comvenio action call cai.tournament.27.draw_confirm --input '{"tournament_id":"<tournament-id>"}' --json
comvenio action confirm \
  --preview-id <preview-id> \
  --confirmation-token <confirmation-token> \
  --idempotency-key <idempotency-key>
```

`cai.tournament.27.draw_confirm` ergänzt materialisierte Spiele. Für eine
vollständige Neuauslosung ist der vorgesehene Workflow:

```bash
comvenio action call cai.tournament.23.redraw \
  --input '{"tournament_id":"<tournament-id>","draw_plan":{"strategy":"seeded"}}' --json
comvenio action confirm \
  --preview-id <preview-id> \
  --confirmation-token <confirmation-token> \
  --idempotency-key <idempotency-key>
```

Ein Re-Draw verändert den bestehenden Spielplan weitreichend und benötigt immer
eine eindeutige Bestätigung.

## Spielplan

Erzeuge zuerst einen Trockenlauf:

```bash
comvenio action call cai.tournament.28.schedule_generate \
  --input '{"tournament_id":"<tournament-id>","match_minutes":<minuten>,"break_minutes":<minuten>,"field_count":<anzahl>,"first_kickoff":"<iso>","dry_run":true}' --json
```

Prüfe Überschneidungen, Pausen, Felder und Endzeit. Wende den Plan erst danach
mit `"dry_run":false` an; die Action läuft über Vorschau und
`comvenio action confirm`. Einzelne Spiele terminiert
`cai.tournament.29.match_schedule` gezielt.

## Ergebnisse

Lies vor jedem Ergebnis das konkrete Spiel und nenne beide Teilnehmer:

```bash
comvenio action call cai.tournament.20.matches --input '{"tournament_id":"<tournament-id>"}' --json
comvenio action call cai.tournament.31.match_result \
  --input '{"match_id":"<match-id>","score_home":<zahl>,"score_away":<zahl>}' --json
comvenio action call cai.tournament.24.standings --input '{"tournament_id":"<tournament-id>"}' --json
```

Für Satzresultate und Sonderwertungen verwende ausschließlich die Felder aus
dem `input_schema` von `cai.tournament.31.match_result` (`score`,
`result_type`, `winner_side_id`). Bei Walkover, Nichtantritt oder Aufgabe müssen
Gewinner und vorhandener Teilstand fachlich geklärt sein.

## Vorschau und Prüfung

```bash
comvenio action call cai.tournament.25.preview --input '{"tournament_id":"<tournament-id>"}' --json
comvenio action call cai.tournament.24.standings --input '{"tournament_id":"<tournament-id>"}' --json
```

Zeige dem Nutzer vor Start beziehungsweise Veröffentlichung die Vorschau von
Teilnehmern, Gruppen und Spielplan.

## Schutzregeln

Eine ausdrückliche Bestätigung ist erforderlich, sofern nicht bereits eindeutig
beauftragt, vor:

- `cai.tournament.27.draw_confirm` und insbesondere `cai.tournament.23.redraw`,
- `cai.tournament.22.reset`, `cai.tournament.21.matches_clear` oder Löschen
  eines Spiels,
- Entfernen oder Zurückziehen eines Teilnehmers,
- Löschen einer Serie oder Ausführung,
- Eintragen oder Korrigieren eines Ergebnisses mit unklarer Zuordnung,
- Statuswechsel zu aktiv, abgeschlossen oder abgebrochen.

Weitere Regeln:

- Verwende ausschließlich das `comvenio` CLI.
- Setze für Agentenaufrufe `--json`.
- Nutze vor dem Spielplan immer den Trockenlauf (`"dry_run":true`).
- Wiederhole Mutationen nach einem unklaren Fehler nicht blind.
- Berichte Namen, Uhrzeiten, Felder und Ergebnisse statt roher IDs.

## Abschluss

Melde:

- Serie und konkrete Austragung,
- Teilnehmerzahl und Teilnahmearten,
- bestätigte Auslosung und Spielplan,
- offene Konflikte oder fehlende Ergebnisse,
- Stand der Tabelle und durchgeführte Prüfung.
