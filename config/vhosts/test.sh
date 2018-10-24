#!/bin/bash


# deactivate and remove any and all site confs from apache
cd "/etc/apache2/sites-enabled"

# echo "cleaning up all sites vhosts"
for OLD_VHOSTS in $(find /etc/apache2/sites-available/ -maxdepth 5 -type f -name "*.conf"); do
    if [ -f $OLD_VHOSTS ]; then
        sudo a2dissite $OLD_VHOSTS -q;
        sudo rm $OLD_VHOSTS;
    fi
done

# remove all previously generated vhost files
echo "Removing old vhost config files from projects."
for OLD_VHOST_CONFIG_FILE in $(find /var/www -maxdepth 3 -name "vhosts"); do
    if [ -d $OLD_VHOST_CONFIG_FILE ]; then
        rm -rf $OLD_VHOST_CONFIG_FILE;
    fi
done


# remove all previously generated ssl cert, and ssl files
for OLD_CERT_FILE in $(find /var/www -maxdepth 5 -name "cert--*"); do
    if [ -f $OLD_CERT_FILE ]; then
        rm $OLD_CERT_FILE;
    fi
done


for VHOSTS_INIT_FILE in $(find /var/www -maxdepth 5 -name 'vhosts-init'); do
    # create the vhosts for the sites

    #set variables
    DIR="$(dirname "$VHOSTS_INIT_FILE")"
    DEST=${DIR}"/vhosts/"
    SCRIPT_FILE="/srv/config/vhosts/vhosts.php"


    NEWDIR=$(echo $DIR | awk -F/ '{print $(NF-1)}')
    if [ "$NEWDIR" = "www" ]; then
        NEWDIR=$(basename $DIR)
    else
        NEWDIR=$NEWDIR
    fi

    #run commands
    mkdir -p $DEST;
    php -d memory_limit=-1 $SCRIPT_FILE $VHOSTS_INIT_FILE $DEST $NEWDIR;

done

# move the vhosts to the sites-available directory
for VHOST_CONFIG_FILE in $(find /var/www -maxdepth 5 -name "*.conf"); do
    sudo mv $VHOST_CONFIG_FILE /etc/apache2/sites-available/;
done


# sudo service apache2 restart
sudo a2ensite * -q