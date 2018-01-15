#!/usr/bin/env bash

docker run --name ruby24 -e LANG=en_US.UTF-8 -it -w /slate -v $PWD:/slate ruby:2.4.3-jessie sh -c 'bundle install && bundle exec middleman build --clean'
