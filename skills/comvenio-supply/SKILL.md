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
comvenio action list --json
comvenio action call cai.schema.02.show_domain_schema --input '{"domain":"menu"}' --json
```

Rezepte laufen über `cai.recipe.*`, Karten über `cai.menu.*` und
Einkaufslisten über `cai.shopping.*`; maßgeblich ist jeweils das
`input_schema` aus `comvenio action list --json`.

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
comvenio action call cai.template.01.dish \
  --input '{"operation":"list","search":"<gericht>"}' --json
comvenio action call cai.template.02.ingredient \
  --input '{"operation":"list","search":"<zutat>"}' --json
```

Passende Gerichtsvorlage (kritisch, läuft über Vorschau und Freigabe):

```bash
comvenio action call cai.recipe.02.from_template \
  --input '{"template_id":"<template-id>","custom_price":<preis>}' --json
comvenio action confirm \
  --preview-id <preview-id> \
  --confirmation-token <confirmation-token> \
  --idempotency-key <idempotency-key>
```

Fehlt eine Gerichtsvorlage, lege ein Rezept mit exakt geprüften
Zutatenbezeichnungen an:

```bash
comvenio action call cai.recipe.01.create \
  --input '{"name":"<name>","type_of_recipe":"food","selling_price":<preis>,"ingredients":[{"name":"<zutat>","quantity":<menge>,"unit":"<einheit>"}]}' --json
comvenio action confirm \
  --preview-id <preview-id> \
  --confirmation-token <confirmation-token> \
  --idempotency-key <idempotency-key>
```

Gültige Einheiten und Werte werden immer aus dem aktuellen Schema gelesen.
Insbesondere werden keine ähnlich klingenden Einheiten geraten.

## Speisekarte aufbauen

Sicherer Standardweg:

```bash
comvenio action call cai.menu.01.create \
  --input '{"menu":{"name":"<kartenname>","category":"<kategorie>"}}' --json
comvenio action call cai.menu.04.add_item \
  --input '{"menu_id":"<menu-id>","item":{"recipe_id":"<recipe-id>","name":"<anzeige>","selling_price":<preis>}}' --json
comvenio action call cai.menu.03.show --input '{"menu_id":"<menu-id>"}' --json
```

Für viele bereits aufgelöste Rezepte kann der Agent die ganze Karte deklarativ
mit `cai.menu.09.apply` anlegen (kritisch, Vorschau und
`comvenio action confirm`). Jeder
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
comvenio action call cai.menu.08.style \
  --input '{"menu_id":"<menu-id>","design":{"template":"modern","accentColor":"#006846"}}' --json
comvenio action call cai.menu.03.show --input '{"menu_id":"<menu-id>"}' --json
comvenio action call cai.verify.03.menu --input '{"menu_id":"<menu-id>"}' --json
```

Zeige die Prüfung und hole vor einer öffentlichen Verwendung die fachliche
Bestätigung für Preise und Allergenangaben ein. Der Agent ersetzt keine
lebensmittelrechtliche Prüfung durch den Verein.

## Einkaufslisten

Lege eine Einkaufsliste für den passenden Kontext an oder generiere sie aus
vorhandenen Rezepten beziehungsweise einer Karte:

```bash
comvenio action call cai.shopping.14.generate_from_recipe \
  --input '{"recipe_id":"<recipe-id>","portions":<anzahl>,"name":"<name>"}' --json
comvenio action call cai.shopping.15.generate_from_menu \
  --input '{"menu_id":"<menu-id>","name":"<name>"}' --json
comvenio action call cai.shopping.06.show \
  --input '{"operation":"show","shopping_list_id":"<shopping-list-id>"}' --json
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
