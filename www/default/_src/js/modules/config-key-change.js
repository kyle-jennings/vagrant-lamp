import XHR from './xhr';
const AJAX_URL = '/api'

window.vvva_ajax_site_config = function ( $elm, response ) {
  
}

const $key_select = document.querySelector('.js--key-select');
if ($key_select) {
  $key_select.addEventListener(
    'change',
    function (e) {
      e.preventDefault();
      const $elm     = e.target;
      const sitename = $elm.value;
      const action   = $elm.dataset.action;

      XHR(AJAX_URL, {action, sitename}, 'json')
      .then((res) => {
          const response = res.target.response;

          const action = response.action.replace('/-/g','_');
          window['vvva_ajax_' + action]($elm, response);
      })
      .catch((err) => {
        console.log('error', err);
      });
    }
  );
  
}
