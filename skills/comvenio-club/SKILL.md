---
name: comvenio-club
description: >
  Pflegt Vereinsprofil, Einstellungen, Abteilungen und Grunddesign mit dem
  Comvenio CLI. Verwende diesen Skill bei Vereinsdaten, Adresse, Kontakt,
  Datenschutz, Sprache, Zeitzone, Abteilungsstruktur, Farben oder Club-Design.
---

# Comvenio Vereinseinstellungen

## Ziel

Ändere nur den beauftragten Teil der Vereinseinstellungen und bewahre alle
nicht genannten Werte. Öffentliche Darstellung und sensible Einstellungen
werden vor dem Schreiben sichtbar zusammengefasst.

## Vorbereitung

```bash
comvenio whoami --json
comvenio club info --json
comvenio club settings --json
comvenio club department-list --tree --json
comvenio club --help
```

Kläre, ob Profil, Einstellungen, Abteilungen oder Design gemeint sind. Bei
mehreren Vereinen muss der Zielverein eindeutig sein.

## Profil und Einstellungen

`club update --file` ändert Profildaten partiell. `settings-update --file`
arbeitet als Deep Merge. Verwende als Grundlage immer den aktuellen Stand und
zeige exakt, welche Felder sich ändern. Nicht dokumentierte Felder werden nicht
geraten.

Datenschutz-, Zahlungs-, SEO-, Feature- und Benachrichtigungseinstellungen
haben größere Wirkung und benötigen eine klare Freigabe.

## Abteilungen

Lies den Abteilungsbaum und die gewählte Abteilung im Detail. Prüfe Parent,
Name, verantwortliches Mitglied und betroffene Unterabteilungen. Vor einer
Löschung zeige bekannte Folgen und fordere Bestätigung.

Rollen und Berechtigungen können derzeit nicht über das CLI verwaltet werden.

## Design

Vor jeder Design-Mutation:

```bash
comvenio homepage show --json
comvenio club design --file design-settings.json --dry-run --json
```

Nach Freigabe anwenden, eine Homepage-Vorschau erzeugen und mit
`comvenio verify homepage --json` prüfen. Eigenes CSS und Design-Tokens sind
weitreichende Änderungen und werden besonders deutlich gezeigt.

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
