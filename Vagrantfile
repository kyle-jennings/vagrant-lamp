# -*- mode: ruby -*-
# vi: set ft=ruby :
require 'yaml'
require 'fileutils'

vagrant_dir = File.expand_path(File.dirname(__FILE__))
VAGRANT_EXPERIMENTAL="disks"

Vagrant.configure('2') do |config|

  if Vagrant.has_plugin?("vagrant-hostmanager") then
    config.hostmanager.enabled = false
  end

  custom_folder = File.join(vagrant_dir, 'custom');

  # whitelist when we show the logo, else it'll show on global Vagrant commands
  #
  # bash raw code colors
  # https://gist.github.com/vratiu/9780109
  #
  # more modern termincal colors with varying support
  # https://misc.flogisoft.com/bash/tip_colors_and_formatting
  #

  if [ 'up', 'halt', 'resume', 'suspend', 'status', 'provision', 'reload', 'ssh' ].include? ARGV[0] then
    # Regular Colors
    black = "\033[38;5;0m"
    red = "\033[38;5;1m"
    green = "\033[38;5;2m"
    yellow = "\033[38;5;3m"
    blue = "\033[38;5;4m"
    magenta = "\033[38;5;5m"
    cyan = "\033[38;5;6m"
    white = "\033[38;5;7m"
    orange = "\e[38;5;202m"
    purple = "\e[38;5;92m"

    # Background
    on_black = "\033[48;5;0m"
    on_red = "\033[48;5;1m"
    on_green = "\033[48;5;2m"
    on_yellow = "\033[48;5;3m"
    on_blue = "\033[48;5;4m"
    on_magenta = "\033[48;5;5m"
    on_cyan = "\033[48;5;6m"
    on_white = "\033[48;5;7m"
    on_orange = "\033[48;5;202m"
    on_purple = "\033[48;5;92m"

    # color combos
    white_on_red = "#{on_red}#{white}"
    white_on_purple = "#{on_purple}#{white}"

    # misc
    underline = "\033[4m"
    reset = "\033[0m"
    blink = "\033[5m"

    puts "\n"
    puts '---'
    puts "#{orange}" + 'Vagrant development environment and shameless VVV clone supporting apache' + "#{reset}"
    puts "#{blue}#{underline}" + 'https://github.com/kyle-jennings/vagrant-lamp' + "#{reset}"
    splash_default = <<-HEREDOC
#{purple}                       #{reset}
#{purple}                       #{reset}
#{purple}  ▌ ▐· ▌ ▐· ▌ ▐· ▄▄▄·  #{reset}
#{purple} ▪█·█▌▪█·█▌▪█·█▌▐█ ▀█  #{reset}
#{purple} ▐█▐█•▐█▐█•▐█▐█•▄█▀▀█  #{reset}
#{purple}  ███  ███  ███ ▐█ ▪▐▌ #{reset}
#{purple} . ▀  . ▀  . ▀   ▀  ▀  #{reset}
#{purple}       Ubuntu          #{reset}
#{purple}                       #{reset}
    HEREDOC
    puts splash_default

    puts 'By Kyle Jennings'
    puts "#{blue}#{underline}" + 'https://kylejennings.codes' + "#{reset}"
    puts '---'
    puts "\n"

    sleep(5)


    if File.file?(File.join(custom_folder, 'splash.rb')) then
      begin
        require File.join(custom_folder, 'splash.rb')
      rescue
      end
    end

  end



  # ensure that the the sites custom file exists
  sites_custom_file = File.join(custom_folder, 'sites.yml')
  if File.file?(sites_custom_file) == false then
    FileUtils.cp( File.join(custom_folder, 'sites.example.yml'), sites_custom_file )
  end

  # Default Ubuntu Box
  #
  # This box is provided by Ubuntu vagrantcloud.com and is a nicely sized (332MB)
  # box containing the Ubuntu 14.04 Trusty 64 bit release. Once this box is downloaded
  # to your host computer, it is cached for future use under the specified box name.
  config.vm.box = 'bento/ubuntu-20.04'
  config.vm.hostname = 'vagrant'

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

    if Vagrant.has_plugin?("vagrant-disksize")
      config.disksize.size = "100GB"
    end

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


  vagrant_version = Vagrant::VERSION.sub(/^v/, '')
  if vagrant_version <= '1.6.0'
    abort('Vagrant version must be newer than 1.6.0')
  end

  config.vm.synced_folder 'provision/', '/srv/provision'
  config.vm.synced_folder 'custom/',    '/srv/custom'

  # Sync these folders to /srv
  ['databases', 'config', 'www'].each do |dir|
    if !File.exists?(File.join(vagrant_dir, dir)) then
      system('mkdir ' + dir)
    end
    config.vm.synced_folder dir + '/', '/srv/' + dir, :owner => "vagrant", :mount_options => [ "dmode=775", "fmode=777" ]
  end

  # custom triggers
  if File.exists?(File.join(vagrant_dir, 'triggers')) then
    config.vm.synced_folder 'triggers/', '/srv/config/triggers/custom/', :owner => 'www-data', :mount_options => [ 'dmode=775', 'fmode=777' ]
  end

  # logs
  if ! File.exists?(File.join(vagrant_dir, 'logs')) then
    system('mkdir ' + 'logs')
  end

  config.vm.synced_folder "logs/", "/var/log/apache2", :owner => "vagrant", :mount_options => [ "dmode=777", "fmode=777" ]

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

  # if File.exists?(File.join(vagrant_dir,'Customfile')) then
  #   eval(IO.read(File.join(vagrant_dir,'Customfile')), binding)
  # end


  # Provisioning
  config.vm.provision :shell, :path => File.join( 'provision', '01-network-check.sh' )
  config.vm.provision :shell, :path => File.join( 'provision', '02-env-config.sh' )

  # ## install the things
  config.vm.provision :shell, :path => File.join( 'provision', '03-preinstall.sh' )
  config.vm.provision :shell, :path => File.join( 'provision', '03.2-package-installs.sh' )
  config.vm.provision :shell, :path => File.join( 'provision', '03.9-postinstall.sh' )

  config.vm.provision :shell, :path => File.join( 'provision', '04-web-services-prep.sh' )
  config.vm.provision :shell, inline: <<-SHELL
    php /srv/provision/lib/vhost-builder.php
  SHELL
  # ruby $(pwd)/provision/lib/vhost-builder.rb

  config.vm.provision :shell, :path => File.join( 'provision', '06-restart-web-services.sh' ), run: 'always'

  # Set host machine's host files
  if Vagrant.has_plugin?('vagrant-hostmanager') || Vagrant.has_plugin?('vagrant-goodhosts') then
    hostnames = [
      'vagrant.loc',
      'www.vagrant.loc',
    ]
    yaml = YAML.load_file(sites_custom_file)
    if ! yaml['sites'].kind_of? Hash then
      yaml['sites'] = Hash.new
    end

    yaml['sites'].each do |site, args|
      hostnames.push(args['host'])
      if ! args['aliases'].kind_of? Array then
        args['aliases'] = Array.new
      end
      hostnames.concat(args['aliases'])
    end

    hostnames.flatten.uniq
  end

  if Vagrant.has_plugin?('vagrant-hostmanager')
    config.hostmanager.aliases = hostnames
    config.hostmanager.manage_host = true
    config.vm.provision :hostmanager
  elsif Vagrant.has_plugin?('vagrant-goodhosts')
    config.goodhosts.aliases = hostnames
  end



  # Triggers
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
