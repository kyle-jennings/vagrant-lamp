<?php
    require_once('./dashboard/functions.php');
?>
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

        <?php include './dashboard/blocks/navbar.php' ?>

    </div>

    <div class="container">

      <div class="jumbotron">
          <h1 class="display-4">Hello, EPI!</h1>
          <p class="lead">VagrantLAMP is a local web development environment powered 
          by Vagrant and Virtual Machines.</p>
      </div>
    </div>

    <div class="container">
      <div class="row">
        
        <div class="col-md-9">

        <?php include './dashboard/blocks/custom-sites-list.php' ?>
        <?php include './dashboard/blocks/new-site-instructions.php' ?>

        </div>

        <div class="col-md-3">
            <?php include './dashboard/blocks/quick-info.php' ?>
            <?php include './dashboard/blocks/bundled-tools.php' ?>
            <?php include './dashboard/blocks/useful-commands.php' ?>
        </div>


      </div>
    </div>


    <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js" integrity="sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js" integrity="sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k" crossorigin="anonymous"></script>
  </body>
</html>