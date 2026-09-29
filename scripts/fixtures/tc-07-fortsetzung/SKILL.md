---
name: comvenio-beispiel
description: >
  Prüf-Fixture K1-1: Fortsetzungszeilen und Groß-/Kleinschreibung des Befehls.
---

# Beispiel

```bash
comvenio whoami --json
comvenio action list --json
comvenio \
  club info --json
comvenio action call cai.club.03.settings\
_other --input '{}' --json
Comvenio club info --json
COMVENIO CLUB INFO --json
```

Änderungen brauchen eine Bestätigung.
