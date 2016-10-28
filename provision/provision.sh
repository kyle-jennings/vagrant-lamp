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

  # PHP5
  #
  # Our base packages for php5. As long as php5-fpm and php5-cli are
  # installed, there is no need to install the general php5 package, which
  # can sometimes install apache as a requirement.
  php5
  php5-cli

  # Common and dev packages for php
  php5-common
  php5-dev

  # Extra PHP modules that we find useful
  php5-memcache
  php5-imagick
  php5-mcrypt
  php5-mysql
  php5-imap
  php5-curl
  php-pear
  php5-gd

  #apache2
  apache2

  # mysql is the default database
  mysql-server
  libapache2-mod-auth-mysql

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
  npm

  #Mailcatcher requirements
  ruby-dev
  libsqlite3-dev
  ruby2.2
)

### FUNCTIONS

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

  rsync -rvzh --delete "/srv/config/homebin/" "/home/vagrant/bin/"

  echo " * Copied /srv/config/bash_profile                      to /home/vagrant/.bash_profile"
  echo " * Copied /srv/config/bash_aliases                      to /home/vagrant/.bash_aliases"
  echo " * Copied /srv/config/vimrc                             to /home/vagrant/.vimrc"
  echo " * rsync'd /srv/config/homebin                          to /home/vagrant/bin"

  # If a bash_prompt file exists in the VVV config/ directory, copy to the VM.
  if [[ -f "/srv/config/bash_prompt" ]]; then
    cp "/srv/config/bash_prompt" "/home/vagrant/.bash_prompt"
    echo " * Copied /srv/config/bash_prompt to /home/vagrant/.bash_prompt"
  fi
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
  sudo chown -R $(whoami) /usr/local/lib/node_modules
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
  cp "/srv/config/init/php.ini" "/etc/php5/apache2/php.ini"
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

ruby_install() {
  sudo apt-add-repository -y ppa:brightbox/ruby-ng
  sudo apt-get update
}

mailcatcher_install() {
  gem install mailcatcher

  if [[ ! -d "/etc/init/" ]]; then
    mkdir "/etc/init/"
  fi

  cp "/srv/config/init/mailcatcher.conf" "/etc/init/mailcatcher.conf"

  echo " * Copied /srv/config/init/mailcatcher                      to /etc/init/mailcatcher.conf"

  echo "sendmail_path = /usr/bin/env $(which catchmail) -f test@local.dev" | sudo tee /etc/php5/mods-available/mailcatcher.ini

    # Enable sendmail config for all php SAPIs (apache2, fpm, cli)
    sudo php5enmod mailcatcher

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
  php5dismod xdebug

  # Enable PHP mcrypt module by default
  a2enmod php5
  php5enmod mcrypt
  a2enmod rewrite
  a2enmod ssl

  # Enable PHP mailcatcher sendmail settings by default
  php5enmod mailcatcher

  service php5 restart
  service apache2 restart
  service mailcatcher restart

}

wp_cli() {
  # WP-CLI Install
  if [[ ! -d "/var/www/wp-cli" ]]; then
    echo -e "\nDownloading wp-cli, see http://wp-cli.org"
    git clone "https://github.com/wp-cli/wp-cli.git" "/var/www/wp-cli"
    cd /var/www/wp-cli
    composer install
  else
    echo -e "\nUpdating wp-cli..."
    cd /var/www/wp-cli
    git pull --rebase origin master
    composer update
  fi
  # Link `wp` to the `/usr/local/bin` directory
  ln -sf "/var/www/wp-cli/bin/wp" "/usr/local/bin/wp"
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


create_ssl_certs(){

    if [[ ! -d /etc/apache2/.keys ]]; then
      mkdir -p /etc/apache2/.keys
    fi


    # create a shared key and cert for https
    if [[ ! -e /etc/apache2/.keys/server.key ]]; then
      echo "Generate Nginx server private key..."
      genRSA="$(openssl genrsa -out /etc/apache2/.keys/server.key 2048 2>&1)"
      echo "$genRSA"
    fi

    if [[ ! -e /etc/apache2/.keys/server.crt ]]; then
      echo "Sign the certificate using the above private key..."
      vvvsigncert="$(openssl req -new -x509 \
              -key /etc/apache2/.keys/server.key \
              -out /etc/apache2/.keys/server.crt \
              -days 3650 \
              -subj /CN=*.loc 2>&1)"
      echo "$vvvsigncert"
    fi

}

custom_tasks(){

  # Find new sites to setup.
  # Kill previously symlinked Nginx configs
  # We can't know what sites have been removed, so we have to remove all
  # the configs and add them back in again.



  for SITE_CONFIG_FILE in $(find /var/www -maxdepth 5 -name 'init.sh'); do
  # Look for site setup scripts
    DIR="$(dirname "$SITE_CONFIG_FILE")"
    (
    echo "$DIR"
    cd "$DIR"
    source init.sh
    )
  done


  # deactivate and remove any and all site confs from apache
  echo "cleaning up all sites vhosts"
  cd "/etc/apache2/sites-enabled"
  sudo a2dissite *
  sudo rm /etc/apache2/sites-available/v*

  # remove all previously generated vhost files
  for OLD_VHOST_CONFIG_FILE in $(find /var/www -maxdepth 5 -name "*.conf"); do
  # so we can rebuild them with presumably new options
    rm $OLD_VHOST_CONFIG_FILE;
  done


  # remove all previously generated ssl cert, and ssl files
  for OLD_CERT_FILE in $(find /var/www -maxdepth 5 -name "cert--*"); do
  # so we can rebuild them with presumably new options
    rm $OLD_CERT_FILE;
  done


  # Setup all vhosts needed for project
  for VHOSTS_INIT_FILE in $(find /var/www/ -maxdepth 5 -name 'vhosts-init'); do
  # create the vhosts for the sites

    #set variables
    DIR="$(dirname "$VHOSTS_INIT_FILE")"
    DEST=${DIR}"/vhosts/"
    SCRIPT_FILE="/srv/config/vhosts/vhosts.php"

    #run commands
    mkdir -p $DEST
    mkdir -p $DIR"/certs/"
    php -d memory_limit=-1 $SCRIPT_FILE $VHOSTS_INIT_FILE $DEST

  done

  # move the vhosts to the sites-available directory
  for VHOST_CONFIG_FILE in $(find /var/www -maxdepth 5 -name "*.conf"); do

    DIR="$(dirname "$VHOST_CONFIG_FILE")/"
    DEST="/etc/apache2/sites-available/"
    REPLACE=''
    FILE=${VHOST_CONFIG_FILE/$DIR/$REPLACE}

    echo "copying '$FILE' to '/etc/apache2/sites-available/'"
    sudo cp $VHOST_CONFIG_FILE "/etc/apache2/sites-available/"$FILE
  done

  #activate our sites
  echo "activating the sites";
  cd "/etc/apache2/sites-enabled"
  sudo a2ensite *
  sudo service apache2 restart



  # Parse any vvv-hosts file located in www/ or subdirectories of www/
  # for domains to be added to the virtual machine's host file so that it is
  # self aware.
  #
  # Domains should be entered on new lines.
  echo "Cleaning the virtual machine's /etc/hosts file..."
  sed -n '/# vvv-auto$/!p' /etc/hosts > /tmp/hosts
  mv /tmp/hosts /etc/hosts
  find /var/www/ -maxdepth 5 -name 'vvv-hosts' | \
  echo "Adding domains to the virtual machine's /etc/hosts file..."
  while read hostfile; do
    while IFS='' read -r line || [ -n "$line" ]; do
      if [[ "#" != ${line:0:1} ]]; then
        if [[ -z "$(grep -q "^127.0.0.1 $line$" /etc/hosts)" ]]; then
          echo "127.0.0.1 $line # vvv-auto" >> "/etc/hosts"
          echo " * Added $line from $hostfile"
        fi
      fi
    done < "$hostfile"
  done
}





### SCRIPT
#set -xv

network_check
# Profile_setup
echo '-------------------------------'
echo "Bash profile setup and directories."
echo '-------------------------------'
profile_setup


# Package and Tools Install
echo '-------------------------------'
echo "Main packages check and install."
echo '-------------------------------'
network_check
ruby_install
package_install
npm_installs
tools_install
apache_setup
mailcatcher_install
create_ssl_certs

echo '---------------------------------------'
echo 'restarting services and setting up mysl'
echo '---------------------------------------'
services_restart
mysql_setup

# WP-CLI and debugging tools
echo '-------------------------------'
echo "Installing/updating wp-cli and adding tools"
echo '-------------------------------'
network_check
wp_cli
phpmyadmin_setup


# VVV custom site import
echo '-------------------------------'
echo "Installing your custom sites"
echo '-------------------------------'
network_check
custom_tasks


#set +xv
# And it's done
end_seconds="$(date +%s)"
echo "===================================================="
echo "Provisioning complete in "$((${end_seconds} - ${start_seconds}))" seconds"
