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

Entwickle die öffentliche Website gemeinsam mit dem Vereinsverantwortlichen.
Der Agent komponiert Inhalt und Design selbst aus den aktuellen Schemas.
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
comvenio action list --json
comvenio action call cai.schema.02.show_domain_schema --input '{"domain":"homepage"}' --json
comvenio action call cai.schema.02.show_domain_schema --input '{"domain":"design"}' --json
comvenio action call cai.homepage.03.show --input '{"operation":"public"}' --json
comvenio action call cai.club.03.settings --input '{}' --json
```

Die aktuellen `design_settings` stehen in der Antwort von
`cai.club.03.settings`.

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

Lies Medien über die `cai.data.*`-Actions (Skill `comvenio-data`) und
verwende stabile Comvenio-Datei-IDs. Nutze
keine kurzlebige Bildadresse als dauerhafte Homepage-Quelle.

### 3. Entwurf erstellen

Komponiere:

- die `tabs`-Struktur für Tabs, Sections und Widgets (Eingabe von
  `cai.homepage.01.preview` und `cai.homepage.02.apply`),
- `design_settings` für Farben, Typografie und Flex-Template-Konfiguration
  (Eingabe von `cai.club.05.design`).

**Referenzqualität ist verbindlich.** Lies vor dem Entwurf
[`references/qualitaetsrezept.md`](references/qualitaetsrezept.md) und halte dich
an die Bauform: je Tab ein `custom_html`-Layout, alles Veränderliche als echter
Widget-Slot, `contact_form` statt nachgebauter Formulare, `"landing": false`
ausdrücklich in der Design-Datei, freigestellte Logos mit `"card_style": "none"`,
Vereinslogo über die Web-App (siehe Qualitätsrezept), Mobilansicht ohne
weggeblendete Hero-Grafik.

`cai.club.05.design` hat keinen Trockenlauf und schreibt sofort live. Vergleiche
deshalb die geplanten `design_settings` mit dem gelesenen Stand: Die Action führt
zusammen, nicht angegebene Live-Schlüssel bleiben erhalten. Steht dort ein
`landing`-Wert, gehört `"landing": false` ausdrücklich in die Eingabe.

Die Plattform stellt Impressum, Datenschutz, AGB und „Powered by Comvenio“
selbst bereit. Erzeuge dafür keine zusätzlichen Pflichtseiten und verstecke
diese Elemente nicht.

### 4. Vorschau und Qualitätsprüfung

```bash
comvenio action call cai.homepage.01.preview \
  --input '{"tabs":[<tabs>],"clear_existing":false}' --json
# Antwort enthält preview_id
comvenio action call cai.homepage.04.screenshot \
  --input '{"preview_id":"<preview-id>","viewports":["mobile","desktop"]}' --json
comvenio action call cai.verify.04.homepage \
  --input '{"operation":"preview","tabs":[<tabs>],"viewports":["mobile","desktop"],"audit":true}' --json
```

Die Vorschau rendert nur die übergebenen `tabs` mit dem aktuell gespeicherten
Design; ein neues Design wird erst nach seiner Freigabe angewendet.

Zeige dem Nutzer die Vorschau und fasse Findings verständlich zusammen.
Korrigiere Entwurf oder Design und wiederhole die Prüfung. Ein technisch
erfolgreicher Verifier ersetzt nicht die geschmackliche Freigabe.

### 5. Anwenden

Eine ausdrückliche Bestätigung ist vor dem Live-Schalten erforderlich. Für
`"clear_existing": true` braucht es zusätzlich die eindeutige Zustimmung, dass
die bestehende Homepage vollständig ersetzt werden soll.

```bash
comvenio action call cai.homepage.03.show \
  --input '{"operation":"public"}' --json > sicherung-home.json   # vor jedem Apply
comvenio action call cai.club.05.design \
  --input '{"design_settings":{"homepage_template":"flex","primary_color":"#006846","custom_template_config":{"landing":false}}}' --json
comvenio action call cai.homepage.02.apply \
  --input '{"tabs":[<tabs>],"clear_existing":false}' --json
# Antwort enthält preview_id und confirmation_token
comvenio action confirm \
  --preview-id <preview-id> \
  --confirmation-token <confirmation-token> \
  --idempotency-key <idempotency-key>
```

`cai.club.05.design` führt zusammen: Ein live gesetzter Schlüssel, der in der
Eingabe fehlt, bleibt erhalten. Fehlt `"landing": false`, kann ein alter
Landing-Modus live Kopfzeile und Navigation ausblenden, obwohl die Vorschau
richtig aussah.

Verwende `"clear_existing": true` nur bei ausdrücklich bestätigtem Vollersatz.

### 6. Live prüfen

```bash
comvenio action call cai.homepage.03.show --input '{"operation":"public"}' --json
comvenio action call cai.verify.04.homepage \
  --input '{"operation":"live","viewports":["mobile","desktop"],"audit":true}' --json
```

Melde dem Nutzer Seitenstruktur, Designstand und Prüfergebnis. Zeige vorhandene
Screenshots oder den Bericht, ohne interne Kennungen auszubreiten.

## Qualitätsregeln

- Vorschau und Live-Seite sind an 390, 768, 1024 und 1440 px im Bild geprüft,
  einschließlich Kopfzeile und Navigation.
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
comvenio action call cai.verify.01.url \
  --input '{"target_url":"https://www.mein-verein.de"}' --json
```

`cai.verify.04.homepage` prüft die verwaltete Standardadresse oder einen
Entwurf; für eine kundeneigene Domain ist `cai.verify.01.url` richtig.

## Schutzregeln

- Ausschließlich `comvenio` CLI für Produktoperationen verwenden.
- Für Agentenaufrufe `--json` setzen.
- Ohne Freigabe keine Live-Veröffentlichung.
- Ohne zusätzliche Bestätigung keinen Vollersatz mit `"clear_existing": true`.
- Keine unbekannten Schemafelder, kein vereinsspezifischer Frontend-Code und
  keine manuellen Infrastrukturarbeiten.
