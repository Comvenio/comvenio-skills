---
name: comvenio-volunteers
description: >
  Koordiniert Helfer, Bereichsleitungen und zugehörige Aufgaben für
  Veranstaltungen mit dem Comvenio CLI. Verwende diesen Skill bei
  Helfereinteilung, Bereichsbesetzung, Einsatzleitung, Verantwortlichkeiten,
  Schichtwünschen oder Aufgabenverteilung.
---

# Comvenio Helferkoordination

## Ziel

Ordne vorhandene Vereinsmitglieder nachvollziehbar zu Bereichen und Aufgaben
zu. Behaupte keine Verfügbarkeit und kein automatisches Matching, wenn diese
Informationen nicht im CLI vorliegen.

## Vorbereitung

```bash
comvenio whoami --json
comvenio club info --json
comvenio event show <event-id> --json
comvenio event area list <event-id> --json
comvenio member list --json
comvenio task context list --json
```

Lies pro Bereich bestehende Assignments und Leads sowie passende Aufgaben.
Kläre benötigte Personenanzahl, bekannte Wünsche, Verantwortlichkeiten und
Fälligkeiten. Zuweisungen verwenden Member-IDs; Event-Einladungen können andere
Kennungen erwarten und werden nicht verwechselt.

## Vorschlag erstellen

Zeige vor Änderungen eine Tabelle oder Liste mit:

- Bereich und Zeitraum,
- bereits zugewiesenen Helfern,
- Bereichsleitung,
- zugehörigen Aufgaben,
- offenen Besetzungen,
- nicht belegbaren Annahmen wie Verfügbarkeit.

Eine gleichmäßige Verteilung ist nur ein Vorschlag. Ohne belegte
Verfügbarkeiten darf sie nicht als konfliktfrei bezeichnet werden.

## Zuweisen und prüfen

Verwende `event assignment list|add|remove|clear`, `event lead` sowie die
belegten `task`-, `task assignment`- und `task checklist`-Abläufe. Prüfe nach
jeder Etappe Assignments, Leads und Aufgaben erneut.

Eine allgemeine automatische Benachrichtigung an Helfer ist nicht belegt. Sage
offen, welcher Kommunikationsschritt beim Verein verbleibt.

## Schutzregeln

Eine ausdrückliche Bestätigung ist erforderlich vor `assignment clear`,
Entfernen oder Ersetzen von Helfern, Entfernen einer Bereichsleitung,
Bulk-Aufgaben, Umhängen einer Verantwortlichkeit sowie Abbrechen oder Löschen
einer Aufgabe.

Zeige vor Zuweisungen immer die aufgelösten Mitgliedsnamen. Verwende
ausschließlich `comvenio`, für Agentenaufrufe `--json`, und wiederhole unklare
Schreibvorgänge nicht automatisch.

## Abschluss

Melde je Bereich Leitung, Helfer, Aufgaben, offene Plätze und noch nötige
Kommunikation nach erneuter Prüfung.
