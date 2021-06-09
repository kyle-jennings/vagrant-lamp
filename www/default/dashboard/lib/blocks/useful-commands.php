<?php

?>
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
