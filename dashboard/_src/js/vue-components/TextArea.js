export default {
  props: ['name', 'value'],
  data: {},
  components: {},
  data: () => ({}),
  watch: {},
  computed: {},
  methods: {},
  template: `
  <div class="form-group">
    <label class="label-large" for="">{{name | prettyStrings}}</label><br />
    <textarea style="width: 100%" rows="5" :name="name" :disabled="$root.busy">{{value}}</textarea>
  </div>`,
};
