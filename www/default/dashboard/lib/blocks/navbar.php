<?php
?>
<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <a class="navbar-brand" href="#">Vagrant LAMP</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" 
    data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" 
    aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
    <?php
    $links = get_installed_util_links('nav-link');
    foreach ($links as $link) {
        echo '<li class="nav-item">' . $link . '</li>';
    }
    ?>
        </ul>
    </div>
</nav>
