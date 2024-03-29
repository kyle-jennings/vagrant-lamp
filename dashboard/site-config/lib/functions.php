<?php
require __DIR__ . '/yaml.php';


if ( ! function_exists( 'examine' ) ) {
	/**
	 * Displays a variable (generally an array or object) via print_r or var_dump
	 * this also ends execution of the rest of hte host script.
	 *
	 * @param  array|object $object thing to examine.
	 * @param  string       $level  whether or not we use var_dump over print_r.
	 * @param  string       $output do we kill the script or display it on the page.
	 * @return boolean | string  Either return false, or return the string to echo.
	 */
	function examine( $object = null, $level = null, $display = 'die' ) {
		if ( $level !== 'var_dump' && ( $object === null || empty( $object ) ) ) {
			return false;
		}
		ob_start();
		echo '<pre style="white-space: pre">';
		if ( $level === 'var_dump' ) {
			var_dump( $object ); // phpcs:ignore
		} else {
			print_r( $object ); // phpcs:ignore
		}
		echo '</pre>';
		$output = ob_get_clean();

		if ( $display === 'return' ) {
			return $output;
		}

		echo $output;
		if ( $display === 'die' ) {
			die;
		}

	}
}

function get_site_names() {
    return array_keys( get_custom_sites() );
}

/**
 * @return array of site configs
 */
function get_custom_sites() {
	$data = [];
	$file = '/vagrant/custom/sites.yml';
	if ( ! is_readable( $file ) ) {
		return [];
	}

	$yaml = new Alchemy\Component\Yaml\Yaml();

	$data = $yaml->load( $file );

	if ( empty( $data['sites'] ) || ! isset( $data['sites'] ) ) {
		return [];
	}

	$data = $data['sites'];

	return $data;
}
