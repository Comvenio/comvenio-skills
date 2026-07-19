---
name: comvenio-meetings
description: >
  Begleitet Vereinsverantwortliche durch Sitzungsserien, konkrete Sitzungen,
  Tagesordnungen, Teilnehmer, Notizen, Abstimmungen, Beschlüsse, Protokolle und
  Veröffentlichung mit dem Comvenio CLI. Verwende diesen Skill immer bei
  Vorstandssitzung, Mitgliederversammlung, TOP, Protokoll, Abstimmung,
  Entscheidung oder Beschluss.
---

# Comvenio Meetings und Protokolle

## Ziel

Führe den Verein durch den gesamten Sitzungsablauf, ohne Phasen oder
Freigabeschritte zu überspringen. Unterscheide Sitzungsserie, konkrete Sitzung,
Tagesordnungspunkt, Entscheidung, Beschluss und veröffentlichte Reinschrift.

## Vorbereitung

1. Prüfe Nutzer und Verein:

   ```bash
   comvenio whoami --json
   comvenio club info --json
   ```

2. Lade den aktuellen Vertrag:

   ```bash
   comvenio schema meeting --json
   comvenio meeting --help
   ```

3. Kläre:
   - Art und Abteilung der Sitzung,
   - einmalige Sitzung oder wiederkehrende Serie,
   - zugehöriger Veranstaltungstermin,
   - Protokollart und notwendige Freigabe,
   - Tagesordnung, Teilnehmer und geplante Entscheidungen.

Nutze komplexe Daten als JSON-Datei. Für eigene CLI-Aufrufe ist `--json`
verbindlich.

## Sitzungsserie und konkretes Protokoll

Lies zuerst vorhandene Serien:

```bash
comvenio meeting series-list --json
comvenio meeting protocol-list --json
```

Lege bei einem regelmäßigen Gremium zuerst eine Serie und anschließend für den
konkreten Termin ein Protokoll an:

```bash
comvenio meeting series-create --file meeting-series.json --json
comvenio meeting protocol-create --file protocol.json --json
comvenio meeting protocol-show <protocol-id> --json
```

Vermeide doppelte Serien. Verknüpfe einen echten Termin mit der passenden
Veranstaltung.

## Tagesordnung vorbereiten

```bash
comvenio meeting agenda-list <protocol-id> --json
comvenio meeting agenda-create <protocol-id> --file agenda-item.json --json
comvenio meeting agenda-reorder <protocol-id> --file order.json --json
```

Zeige dem Nutzer die sortierte Tagesordnung mit geschätzten Zeiten. Löschen oder
vollständiges Umsortieren erfordert eine Bestätigung, wenn es nicht schon
ausdrücklich beauftragt wurde.

## Sitzung durchführen

- Markiere Teilnehmer und Anwesenheit vor Abstimmungen korrekt.
- Starte immer nur den tatsächlich behandelten TOP.
- Erstelle Entscheidungen nur am aktuell behandelten TOP.
- Unterscheide Diskussion, Notiz, Zusammenfassung und offizielle Reinschrift.
- Carry-over-TOPs können zusätzlich die konkrete Protokoll-ID benötigen.

Typischer Ablauf:

```bash
comvenio meeting participant-list <protocol-id> --json
comvenio meeting agenda-start <agenda-id> --protocol <protocol-id> --json
comvenio meeting note-create --file note.json --json
comvenio meeting agenda-complete <agenda-id> --protocol <protocol-id> --json
```

## Entscheidungen und Abstimmungen

Vor einer Abstimmung müssen TOP, Teilnehmerkreis, Stimmberechtigung,
Mehrfachauswahl, Vertretungswahl und Sichtbarkeit fachlich feststehen.

```bash
comvenio meeting decision-create <agenda-id> --file decision.json --json
comvenio meeting voting-open <decision-id> --json
comvenio meeting voting-results <decision-id> --json
comvenio meeting voting-close <decision-id> --json
```

Offline-Zähler dürfen nicht geraten werden. Vor absolutem Setzen oder
Korrigieren eines Zählers muss der Nutzer den Wert bestätigen.

Eine Entscheidung wird nur dann als Beschluss übernommen, wenn dies fachlich
gewollt ist:

```bash
comvenio meeting decision-promote <decision-id> --number <nummer> --json
```

## Reinschrift und Veröffentlichung

Die offizielle Reinschrift entsteht erst in der vorgesehenen Protokollphase.
Jeder behandelte TOP benötigt einen Eintrag, bevor die Freigabephase erreicht
werden kann.

```bash
comvenio meeting protocol-validation <protocol-id> --json
comvenio meeting entry-list <protocol-id> --json
comvenio meeting protocol-publish <protocol-id> --json
```

Vor Phasenwechsel, Rücksprung oder Veröffentlichung:

1. aktuellen Protokollstand lesen,
2. fehlende Einträge und Bestätigungen nennen,
3. ausdrückliche Bestätigung des Nutzers einholen, sofern der Auftrag dies nicht
   bereits eindeutig umfasst,
4. Aktion ausführen und Ergebnis erneut lesen.

Die vorgegebene Phasenfolge wird nicht umgangen.

## Schutzregeln

- Ausschließlich das `comvenio` CLI verwenden.
- Keine privaten Assistentenentwürfe oder technische Spezialzugänge imitieren.
- Keine Abstimmung für abwesende oder nicht stimmberechtigte Personen erfinden.
- Löschen, Rücksprung, Schließen einer Abstimmung und Veröffentlichen sind
  weitreichende Schritte.
- Bei fehlendem Recht den betroffenen Sitzungsablauf benennen und nicht auf
  technische Auswege wechseln.

## Abschluss

Melde:

- Sitzung und aktuellen Stand,
- erledigte TOPs und offene Punkte,
- Ergebnis einer Abstimmung oder eines Beschlusses,
- fehlende Freigaben vor der Veröffentlichung.

Zeige Namen und verständliche Statusbegriffe statt roher Kennungen.
