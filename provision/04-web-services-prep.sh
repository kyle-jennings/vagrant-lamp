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
    CERT="$(openssl req -new -x509 \
            -key ${DIR}/server.key \
            -out ${DIR}/server.crt \
            -days 3650 \
            -subj /CN=*.loc/CN=*.common.loc 2>&1)"
    echo "$CERT"
  fi

}



phpfpm_config() {
  cp /srv/config/phpfpm/php-fpm.conf               /etc/php/7.2/apache2/php-fpm.conf
  cp /srv/config/phpfpm/mailhog.ini                /etc/php/7.2/mods-available/mailhog.ini
  cp /srv/config/phpfpm/conf.d/www.conf            /etc/php/7.2/apache2/conf.d/www.conf
  cp /srv/config/phpfpm/conf.d/opcache.ini         /etc/php/7.2/apache2/conf.d/opcache.ini
  cp /srv/config/phpfpm/conf.d/php-custom.ini      /etc/php/7.2/apache2/conf.d/php-custom.ini
  cp /srv/config/phpfpm/mods-available/xdebug.ini  /etc/php/7.2/mods-available/xdebug.ini

  if [[ -f "/etc/php/7.2/mods-available/mailcatcher.ini" ]]; then
    echo " * Cleaning up mailcatcher.ini from a previous install"
    rm -f /etc/php/7.2/mods-available/mailcatcher.ini
  fi
}

memcached_config() {
  # Copy memcached configuration from local
  cp /srv/config/memcached/memcached.conf /etc/memcached.conf
  cp /srv/config/memcached/memcached.conf /etc/memcached_default.conf
}

apache_config() {
  cp /srv/config/apache/ports.conf /etc/apache2/
  cp /srv/config/apache/mpm.conf /etc/apache2/conf-enabled/
  cp /srv/config/apache/php7.2-fpm.conf /etc/apache2/conf-enabled/

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
  phpenmod mailhog

  usermod -a -G www-data vagrant
  usermod -a -G vagrant www-data 
}


xdebug_log_conf() {
  # Ensure the log file for xdebug is group writeable.
  sudo touch /var/log/xdebug-remote.log
  sudo chmod 664 /var/log/xdebug-remote.log
  sudo chown vagrant:www-data /var/log/xdebug-remote.log
}

build_dashboard_css() {
  cd /srv/www/default/dashboard/src
  if [ ! -d node_modules ]; then 
    npm install --silent 
  fi
  
  gulp build
}



echo '-------------------------------'
echo "Installing your custom sites"
echo '-------------------------------'
clear_vhosts
copy_default_vhosts
clear_certs
create_ssl_certs

echo '-------------------------------'
echo "Restarting some services"
echo '-------------------------------'
phpfpm_config
memcached_config
apache_config
xdebug_log_conf
build_dashboard_css
