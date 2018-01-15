#!/usr/bin/env bash
#docker run --name ruby24 -e LANG=en_US.UTF-8 -it -w /slate -v $PWD:/slate ruby:2.4.3-jessie sh -c 'bundle install && bundle exec middleman build --clean'

# cd ..

docker run -it --rm \
    -v $PWD/docs-source:/slate \
      fpromises-docs:latest
# -v $PWD/docs:/slate/build \
cp -rav ./docs-source/build/* ./docs/
# printf 'www.fpromises.io' > ./docs/CNAME
