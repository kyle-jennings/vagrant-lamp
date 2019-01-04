<?php

if (is_readable('custom-dashboard.php')) {
    require_once('./custom-dashboard.php');
} else {
    require_once('./dashboard/index.php');
}
