# Changelog

Alle wichtigen Änderungen an den Comvenio Skills werden in dieser Datei
dokumentiert. Die Einträge folgen
[Keep a Changelog](https://keepachangelog.com/de/1.1.0/) und verwenden
[Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Added

- Apache-2.0-Lizenz für den öffentlich installierbaren Skill-Katalog.
- Strukturierte Formulare für Fehler, Wünsche und Supportfragen.
- Privater Meldeweg und Sicherheitsrichtlinie für Schwachstellen.
- Beitragsrichtlinie für Issues und Pull Requests.
- Action-Katalog `catalog/actions.json` als Kopie des Abschnitts „Befehle und
  Actions“ der CLI-Dokumentation, erneuert mit
  `scripts/sync-action-catalog.mjs`.
- Befehlsprüfung in `scripts/validate-skills.mjs`: Jeder `comvenio`-Aufruf muss
  zur Befehlsfläche gehören (`login`, `logout`, `whoami`,
  `action list|call|confirm`, `agent chat`, `finance`, `help`), jede genannte
  Action-ID im Katalog stehen; Geräte-Token sowie `club_id` oder
  `confirmation` in `--input` sind Funde. Ein fehlender Katalog beendet die
  Prüfung mit Exit 2. Markierte Gegenbeispiele (`<!-- klassisch-beispiel -->`)
  sind ausgenommen.
- Fixture-Tests für die Befehlsprüfung, Teil von `npm test`.

### Changed

- Alle 18 Skills arbeiten nur noch über `comvenio login`, `comvenio whoami` und
  `comvenio action list|call|confirm`. Jeder frühere Domänenbefehl ist durch die
  gleichwertige Action ersetzt, Teilaktionen laufen über `"operation"`,
  kritische Schritte über `comvenio action confirm`. Wo es keine Action gibt,
  nennt der Skill den Weg in der Comvenio-Web-App.

### Removed

- Hinweise auf Geräte-Token und den Kompatibilitätsmodus mit klassischen
  Domänenbefehlen.

