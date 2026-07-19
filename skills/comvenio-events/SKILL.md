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

## Ziel

Setze den Veranstaltungswunsch eines Vereins in einen sicheren, nachvollziehbaren
CLI-Ablauf um. Halte wiederverwendbare Vorlagen, konkrete Termine und
mehrtägige Festtage fachlich auseinander.

## Vor dem ersten Befehl

1. Prüfe Identität und Verein mit `comvenio whoami --json` und
   `comvenio club info --json`.
2. Lade den aktuellen Vertrag:

   ```bash
   comvenio schema event --json
   comvenio event --help
   ```

3. Kläre nur die fachlich fehlenden Angaben:
   - Titel und Art der Veranstaltung,
   - einzelner Termin, wiederkehrende Serie oder mehrtägiges Fest,
   - Datum, Uhrzeit, Zeitzone und Dauer,
   - Sichtbarkeit,
   - Abteilung und verantwortliche Person,
   - Ort sowie gewünschte Anmeldung oder Einladung.

Erfinde keine Enum-Werte oder IDs. Ermittle Abteilungen, Mitglieder und
bestehende Veranstaltungen lesend über das CLI.

## Passenden Veranstaltungsweg wählen

### Einzeltermin

Lies zuerst ähnliche Termine. Lege dann einen Entwurf oder geplanten Termin an:

```bash
comvenio event list --json
comvenio event create --file event.json --json
comvenio event show <event-id> --json
```

Veröffentliche erst, wenn Inhalt, Sichtbarkeit und Zeitpunkt stimmen:

```bash
comvenio verify event <event-id> --json
comvenio event publish <event-id> --public --json
```

`publish` bestätigt die Veranstaltung; es gibt keinen eigenen Status
`published`.

### Wiederkehrendes Training

Verwende den vorgesehenen Dreischritt:

```bash
comvenio event template create --file template.json --json
comvenio event series create <template-id> --start-time <iso> \
  --frequency weekly --weekdays <tage> --duration-minutes <minuten> --json
comvenio event series materialize <series-id> \
  --start <iso> --end <iso> --json
```

Kläre den Zeitraum der konkreten Termine. `materialize` kann für dasselbe
Zeitfenster erneut ausgeführt werden, ohne vorhandene Termine zu duplizieren.

### Jährliche Veranstaltung

Nutze eine jährlich geplante Serie und lege jeden nächsten Termin bewusst an.
Verwende keine wöchentliche Regel nur deshalb, weil das Ereignis wiederkehrt.

### Mehrtägiges Fest

Modelliere das Gesamtfest als öffentliches Parent-Event und jeden Festtag als
Child-Event. Programm, Galerie und tagesbezogene Inhalte gehören an den
jeweiligen Festtag. Zeige dem Nutzer das Gesamtfest als eine zusammengehörige
Veranstaltung.

## Bereiche und Programm

- Lies vorhandene Bereiche vor Änderungen.
- Die automatisch angelegte Default-Area wird niemals gelöscht.
- Verwende für mehrere Bereiche oder komplexe Daten eine JSON-Datei.
- Programmpunkte eines mehrtägigen Fests gehören an den Festtag.
- `resource add` ergänzt Ressourcen. `resource set` ersetzt die vollständige
  Menge und ist nur zulässig, wenn alle Ziele bekannt sind.
- Dateien werden zuerst mit `comvenio data upload ... --json` hochgeladen und
  danach fachlich als Anhang verknüpft.

Typische Prüfungen:

```bash
comvenio event area list <event-id> --json
comvenio event program list <event-id> --json
comvenio event registration stats <event-id> --json
```

## Einladungen und Anmeldungen

Unterscheide:

- Vereinsmitglieder einladen,
- andere Comvenio-Vereine einladen,
- externe Vereine per E-Mail einladen,
- Teilnehmer manuell anmelden.

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
`comvenio verify event <event-id> --json`. Berichte:

- welche Veranstaltung oder Serie angelegt beziehungsweise geändert wurde,
- welche Termine und Sichtbarkeit gelten,
- was geprüft wurde,
- welche Veröffentlichung oder organisatorische Entscheidung noch offen ist.
