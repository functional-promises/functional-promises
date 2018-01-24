FROM ruby:2.4.3-alpine

MAINTAINER Dan Levy <Dan@DanLevy.net>

ENV LANG=en_US.UTF-8
RUN apk -Uuv add nodejs \
      abuild build-base \
      findutils \
      grep coreutils \
      cmake gcc  \
      binutils

COPY Gemfile* /slate/
# VOLUME [ "/slate" ]
WORKDIR /slate

RUN bundle install

ENTRYPOINT /usr/local/bin/bundler exec middleman build
# --verbose

