---
name: comvenio-season-planner
description: >
  Plant wiederkehrende Trainings, Spielzeiten und Jahrestermine über Vorlagen,
  Serien und materialisierte Veranstaltungen mit dem Comvenio CLI. Verwende
  diesen Skill bei Saisonplanung, regelmäßigen Terminen, Heimspielen,
  Ferienzeiträumen, Ressourcenbuchungen und saisonalen Aufgaben.
---

# Comvenio Saisonplanung

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

Erzeuge aus einer verständlichen Saisonplanung kontrollierte Eventserien und
konkrete Termine. Termine, Buchungen und Aufgaben werden in getrennten,
prüfbaren Etappen angelegt.

## Vorbereitung

```bash
comvenio whoami --json
comvenio action list --json
comvenio action call cai.event.07.template_list_create_clone_instantiate \
  --input '{"operation":"list"}' --json
comvenio action call cai.event.08.series_list_show_create_materialize_promote_recurring_promote_yearly_n \
  --input '{"operation":"list"}' --json
```

Kläre Zeitzone, Beginn, Ende, Wochentage, Uhrzeit, Dauer, Ferien und Ausnahmen,
Abteilung, Sichtbarkeit sowie benötigte Räume oder Geräte. Lies vorhandene
Vorlagen, Serien, Buchungsregeln
(`cai.object.08.booking_rule_list_show_create_bulk_update_delete`), Belegung
(`cai.booking.01.list`) und Ressourcennutzung (Teilaktion `usage` von
`cai.event.15.resource_list_add_set_remove_link_show_link_update_link_delete_usage_u`).

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

Der belegte Ablauf ist Serie mit Wiederholungsregel → Materialisierung, beide
über `cai.event.08.series_list_show_create_materialize_promote_recurring_promote_yearly_n`
(Teilaktionen `create` und `materialize`). `materialize` ist für dasselbe
Fenster idempotent, erzeugt aber reale Termine und läuft deshalb über Vorschau
und `comvenio action confirm`. Lies danach mit `cai.event.01.list` (`range`
über den Zeitraum) und der Teilaktion `show` der Serie den erzeugten Stand.

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
