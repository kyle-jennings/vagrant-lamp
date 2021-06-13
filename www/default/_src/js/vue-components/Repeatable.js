import Field from './Field';
import KeyValue from  './KeyValue';

export default {
  props: {
    type: {
      type: String,
      default: 'Field',
      validator: function (value) {
        // The value must match one of these strings
        return ['Field', 'KeyValue'].indexOf(value) !== -1
      },
    },
    name: String,
    obj: [Array, Object],
  },
  data: () => ({
    fieldValues: [],
  }),
  components: {
    Field,
    KeyValue,
  },
  watch: {},
  computed: {
    objType: function () {
      return Array.isArray(this.obj) ? 'array' : 'object'
    },
    setType: function () {
      // console.log(this.objType);
      return this.objType === 'array' ? 'Field' : 'KeyValue';
    },
    showName: function () {
      const type = this.setType;
      return type === 'Field' ? false : true;
    }
  },
  methods: {
    addRow: function () {
      let val = null;
      if (this.setType === 'KeyValue') {
        const len = Object.keys(this.obj).length;
        val = {};
        val[''] = null;
      }

      this.fieldValues.push(val);
    },
    removeRow: function(data) {
      this.fieldValues.splice(data, 1);
    }
  },
  beforeMount: function () {
    const type = this.objType;
    if ( type === 'array' ) {
      this.obj.forEach((e,i) => {
        this.fieldValues.push(e);
      });
    } else {
      Object.keys(this.obj).forEach((e) => {
        const obj = {};
        obj[e] = this.obj[e];
        this.fieldValues.push(obj);
      });
    }
  },
  template: `
  <div class="form-group repeatable">
    <label class="label-large" for="">{{name | prettyStrings }}</label>
    <component 
      v-for="(e, i) in this.fieldValues"
      :key="i"
      :is="setType"
      :name="i"
      :value="e"
      :showName="showName"
      v-on:removeRow="removeRow"
    />
    <div>
      <button
        type="button"
        class="btn btn-primary"
        v-on:click="addRow"
        :disabled="$root.busy"
      >
        <i class="fas fa-plus-circle"></i>
      </button>
    </div>
  </div>
  `,
};
