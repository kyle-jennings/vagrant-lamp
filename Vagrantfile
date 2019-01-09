# -*- mode: ruby -*-
# vi: set ft=ruby :
require 'yaml'
require 'fileutils'

vagrant_dir = File.expand_path(File.dirname(__FILE__))

Vagrant.configure('2') do |config|


  # Private Network (default)
  #
  # A private network is created by default. This is the IP address through which your
  # host machine will communicate to the guest.
  config.vm.network :private_network, id: 'vagrant_prime', ip: '192.168.10.175'

  config.vm.provider :hyperv do |v, override|
    override.vm.network :private_network, id: 'vagrant_prime', ip: nil
  end


  # Store the current version of Vagrant for use in conditionals when dealing
  # with possible backward compatible issues.

  # Configurations from 1.0.x can be placed in Vagrant 1.1.x specs like the following.
  config.vm.provider :virtualbox do |v|
    v.customize ['modifyvm', :id, '--memory', 4000]
    v.customize ['modifyvm', :id, '--cpus', 2]
    v.customize ['modifyvm', :id, '--natdnshostresolver1', 'on']
    v.customize ['modifyvm', :id, '--natdnsproxy1', 'on']

    # Set the box name in VirtualBox to match the working directory.
    vvv_pwd = Dir.pwd
    v.name = File.basename(vvv_pwd)
  end

  # SSH Agent Forwarding
  #
  # Enable agent forwarding on vagrant ssh commands. This allows you to use ssh keys
  # on your host machine inside the guest. See the manual for `ssh-add`.
  config.ssh.forward_agent = true
  config.ssh.insert_key = false

  # Default Ubuntu Box
  #
  # This box is provided by Ubuntu vagrantcloud.com and is a nicely sized (332MB)
  # box containing the Ubuntu 14.04 Trusty 64 bit release. Once this box is downloaded
  # to your host computer, it is cached for future use under the specified box name.
  config.vm.box = 'ubuntu/xenial64'
  config.vm.hostname = 'vagrant'


  show_logo = false
  branch_c = "\033[38;5;6m"#111m"
  red="\033[38;5;9m"#124m"
  green="\033[1;38;5;2m"#22m"
  blue="\033[38;5;4m"#33m"
  purple="\033[38;5;5m"#129m"
  docs="\033[0m"
  yellow="\033[38;5;3m"#136m"
  yellow_underlined="\033[4;38;5;3m"#136m"
  url=yellow_underlined
  creset="\033[0m"


  # read in the YAML files
  if File.file?(File.join(vagrant_dir, 'sites-custom.yml')) == false then
    FileUtils.cp( File.join(vagrant_dir, 'sites-example.yml'), File.join(vagrant_dir, 'sites-custom.yml') )
  end
  
  if File.file?(File.join(vagrant_dir, 'sites-custom.yml')) == false then
    abort('Not found: sites-custom.yml or sites-example.yml')
  end

  vagrant_version = Vagrant::VERSION.sub(/^v/, '')
  if vagrant_version <= '1.6.0'
    abort('Vagrant version must be newer than 1.6.0')
  end

  unless defined? VagrantPlugins::HostsUpdater
    puts 'Host updater plugin not installed, you\'ll need to update your host file manually.'
  end

  # Sync these folders to /srv
  ['databases', 'config', 'www'].each do |dir|
    if File.exists?(File.join(vagrant_dir, dir)) then
      config.vm.synced_folder dir + '/', '/srv/' + dir, :owner => "vagrant", :mount_options => [ "dmode=775", "fmode=774" ]
    else
      puts('Hey now, the "' + dir + '" directory is missing.  We are creating it for you..' )
      system('mkdir ' + dir)
      abort('Created the directory!  Try your command again')
    end
  end

  # custom triggers
  if File.exists?(File.join(vagrant_dir, 'triggers')) then
    config.vm.synced_folder 'triggers/', '/srv/config/triggers/custom/', :owner => 'www-data', :mount_options => [ 'dmode=775', 'fmode=774' ]
  end

  # logs
  if File.exists?(File.join(vagrant_dir, 'logs')) then
    config.vm.synced_folder "logs/", "/var/log/apache2", :owner => "vagrant", :mount_options => [ "dmode=777", "fmode=777" ]
  else
    puts('Hey now, the "logs" directory is missing.  We are creating it for you..' )
    system('mkdir ' + 'logs')
    abort('Created the directory!  Try your command again')
  end

  config.vm.provision 'fix-no-tty', type: 'shell' do |s|
    s.privileged = false
    s.inline = 'sudo sed -i "/tty/!s/mesg n/tty -s \\&\\& mesg n/" /root/.profile'
  end

  # Customfile - POSSIBLY UNSTABLE
  #
  # Use this to insert your own (and possibly rewrite) Vagrant config lines. Helpful
  # for mapping additional drives. If a file 'Customfile' exists in the same directory
  # as this Vagrantfile, it will be evaluated as ruby inline as it loads.
  #
  # Note that if you find yourself using a Customfile for anything crazy or specifying
  # different provisioning, then you may want to consider a new Vagrantfile entirely.
  if File.exists?(File.join(vagrant_dir,'Customfile')) then
    eval(IO.read(File.join(vagrant_dir,'Customfile')), binding)
  end


  # Provisioning
  config.vm.synced_folder 'provision/', '/home/vagrant/provision'
  
  config.vm.provision :shell, :path => File.join( 'provision', '01-network-check.sh' )
  config.vm.provision :shell, :path => File.join( 'provision', '02-env-config.sh' )
  config.vm.provision :shell, :path => File.join( 'provision', '03-package-installs.sh' )
  config.vm.provision :shell, :path => File.join( 'provision', '04-web-services-prep.sh' )
  config.vm.provision :shell, inline: '/bin/bash ' + File.join( 'provision', '05-provision-sites.sh' )


  # Set host machine's host files 
  hostnames = ['vagrant.loc', 'www.vagrant.loc', 'database.loc', 'www.database.loc', 'mailhog.loc', 'www.mailhog.loc']
  yaml_file = File.join(vagrant_dir, 'sites-custom.yml')
  yaml = YAML.load_file(yaml_file)
      
  if ! yaml['sites'].kind_of? Hash then
    yaml['sites'] = Hash.new
  end

  yaml['sites'].each do |site, args|
    if ! args['hosts'].kind_of? Array then
      args['hosts'] = Array.new
    end 
    hostnames.concat(args['hosts'])
  end

  hostnames.flatten.uniq

  # Pass the found host names to the hostsupdater plugin so it can perform magic.
  config.hostsupdater.aliases = hostnames
  config.hostsupdater.remove_on_suspend = true

  # restart all web services
  config.vm.provision :shell, :path => File.join( 'provision', '06-restart-web-services.sh' ), run: 'always'

  # Triggers
  # These are run when vagrant is brought up, down, and destroyed
  config.trigger.after :up, :reload do |trigger|
    trigger.name = '~~~ Vagrant provisioning ~~~'
    trigger.run_remote = { inline: 'bash /srv/config/triggers/db_restore' }
    trigger.on_error = :continue
  end


  config.trigger.before :destroy do |trigger|
    trigger.name = '~~~ Vagrant halt ~~~'
    trigger.run_remote = { inline: 'bash /srv/config/triggers/db_backups' }
    trigger.on_error = :continue
  end


end
