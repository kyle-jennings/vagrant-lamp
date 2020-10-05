#!/bin/bash

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
restart_web_services() {
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