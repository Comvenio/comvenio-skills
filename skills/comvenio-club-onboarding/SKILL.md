---
name: comvenio-club-onboarding
description: >
  Begleitet die strukturierte Ersteinrichtung eines Vereins mit dem Comvenio
  CLI: Profil, Einstellungen, Abteilungen, Mitgliedsstatus, Mitgliederimport,
  Teams, Gebäude, Objekte, Dateien und öffentliche Homepage. Verwende diesen
  Skill bei einem neuen Verein, Ersteinrichtung, Datenübernahme oder Onboarding.
---

# Comvenio Vereins-Onboarding

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

Richte einen Verein etappenweise ein. Jede Etappe erhält eine sichtbare
Änderungsübersicht, eigene Freigabe und Abschlussprüfung. Es gibt keinen
transaktionalen Alles-auf-einmal-Befehl und keinen globalen Rollback.

## Bestandsaufnahme

```bash
comvenio whoami --json
comvenio action list --json
comvenio action call cai.club.03.settings --input '{}' --json
comvenio action call cai.club.06.department_list --input '{"tree":true}' --json
comvenio action call cai.member.12.status_list --input '{}' --json
comvenio action call cai.member.01.list --input '{"limit":50,"offset":0}' --json
comvenio action call cai.team.01.list --input '{}' --json
comvenio action call cai.object.06.building_list_show_create_update_delete \
  --input '{"operation":"list","with_rooms":true}' --json
comvenio action call cai.homepage.03.show --input '{"operation":"private"}' --json
```

Prüfe außerdem vorhandene Objekte (`cai.object.01.list`) und benötigte
Dateiablagen (`cai.data.17.children`). Markiere Daten,
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
`comvenio-data` und `comvenio-homepage` als belegte Fachabläufe. Der
Mitgliederimport (`cai.member.06.import`) liefert zuerst eine Vorschau und wird
erst nach Freigabe mit `comvenio action confirm` ausgeführt. Design beginnt mit
dem Vergleich der geplanten Werte gegen `cai.club.03.settings`, weil
`cai.club.05.design` keinen Trockenlauf hat; Homepage-Inhalte beginnen mit
`cai.homepage.01.preview` und enden mit `cai.verify.04.homepage`.

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
