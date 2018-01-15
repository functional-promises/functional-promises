FROM ruby:2.4.3-alpine
ENV LANG=en_US.UTF-8
COPY . /slate/
VOLUME [ "/slate" ]
WORKDIR /slate

# alpine-sdk is too fat
RUN apk -Uuv add nodejs build-base findutils grep \
      coreutils cmake gcc abuild binutils binutils && \
  bundle install


ENTRYPOINT [ "bundle exec middleman build --clean" ]

