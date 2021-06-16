import XHR from './modules/xhr';
import Vue from 'vue/dist/vue.js';
import Field from  './vue-components/Field';
import Repeatable from  './vue-components/Repeatable';
import KeyValue from  './vue-components/KeyValue';
import TextArea from  './vue-components/TextArea';

Vue.filter('prettyStrings', function (value) {
  if (!value) return ''
  value = value.toString();
  value = value.replace(/_/g, ' ');
  return value.charAt(0).toUpperCase() + value.slice(1);
});

new Vue({
  el: '#js--view-key-config',
  components: {
    Field,
    Repeatable,
    KeyValue,
    TextArea,
  },
  data: {
    currentSite: null,
    currentSiteConfigs: null,
    sites: [],
    AJAX_URL: '/api',
    busy: false,
  },
  watch: {
    currentSite: function(newVal, oldVal) {
      if (newVal === 'new') return;
      const data   = this.currentSite;
      const action = 'site-config';

      XHR(this.AJAX_URL, {action, data}, 'json')
      .then((res) => {
        this.currentSiteConfigs = null;
        setTimeout(() => {
          const response          = res.target.response;
          this.currentSiteConfigs = response.data;
        }, 1000);

      })
      .catch((err) => {
        console.log('error', err);
      });
    },
    sites: function () {
      this.currentSiteConfigs = null;
      this.currentSite = this.sites[0];
    },
  },
  computed: {},
  methods: {
    addSite: function () {
      this.currentSite = 'new';
      const data   = null
      const action = 'new_site_form';

      XHR(this.AJAX_URL, {action, data}, 'json')
      .then((res) => {
        this.currentSiteConfigs = null;
        setTimeout(() => {
          const response          = res.target.response;
          this.currentSiteConfigs = response.data;
        }, 1000);

      })
      .catch((err) => {
        console.log('error', err);
      });
    },
    rebuildVhosts: function (data) {
      const obj = {
        action: 'rebuild-vhosts',
        data: null,
      }
      this.busy = true;
      XHR(this.AJAX_URL, obj, 'json')
        .then((res) => {
          const { response } = res.target;
          console.log(response);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          this.busy = false;
        });
    },
    setType: function (name, value) {
      if ( Array.isArray(value) || typeof value === 'object' ) {
        return 'Repeatable'
      }

      return 'Field';
    },
    submit: function () {
      const $fields = document.querySelectorAll('form.main-form input[type="text"]');
      window.$fields = $fields;
      const obj = {};
      const values = $fields.forEach(($e,i) => {
        // console.log(i, $e.name, $e.value );
        
        const name    = $e.name;
        const value   = $e.value;
        const matches = name.match(/\[(.*?)\]/g);

        // standard field
        if (!matches) {
          obj[name] = $e.value;
          return;
        }

        // is repeatable field like array or key value pairs
        const realName = name.substr(0, name.indexOf('['));
        const is_obj = matches.length > 1;
        obj[realName] = obj[realName] || (is_obj ? {} : []);
        if (is_obj) {
          const idx = matches[0];
          obj[realName][idx] = obj[realName][idx] || { key: null, value: null };
          
          if( matches[1] === '[key]' ) {
            obj[realName][idx].key = value;
          } else if( matches[1] === '[value]' ) {
            obj[realName][idx].value = value;
          }

          
        } else {
          obj[realName].push(value);
        }
      });

      const newObj = {};
      Object.keys(obj).forEach((e) => {
        if (typeof obj[e] === 'object' && ! Array.isArray(obj[e]) ) {
          Object.values(obj[e]).forEach(n => {
            newObj[n.key] = n.value;
          })
          obj[e] = newObj;
        }
      });

      obj.sitename = this.currentSite;
      this.busy = true;
      XHR(
        this.AJAX_URL, {
          action: 'update-site-file',
          data: obj,
        },
        'json'
      )
        .then(res => {})
        .catch(err => {})
        .finally(() => {
          this.busy = false;
        });
    },
  },
  beforeMount: function () {
    const obj = {
      action: 'site-list',
      data: null,
    }
    XHR(this.AJAX_URL, obj, 'json')
    .then((res) => {
      const response = res.target.response;
      const sites = response.data;
      if (sites.length < 1) return;
      this.sites = sites;
    })
    .catch((err) => {
      console.log('error', err);
    });
  },
  template: `
<div class="row" >

  <div class="col-md-3">
      <form>
        <div class="form-group">
          <label for="exampleFormControlSelect1">Your sites</label>
          <select class="form-control"
            data-action="site-config"
            v-model="currentSite"
            :disabled="busy"
          >
            <option selected="true" disabled="disabled">-select site-</option>
            <option v-for="site in sites" :value="site">{{site}}</option>
          </select>
        </div>
        <div class="form-group">
          <button type="submit"
            class="btn btn-primary js--rebuild-vhost"
            v-on:click.prevent="rebuildVhosts"
            :disabled="busy"
          >
            Rebuld vhosts
          </button>

          <button
            type="button"
            class="btn btn-success"
            v-on:click="addSite"
            :disabled="$root.busy"
          >
            <i class="fas fa-plus-circle"></i>
          </button>

        </div>
        
      </form>
    </div>

  <div class="col-md-9">
    <form class="main-form">
      <transition-group name="fade">
        <component
          v-for="(config, idx) in currentSiteConfigs"
          v-if="currentSiteConfigs" 
          :key="idx"
          :is="setType(idx, config)"
          :name="idx"
          :obj="config"
          :value="config"
        />
      </transition-group>
      
      <!-- <transition name="fade" v-if="currentSiteConfigs" > -->
        <button 
          type="submit"
          class="btn btn-primary" 
          v-if="currentSiteConfigs"v-on:click.prevent="submit"
        >
          Submit
        </button>
      <!-- </transition> -->

    </form>
  </div>
</div> <!-- /row -->

  `,
});