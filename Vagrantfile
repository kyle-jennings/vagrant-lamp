# -*- mode: ruby -*-
# vi: set ft=ruby :

vagrant_dir = File.expand_path(File.dirname(__FILE__))

Vagrant.configure('2') do |config|

  vagrant_version = Vagrant::VERSION.sub(/^v/, '')
  if vagrant_version <= '1.6.0'
    abort('Vagrant version must be newer than 1.6.0')
  end

  unless defined? VagrantPlugins::HostsUpdater
    system('vagrant plugin install vagrant-hostsupdater')
    puts 'Dependencies installed, please try the command again.'
    abort
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

  # Default Ubuntu Box
  #
  # This box is provided by Ubuntu vagrantcloud.com and is a nicely sized (332MB)
  # box containing the Ubuntu 14.04 Trusty 64 bit release. Once this box is downloaded
  # to your host computer, it is cached for future use under the specified box name.
  config.vm.box = 'ubuntu/xenial64'

  config.vm.hostname = 'vagrant'

  # Recursively fetch the paths to all vvv-hosts files under the www/ directory.
  paths = Dir[File.join(vagrant_dir, 'www', '**', 'vhosts-init')]

  hostnames = [];
  hosts = paths.map do |path|
      lines = File.readlines(path).map do |line|
        name, value = line.split('=');
        if name == 'url' || name == 'aliases'
          hostnames.concat(value.split(' '))
        end
      end
  end
  hostnames.flatten.uniq

  # Pass the found host names to the hostsupdater plugin so it can perform magic.
  config.hostsupdater.aliases = hostnames
  config.hostsupdater.remove_on_suspend = true


  # Private Network (default)
  #
  # A private network is created by default. This is the IP address through which your
  # host machine will communicate to the guest.
  config.vm.network :private_network, id: 'vagrant_prime', ip: '192.168.10.175'

  config.vm.provider :hyperv do |v, override|
    override.vm.network :private_network, id: 'vagrant_prime', ip: nil
  end

  # /srv/database/
  if File.exists?(File.join(vagrant_dir,'database/data/mysql_upgrade_info')) then
    config.vm.synced_folder 'database/data/', '/var/lib/mysql', :mount_options => [ 'dmode=777', 'fmode=777' ]
  end

  # Config files
  if File.exists?(File.join(vagrant_dir,'config')) then
    config.vm.synced_folder 'config/', '/srv/config'
  else
    puts('Hey now, your configs are missing, we are creating the directory for you. The provisioning script expects specific configs tho..')
    system('mkdir config')
    abort('Created the directory!  Try your command again')
  end

  # Apache Logs
  if File.exists?(File.join(vagrant_dir,'logs')) then
    config.vm.synced_folder 'logs/', '/var/log/apache2', :owner => 'www-data'
  else
    puts('Hey now, your "logs" directory is missing, we are creating the directory for you.')
    system('mkdir logs')
    abort('Created the directory!  Try your command again')
  end

  # Projects
  if File.exists?(File.join(vagrant_dir,'www')) then
    config.vm.synced_folder 'www/', '/var/www/', :owner => 'www-data', :mount_options => [ 'dmode=775', 'fmode=774' ]
  else
    puts('Hey now, your "www" directory is missing, we are creating the directory for you.')
    system('mkdir www')
    abort('Created the directory!  Try your command again')
  end
  # database backups
  if File.exists?(File.join(vagrant_dir,'databases')) then
    config.vm.synced_folder 'databases', '/srv/databases', :owner => 'www-data', :mount_options => [ 'dmode=775', 'fmode=774' ]
  else
    puts('Hey now, your "databases" directory is missing, we are creating the directory for you.')
    system('mkdir databases')
    abort('Created the directory!  Try your command again')
  end

  # custom triggers
  if File.exists?(File.join(vagrant_dir,'triggers')) then
    config.vm.synced_folder 'triggers/', '/srv/config/triggers/custom/', :owner => 'www-data', :mount_options => [ 'dmode=775', 'fmode=774' ]
  end

  config.vm.provision 'fix-no-tty', type: 'shell' do |s|
    s.privileged = false
    s.inline = 'sudo sed -i "/tty/!s/mesg n/tty -s \\&\\& mesg n/" /root/.profile'
  end

  # load File.expand_path('vagrant/Vagrantfile.custom') if File.exists?('vagrant/Vagrantfile.custom')


  # Provisioning
  config.vm.synced_folder 'provision/', '/home/vagrant/provision'
  config.vm.provision :shell, :path => File.join( 'provision', '01-network-check.sh' )
  config.vm.provision :shell, :path => File.join( 'provision', '02-env-config.sh' )
  config.vm.provision :shell, :path => File.join( 'provision', '03-package-installs.sh' )
  config.vm.provision :shell, :path => File.join( 'provision', '04-custom-sites.sh' )
  config.vm.provision :shell, :path => File.join( 'provision', '05-service-configs.sh' )

  # Always start MySQL on boot, even when not running the full provisioner
  config.vm.provision :shell, inline: 'sudo service mysql restart', run: 'always'
  config.vm.provision :shell, inline: 'sudo service apache2 restart', run: 'always'
  config.vm.provision :shell, inline: 'sudo service php7.2-fpm restart', run: 'always'
  # config.vm.provision :shell, inline: 'sudo service mailhog restart', run: 'always'
  config.vm.provision :shell, inline: 'sudo service memcached restart', run: 'always'

  # Triggers
  # These are run when vagrant is brought up, down, and destroyed
  config.trigger.after [:up] do |trigger|
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
