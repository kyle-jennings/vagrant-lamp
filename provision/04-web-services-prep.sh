#!/bin/bash


# clears out any vhosts before..
clear_vhosts(){
  rm -rf /etc/apache2/sites-enabled/*
}


copy_default_vhosts() {
  cp /srv/config/apache/vhosts/*  /etc/apache2/sites-enabled/
}

# clears out any certs before...
clear_certs(){
  rm -rf /etc/apache2/.keys/*
}


# creating certs!
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
    CERT="$(openssl req \
        -new \
        -x509 \
        -key ${DIR}/server.key \
        -out ${DIR}/server.crt \
        -days 3650 \
        -subj /CN=*.loc/CN=*.common.loc 2>&1)"
    # CERT="$(openssl \
    #         -req \
    #         -days 3650 \
    #         -new \
    #         -x509 \
    #         -sha256 \
    #         -key ${DIR}/server.key \
    #         -out ${DIR}/server.crt \
    #         -subj /CN=*.loc/CN=*.common.loc 2>&1)"
    echo "$CERT"
  fi

}

phpfpm_config() {
  cp /srv/config/phpfpm/php-fpm.conf               /etc/php/7.4/apache2/php-fpm.conf
  cp /srv/config/phpfpm/mailhog.ini                /etc/php/7.4/mods-available/mailhog.ini
  cp /srv/config/phpfpm/conf.d/opcache.ini         /etc/php/7.4/apache2/conf.d/opcache.ini
  cp /srv/config/phpfpm/conf.d/php-custom.ini      /etc/php/7.4/apache2/conf.d/php-custom.ini
  cp /srv/config/phpfpm/mods-available/xdebug.ini  /etc/php/7.4/mods-available/xdebug.ini

  if [[ -f "/etc/php/7.4/mods-available/mailcatcher.ini" ]]; then
    echo " * Cleaning up mailcatcher.ini from a previous install"
    rm -f /etc/php/7.4/mods-available/mailcatcher.ini
  fi
}

memcached_config() {
  # Copy memcached configuration from local
  cp /srv/config/memcached/memcached.conf /etc/memcached.conf
  cp /srv/config/memcached/memcached.conf /etc/memcached_default.conf
}

apache_config() {
  #cp /srv/config/apache/ports/conf /etc/apache2/
  cp /srv/config/apache/mpm.conf /etc/apache2/conf-enabled/
  cp /srv/config/apache/php-fpm.conf /etc/apache2/conf-enabled/

  sed -i.bak '/ServerName/d' /etc/apache2/apache2.conf
  sed -i.bak '/#ServerName/d' /etc/apache2/apache2.conf
  echo "ServerName vagrant.loc" >> /etc/apache2/apache2.conf

  a2enmod rewrite
  a2enmod ssl
  a2enmod proxy
  a2enmod proxy_http
  a2enmod proxy_ajp
  a2enmod rewrite
  a2enmod deflate
  a2enmod headers
  a2enmod xml2enc
  a2enmod proxy_balancer
  a2enmod proxy_connect
  a2enmod proxy_html
  a2enmod proxy_fcgi
  a2enmod proxy_fcgi setenvif
  a2dismod php8.1
  a2enconf php7.4-fpm
  update-alternatives --set php /usr/bin/php7.4

  echo enabling php support: mailhog
  sudo phpenmod mailhog

  sudo usermod -a -G www-data vagrant
  sudo usermod -a -G vagrant www-data
  sudo usermod -a -G www-data root
}


xdebug_log_conf() {
  # Ensure the log file for xdebug is group writeable.
  sudo touch /var/log/xdebug-remote.log
  sudo chmod 664 /var/log/xdebug-remote.log
  sudo chown vagrant:www-data /var/log/xdebug-remote.log
}

mysql_config() {
  # sed -i.bak 's/bind-address/#bind-address/' /etc/mysql/mysql.conf.d/mysqld.cnf
  sed -i '/bind-address/d' /etc/mysql/mysql.conf.d/mysqld.cnf
  mysql -u root -proot -e "CREATE USER 'root'@'%' IDENTIFIED BY 'PASSWORD';"
  mysql -u root -proot -e "ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root';"
  mysql -u root -proot -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;"
  mysql -u root -proot -e "FLUSH PRIVILEGES;"
  mysql -u root -proot -e "set sql_mode = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION,NO_AUTO_VALUE_ON_ZERO';"
}


echo '-------------------------------'
echo 'configuring services'
echo '-------------------------------'
mysql_config
phpfpm_config
memcached_config
apache_config
xdebug_log_conf

echo '-------------------------------'
echo "Installing your custom sites"
echo '-------------------------------'
clear_vhosts
copy_default_vhosts
clear_certs
create_ssl_certs