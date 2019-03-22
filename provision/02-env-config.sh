#!/bin/bash

cleanup_terminal_splash() {
  # Dastardly Ubuntu tries to be helpful and suggest users update packages
  # themselves, but this can break things
  if [[ -f /etc/update-motd.d/00-header ]]; then
    rm /etc/update-motd.d/00-header
  fi
  
  if [[ -f /etc/update-motd.d/10-help-text ]]; then
    rm /etc/update-motd.d/10-help-text
  fi
  
  if [[ -f /etc/update-motd.d/51-cloudguest ]]; then
    rm /etc/update-motd.d/51-cloudguest
  fi
  
  if [[ -f /etc/update-motd.d/50-landscape-sysinfo ]]; then
    rm /etc/update-motd.d/50-landscape-sysinfo
  fi
  
  if [[ -f /etc/update-motd.d/90-updates-available ]]; then
    rm /etc/update-motd.d/90-updates-available
  fi
  
  if [[ -f /etc/update-motd.d/91-release-upgrade ]]; then
    rm /etc/update-motd.d/91-release-upgrade
  fi
  
  if [[ -f /etc/update-motd.d/95-hwe-eol ]]; then
    rm /etc/update-motd.d/95-hwe-eol
  fi
  
  if [[ -f /etc/update-motd.d/98-cloudguest ]]; then
    rm /etc/update-motd.d/98-cloudguest
  fi
  
  if [[ -f /vagrant/splash-custom ]]; then
    cp "/vagrant/splash-custom" "/etc/update-motd.d/00-bash-splash"
    chmod +x /etc/update-motd.d/00-bash-splash
  else
    cp "/srv/config/update-motd.d/00-bash-splash" "/etc/update-motd.d/00-bash-splash"
    chmod +x /etc/update-motd.d/00-bash-splash
  fi
}


profile_setup() {
  # Copy custom dotfiles and bin file for the vagrant user from local
  cp "/srv/config/shell-profiles/bash_profile" "/home/vagrant/.bash_profile"
  cp "/srv/config/shell-profiles/bash_aliases" "/home/vagrant/.bash_aliases"
  cp "/srv/config/shell-profiles/vimrc" "/home/vagrant/.vimrc"

  if [[ ! -d "/home/vagrant/bin" ]]; then
    mkdir "/home/vagrant/bin"
  fi

  echo " * Copied /srv/config/bash_profile                      to /home/vagrant/.bash_profile"
  echo " * Copied /srv/config/bash_aliases                      to /home/vagrant/.bash_aliases"
  echo " * Copied /srv/config/vimrc                             to /home/vagrant/.vimrc"

}


usr_bin_scripts() {
    cp "/srv/scripts/*" "/usr/bin/"
}

allow_ssh_passwd() {
  sed -i "s/PasswordAuthentication no/PasswordAuthentication yes/g" /etc/ssh/sshd_config
  service ssh reload
}

echo '------------------------------------------------'
echo "Setting up some basic environment configurations"
echo '------------------------------------------------'
cleanup_terminal_splash
profile_setup
allow_ssh_passwd