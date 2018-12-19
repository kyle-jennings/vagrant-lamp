#!/bin/bash


phpfpm_config() {
  cp /srv/config/phpfpm/*.conf /etc/php/7.2/fpm/pool.d/
  cp /srv/config/phpfpm/*.ini /etc/php/7.2/fpm/conf.d/
  cp /srv/config/mailhog/mailhog.ini /etc/php/7.2/mods-available/mailhog.ini

  if [[ -f "/etc/php/7.2/mods-available/mailcatcher.ini" ]]; then
    echo " * Cleaning up mailcatcher.ini from a previous install"
    rm -f /etc/php/7.2/mods-available/mailcatcher.ini
  fi

  # Copy memcached configuration from local
  cp /srv/config/memcached/memcached.conf /etc/memcached.conf
  cp /srv/config/memcached/memcached.conf /etc/memcached_default.conf

}


apache_config() {
  cp /srv/config/apache/*.conf /etc/apache2/conf-enabled/
  # cp /srv/config/apache/*.ini /etc/php/7.2/apache2/php.ini
  sed -i.bak '/ServerName/#ServerName/d' /etc/apache2/apache2.conf
  echo "ServerName vagrant" >> /etc/apache2/apache2.conf

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
  a2enconf php7.2-fpm
  phpenmod mailhog
  usermod -a -G www-data vagrant
}




service_restart() {
  SERVICE=$1
  # If MySQL is installed, go through the various imports and service tasks.
  local exists_service

  exists_service="$(service ${SERVICE} status)"
  if [[ "${SERVICE}: unrecognized service" != "${exists_service}" ]]; then

    # ${SERVICE} gives us an error if we restart a non running service, which
    # happens after a `vagrant halt`. Check to see if it's running before
    # deciding whether to start or restart.
    if [[ "${SERVICE} stop/waiting" == "${exists_service}" ]]; then
      echo "service ${SERVICE} start"
      service ${SERVICE} start
      else
      echo "service ${SERVICE} restart"
      service ${SERVICE} restart
    fi

  else
    echo -e "\n${SERVICE} is not installed. Oh the humanity"
  fi
}


# restarts the webserver, and related services
restart_webserver() {
  service php7.2-fpm restart
  service apache2 restart
  service memcached restart
  service mailhog restart
  service mysql restart
  service_restart mysql
}

echo '-----------------------'
echo "Restarting web services"
echo '-----------------------'
phpfpm_config
apache_config
restart_webserver