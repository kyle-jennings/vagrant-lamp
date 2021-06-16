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

	<div class="container">
	  <div class="row">

		<div class="col-md-9">

      <h2>Your custom sites</h2>

      <?php the_custom_sites('media'); ?>
      
      <div class="alert alert-secondary">
        <h4>Adding a New Site</h4>

        Create or modify sites.yml under the sites section to add a site, here's an example:
        <pre>
          example:
            hosts:
              - example.loc
              - www.example.loc
            directory: example
            site_root: httpdocs
            env:
              DB_NAME: example
              DB_USER: root
              DB_PASSWORD: root
              DB_HOST: localhost
              TABLE_PREFIX: wp_
        </pre>
        So if a site exists in www/example/httpdocs, it will be accessible at http://example.loc

				note - the "env" section is optional and is used to set environment variables such as DB_HOST

        Remember, in YAML whitespace matters, and you need to reprovision on changes, so run
        <code>vagrant reload --provision</code>
      </div>

			<div>
				<h3>Useful commands</h3>
				<ul class="list-group">
				<?php
				$commands = [
						'vagrant ssh',
						'vagrant up',
						'vagrant destroy',
						'vagrant halt',
						'vagrant reload',
						'vagrant reload --provision'
				];
				foreach ($commands as $command) {
					echo '<li class="list-group-item">' . $command . '</li>';
				}
				?>
				</ul>
			</div>
		</div>

		<div class="col-md-3">
			<?php require ROOT_PATH . '/lib/blocks/quick-info.php'; ?>
			<?php require ROOT_PATH . '/lib/blocks/bundled-tools.php'; ?>

			<div>
				<h3>Toggle XDebug</h3>
				<ul class="list-group">
					<li class="list-group-item d-flex justify-content-between align-items-center">
						<?php
							$xdebug_on    = in_array( 'xdebug', get_loaded_extensions() );
							$xdebug_class = $xdebug_on ? 'badge-success' : 'badge-secondary';
							$xdebug_label = $xdebug_on ? 'on' : 'off';
						?>
						<a href="/?api=xdebug&data=activate" 
						class="js--ajax"
							data-action="xdebug"
							data-data="<?= $xdebug_label; ?>"
						>
							Xdebug
						</a>
						<span class="badge badge-pill <?= $xdebug_class; ?>"><?= $xdebug_label; ?></span>
					</li>
				</ul>
			</div>

		</div>


	  </div>
	</div>
		<script src="<?= ROOT_URL; ?>/dist/js/vagrant-lamp.min.js" crossorigin="anonymous"></script>
  </body>
</html>
