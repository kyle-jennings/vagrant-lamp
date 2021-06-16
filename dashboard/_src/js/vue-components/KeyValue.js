export default {
  props: ['name', 'value', 'idx', 'nameTag'],
  data: {},
  components: {},
  data: () => ({

  }),
  watch: {},
  computed: {
    inRepeatable: function () {
      return this.parentType === 'Repeatable';
    },
    key: function () {
      return Object.keys(this.value)[0];
    },
    keyVal: function () {
      return this.value[this.key];
    },
  },
  methods: {
    getNameTag: function (target) {
      return this.nameTag + '[' + target + ']'
    },
    removeRow: function () {
      this.$emit('removeRow', this.name);
    }
  },
  template: `
  <div class="form-row">    

    <div class="col-md-4">
      <label>Key</label>
      <input type="text" class="form-control" :value="key" :disabled="$root.busy" :name="getNameTag('key')">
    </div>
    
    <div class="col-md-8">
      <label>Value</label>
      <div class="input-group">
        <input type="text" class="form-control" :value="keyVal"
          :disabled="$root.busy"
          :name="getNameTag('value')"
        >
        <div class="input-group-append">
          <button class="btn btn-danger" type="button" v-on:click="removeRow"
            :disabled="$root.busy"
          >
            <i class="fas fa-minus-circle text-white"></i>
          </button>
        </div>
      </div>
    </div>


  </div>`,
};
