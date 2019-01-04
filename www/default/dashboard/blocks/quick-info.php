<?php
$specs = [
    'Public IP' => $_SERVER['SERVER_ADDR'],
    'Main Address' => $_SERVER['SERVER_NAME'],
    'Server' => $_SERVER['SERVER_SOFTWARE'],
    'Document Root' => str_replace('/default', '', $_SERVER['DOCUMENT_ROOT']),
    'HTTP Port' => $_SERVER['SERVER_PORT'],
];
?>
<h3>Quick Info</h3>
<ul class="list-group">
<?php
foreach ($specs as $label => $spec) {
    $str = $label . ': ' . $spec;
    echo '<li class="list-group-item">' . $str . '</li>';
}
?>
</ul>