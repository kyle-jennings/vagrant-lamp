# WP Vagrant Apache

This vagrant box is based on VVV, but utilizes Apache2 for those of us
whom are forced to use Apache.

Still very much a WIP but this should get devs up and running provided they set
up their projects following a required recipes.
Some

## installation
Before you get started, you'll need Virtual Box and vagrant

### Installation - The First Vagrant Up

1. Start with any local operating system such as Mac OS X, Linux, or Windows.
    * For Windows 8 or higher it is recommended that you run the cmd window as Administrator
1. Install [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
1. Install [Vagrant](https://www.vagrantup.com/downloads.html)

### get Vagrant Addons


1. Install the [vagrant-hostsupdater](https://github.com/cogitatio/vagrant-hostsupdater) plugin 
with `vagrant plugin install vagrant-hostsupdater`
    * Note: This step is not a requirement, though it does make the process of starting up a virtual 
    machine nicer by automating the entries needed in your local machine's `hosts` file to access the 
    provisioned VVV domains in your browser.

## Getting Started


### Configure your sites!


Each directory in the root of www is treated as a project, and will be synched
into Vagrant to be served as a website.

In order to server your websites, you'll need to create a file called "sites-custom.yml" in the root 
of the vagrant directory.  This file defines your sites, the urls to access them, and other configurations 
needed for Apache to properly serve them.


The sites-custom.yml file needs to be structured with the following (anything wraped in {} is something you change):

```yaml
sites:
  {project-name}: #this is just a label for your site settings
    hosts: # define the URLs used to access your site.
      - {first URL}
      - {second URL}
      ...
    site_root: {path from project root} # define the directory to be served, relative to your project directory in www
    env: # define any environment variables you need to use
      {VARIABLE_NAME}: {variable value}
```

Each "site" needs at the very least, the following:
* hosts
* site_root

and optionally a section for environment variables called "env"

**hosts**:
the hosts are an array/list of URLs used to access your site.  The first is the primary address and the other defined hosts
will be used as aliases.  NOTE - if one of your aliases is the your primary site but prefixed with www (www.example.loc) then
Apache will rewrite the primary URL to the www url.  So `example.loc => www.example.loc`

**directory**
This is the name of the directory containing your project in the www folder.

**site_root**:
This is where Apache will serve your site from, relative to your project directory root.  Some people (like myself) 
prefer to keep their project root very clean, only keeping things like composer files or other configs in the root.

For example, if my project directory is named example.loc (and this is is located at `www/example.loc/` )
and I want to serve my site from a directory named 'httpdocs' located in the project root, then I would 
set site_root to 'httpdocs', making the served path `www/example.loc/httpdocs`

NOTE - if you want your site served from the project root, set site_root to a dot or just dont include the setting

**env**:
this is a hash (dictionary, key pair array, whatever) of environment variables to set for the site.
The 'key' will be the variable name, and the value is the variable value.  

For example:
```
DB_NAME: wordpressdb
DB_USER: root
DB_PASSWORD: root
DB_HOST: localhost
TABLE_PREFIX: wp_
```

Below are a couple examples
sites:
  
```yaml
  server.loc:
    hosts:
      - server.loc
      - www.server.loc
    directory: default
    site_root: app

  wordpress-loc:
    hosts:
      - wordpress.loc
      - www.wordpress.loc
    directory: wordpress
    site_root: app/httpdocs
    env:
      DB_NAME: wordpressdb
      DB_USER: root
      DB_PASSWORD: root
      DB_HOST: localhost
      TABLE_PREFIX: wp_

  wordpress-core-dev:
    hosts:
      - wordpress-dev.loc
      - www.wordpress-dev.loc
    directory: wordpress-dev
    site_root: app/httpd
    env:
      DB_NAME: wordpress-core-dev-db
      DB_USER: root
      DB_PASSWORD: root
      DB_HOST: localhost
      TABLE_PREFIX: wp_
      
```


### Vagrant Up

After you have configure your sites, open a terminal window and navigate to the Vagrant directory.  
Then just issue the following command:
`$ vagrant up`

Vagrant will then start installing and configuring all the things for you.  Assuming 
you have the 'host-updater' plugin installed, when Vagrant is finished provisioning you should be able 
to access your sites at one of hte URLs you defined in the 'sites-custom.yml' file.

NOTE - don't forget to create the project folders you referenced in the 'sites-custom.yml' file, 
otherwise Apache will throw an error.

### Rebooting, re-provisioning, halting and destroying vagrant
To change the state of Vagrant, open a terminal window to the Vagrant directory and use the following commands:

**reboot the machine**
```
$ vagrant reboot
```

**reboot machine, and add new sites or projcts**
```
$ vagrant --provision
```


**Turn off, but do not delete your machine or databases**
```
$ vagrant halt
```

**Turn off, and also delete your machine or databases**
```
$ vagrant destroy
```


### Whats installed?
* PHP 7.2
* PHP FPM
* Apache 2.4
* Ruby
* Ruby SASS
* Mailhog
* phpMyAdmin
* Composer
* Git
* memcached
* mySQL
* aws cli
* wp cli

Soon:
* nodeJS
* npm
* gulp
* Vue tools
* React tools