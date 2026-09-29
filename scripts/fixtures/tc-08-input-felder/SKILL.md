---
name: comvenio-beispiel
description: >
  Prüf-Fixture K1-2: verbotene Eingabefelder und geteilter Geräte-Token-Schalter.
---

# Beispiel

```bash
comvenio whoami --json
comvenio action list --json
comvenio action call cai.club.03.settings --input "{\"club_id\":\"x\"}" --json
comvenio action call cai.club.03.settings --input='{"confirmation":"ja"}' --json
comvenio login --device-\
token "$TOKEN"
```

Änderungen brauchen eine Bestätigung.
