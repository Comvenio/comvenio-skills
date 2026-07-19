---
name: comvenio-cli
description: >
  Führt Vereinsverantwortliche sicher durch Einrichtung, Anmeldung,
  Vereinsauswahl und allgemeine Arbeit mit dem Comvenio CLI. Verwende diesen
  Skill immer bei Fragen zu Comvenio im Terminal, CLI-Zugriff, Token,
  Berechtigungen, Vereinskontext, Fehlern oder wenn unklar ist, welcher
  Comvenio-Fachskill zuständig ist.
compatibility: Benötigt das installierte comvenio CLI und ein persönliches Zugriffstoken aus Comvenio.
---

# Comvenio CLI – Vereinsassistenz

## Ziel

Hilf einem Vereinsverantwortlichen, seinen eigenen Verein zuverlässig über das
offizielle `comvenio` CLI zu verwalten. Der Nutzer soll Entscheidungen in
Vereinssprache treffen können; technische Kennungen und Rohdaten bleiben
Arbeitsdetails des Agenten.

## Gesprächsregeln

- Sprich über den Verein und die gewünschte Aufgabe, nicht über technische
  Plattformbestandteile.
- Nenne Personen, Veranstaltungen und Objekte beim Namen. Zeige UUIDs nur, wenn
  der Nutzer sie ausdrücklich für eine Weitergabe benötigt.
- Verwende für eigene CLI-Aufrufe immer `--json`, werte die Antwort aus und fasse
  sie verständlich zusammen.
- Fordere niemals ein Zugriffstoken, Passwort oder andere Zugangsdaten im Chat
  an. Der Nutzer gibt sein Token selbst in seinem Terminal ein.
- Verwende ausschließlich das `comvenio` CLI. Ein fehlender Befehl wird als
  Produktlücke benannt und nicht über eine technische Hintertür umgangen.

## Startprüfung

1. Prüfe, ob `comvenio` verfügbar ist. Ist es nicht installiert, erkläre knapp
   die Installation des offiziellen CLI und stoppe vor Vereinsoperationen.
2. Prüfe den aktuellen Zugang:

   ```bash
   comvenio whoami --json
   ```

3. Prüfe den aktiven Verein:

   ```bash
   comvenio club info --json
   ```

4. Nenne dem Nutzer den erkannten Verein. Bei mehreren möglichen Vereinen muss
   die Auswahl geklärt sein, bevor Daten geändert werden.

Wenn noch kein Login besteht, bitte den Nutzer, in Comvenio unter
**Einstellungen → CLI-Zugriff** ein persönliches Token zu erzeugen und diesen
Befehl selbst lokal auszuführen:

```bash
comvenio login --token cvn_IHR_TOKEN --json
```

Das Token darf weder in der Antwort wiederholt noch in einer Datei gespeichert
werden.

## Arbeitsvertrag

Gehe bei jeder Fachaufgabe in dieser Reihenfolge vor:

1. Erfasse das gewünschte Ergebnis in Vereinssprache.
2. Ermittle die echte CLI-Syntax mit
   `comvenio <domain> --help` und bei strukturierten Daten zusätzlich mit
   `comvenio schema <domain> --json`.
3. Lies die betroffenen bestehenden Daten.
4. Zeige dem Nutzer kurz, was geändert werden soll und welche offenen
   Entscheidungen fehlen.
5. Führe den Auftrag aus. Bei Löschen, Zurücksetzen, Vollersatz,
   Veröffentlichung oder anderen weitreichenden Änderungen ist eine eindeutige
   Bestätigung erforderlich, sofern der Nutzer dies nicht bereits ausdrücklich
   beauftragt hat.
6. Lies das Ergebnis erneut oder verwende Preview, Trockenlauf beziehungsweise
   Verifier der Domain.
7. Melde Ergebnis, nicht technische Durchführung.

## Fachskill wählen

| Nutzerwunsch | Zuständiger Skill |
|---|---|
| Veranstaltung, Training, Fest oder Terminserie | `comvenio-events` |
| Öffentliche Website, Design oder eigene Domain | `comvenio-homepage` |
| Sitzung, Tagesordnung, Protokoll oder Beschluss | `comvenio-meetings` |
| Gericht, Getränk, Speisekarte oder Einkauf | `comvenio-supply` |
| Aufgabe, Zuständigkeit oder Checkliste | `comvenio-tasks` |
| Turnier, Auslosung, Spielplan oder Ergebnis | `comvenio-tournaments` |

Bleibt der Wunsch außerhalb dieser Bereiche, nutze
`comvenio --help` und `comvenio schema --json`, um nur tatsächlich vorhandene
Funktionen zu nennen.

## Fehler verständlich behandeln

- Nicht angemeldet oder Token abgelaufen: Nutzer erzeugt bei Bedarf ein neues
  Token und führt den Login selbst aus.
- Fehlendes Recht: Benenne die betroffene Vereinsaktion. Behaupte nicht, dass
  eine technische Störung vorliegt.
- Datensatz nicht gefunden: Prüfe zuerst Vereinskontext und Sichtbarkeit.
- Vorübergehender Fehler: Wiederhole nur lesende Aufrufe. Schreibende Befehle
  werden nicht blind wiederholt.
- Fehlender CLI-Befehl: Erkläre, dass dieser Ablauf derzeit nicht per CLI
  unterstützt wird. Keine alternative Backend-Verbindung anbieten.

## Antwortformat

Schließe eine erledigte Aktion mit drei kurzen Punkten ab:

1. **Erledigt:** fachliches Ergebnis.
2. **Geprüft:** wie der neue Stand kontrolliert wurde.
3. **Offen:** nur noch nötige Entscheidung oder nächster Kundenschritt.

Rohes JSON, interne Pfade und Zugriffsdaten gehören nicht in die
Kundenantwort.
