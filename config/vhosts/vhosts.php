<?php



// copy default http and ssl conf files and rename them
function create_vhost_files($url)
{

    global $dest;

    $file = $dest.''.$url.'.conf';
    $templates = array('default-http.conf');

    // lets just assume we have certs for everything (as we should)

    $templates[] = 'default-ssl.conf';

    $file_contents = '';

    // get the templates to create the new file
    foreach ($templates as $template) {
        $file_contents .= file_get_contents('/srv/config/vhosts/'.$template);
    }

    // remove previous vhosts
    if (file_exists($file)) {
        unlink($file);
    }

    // create new vhosts
    $new_file = fopen($dest.''.$url.'.conf', 'x+');

    // write the contents from the templates
    fwrite($new_file, $file_contents);

    // save and close the new file
    fclose($new_file);

}


// replace placeholder values in newly created vhost files with appropriate values
function set_vhost_values($args)
{

    global $dest;
    $cert_dest = str_replace('/vhosts/', '', $dest);

    // expecting $url, $aliases, $dirname, $cert, $common_name
    extract($args);

    // make sure we have some fail safes
    $aliases = isset($aliases) ? $aliases : null;

    // set the find and replace
    $find = array('{{URL}}', '{{ALIASES}}', '{{DIRNAME}}', '{{CERTNAME}}');
    $replace = array($url, $aliases, $dirname, $url);


    // if a cert is set, then use that value. otherwise use the url
    $replace[] = $url;

    // set the file names
    $file = $dest . '' . $url . '.conf';

    // if the file doesnt exist we need to bail
    if (!file_exists($file)) {
        return;
    }

    // grab the contents
    $file_contents = file_get_contents($file);

    // do the find and replace
    $file_contents = str_replace($find, $replace, $file_contents);

    // also find and replace certs, why is this separate?
    // I had an issue with the cert path earlier and im running of 5 hours sleep
    $file_contents = str_replace('{{DEST}}', $cert_dest, $file_contents);


    // if an alias is set, then we uncomment out the ServerAlias line
    if (isset($aliases)) {
        $file_contents = str_replace('#ServerAlias', 'ServerAlias', $file_contents);
    }

    // if we find a www in the alias, we uncomment out the Rewrite rules
    $www = 'www.' . $url;
    if (0 === strpos($aliases, $www)) {
        $file_contents = str_replace('#Rewrite', 'Rewrite', $file_contents);
    }

    // save teh files
    file_put_contents($file, $file_contents);

}


// we need to clean up the exploded array and make some key/value pairs
function map_args($args)
{
    $new_args = array();
    $find = [', ', ','];
    foreach ($args as $string) {
        $str_args = explode('=', $string);
        $key = $str_args[0];
        $val = $str_args[1];
        $val = str_replace($find, ' ', $val);

        $new_args[$key]=rtrim($val);
    }
    return $new_args;
}


// kill the script if no file is provided as argument
if (!(isset($argv) && isset($argv[1]))) {

    echo 'Error: no input file specified'."\n\n";
    die;
}





// unused function - to be deleted
function get_dirname()
{

    $file = strstr(__FILE__, 'www/');
    $file = ltrim($file, 'www/');
    $path = explode('/', $file);
    return $path[0].'/app';
}


function search_for_and_add($str = '')
{
    $file = '/usr/lib/ssl/openssl.cnf';
    $file_contents = file_get_contents($file);
    if(strpos($file_contents, $str) > -1 )
        return;

    file_put_contents($file, PHP_EOL.$str, FILE_APPEND | LOCK_EX);
}


function create_cert($url)
{

    $csr = '/etc/apache2/.keys/'.$url.'.csr';
    $key = '/etc/apache2/.keys/'.$url.'.key';
    $crt = '/etc/apache2/.keys/'.$url.'.crt';
    $SAN = 'subjectAltName=DNS:*.'.$url;
    $conf = '/usr/lib/ssl/openssl.cnf';

    search_for_and_add($SAN);

    #shell_exec('sudo openssl genrsa -out '.$key.' 2048');

    $generate = "openssl req \
        -newkey rsa:4096\
        -keyout $key \
        -x509 \
        -nodes \
        -out $crt \
        -subj /CN=$url \
        -reqexts SAN \
        -extensions SAN \
        -config <(cat /usr/lib/ssl/openssl.cnf <(printf '[SAN]\nsubjectAltName=DNS:*.$url')) \
        -sha256 \
        -days 3650";

    shell_exec('bash -c "'.$generate.'"');
}

function get_vars($file)
{

    $a = [];
    $f = file($file);
    
    foreach ($f as $v) {
        $t = explode('=', $v);
        $key = $t[0];
        $val = trim($t[1]);
        $val = str_replace(', ', ' ', $val);
        
        $a[$key] = $val;
    }

    return $a;
}


function init($file)
{
    
    $first_dirname = '';
    $first_cert = '';
    $first_url = '';
    $default_cert = array(
        'first_dirname' => '',
        'first_cert' => '',
        'first_url' => '',
    );


    $args = get_vars($file);

    // create the vhost file for the given URL
    create_vhost_files($args['url']);

    $args['dirname']        = isset($args['dirname']) ? $args['dirname'] : $first_dirname;
    $args['cert']           = isset($args['cert']) ? $args['cert'] : $first_cert;
    $args['common_name']    = isset($args['cert']) ? $args['url'] : $first_common_name;
    
    // now set the vhost values (its basically a template)
    set_vhost_values($args);

    search_for_and_add('[SAN]');
    create_cert($args['url']);
}



// Compose path from argument
$file       = isset($argv[1]) ? $argv[1] : null;
$dest       = isset($argv[2]) ? $argv[2] : null;
$dirname    = isset($argv[3]) ? $argv[3] : null;

// first we need to make sure we have a vhost-ini file. if we dont then we bail
if (!isset($file) || !is_readable($file) || !($fp = fopen($file, 'r'))) {

    // Error
    echo 'Error: input file does not exist or cannot be opened'."\n";
    echo $file."\n\n";
    exit(0);
}

init($file, $dest, $dirname);