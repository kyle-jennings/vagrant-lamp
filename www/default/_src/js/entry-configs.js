import XHR from './modules/xhr';
import Vue from 'vue/dist/vue.js';
import Field from  './vue-components/Field';
import Repeatable from  './vue-components/Repeatable';
import KeyValue from  './vue-components/KeyValue';
import TextArea from  './vue-components/TextArea';


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
  },
  watch: {
    currentSite: function() {

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
    setType: function (name, value) {
      if ( Array.isArray(value) || typeof value === 'object' ) {
        return 'Repeatable'
      } else if ( value.length > 120 ) {
        return 'TextArea';
      }

      return 'Field';
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
          <select class="form-control js--key-select" data-action="site-config" v-model="currentSite">
            <option selected="true" disabled="disabled">-select site-</option>
            <option v-for="site in sites" :value="site">{{site}}</option>
          </select>
        </div>
      </form>
    </div>

  <div class="col-md-9">
    <form>
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
        <button type="submit" class="btn btn-primary" v-if="currentSiteConfigs">Submit</button>
      <!-- </transition> -->

    </form>
  </div>
</div> <!-- /row -->

  `,
});