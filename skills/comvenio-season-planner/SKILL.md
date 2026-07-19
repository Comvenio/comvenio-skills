---
name: comvenio-season-planner
description: >
  Plant wiederkehrende Trainings, Spielzeiten und Jahrestermine über Vorlagen,
  Serien und materialisierte Veranstaltungen mit dem Comvenio CLI. Verwende
  diesen Skill bei Saisonplanung, regelmäßigen Terminen, Heimspielen,
  Ferienzeiträumen, Ressourcenbuchungen und saisonalen Aufgaben.
---

# Comvenio Saisonplanung

## Ziel

Erzeuge aus einer verständlichen Saisonplanung kontrollierte Eventserien und
konkrete Termine. Termine, Buchungen und Aufgaben werden in getrennten,
prüfbaren Etappen angelegt.

## Vorbereitung

```bash
comvenio whoami --json
comvenio club info --json
comvenio event template list --json
comvenio event series list --json
```

Kläre Zeitzone, Beginn, Ende, Wochentage, Uhrzeit, Dauer, Ferien und Ausnahmen,
Abteilung, Sichtbarkeit sowie benötigte Räume oder Geräte. Lies vorhandene
Vorlagen, Serien, Buchungsregeln, Belegung und Ressourcennutzung.

## Planung zeigen

Zeige vor dem Schreiben:

- Vorlage und Serientyp,
- Zeitraum und erwartete Terminanzahl,
- Wochentage, Uhrzeit und Zeitzone,
- bekannte Ausnahmen,
- Ressourcen und mögliche Konflikte,
- nachgelagerte Buchungen und Aufgaben.

Es gibt keinen gemeinsamen Saison-Trockenlauf und keine automatische
Konfliktauflösung. Ferien müssen als konkrete ausgeschlossene Zeiträume belegt
sein.

## Serie umsetzen

Der belegte Ablauf ist Vorlage → Serie → Materialisierung. `materialize` ist für
dasselbe Fenster idempotent, erzeugt aber reale Termine. Lies danach mit
`event list --start --end` und `event series next` den erzeugten Stand.

Jährliche Veranstaltungen werden als manuell geplante Jahrestermine behandelt,
nicht wie eine normale automatische Wochenserie. Buchungen und Aufgaben werden
erst nach den konkreten Terminen in eigenen Etappen ergänzt.

## Schutzregeln

Eine ausdrückliche Bestätigung ist erforderlich vor großen
Materialisierungsfenstern, dauerhaften Serienänderungen, Serienlöschung,
Promote-Aktionen, vielen Buchungen oder Aufgaben und dem bewussten Akzeptieren
bekannter Konflikte.

Verwende ausschließlich `comvenio`, für Agentenaufrufe `--json`, und wiederhole
unklare Mutationen nicht automatisch. Es gibt keinen globalen Rollback über
Events, Buchungen und Aufgaben.

## Abschluss

Melde Vorlage, Serie, tatsächlich erzeugte Termine, Ausnahmen, Ressourcen sowie
separat erfolgreiche oder offene Buchungs- und Aufgabenblöcke.
