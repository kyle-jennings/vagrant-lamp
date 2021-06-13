#!/bin/bash

# restarts the webserver, and related services
restart_web_services() {
  chown www-data:www-data -R /etc/apache2/sites-enabled
  phpdismod xdebug
  service php7.4-fpm restart
  service apache2 reload
  service apache2 restart
  service memcached restart
  service mailhog restart
  service mysql restart
  #service varnish start
}

restart_web_services