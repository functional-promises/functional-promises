#!/bin/bash
set -e
npm test
npm run build
npm run docs-build
npm publish
sed -i 's/"functional-promise"/"functional-promises"/' package.json
npm publish
sed -i 's/"functional-promises"/"functional-promise"/' package.json

