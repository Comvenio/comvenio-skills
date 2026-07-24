---
name: comvenio-news
description: >
  Erstellt, gestaltet, prüft und veröffentlicht Vereinsnews mit dem Comvenio
  CLI, einschließlich Bilder und Videos. Verwende diesen Skill bei Meldungen,
  Berichten, Rückblicken, Ergebnisnews, Teasern, Entwürfen und Veröffentlichungen.
---

# Comvenio Vereinsnews

## Verbindlicher OAuth-Pfad

Im Standardmodus zuerst `comvenio whoami --json` und `comvenio action list
--json` ausführen. Fachoperationen ausschließlich mit der dort sichtbaren
kanonischen Action-ID und ihrem `input_schema` über `comvenio action call`
aufrufen. Die Domain-Aliase in den Beispielen gelten nur für den expliziten
Device-Token-Kompatibilitätsmodus; niemals durch direkte HTTP-Aufrufe ersetzen.

## Ziel

Erstelle gut lesbare Vereinsnews aus belegten Informationen und vorhandenen
Medien. Vorschau, Entwurf und Veröffentlichung bleiben getrennte Entscheidungen.

## Vorbereitung

```bash
comvenio whoami --json
comvenio club info --json
comvenio news --help
comvenio news list --json
```

Lies bei einer Änderung die bestehende News vollständig. Suche Bilder über die
passende `data`-Liste. Presigned URLs sind kurzlebig; dauerhafte Bilder werden
über die stabile Comvenio-Dateireferenz eingebunden.

## Redaktioneller Ablauf

1. Kläre Anlass, Zielgruppe, Fakten, Ton, Sichtbarkeit und gewünschte Medien.
2. Komponiere Titel, Teaser und Inhalt selbst. Das CLI enthält keinen
   Textgenerator.
3. Erstelle eine Vorschau:

   ```bash
   comvenio news preview --file news.json --json
   ```

4. Zeige eine verständliche Zusammenfassung und offene Korrekturen.
5. Lege standardmäßig einen Entwurf an:

   ```bash
   comvenio news apply --file news.json --draft --json
   comvenio news show <news-id> --json
   comvenio verify news <news-id> --json
   ```

6. Veröffentliche erst nach gesonderter Freigabe mit
   `comvenio news publish <news-id> --json`.

## Bilder und Videos

Verwende `comvenio data list`, `show`, `url`, `download`, `upload` und `update`
für belegte Medienabläufe. Videos können mit `news video slideshow`, `result`,
`teaser` oder `highlight` lokal erstellt werden. Zeige Parameter, Partner und
Ausgabedatei vor einem Upload. Unbekannte Einbettungen, Skripte und Event-Handler
gehören nicht in News-Inhalte.

## Schutzregeln

Eine ausdrückliche Bestätigung ist erforderlich vor:

- Veröffentlichung oder `apply --publish`,
- Änderung einer bereits öffentlichen News,
- Wechsel zu öffentlicher Sichtbarkeit,
- Löschen einer News,
- öffentlichem Upload eines Videos oder Bildes.

Eine zeitgesteuerte Veröffentlichung ist nicht belegt und wird nicht erfunden.
Verwende ausschließlich `comvenio`, für Agentenaufrufe `--json`, und wiederhole
unklare Schreibvorgänge nicht automatisch.

## Abschluss

Melde Titel, Status, Sichtbarkeit, verwendete Medien, Ergebnis von Vorschau und
Verifier sowie eine noch ausstehende Veröffentlichungsfreigabe.
