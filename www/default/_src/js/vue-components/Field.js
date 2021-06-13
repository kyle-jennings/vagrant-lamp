export default {
  props: {
    name: [String, Number],
    showName: {
      type: Boolean,
      default: true,
    },
    value: String
  },
  components: {},
  data: () => ({
    parentType: null,
  }),
  watch: {},
  computed: {
    formGroupClass: function () {
      return this.inRepeatable ? 'input-group' : '';
    },
    inRepeatable: function () {
      return this.parentType === 'Repeatable';
    }
  },
  methods: {
    removeRow: function () {
      this.$emit('removeRow', this.name);
    }
  },
  beforeMount: function () {
    this.parentType = this.$parent.$options._componentTag;
  },
  template: `
  <div :class="formGroupClass" class="form-group">
    <label class="label-large" v-if="showName" for="">{{name | prettyStrings }}</label>
    <input type="text" class="form-control" 
      :value="value" :disabled="$root.busy"
    />
    <div class="input-group-append" v-if="inRepeatable">
      <button class="btn btn-danger" type="button"
        v-on:click="removeRow"
        :disabled="this.$root.busy"
      >
        <i class="fas fa-minus-circle text-white"></i>
      </button>

    </div>
  </div>
  `,
};
