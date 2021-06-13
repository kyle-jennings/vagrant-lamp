<?php

require 'examine.php';

class VhostBuilder {
	private static $pwd            = null;
	private static $dir            = null;
	private static $custom_dir     = null;
	private static $config_file    = 'sites.yml';
	private static $config_path    = null;
	private static $vhost_dir      = '/etc/apache2/sites-enabled';
	private static $vhost_template = 'vhost-template.conf';
	private static $template_file  = null;
	public function __construct() {

		self::$pwd           = dirname( __FILE__ );
		self::$dir           = dirname( dirname( dirname( __FILE__ ) ) );
		self::$custom_dir    = self::$dir . '/custom/';
		self::$config_path   = self::$custom_dir . self::$config_file;
		self::$template_file = dirname( __FILE__ ) . '/' . self::$vhost_template;

		if ( ! is_readable( self::$config_path ) ) {
			echo self::$config_path . ' does not exist';
			return;
		}

		if ( ! is_readable( self::$vhost_dir ) ) {
			echo self::$vhost_dir . ' does not exist';
			return;
		}

		if ( ! is_readable( self::$template_file ) ) {
			echo self::$template_file . ' does not exist.';
			return;
		}

		echo 'Building vhost files.';
		self::init();
	}

	private function init() {
		$yaml  = yaml_parse_file( self::$config_path );
		$sites = $yaml['sites'];

		foreach ( $sites as $key => $site ) {
			$args = [
				'sitename' => $key,
				'host'     => $site['host'],
				'dirname'  => $site['directory'],
				'vhost'    => self::$vhost_dir . $site['host'],
				'root'     => @$site['site_root'] ?: '',
				'aliases'  => implode( ' ', $site['aliases'] ) ?: null,
				'env'      => @$site['env'] ?: null,
			];

			if ( ! isset( $site['host'], $site['directory'] ) ) {
				error_log( 'Missing hostname or directory for ' . $key );
				continue;
			}

			if ( $args['env'] ) {
				$env         = array_map(
					function ( $val, $key ) {
						return "\tSetEnv ${key} ${val} \n";
					},
					$args['env'],
					array_keys( $args['env'] )
				);
				$args['env'] = "\n" . implode( '', $env );
			}

			self::replace_in_template( $args );
		}
	}

	private static function replace_in_template( $args ) {
		$filename = self::$vhost_dir . '/' . $args['sitename'] . '.conf';

		$text = file_get_contents( self::$template_file );
		$text = str_replace( '{{HOST}}', $args['host'], $text );
		$text = str_replace( '{{DIRNAME}}', $args['dirname'], $text );
		$text = str_replace( '{{SITENAME}}', $args['sitename'], $text );

		if ( isset( $args['aliases'] ) ) {
			$text = str_replace( '{{ALIASES}}', $args['aliases'], $text );
			$text = str_replace( '#ServerAlias', 'ServerAlias', $text );
		}

		if ( strpos( $args['aliases'], 'www' . $args['host'] ) ) {
			$text = str_replace( '#Rewrite', 'Rewrite', $text );
		}

		if ( isset( $args['env'] ) ) {
			$text = str_replace( '#{{ENV}}', $args['env'], $text );
		}

		try {
			$results = file_put_contents( $filename, $text );
            if ( $results !== false ) {
                error_log( 'updated vhost for ' . $args['sitename'] );
            }
		} catch ( Exception $err ) {
			error_log( $err->getMessage() );
		}
	}

	private static function log_issues() {

	}
}
new VhostBuilder();
