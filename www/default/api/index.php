<?php

require_once dirname( dirname( __FILE__ ) ) . '/_config.php';
require_once ROOT_PATH . '/lib/functions.php';

header( 'Access-Control-Allow-Origin: *' );
header( 'Access-Control-Allow-Methods: POST, GET' );
header( 'Access-Control-Allow-Credentials: true' );
header( 'Access-Control-Max-Age: 1000' );
header( 'Content-type:application/json' );



function vvva_ajax_site_list ( $data = null ) {

	$response = json_encode(
		[
			'status' => 'ok',
			'data'   => get_site_names(),
			'action' => 'site_config',
		]
	);
	echo $response;
	exit;
}

/**
 * get the selected site settings
 *
 */
function vvva_ajax_site_config ( $name = null ) {
	$response = json_encode(
		[
			'status' => 'ok',
			'data'   => get_specic_site_confgs( $name ),
			'action' => 'site_config',
		]
	);
	echo $response;
	exit;
}

/**
 * Toggle the xdebug stuff
 *
 */
function vvva_ajax_xdebug( $data = 'off' ) {

	if ( $data === 'on' ) {
		shell_exec( '/srv/config/scripts/xdebug_off' );
	} else {
		shell_exec( '/srv/config/scripts/xdebug_on' );
	}

	$xdebug_on = in_array( 'xdebug', get_loaded_extensions() );
	$xdebug_on = $xdebug_on ? 'on' : 'off';
	error_log( $xdebug_on );
	$response = json_encode(
		[
			'status' => $xdebug_on,
			'action' => 'xdebug',
		]
	);
	echo $response;
	exit;
}

if ( isset( $_GET, $_GET['action'] ) ) {
	$action = str_replace( '-', '_', $_GET['action'] );

	$data   = isset( $_GET['data'] ) ? json_decode( $_GET['data'] ) : null;

	if ( function_exists( 'vvva_ajax_' . $action ) ) {
		call_user_func( 'vvva_ajax_' . $action, $data );
	}
}
