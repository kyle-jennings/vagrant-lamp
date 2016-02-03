# -*- mode: ruby -*-
# vi: set ft=ruby :

vagrant_dir = File.expand_path(File.dirname(__FILE__))

Vagrant.configure("2") do |config|

  # Store the current version of Vagrant for use in conditionals when dealing
  # with possible backward compatible issues.
  vagrant_version = Vagrant::VERSION.sub(/^v/, '')

  # Configurations from 1.0.x can be placed in Vagrant 1.1.x specs like the following.
  config.vm.provider :virtualbox do |v|
    v.customize ["modifyvm", :id, "--memory", 2048]
    v.customize ["modifyvm", :id, "--cpus", 1]
    v.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
    v.customize ["modifyvm", :id, "--natdnsproxy1", "on"]

    # Set the box name in VirtualBox to match the working directory.
    vvv_pwd = Dir.pwd
    v.name = File.basename(vvv_pwd)
  end

  # Configuration options for the Parallels provider.
  config.vm.provider :parallels do |v|
    v.update_guest_tools = true
    v.optimize_power_consumption = false
    v.memory = 1024
    v.cpus = 1
  end

  # Configuration options for the VMware Fusion provider.
  config.vm.provider :vmware_fusion do |v|
    v.vmx["memsize"] = "1024"
    v.vmx["numvcpus"] = "1"
  end

  # Configuration options for Hyper-V provider.
  config.vm.provider :hyperv do |v, override|
    v.memory = 1024
    v.cpus = 1
  end

  # SSH Agent Forwarding
  #
  # Enable agent forwarding on vagrant ssh commands. This allows you to use ssh keys
  # on your host machine inside the guest. See the manual for `ssh-add`.
  config.ssh.forward_agent = true

  # Default Ubuntu Box
  #
  # This box is provided by Ubuntu vagrantcloud.com and is a nicely sized (332MB)
  # box containing the Ubuntu 14.04 Trusty 64 bit release. Once this box is downloaded
  # to your host computer, it is cached for future use under the specified box name.
  config.vm.box = "ubuntu/trusty64"

  config.vm.hostname = "vagrant"

  # Local Machine Hosts
  #
  # If the Vagrant plugin hostsupdater (https://github.com/cogitatio/vagrant-hostsupdater) is
  # installed, the following will automatically configure your local machine's hosts file to
  # be aware of the domains specified below.
  if defined?(VagrantPlugins::HostsUpdater)
    # Recursively fetch the paths to all vvv-hosts files under the www/ directory.
    paths = Dir[File.join(vagrant_dir, 'www', '**', 'vvv-hosts')]

    # Parse the found vvv-hosts files for host names.
    hosts = paths.map do |path|
      # Read line from file and remove line breaks
      lines = File.readlines(path).map(&:chomp)
      # Filter out comments starting with "#"
      lines.grep(/\A[^#]/)
    end.flatten.uniq # Remove duplicate entries

    # Pass the found host names to the hostsupdater plugin so it can perform magic.
    config.hostsupdater.aliases = hosts
    config.hostsupdater.remove_on_suspend = true
  end

  # Private Network (default)
  #
  # A private network is created by default. This is the IP address through which your
  # host machine will communicate to the guest.
  #
  config.vm.network :private_network, id: "vagrant_prime", ip: "192.168.50.4"


  config.vm.provider :hyperv do |v, override|
    override.vm.network :private_network, id: "vagrant_prime", ip: nil
  end



  # /srv/database/
  #
  # If a database directory exists in the same directory as your Vagrantfile,
  # a mapped directory inside the VM will be created that contains these files.
  # This directory is used to maintain default database scripts as well as backed
  # up mysql dumps (SQL files) that are to be imported automatically on vagrant up
  #config.vm.synced_folder "database/", "/srv/database"

  # If the mysql_upgrade_info file from a previous persistent database mapping is detected,
  # we'll continue to map that directory as /var/lib/mysql inside the virtual machine. Once
  # this file is changed or removed, this mapping will no longer occur. A db_backup command
  # is now available inside the virtual machine to backup all databases for future use. This
  # command is automatically issued on halt, suspend, and destroy if the vagrant-triggers
  # plugin is installed.
  if File.exists?(File.join(vagrant_dir,'database/data/mysql_upgrade_info')) then
    if vagrant_version >= "1.3.0"
      config.vm.synced_folder "database/data/", "/var/lib/mysql", :mount_options => [ "dmode=777", "fmode=777" ]
    else
      config.vm.synced_folder "database/data/", "/var/lib/mysql", :extra => 'dmode=777,fmode=777'
    end
  end

  # /srv/config/
  #
  # If a server-conf directory exists in the same directory as your Vagrantfile,
  # a mapped directory inside the VM will be created that contains these files.
  # This directory is currently used to maintain various config files for php and
  # nginx as well as any pre-existing database files.
  config.vm.synced_folder "config/", "/srv/config"

  # /srv/log/
  #
  # If a log directory exists in the same directory as your Vagrantfile, a mapped
  # directory inside the VM will be created for some generated log files.
  config.vm.synced_folder "logs/", "/var/log/apache2", :owner => "www-data"

  # /srv/www/
  #
  # If a www directory exists in the same directory as your Vagrantfile, a mapped directory
  # inside the VM will be created that acts as the default location for nginx sites. Put all
  # of your project files here that you want to access through the web server
  if vagrant_version >= "1.3.0"
    config.vm.synced_folder "www/", "/srv/www/", :owner => "www-data", :mount_options => [ "dmode=775", "fmode=774" ]
  else
    config.vm.synced_folder "www/", "/srv/www/", :owner => "www-data", :extra => 'dmode=775,fmode=774'
  end

  config.vm.provision "fix-no-tty", type: "shell" do |s|
    s.privileged = false
    s.inline = "sudo sed -i '/tty/!s/mesg n/tty -s \\&\\& mesg n/' /root/.profile"
  end



  # Provisioning
  #
  config.vm.provision :shell, :path => File.join( "provision", "provision.sh" )

  # # provision-post.sh acts as a post-hook to the default provisioning. Anything that should
  # # run after the shell commands laid out in provision.sh or provision-custom.sh should be
  # # put into this file. This provides a good opportunity to install additional packages
  # # without having to replace the entire default provisioning script.
  # if File.exists?(File.join(vagrant_dir,'provision','provision-post.sh')) then
  #   config.vm.provision :shell, :path => File.join( "provision", "provision-post.sh" )
  # end

  # # Always start MySQL on boot, even when not running the full provisioner
  # # (run: "always" support added in 1.6.0)
  if vagrant_version >= "1.6.0"
    config.vm.provision :shell, inline: "sudo service mysql restart", run: "always"
    config.vm.provision :shell, inline: "sudo service apache2 restart", run: "always"
  end

  # Vagrant Triggers
  #
  # If the vagrant-triggers plugin is installed, we can run various scripts on Vagrant
  # state changes like `vagrant up`, `vagrant halt`, `vagrant suspend`, and `vagrant destroy`
  #
  # These scripts are run on the host machine, so we use `vagrant ssh` to tunnel back
  # into the VM and execute things. By default, each of these scripts calls db_backup
  # to create backups of all current databases. This can be overridden with custom
  # scripting. See the individual files in config/homebin/ for details.
  # if defined? VagrantPlugins::Triggers
  #   config.trigger.before :halt, :stdout => true do
  #     run "vagrant ssh -c 'vagrant_halt'"
  #   end
  #   config.trigger.before :suspend, :stdout => true do
  #     run "vagrant ssh -c 'vagrant_suspend'"
  #   end
  #   config.trigger.before :destroy, :stdout => true do
  #     run "vagrant ssh -c 'vagrant_destroy'"
  #   end
  # end
end
