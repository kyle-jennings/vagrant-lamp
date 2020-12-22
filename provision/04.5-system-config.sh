#!/bin/sh

config="/vagrant/sites-custom.yml"

if [ ! -e $config ]; then
    exit 0
fi

readLine() {
  while [ "$1" ]; do
    IFS=$'\0' read -r -d '' "$1" || return 1
    shift
  done
}

reset_aws_files () {
  if [ ! -d /home/vagrant/.aws ]; then
    mkdir -p /home/vagrant/.aws
  fi

  echo '' > /home/vagrant/.aws/credentials
  echo '' > /home/vagrant/.aws/config
}

get_aws_profiles() {

  cat ${config} | shyaml --quiet key-values-0 aws |
  while readLine profile values; do
  echo [$profile] >> /home/vagrant/.aws/credentials
  local creds=$(get_profile_credentials $profile)
  echo $creds

  done
}


get_profile_credentials() {
  echo $(cat ${config} | shyaml key-values-0 aws.${1}.credentials  |
    while readLine key val; do
      echo "$key = $val \n\t";
    done)

}

get_profile_config() {
  echo $(cat ${config} | shyaml key-values-0 aws.${1}.config  |
    while readLine key val; do
      echo "$key = $val";
    done)
}

reset_aws_files
get_aws_profiles