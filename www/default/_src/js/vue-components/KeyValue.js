export default {
  props: ['name', 'value'],
  data: {},
  components: {},
  data: () => ({

  }),
  watch: {},
  computed: {
    key: function () {
      return Object.keys(this.value)[0];
    },
    keyVal: function () {
      return this.value[this.key];
    }
  },
  methods: {
    removeRow: function () {
      this.$emit('removeRow', this.name);
    }
  },
  template: `
  <div class="form-row">    

    <div class="col-md-4">
      <label>Key</label>
      <input type="text" class="form-control" :value="key">
    </div>
    
    <div class="col-md-8">
      <label>Value</label>
      <div class="input-group">
        <input type="text" class="form-control" :value="keyVal">
        <div class="input-group-append">
          <button class="btn btn-danger" type="button" v-on:click="removeRow">
            <i class="fas fa-minus-circle text-white"></i>
          </button>
        </div>
      </div>
    </div>


  </div>`,
};
