---
name: comvenio-data
description: >
  Verwaltet Dateien, Ordner, Sichtbarkeit, Freigaben, Papers und Exporte mit
  dem Comvenio CLI. Verwende diesen Skill bei Upload, Download, Dateiablage,
  Papierkorb, Ordnerrechten, Event-Medien, Dokumenten sowie Mitglieder- oder
  Buchungsexporten.
---

# Comvenio Dateien und Dokumente

## Verbindlicher OAuth-Pfad

Im Standardmodus zuerst `comvenio whoami --json` und `comvenio action list
--json` ausführen. Fachoperationen ausschließlich mit der dort sichtbaren
kanonischen Action-ID und ihrem `input_schema` über `comvenio action call`
aufrufen. Die Domain-Aliase in den Beispielen gelten nur für den expliziten
Device-Token-Kompatibilitätsmodus; niemals durch direkte HTTP-Aufrufe ersetzen.

## Ziel

Finde, ordne und teile Vereinsdateien sicher. Inhalte werden standardmäßig
privat behandelt; öffentliche Sichtbarkeit und Rechteänderungen sind bewusste
Entscheidungen.

## Vorbereitung

```bash
comvenio whoami --json
comvenio club info --json
comvenio data --help
```

Kläre den fachlichen Kontext, etwa Verein, Veranstaltung oder Sitzung, und lies
zuerst mit `data list`, `children`, `search`, `breadcrumb` oder `show`. Gib
personenbezogene Daten nur aus, wenn sie für den Auftrag erforderlich sind.

## Dateien und Ordner

```bash
comvenio data list --context <context> --context-id <id> --json
comvenio data show <file-id> --json
comvenio data upload ./datei.pdf --context <context> --context-id <id> --json
```

Uploads bleiben standardmäßig privat. Prüfe nach Upload, Verschieben,
Umbenennen oder Kontextänderung den Datensatz erneut. Für eine Inhaltsanalyse
lädt der Agent die Datei mit `data download` lokal herunter; eine nicht
vorhandene `analyze`-Aktion wird nicht erfunden.

Ordner können erstellt, umbenannt, verschoben, geschützt, gelöscht und
wiederhergestellt werden. Lies vor rekursiven Änderungen Kinder, Schutz und
Rechte.

## Rechte und Sichtbarkeit

```bash
comvenio data folder-rights <folder-id> --json
comvenio data area-shares <file-id> --json
```

Zeige vor einer Freigabe Empfänger, Umfang und Recht. Produktiv belegte
Ordnerrechte beziehen sich auf einzelne Benutzer; Gruppenrechte werden nicht
behauptet. Öffentliches Schalten braucht eine eindeutige Freigabe.

## Papers und Exporte

Papers werden über `papers`, `paper-show`, `paper-add`, `paper-update` und
`paper-delete` verwaltet. Mitglieder und Buchungen lassen sich als CSV oder
XLSX exportieren. Andere Exportarten werden nicht erfunden. Zeige Zielpfad und
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
