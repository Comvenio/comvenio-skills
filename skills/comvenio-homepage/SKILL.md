---
name: comvenio-homepage
description: >
  Erstellt, überarbeitet und prüft öffentliche Vereinswebsites mit dem
  Comvenio CLI. Unterstützt Inhalte, Tabs, Widgets, Vereinsfarben, Design,
  Vorschau, responsive Qualitätsprüfung und kundeneigene Domains. Verwende
  diesen Skill immer bei Homepage, Website, öffentlichem Auftritt, Design,
  Vereinsdomain, DNS oder der Frage, warum eine Club-Seite nicht erreichbar ist.
---

# Comvenio Vereins-Homepage

## Ziel

Entwickle die öffentliche Website gemeinsam mit dem Vereinsverantwortlichen.
Der Agent komponiert Inhalt und Design selbst aus den aktuellen CLI-Schemas.
Live-Änderungen erfolgen erst nach sichtbarer Vorschau und menschlicher
Freigabe.

## Verbindlicher Ablauf

Arbeite immer in dieser Reihenfolge:

```text
Schema → Bestand → Entwurf → Vorschau → Qualitätsprüfung → Freigabe → Anwenden → erneut prüfen
```

### 1. Kontext und Schema

```bash
comvenio whoami --json
comvenio club info --json
comvenio schema homepage --json
comvenio schema design --json
comvenio homepage show --public --json
```

Erfinde keine Widgets, Layouts, Designfelder oder Links. Das aktuelle Schema ist
maßgeblich.

### 2. Vereinswunsch erfassen

Kläre:

- Ziel der Website und wichtigste Besucher,
- gewünschte Seiten beziehungsweise Tabs,
- vorhandene Texte, Bilder, Logos und Sponsoren,
- Vereinsfarben und gewünschte Wirkung,
- wichtige Ziele wie News, Veranstaltungen, Kontakt oder Mitgliedschaft,
- ob bestehende Inhalte ergänzt oder vollständig ersetzt werden sollen.

Lies Medien über `comvenio data` und verwende stabile Comvenio-Datei-IDs. Nutze
keine kurzlebige Bildadresse als dauerhafte Homepage-Quelle.

### 3. Entwurf erstellen

Komponiere:

- `home.json` für Tabs, Sections und Widgets,
- `design-settings.json` für Farben, Typografie und Flex-Template-Konfiguration.

Prüfe das Design zunächst ohne Schreiben:

```bash
comvenio club design --file design-settings.json --dry-run --json
```

Die Plattform stellt Impressum, Datenschutz, AGB und „Powered by Comvenio“
selbst bereit. Erzeuge dafür keine zusätzlichen Pflichtseiten und verstecke
diese Elemente nicht.

### 4. Vorschau und Qualitätsprüfung

```bash
comvenio homepage preview \
  --file home.json \
  --design-file design-settings.json \
  --open \
  --json

comvenio verify homepage \
  --file home.json \
  --design-file design-settings.json \
  --audit \
  --json
```

Zeige dem Nutzer die Vorschau und fasse Findings verständlich zusammen.
Korrigiere Entwurf oder Design und wiederhole die Prüfung. Ein technisch
erfolgreicher Verifier ersetzt nicht die geschmackliche Freigabe.

### 5. Anwenden

Eine ausdrückliche Bestätigung ist vor dem Live-Schalten erforderlich. Für
`--clear` braucht es zusätzlich die eindeutige Zustimmung, dass die bestehende
Homepage vollständig ersetzt werden soll.

```bash
comvenio homepage apply --file home.json --json
comvenio club design --file design-settings.json --json
```

Verwende `homepage apply --clear` nur bei ausdrücklich bestätigtem Vollersatz.

### 6. Live prüfen

```bash
comvenio homepage show --public --json
comvenio verify homepage --audit --json
```

Melde dem Nutzer Seitenstruktur, Designstand und Prüfergebnis. Zeige vorhandene
Screenshots oder den Bericht, ohne interne Kennungen auszubreiten.

## Qualitätsregeln

- Navigation und Buttons führen zu echten Zielen.
- Mehrere verlangte Seiten werden nicht heimlich zu einem One-Pager.
- Mobil, Tablet und Desktop sind geprüft.
- Texte sind lesbar und kontrastreich.
- Bilder und Logos verwenden stabile Datei-IDs.
- Sichtbare Inhalte enthalten keine technischen Erklärtexte.
- Rechtliche Pflichtlinks bleiben sichtbar.
- Sponsorenlinks verwenden sichere öffentliche Ziele.

## Eigene Domain

Die kundeneigene Domain wird bewusst in Comvenio eingerichtet, nicht per CLI:

1. **Club-Hub → Design → Öffentliche Website → Domainverwaltung**
2. Unter **Kundeneigene Domain** den Hostnamen ohne `https://` oder Pfad
   hinzufügen.
3. **Anleitung anzeigen** öffnen.
4. TXT- und CNAME-Wert beim eigenen Domain-Anbieter exakt wie angezeigt
   eintragen.
5. In Comvenio **Verifizieren** wählen und auf **Aktiv** warten.

Eigene Domains stehen in Premium und Enterprise zur Verfügung. Der Kunde muss
nichts direkt in Cloudflare oder einer Comvenio-Infrastrukturverwaltung
eintragen. Frage niemals nach dem Passwort des Domain-Anbieters.

Erst bei Status **Aktiv** prüfst du die echte Domain:

```bash
comvenio verify url https://www.mein-verein.de --json
```

`verify homepage` prüft die verwaltete Standardadresse oder einen Entwurf;
für eine kundeneigene Domain ist `verify url` richtig.

## Schutzregeln

- Ausschließlich `comvenio` CLI für Produktoperationen verwenden.
- Für Agentenaufrufe `--json` setzen.
- Ohne Freigabe keine Live-Veröffentlichung.
- Ohne zusätzliche Bestätigung keinen Vollersatz mit `--clear`.
- Keine unbekannten Schemafelder, kein vereinsspezifischer Frontend-Code und
  keine manuellen Infrastrukturarbeiten.
