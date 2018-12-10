#!/bin/bash

for FILE in $(find /var/www -maxdepth 3 -name 'vhosts-init'); do
    #set variables
    DIR="$(dirname "$FILE")"
    VHOSTDIR=$DIR/vhosts

    set -a
    . $FILE
    VHOST=$url'.conf'; 
    touch $VHOST
    set +a
done

