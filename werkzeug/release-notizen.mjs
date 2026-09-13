/* ================================================================
   Die Notizen zu einem Desktop-Release — gebraucht vom Workflow
   .github/workflows/desktop-release.yml.

   Aufruf:  node werkzeug/release-notizen.mjs 5.60.0
   ================================================================ */
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function releaseNotizen(version) {
  const v = String(version || '').trim();
  if (!/^\d+\.\d+\.\d+$/.test(v)) throw new Error('Das ist keine Versionsnummer: ' + version);
  return [
    `VANI ${v} für Windows.`,
    '',
    `**VANI-${v}-x64-Setup.exe** — installiert VANI mit Verknüpfung im Startmenü und auf dem Desktop. Neue Fassungen lädt die App danach selbst im Hintergrund.`,
    '',
    `**VANI-${v}-x64-Portable.exe** — läuft ohne Installation, zum Ausprobieren. Für automatische Aktualisierungen die Setup-Datei nehmen.`,
    '',
    'Der Installer ist nicht signiert. Windows zeigt dann „Der Computer wurde durch Windows geschützt“ → „Weitere Informationen“ → „Trotzdem ausführen“.',
    '',
    'Ohne Installation, auch auf dem Mac: https://thekeveldikev.github.io/vani/ im Browser öffnen und als App installieren.',
    '',
    '`latest.yml` und die `.blockmap` braucht die Desktop-App für ihre Aktualisierungen.'
  ].join('\n');
}

/* Direkt aufgerufen? Unter Windows kann der Laufwerksbuchstabe in argv anders
   geschrieben sein als in import.meta.url — deshalb ohne Groß/klein vergleichen. */
const direkt = process.argv[1] && resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();
if (direkt) process.stdout.write(releaseNotizen(process.argv[2]) + '\n');
