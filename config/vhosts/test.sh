#!/bin/bash


# deactivate and remove any and all site confs from apache
cd "/etc/apache2/sites-enabled"

# echo "cleaning up all sites vhosts"
for FILE in $(find /etc/apache2/sites-available/ -maxdepth 5 -type f -name "*.conf"); do
    if [ -f $FILE ]; then
        #echo $FILE
        sudo rm $FILE;
    fi
done

for INIT_FILE in $(find /var/www -maxdepth 3 -name 'vhosts-init'); do
    #set variables
    DIR="$(dirname "$INIT_FILE")"
    echo php -d memory_limit=-1 /srv/config/vhosts/vhosts.php $DIR
    php -d memory_limit=-1 /srv/config/vhosts/vhosts.php $DIR
    echo "~~~~~~~~~~~~~~~~~~~"
done

# move the vhosts to the sites-available directory
for FILE in $(find /var/www -maxdepth 5 -name "*.conf"); do
    sudo mv $FILE /etc/apache2/sites-available/;
    rm -rf $(dirname "$FILE")
done


# sudo service apache2 restart
sudo a2ensite * -q
