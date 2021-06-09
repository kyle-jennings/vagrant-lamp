<!doctype html>
<html lang="en">
  <head>
	<!-- Required meta tags -->
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

	<!-- Bootstrap CSS -->
	<link rel="stylesheet" href="/dashboard/dist/css/site.css">

	<title>Vagrant LAMP</title>
  </head>
  <body>

	<div class="container">
		<?php require DASHBOARD_ROOT_PATH . '/lib/blocks/navbar.php'; ?>
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

        Remember, in YAML whitespace matters, and you need to reprovision on changes, so run
        <code>vagrant reload --provision</code>
      </div>

		</div>

		<div class="col-md-3">
			<?php require DASHBOARD_ROOT_PATH . '/lib/blocks/quick-info.php'; ?>
			<?php require DASHBOARD_ROOT_PATH . '/lib/blocks/bundled-tools.php'; ?>
			<?php require DASHBOARD_ROOT_PATH . '/lib/blocks/useful-commands.php'; ?>
		</div>


	  </div>
	</div>


	<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js" integrity="sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut" crossorigin="anonymous"></script>
	<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js" integrity="sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k" crossorigin="anonymous"></script>
  </body>
</html>
