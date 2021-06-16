<?php


define( 'ROOT_PATH', dirname( __FILE__ ) );
define( 'ROOT_URL', 'http://' . $_SERVER['SERVER_NAME'] );

define( 'SRV_ROOT', dirname( dirname( ROOT_PATH ) ) );

define( 'DIST_ROOT_PATH', ROOT_PATH . '/dist' );
define( 'DIST_ROOT_URL', ROOT_URL . '/dist' );

define( 'LIB_ROOT_PATH', ROOT_PATH . '/lib' );
define( 'DASHBOARD_ROOT_PATH', ROOT_PATH . '/dashboard' );
define( 'SITE_CONFIG_ROOT_PATH', ROOT_PATH . '/site-config' );

define( 'TOOLS_ROOT_PATH', ROOT_PATH . '-tools' );
define( 'TOOLS_ROOT_URL', 'http://tools.' . $_SERVER['SERVER_NAME'] );
