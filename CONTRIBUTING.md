# Zu Comvenio Skills beitragen

Vielen Dank, dass Sie Comvenio Skills verbessern möchten. Öffentliche Issues
sind für nachvollziehbare Fehlerberichte, Fragen und Verbesserungsvorschläge
gedacht.

## Vor einem Issue

1. Aktualisieren Sie die Skills mit `npx skills update`.
2. Prüfen Sie, ob bereits ein passendes Issue existiert.
3. Entfernen Sie Zugriffstoken, Passwörter und personenbezogene Vereinsdaten.
4. Melden Sie Sicherheitsprobleme ausschließlich über den privaten Weg in
   [SECURITY.md](SECURITY.md).

Nutzen Sie anschließend das passende
[Issue-Formular](https://github.com/Comvenio/comvenio-skills/issues/new/choose).

## Änderungen lokal prüfen

Voraussetzung ist Node.js 20 oder neuer.

```bash
git clone https://github.com/Comvenio/comvenio-skills.git
cd comvenio-skills
npm install
npm test
npx skills add . --list
```

Ein geänderter Skill benötigt:

- eine kundenorientierte `README.md`,
- eine eindeutige `SKILL.md`,
- mindestens drei realistische Fälle in `evals/evals.json`,
- ausschließlich Aufrufe des offiziellen `comvenio` CLI.

## Pull Requests

1. Erstellen Sie einen kleinen, thematisch eindeutigen Branch.
2. Beschreiben Sie Problem, Änderung und Auswirkungen aus Kundensicht.
3. Fügen Sie passende Evals hinzu oder aktualisieren Sie bestehende Evals.
4. Führen Sie `npm test` und `npx skills add . --list` aus.
5. Öffnen Sie einen Pull Request gegen `main`.

Ein Pull Request darf keine Tokens, Kundendaten oder internen
Infrastrukturinformationen enthalten.

## Lizenz der Beiträge

Mit einem Beitrag bestätigen Sie, dass Sie ihn einreichen dürfen. Beiträge,
die Comvenio übernimmt, werden unter der
[Apache License 2.0](LICENSE) veröffentlicht.

