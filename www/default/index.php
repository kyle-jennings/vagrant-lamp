<?php

$root = dirname(dirname(__FILE__));
$folders = scandir($root);
$remove = array('.', '..', '.DS_Store');

$folders = array_diff($folders, $remove);
