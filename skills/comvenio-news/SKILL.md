---
name: comvenio-news
description: >
  Erstellt, gestaltet, prüft und veröffentlicht Vereinsnews mit dem Comvenio
  CLI, einschließlich Bilder und Videos. Verwende diesen Skill bei Meldungen,
  Berichten, Rückblicken, Ergebnisnews, Teasern, Entwürfen und Veröffentlichungen.
---

# Comvenio Vereinsnews

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

Erstelle gut lesbare Vereinsnews aus belegten Informationen und vorhandenen
Medien. Vorschau, Entwurf und Veröffentlichung bleiben getrennte Entscheidungen.

## Vorbereitung

```bash
comvenio whoami --json
comvenio action list --json
comvenio action call cai.news.01.list --input '{"operation":"private","limit":50,"offset":0}' --json
```

Lies bei einer Änderung die bestehende News vollständig
(`cai.news.02.show`). Suche Bilder über `cai.data.01.list`. Presigned URLs sind kurzlebig; dauerhafte Bilder werden
über die stabile Comvenio-Dateireferenz eingebunden.

## Redaktioneller Ablauf

1. Kläre Anlass, Zielgruppe, Fakten, Ton, Sichtbarkeit und gewünschte Medien.
2. Komponiere Titel, Teaser und Inhalt selbst. Das CLI enthält keinen
   Textgenerator.
3. Erstelle eine Vorschau:

   ```bash
   comvenio action call cai.news.07.preview \
     --input '{"title":"<titel>","teaser":"<teaser>","content":"<html>"}' --json
   ```

4. Zeige eine verständliche Zusammenfassung und offene Korrekturen.
5. Lege standardmäßig einen Entwurf an:

   ```bash
   comvenio action call cai.news.06.apply \
     --input '{"operation":"draft","news":{<news nach input_schema>}}' --json
   comvenio action call cai.news.02.show \
     --input '{"operation":"private","news_id":"<news-id>"}' --json
   comvenio action call cai.verify.05.news --input '{"news_id":"<news-id>"}' --json
   ```

6. Veröffentliche erst nach gesonderter Freigabe; die Veröffentlichung ist
   kritisch und läuft über Vorschau und Bestätigung:

   ```bash
   comvenio action call cai.news.08.publish --input '{"news_id":"<news-id>"}' --json
   comvenio action confirm \
     --preview-id <preview-id> \
     --confirmation-token <confirmation-token> \
     --idempotency-key <idempotency-key>
   ```

## Bilder und Videos

Verwende die Actions `cai.data.01.list`, `cai.data.02.show`,
`cai.data.04.url`, `cai.data.05.download`, `cai.data.06.upload` und
`cai.data.03.update` für belegte Medienabläufe. Videos erstellt
`cai.news.09.video_slideshow_result_teaser` (Teilaktion `render` mit den
Vorlagen `slideshow`, `result`, `teaser` oder `highlight`; `render_and_upload`
lädt das Ergebnis hoch). Zeige Parameter, Partner und
Ausgabedatei vor einem Upload. Unbekannte Einbettungen, Skripte und Event-Handler
gehören nicht in News-Inhalte.

## Schutzregeln

Eine ausdrückliche Bestätigung ist erforderlich vor:

- Veröffentlichung oder `cai.news.06.apply` mit `"operation":"publish"`,
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
