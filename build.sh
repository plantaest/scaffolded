#!/bin/bash
set -e

echo "🔧 Running next build..."
next build

echo "📂 Copying public/ to .next/standalone/..."
cp -r public .next/standalone/

echo "📂 Copying .next/static to .next/standalone/.next/..."
cp -r .next/static .next/standalone/.next/

echo "📝 Creating .env.production.local..."
cat > .next/standalone/.env.production.local <<'EOF'
TEMP_TRANSLATORS_DIR=$HOME/www/js/zotero-translation-server/modules/temp-translators

EOF

echo "📦 Zipping standalone..."
(cd .next/standalone && zip -r ../../standalone.zip .)

echo "✅ Done! Created .next/standalone and standalone.zip"
