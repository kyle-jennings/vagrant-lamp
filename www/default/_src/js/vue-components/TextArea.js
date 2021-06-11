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
    <label class="label-large" for="">{{name}}</label><br />
    <textarea style="width: 100%" rows="5">{{value}}</textarea>
  </div>`,
};
