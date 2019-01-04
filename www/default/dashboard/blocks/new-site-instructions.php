<?php
?>

<div class="alert alert-secondary">
  <h4>Adding a New Site</h4>
  Create or modify sites-custom.yml under the sites section to add a site, here's an example:
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