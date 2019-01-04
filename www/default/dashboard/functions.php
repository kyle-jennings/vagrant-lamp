<?php

require(__DIR__ . '/yaml.php');

/**
 * @param  array|object $thing an array or object to be instpected
 * @return void
 */
function examine($thing)
{
    if (empty($thing)) {
        return;
    }

    echo '<pre>';
    print_r($thing);
    exit;
}

/**
 * @return Root dir of the dashboard
 */
function get_root()
{
    return dirname(dirname(__FILE__));
}

/**
 * @return string the server root (vagrant.loc)
 */
function get_server_name()
{
    return '//' . $_SERVER['SERVER_NAME'];
}

/**
 * @return array a list of the installed tools
 */
function get_installed_utils_dirs()
{
    $root = get_root();
    $dirs = scandir($root);
    $dirs = array_diff($dirs, ['.', '..', 'index.php', 'dashboard', '.DS_Store']);
    $keyed = [];
    
    foreach ($dirs as $dir) {
        $keyed[$dir] = '/' . $dir;
    }
    $keyed['mailhog'] = ':8025';
    return $keyed;
}


/**
 * @return array all the installed tools as html links
 */
function get_installed_util_links($class = null)
{
    $dirs = get_installed_utils_dirs();

    $links = [];
    $link_str = '<a class="' . $class . '" href="' . get_server_name() . '%s">%s</a>';
    foreach ($dirs as $name => $dir) {
        $links[] = sprintf($link_str, $dir, ucfirst($name));
    }
    return $links;
}


/**
 * @return string HTML list markup of the installed tools
 */
function the_list_of_installed_utils()
{

    $dirs = get_installed_utils_dirs();
    $output = '';
    $output .= '<ul class="navbar-nav">';

    foreach ($dirs as $name => $dir) {
        $output .= '<li class="nav-item">' . sprintf('<a class="nav-link" href="' . get_server_name() . '%s">%s</a>', $dir, $name) . '</li>';
    }

    $output .= '</ul>';

    echo $output;
}


/**
 * @return array of site configs
 */
function get_custom_sites()
{
    $data = [];
    $file = '/vagrant/sites-custom.yml';
    if (!is_readable($file)) {
        return [];
    }
    
    $yaml = new Alchemy\Component\Yaml\Yaml();

    $data = $yaml->load($file);
    
    if (empty($data['sites']) || !isset($data['sites'])) {
        return [];
    }

    $data = $data['sites'];

    return $data;
}

/**
 * @param  array $args a list of arguments for a site from the YAML file
 * @return string misc
 */
function get_site_image($args)
{

    if (empty($args['image']) || !isset($args['image'])) {
        return '/dashboard/dist/img/website-default.png';
    }

    if (filter_var($args['image'], FILTER_VALIDATE_URL)) {
        return $args['image'];
    }

    if (is_readable($args['image'])) {
        return 'https://' . reset($args['hosts']) . '/' . $args['img_url'];
    }
    
    return '/dashboard/dist/img/website-default.png';
}


function get_button_html($url = null, $text = null, $color = 'primary', $icon = null)
{
    $output = '';
    $output .= '<a href="https://' . $url . '" ';
    $output .= 'class="btn btn-' . $color . '" target="_blank">';
    if ($icon) {
        $output .= '<i class="fas fa-' . $icon . '"></i>' . $text;
    }
    $output .= '</a>';

    return $output;
}

function the_button_html($url = null, $text = null, $color = 'primary', $icon = null)
{
    echo get_button_html($url, $text, $color, $icon);
}

/**
 * @param  string $url URL to the site
 * @return void
 */
function site_button($url)
{
    return get_button_html($url, 'Visit Site', 'success', 'globe');
}

/**
 * @param  array $args a list of arguments for a site from the YAML file
 * @return string html markup
 */
function wp_admin_button($args)
{
    $root = '/srv/www' . DIRECTORY_SEPARATOR . $args['directory'] . DIRECTORY_SEPARATOR . $args['site_root'];
    if (is_readable($root  . DIRECTORY_SEPARATOR . 'wp-config.php')) {
        $url = reset($args['hosts']) . '/wp-admin';
        return get_button_html($url, 'Login', 'info', 'sign-in-alt');
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
function site_media_object($args = [])
{
    extract($args);
    ?>
    <li class="media" style="margin-bottom: 2rem;">
        <img src="<?php echo $img_url; ?>" class="mr-3" style="<?php echo $style ?>" >
        <div class="media-body">
            <h5 class="mt-0 mb-1"><?php echo $name ?></h5>
            <div class="media-description">
            <?php echo $description ? $description : null; ?>
            </div>
            <div class="media-footer">
                <?php echo site_button($url); ?>
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
function site_card($args = [])
{
    extract($args);
    ?>
    <div class="card" style="max-width: 18rem;">
        <div class="card-img-top" style="<?php echo $style ?>" ></div>
        <div class="card-body">
            <h5 class="card-title"><?php echo $name ?></h5>
            <?php if ($description) : ?>
            <p class="card-text"><?php echo $description; ?></p>
            <?php endif; ?>
            <?php echo $site_btn; ?>
            <?php echo $wp_admin_btn; ?>
        </div>
    </div>

    <?php
}


/**
 * @param  string $type Display site list as cards or media objects.
 * @return void
 */
function the_custom_sites($type = 'null')
{
    $sites = get_custom_sites();

    echo $type == 'media' ? '<ul class="list-unstyled">'
        : '<div class="card-deck">';
    foreach ($sites as $name => $settings) {
        // if the host url is not set move along
        if (count($settings['hosts']) < 1) {
            continue;
        }

        $args = [
            'name' => $name,
            'site_btn' => site_button($settings['url']),
            'wp_admin_btn' => wp_admin_button($settings),
            'img_url' => get_site_image($settings),
            'url' => reset($settings['hosts']),
            'description' => $settings['description'] ? $settings['description'] : null,
        ];

        if ($type == 'media') {
            $args['style'] = 'height: 50px; width: 50px;';
            site_media_object($args);
        } else {
            $args['style'] = 'height: 180px; width: auto; background-image:url(' . $img_url . '); 
            background-repeat:no-repeat; background-size: cover;';
            site_card($args);
        }
    }
    echo $type == 'media' ? '</ul>' : '</div>';
}
