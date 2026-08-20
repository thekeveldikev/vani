#!/bin/sh
# Baut index.html (PWA) und artifact.html (gehostete Seite) aus src/
cd "$(dirname "$0")"

{
  cat src/00-head.html
  echo '<style>'
  cat src/10-style.css
  echo '</style>'
  echo '</head>'
  echo '<body>'
  cat src/05-shell.html
  echo '<script>'
  cat src/30-core.js src/34-inhalt.js src/38-media.js src/40-router.js \
      src/41-zuhause.js src/42-schnipsel.js src/43-hefte.js src/44-projekte.js \
      src/45-schreibraum.js src/46-cluster.js src/47-woerter.js src/48-suche.js \
      src/49-feinheiten.js src/50-audio.js src/60-boot.js
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
  cat src/30-core.js src/34-inhalt.js src/38-media.js src/40-router.js \
      src/41-zuhause.js src/42-schnipsel.js src/43-hefte.js src/44-projekte.js \
      src/45-schreibraum.js src/46-cluster.js src/47-woerter.js src/48-suche.js \
      src/49-feinheiten.js src/50-audio.js src/60-boot.js
  echo '</script>'
} > artifact.html

echo "index.html:    $(wc -c < index.html) Bytes"
echo "artifact.html: $(wc -c < artifact.html) Bytes"
