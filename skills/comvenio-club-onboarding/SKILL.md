---
name: comvenio-club-onboarding
description: >
  Begleitet die strukturierte Ersteinrichtung eines Vereins mit dem Comvenio
  CLI: Profil, Einstellungen, Abteilungen, Mitgliedsstatus, Mitgliederimport,
  Teams, Gebäude, Objekte, Dateien und öffentliche Homepage. Verwende diesen
  Skill bei einem neuen Verein, Ersteinrichtung, Datenübernahme oder Onboarding.
---

# Comvenio Vereins-Onboarding

## Verbindlicher OAuth-Pfad

Im Standardmodus zuerst `comvenio whoami --json` und `comvenio action list
--json` ausführen. Fachoperationen ausschließlich mit der dort sichtbaren
kanonischen Action-ID und ihrem `input_schema` über `comvenio action call`
aufrufen. Die Domain-Aliase in den Beispielen gelten nur für den expliziten
Device-Token-Kompatibilitätsmodus; niemals durch direkte HTTP-Aufrufe ersetzen.

## Ziel

Richte einen Verein etappenweise ein. Jede Etappe erhält eine sichtbare
Änderungsübersicht, eigene Freigabe und Abschlussprüfung. Es gibt keinen
transaktionalen Alles-auf-einmal-Befehl und keinen globalen Rollback.

## Bestandsaufnahme

```bash
comvenio whoami --json
comvenio club info --json
comvenio club settings --json
comvenio club department-list --tree --json
comvenio member status-list --json
comvenio member list --json
comvenio team list --json
comvenio object building list --with-rooms --json
comvenio homepage show --json
```

Prüfe außerdem vorhandene Objekte und benötigte Dateiablagen. Markiere Daten,
die bereits existieren, damit nichts doppelt angelegt wird.

## Etappenplan

1. Vereinsprofil, Sprache, Zeitzone und notwendige Einstellungen.
2. Abteilungen und Mitgliedsstatus.
3. Mitgliederimport ausschließlich als Vorschau.
4. Familien, Teams, Kader und Ressourcen-Prioritäten.
5. Gebäude, Räume, Objekte und Regeln.
6. Geschützte Dateiablagen.
7. Öffentliche Homepage mit Vorschau und Verifier.
8. Optionale Folgepakete wie Veranstaltungen, News und Sponsoring über die
   jeweiligen Fachskills.

Zeige vor jeder Etappe Ziele, Datensätze, Anzahl und kritische Wirkung. Ein
pauschales „alles übernehmen“ ersetzt diese Freigaben nicht.

## Fachskills verwenden

Nutze `comvenio-club`, `comvenio-members`, `comvenio-bookings`,
`comvenio-data` und `comvenio-homepage` als belegte Fachabläufe. Mitglieder
werden zuerst mit `preview: true` importiert. Design beginnt mit `club design
--dry-run`; Homepage-Inhalte beginnen mit Preview und enden mit
`comvenio verify homepage --json`.

Rollen und Berechtigungen sowie die Verwaltung einer eigenen Domain sind nicht
als CLI-Aktionen belegt. Erfinde dafür keine Befehle und nutze keine direkte
Schnittstelle.

## Schutzregeln

Eine ausdrückliche Bestätigung ist pro Etappe erforderlich, besonders vor
Profil- oder Settings-Änderungen, Live-Design, Import-Reconciliation,
Löschungen, Homepage-Apply und öffentlichen Dateien.

Verwende ausschließlich `comvenio`, für Agentenaufrufe `--json`, und wiederhole
unklare Mutationen nicht automatisch. Bei Fehlern stoppt die aktuelle Etappe;
bereits abgeschlossene Etappen werden nicht verschwiegen.

## Abschluss

Lies alle eingerichteten Bereiche erneut und liefere eine Checkliste aus
erledigt, geprüft, offen und nicht per CLI unterstützt.
