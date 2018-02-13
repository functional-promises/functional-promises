#!/bin/bash

output_mode=${1:-markdown}

cd /tmp

curl -Ssl -o ./Rx.min.js https://unpkg.com/rxjs@5.5.6/bundles/Rx.min.js
curl -Ssl -o ./Ix.min.js https://unpkg.com/ix@2.3.4/Ix.es5.min.js
curl -Ssl -o ./functional-promise.min.js https://unpkg.com/functional-promise@1.5.2/dist/bundle.min.js

printf "\n" && \
~/compression-report.sh $output_mode ./functional-promise.min.js && \
~/compression-report.sh $output_mode ./Rx.min.js && \
~/compression-report.sh $output_mode ./Ix.min.js
