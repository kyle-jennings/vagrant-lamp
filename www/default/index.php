<?php

require_once '_config.php';

require_once ROOT_PATH . '/lib/_init.php';

if ( is_readable( 'custom-dashboard.php' ) ) {
	require_once './custom-dashboard.php';
} else {
	require_once './dashboard/index.php';
}
