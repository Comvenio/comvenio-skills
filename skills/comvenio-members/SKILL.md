---
name: comvenio-members
description: >
  Verwaltet Mitglieder, Familien, Mitgliedsstatus, Mitgliedschaftszeiträume,
  Teams und Team-Ressourcen eines Vereins mit dem Comvenio CLI. Verwende diesen
  Skill bei Mitgliederlisten, Importen, Ein- oder Austritten, Familien,
  Mannschaften, Kadern und Ressourcen-Prioritäten.
---

# Comvenio Mitglieder und Teams

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

Pflege Mitgliederdaten nachvollziehbar und datensparsam. Zeige dem Nutzer Namen
und fachliche Auswirkungen; personenbezogene Rohdaten und technische Kennungen
werden nur verarbeitet, soweit der Auftrag sie benötigt.

## Vorbereitung

```bash
comvenio whoami --json
comvenio action list --json
comvenio action call cai.member.01.list --input '{"limit":50,"offset":0}' --json
```

Lade je nach Auftrag zusätzlich Familien (`cai.member.07.family_list`),
Statuswerte (`cai.member.12.status_list`), Mitgliedschaftszeiträume
(`cai.member.17.period_list`), Abteilungen (`cai.club.06.department_list`) oder
Teams (`cai.team.01.list`). Ermittle IDs anhand der Namen. Eine Member-ID ist keine
User-ID.

## Mitglieder sicher pflegen

Lies vor einer Änderung immer den betroffenen Datensatz:

```bash
comvenio action call cai.member.02.show --input '{"member_id":"<member-id>"}' --json
comvenio action call cai.member.04.update \
  --input '{"member_id":"<member-id>","changes":{"phone_number":"<telefon>"}}' --json
comvenio action call cai.member.02.show --input '{"member_id":"<member-id>"}' --json
```

Neue Mitglieder werden einzeln mit `cai.member.03.add` angelegt. Familien
(`family_*`), Mitgliedsstatus (`status_*`) und Mitgliedschaftszeiträume
(`period_*`) haben eigene `cai.member.*`-Actions zum Auflisten, Ansehen,
Anlegen, Ändern und Löschen; Löschen ist kritisch. Prüfe gültige Felder
unmittelbar vorher im `input_schema` aus `comvenio action list --json`.

## Import

Die Importdatei wird zuerst hochgeladen (Skill `comvenio-data`,
`cai.data.06.upload`); der Import selbst ist kritisch und beginnt immer mit der
Vorschau der Action:

```bash
comvenio action call cai.member.06.import --input '{"file_id":"<file-id>"}' --json
# Antwort enthält Vorschau, preview_id und confirmation_token
comvenio action confirm \
  --preview-id <preview-id> \
  --confirmation-token <confirmation-token> \
  --idempotency-key <idempotency-key>
```

Zeige vor der Bestätigung Anzahl, neue und geänderte Mitglieder sowie
Warnungen. Markiert die Vorschau fehlende Bestandsmitglieder als ausgetreten,
darf der Import erst nach geprüfter Vorschau und ausdrücklicher Bestätigung
ausgeführt werden.

## Teams und Kader

```bash
comvenio action call cai.team.01.list --input '{}' --json
comvenio action call cai.team.02.show --input '{"team_id":"<team-id>"}' --json
comvenio action call cai.team.06.member_list_add_update_remove \
  --input '{"operation":"list","team_id":"<team-id>"}' --json
comvenio action call cai.team.07.resource_list_add_update_remove \
  --input '{"operation":"list","team_id":"<team-id>"}' --json
```

Lege Teams mit `cai.team.03.create` und einem geprüften `team`-Objekt an.
Kader und Ressourcen-Prioritäten ändern die Teilaktionen `add`, `update` und
`remove` derselben Actions; sie laufen über Vorschau und
`comvenio action confirm`. Löse Abteilung, Mitglieder und
buchbare Ressourcen zuerst lesend auf. Prüfe nach Kader- oder
Ressourcenänderungen die jeweilige Liste erneut.

## Schutzregeln

Eine ausdrückliche Bestätigung ist erforderlich, sofern noch nicht eindeutig
beauftragt, vor:

- Entfernen eines Mitglieds, einer Familie, eines Status oder Zeitraums,
- Löschen eines Teams oder Entfernen aus einem Kader,
- Entfernen einer Ressourcen-Priorität,
- jedem Import (`comvenio action confirm` erst nach geprüfter Vorschau),
- jeder Bestandsabstimmung, die fehlende Mitglieder als ausgetreten markiert.

Rollen und Berechtigungen laufen über die Actions `cai.role.*` (Übersicht: `comvenio action list --json`, Ablauf: `comvenio help rollen-rechte`); kritische Änderungen gehen über Vorschau und `comvenio action confirm`.
Provider-Synchronisationen werden nicht über technische Umwege ausgeführt.
Verwende ausschließlich `comvenio`, für Agentenaufrufe `--json`, und wiederhole
unklare Schreibvorgänge nicht automatisch.

## Abschluss

Lies die geänderten Datensätze erneut. Melde Anzahl, Namen, Status, Team- oder
Familienzuordnung und noch offene Freigaben, ohne unnötige personenbezogene
Daten auszugeben.
