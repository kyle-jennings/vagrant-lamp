#!/bin/bash


# PACKAGE INSTALLATION
#
# Build a bash array to pass all of the packages we want to install to a single
# apt-get command. This avoids doing all the leg work each time a package is
# set to install. It also allows us to easily comment out or add single
# packages. We set the array as empty to begin with so that we can append
# individual packages to it as required.
apt_package_install_list=()

# Start with a bash array containing all packages we want to install in the
# virtual machine. We'll then loop through each of these and check individual
# status before adding them to the apt_package_install_list array.
apt_package_check_list=(

  software-properties-common
  # PHP7
  #
  # Our base packages for php7.2. As long as php7.2-fpm and php7.2-cli are
  # installed, there is no need to install the general php7.2 package, which
  # can sometimes install apache as a requirement.
  php7.2-fpm
  php7.2-cli

  # Common and dev packages for php
  php7.2-common
  php7.2-dev

  # Extra PHP modules that we find useful
  php-pear
  php-imagick
  php-memcache
  php-memcached
  php-ssh2
  php-xdebug
  php7.2-bcmath
  php7.2-curl
  php7.2-gd
  php7.2-mbstring
  php7.2-mysql
  php7.2-imap
  php7.2-json
  php7.2-soap
  php7.2-xml
  php7.2-zip

  #apache2
  apache2
  libapache2-mod-php

  # mysql is the default database
  mysql-server

  # memcached is made available for object caching
  memcached

  # other packages that come in handy
  imagemagick
  subversion
  git
  # git-lfs # cunable to locate
  zip
  unzip
  ngrep
  curl
  make
  vim
  colordiff
  postfix
  python-pip

  # ntp service to keep clock current
  ntp

  # Req'd for i18n tools
  gettext

  # Req'd for Webgrind
  graphviz

  # dos2unix
  # Allows conversion of DOS style line endings to something we'll have less
  # trouble with in Linux.
  dos2unix

  # nodejs for use by grunt
  g++
  nodejs

  #Mailcatcher requirements
  ruby-dev
  libsqlite3-dev

)

noroot() {
  sudo -EH -u "vagrant" "$@";
}

# First we need to 
add_ppa() {
    sudo add-apt-repository ppa:ondrej/php -y
    sudo apt-add-repository -y ppa:brightbox/ruby-ng
    curl -sL https://deb.nodesource.com/setup_10.x | sudo bash -

    sudo apt-get update -y
}


ruby_sass_install() {
  sudo gem install sass -v 3.4.25
}



package_check() {
  # Loop through each of our packages that should be installed on the system. If
  # not yet installed, it should be added to the array of packages to install.
  local pkg
  local package_version

  for pkg in "${apt_package_check_list[@]}"; do
    package_version=$(dpkg -s "${pkg}" 2>&1 | grep 'Version:' | cut -d " " -f 2)
    if [[ -n "${package_version}" ]]; then
      space_count="$(expr 20 - "${#pkg}")" #11
      pack_space_count="$(expr 30 - "${#package_version}")"
      real_space="$(expr ${space_count} + ${pack_space_count} + ${#package_version})"
      printf " * $pkg %${real_space}.${#package_version}s ${package_version}\n"
    else
      echo " *" $pkg [not installed]
      apt_package_install_list+=($pkg)
    fi
  done
}

package_install() {
  package_check

  # MySQL
  #
  # Use debconf-set-selections to specify the default password for the root MySQL
  # account. This runs on every provision, even if MySQL has been installed. If
  # MySQL is already installed, it will not affect anything.

  echo mysql-server mysql-server/root_password password "root" | debconf-set-selections
  echo mysql-server mysql-server/root_password_again password "root" | debconf-set-selections

  # Postfix
  #
  # Use debconf-set-selections to specify the selections in the postfix setup. Set
  # up as an 'Internet Site' with the host name 'vvv'. Note that if your current
  # Internet connection does not allow communication over port 25, you will not be
  # able to send mail, even with postfix installed.
  echo postfix postfix/main_mailer_type select Internet Site | debconf-set-selections
  echo postfix postfix/mailname string vvv | debconf-set-selections

  # Disable ipv6 as some ISPs/mail servers have problems with it
  echo "inet_protocols = ipv4" >> "/etc/postfix/main.cf"


  if [[ ${#apt_package_install_list[@]} = 0 ]]; then
    echo -e "No apt packages to install.\n"
  else
    # Before running `apt-get update`, we should add the public keys for
    # the packages that we are installing from non standard sources via
    # our appended apt source.list

    # Retrieve the Nginx signing key from nginx.org
    # echo "Applying Nginx signing key..."
    # wget --quiet "http://nginx.org/keys/nginx_signing.key" -O- | apt-key add -

    # Apply the nodejs assigning key
    apt-key adv --quiet --keyserver "hkp://keyserver.ubuntu.com:80" --recv-key C7917B12 2>&1 | grep "gpg:"
    apt-key export C7917B12 | apt-key add -

    # Update all of the package references before installing anything
    echo "Running apt-get update..."
    apt-get update -y

    # Install required packages
    echo "Installing apt-get packages..."
    apt-get install -y ${apt_package_install_list[@]}

    # Clean up apt caches
    apt-get clean
  fi
}


npm_installs(){

  ln -s /usr/bin/nodejs /usr/bin/node
  if [ ! -d ~/.npm ]; then
    mkdir ~/.npm
  fi
  sudo chown -R $(whoami) ~/.npm

  if [ ! -d /usr/local/lib/node_modules ]; then
    mkdir /usr/local/lib/node_modules
  fi

  cd /usr/local/lib/node_modules curl -L https://www.npmjs.com/install.sh | sh
  sudo chown -R $(whoami) /usr/local/lib/node_modules

  npm config set strict-ssl false
  # Make sure we have the latest npm version and the update checker module
  npm install -g npm
  npm install -g npm-check-updates

  # Make sure we have the latest npm version and the update checker module
  npm install -g gulp-cli
  npm install -g grunt-cli
  npm install -g bower

}

tools_install() {

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

  # COMPOSER
  #
  # Install Composer if it is not yet available.
  if [[ ! -n "$(composer --version --no-ansi | grep 'Composer version')" ]]; then
    echo "Installing Composer..."
    curl -sS "https://getcomposer.org/installer" | php
    chmod +x "composer.phar"
    mv "composer.phar" "/usr/local/bin/composer"
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



# Installs the AWS cli
aws_cli() {
    if [[ ! -d /home/vagrant/.local/bin/pip ]]; then
        curl -O https://bootstrap.pypa.io/get-pip.py
        python get-pip.py --user
        export PATH=~/.local/bin:$PATH
        source /home/vagrant/.bash_profile
    fi

    if [[ ! -d /home/vagrant/.local/bin/aws ]]; then
        pip install awscli --upgrade --user
        export PATH=~/.local/bin:$PATH
        source /home/vagrant/.bash_profile
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


# Webgrind install (for viewing callgrind/cachegrind files produced by
# xdebug profiler)
webgrind_install() {
  if [[ ! -d "/var/www/default/webgrind" ]]; then
    echo -e "\nDownloading webgrind, see https://github.com/michaelschiller/webgrind.git"
    git clone "https://github.com/michaelschiller/webgrind.git" "/var/www/default/webgrind"
  else
    echo -e "\nUpdating webgrind..."
    cd /var/www/default/webgrind
    git pull --rebase origin master
  fi
}


# installs phpmyadmin
phpmyadmin_setup() {
  # Download phpMyAdmin
  if [[ ! -d /var/www/default/database-admin ]]; then
    echo "Downloading phpMyAdmin..."
    cd /var/www/default
    wget -q -O phpmyadmin.tar.gz "https://files.phpmyadmin.net/phpMyAdmin/4.4.10/phpMyAdmin-4.4.10-all-languages.tar.gz"
    tar -xf phpmyadmin.tar.gz
    mv phpMyAdmin-4.4.10-all-languages database-admin
    rm phpmyadmin.tar.gz
  else
    echo "PHPMyAdmin already installed."
  fi
  cp "/srv/config/phpmyadmin/config.inc.php" "/var/www/default/database-admin/"
}


go_install() {
  if [[ ! -e /usr/local/go/bin/go ]]; then
      echo " * Installing GoLang 1.10.3"
      curl -so- https://dl.google.com/go/go1.10.3.linux-amd64.tar.gz | tar zxvf -
      mv go /usr/local
      export PATH="$PATH:/usr/local/go/bin"
      export GOPATH=/home/vagrant/gocode
  fi
}

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
    cp /srv/services/mailhog.service /etc/systemd/system/mailhog.service

    systemctl start mailhog
    systemctl enable mailhog
    systemctl daemon-reload
  fi
}



echo '-------------------------'
echo "Installing all the things"
echo '-------------------------'
add_ppa
ruby_sass_install
package_install
tools_install
wp_cli
phpmyadmin_setup
aws_cli
go_install
mailhog_install
