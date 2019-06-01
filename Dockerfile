FROM ruby:2.4

LABEL maintainer="me@adamgarren.net"

# Initial update of package info
RUN apt-get update -yqq

# Allow apt to work with https-based sources      # <label id="chapter.playing-nice-with-javascript.dockerfile-prod.allow-https-apt-sources.start" /> 
RUN apt-get install -yqq --no-install-recommends \
  apt-transport-https

# Ensure we install an up-to-date version Node
# See https://github.com/yarnpkg/yarn/issues/2888
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -

# Ensure latest packages for Yarn    # <label id="chapter.playing-nice-with-javascript.dockerfile-prod.add-yarn-package-sources.start" />
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -  
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | \
  tee /etc/apt/sources.list.d/yarn.list 

# Install packages
RUN apt-get update -yqq && apt-get install -yqq --no-install-recommends \
  nodejs \
  yarn

COPY Gemfile* /usr/src/app/
WORKDIR /usr/src/app
RUN bundle install

COPY . /usr/src/app/

# entrypoint is /prepended/ to the cmd
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD [ "rails" , "s" , "-b" , "0.0.0.0" ]
