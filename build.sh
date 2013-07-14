#!/usr/bin/env bash

cd "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cjsify -o RTWorldReader.js -x RTWorldReader sources/index.js
uglifyjs -m -o RTWorldReader.min.js RTWorldReader.js
