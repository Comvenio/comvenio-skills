---
name: comvenio-sponsors
description: >
  Verwaltet lokale Vereinssponsoren, Pakete, Vertragsversionen, Zuordnungen,
  Dokumente, Verantwortliche und Event-Verknüpfungen mit dem Comvenio CLI.
  Verwende diesen Skill bei Sponsor, Partner, Sponsoringpaket, Vertrag, Logo,
  Laufzeit, Kündigung oder Veranstaltungswerbung.
---

# Comvenio Sponsoring

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

Pflege Sponsorenbeziehungen nachvollziehbar, ohne Vertragsstände zu
überschreiben oder vertrauliche Unterlagen öffentlich zu machen.

## Vorbereitung

```bash
comvenio whoami --json
comvenio action list --json
comvenio action call cai.sponsor.01.list --input '{"limit":50}' --json
```

Lies je nach Auftrag Sponsor (`cai.sponsor.02.show`), Produkte
(`cai.sponsor.07.product_list`), Vertragsversionen
(`cai.sponsor.11.contract_list`), Zuordnungen (`cai.sponsor.15.assignment_list`),
Dokumente (`cai.sponsor.19.doc_list`) und Verantwortliche
(`cai.sponsor.21.responsible_list`). Ermittle Abteilungen und Mitglieder anhand von
Namen. Verantwortliche benötigen eine Member-ID, nicht die User-ID.

## Stammdaten, Produkte und Verträge

Arbeite in dieser Reihenfolge:

1. Sponsor lesen oder anlegen.
2. Produkt und Preis prüfen oder anlegen.
3. Neue Konditionen als Vertragsversion ergänzen, statt alte Stände zu
   überschreiben.
4. Sponsor und Produkt mit Laufzeit zuordnen.
5. Ergebnis über die jeweiligen Listen erneut prüfen.

Preise werden vom CLI in Cent erwartet. Zeige dem Nutzer zusätzlich den Betrag
in Euro und formuliere Zeitpunkte verständlich.

Logos dürfen als öffentliche Markenmedien behandelt werden. Verträge und
unterschriebene Zuordnungsdokumente bleiben privat.

## Event-Verknüpfungen

Sponsor-Stammdaten werden mit den `cai.sponsor.*`-Actions gepflegt. Die
Zuordnung zu einer Veranstaltung erfolgt getrennt über
`cai.event.18.sponsor_and_sponsor_program_workflows` (Teilaktionen `link_*`,
`tier_*` und `program_*`). Zeige Event,
Bereich, Paket und Sortierung vor der Änderung.

## Schutzregeln

Eine ausdrückliche Bestätigung ist erforderlich vor:

- Löschen von Sponsor, Produkt oder Vertragsversion,
- Kündigen einer aktiven Zuordnung,
- Deaktivieren eines Produkts,
- Änderungen an Preis, Laufzeit oder Vertragsstatus,
- Entfernen einer verantwortlichen Person,
- Lösen einer Event-Verknüpfung,
- öffentlicher Sichtbarkeit eines anderen Dokuments als des Logos.

Der globale Anzeigenmarktplatz und Plattformabrechnungen gehören nicht zu
diesem Skill. Verwende ausschließlich `comvenio`, für Agentenaufrufe `--json`,
und wiederhole unklare Schreibvorgänge nicht automatisch.

## Abschluss

Melde Sponsor, Produkt, Preis, Vertragsversion, Laufzeit, Verantwortliche und
Event-Zuordnung nach erneuter Prüfung.
