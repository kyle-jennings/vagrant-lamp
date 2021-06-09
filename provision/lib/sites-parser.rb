require 'yaml'

class SitesParser

  attr_reader :dir, :config_file, :config_path, :vhost_dir, :vhost_template, :foo,

  def initialize
  end

  def init
    @pwd            = File.expand_path(File.dirname(__FILE__))
    @dir            = File.expand_path("../..", @pwd)
    @config_file    = "sites.yml"
    @config_path    = File.join(@dir, 'custom', @config_file)
    @vhost_dir      = "/etc/apache2/sites-enabled"
    @vhost_template = "vhost-template.conf"


    if File.file?(@config_path) === false then
      puts @config_path + ' does not exist'
      return
    end #end if

    if ! File.directory?(@vhost_dir) then
      abort( @vhost_dir + ' does not exist')
      return
    end

    yaml_file = @config_path
    sites = YAML.load_file(yaml_file)

    puts @config_path + ' found, building vhost files.'

    sites['sites'].each do |name, site|
      args      = {
        'sitename'  => name,
        'url'       => site['hosts'][0],
        'directory' => site['directory'],
        'root'      => site['site_root'] || '' ,
        'vhost'     => vhost_dir + site['hosts'][0],
        'aliases'   => site['hosts'].length() > 1 ? site['hosts'][1...].join(' ') : nil ,
        'env'       => site['env'] || nil
      }
      args['dirname'] = args['directory'] + '/' + args['root']

      args['env'] = !args['env'].nil? ? args['env'].map{|key, val| "\t\tSetEnv #{key} #{val} \n" }.join('').sub("\t\t", '') : nil
      replace_in_template(args)
    end #end loop
  end #end def init

  def build_find_str(str)
    return '\{\{' + str + '\}\}'
  end

  def replace_in_template(args)
    template_file = @pwd + '/'+ @vhost_template
    if File.file?( template_file ) === false then
      puts template_file + ' does not exist'
      return
    end #end if



    text = File.read(template_file)
    text = text.gsub(/\{\{URL\}\}/, args['url'])
    text = text.gsub(/\{\{DIRNAME\}\}/, args['dirname'])

    text = text.gsub(/\{\{SITENAME\}\}/, args['sitename'])
    if args['aliases']
      text = text.gsub(/\{\{ALIASES\}\}/, args['aliases'])
      text = text.gsub(/#ServerAlias/, 'ServerAlias')
    end

    if args['aliases'].include? 'www.' + args['url']
      text = text.gsub(/#Rewrite/, 'Rewrite')
    end

    if args['env']
      text = text.gsub(/\#\{\{ENV\}\}/, args['env'])

    end
    # puts text

    File.open(@vhost_dir + '/' + args['sitename'] + '.conf', "w") {|file| file.puts text}


    # puts args
  end


end # end class

sites = SitesParser.new
sites.init