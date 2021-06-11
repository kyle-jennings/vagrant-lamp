#!/bin/bash


# install various NPM packages such as gulp and webpack
npm_installs(){
  #ln -s /usr/bin/nodejs /usr/bin/node
  if [ ! -d ~/.npm ]; then
    mkdir ~/.npm
  fi
  sudo chown -R $(whoami) ~/.npm

  if [ ! -d /usr/local/lib/node_modules ]; then
    mkdir /usr/local/lib/node_modules
  fi

  #cd /usr/local/lib/node_modules curl -L https://www.npmjs.com/install.sh | sh
  sudo chown -R $(whoami) /usr/local/lib/node_modules

  npm config set strict-ssl false
  # Make sure we have the latest npm version and the update checker module
  echo "installing npm"
  npm install -g npm
  npm install -g npm-check-updates

  echo "installing gulp-cli"
  npm install -g gulp-cli

  echo "installing webpack"
  npm install -g webpack
}

noroot() {
  sudo -EH -u "vagrant" "$@";
}

ack_grep_install() {
  # ack-grep
  #
  # Install ack-rep directory from the version hosted at beyondgrep.com as the
  # PPAs for Ubuntu Precise are not available yet.
  if [[ -f /usr/bin/ack ]]; then
    echo "ack-grep already installed"
  else
    echo "Installing ack-grep as ack"
    curl -s http://beyondgrep.com/ack-2.14-single-file > "/usr/bin/ack" && chmod +x "/usr/bin/ack"
  fi
}

# installed and configs composer
composer_install() {

  sh /vagrant/config/scripts/xdebug_off
  # Install Composer if it is not already installed.
  composer -v > /dev/null 2>&1
  COMPOSER=$?
  if [[ $COMPOSER -ne 0 ]]; then
    echo "Installing Composer..."
    curl -sS "https://getcomposer.org/installer" | php
    chmod +x "composer.phar"
    mv "composer.phar" "/usr/local/bin/composer"
  else
    echo "Composer is installed"
  fi

  if [[ -f /vagrant/provision/github.token ]]; then
    ghtoken=`cat /vagrant/provision/github.token`
    composer config --global github-oauth.github.com $ghtoken
    echo "Your personal GitHub token is set for Composer."
  fi

  # Update both Composer and any global packages. Updates to Composer are direct from
  # the master branch on its GitHub repository.
  if [[ -n "$(composer --version --no-ansi | grep 'Composer version')" ]]; then
    echo "Updating Composer..."
    COMPOSER_HOME=/usr/local/src/composer composer self-update
    COMPOSER_HOME=/usr/local/src/composer composer -q global require --no-update phpunit/phpunit:4.3.*
    COMPOSER_HOME=/usr/local/src/composer composer -q global require --no-update phpunit/php-invoker:1.1.*
    COMPOSER_HOME=/usr/local/src/composer composer -q global require --no-update mockery/mockery:0.9.*
    COMPOSER_HOME=/usr/local/src/composer composer -q global require --no-update d11wtq/boris:v1.0.8
    COMPOSER_HOME=/usr/local/src/composer composer -q global config bin-dir /usr/local/bin
    COMPOSER_HOME=/usr/local/src/composer composer global update
  fi

}

# install sass
sass_install() {
  sudo gem install sass -v 3.4.25
}


# Installs the AWS cli
aws_cli() {
  if [[ ! -f /usr/local/bin/aws ]]; then
    echo "Installing AWS CLI..."
    sudo pip install -q awscli --upgrade
    export PATH=~/.local/bin:$PATH
    source /home/vagrant/.bash_profile
  else
    echo "AWS CLI is already installed"
  fi
}

# WP-CLI Install
wp_cli() {
  if [[ ! -f "/usr/local/bin/wp" ]]; then
    echo -e "\nDownloading wp-cli, see http://wp-cli.org"
    curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
    chmod +x wp-cli.phar
    sudo mv wp-cli.phar /usr/local/bin/wp
  fi
}

# install phpcs
php_codesniff() {
  # PHP_CodeSniffer (for running WordPress-Coding-Standards)
  # Sniffs WordPress Coding Standards
  echo -e "\nInstall/Update PHP_CodeSniffer (phpcs), see https://github.com/squizlabs/PHP_CodeSniffer"
  echo -e "\nInstall/Update WordPress-Coding-Standards, sniffs for PHP_CodeSniffer, see https://github.com/WordPress-Coding-Standards/WordPress-Coding-Standards"
  wget -q https://squizlabs.github.io/PHP_CodeSniffer/phpcs.phar

  # Link `phpcbf` and `phpcs` to the `/usr/local/bin` directory
  mv phpcs.phar /usr/local/bin/phpcs
  chmod 777 /usr/local/bin/phpcs

  # Install WP standards
  if [[ ! -d "/home/vagrant/.codestandards/wpcs" ]]; then
    echo "installing WP code standards"
    git clone -b master https://github.com/WordPress-Coding-Standards/WordPress-Coding-Standards.git /home/vagrant/.codestandards/wpcs
    phpcs --config-set installed_paths /home/vagrant/.codestandards/wpcs
    phpcs -i
  else
    echo "WP code standards are already installed"
  fi
}


# changes ownership of the user installed stuff for vagrant to use
usr_bin_chown() {
  chown -R vagrant:www-data /usr/local/bin
}


# install go - needed for mailhog
go_install() {
  if [[ ! -e /usr/local/go/bin/go ]]; then
    echo " * Installing GoLang 1.10.3"
    curl -so- https://dl.google.com/go/go1.10.3.linux-amd64.tar.gz | tar zxvf -
    mv go /usr/local
    export PATH="$PATH:/usr/local/go/bin"
    export GOPATH=/home/vagrant/gocode
  fi
}

# install mailhog - this eats up outgoing email
mailhog_install() {

  if [[ -f "/etc/init/mailcatcher.conf" ]]; then
    echo " * Cleaning up old mailcatcher.conf"
    rm -f /etc/init/mailcatcher.conf
  fi

  if [[ ! -e /usr/local/bin/mailhog ]]; then
    export GOPATH=/home/vagrant/gocode

    echo " * Fetching MailHog and MHSendmail"

    noroot mkdir -p /home/vagrant/gocode
    noroot /usr/local/go/bin/go get github.com/mailhog/MailHog
    noroot /usr/local/go/bin/go get github.com/mailhog/mhsendmail

    cp /home/vagrant/gocode/bin/MailHog /usr/local/bin/mailhog
    cp /home/vagrant/gocode/bin/mhsendmail /usr/local/bin/mhsendmail
  fi

  cp /srv/config/services/mailhog.service /etc/systemd/system/mailhog.service

  systemctl enable mailhog
  systemctl daemon-reload
  systemctl start mailhog
}


# Webgrind install (for viewing callgrind/cachegrind files produced by
# xdebug profiler)
webgrind_install() {
  if [[ ! -d "/srv/www/default/tools/webgrind" ]]; then
    echo -e "\nDownloading webgrind, see https://github.com/michaelschiller/webgrind.git"
    git clone "https://github.com/michaelschiller/webgrind.git" "/srv/www/default/tools/webgrind"
  else
    echo -e "\nUpdating webgrind..."
    cd /srv/www/default/tools/webgrind
    git pull origin master
    # git pull --rebase origin master
  fi
}


# installs phpmyadmin
phpmyadmin_setup() {
  # Download phpMyAdmin

  if [[ ! -d "/srv/www/default/tools/database" ]]; then
    echo "Downloading phpMyAdmin..."
    cd /srv/www/default/tools
    wget -q -O phpmyadmin.tar.gz "https://files.phpmyadmin.net/phpMyAdmin/5.1.1/phpMyAdmin-5.1.1-all-languages.tar.gz"
    tar -xf phpmyadmin.tar.gz
    rm phpmyadmin.tar.gz
    mv phpMy* database
  else
    echo "PHPMyAdmin already installed."
  fi
  cp "/srv/config/phpmyadmin/config.inc.php" "/srv/www/default/tools/database/"
}


# redis cache install
redis_admin_install() {

  if [[ ! -d "/srv/www/default/tools/memcached" ]]; then
    echo -e "\nDownloading phpMemcachedAdmin, see https://github.com/wp-cloud/php-memcached-admin"
    cd /srv/www/default/tools
    wget -q -O phpmemcacheadmin.tar.gz "https://github.com/wp-cloud/phpmemcacheadmin/archive/1.2.2.1.tar.gz"
    tar -xf phpmemcacheadmin.tar.gz
    rm phpmemcacheadmin*tar.gz
    mv phpRedis* redis
    cd redis
    composer install
  else
    echo "phpMemcachedAdmin already installed."
  fi

  systemctl enable redis-server.service
}

# Download and extract phpMemcachedAdmin to provide a dashboard view and
# admin interface to the goings on of memcached when running
memcached_admin_install() {
  if [[ ! -d "/srv/www/default/tools/memcached" ]]; then
    echo -e "\nDownloading phpMemcachedAdmin, see https://github.com/wp-cloud/php-memcached-admin"
    cd /srv/www/default/tools
    wget -q -O phpmemcacheadmin.tar.gz "https://github.com/wp-cloud/phpmemcacheadmin/archive/1.2.2.1.tar.gz"

    tar -xf phpmemcacheadmin.tar.gz --directory memcached
    rm phpmemcacheadmin*tar.gz
    mv phpmemcacheadmin* memcache
  else
    echo "phpMemcachedAdmin already installed."
  fi
}


# Checkout Opcache Status to provide a dashboard for viewing statistics
# about PHP's built in opcache.
opcache_admin_install() {
  if [[ ! -d "/srv/www/default/tools/opcache" ]]; then
    echo -e "\nDownloading Opcache Status, see https://github.com/rlerdorf/opcache-status/"
    cd /srv/www/default/tools
    git clone "https://github.com/rlerdorf/opcache-status.git" opcache
    cp opcache/opcache.php opcache/index.php
  else
    echo -e "\nUpdating Opcache Status"
    cd /srv/www/default/tools/opcache
    git pull origin master
    # git pull --rebase origin master
  fi
}

# sets up varnish
varnish_config() {
  if [[ -d "/etc/default" ]]; then
    cp -f "/srv/config/varnish/varnish" "/etc/default/" 2>/dev/null
  fi
  if [[ -d "/etc/varnish" ]]; then
    cp -f  "/srv/config/varnish/default.vcl" "/etc/varnish" 2>/dev/null
  fi

  cp -f "/srv/config/varnish/varnish.service" "/lib/systemd/system/" 2>/dev/null
  systemctl daemon-reload
  systemctl restart varnish
}


echo '-------------------------'
echo "Installing all the things"
echo '-------------------------'

ack_grep_install
composer_install
sass_install
wp_cli
aws_cli
go_install
mailhog_install
phpmyadmin_setup
webgrind_install
php_codesniff
npm_installs
usr_bin_chown
opcache_admin_install
redis_admin_install
memcached_admin_install
varnish_config