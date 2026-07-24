---
name: comvenio-supply
description: >
  Unterstützt Vereine bei Gerichten, Getränken, Zutaten, Allergenen,
  Speisekarten, Kartendesign und Einkaufslisten mit dem Comvenio CLI.
  Verwende diesen Skill immer bei Speisekarte, Getränkekarte, Essensliste,
  Rezept, Allergen, Zutatenbestand, Festküche, Einkauf oder wenn ein Kunde eine
  Karte aus einem Foto oder Text erstellen möchte.
---

# Comvenio Speisekarten und Einkauf

## Verbindlicher OAuth-Pfad

Im Standardmodus zuerst `comvenio whoami --json` und `comvenio action list
--json` ausführen. Fachoperationen ausschließlich mit der dort sichtbaren
kanonischen Action-ID und ihrem `input_schema` über `comvenio action call`
aufrufen. Die Domain-Aliase in den Beispielen gelten nur für den expliziten
Device-Token-Kompatibilitätsmodus; niemals durch direkte HTTP-Aufrufe ersetzen.

## Ziel

Erstelle wiederverwendbare Rezepte, vollständige Karten und nachvollziehbare
Einkaufslisten. Der Agent interpretiert Text oder Foto selbst; das CLI speichert
die geprüften Daten deterministisch.

## Das fachliche Modell

```text
Zutat mit Allergenen → Rezept → Karten-Eintrag mit Name und Preis → Speisekarte
```

Drei Regeln schützen die Datenqualität:

1. Nutze vorhandene Vorlagen zuerst.
2. Allergene kommen über die Zutaten des Rezepts.
3. Jeder echte Karten-Eintrag erhält eine `recipe_id`.

Ein Eintrag ohne Rezept kann unvollständige Allergeninformationen haben und in
öffentlichen Listen fehlen.

## Vorbereitung

```bash
comvenio whoami --json
comvenio club info --json
comvenio schema menu --json
comvenio menu --help
comvenio recipe --help
comvenio shopping --help
```

Kläre:

- gewünschte Karte oder Einkaufsliste,
- Gerichte, Getränke, Mengen und Preise,
- Gültigkeit beziehungsweise Veranstaltung,
- bekannte Allergene und besondere Hinweise,
- gewünschte Gestaltung,
- ob ein Foto oder eine vorhandene Liste die Quelle ist.

Zeige Unsicherheiten aus einem Foto ausdrücklich. Erfinde keine schwer lesbaren
Preise, Mengen oder Zutaten.

## Vorlagen zuerst

Suche für jedes Gericht und wichtige Zutaten:

```bash
comvenio template dish --search "<gericht>" --json
comvenio template ingredient --search "<zutat>" --json
```

Passende Gerichtsvorlage:

```bash
comvenio recipe from-template <template-id> --price <preis> --json
```

Fehlt eine Gerichtsvorlage, lege ein Rezept mit exakt geprüften
Zutatenbezeichnungen an:

```bash
comvenio recipe create --name "<name>" --type food --price <preis> \
  --ingredients "<zutat>:<menge>:<einheit>" --json
```

Gültige Einheiten und Werte werden immer aus dem aktuellen Schema gelesen.
Insbesondere werden keine ähnlich klingenden Einheiten geraten.

## Speisekarte aufbauen

Sicherer Standardweg:

```bash
comvenio menu create --name "<kartenname>" --category "<kategorie>" --json
comvenio menu add-item <menu-id> --recipe <recipe-id> \
  --name "<anzeige>" --price <preis> --json
comvenio menu show <menu-id> --json
```

Für viele bereits aufgelöste Rezepte kann der Agent eine deklarative Datei
erstellen und `comvenio menu apply --file menu.json --json` verwenden. Jeder
Eintrag soll weiterhin eine `recipe_id` besitzen.

Das gleiche Rezept kann auf mehreren Karten mit anderem Anzeigenamen oder Preis
verwendet werden. Erzeuge keine Rezeptduplikate pro Karte.

## Karte aus Foto oder Text

1. Lies die Quelle selbst.
2. Liste erkannte und unklare Positionen für den Nutzer auf.
3. Lass unklare Preise, Größen und Schreibweisen bestätigen.
4. Suche Vorlagen und bestehende Rezepte.
5. Erstelle nur fehlende Rezepte.
6. Baue die Karte deklarativ.
7. Prüfe Karte und Allergenherkunft.

Es wird kein zweiter Server-Generator aufgerufen.

## Design und Prüfung

Gestaltung verändert nur das Aussehen, nicht strukturierte Preise oder
Allergene:

```bash
comvenio menu style <menu-id> --css <datei>
comvenio menu show <menu-id> --json
comvenio verify menu <menu-id> --json
```

Zeige die Prüfung und hole vor einer öffentlichen Verwendung die fachliche
Bestätigung für Preise und Allergenangaben ein. Der Agent ersetzt keine
lebensmittelrechtliche Prüfung durch den Verein.

## Einkaufslisten

Lege eine Einkaufsliste für den passenden Kontext an oder generiere sie aus
vorhandenen Rezepten beziehungsweise einer Karte:

```bash
comvenio shopping generate-from-recipe <recipe-id> \
  --portions <anzahl> --name "<name>" --json
comvenio shopping generate-from-menu <menu-id> --name "<name>" --json
comvenio shopping show <list-id> --json
```

Prüfe Mengen, Einheiten und Veranstaltungskontext, bevor die Liste als aktiv
oder erledigt behandelt wird.

## Schutzregeln

Eine ausdrückliche Bestätigung ist erforderlich, sofern nicht bereits eindeutig
beauftragt, vor:

- Löschen von Rezept, Zutat, Karte oder Einkaufsliste,
- hartem Löschen einer Zutatenkategorie,
- Überschreiben von Preisen oder Einkaufsmengen,
- öffentlicher Verwendung ungeprüfter Allergenangaben.

Verwende ausschließlich das `comvenio` CLI und für Agentenaufrufe `--json`.
Fehlende Funktionen werden nicht technisch umgangen.

## Abschluss

Melde:

- Kartenname und Zahl der Einträge,
- wiederverwendete beziehungsweise neue Rezepte,
- offene Preis- oder Allergenfragen,
- Ergebnis der Kartenprüfung,
- optional erzeugte Einkaufsliste und zugrunde liegende Portionszahl.
