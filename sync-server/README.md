# VANI Sync-Dienst

Dieser kleine Dienst liefert die PWA aus und bewahrt verschlüsselte Yjs-Updates
in SQLite auf. Er kennt weder den Bereichsschlüssel noch die Klartexte.

Er braucht Node.js 22.13 oder neuer und ein dauerhaftes Datenverzeichnis:

```text
VANI_DATA_DIR=/data PORT=8787 npm run start:sync
```

Für eine öffentliche Installation muss davor HTTPS liegen. `VANI_ORIGINS`
kann als kommagetrennte Liste auf die genaue öffentliche App-Adresse begrenzt
werden. Backups müssen das komplette `VANI_DATA_DIR` einschließen.

Der Docker-Build wird aus dem Projektstamm gestartet:

```text
docker build -f sync-server/Dockerfile -t vani .
```
