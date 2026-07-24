# Comvenio CLI – sicher starten

Dieser Basisskill hilft Ihrem KI-Assistenten bei Anmeldung, Vereinsauswahl,
Sicherheitsfragen, Fehlern und der Auswahl des passenden Comvenio-Fachskills.

Beispielwünsche:

- „Prüfe, ob mein Comvenio CLI mit dem richtigen Verein verbunden ist.“
- „Welcher Skill hilft mir bei unserem Sommerfest?“
- „Warum darf ich diese Änderung nicht ausführen?“

Die Anmeldung starten Sie mit `comvenio login` und bestätigen sie direkt im
Comvenio-Browserfenster. Der Assistent fordert weder Passwort noch Token im Chat
an. Vor Änderungen prüft er Identität, Zielverein und die im aktuellen
OAuth-/RBAC-Kontext sichtbaren kanonischen Actions.

Fehlt eine Funktion im CLI, benennt der Skill die Lücke. Er versucht keinen
versteckten oder direkten Zugriff auf Comvenio. Kritische Änderungen benötigen
Ihre eindeutige Bestätigung.
