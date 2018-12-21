#!/bin/bash


# clears out any vhosts before..
clear_vhosts(){
    rm -rf /etc/apache2/sites-enabled/*
    rm -rf /etc/apache2/sites-available/*
}


# creates all teh vhosts
create_vhosts(){

    for FILE in $(find /var/www -maxdepth 3 -name 'vhosts-init'); do
        #set variables
        VHOSTSDIR="/etc/apache2/sites-enabled"
        TEMPLATE="/srv/config/apache/vhost-default.conf"

        if [ ! -z $url ]; then
            unset $url
        fi
        if [ ! -z $aliases ]; then
            unset $aliases
        fi

        if [ ! -z $dirname ]; then
            unset $dirname
        fi

        set -a
        . $FILE
        set +a
        VHOST=$url'.conf'

        sed "s/{{URL}}/${url}/g" $TEMPLATE > $VHOSTSDIR/$VHOST
        sed -i "s~{{DIRNAME}}~${dirname}~g" $VHOSTSDIR/$VHOST

        if [ ! -z $aliases ]; then
            echo $url ' has the alias of ' $aliases
            sed -i "s/{{ALIASES}}/${aliases}/g" $VHOSTSDIR/$VHOST
            sed -i "s/#ServerAlias/ServerAlias/g" $VHOSTSDIR/$VHOST
        else
            sed -i "/#ServerAlias/d" $VHOSTSDIR/$VHOST
        fi

        if [ ! -z $aliases ] && [ $aliases == *"www.${url}"* ]; then
            sed -i "s/#Rewrite/Rewrite/g" $VHOSTSDIR/$VHOST
        fi
    done
}

copy_default_vhosts() {
    cp /srv/config/apache/vhost-dashboard.conf  /etc/apache2/sites-enabled/
    cp /srv/config/apache/vhost-phpmyadmin.conf /etc/apache2/sites-enabled/
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

# checks each project directory for an init script and runs it if found
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


echo '-------------------------------'
echo "Installing your custom sites"
echo '-------------------------------'
clear_vhosts
create_vhosts
copy_default_vhosts
clear_certs
create_ssl_certs
project_custom_tasks