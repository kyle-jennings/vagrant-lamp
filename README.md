# VVVA - Varying Vagrant Vagrants - Apache

This vagrant box is based on VVV, but utilizes Apache2 for those of us
whom are forced to use Apache.

Still very much a WIP but this should get devs up and running provided they set
up their projects following a required recipes.
Some

## installation
Before you get started, you'll need Virtual Box and vagrant

### [Installation - The First Vagrant Up](#installation)

1. Start with any local operating system such as Mac OS X, Linux, or Windows.
    * For Windows 8 or higher it is recommended that you run the cmd window as Administrator
1. Install [VirtualBox 5.0.x](https://www.virtualbox.org/wiki/Downloads)
1. Install [Vagrant 1.8.x](https://www.vagrantup.com/downloads.html)

### get Vagrant Addons


1. Install the [vagrant-hostsupdater](https://github.com/cogitatio/vagrant-hostsupdater) plugin with `vagrant plugin install vagrant-hostsupdater`
    * Note: This step is not a requirement, though it does make the process of starting up a virtual machine nicer by automating the entries needed in your local machine's `hosts` file to access the provisioned VVV domains in your browser.
1. Install the [vagrant-triggers](https://github.com/emyl/vagrant-triggers) plugin with `vagrant plugin install vagrant-triggers`
    * Note: This step is not a requirement. When installed, it allows for various scripts to fire when issuing commands such as `vagrant halt` and `vagrant destroy`.


## Getting Started


Each folder in the root of www is treated as a project, and will be synched
into Vagrant to be served as a website.

At a minimum your project will need a folder named init and two file within,
hosts-init and vhosts-ini

### init folder
The provisioning process will look for the hosts-init and vhosts-init files inside
your project's init folder.

**hosts-init** - this file will set up your HOST machine's hosts file to map
your project's domain name to the Vagrant IP address. Put one hostname per line.
Note - this only works if you have installed the vagrant-hostsupdater add-on
Note2 - This file is slated to be removed to only use a single settings file
Example:

~~~
example.loc
www.example.loc
~~~

**vhosts-init** - this file will set up your Vagrant machine's virtual hosts files
so Apache knows to how to serve your site.  These settings require a specific format:

Each setting needs to be on it's own line

~~~
url=example.loc
aliases=www.example.loc another-name.loc a.final-name.loc
dirname=example/app
cert=example.loc
~~~

***url*** - this is the default url to listen for.

***aliases*** - space or comma, or comma+space delimited urls to use for things like subdomains, www, whatever

***dirname*** - the directory name to serve the site from. Basically, this is 
the directory relative of the www directory.  If your project directory is named 
"example", and the web root inside that is at "app", then you would use:
"example/app" for the dirname


So given what we just explained and the above examples, your project folder
should look like this:

~~~
example
├── app
│   ├── index.php
│   ├── wp-config.php
│   └── wp-content
├── composer.json
├── init
│   ├── hosts-init
│   ├── init.sh
│   └── vhosts-init
├── README.md
~~~
