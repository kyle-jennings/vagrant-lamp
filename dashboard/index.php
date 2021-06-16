<?php
require_once '_config.php';

require_once ROOT_PATH . '/lib/_init.php';

?>

<!doctype html>
<html lang="en">
  <head>
	<!-- Required meta tags -->
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

	<!-- Bootstrap CSS -->
	<link rel="stylesheet" href="<?= ROOT_URL; ?>/dist/css/vagrant-lamp.min.css">

	<title>Vagrant LAMP</title>
  </head>
  <body>

		<nav class="navbar navbar-expand-lg navbar-light bg-light">
			<div class="container">
					<a class="navbar-brand" href="/">Vagrant LAMP</a>
					<button class="navbar-toggler" type="button" data-toggle="collapse"
					data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false"
					aria-label="Toggle navigation">
							<span class="navbar-toggler-icon"></span>
					</button>
					<div class="collapse navbar-collapse" id="navbarNav">
							<ul class="navbar-nav">
					<?php
					$links = get_installed_util_links( 'nav-link', 'iframe-content' );
					foreach ( $links as $link ) {
							echo '<li class="nav-item">' . $link . '</li>';
					}
					?>
							</ul>
					</div>
			</div>
		</nav>


		<iframe name="iframe-content" src='/dashboard/dashboard.php' style="width: 100%; height: 100vh; border: none;"></iframe>

		<script src="<?= ROOT_URL; ?>/dist/js/vagrant-lamp.min.js" crossorigin="anonymous"></script>
  </body>
</html>
