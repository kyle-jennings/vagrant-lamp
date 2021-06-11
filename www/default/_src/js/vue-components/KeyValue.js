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
      <input type="text" class="form-control mb-4" :value="key">
    </div>
    
    <div class="col-md-8">
      <label>Value</label>
      <div class="input-group mb-5">
        <input type="text" class="form-control" :value="keyVal">
        <div class="input-group-append">
          <!-- <div class="input-group-text bg-danger">
            </div> -->
          <button class="btn btn-danger" type="button" v-on:click="removeRow">
            <i class="fas fa-minus-circle text-white"></i>
          </button>
        </div>
      </div>
    </div>


  </div>`,
};
