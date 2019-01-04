<?php

?>
<h3>Bundled tools</h3>
<ul class="list-group">
<?php
$links = get_installed_util_links();
foreach ($links as $link) {
    echo '<li class="list-group-item">' . $link . '</li>';
}
?>
</ul>
