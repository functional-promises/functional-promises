#!/bin/bash

output_mode=${1:-markdown}

# cd /tmp

curl -SslL -o /tmp/Rx.v5.min.js https://unpkg.com/rxjs@5/bundles/Rx.min.js
curl -SslL -o /tmp/Ix.v2.min.js https://unpkg.com/ix@2/Ix.es5.min.js
# curl -Ssl -o ./functional-promise.min.js https://unpkg.com/functional-promise@1.5.2/dist/functional-promise.min.js
sleep 2s

printf "\n" && \
./misc/compress-file.sh ./dist/functional-promise.min.js $output_mode && \
./misc/compress-file.sh /tmp/Rx.v5.min.js $output_mode && \
./misc/compress-file.sh /tmp/Ix.v2.min.js $output_mode
