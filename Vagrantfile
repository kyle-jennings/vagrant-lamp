# -*- mode: ruby -*-
# vi: set ft=ruby :
require 'yaml'
require 'fileutils'

vagrant_dir = File.expand_path(File.dirname(__FILE__))
VAGRANT_EXPERIMENTAL="disks"

Vagrant.configure('2') do |config|

  # whitelist when we show the logo, else it'll show on global Vagrant commands
  if [ 'up', 'halt', 'resume', 'suspend', 'status', 'provision', 'reload' ].include? ARGV[0] then
    show_logo = true
  end

  if show_logo then
    # Regular Colors
    black="\033[38;5;0m"
    red="\033[38;5;1m"
    green="\033[38;5;2m"
    yellow="\033[38;5;3m"
    blue="\033[38;5;4m"
    magenta="\033[38;5;5m"
    cyan="\033[38;5;6m"
    white="\033[38;5;7m"#

    # Background
    on_black="\033[48;5;0m"
    on_red="\033[48;5;1m"
    on_green="\033[48;5;2m"
    on_yellow="\033[48;5;3m"
    on_blue="\033[48;5;4m"
    on_magenta="\033[48;5;5m"
    on_cyan="\033[48;5;6m"
    on_white="\033[48;5;7m"
    line="#{on_red}#{white}"
    reset="\033[0m"


    splash = <<-HEREDOC
#{red}                       #{reset}
#{red}                       #{reset}
#{red}  ▌ ▐· ▌ ▐· ▌ ▐· ▄▄▄·  #{reset}
#{red} ▪█·█▌▪█·█▌▪█·█▌▐█ ▀█  #{reset}
#{red} ▐█▐█•▐█▐█•▐█▐█•▄█▀▀█  #{reset}
#{red}  ███  ███  ███ ▐█ ▪▐▌ #{reset}
#{red} . ▀  . ▀  . ▀   ▀  ▀  #{reset}
#{red}       Ubuntu          #{reset}
#{red}                       #{reset}
    HEREDOC


    puts splash
  end


  # Default Ubuntu Box
  #
  # This box is provided by Ubuntu vagrantcloud.com and is a nicely sized (332MB)
  # box containing the Ubuntu 14.04 Trusty 64 bit release. Once this box is downloaded
  # to your host computer, it is cached for future use under the specified box name.
  config.vm.box = 'ubuntu/xenial64'
  config.vm.hostname = 'vagrant'
  #config.vm.disk :disk, size: "100GB", primary: true

  unless Vagrant.has_plugin?("vagrant-disksize")
    raise  Vagrant::Errors::VagrantError.new, "vagrant-disksize plugin is missing. Please install it using 'vagrant plugin install vagrant-disksize' and rerun 'vagrant up'"
  end

  unless Vagrant.has_plugin?("vagrant-hostsupdater")
    raise  Vagrant::Errors::VagrantError.new, "vagrant-hostsupdater plugin is missing. Please install it using 'vagrant plugin install vagrant-hostsupdater' and rerun 'vagrant up'"
  end

  # Private Network (default)
  #
  # A private network is created by default. This is the IP address through which your
  # host machine will communicate to the guest.
  config.vm.network :private_network, id: 'vagrant_prime', ip: '192.168.10.175'

  ## forward the mysql port to the localhost
  config.vm.network "forwarded_port", guest: 3306, host: 3306


  # Store the current version of Vagrant for use in conditionals when dealing
  # with possible backward compatible issues.

  # Configurations from 1.0.x can be placed in Vagrant 1.1.x specs like the following.
  config.vm.provider :virtualbox do |v|
    v.customize ['modifyvm', :id, '--memory', 4000]
    v.customize ['modifyvm', :id, '--cpus', 2]
    v.customize ['modifyvm', :id, '--natdnshostresolver1', 'on']
    v.customize ['modifyvm', :id, '--natdnsproxy1', 'on']
    config.disksize.size = "100GB"
    # Set the box name in VirtualBox to match the working directory.
    vvv_pwd = Dir.pwd
    v.name = File.basename(vvv_pwd)
  end

  # https://github.com/sprotheroe/vagrant-disksize/issues/37#issuecomment-573349769
  # config.vm.provision "shell", inline: <<-SHELL
  #   parted /dev/sda resizepart 1 100%
  #   pvresize /dev/sda1
  #   lvresize -rl +100%FREE /dev/mapper/vagrant--vg-root
  # SHELL

  # SSH Agent Forwarding
  #
  # Enable agent forwarding on vagrant ssh commands. This allows you to use ssh keys
  # on your host machine inside the guest. See the manual for `ssh-add`.
  config.ssh.forward_agent = true
  config.ssh.insert_key = false


  show_logo = false

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
  hostnames = [
    'vagrant.loc',
    'www.vagrant.loc',
    'database.loc',
    'www.database.loc',
    'mailhog.loc',
    'www.mailhog.loc'
  ]
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
  # config.trigger.after :up do |trigger|
  #   trigger.name = '~~~ Vagrant provisioning ~~~'
  #   trigger.run_remote = { inline: 'bash /srv/config/triggers/db_restore' }
  #   trigger.on_error = :continue
  # end

  # config.trigger.after :provision do |trigger|
  #   trigger.name = '~~~ Vagrant provisioning ~~~'
  #   trigger.run_remote = { inline: 'bash /srv/config/triggers/db_update' }
  #   trigger.on_error = :continue
  # end

  # config.trigger.before :destroy do |trigger|
  #   trigger.name = '~~~ Vagrant halt ~~~'
  #   trigger.run_remote = { inline: 'bash /srv/config/triggers/db_backups' }
  #   trigger.on_error = :continue
  # end


end
