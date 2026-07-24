---
name: comvenio-bookings
description: >
  Verwaltet Gebäude, Räume, buchbare Objekte, Regeln, Reservierungen und
  Teilnehmer mit dem Comvenio CLI. Verwende diesen Skill bei Raum- oder
  Gerätebuchungen, offenen Anfragen, Genehmigungen, Serienbuchungen,
  Buchungsregeln und Auslastungen.
---

# Comvenio Buchungen und Objekte

## Verbindlicher OAuth-Pfad

Im Standardmodus zuerst `comvenio whoami --json` und `comvenio action list
--json` ausführen. Fachoperationen ausschließlich mit der dort sichtbaren
kanonischen Action-ID und ihrem `input_schema` über `comvenio action call`
aufrufen. Die Domain-Aliase in den Beispielen gelten nur für den expliziten
Device-Token-Kompatibilitätsmodus; niemals durch direkte HTTP-Aufrufe ersetzen.

## Ziel

Finde das richtige Objekt, prüfe Regeln und bestehende Belegung und führe
Buchungsentscheidungen nachvollziehbar aus.

## Vorbereitung

```bash
comvenio whoami --json
comvenio club info --json
comvenio object --help
comvenio booking --help
comvenio object building list --with-rooms --json
comvenio object list --with-all --json
```

Lies das Zielobjekt mit `object show --with-all`, seine Buchungsregeln und die
vorhandenen Buchungen im relevanten Zeitraum. Kläre Titel, Beginn, Ende,
verantwortliches Mitglied, Teilnehmer und ob eine Einzel- oder Sammelbuchung
gewünscht ist.

## Buchung anlegen

Erstelle komplexe Buchungen über eine geprüfte UTF-8-JSON-Datei:

```bash
comvenio booking list --object-id <object-id> --json
comvenio booking create --file booking.json --json
comvenio booking show <booking-id> --json
```

Für Sammelbuchungen zeige vorher alle Zeiten, Objekte, Gruppen und die Anzahl
der erzeugten Reservierungen. Es gibt keinen einheitlichen Trockenlauf; deshalb
sind Bestands- und Regelprüfung besonders wichtig.

## Anfragen entscheiden

```bash
comvenio booking list --pending --json
comvenio booking show <booking-id> --json
```

Zeige Antragsteller, Objekt, Zeitraum und mögliche Konflikte. `approve`,
`reject`, `cancel` oder `delete` erst nach eindeutigem Auftrag oder Bestätigung
ausführen. Die eigene Buchung darf nicht über eine vermeintliche Sonderregel
genehmigt werden; Rechte prüft Comvenio.

## Gebäude, Räume und Regeln

Gebäude, Räume und Objekte bilden eine Hierarchie. Lies Kinder und Regeln vor
Änderungen. `--force` bei einer Löschung kann untergeordnete Daten mit entfernen
und braucht immer eine gesonderte Bestätigung. Buchungs- und Task-Regeln werden
vor Update oder Delete einzeln angezeigt.

## Schutzregeln

Bestätigung ist erforderlich vor Genehmigung, Ablehnung, Stornierung, Löschung,
Bulk-Buchung, rückwirkender Buchung, Buchung im Namen eines anderen Mitglieds
und jeder `--force`-Löschung. Teilnehmerentfernung und Gruppenanlage werden mit
Namen und Anzahl zusammengefasst.

Anonyme öffentliche Abläufe und nicht vorhandene Provider-Importe werden nicht
über direkte Schnittstellen umgangen. Verwende ausschließlich `comvenio`, für
Agentenaufrufe `--json`, und wiederhole unklare Mutationen nicht automatisch.

## Abschluss

Lies Buchung oder Objekt erneut und melde Objektname, Zeitraum, Status,
Teilnehmer und noch offene Entscheidung.
