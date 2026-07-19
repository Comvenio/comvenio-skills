# Comvenio Skills

Offizielle Agent Skills für Vereinsverantwortliche, die Comvenio mit Claude,
Codex oder einem anderen kompatiblen KI-Assistenten über das `comvenio` CLI
bedienen möchten.

Die Skills erklären dem Assistenten nicht nur einzelne Befehle. Sie geben ihm
einen sicheren Arbeitsablauf: den richtigen Verein prüfen, vorhandene Daten
lesen, gültige Felder über das CLI ermitteln, Änderungen verständlich
vorbereiten und kritische Schritte erst nach Ihrer Freigabe ausführen.

## Voraussetzungen

- Das offizielle `comvenio` CLI ist installiert.
- Sie haben in Comvenio unter **Einstellungen → CLI-Zugriff** ein persönliches
  Zugriffstoken erstellt und das CLI damit verbunden.
- Ihr KI-Assistent unterstützt Agent Skills.

Das persönliche Token gehört nur in den lokalen Login-Befehl. Senden Sie es
nicht im Chat und speichern Sie es nicht in Projektdateien.

## Installation

Alle Comvenio Skills für alle erkannten Assistenten installieren:

```bash
npx skills add Comvenio/comvenio-skills --all
```

Nur einen bestimmten Skill installieren:

```bash
npx skills add Comvenio/comvenio-skills --skill comvenio-events -y
```

Verfügbare Skills vor der Installation anzeigen:

```bash
npx skills add Comvenio/comvenio-skills --list
```

## Verfügbare Skills

| Skill | Unterstützt bei |
|---|---|
| `comvenio-cli` | Anmeldung, Vereinsauswahl, sichere Bedienung und allgemeine Fragen |
| `comvenio-events` | Veranstaltungen, Terminserien, Festtage, Bereiche, Programm und Einladungen |
| `comvenio-homepage` | Öffentliche Vereinswebsite, Design, Vorschau, Qualitätsprüfung und eigene Domain |
| `comvenio-meetings` | Sitzungsserien, Tagesordnung, Protokolle, Abstimmungen und Beschlüsse |
| `comvenio-supply` | Gerichte, Getränke, Allergene, Speisekarten und Einkaufslisten |
| `comvenio-tasks` | Aufgaben, Zuständigkeiten, Checklisten, Notizen und Fälligkeiten |
| `comvenio-tournaments` | Turnierserien, Teilnehmer, Auslosung, Spielplan und Ergebnisse |

## Beispiele

Nach der Installation können Sie in normaler Vereinssprache schreiben:

```text
Lege ab September jeden Mittwoch um 19 Uhr ein zweistündiges Darttraining an.
```

```text
Erstelle aus dieser Getränkeliste eine Speisekarte. Zeige sie mir, bevor sie
veröffentlicht wird.
```

```text
Bereite die Tagesordnung für unsere Vorstandssitzung vor und übernimm die
offenen Punkte aus dem letzten Protokoll.
```

Der Assistent verwendet intern maschinenlesbare CLI-Ausgaben. Ihnen zeigt er
Namen, Ergebnisse und notwendige Entscheidungen – keine unnötigen technischen
Kennungen.

## Sicherheitsprinzipien

- Die Skills verwenden ausschließlich das offizielle `comvenio` CLI.
- Rechte werden von Comvenio anhand Ihres Benutzerkontos geprüft.
- Vor Änderungen wird der aktuelle Stand gelesen.
- Löschen, Zurücksetzen, Überschreiben und Veröffentlichen benötigen eine
  eindeutige Beauftragung oder Bestätigung.
- Vorschauen und Trockenläufe werden genutzt, wenn der jeweilige Bereich sie
  anbietet.
- Zugangstoken, Passwörter und interne Infrastruktur werden weder angefordert
  noch ausgegeben.

Fehlt für einen gewünschten Ablauf ein CLI-Befehl, erklärt der Assistent die
Lücke. Er umgeht sie nicht über versteckte technische Schnittstellen.

## Aktualisieren oder entfernen

```bash
npx skills update
npx skills remove comvenio-events
```

## Support

Fehler und Verbesserungsvorschläge können im
[GitHub-Repository](https://github.com/Comvenio/comvenio-skills/issues)
gemeldet werden. Bitte keine Zugriffstoken, Passwörter oder personenbezogenen
Vereinsdaten in öffentliche Issues schreiben.
