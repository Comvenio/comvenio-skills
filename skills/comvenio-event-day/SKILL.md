---
name: comvenio-event-day
description: >
  Bereitet einen Veranstaltungstag domänenübergreifend vor und prüft Bereiche,
  Helfer, Programm, Ressourcen, Aufgaben, Buchungen, Speisekarten, Dateien,
  Sponsoren und Geländeplan mit dem Comvenio CLI. Verwende diesen Skill bei
  Ablaufcheck, Festvorbereitung, Einsatzleitung oder Veranstaltungsabschluss.
---

# Comvenio Veranstaltungstag

## Ziel

Gib dem Verein eine verständliche Einsatzübersicht und führe Änderungen in
kleinen, getrennt prüfbaren Etappen aus. Es gibt keinen atomaren
Event-Day-Befehl und keinen automatischen Rollback über mehrere Bereiche.

## Bestandsaufnahme

```bash
comvenio whoami --json
comvenio club info --json
comvenio event show <event-id> --json
comvenio event area list <event-id> --json
comvenio event program list <event-id> --json
comvenio event registration stats <event-id> --json
comvenio plan list <event-id> --json
```

Lies zusätzlich Zuweisungen, Bereichsleitungen, Ressourcen, Anhänge, Menüs,
Sponsoren, relevante Aufgaben, Buchungen und Dateien. Bei einem mehrtägigen
Fest gehören Programm und Tagesinhalte an das jeweilige Child-Event.

## Tagescheck berichten

Strukturiere den Stand nach:

1. Termin, Status und Sichtbarkeit,
2. Bereiche, Leitungen und Helfer,
3. Programm und Kontakte,
4. Räume, Objekte und Buchungen,
5. Aufgaben und Checklisten,
6. Speisekarten, Dateien, Sponsoren und Geländeplan,
7. offene Risiken und Entscheidungen.

Erfinde keine automatische Vollständigkeits- oder Konfliktbewertung. Belege
jeden Hinweis mit den gelesenen Daten.

## Änderungen etappenweise ausführen

Verwende die Fachabläufe aus `comvenio-events`, `comvenio-volunteers`,
`comvenio-tasks`, `comvenio-bookings`, `comvenio-supply`, `comvenio-data`,
`comvenio-sponsors` und `comvenio-plans`. Zeige pro Fachbereich die geplanten
Änderungen und prüfe den neuen Stand, bevor du zum nächsten Block wechselst.

Eine allgemeine Benachrichtigungsaktion ist nicht belegt. Sage offen, wenn der
Nutzer Helfer außerhalb des CLI informieren muss.

## Schutzregeln

Eine ausdrückliche Bestätigung ist erforderlich vor Veröffentlichung,
Löschung, Leeren von Zuweisungen, vollständigem Ersetzen von Ressourcen,
Korrektur oder Löschung von Anmeldungen, Buchungsentscheidungen, öffentlichen
Dateien, Bulk-Aufgaben sowie dem Entfernen von Sponsor- oder Menüverknüpfungen.

Verwende ausschließlich `comvenio`, für Agentenaufrufe `--json`, und wiederhole
unklare Mutationen nicht automatisch. Bei einem Fehler stoppt der aktuelle
Block; bereits erfolgreiche andere Blöcke werden transparent genannt.

## Abschluss

Lies Event und betroffene Fachlisten erneut und verwende
`comvenio verify event <event-id> --json`. Melde erledigte, geprüfte und offene
Punkte als Einsatzübersicht.
