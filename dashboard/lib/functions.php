<?php


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


function fill_out_sites( $name ) {
	// examine( array_merge( [], get_specic_site_confgs( $name ) ) );
	// examine( array_merge( get_sites_structure(), get_specic_site_confgs( $name ) ) );

	return array_merge( get_sites_structure(), get_specic_site_confgs( $name ) );
}

function get_sites_structure () {
	$file = '/srv/config/custom-examples/sites.example.yml';
	if ( ! is_readable( $file ) ) {
		error_log($file);
		return [];
	}
	$data = yaml_parse_file( $file );
	return $data['placeholders'];
}


/**
 * @return string the server root (vagrant.loc)
 */
function get_server_name( $subdomain = null, $path = null ) {
	$subdomain = $subdomain ? trim( $subdomain, '.' ) . '.' : null;
	$path      = $path ? '/' . trim( $path, '/' ) : null;

	return '//' . $subdomain . $_SERVER['SERVER_NAME'] . $path . '/';
}

/**
 * retrieves the correct page view as specified by query
 *
 * @return  [type]  [return description]
 */
function view_tool() {
	$target = $_SERVER['QUERY_STRING'];
	return ( isset( $target ) && ! empty( $target ) && $target !== 'home' );
}

function get_iframe() {
	  $target = dirname( dirname( __FILE__ ) ) . '/' . $_SERVER['QUERY_STRING'] . '/index.php';
	if ( ! is_readable( $target ) ) {
		error_log( $target . 'not found' );
		return false;
	}
	$protocol = ( isset( $_SERVER['HTTPS'] ) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http' );
	$url      = $protocol . '://' . $_SERVER['HTTP_HOST'] . '/' . $_SERVER['QUERY_STRING'];
	return '<iframe src="' . $url . '" width="100%" height="100%" />';
}

/**
 * @return array a list of the installed tools
 */
function get_installed_utils_dirs() {
	$dirs  = scandir( TOOLS_ROOT_PATH );
	$dirs  = array_diff( $dirs, [ '.', '..', 'index.php', 'dashboard', '.DS_Store', 'api' ] );
	$arr = [];

	foreach ( $dirs as $dir ) {
		$name = basename( $dir );
		$arr[ $name ] = get_server_name('tools') . $name;
	}
	$arr['mailhog'] = ':8025';

	// $arr['site-config'] = '/site-config/';
	$arr['phpinfo'] = '/phpinfo/';

	return $arr;
}


/**
 * @return array all the installed tools as html links
 */
function get_installed_util_links( $class = null, $target = null ) {
	$dirs = get_installed_utils_dirs();

	$links = [];
	foreach ( $dirs as $name => $url ) {
		$links[] = '<a class="' . $class . '" href="' . $url . '" target="' . $target . '">' . ucfirst( $name ) . '</a>';
	}
	return $links;
}


/**
 * @return string HTML list markup of the installed tools
 */
function the_list_of_installed_utils() {
	$dirs    = get_installed_utils_dirs();
	$output  = '';
	$output .= '<ul class="navbar-nav">';

	foreach ( $dirs as $name => $dir ) {
		$output .= '<li class="nav-item">'
			. sprintf( '<a class="nav-link" href="' . ROOT_URL . '%s">%s</a>', $dir, $name )
			. '</li>';
	}

	$output .= '</ul>';

	echo $output;
}

function check_remote_file( $url ) {
	$ch = curl_init( $url );

	curl_setopt( $ch, CURLOPT_NOBODY, true );
	curl_exec( $ch );
	$retcode = curl_getinfo( $ch, CURLINFO_HTTP_CODE );
	curl_close( $ch );

	// $retcode >= 400 -> not found, $retcode = 200, found.
	return $retcode < 300 && $retcode >= 200 ? true : false;
}



/**
 * @param  array $args a list of arguments for a site from the YAML file
 * @return string misc
 */
function get_site_image( $args ) {
	if ( empty( $args['image'] ) || ! isset( $args['image'] ) ) {
		return null;
	}

	if ( filter_var( $args['image'], FILTER_VALIDATE_URL ) ) {
		return $url = $args['image'];
	}

	if ( is_readable( $args['image'] ) ) {
		$url = 'https://' . reset( $args['hosts'] ) . '/' . $args['img_url'];
	}

	return check_remote_file( $url ) ? $url : null;
}


function get_button_html( $url = null, $text = null, $color = 'primary', $icon = null ) {
	$output  = '';
	$output .= '<a href="https://' . $url . '" ';
	$output .= 'class="btn btn-' . $color . '" target="_blank">';
	if ( $icon ) {
		$output .= '<i class="fas fa-' . $icon . '"></i>' . $text;
	}
	$output .= '</a>';

	return $output;
}

function the_button_html( $url = null, $text = null, $color = 'primary', $icon = null ) {
	echo get_button_html( $url, $text, $color, $icon );
}

/**
 * @param  string $url URL to the site
 * @return void
 */
function site_button( $url ) {
	return get_button_html( $url, 'Visit Site', 'success', 'globe' );
}

/**
 * @param  array $args a list of arguments for a site from the YAML file
 * @return string html markup
 */
function wp_admin_button( $args ) {
	$site_root = isset( $args['site_root'] ) ? $args['site_root'] : null;
	$directory = isset( $args['directory'] ) ? $args['directory'] : null;
	$root      = '/srv/www' . DIRECTORY_SEPARATOR . $directory . DIRECTORY_SEPARATOR . $site_root;
	if ( is_readable( $root . DIRECTORY_SEPARATOR . 'wp-config.php' ) ) {
		$url = $args['host'] . '/wp-admin';
		return get_button_html( $url, 'Login', 'info', 'sign-in-alt' );
	}
	return null;
}

/**
 * @param  string $img the URL to an image to display for the site
 * @param  string $style extra styles for the image
 * @param  string $name Name of the site
 * @param  string $descroption Short description of site
 * @param  string $url the URL to the site
 * @return void
 */
function site_media_object( $args = [] ) {
	extract( $args );
	?>
	<li class="media" style="margin-bottom: 2rem;">
		<img src="<?php echo $img_url; ?>" class="mr-3" style="<?php echo $style; ?>" >
		<div class="media-body">
			<h5 class="mt-0 mb-1"><?php echo $name; ?></h5>
			<div class="media-description">
			<?php echo $description ? $description : null; ?>
			</div>
			<div class="media-footer">
				<?php echo site_button( $url ); ?>
				<?php echo $wp_admin_btn; ?>
			</div>
		</div>
	</li>

	<?php
}


/**
 * @param  string $img the URL to an image to display for the site
 * @param  string $style extra styles for the image
 * @param  string $name Name of the site
 * @param  string $descroption Short description of site
 * @param  string $url the URL to the site
 * @return void
 */
function site_card( $args = [] ) {
	extract( $args );
	?>
	<div class="card" style="max-width: 18rem;">
		<div class="card-img-top" style="<?php echo $style; ?>" ></div>
		<div class="card-body">
			<h5 class="card-title"><?php echo $name; ?></h5>
			<?php if ( $description ) : ?>
			<p class="card-text"><?php echo $description; ?></p>
			<?php endif; ?>
			<?php echo $site_btn; ?>
			<?php echo $wp_admin_btn; ?>
		</div>
	</div>

	<?php
}

function get_site_names() {
	 return array_keys( get_custom_sites() );
}

/**
 * @return array of site configs
 */
function get_custom_sites( $name = null ) {
	$data = [];
	$file = '/vagrant/custom/sites.yml';
	if ( ! is_readable( $file ) ) {
		return [];
	}

	$data = yaml_parse_file( $file );

	if ( empty( $data['sites'] ) || ! isset( $data['sites'] ) ) {
		return [];
	}

	$data = $name && isset( $data['sites'][ $name ] ) ? $data['sites'][ $name ] : $data['sites'];

	return $data;
}


/**
 * @param  string $type Display site list as cards or media objects.
 * @return void
 */
function the_custom_sites( $type = null ) {
	$sites = get_custom_sites();

	echo $type === 'media' ? '<ul class="list-unstyled">'
		: '<div class="card-deck">';
	foreach ( $sites as $name => $settings ) {
		// if the host url is not set move along
		if ( ! isset( $settings['host'] ) ) {
			continue;
		}

		$args = [
			'name'         => $name,
			'site_btn'     => isset( $settings['url'] ) ? site_button( $settings['url'] ) : null,
			'wp_admin_btn' => wp_admin_button( $settings ),
			'img_url'      => get_site_image( $settings ) ? get_site_image( $settings ) : '/dist/img/website-default.png',
			'url'          => $settings['host'],
			'description'  => isset( $settings['description'] ) ? $settings['description'] : null,
		];

		if ( $type == 'media' ) {
			$args['style'] = 'height: 75px; width: 75px;';
			site_media_object( $args );
		} else {
			$args['style'] = 'height: 180px; width: auto; background-image:url(' . $img_url . ');
            background-repeat:no-repeat; background-size: cover;';
			site_card( $args );
		}
	}
	echo $type == 'media' ? '</ul>' : '</div>';
}


function get_specic_site_confgs( $name ) {
	return get_custom_sites( $name );
	return ! empty( $site ) ? $site : null;
}
