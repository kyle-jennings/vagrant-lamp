#!/bin/bash


# PACKAGE INSTALLATION
#
# Build a bash array to pass all of the packages we want to install to a single
# apt-get command. This avoids doing all the leg work each time a package is
# set to install. It also allows us to easily comment out or add single
# packages. We set the array as empty to begin with so that we can append
# individual packages to it as required.
apt_package_install_list=()
php_package_install_list=()


php_package_check_list=(
  php7.4-fpm
  php7.4-cli
  php7.4-common
  php7.4-dev
  php-pear
  php-pcov
  php7.4-bcmath
  php7.4-curl
  php7.4-gd
  php7.4-intl
  php7.4-mbstring
  php7.4-mysql
  php7.4-imap
  php7.4-json
  php7.4-soap
  php7.4-xml
  php7.4-zip
  php7.4-yaml
  php7.4-xdebug
  php-imagick
  php-memcache
  php-memcached
  php-ssh2
  php-redis
)

# Start with a bash array containing all packages we want to install in the
# virtual machine. We'll then loop through each of these and check individual
# status before adding them to the apt_package_install_list array.
apt_package_check_list=(

  software-properties-common

  # apache stuff
  apache2
  libapache2-mod-php7.4

  # mysql is the default database
  mysql-server

  # caching things
  memcached
  # redis-server
  # varnish

  # other packages that come in handy
  imagemagick
  subversion
  git
  zip
  unzip
  ngrep
  curl
  make
  vim
  colordiff
  # postfix
  python3-pip

  # ntp service to keep clock current
  ntp

  # Req'd for i18n tools
  gettext

  # Req'd for Webgrind
  graphviz

  # gnu compiler
  g++

  # nodejs for use by grunt
  nodejs

  # Ruby
  ruby

)

# PHP - Loop through each of our packages that should be installed on the system. If
# not yet installed, it should be added to the array of packages to install.
php_package_check() {
  local pkg
  local package_version

  for pkg in "${php_package_check_list[@]}"; do
    package_version=$(dpkg -s "${pkg}" 2>&1 | grep 'Version:' | cut -d " " -f 2)
    if [[ -n "${package_version}" ]]; then
      space_count="$(expr 20 - "${#pkg}")" #11
      pack_space_count="$(expr 30 - "${#package_version}")"
      real_space="$(expr ${space_count} + ${pack_space_count} + ${#package_version})"
      printf " * $pkg %${real_space}.${#package_version}s ${package_version}\n"
    else
      echo " *" $pkg [not installed]
      php_package_install_list+=($pkg)
    fi
  done
}

# Loop through each of our packages that should be installed on the system. If
# not yet installed, it should be added to the array of packages to install.
apt_package_check() {
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

# installs our PHP packages
php_install() {
  php_package_check

  if [[ ${#php_package_install_list[@]} = 0 ]]; then
    echo -e "No apt packages to install.\n"
  else
    # Before running `apt-get update`, we should add the public keys for
    # the packages that we are installing from non standard sources via
    # our appended apt source.list

    apt-key adv --quiet --keyserver "hkp://keyserver.ubuntu.com:80" --recv-key C7917B12 2>&1 | grep "gpg:"
    apt-key export C7917B12 | apt-key add -

    # Update all of the package references before installing anything
    echo ",.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,"
    echo ",.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,"
    echo "Installing PHP packages"
    echo ${php_package_install_list[@]}
    echo ",.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,"
    echo ",.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,"

    # Install required packages
    echo "Installing apt-get packages..."
    apt-get install -y ${php_package_install_list[@]}

    # Clean up apt-get caches
    apt-get clean
  fi
}

# installs all of our defined packages, runs apt-get update first. or it should anyway
package_install() {
  apt_package_check

  if [[ ${#apt_package_install_list[@]} = 0 ]]; then
    echo -e "No apt packages to install.\n"
  else
    # Update all of the package references before installing anything
    echo ",.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,"
    echo ",.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,"
    echo "Installing other packages"
    echo ${apt_package_install_list[@]}
    echo ",.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,"
    echo ",.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,"

    # Install required packages
    echo "Installing apt-get packages..."
    apt-get install -y ${apt_package_install_list[@]}

    # Clean up apt-get caches
    apt-get clean
  fi
}

apt_update() {
  apt-get update -y
}

apt_update
php_install
package_install