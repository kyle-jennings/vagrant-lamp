<?php



// copy default http and ssl conf files and rename them
function create_vhost_files($url){

    global $dest;

    $file = $dest.''.$url.'.conf';
    $templates = array('default-http.conf');

    // lets just assume we have certs for everything (as we should)

    $templates[] = 'default-ssl.conf';

    $file_contents = '';

    // get the templates to create the new file
    foreach($templates as $template)
        $file_contents .= file_get_contents('/srv/config/vhosts/'.$template);

    // remove previous vhosts
    if(file_exists($file))
        unlink($file);

    // create new vhosts
    $new_file = fopen($dest.''.$url.'.conf', 'x+');

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
    $find = array('{{URL}}','{{ALIASES}}','{{DIRNAME}}');
    $replace = array($url, $aliases, $dirname);


    // if a cert is set, then use that value. otherwise use the url
    $replace[] = $url;

    // set the file names
    $file = $dest.''.$url.'.conf';

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





// unused function - to be deleted
function get_dirname(){

    $file = strstr(__FILE__, 'www/');
    $file = ltrim($file,'www/');
    $path = explode('/', $file);
    return $path[0].'/app';
}



// Compose path from argument
$file = $argv[1];
$dest = $argv[2] ? $argv[2]: '';
$dirname = $argv[3] ? $argv[3]: '';

// first we need to make sure we have a vhost-ini file. if we dont then we bail
if (!file_exists($file)) {

    // Error
    echo 'Error: input file does not exists'."\n";
    echo $file."\n\n";

// if the file exists, lets do some stuff
} else {

    // try to open file for reading

    // if we cant then fail
    if (!($fp = fopen($file, 'r'))) {

      // Error
      echo 'Error: can`t open input file for read'."\n";
      echo $file."\n\n";

    // if we can, then we need to set things up, and then get each URL
    } else {

        $l = 0;
        $first_dirname = '';
        $first_cert = '';

        // the cert urls will be used to list all the URLs for the CNs
        $cert_urls = '';


        // for each line in the vhost file...
        while (($line = fgets($fp, 4096)) !== false) {

            // if the line is commented out, lets ignore it and continue
            if( (substr($line, 0, 1) === '#') )
                continue;

            // explode and map the line to get the atts as an array
            $site = explode(' ',$line);
            $args = map_args($site);

            // we can use the first entry's URL and dirname for the rest of the vhosts if we want to be lazy
            if($l == 0){
                $first_dirname =  $dirname.'/'.$args['dirname'];# ? $args['dirname'] : 'www/app' ;
            }

            // add the CN to the cer urls list
            $cert_urls .= '/CN='.$args['url'];

            // ok no, create teh vhost file for the given URL
            create_vhost_files($args['url']);

            // now set the vhost values (its basically a template)
            set_vhost_values($args);


            $l++;
        }

    }
}
