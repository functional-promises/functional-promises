#!/usr/bin/env bash

set -e

#docker run --name ruby24 -e LANG=en_US.UTF-8 -it -w /slate -v $PWD:/slate ruby:2.4.3-jessie sh -c 'bundle install && bundle exec middleman build --clean'

# cd ..
npm run docs-docker
# ../misc/compression-report.sh

docker run -it --rm \
    -v $PWD/docs-source:/slate \
      fpromises-docs:latest
# -v $PWD/docs:/slate/build \
cp -av ./docs-source/build/* ./docs/
# printf 'www.fpromises.io' > ./docs/CNAME
