FROM ruby:2.4.3-alpine
# docker run --name ruby24 -e LANG=en_US.UTF-8 -it -w /slate -v $PWD:/slate
# ruby:2.4.3-jessie sh -c 'bundle install && bundle exec middleman build --clean'
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
RUN sudo gem install bundler && gem which bundler

RUN bundle install

# ENTRYPOINT bundler exec middleman build
ENTRYPOINT bundle exec middleman build --verbose

