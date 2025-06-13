#!/bin/bash

npm --prefix ./scaffolded start &

npm --prefix ./zotero-translation-server start &

./caddy/caddy run --config ./Caddyfile &

wait
