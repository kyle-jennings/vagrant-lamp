import XHR from './xhr';

const $ajax_links = document.querySelectorAll('.js--ajax');
const AJAX_URL = '/api'


window.vvva_ajax_xdebug = function($elm, response) {
  const status = response.status;
  const $parent = $elm.closest('li');
  const $badge = $parent.querySelector('.badge');
  $elm.setAttribute('data-data', response.status);
  
  if (status === 'on') {
    $badge.classList.remove('badge-success');
    $badge.classList.add('badge-secondary');
    $badge.innerText = 'off';
  } else {
    $badge.classList.remove('badge-secondary');
    $badge.classList.add('badge-success');
    $badge.innerText = 'on';
  }
}

$ajax_links.forEach(($elm,i) => {
  $elm.addEventListener(
    'click',
    function (e) {
      e.preventDefault(); 
      
      const {action, data} = $elm.dataset
      
      XHR(AJAX_URL, {action, data}, 'json')
      .then((res) => {
        const response = res.target.response; 
        window['vvva_ajax_' + response.action]($elm, response);
      })
      .catch((err) => {
        console.log('error', err);
      });
    }
    );
});
