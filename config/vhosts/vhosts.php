<?php


// create the certs
function create_certs($url){

    global $dest;
    $cert_dest = str_replace('/vhosts/','',$dest);

    $command = '';

    $command .= 'sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 ';
    $command .= '-keyout '.$cert_dest.'/certs/cert--'.$url.'.key -out '.$cert_dest.'/certs/cert--'.$url.'.crt ';
    $command .= '-subj "/C=US/ST=District of Columbia/L=DC/O=gsa/OU=ocsit/CN='.$url.'"';

    shell_exec($command);
}


// copy default http and ssl conf files and rename them
function create_vhost_files($url){

    global $dest;

    $file = $dest.'vhost--'.$url.'.conf';
    $templates = array('default-http.conf');

    // lets just assume we have certs for everything (as we should)
    $cert = $url;
    if(isset($cert))
        $templates[] = 'default-ssl.conf';

    $file_contents = '';

    // get the templates to create the new file
    foreach($templates as $template)
        $file_contents .= file_get_contents('/srv/config/vhosts/'.$template);

    // remove previous vhosts
    if(file_exists($file))
        unlink($file);

    // create new vhosts
    $new_file = fopen($dest.'vhost--'.$url.'.conf', 'x+');
    // write the contents from the templates
    fwrite($new_file, $file_contents);

    // save and close the new file
    fclose($new_file);

}


// replace placeholder values in newly created vhost files with appropriate values
function set_vhost_values($args){

    global $dest;
    global $first_dirname;
    $cert_dest = str_replace('/vhosts/','',$dest);


    // expecting $url, $aliases, $dirname
    extract($args);

    // make sure we have some fail safes
    $aliases = isset($aliases) ? $aliases : null;
    $dirname = isset($dirname) ? $dirname : $first_dirname;

    // set the find and replace
    $find = array('{{URL}}','{{ALIASES}}','{{DIRNAME}}','{{CERT}}');
    $replace = array($url, $aliases, $dirname);


    // if a cert is set, then use that value. otherwise use the url
    if(isset($cert))
        $replace[] = $cert;
    else
        $replace[] = $url;

    // set the file names
    $file = $dest.'vhost--'.$url.'.conf';

    // if the file doesnt exist we need to bail
    if(!file_exists($file))
        return;

    // grab the contents
    $file_contents = file_get_contents($file);

    // do the find and replace
    $file_contents = str_replace($find,$replace,$file_contents);

    // also find and replace certs, why is this separate?
    // I had an issue with the cert path earlier and im running of 5 hours sleep
    $file_contents = str_replace('{{DEST}}',$cert_dest, $file_contents);


    // if an alias is set, then we uncomment out the ServerAlias line
    if(isset($aliases))
        $file_contents = str_replace('#ServerAlias','ServerAlias', $file_contents);

    // if we find a www in the alias, we uncomment out the Rewrite rules
    if(strpos($aliases, 'www'))
        $file_contents = str_replace('#Rewrite','Rewrite', $file_contents);

    // save teh files
    file_put_contents($file,$file_contents);

}


// we need to clean up the exploded array and make some key/value pairs
function map_args($args){
    $new_args = array();
    foreach($args as $string){
        $str_args = explode('=',$string);
        $key = $str_args[0];
        $val = $str_args[1];
        $val = str_replace(',',' ', $val);

        $new_args[$key]=rtrim($val);
    }
    return $new_args;
}


// kill the script if no file is provided as argument
if (!(isset($argv) && isset($argv[1]))){

    echo 'Error: no input file specified'."\n\n";
    die;
}





// Compose path from argument
$file = $argv[1];
$dest = $argv[2] ? $argv[2]: '';


if (!file_exists($file)) {

    // Error
    echo 'Error: input file does not exists'."\n";
    echo $file."\n\n";

    // File exists
} else {

    // Get file contents
    if (!($fp = fopen($file, 'r'))) {

      // Error
      echo 'Error: can`t open input file for read'."\n";
      echo $file."\n\n";

    // File opened for read
    } else {

        $l = 0;
        $first_dirname = '';
        $first_cert = '';
        // echo each line
        while (($line = fgets($fp, 4096)) !== false) {

            if( (substr($line, 0, 1) === '#') )
                continue;


            $site = explode(' ',$line);
            $args = map_args($site);

            create_vhost_files($args['url']);
            set_vhost_values($args);
            create_certs($args['url']);

            if($l == 0){
                $first_dirname = $args['dirname'];# ? $args['dirname'] : 'www/app' ;
                $first_cert = $args['url'];# ? $args['dirname'] : 'www/app' ;
            }
            $l++;
        }

    }
}



function get_dirname(){

    $file = strstr(__FILE__, 'www/');
    $file = ltrim($file,'www/');
    $path = explode('/', $file);
    return $path[0].'/app';
}
