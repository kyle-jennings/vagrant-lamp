#!/bin/sh

config="/vagrant/sites-custom.yml"
vhostDir="/etc/apache2/sites-enabled"
template="/srv/config/apache/vhost-template.conf"

# echo '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
# echo $config
# echo '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
if [ ! -e $config ]; then
    exit 0
fi

readLine() {
    while [ "$1" ]; do
        IFS=$'\0' read -r -d '' "$1" || return 1
        shift
    done
}

get_projects() {
    cat ${config} | shyaml --quiet key-values-0 aws |
    while readLine profile values; do
      local profiles=$(get_profiles $profile)
      echo $profiles
    done
}


get_profiles() {
    # local value=`cat ${config} | shyaml --quiet get-values aws.${1} 2> /dev/null`
    # echo ${value:-$@} | cut -d " " -f2-

    cat ${config} | shyaml --quiet get-values aws.${1} |
    while readLine args values; do
      echo $args
    done
    # echo ${value:-$@} | cut -d " " -f2-
}

get_projects