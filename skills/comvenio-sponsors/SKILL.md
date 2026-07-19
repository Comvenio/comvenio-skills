---
name: comvenio-sponsors
description: >
  Verwaltet lokale Vereinssponsoren, Pakete, Vertragsversionen, Zuordnungen,
  Dokumente, Verantwortliche und Event-Verknüpfungen mit dem Comvenio CLI.
  Verwende diesen Skill bei Sponsor, Partner, Sponsoringpaket, Vertrag, Logo,
  Laufzeit, Kündigung oder Veranstaltungswerbung.
---

# Comvenio Sponsoring

## Ziel

Pflege Sponsorenbeziehungen nachvollziehbar, ohne Vertragsstände zu
überschreiben oder vertrauliche Unterlagen öffentlich zu machen.

## Vorbereitung

```bash
comvenio whoami --json
comvenio club info --json
comvenio sponsor --help
comvenio sponsor list --json
```

Lies je nach Auftrag Sponsor, Produkte, Vertragsversionen, Zuordnungen,
Dokumente und Verantwortliche. Ermittle Abteilungen und Mitglieder anhand von
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

Sponsor-Stammdaten werden mit `comvenio sponsor` gepflegt. Die Zuordnung zu
einer Veranstaltung erfolgt getrennt über `comvenio event sponsor`. Zeige Event,
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
