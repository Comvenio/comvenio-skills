---
name: comvenio-bookings
description: >
  Verwaltet Gebäude, Räume, buchbare Objekte, Regeln, Reservierungen und
  Teilnehmer mit dem Comvenio CLI. Verwende diesen Skill bei Raum- oder
  Gerätebuchungen, offenen Anfragen, Genehmigungen, Serienbuchungen,
  Buchungsregeln und Auslastungen.
---

# Comvenio Buchungen und Objekte

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

Finde das richtige Objekt, prüfe Regeln und bestehende Belegung und führe
Buchungsentscheidungen nachvollziehbar aus.

## Vorbereitung

```bash
comvenio whoami --json
comvenio action list --json
comvenio action call cai.object.06.building_list_show_create_update_delete \
  --input '{"operation":"list","with_rooms":true}' --json
comvenio action call cai.object.01.list --input '{"limit":100,"offset":0}' --json
```

Lies das Zielobjekt mit `cai.object.02.show`, seine Buchungsregeln
(`cai.object.08.booking_rule_list_show_create_bulk_update_delete` mit
`"operation":"list_object"`) und die vorhandenen Buchungen im relevanten
Zeitraum. Kläre Titel, Beginn, Ende,
verantwortliches Mitglied, Teilnehmer und ob eine Einzel- oder Sammelbuchung
gewünscht ist.

## Buchung anlegen

Erstelle Buchungen aus einer geprüften Eingabe nach dem `input_schema` von
`cai.booking.03.create`. Die Anlage ist kritisch und läuft über Vorschau und
Freigabe:

```bash
comvenio action call cai.booking.01.list \
  --input '{"operation":"list_object","object_id":"<object-id>","from":"2026-10-01T00:00:00+02:00","to":"2026-10-31T23:59:59+01:00","timezone":"Europe/Berlin"}' --json
comvenio action call cai.booking.03.create --input '<json nach input_schema>' --json
comvenio action confirm \
  --preview-id <preview-id> \
  --confirmation-token <confirmation-token> \
  --idempotency-key <idempotency-key>
comvenio action call cai.booking.02.show \
  --input '{"reservation_id":"<reservation-id>","timezone":"Europe/Berlin"}' --json
```

Sammelbuchungen laufen über `cai.booking.09.bulk`.
Für Sammelbuchungen zeige vorher alle Zeiten, Objekte, Gruppen und die Anzahl
der erzeugten Reservierungen. Es gibt keinen einheitlichen Trockenlauf; deshalb
sind Bestands- und Regelprüfung besonders wichtig.

## Anfragen entscheiden

```bash
comvenio action call cai.booking.01.list \
  --input '{"operation":"list","from":"2026-10-01T00:00:00+02:00","to":"2026-10-31T23:59:59+01:00","timezone":"Europe/Berlin"}' --json
comvenio action call cai.booking.02.show \
  --input '{"reservation_id":"<reservation-id>","timezone":"Europe/Berlin"}' --json
```

Offene Anfragen erkennst du am Status in der Liste. Zeige Antragsteller,
Objekt, Zeitraum und mögliche Konflikte. `cai.booking.05.approve`,
`cai.booking.06.reject`, `cai.booking.07.cancel` oder `cai.booking.08.delete`
erst nach eindeutigem Auftrag oder Bestätigung ausführen; alle vier laufen über
Vorschau und `comvenio action confirm`. Die eigene Buchung darf nicht über eine vermeintliche Sonderregel
genehmigt werden; Rechte prüft Comvenio.

## Gebäude, Räume und Regeln

Gebäude, Räume und Objekte bilden eine Hierarchie
(`cai.object.06.building_list_show_create_update_delete`,
`cai.object.07.room_list_show_create_update_delete`, `cai.object.*`). Lies
Kinder und Regeln vor Änderungen. Eine Löschung mit `"force":true` kann
untergeordnete Daten mit entfernen und braucht immer eine gesonderte
Bestätigung. Buchungs- und Task-Regeln werden
vor Update oder Delete einzeln angezeigt.

## Schutzregeln

Bestätigung ist erforderlich vor Genehmigung, Ablehnung, Stornierung, Löschung,
Bulk-Buchung, rückwirkender Buchung, Buchung im Namen eines anderen Mitglieds
und jeder Löschung mit `"force":true`. Teilnehmerentfernung und Gruppenanlage werden mit
Namen und Anzahl zusammengefasst.

Anonyme öffentliche Abläufe und nicht vorhandene Provider-Importe werden nicht
über direkte Schnittstellen umgangen. Verwende ausschließlich `comvenio`, für
Agentenaufrufe `--json`, und wiederhole unklare Mutationen nicht automatisch.

## Abschluss

Lies Buchung oder Objekt erneut und melde Objektname, Zeitraum, Status,
Teilnehmer und noch offene Entscheidung.
