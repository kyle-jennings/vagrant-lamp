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
    cat ${config} | shyaml --quiet key-values-0 sites |
    while readLine sitename values; do
        local safename=`echo "$sitename" | sed 's/\./\\\\./g'`
        local url=$(get_primary_host $safename)
        local aliases=$(get_hosts $safename)
        local directory=$(get_directory $safename)
        local root=$(get_root $safename)
        local env=$(get_env $safename)
        local vhost=$vhostDir'/'$url'.conf'

        sed "s#{{URL}}#$url#g" $template > $vhost
        sed -i "s#{{DIRNAME}}#${directory}/${root}#g" $vhost

        if [ ! -z "$aliases" ]; then
            sed -i "s/{{ALIASES}}/${aliases}/g" $vhost
            sed -i "s/#ServerAlias/ServerAlias/g" $vhost
        else
            sed -i "/#ServerAlias/d" $vhost
        fi

        if [ ! -z "$aliases" ] && [[ "$aliases" == *"www.${url}"* ]]; then
            sed -i "s/#Rewrite/Rewrite/g" $vhost
        fi

        if [ ! -z "$env" ]; then
            sed -i "s/#{{ENV}}/{{ENV}}/g" $vhost
            sed -i "s/{{ENV}}/${env}/g" $vhost
        else
            sed -i "/#{{ENV}}/d" $vhost
        fi
    done    
}

get_env() {
    echo $(cat ${config} | shyaml --quiet key-values-0 sites.${1}.env |
        while readLine name val; do
            echo "SetEnv $name $val \n\t";
        done
    )
}

get_primary_host() {
    local value=`cat ${config} | shyaml --quiet get-value sites.${1}.hosts.0 2> /dev/null`
    echo ${value:-$1}
}

get_hosts() {
    local value=`cat ${config} | shyaml --quiet get-values sites.${1}.hosts 2> /dev/null`
    echo ${value:-$@} | cut -d " " -f2-
}

get_directory() {
    local value=`cat ${config} | shyaml --quiet get-value sites.${1}.directory 2> /dev/null`
    echo ${value:-$1}
}

get_root() {
    local value=`cat ${config} | shyaml --quiet get-value sites.${1}.site_root . 2> /dev/null`
    echo ${value:-$1}
}


# checks each project directory for an init script and runs it if found
project_custom_tasks(){
    for SITE_CONFIG_FILE in $(find /srv/www -maxdepth 5 -name 'init.sh'); do
    # Look for site setup scripts
      DIR="$(dirname "$SITE_CONFIG_FILE")"
      (
      echo "$DIR"
      cd "$DIR"
      source init.sh
      )
    done
}

get_projects
project_custom_tasks