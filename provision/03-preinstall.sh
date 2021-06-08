#!/bin/bash

install_common_libs() {
  sudo apt-get update
  sudo apt -y install software-properties-common
}

add_ppas() {
  echo ",.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,"
  echo "Adding PPAs"
  echo ",.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,,.~^~.,"

  echo ",.~^~.,,.~^~.,,.~^~ -- ppa:ondrej/php -- .,,.~^~.,,.~^~.,,.~^~.,"
  sudo add-apt-repository -y ppa:ondrej/php

  echo ",.~^~.,,.~^~.,,.~^~ -- ppa:brightbox/ruby-ng -- .,,.~^~.,,.~^~.,,.~^~.,"
  sudo apt-add-repository -y ppa:brightbox/ruby-ng

  echo ",.~^~.,,.~^~.,,.~^~ -- nodejs 14.x -- .,,.~^~.,,.~^~.,,.~^~.,"
  curl -sL https://deb.nodesource.com/setup_14.x -o setup_14.sh ## | sudo bash -
  sudo bash ./setup_14.sh

  sudo apt-get update -y
}

add_public_keys() {
    # Before running `apt-get update`, we should add the public keys for
    # the packages that we are installing from non standard sources via
    # our appended apt source.list

    apt-key adv --quiet --keyserver "hkp://keyserver.ubuntu.com:80" --recv-key C7917B12 2>&1 | grep "gpg:"
    apt-key export C7917B12 | apt-key add -
}

mysql_prep(){
  # MySQL
  #
  # Use debconf-set-selections to specify the default password for the root MySQL
  # account. This runs on every provision, even if MySQL has been installed. If
  # MySQL is already installed, it will not affect anything.

  echo mysql-server mysql-server/root_password password "root" | debconf-set-selections
  echo mysql-server mysql-server/root_password_again password "root" | debconf-set-selections

}


postfix() {
  # Postfix
  #
  # Use debconf-set-selections to specify the selections in the postfix setup. Set
  # up as an 'Internet Site' with the host name 'vvv'. Note that if your current
  # Internet connection does not allow communication over port 25, you will not be
  # able to send mail, even with postfix installed.
  echo postfix postfix/main_mailer_type select Internet Site | debconf-set-selections
  echo postfix postfix/mailname string vvv | debconf-set-selections
  # Disable ipv6 as some ISPs/mail servers have problems with it

  if [ ! -d /etc/postfix/ ]; then
    mkdir /etc/postfix/
  fi
  echo "inet_protocols = ipv4" >> "/etc/postfix/main.cf"


}


install_common_libs
add_ppas
mysql_prep
postfix