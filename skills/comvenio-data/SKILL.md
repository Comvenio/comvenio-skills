---
name: comvenio-data
description: >
  Verwaltet Dateien, Ordner, Sichtbarkeit, Freigaben, Papers und Exporte mit
  dem Comvenio CLI. Verwende diesen Skill bei Upload, Download, Dateiablage,
  Papierkorb, Ordnerrechten, Event-Medien, Dokumenten sowie Mitglieder- oder
  Buchungsexporten.
---

# Comvenio Dateien und Dokumente

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

Finde, ordne und teile Vereinsdateien sicher. Inhalte werden standardmäßig
privat behandelt; öffentliche Sichtbarkeit und Rechteänderungen sind bewusste
Entscheidungen.

## Vorbereitung

```bash
comvenio whoami --json
comvenio action list --json
```

Kläre den fachlichen Kontext, etwa Verein, Veranstaltung oder Sitzung, und lies
zuerst mit `cai.data.01.list`, `cai.data.17.children`, `cai.data.18.search`,
`cai.data.19.breadcrumb` oder `cai.data.02.show`. Gib
personenbezogene Daten nur aus, wenn sie für den Auftrag erforderlich sind.

## Dateien und Ordner

```bash
comvenio action call cai.data.01.list \
  --input '{"context_type":"<context>","context_id":"<id>","limit":50,"offset":0}' --json
comvenio action call cai.data.02.show --input '{"file_id":"<file-id>"}' --json
comvenio action call cai.data.06.upload --file ./datei.pdf \
  --input '{"context_type":"<context>","context_id":"<id>","visibility":"private"}' --json
```

`--file` gibt es nur für `cai.data.06.upload`; Dateiname, Typ und Größe setzt
das CLI selbst. Uploads bleiben standardmäßig privat. Prüfe nach Upload,
Verschieben, Umbenennen oder Kontextänderung den Datensatz erneut. Für eine
Inhaltsanalyse lädt der Agent die Datei mit `cai.data.05.download` lokal
herunter; eine nicht
vorhandene `analyze`-Aktion wird nicht erfunden.

Ordner können erstellt, umbenannt, verschoben, geschützt, gelöscht und
wiederhergestellt werden (`cai.data.20.folder_create` bis
`cai.data.25.folder_restore`); das Löschen ist kritisch und läuft über Vorschau
und `comvenio action confirm`. Lies vor rekursiven Änderungen Kinder, Schutz und
Rechte.

## Rechte und Sichtbarkeit

```bash
comvenio action call cai.data.26.folder_rights --input '{"folder_id":"<folder-id>"}' --json
comvenio action call cai.data.14.area_shares --input '{"file_id":"<file-id>"}' --json
```

Zeige vor einer Freigabe Empfänger, Umfang und Recht. Produktiv belegte
Ordnerrechte beziehen sich auf einzelne Benutzer; Gruppenrechte werden nicht
behauptet. Öffentliches Schalten braucht eine eindeutige Freigabe.

## Papers und Exporte

Papers werden über `cai.data.30.papers`, `cai.data.31.paper_show`,
`cai.data.32.paper_add`, `cai.data.33.paper_update` und
`cai.data.34.paper_delete` verwaltet. Mitglieder und Buchungen lassen sich mit
`cai.data.35.export_members_bookings` (Teilaktion `members` oder `bookings`)
als CSV oder XLSX exportieren; der Export ist kritisch und läuft über Vorschau
und `comvenio action confirm`. Andere Exportarten werden nicht erfunden. Zeige Zielpfad und
enthaltene Datenkategorie vor dem Export.

## Schutzregeln

Eine ausdrückliche Bestätigung ist erforderlich vor:

- öffentlicher Sichtbarkeit,
- Hard-Delete, Papierkorb-Leerung oder rekursiver Ordnerlöschung,
- Hinzufügen, Entfernen oder massenhafter Änderung von Ordnerrechten,
- Entfernen eines Ordnerschutzes,
- Löschen eines Papers.

Verwende ausschließlich `comvenio`, für Agentenaufrufe `--json`, und wiederhole
unklare Schreibvorgänge nicht automatisch. Token, State-Datei und vertrauliche
Dokumentinhalte gehören nicht in Supportmeldungen.

## Abschluss

Melde Ablageort, Sichtbarkeit, Freigaben und Prüfergebnis. Bei Exporten nenne
Dateityp und lokalen Zielpfad, nicht den vollständigen Inhalt.
