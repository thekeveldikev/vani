#!/bin/sh
# Baut index.html (PWA) und artifact.html (für die gehostete Seite) aus src/
cd "$(dirname "$0")"

# Die kanonische, plattformunabhängige Build-Logik liegt in
# werkzeug/build-web.mjs. Diese Hülle bleibt für Unix/Git-Bash erhalten.
if command -v node >/dev/null 2>&1 && [ "${VANI_ALTER_BUILD:-0}" != "1" ]; then
  node werkzeug/build-web.mjs
  exit $?
fi

JSDATEIEN="src/30-core.js src/29-profile.js src/31-sync.js src/35-richtext.js src/34-inhalt.js src/38-media.js src/39-beziehungen.js src/40-router.js \
  src/41-zuhause.js src/42-schnipsel.js src/42b-blaetter.js src/42c-faden.js src/42d-goodnotes.js \
  src/43-hefte.js src/43b-sticker.js src/43c-kritzel.js src/43d-ton.js src/43e-deckel.js src/44-projekte.js src/45-schreibraum.js src/45b-kerze.js src/46-cluster.js \
  src/47-woerter.js src/47b-karteikarten.js src/48-suche.js src/49-feinheiten.js src/49b-ankommen.js src/50-audio.js \
  src/53-ambience.js src/51-klangraum.js src/52-anleitung.js src/54-schreibtisch.js src/55-lesestapel.js src/60-boot.js"

{
  cat src/00-head.html
  echo '<style>'
  cat src/10-style.css
  echo '</style>'
  echo '</head>'
  echo '<body>'
  cat src/05-shell.html
  echo '<script>'
  cat vendor/vani-sync.js
  cat $JSDATEIEN
  echo '</script>'
  echo '</body>'
  echo '</html>'
} > index.html

{
  echo '<title>VANI</title>'
  echo '<style>'
  cat src/10-style.css
  echo '</style>'
  cat src/05-shell.html
  echo '<script>'
  cat vendor/vani-sync.js
  cat $JSDATEIEN
  echo '</script>'
} > artifact.html

echo "index.html:    $(wc -c < index.html) Bytes"
echo "artifact.html: $(wc -c < artifact.html) Bytes"
