# VANI Desktop & Synchronisation — umgesetzter Stand

## Fertig

- installierbare Windows-App (Setup) plus portable Ausgabe;
- dieselbe Oberfläche und dieselben lokalen Datenregeln wie auf dem iPad;
- getrennte private Bereiche für verschiedene Personen;
- Kopplungscode für weitere eigene oder vertraute Geräte;
- AES-256-GCM-Verschlüsselung vor jedem Upload;
- Yjs-CRDT für konfliktarmes paralleles und Offline-Schreiben;
- dauerhafte lokale Warteschlange bei Netzabbruch oder App-Ende;
- Fotos und Skizzen blockweise verschlüsselt;
- große Goodnotes-Originale bewusst separat zuschaltbar;
- Sync-Dienst mit Authentifizierung, Deduplizierung, Größen- und Ratenlimits;
- Desktop-Schlüssel im geschützten Systemspeicher;
- feste App-ID und Update-Vorbereitung für dieselbe Installation.

Der öffentliche Dienst speichert kurze Paketmetadaten in D1 und die bereits
verschlüsselten Inhalte in R2. Er besitzt den Entschlüsselungsschlüssel nicht.
Eine unabhängige Node-/SQLite-Ausgabe liegt zusätzlich in `sync-server/` und
kann auf einem eigenen Server betrieben werden.

## Bewusste Grenze

Ein verlorener Kopplungscode kann nicht vom Server wiederhergestellt werden –
das ist die Kehrseite echter Ende-zu-Ende-Verschlüsselung. Mindestens ein
gekoppeltes Gerät und regelmäßige `.vani`-Sicherungen müssen erhalten bleiben.

Der automatische Desktop-Updatekanal wird erst aktiviert, wenn ein öffentlicher
Download-Ort und ein Code-Signing-Zertifikat vorhanden sind. Bis dahin ersetzt
ein neuer Setup-Installer die alte Programmfassung, ohne Inhalte zu löschen.
