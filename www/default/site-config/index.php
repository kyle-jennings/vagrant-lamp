<?php

require_once dirname( dirname( __FILE__ ) ) . '/_config.php';
require_once ROOT_PATH . '/lib/functions.php';

?>

<!doctype html>
<html lang="en">
  <head>
	<!-- Required meta tags -->
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

	<!-- Bootstrap CSS -->
	<link rel="stylesheet" href="<?= ROOT_URL; ?>/dist/css/vagrant-lamp.min.css">

	<title>Site config</title>
  </head>
  <body>

	<div class="container">
		<?php require ROOT_PATH . '/lib/blocks/navbar.php'; ?>
	</div>


    <div class="container">
      <div class="jumbotron">
        <h1 class="display-4">Hello!</h1>
        <p class="lead">VagrantLAMP is a local web development environment powered
        by Vagrant and Virtual Machines.</p>
      </div>
    </div>

    <div class="container" ><div id="js--view-key-config"></div></div> <!-- /container -->
		<script src="<?= ROOT_URL; ?>/dist/js/vagrant-lamp.min.js" crossorigin="anonymous"></script>
		<script src="<?= ROOT_URL; ?>/dist/js/vagrant-lamp--configs.min.js" crossorigin="anonymous"></script>
  </body>
</html>
