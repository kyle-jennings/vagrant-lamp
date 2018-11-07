# -*- mode: ruby -*-
# vi: set ft=ruby :

vagrant_dir = File.expand_path(File.dirname(__FILE__))

Vagrant.configure("2") do |config|

  # Store the current version of Vagrant for use in conditionals when dealing
  # with possible backward compatible issues.
  vagrant_version = Vagrant::VERSION.sub(/^v/, '')

  # Configurations from 1.0.x can be placed in Vagrant 1.1.x specs like the following.
  config.vm.provider :virtualbox do |v|
    v.customize ["modifyvm", :id, "--memory", 4000]
    v.customize ["modifyvm", :id, "--cpus", 2]
    v.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
    v.customize ["modifyvm", :id, "--natdnsproxy1", "on"]

    # Set the box name in VirtualBox to match the working directory.
    vvv_pwd = Dir.pwd
    v.name = File.basename(vvv_pwd)
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
    paths = Dir[File.join(vagrant_dir, 'www', '**', 'hosts-init')]

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
  config.vm.network :private_network, id: "vagrant_prime", ip: "192.168.10.175"
  #


  config.vm.provider :hyperv do |v, override|
    override.vm.network :private_network, id: "vagrant_prime", ip: nil
  end



  # /srv/database/
  if File.exists?(File.join(vagrant_dir,'database/data/mysql_upgrade_info')) then
    if vagrant_version >= "1.3.0"
      config.vm.synced_folder "database/data/", "/var/lib/mysql", :mount_options => [ "dmode=777", "fmode=777" ]
    else
      config.vm.synced_folder "database/data/", "/var/lib/mysql", :extra => 'dmode=777,fmode=777'
    end
  end

  # /srv/config/
  config.vm.synced_folder "config/", "/srv/config"

  # sync trigger scripts
  if vagrant_version >= "1.3.0"
      config.vm.synced_folder "triggers/", "/home/vagrant/bin", :mount_options => [ "dmode=777", "fmode=777" ]
  else
      config.vm.synced_folder "triggers/", "/home/vagrant/bin", :extra => 'dmode=777,fmode=777'
  end

  # /srv/log/
  config.vm.synced_folder "logs/", "/var/log/apache2", :owner => "www-data"

  # /Projects
  if vagrant_version >= "1.3.0"
    config.vm.synced_folder "www/", "/var/www/", :owner => "www-data", :mount_options => [ "dmode=775", "fmode=774" ]
  else
    config.vm.synced_folder "www/", "/var/www/", :owner => "www-data", :extra => 'dmode=775,fmode=774'
  end

  # database backups
  if vagrant_version >= "1.3.0"
    config.vm.synced_folder "database/backups", "/srv/database/backups/", :owner => "www-data", :mount_options => [ "dmode=775", "fmode=774" ]
  else
    config.vm.synced_folder "database/backups", "/srv/database/backups/", :owner => "www-data", :extra => 'dmode=775,fmode=774'
  end


  config.vm.provision "fix-no-tty", type: "shell" do |s|
    s.privileged = false
    s.inline = "sudo sed -i '/tty/!s/mesg n/tty -s \\&\\& mesg n/' /root/.profile"
  end

  if File.exists?('custom.rb')
    eval File.open('custom.rb').read
  end

  # load File.expand_path('vagrant/Vagrantfile.custom') if File.exists?('vagrant/Vagrantfile.custom')


  # Provisioning
  config.vm.provision :shell, :path => File.join( "provision", "provision.sh" )

  # # Always start MySQL on boot, even when not running the full provisioner
  # # (run: "always" support added in 1.6.0)
  if vagrant_version >= "1.6.0"
    config.vm.provision :shell, inline: "sudo service mysql restart", run: "always"
    config.vm.provision :shell, inline: "sudo service apache2 restart", run: "always"
  end

  # triggers
  #
  # These are run when vagrant is brought up, down, and destroyed
  if defined? VagrantPlugins::Triggers
    config.trigger.after [:up] do
        run "vagrant ssh -c 'vagrant_init'"
    end

    config.trigger.before :halt, :stdout => true do
      run "vagrant ssh -c 'vagrant_halt'"
    end

    config.trigger.before :suspend, :stdout => true do
      run "vagrant ssh -c 'vagrant_suspend'"
    end

    # if File.exists?()
    config.trigger.before :destroy, :stdout => true do
      run "vagrant ssh -c 'vagrant_destroy'"
    end

  end


end
