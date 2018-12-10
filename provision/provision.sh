#!/bin/bash

# By storing the date now, we can calculate the duration of provisioning at the
# end of this script.
start_seconds="$(date +%s)"

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

  # PHP7.0
  #
  # Our base packages for php7.2. As long as php7.2-fpm and php7.2-cli are
  # installed, there is no need to install the general php7.2 package, which
  # can sometimes install apache as a requirement.
  php7.2
  php7.2-cli
  php7.2-common
  php7.2-dev
  php7.2-curl
  php7.2-fpm
  php7.2-gd
  php-imagick
  php7.2-imap
  php7.2-ldap
  php7.2-mbstring
  #php7.2-mcrypt
  #php7.2-memcache
  php7.2-mysql
  php7.2-opcache

  php-pear
  php-gettext  

  #apache2
  apache2
  libapache2-mod-php

  # mysql is the default database
  mysql-server


  # other packages that come in handy
  imagemagick
  subversion
  git-core
  zip
  unzip
  ngrep
  curl
  make
  vim
  colordiff
  postfix

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

### FUNCTIONS


phpFPM_config() {
    cp "/srv/config/phpfpm/*.conf" "/etc/php/7.2/fpm/pool.d/"
    cp "/srv/config/php-config/*.ini" "/etc/php/7.2/fpm/conf.d/"
}

apache_config() {
    cp "/srv/config/apache/*.conf" "/etc/apache2/conf-enabled/"
    cp "/srv/config/php-config/*.ini" "/etc/php/7.2/fpm/conf.d/"
}

network_detection() {
  # Network Detection
  #
  # Make an HTTP request to google.com to determine if outside access is available
  # to us. If 3 attempts with a timeout of 5 seconds are not successful, then we'll
  # skip a few things further in provisioning rather than create a bunch of errors.
  if [[ "$(wget --tries=3 --timeout=5 --spider http://google.com 2>&1 | grep 'connected')" ]]; then
    echo "Network connection detected..."
    ping_result="Connected"
  else
    echo "Network connection not detected. Unable to reach google.com..."
    ping_result="Not Connected"
  fi
}

network_check() {
  network_detection
  if [[ ! "$ping_result" == "Connected" ]]; then
    echo -e "\nNo network connection available, skipping package installation"
    exit 0
  fi
}

noroot() {
  sudo -EH -u "vagrant" "$@";
}

profile_setup() {
  # Copy custom dotfiles and bin file for the vagrant user from local
  cp "/srv/config/bash_profile" "/home/vagrant/.bash_profile"
  cp "/srv/config/bash_aliases" "/home/vagrant/.bash_aliases"
  cp "/srv/config/vimrc" "/home/vagrant/.vimrc"

  if [[ ! -d "/home/vagrant/bin" ]]; then
    mkdir "/home/vagrant/bin"
  fi


  echo " * Copied /srv/config/bash_profile                      to /home/vagrant/.bash_profile"
  echo " * Copied /srv/config/bash_aliases                      to /home/vagrant/.bash_aliases"
  echo " * Copied /srv/config/vimrc                             to /home/vagrant/.vimrc"

  # If a bash_prompt file exists in the config/ directory, copy to the VM.
  if [[ -f "/srv/config/bash_prompt" ]]; then
    cp "/srv/config/bash_prompt" "/home/vagrant/.bash_prompt"
    echo " * Copied /srv/config/bash_prompt to /home/vagrant/.bash_prompt"
  fi
}

# First we need to 
add_ppa() {
    sudo add-apt-repository ppa:ondrej/php -y
    sudo apt-add-repository -y ppa:brightbox/ruby-ng
    curl -sL https://deb.nodesource.com/setup_10.x | sudo bash -

    sudo apt-get update -y
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



apache_setup() {
  cp "/srv/config/init/php.ini" "/etc/php/7.2/apache2/php.ini"
  sed -i.bak 's/ServerName/#ServerName/g' /etc/apache2/apache2.conf
  echo "ServerName vagrant" >> /etc/apache2/apache2.conf
}


mysql_setup() {
  # If MySQL is installed, go through the various imports and service tasks.
  local exists_mysql

  exists_mysql="$(service mysql status)"
  if [[ "mysql: unrecognized service" != "${exists_mysql}" ]]; then

    # MySQL gives us an error if we restart a non running service, which
    # happens after a `vagrant halt`. Check to see if it's running before
    # deciding whether to start or restart.
    if [[ "mysql stop/waiting" == "${exists_mysql}" ]]; then
      echo "service mysql start"
      service mysql start
      else
      echo "service mysql restart"
      service mysql restart
    fi

  else
    echo -e "\nMySQL is not installed. No databases imported."
  fi
}


ruby_sass_install() {
  sudo gem install sass -v 3.4.25
}

mailcatcher_install() {
  gem install mailcatcher

  if [[ ! -d "/etc/init/" ]]; then
    mkdir "/etc/init/"
  fi

  cp "/srv/config/init/mailcatcher.conf" "/etc/init/mailcatcher.conf"

  echo " * Copied /srv/config/init/mailcatcher                      to /etc/init/mailcatcher.conf"

  echo "sendmail_path = /usr/bin/env $(which catchmail) -f test@local.dev" | sudo tee /etc/php/7.2/mods-available/mailcatcher.ini

    # Enable sendmail config for all php SAPIs (apache2, fpm, cli)
    sudo phpenmod mailcatcher

    # Restart Apache if using mod_php
    sudo service apache2 restart

}


services_restart() {
  # RESTART SERVICES
  #
  # Make sure the services we expect to be running are running.
  echo -e "\nRestart services..."
  # service nginx restart

  # Disable PHP Xdebug module by default
  #phpdismod xdebug

  # Enable PHP mcrypt module by default
  #phpenmod mcrypt
  a2enmod rewrite
  a2enmod ssl
  a2enmod proxy
  a2enmod proxy_http
  a2enmod proxy_ajp
  a2enmod rewrite
  a2enmod deflate
  a2enmod headers
  a2enmod proxy_balancer
  a2enmod proxy_connect
  a2enmod proxy_html
  a2enmod proxy_fcgi
  # Enable PHP mailcatcher sendmail settings by default
  #phpenmod mailcatcher

}


restart_webserver() {
  service php7.2-fpm restart
  service apache2 restart
  service mailcatcher restart    
}


aws_cli() {
    if [[ ! -d /home/vagrant/.local/bin/pip ]]; then
        curl -O https://bootstrap.pypa.io/get-pip.py
        python get-pip.py --user
        export PATH=~/.local/bin:$PATH
        source ~/.bash_profile
    fi
    if [[ ! -d /home/vagrant/.local/bin/aws ]]; then
        pip install awscli --upgrade --user
        export PATH=~/.local/bin:$PATH
        source ~/.bash_profile
    fi
}


wp_cli() {
  # WP-CLI Install
  if [[ ! -f "/usr/local/bin/wp" ]]; then
    echo -e "\nDownloading wp-cli, see http://wp-cli.org"
    curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
    chmod +x wp-cli.phar
    sudo mv wp-cli.phar /usr/local/bin/wp
  fi
}


webgrind_install() {
  # Webgrind install (for viewing callgrind/cachegrind files produced by
  # xdebug profiler)
  if [[ ! -d "/var/www/default/webgrind" ]]; then
    echo -e "\nDownloading webgrind, see https://github.com/michaelschiller/webgrind.git"
    git clone "https://github.com/michaelschiller/webgrind.git" "/var/www/default/webgrind"
  else
    echo -e "\nUpdating webgrind..."
    cd /var/www/default/webgrind
    git pull --rebase origin master
  fi
}


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


clear_vhosts(){
    rm -rf /etc/apache2/sites-enabled/*
    rm -rf /etc/apache2/sites-available/*
}

clear_certs(){
    rm -rf /etc/apache2/.keys/*
}

create_ssl_certs(){

  echo '-------------------------------------------'
  echo 'creating SSL certs!'
  echo '-------------------------------------------'
  
  DIR='/etc/apache2';
  # Create an SSL key and certificate for HTTPS support.
  if [[ ! -e ${DIR}/server.key ]]; then
    echo "Generating SSL private key..."
    KEY="$(openssl genrsa -out ${DIR}/server.key 2048 2>&1)"
    echo "$KEY"
  fi

  if [[ ! -e ${DIR}/server.crt ]]; then
    echo "Sign the certificate using the above private key..."
    CERT="$(openssl req -new -x509 \
            -key ${DIR}/server.key \
            -out ${DIR}/server.crt \
            -days 3650 \
            -subj /CN=*.loc/CN=*.common.loc 2>&1)"
    echo "$CERT"
  fi

}


project_custom_tasks(){
    for SITE_CONFIG_FILE in $(find /var/www -maxdepth 5 -name 'init.sh'); do
    # Look for site setup scripts
      DIR="$(dirname "$SITE_CONFIG_FILE")"
      (
      echo "$DIR"
      cd "$DIR"
      source init.sh
      )
    done
}


vhosts_init(){

    # deactivate and remove any and all site confs from apache
    cd "/etc/apache2/sites-enabled"

    # echo "cleaning up all sites vhosts"
    for FILE in $(find /etc/apache2/sites-available/ -maxdepth 5 -type f -name "*.conf"); do
        if [ -f $FILE ]; then
            #echo $FILE
            sudo rm $FILE;
        fi
    done

    for FILE in $(find /var/www -maxdepth 3 -name 'vhosts-init'); do
        #set variables
        DIR="$(dirname "$FILE")"
        echo php -d memory_limit=-1 /srv/config/vhosts/vhosts.php $DIR
        php -d memory_limit=-1 /srv/config/vhosts/vhosts.php $DIR
        echo "~~~~~~~~~~~~~~~~~~~"
    done

    # move the vhosts to the sites-available directory
    for FILE in $(find /var/www -maxdepth 5 -name "*.conf"); do
        sudo mv $FILE /etc/apache2/sites-available/;
        rm -rf $(dirname "$FILE")
    done


    # sudo service apache2 restart
    sudo a2ensite * -q
}

### SCRIPT
set -xv

network_check
# Profile_setup
echo '-------------------------------'
echo "Bash profile setup and directories."
echo '-------------------------------'
profile_setup


# # Package and Tools Install
echo '-------------------------------'
echo "Main packages check and install."
echo '-------------------------------'
network_check
add_ppa

ruby_sass_install
package_install
npm_installs
tools_install
apache_setup
mailcatcher_install

# VVV custom site import
echo '-------------------------------'
echo "Installing your custom sites"
echo '-------------------------------'
clear_vhosts
create_ssl_certs
network_check
vhosts_init
project_custom_tasks

echo '---------------------------------------'
echo 'restarting services and setting up mysl'
echo '---------------------------------------'
services_restart
restart_webserver
mysql_setup

# WP-CLI and debugging tools
echo '-------------------------------'
echo "Installing/updating wp-cli and adding tools"
echo '-------------------------------'
network_check
wp_cli
phpmyadmin_setup
aws_cli

#set +xv
# And it's done
end_seconds="$(date +%s)"
echo "===================================================="
echo "Provisioning complete in "$((${end_seconds} - ${start_seconds}))" seconds"
