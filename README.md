# Comvenio Skills

Offizielle Agent Skills für Vereinsverantwortliche, die Comvenio mit Claude,
Codex oder einem anderen kompatiblen KI-Assistenten über das `comvenio` CLI
bedienen möchten.

Die 18 Skills erklären dem Assistenten nicht nur einzelne Befehle. Sie geben ihm
einen sicheren Arbeitsablauf: den richtigen Verein prüfen, vorhandene Daten
lesen, gültige Felder über das CLI ermitteln, Änderungen verständlich
vorbereiten und kritische Schritte erst nach Ihrer Freigabe ausführen.

## Voraussetzungen

- Das offizielle `comvenio` CLI ist installiert.
- Sie haben `comvenio login` ausgeführt und die Verbindung im geöffneten
  Comvenio-Browserfenster bestätigt.
- Ihr KI-Assistent unterstützt Agent Skills.

Zugangsdaten werden nicht im Chat eingegeben. OAuth-Secrets liegen im
geschützten Betriebssystemspeicher; die Skills lesen oder protokollieren sie
nicht. Sie verwenden nur die für den angemeldeten Verein und die aktuellen
Rechte sichtbaren `comvenio action`-Funktionen.

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
| `comvenio-club` | Vereinsprofil, Einstellungen, Abteilungen und Grunddesign |
| `comvenio-members` | Mitglieder, Familien, Status, Import, Teams und Kader |
| `comvenio-bookings` | Gebäude, Räume, Objekte, Regeln und Buchungen |
| `comvenio-events` | Veranstaltungen, Terminserien, Festtage, Bereiche, Programm und Einladungen |
| `comvenio-homepage` | Öffentliche Vereinswebsite, Design, Vorschau, Qualitätsprüfung und eigene Domain |
| `comvenio-meetings` | Sitzungsserien, Tagesordnung, Protokolle, Abstimmungen und Beschlüsse |
| `comvenio-supply` | Gerichte, Getränke, Allergene, Speisekarten und Einkaufslisten |
| `comvenio-tasks` | Aufgaben, Zuständigkeiten, Checklisten, Notizen und Fälligkeiten |
| `comvenio-tournaments` | Turnierserien, Teilnehmer, Auslosung, Spielplan und Ergebnisse |
| `comvenio-news` | News-Entwürfe, Vorschau, Bilder, Videos und Veröffentlichung |
| `comvenio-data` | Dateien, Ordner, Rechte, Papers und Exporte |
| `comvenio-plans` | Geländepläne, Zonen, Tische, Marker und Besucherillustrationen |
| `comvenio-sponsors` | Sponsoren, Pakete, Vertragsstände und Event-Zuordnungen |
| `comvenio-event-day` | Gesamtcheck und Koordination eines Veranstaltungstags |
| `comvenio-volunteers` | Helfer, Bereichsleitungen und zugehörige Aufgaben |
| `comvenio-season-planner` | Trainingsserien, Saisontermine, Ressourcen und Aufgaben |
| `comvenio-club-onboarding` | Etappenweise Ersteinrichtung eines Vereins |

Die Fach-Skills bearbeiten einen klaren Bereich. Die vier Workflow-Skills
`comvenio-event-day`, `comvenio-volunteers`, `comvenio-season-planner`
und `comvenio-club-onboarding`
verbinden mehrere Fachbereiche, führen Änderungen aber weiterhin etappenweise
und mit getrennten Prüfungen aus.

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

```text
Prüfe, ob für das Sommerfest morgen Bereiche, Helfer, Aufgaben, Speisekarten
und Geländeplan vollständig vorbereitet sind.
```

```text
Richte unseren neuen Verein ein, aber zeige mir vor jeder Etappe genau, was du
ändern möchtest.
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

Fehlt für einen gewünschten Ablauf eine Action, erklärt der Assistent die
Lücke und nennt den Weg in der Comvenio-Web-App. Er umgeht sie nicht über
versteckte technische Schnittstellen.

Derzeit nicht per CLI unterstützt sind insbesondere Rollen und Berechtigungen,
Community- oder Channel-Moderation, ClubAgent-Administration und wesentliche
Finanzabläufe. Eine eigene Domain wird in der Comvenio-Web-App angebunden.

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

Nutzen Sie das passende
[Issue-Formular](https://github.com/Comvenio/comvenio-skills/issues/new/choose).
Sicherheitsprobleme werden gemäß [SECURITY.md](SECURITY.md) ausschließlich
privat gemeldet.

## Mitwirken und Lizenz

Hinweise für Beiträge stehen in [CONTRIBUTING.md](CONTRIBUTING.md). Änderungen
werden im [CHANGELOG.md](CHANGELOG.md) dokumentiert.

Die Comvenio Skills sind unter der
[Apache License 2.0](LICENSE) veröffentlicht.
