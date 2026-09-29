---
name: comvenio-club
description: >
  Pflegt Vereinsprofil, Einstellungen, Abteilungen und Grunddesign mit dem
  Comvenio CLI. Verwende diesen Skill bei Vereinsdaten, Adresse, Kontakt,
  Datenschutz, Sprache, Zeitzone, Abteilungsstruktur, Farben oder Club-Design.
---

# Comvenio Vereinseinstellungen

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

Ändere nur den beauftragten Teil der Vereinseinstellungen und bewahre alle
nicht genannten Werte. Öffentliche Darstellung und sensible Einstellungen
werden vor dem Schreiben sichtbar zusammengefasst.

## Vorbereitung

```bash
comvenio whoami --json
comvenio action list --json
comvenio action call cai.club.03.settings --input '{}' --json
comvenio action call cai.club.06.department_list --input '{"tree":true}' --json
```

Den Vereinsnamen liefert `whoami`; Einstellungen und Abteilungsbaum liefern die
beiden Actions.

Kläre, ob Profil, Einstellungen, Abteilungen oder Design gemeint sind. Bei
mehreren Vereinen muss der Zielverein eindeutig sein.

## Profil und Einstellungen

`cai.club.02.update` ändert Profildaten partiell über `changes`.
`cai.club.04.settings_update` arbeitet als Deep Merge über `settings`.

```bash
comvenio action call cai.club.02.update \
  --input '{"changes":{"email_address":"vorstand@beispielverein.de"}}' --json
comvenio action call cai.club.04.settings_update \
  --input '{"settings":{"locale_settings":{"timezone":"Europe/Berlin"}}}' --json
```

Verwende als Grundlage immer den aktuellen Stand und zeige exakt, welche Felder
sich ändern. Nicht dokumentierte Felder werden nicht
geraten.

Datenschutz-, Zahlungs-, SEO-, Feature- und Benachrichtigungseinstellungen
haben größere Wirkung und benötigen eine klare Freigabe.

## Abteilungen

Lies den Abteilungsbaum und die gewählte Abteilung im Detail
(`cai.club.07.department_show` mit `department_id`). Prüfe Parent, Name,
verantwortliches Mitglied und betroffene Unterabteilungen. Anlegen und Ändern
laufen über `cai.club.08.department_add` und `cai.club.09.department_update`.

Vor einer Löschung zeige bekannte Folgen und fordere Bestätigung. Die Löschung
ist kritisch und läuft über Vorschau und Freigabe:

```bash
comvenio action call cai.club.10.department_delete \
  --input '{"department_id":"<department-id>"}' --json
# Antwort enthält preview_id und confirmation_token
comvenio action confirm \
  --preview-id <preview-id> \
  --confirmation-token <confirmation-token> \
  --idempotency-key <idempotency-key>
```

Rollen und Berechtigungen laufen über die Actions `cai.role.*` (Übersicht: `comvenio action list --json`, Ablauf: `comvenio help rollen-rechte`); kritische Änderungen gehen über Vorschau und `comvenio action confirm`.

## Design

Vor jeder Design-Mutation:

```bash
comvenio action call cai.homepage.03.show --input '{"operation":"private"}' --json
comvenio action call cai.club.03.settings --input '{}' --json
```

`cai.club.05.design` hat keinen Trockenlauf. Zeige deshalb die geplanten Werte
in `design_settings` neben dem aktuellen Stand und wende sie erst nach Freigabe
an; nicht angegebene Felder bleiben erhalten:

```bash
comvenio action call cai.club.05.design \
  --input '{"design_settings":{"primary_color":"#123456"}}' --json
```

Danach eine Homepage-Vorschau erzeugen (Skill `comvenio-homepage`) und mit
`cai.verify.04.homepage` (`"operation":"live"`) prüfen. Eigenes CSS und
Design-Tokens sind weitreichende Änderungen und werden besonders deutlich
gezeigt.

## Schutzregeln

Eine ausdrückliche Bestätigung ist erforderlich vor Änderungen an offiziellen
Vereins- und Kontaktdaten, sensiblen Settings, Abteilungslöschung, öffentlichem
Design sowie eigenem CSS oder Tokens.

Homepage-Inhalte gehören in den Skill `comvenio-homepage`. Token sind keine
Vereinseinstellung. Verwende ausschließlich `comvenio`, für Agentenaufrufe
`--json`, und wiederhole unklare Schreibvorgänge nicht automatisch.

## Abschluss

Lies Profil, Settings, Abteilung oder Homepage erneut und melde nur die
tatsächlich geänderten Werte sowie das Prüfergebnis.
