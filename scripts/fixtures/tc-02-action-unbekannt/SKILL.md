---
name: comvenio-beispiel
description: >
  Prüf-Fixture TC-02: Action-ID, die nicht im Katalog steht.
---

# Beispiel

```bash
comvenio whoami --json
comvenio action list --json
comvenio action call cai.xyz.99.gibtsnicht --input '{}' --json
```

Änderungen brauchen eine Bestätigung.
