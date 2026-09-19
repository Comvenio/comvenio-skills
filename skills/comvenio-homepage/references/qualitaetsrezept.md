# Qualitätsrezept: Vereins-Homepages auf Referenzniveau

Dieses Rezept beschreibt, wie die Referenz-Homepages von Comvenio gebaut sind.
Es setzt nur das `comvenio` CLI voraus, keinen Quelltext der Plattform. Alle Namen
und Werte sind Beispiele (Verein „SV Musterdorf“, Klassenpräfix `.sv-`).

## 1. Bauform

- **Je Tab eine Section `full` mit genau einem `custom_html`-Widget.** Das HTML
  trägt das vollständige Seitenlayout: Hero, Sektionen, Karten, Raster.
- **Alles Veränderliche ist ein Widget-Slot**, nie festgeschriebener Text:

  | Inhalt | Slot |
  |---|---|
  | Lauftext mit Terminen und News | `ticker` |
  | Aktuelles | `news` |
  | Rückblick / Ausschau | `events_list` mit `time_scope: past` bzw. `upcoming` |
  | Datum im Fließtext | `event_highlight` mit `layout: "date"` und `event_id` |
  | Vereinsabend einer Serie | `event_highlight` mit `series_id` |
  | Vorstandschaft | `team` mit `group_id`, `show_avatar` |
  | Bilder / Downloads | `image_gallery` / `files` mit `file_ids` |
  | Einzelbild, Wappen | `image` mit `file_id` |
  | Video | `background_video` mit `video_file_id`, `poster_file_id` |
  | Kontakt, Kennenlernen | `contact_form` |

- Slot-Syntax (Attribut HTML-escaped):

  ```html
  <div data-widget-slot="news"
       data-widget-config="{&quot;limit&quot;:3,&quot;layout&quot;:&quot;editorial&quot;,&quot;show_title&quot;:false}"></div>
  ```

- Keine erfundenen Termine, Namen, Zahlen oder Kontaktdaten. Fehlendes wird als
  ehrlicher Platzhalter für den Verein markiert („Vereinsfoto folgt“).
- Tab-Wechsel über `href="?tab=<slug>"`.
- Kein Formular in HTML nachbauen: `contact_form` sendet echt, speichert und
  benachrichtigt den Vorstand; in der Vorschau sendet es nicht.

## 2. Design-Datei vollständig

```json
{
  "homepage_theme": "modern",
  "homepage_template": "flex",
  "primary_color": "#006846",
  "secondary_color": "#2B241D",
  "accent_color": "#D3A52D",
  "custom_template_config": {
    "landing": false,
    "public_header": { "layout": "brand-left", "surface": "light", "density": "comfortable", "sticky": true }
  },
  "custom_css": ".sv-page{--green:#006846;--gold:#D3A52D} …"
}
```

- **`"landing": false` immer ausdrücklich setzen.** `club design` führt zusammen;
  ein alter `landing: true` bleibt sonst aktiv und blendet live Kopfzeile und
  Navigation aus — die Vorschau zeigt sie trotzdem.
- Der Trockenlauf `club design --file … --dry-run --json` nennt die Live-Schlüssel,
  die erhalten bleiben. Diese Liste lesen und bewusst entscheiden.
- Eigene Klassen mit Vereinspräfix, Farben als CSS-Variablen.
- Serifen-Überschriften, ruhige Grotesk für Text, Sektionen 80–110 px Abstand,
  eine Akzentfarbe für Knöpfe und Kicker.

## 3. Logo und Wappen

- Vereinslogo setzen: `comvenio club logo-upload --file wappen.png --json`.
  Ein normaler `data upload` ersetzt das Logo nicht.
- EPS/SVG vorher in ein PNG mit transparentem Hintergrund umwandeln,
  mindestens ~1000 px Kantenlänge.
- Freigestelltes Wappen im Hero: `image`-Slot mit `file_id` und
  `"card_style": "none"` — sonst zeichnet das Widget einen Kartenrahmen mit
  Schatten als Kasten um das Bild.

## 4. Mobil

- Umbrüche bei ≤ 900 px und ≤ 600 px; Raster einspaltig, Knöpfe umbrechen.
- Hero-Grafik auf dem Handy nicht wegblenden. Bewährt: Wappen absolut rechts
  neben der Schlagzeile, `opacity ≈ .5`, teils über den Rand, Überschrift mit
  leichtem `text-shadow`.
- Kein horizontaler Überlauf bei 390 px.

```css
@media (max-width: 900px) {
  .sv-hero-grid { position: relative; grid-template-columns: 1fr; }
  .sv-hero-grid > div:first-child { position: relative; z-index: 1; }
  .sv-hero-mark { position: absolute; top: 24px; right: -10vw;
                  width: min(58vw, 280px); z-index: 0; opacity: .5; pointer-events: none; }
  .sv-hero-mark > div { width: 100%; }
}
```

## 5. CSS für Widget-Innenleben

Widgets rendern in den Slot hinein; nicht jedes trägt eine bestimmte Klasse.
Regeln über den eigenen Container schreiben (`.sv-hero-mark > div`) und den echten
Aufbau vorher im Vorschau-Bild prüfen (`comvenio verify url <vorschau-url> --json`).

## 6. Prüfen

1. `comvenio homepage preview --file home.json --design-file design.json --ttl-hours 24 --json`
2. Bilder an **390, 768, 1024 und 1440 px** ansehen: Kopfzeile, Navigation, Hero,
   Sektionen, Formular.
3. `comvenio verify homepage --file home.json --design-file design.json --audit --json`;
   Kontrastbefunde aus eingebetteten Event-Seiten getrennt nennen.
4. Nach Freigabe: Live-Stand sichern (`homepage show --public`, `club info`),
   `club design --file`, `homepage apply --clear`, dann dieselben Breiten live prüfen.

## 7. Datenschutz

- `team` mit `group_id` auf einer öffentlichen Seite macht die Namen des Organs
  öffentlich. Vorher mit dem Verein klären.
- `contact_form` speichert Anfragen (Löschung 30 Tage nach Löschen, spätestens
  365 Tage nach Eingang).
- Geburtstage nur nach Klärung; Vorname und Tag/Monat.

## 8. Fehlerbild → Ursache → Abhilfe

| Fehlerbild | Ursache | Abhilfe |
|---|---|---|
| Live fehlen Kopfzeile und Navigation | alter `landing: true` überlebt | `"landing": false` setzen, erneut `club design --file` |
| Kasten um freigestelltes Logo | Kartenrahmen des Bild-Widgets | `"card_style": "none"` |
| „Kein Bild konfiguriert“ nur bei einer Person | alter App-Stand im Browser | `Strg+Umschalt+R` |
| Eigene CSS-Breite wirkt nicht | Selektor trifft den Slot nicht | Slot-Container ansprechen, Aufbau vorher ansehen |
| Verifier Exit 4 nur auf einer Event-Seite | Kontrast im eingebetteten Event-Hub | getrennt melden, nicht per Homepage-CSS überdecken |
| Viele „Nicht besetzt“ im Organ | Positionen ohne Zuordnung | Vereinsdaten pflegen lassen |
