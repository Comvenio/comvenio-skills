---
name: comvenio-members
description: >
  Verwaltet Mitglieder, Familien, Mitgliedsstatus, Mitgliedschaftszeiträume,
  Teams und Team-Ressourcen eines Vereins mit dem Comvenio CLI. Verwende diesen
  Skill bei Mitgliederlisten, Importen, Ein- oder Austritten, Familien,
  Mannschaften, Kadern und Ressourcen-Prioritäten.
---

# Comvenio Mitglieder und Teams

## Verbindlicher OAuth-Pfad

Im Standardmodus zuerst `comvenio whoami --json` und `comvenio action list
--json` ausführen. Fachoperationen ausschließlich mit der dort sichtbaren
kanonischen Action-ID und ihrem `input_schema` über `comvenio action call`
aufrufen. Die Domain-Aliase in den Beispielen gelten nur für den expliziten
Device-Token-Kompatibilitätsmodus; niemals durch direkte HTTP-Aufrufe ersetzen.

## Ziel

Pflege Mitgliederdaten nachvollziehbar und datensparsam. Zeige dem Nutzer Namen
und fachliche Auswirkungen; personenbezogene Rohdaten und technische Kennungen
werden nur verarbeitet, soweit der Auftrag sie benötigt.

## Vorbereitung

```bash
comvenio whoami --json
comvenio club info --json
comvenio member --help
comvenio team --help
comvenio member list --json
```

Lade je nach Auftrag zusätzlich Familien, Statuswerte, Mitgliedschaftszeiträume,
Abteilungen oder Teams. Ermittle IDs anhand der Namen. Eine Member-ID ist keine
User-ID.

## Mitglieder sicher pflegen

Lies vor einer Änderung immer den betroffenen Datensatz:

```bash
comvenio member show <member-id> --json
comvenio member update <member-id> --phone '<telefon>' --json
comvenio member show <member-id> --json
```

Neue Mitglieder können einzeln angelegt werden. Familien, Mitgliedsstatus und
Mitgliedschaftszeiträume haben eigene `list`, `show`, `add`, `update` und
`delete`-Abläufe. Prüfe gültige Felder unmittelbar vorher über `--help` und das
verfügbare Schema.

## Import

Ein Import beginnt immer als Vorschau:

```bash
comvenio member import --file import.json --json
```

Die Datei muss beim ersten Lauf `preview: true` enthalten. Zeige danach Anzahl,
neue und geänderte Mitglieder sowie Warnungen. `reconcile_absent_members: true`
kann fehlende Bestandsmitglieder als ausgetreten markieren und darf erst nach
geprüfter Vorschau und ausdrücklicher Bestätigung ausgeführt werden.

## Teams und Kader

```bash
comvenio team list --json
comvenio team show <team-id> --json
comvenio team member list <team-id> --json
comvenio team resource list <team-id> --json
```

Lege Teams über eine geprüfte JSON-Datei an. Löse Abteilung, Mitglieder und
buchbare Ressourcen zuerst lesend auf. Prüfe nach Kader- oder
Ressourcenänderungen die jeweilige Liste erneut.

## Schutzregeln

Eine ausdrückliche Bestätigung ist erforderlich, sofern noch nicht eindeutig
beauftragt, vor:

- Entfernen eines Mitglieds, einer Familie, eines Status oder Zeitraums,
- Löschen eines Teams oder Entfernen aus einem Kader,
- Entfernen einer Ressourcen-Priorität,
- einem echten Import ohne Vorschau,
- jeder Bestandsabstimmung mit `reconcile_absent_members: true`.

Rollen und Berechtigungen lassen sich derzeit nicht mit dem CLI verwalten.
Provider-Synchronisationen werden nicht über technische Umwege ausgeführt.
Verwende ausschließlich `comvenio`, für Agentenaufrufe `--json`, und wiederhole
unklare Schreibvorgänge nicht automatisch.

## Abschluss

Lies die geänderten Datensätze erneut. Melde Anzahl, Namen, Status, Team- oder
Familienzuordnung und noch offene Freigaben, ohne unnötige personenbezogene
Daten auszugeben.
