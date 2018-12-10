<?php


/**
 * A helper function which displays the contents of a thing and exits the script
 * @param  array|object  $object an array or object to be examined
 * @param  string        $type   flag to use var_dump instead of print_r
 * @param  string        $force  forces examining of object even if its empty
 * @return void          nah
 */
function examine($object = [], $type = 'print_r', $force = null)
{
    
    if (empty($object) && !$force) {
        return;
    }

    $type == 'var_dump' ? var_dump($object) : print_r($object);
    echo "\n";
    die;
}


// replace placeholder values in newly created vhost files with appropriate values
function set_vhost_values($args, $contents = null)
{

    // expecting $url, $aliases, $dirname, $cert, $common_name
    extract($args);
    // make sure we have some fail safes
    $aliases = isset($aliases) ? $aliases : null;
    // set the find and replace
    $find = array('{{URL}}', '{{ALIASES}}', '{{DIRNAME}}');
    $replace = array($url, $aliases, $dirname);
    
    // do the find and replace
    $contents = str_replace($find, $replace, $contents);

    // if an alias is set, then we uncomment out the ServerAlias line
    if ($aliases) {
        $contents = str_replace('#ServerAlias', 'ServerAlias', $contents);
    }

    // if we find a www in the alias, we uncomment out the Rewrite rules
    if (0 === strpos($aliases, 'www.' . $url)) {
        $contents = str_replace('#Rewrite', 'Rewrite', $contents);
    }

    return $contents;
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


function init($file, $dest)
{

    $args = get_vars($file);
    $file = $dest . $args['url'] . '.conf';
    $contents = file_get_contents('/srv/config/vhosts/default.conf');
    $contents = set_vhost_values($args, $contents);
    if (!is_readable($dest)) {
        mkdir($dest, true);
    }
    file_put_contents($file, $contents);
}


if (!isset($argv[1])) {
    exit('dir not provided');
}

$file = $argv[1] . '/vhosts-init';
$dest = $argv[1] . '/vhosts/';


// first we need to make sure we have a vhost-ini file. if we dont then we bail
if (!isset($file) || !is_readable($file)) {
    exit('Error: input file does not exist or cannot be opened'."\n");
}

init($file, $dest);
