(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _xhr = _interopRequireDefault(require("./modules/xhr"));

var _vue = _interopRequireDefault(require("vue/dist/vue.js"));

var _Field = _interopRequireDefault(require("./vue-components/Field"));

var _Repeatable = _interopRequireDefault(require("./vue-components/Repeatable"));

var _KeyValue = _interopRequireDefault(require("./vue-components/KeyValue"));

var _TextArea = _interopRequireDefault(require("./vue-components/TextArea"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

_vue.default.filter('prettyStrings', function (value) {
  if (!value) return '';
  value = value.toString();
  value = value.replace(/_/g, ' ');
  return value.charAt(0).toUpperCase() + value.slice(1);
});

new _vue.default({
  el: '#js--view-key-config',
  components: {
    Field: _Field.default,
    Repeatable: _Repeatable.default,
    KeyValue: _KeyValue.default,
    TextArea: _TextArea.default
  },
  data: {
    currentSite: null,
    currentSiteConfigs: null,
    sites: [],
    AJAX_URL: '/api',
    busy: false
  },
  watch: {
    currentSite: function currentSite(newVal, oldVal) {
      var _this = this;

      if (newVal === 'new') return;
      var data = this.currentSite;
      var action = 'site-config';
      (0, _xhr.default)(this.AJAX_URL, {
        action: action,
        data: data
      }, 'json').then(function (res) {
        _this.currentSiteConfigs = null;
        setTimeout(function () {
          var response = res.target.response;
          _this.currentSiteConfigs = response.data;
        }, 1000);
      }).catch(function (err) {
        console.log('error', err);
      });
    },
    sites: function sites() {
      this.currentSiteConfigs = null;
      this.currentSite = this.sites[0];
    }
  },
  computed: {},
  methods: {
    addSite: function addSite() {
      var _this2 = this;

      this.currentSite = 'new';
      var data = null;
      var action = 'new_site_form';
      (0, _xhr.default)(this.AJAX_URL, {
        action: action,
        data: data
      }, 'json').then(function (res) {
        _this2.currentSiteConfigs = null;
        setTimeout(function () {
          var response = res.target.response;
          _this2.currentSiteConfigs = response.data;
        }, 1000);
      }).catch(function (err) {
        console.log('error', err);
      });
    },
    rebuildVhosts: function rebuildVhosts(data) {
      var _this3 = this;

      var obj = {
        action: 'rebuild-vhosts',
        data: null
      };
      this.busy = true;
      (0, _xhr.default)(this.AJAX_URL, obj, 'json').then(function (res) {
        var response = res.target.response;
        console.log(response);
      }).catch(function (err) {
        console.log(err);
      }).finally(function () {
        _this3.busy = false;
      });
    },
    setType: function setType(name, value) {
      if (Array.isArray(value) || _typeof(value) === 'object') {
        return 'Repeatable';
      }

      return 'Field';
    },
    submit: function submit() {
      var _this4 = this;

      var $fields = document.querySelectorAll('form.main-form input[type="text"]');
      window.$fields = $fields;
      var obj = {};
      var values = $fields.forEach(function ($e, i) {
        // console.log(i, $e.name, $e.value );
        var name = $e.name;
        var value = $e.value;
        var matches = name.match(/\[(.*?)\]/g); // standard field

        if (!matches) {
          obj[name] = $e.value;
          return;
        } // is repeatable field like array or key value pairs


        var realName = name.substr(0, name.indexOf('['));
        var is_obj = matches.length > 1;
        obj[realName] = obj[realName] || (is_obj ? {} : []);

        if (is_obj) {
          var idx = matches[0];
          obj[realName][idx] = obj[realName][idx] || {
            key: null,
            value: null
          };

          if (matches[1] === '[key]') {
            obj[realName][idx].key = value;
          } else if (matches[1] === '[value]') {
            obj[realName][idx].value = value;
          }
        } else {
          obj[realName].push(value);
        }
      });
      var newObj = {};
      Object.keys(obj).forEach(function (e) {
        if (_typeof(obj[e]) === 'object' && !Array.isArray(obj[e])) {
          Object.values(obj[e]).forEach(function (n) {
            newObj[n.key] = n.value;
          });
          obj[e] = newObj;
        }
      });
      obj.sitename = this.currentSite;
      this.busy = true;
      (0, _xhr.default)(this.AJAX_URL, {
        action: 'update-site-file',
        data: obj
      }, 'json').then(function (res) {}).catch(function (err) {}).finally(function () {
        _this4.busy = false;
      });
    }
  },
  beforeMount: function beforeMount() {
    var _this5 = this;

    var obj = {
      action: 'site-list',
      data: null
    };
    (0, _xhr.default)(this.AJAX_URL, obj, 'json').then(function (res) {
      var response = res.target.response;
      var sites = response.data;
      if (sites.length < 1) return;
      _this5.sites = sites;
    }).catch(function (err) {
      console.log('error', err);
    });
  },
  template: "\n<div class=\"row\" >\n\n  <div class=\"col-md-3\">\n      <form>\n        <div class=\"form-group\">\n          <label for=\"exampleFormControlSelect1\">Your sites</label>\n          <select class=\"form-control\"\n            data-action=\"site-config\"\n            v-model=\"currentSite\"\n            :disabled=\"busy\"\n          >\n            <option selected=\"true\" disabled=\"disabled\">-select site-</option>\n            <option v-for=\"site in sites\" :value=\"site\">{{site}}</option>\n          </select>\n        </div>\n        <div class=\"form-group\">\n          <button type=\"submit\"\n            class=\"btn btn-primary js--rebuild-vhost\"\n            v-on:click.prevent=\"rebuildVhosts\"\n            :disabled=\"busy\"\n          >\n            Rebuld vhosts\n          </button>\n\n          <button\n            type=\"button\"\n            class=\"btn btn-success\"\n            v-on:click=\"addSite\"\n            :disabled=\"$root.busy\"\n          >\n            <i class=\"fas fa-plus-circle\"></i>\n          </button>\n\n        </div>\n        \n      </form>\n    </div>\n\n  <div class=\"col-md-9\">\n    <form class=\"main-form\">\n      <transition-group name=\"fade\">\n        <component\n          v-for=\"(config, idx) in currentSiteConfigs\"\n          v-if=\"currentSiteConfigs\" \n          :key=\"idx\"\n          :is=\"setType(idx, config)\"\n          :name=\"idx\"\n          :obj=\"config\"\n          :value=\"config\"\n        />\n      </transition-group>\n      \n      <!-- <transition name=\"fade\" v-if=\"currentSiteConfigs\" > -->\n        <button \n          type=\"submit\"\n          class=\"btn btn-primary\" \n          v-if=\"currentSiteConfigs\"v-on:click.prevent=\"submit\"\n        >\n          Submit\n        </button>\n      <!-- </transition> -->\n\n    </form>\n  </div>\n</div> <!-- /row -->\n\n  "
});

},{"./modules/xhr":2,"./vue-components/Field":3,"./vue-components/KeyValue":4,"./vue-components/Repeatable":5,"./vue-components/TextArea":6,"vue/dist/vue.js":9}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _default(url, obj) {
  var responseType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'json';
  var xhr = new XMLHttpRequest();
  return new Promise(function (resolve, reject) {
    var params = 'action=' + obj.action + '&data=' + JSON.stringify(obj.data);
    var urlArgs = url + '?' + params;
    xhr.open('POST', urlArgs);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.responseType = 'json';

    xhr.onload = function (res) {
      if (xhr.status >= 200 && xhr.status < 300) resolve(res);else reject('something bad happened');
    };

    xhr.send();
  });
}

;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  props: {
    name: [String, Number],
    showName: {
      type: Boolean,
      default: true
    },
    value: String,
    isRepeatable: Boolean,
    nameTag: String
  },
  components: {},
  data: function data() {
    return {
      parentType: null
    };
  },
  watch: {},
  computed: {
    getNameTag: function getNameTag() {
      return this.nameTag || this.name;
    },
    formGroupClass: function formGroupClass() {
      return this.inRepeatable ? 'input-group' : '';
    },
    inRepeatable: function inRepeatable() {
      return this.parentType === 'Repeatable';
    }
  },
  methods: {
    removeRow: function removeRow() {
      this.$emit('removeRow', this.name);
    }
  },
  beforeMount: function beforeMount() {
    this.parentType = this.$parent.$options._componentTag;
  },
  template: "\n  <div :class=\"formGroupClass\" class=\"form-group\">\n    <label class=\"label-large\" v-if=\"showName\" for=\"\">{{name | prettyStrings }}</label>\n    <input type=\"text\" class=\"form-control\" \n      :value=\"value\" :disabled=\"$root.busy\"\n      :name=\"getNameTag\"\n    />\n    <div class=\"input-group-append\" v-if=\"inRepeatable\">\n      <button class=\"btn btn-danger\" type=\"button\"\n        v-on:click=\"removeRow\"\n        :disabled=\"this.$root.busy\"\n      >\n        <i class=\"fas fa-minus-circle text-white\"></i>\n      </button>\n\n    </div>\n  </div>\n  "
};
exports.default = _default;

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _props$data$component;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = (_props$data$component = {
  props: ['name', 'value', 'idx', 'nameTag'],
  data: {},
  components: {}
}, _defineProperty(_props$data$component, "data", function data() {
  return {};
}), _defineProperty(_props$data$component, "watch", {}), _defineProperty(_props$data$component, "computed", {
  inRepeatable: function inRepeatable() {
    return this.parentType === 'Repeatable';
  },
  key: function key() {
    return Object.keys(this.value)[0];
  },
  keyVal: function keyVal() {
    return this.value[this.key];
  }
}), _defineProperty(_props$data$component, "methods", {
  getNameTag: function getNameTag(target) {
    return this.nameTag + '[' + target + ']';
  },
  removeRow: function removeRow() {
    this.$emit('removeRow', this.name);
  }
}), _defineProperty(_props$data$component, "template", "\n  <div class=\"form-row\">    \n\n    <div class=\"col-md-4\">\n      <label>Key</label>\n      <input type=\"text\" class=\"form-control\" :value=\"key\" :disabled=\"$root.busy\" :name=\"getNameTag('key')\">\n    </div>\n    \n    <div class=\"col-md-8\">\n      <label>Value</label>\n      <div class=\"input-group\">\n        <input type=\"text\" class=\"form-control\" :value=\"keyVal\"\n          :disabled=\"$root.busy\"\n          :name=\"getNameTag('value')\"\n        >\n        <div class=\"input-group-append\">\n          <button class=\"btn btn-danger\" type=\"button\" v-on:click=\"removeRow\"\n            :disabled=\"$root.busy\"\n          >\n            <i class=\"fas fa-minus-circle text-white\"></i>\n          </button>\n        </div>\n      </div>\n    </div>\n\n\n  </div>"), _props$data$component);

exports.default = _default;

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Field = _interopRequireDefault(require("./Field"));

var _KeyValue = _interopRequireDefault(require("./KeyValue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  props: {
    type: {
      type: String,
      default: 'Field',
      validator: function validator(value) {
        // The value must match one of these strings
        return ['Field', 'KeyValue'].indexOf(value) !== -1;
      }
    },
    name: String,
    obj: [Array, Object]
  },
  data: function data() {
    return {
      fieldValues: []
    };
  },
  components: {
    Field: _Field.default,
    KeyValue: _KeyValue.default
  },
  watch: {},
  computed: {
    objType: function objType() {
      return Array.isArray(this.obj) ? 'array' : 'object';
    },
    setType: function setType() {
      // console.log(this.objType);
      return this.objType === 'array' ? 'Field' : 'KeyValue';
    },
    showName: function showName() {
      var type = this.setType;
      return type === 'Field' ? false : true;
    }
  },
  methods: {
    addRow: function addRow() {
      var val = null;

      if (this.setType === 'KeyValue') {
        var len = Object.keys(this.obj).length;
        val = {};
        val[''] = null;
      }

      this.fieldValues.push(val);
    },
    getNameTag: function getNameTag(e, i, name) {
      return name + '[' + i + ']';
    },
    removeRow: function removeRow(data) {
      this.fieldValues.splice(data, 1);
    }
  },
  beforeMount: function beforeMount() {
    var _this = this;

    var type = this.objType;

    if (type === 'array') {
      this.obj.forEach(function (e, i) {
        _this.fieldValues.push(e);
      });
    } else {
      Object.keys(this.obj).forEach(function (e) {
        var obj = {};
        obj[e] = _this.obj[e];

        _this.fieldValues.push(obj);
      });
    }
  },
  template: "\n  <div class=\"form-group repeatable\">\n    <label class=\"label-large\" for=\"\">{{name | prettyStrings }}</label>\n    <component \n      v-for=\"(e, i) in this.fieldValues\"\n      :key=\"i\"\n      :idx=\"i\"\n      :is=\"setType\"\n      :name=\"name\"\n      :value=\"e\"\n      :showName=\"showName\"\n      :isRepeatable=\"true\"\n      :nameTag=\"getNameTag(e,i, name)\"\n      v-on:removeRow=\"removeRow\"\n    />\n    <div>\n      <button\n        type=\"button\"\n        class=\"btn btn-primary\"\n        v-on:click=\"addRow\"\n        :disabled=\"$root.busy\"\n      >\n        <i class=\"fas fa-plus-circle\"></i>\n      </button>\n    </div>\n  </div>\n  "
};
exports.default = _default;

},{"./Field":3,"./KeyValue":4}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _props$data$component;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = (_props$data$component = {
  props: ['name', 'value'],
  data: {},
  components: {}
}, _defineProperty(_props$data$component, "data", function data() {
  return {};
}), _defineProperty(_props$data$component, "watch", {}), _defineProperty(_props$data$component, "computed", {}), _defineProperty(_props$data$component, "methods", {}), _defineProperty(_props$data$component, "template", "\n  <div class=\"form-group\">\n    <label class=\"label-large\" for=\"\">{{name | prettyStrings}}</label><br />\n    <textarea style=\"width: 100%\" rows=\"5\" :name=\"name\" :disabled=\"$root.busy\">{{value}}</textarea>\n  </div>"), _props$data$component);

exports.default = _default;

},{}],7:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],8:[function(require,module,exports){
(function (setImmediate,clearImmediate){(function (){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this)}).call(this,require("timers").setImmediate,require("timers").clearImmediate)

},{"process/browser.js":7,"timers":8}],9:[function(require,module,exports){
(function (global,setImmediate){(function (){
/*!
 * Vue.js v2.6.14
 * (c) 2014-2021 Evan You
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Vue = factory());
}(this, function () { 'use strict';

  /*  */

  var emptyObject = Object.freeze({});

  // These helpers produce better VM code in JS engines due to their
  // explicitness and function inlining.
  function isUndef (v) {
    return v === undefined || v === null
  }

  function isDef (v) {
    return v !== undefined && v !== null
  }

  function isTrue (v) {
    return v === true
  }

  function isFalse (v) {
    return v === false
  }

  /**
   * Check if value is primitive.
   */
  function isPrimitive (value) {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      // $flow-disable-line
      typeof value === 'symbol' ||
      typeof value === 'boolean'
    )
  }

  /**
   * Quick object check - this is primarily used to tell
   * Objects from primitive values when we know the value
   * is a JSON-compliant type.
   */
  function isObject (obj) {
    return obj !== null && typeof obj === 'object'
  }

  /**
   * Get the raw type string of a value, e.g., [object Object].
   */
  var _toString = Object.prototype.toString;

  function toRawType (value) {
    return _toString.call(value).slice(8, -1)
  }

  /**
   * Strict object type check. Only returns true
   * for plain JavaScript objects.
   */
  function isPlainObject (obj) {
    return _toString.call(obj) === '[object Object]'
  }

  function isRegExp (v) {
    return _toString.call(v) === '[object RegExp]'
  }

  /**
   * Check if val is a valid array index.
   */
  function isValidArrayIndex (val) {
    var n = parseFloat(String(val));
    return n >= 0 && Math.floor(n) === n && isFinite(val)
  }

  function isPromise (val) {
    return (
      isDef(val) &&
      typeof val.then === 'function' &&
      typeof val.catch === 'function'
    )
  }

  /**
   * Convert a value to a string that is actually rendered.
   */
  function toString (val) {
    return val == null
      ? ''
      : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
        ? JSON.stringify(val, null, 2)
        : String(val)
  }

  /**
   * Convert an input value to a number for persistence.
   * If the conversion fails, return original string.
   */
  function toNumber (val) {
    var n = parseFloat(val);
    return isNaN(n) ? val : n
  }

  /**
   * Make a map and return a function for checking if a key
   * is in that map.
   */
  function makeMap (
    str,
    expectsLowerCase
  ) {
    var map = Object.create(null);
    var list = str.split(',');
    for (var i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }
    return expectsLowerCase
      ? function (val) { return map[val.toLowerCase()]; }
      : function (val) { return map[val]; }
  }

  /**
   * Check if a tag is a built-in tag.
   */
  var isBuiltInTag = makeMap('slot,component', true);

  /**
   * Check if an attribute is a reserved attribute.
   */
  var isReservedAttribute = makeMap('key,ref,slot,slot-scope,is');

  /**
   * Remove an item from an array.
   */
  function remove (arr, item) {
    if (arr.length) {
      var index = arr.indexOf(item);
      if (index > -1) {
        return arr.splice(index, 1)
      }
    }
  }

  /**
   * Check whether an object has the property.
   */
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  function hasOwn (obj, key) {
    return hasOwnProperty.call(obj, key)
  }

  /**
   * Create a cached version of a pure function.
   */
  function cached (fn) {
    var cache = Object.create(null);
    return (function cachedFn (str) {
      var hit = cache[str];
      return hit || (cache[str] = fn(str))
    })
  }

  /**
   * Camelize a hyphen-delimited string.
   */
  var camelizeRE = /-(\w)/g;
  var camelize = cached(function (str) {
    return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
  });

  /**
   * Capitalize a string.
   */
  var capitalize = cached(function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  });

  /**
   * Hyphenate a camelCase string.
   */
  var hyphenateRE = /\B([A-Z])/g;
  var hyphenate = cached(function (str) {
    return str.replace(hyphenateRE, '-$1').toLowerCase()
  });

  /**
   * Simple bind polyfill for environments that do not support it,
   * e.g., PhantomJS 1.x. Technically, we don't need this anymore
   * since native bind is now performant enough in most browsers.
   * But removing it would mean breaking code that was able to run in
   * PhantomJS 1.x, so this must be kept for backward compatibility.
   */

  /* istanbul ignore next */
  function polyfillBind (fn, ctx) {
    function boundFn (a) {
      var l = arguments.length;
      return l
        ? l > 1
          ? fn.apply(ctx, arguments)
          : fn.call(ctx, a)
        : fn.call(ctx)
    }

    boundFn._length = fn.length;
    return boundFn
  }

  function nativeBind (fn, ctx) {
    return fn.bind(ctx)
  }

  var bind = Function.prototype.bind
    ? nativeBind
    : polyfillBind;

  /**
   * Convert an Array-like object to a real Array.
   */
  function toArray (list, start) {
    start = start || 0;
    var i = list.length - start;
    var ret = new Array(i);
    while (i--) {
      ret[i] = list[i + start];
    }
    return ret
  }

  /**
   * Mix properties into target object.
   */
  function extend (to, _from) {
    for (var key in _from) {
      to[key] = _from[key];
    }
    return to
  }

  /**
   * Merge an Array of Objects into a single Object.
   */
  function toObject (arr) {
    var res = {};
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]) {
        extend(res, arr[i]);
      }
    }
    return res
  }

  /* eslint-disable no-unused-vars */

  /**
   * Perform no operation.
   * Stubbing args to make Flow happy without leaving useless transpiled code
   * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
   */
  function noop (a, b, c) {}

  /**
   * Always return false.
   */
  var no = function (a, b, c) { return false; };

  /* eslint-enable no-unused-vars */

  /**
   * Return the same value.
   */
  var identity = function (_) { return _; };

  /**
   * Generate a string containing static keys from compiler modules.
   */
  function genStaticKeys (modules) {
    return modules.reduce(function (keys, m) {
      return keys.concat(m.staticKeys || [])
    }, []).join(',')
  }

  /**
   * Check if two values are loosely equal - that is,
   * if they are plain objects, do they have the same shape?
   */
  function looseEqual (a, b) {
    if (a === b) { return true }
    var isObjectA = isObject(a);
    var isObjectB = isObject(b);
    if (isObjectA && isObjectB) {
      try {
        var isArrayA = Array.isArray(a);
        var isArrayB = Array.isArray(b);
        if (isArrayA && isArrayB) {
          return a.length === b.length && a.every(function (e, i) {
            return looseEqual(e, b[i])
          })
        } else if (a instanceof Date && b instanceof Date) {
          return a.getTime() === b.getTime()
        } else if (!isArrayA && !isArrayB) {
          var keysA = Object.keys(a);
          var keysB = Object.keys(b);
          return keysA.length === keysB.length && keysA.every(function (key) {
            return looseEqual(a[key], b[key])
          })
        } else {
          /* istanbul ignore next */
          return false
        }
      } catch (e) {
        /* istanbul ignore next */
        return false
      }
    } else if (!isObjectA && !isObjectB) {
      return String(a) === String(b)
    } else {
      return false
    }
  }

  /**
   * Return the first index at which a loosely equal value can be
   * found in the array (if value is a plain object, the array must
   * contain an object of the same shape), or -1 if it is not present.
   */
  function looseIndexOf (arr, val) {
    for (var i = 0; i < arr.length; i++) {
      if (looseEqual(arr[i], val)) { return i }
    }
    return -1
  }

  /**
   * Ensure a function is called only once.
   */
  function once (fn) {
    var called = false;
    return function () {
      if (!called) {
        called = true;
        fn.apply(this, arguments);
      }
    }
  }

  var SSR_ATTR = 'data-server-rendered';

  var ASSET_TYPES = [
    'component',
    'directive',
    'filter'
  ];

  var LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
    'activated',
    'deactivated',
    'errorCaptured',
    'serverPrefetch'
  ];

  /*  */



  var config = ({
    /**
     * Option merge strategies (used in core/util/options)
     */
    // $flow-disable-line
    optionMergeStrategies: Object.create(null),

    /**
     * Whether to suppress warnings.
     */
    silent: false,

    /**
     * Show production mode tip message on boot?
     */
    productionTip: "development" !== 'production',

    /**
     * Whether to enable devtools
     */
    devtools: "development" !== 'production',

    /**
     * Whether to record perf
     */
    performance: false,

    /**
     * Error handler for watcher errors
     */
    errorHandler: null,

    /**
     * Warn handler for watcher warns
     */
    warnHandler: null,

    /**
     * Ignore certain custom elements
     */
    ignoredElements: [],

    /**
     * Custom user key aliases for v-on
     */
    // $flow-disable-line
    keyCodes: Object.create(null),

    /**
     * Check if a tag is reserved so that it cannot be registered as a
     * component. This is platform-dependent and may be overwritten.
     */
    isReservedTag: no,

    /**
     * Check if an attribute is reserved so that it cannot be used as a component
     * prop. This is platform-dependent and may be overwritten.
     */
    isReservedAttr: no,

    /**
     * Check if a tag is an unknown element.
     * Platform-dependent.
     */
    isUnknownElement: no,

    /**
     * Get the namespace of an element
     */
    getTagNamespace: noop,

    /**
     * Parse the real tag name for the specific platform.
     */
    parsePlatformTagName: identity,

    /**
     * Check if an attribute must be bound using property, e.g. value
     * Platform-dependent.
     */
    mustUseProp: no,

    /**
     * Perform updates asynchronously. Intended to be used by Vue Test Utils
     * This will significantly reduce performance if set to false.
     */
    async: true,

    /**
     * Exposed for legacy reasons
     */
    _lifecycleHooks: LIFECYCLE_HOOKS
  });

  /*  */

  /**
   * unicode letters used for parsing html tags, component names and property paths.
   * using https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
   * skipping \u10000-\uEFFFF due to it freezing up PhantomJS
   */
  var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;

  /**
   * Check if a string starts with $ or _
   */
  function isReserved (str) {
    var c = (str + '').charCodeAt(0);
    return c === 0x24 || c === 0x5F
  }

  /**
   * Define a property.
   */
  function def (obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: !!enumerable,
      writable: true,
      configurable: true
    });
  }

  /**
   * Parse simple path.
   */
  var bailRE = new RegExp(("[^" + (unicodeRegExp.source) + ".$_\\d]"));
  function parsePath (path) {
    if (bailRE.test(path)) {
      return
    }
    var segments = path.split('.');
    return function (obj) {
      for (var i = 0; i < segments.length; i++) {
        if (!obj) { return }
        obj = obj[segments[i]];
      }
      return obj
    }
  }

  /*  */

  // can we use __proto__?
  var hasProto = '__proto__' in {};

  // Browser environment sniffing
  var inBrowser = typeof window !== 'undefined';
  var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
  var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
  var UA = inBrowser && window.navigator.userAgent.toLowerCase();
  var isIE = UA && /msie|trident/.test(UA);
  var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
  var isEdge = UA && UA.indexOf('edge/') > 0;
  var isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android');
  var isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios');
  var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;
  var isPhantomJS = UA && /phantomjs/.test(UA);
  var isFF = UA && UA.match(/firefox\/(\d+)/);

  // Firefox has a "watch" function on Object.prototype...
  var nativeWatch = ({}).watch;

  var supportsPassive = false;
  if (inBrowser) {
    try {
      var opts = {};
      Object.defineProperty(opts, 'passive', ({
        get: function get () {
          /* istanbul ignore next */
          supportsPassive = true;
        }
      })); // https://github.com/facebook/flow/issues/285
      window.addEventListener('test-passive', null, opts);
    } catch (e) {}
  }

  // this needs to be lazy-evaled because vue may be required before
  // vue-server-renderer can set VUE_ENV
  var _isServer;
  var isServerRendering = function () {
    if (_isServer === undefined) {
      /* istanbul ignore if */
      if (!inBrowser && !inWeex && typeof global !== 'undefined') {
        // detect presence of vue-server-renderer and avoid
        // Webpack shimming the process
        _isServer = global['process'] && global['process'].env.VUE_ENV === 'server';
      } else {
        _isServer = false;
      }
    }
    return _isServer
  };

  // detect devtools
  var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

  /* istanbul ignore next */
  function isNative (Ctor) {
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
  }

  var hasSymbol =
    typeof Symbol !== 'undefined' && isNative(Symbol) &&
    typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

  var _Set;
  /* istanbul ignore if */ // $flow-disable-line
  if (typeof Set !== 'undefined' && isNative(Set)) {
    // use native Set when available.
    _Set = Set;
  } else {
    // a non-standard Set polyfill that only works with primitive keys.
    _Set = /*@__PURE__*/(function () {
      function Set () {
        this.set = Object.create(null);
      }
      Set.prototype.has = function has (key) {
        return this.set[key] === true
      };
      Set.prototype.add = function add (key) {
        this.set[key] = true;
      };
      Set.prototype.clear = function clear () {
        this.set = Object.create(null);
      };

      return Set;
    }());
  }

  /*  */

  var warn = noop;
  var tip = noop;
  var generateComponentTrace = (noop); // work around flow check
  var formatComponentName = (noop);

  {
    var hasConsole = typeof console !== 'undefined';
    var classifyRE = /(?:^|[-_])(\w)/g;
    var classify = function (str) { return str
      .replace(classifyRE, function (c) { return c.toUpperCase(); })
      .replace(/[-_]/g, ''); };

    warn = function (msg, vm) {
      var trace = vm ? generateComponentTrace(vm) : '';

      if (config.warnHandler) {
        config.warnHandler.call(null, msg, vm, trace);
      } else if (hasConsole && (!config.silent)) {
        console.error(("[Vue warn]: " + msg + trace));
      }
    };

    tip = function (msg, vm) {
      if (hasConsole && (!config.silent)) {
        console.warn("[Vue tip]: " + msg + (
          vm ? generateComponentTrace(vm) : ''
        ));
      }
    };

    formatComponentName = function (vm, includeFile) {
      if (vm.$root === vm) {
        return '<Root>'
      }
      var options = typeof vm === 'function' && vm.cid != null
        ? vm.options
        : vm._isVue
          ? vm.$options || vm.constructor.options
          : vm;
      var name = options.name || options._componentTag;
      var file = options.__file;
      if (!name && file) {
        var match = file.match(/([^/\\]+)\.vue$/);
        name = match && match[1];
      }

      return (
        (name ? ("<" + (classify(name)) + ">") : "<Anonymous>") +
        (file && includeFile !== false ? (" at " + file) : '')
      )
    };

    var repeat = function (str, n) {
      var res = '';
      while (n) {
        if (n % 2 === 1) { res += str; }
        if (n > 1) { str += str; }
        n >>= 1;
      }
      return res
    };

    generateComponentTrace = function (vm) {
      if (vm._isVue && vm.$parent) {
        var tree = [];
        var currentRecursiveSequence = 0;
        while (vm) {
          if (tree.length > 0) {
            var last = tree[tree.length - 1];
            if (last.constructor === vm.constructor) {
              currentRecursiveSequence++;
              vm = vm.$parent;
              continue
            } else if (currentRecursiveSequence > 0) {
              tree[tree.length - 1] = [last, currentRecursiveSequence];
              currentRecursiveSequence = 0;
            }
          }
          tree.push(vm);
          vm = vm.$parent;
        }
        return '\n\nfound in\n\n' + tree
          .map(function (vm, i) { return ("" + (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) + (Array.isArray(vm)
              ? ((formatComponentName(vm[0])) + "... (" + (vm[1]) + " recursive calls)")
              : formatComponentName(vm))); })
          .join('\n')
      } else {
        return ("\n\n(found in " + (formatComponentName(vm)) + ")")
      }
    };
  }

  /*  */

  var uid = 0;

  /**
   * A dep is an observable that can have multiple
   * directives subscribing to it.
   */
  var Dep = function Dep () {
    this.id = uid++;
    this.subs = [];
  };

  Dep.prototype.addSub = function addSub (sub) {
    this.subs.push(sub);
  };

  Dep.prototype.removeSub = function removeSub (sub) {
    remove(this.subs, sub);
  };

  Dep.prototype.depend = function depend () {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  };

  Dep.prototype.notify = function notify () {
    // stabilize the subscriber list first
    var subs = this.subs.slice();
    if (!config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort(function (a, b) { return a.id - b.id; });
    }
    for (var i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  };

  // The current target watcher being evaluated.
  // This is globally unique because only one watcher
  // can be evaluated at a time.
  Dep.target = null;
  var targetStack = [];

  function pushTarget (target) {
    targetStack.push(target);
    Dep.target = target;
  }

  function popTarget () {
    targetStack.pop();
    Dep.target = targetStack[targetStack.length - 1];
  }

  /*  */

  var VNode = function VNode (
    tag,
    data,
    children,
    text,
    elm,
    context,
    componentOptions,
    asyncFactory
  ) {
    this.tag = tag;
    this.data = data;
    this.children = children;
    this.text = text;
    this.elm = elm;
    this.ns = undefined;
    this.context = context;
    this.fnContext = undefined;
    this.fnOptions = undefined;
    this.fnScopeId = undefined;
    this.key = data && data.key;
    this.componentOptions = componentOptions;
    this.componentInstance = undefined;
    this.parent = undefined;
    this.raw = false;
    this.isStatic = false;
    this.isRootInsert = true;
    this.isComment = false;
    this.isCloned = false;
    this.isOnce = false;
    this.asyncFactory = asyncFactory;
    this.asyncMeta = undefined;
    this.isAsyncPlaceholder = false;
  };

  var prototypeAccessors = { child: { configurable: true } };

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  prototypeAccessors.child.get = function () {
    return this.componentInstance
  };

  Object.defineProperties( VNode.prototype, prototypeAccessors );

  var createEmptyVNode = function (text) {
    if ( text === void 0 ) text = '';

    var node = new VNode();
    node.text = text;
    node.isComment = true;
    return node
  };

  function createTextVNode (val) {
    return new VNode(undefined, undefined, undefined, String(val))
  }

  // optimized shallow clone
  // used for static nodes and slot nodes because they may be reused across
  // multiple renders, cloning them avoids errors when DOM manipulations rely
  // on their elm reference.
  function cloneVNode (vnode) {
    var cloned = new VNode(
      vnode.tag,
      vnode.data,
      // #7975
      // clone children array to avoid mutating original in case of cloning
      // a child.
      vnode.children && vnode.children.slice(),
      vnode.text,
      vnode.elm,
      vnode.context,
      vnode.componentOptions,
      vnode.asyncFactory
    );
    cloned.ns = vnode.ns;
    cloned.isStatic = vnode.isStatic;
    cloned.key = vnode.key;
    cloned.isComment = vnode.isComment;
    cloned.fnContext = vnode.fnContext;
    cloned.fnOptions = vnode.fnOptions;
    cloned.fnScopeId = vnode.fnScopeId;
    cloned.asyncMeta = vnode.asyncMeta;
    cloned.isCloned = true;
    return cloned
  }

  /*
   * not type checking this file because flow doesn't play well with
   * dynamically accessing methods on Array prototype
   */

  var arrayProto = Array.prototype;
  var arrayMethods = Object.create(arrayProto);

  var methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
  ];

  /**
   * Intercept mutating methods and emit events
   */
  methodsToPatch.forEach(function (method) {
    // cache original method
    var original = arrayProto[method];
    def(arrayMethods, method, function mutator () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      var result = original.apply(this, args);
      var ob = this.__ob__;
      var inserted;
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break
        case 'splice':
          inserted = args.slice(2);
          break
      }
      if (inserted) { ob.observeArray(inserted); }
      // notify change
      ob.dep.notify();
      return result
    });
  });

  /*  */

  var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

  /**
   * In some cases we may want to disable observation inside a component's
   * update computation.
   */
  var shouldObserve = true;

  function toggleObserving (value) {
    shouldObserve = value;
  }

  /**
   * Observer class that is attached to each observed
   * object. Once attached, the observer converts the target
   * object's property keys into getter/setters that
   * collect dependencies and dispatch updates.
   */
  var Observer = function Observer (value) {
    this.value = value;
    this.dep = new Dep();
    this.vmCount = 0;
    def(value, '__ob__', this);
    if (Array.isArray(value)) {
      if (hasProto) {
        protoAugment(value, arrayMethods);
      } else {
        copyAugment(value, arrayMethods, arrayKeys);
      }
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  };

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  Observer.prototype.walk = function walk (obj) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      defineReactive$$1(obj, keys[i]);
    }
  };

  /**
   * Observe a list of Array items.
   */
  Observer.prototype.observeArray = function observeArray (items) {
    for (var i = 0, l = items.length; i < l; i++) {
      observe(items[i]);
    }
  };

  // helpers

  /**
   * Augment a target Object or Array by intercepting
   * the prototype chain using __proto__
   */
  function protoAugment (target, src) {
    /* eslint-disable no-proto */
    target.__proto__ = src;
    /* eslint-enable no-proto */
  }

  /**
   * Augment a target Object or Array by defining
   * hidden properties.
   */
  /* istanbul ignore next */
  function copyAugment (target, src, keys) {
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i];
      def(target, key, src[key]);
    }
  }

  /**
   * Attempt to create an observer instance for a value,
   * returns the new observer if successfully observed,
   * or the existing observer if the value already has one.
   */
  function observe (value, asRootData) {
    if (!isObject(value) || value instanceof VNode) {
      return
    }
    var ob;
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
      ob = value.__ob__;
    } else if (
      shouldObserve &&
      !isServerRendering() &&
      (Array.isArray(value) || isPlainObject(value)) &&
      Object.isExtensible(value) &&
      !value._isVue
    ) {
      ob = new Observer(value);
    }
    if (asRootData && ob) {
      ob.vmCount++;
    }
    return ob
  }

  /**
   * Define a reactive property on an Object.
   */
  function defineReactive$$1 (
    obj,
    key,
    val,
    customSetter,
    shallow
  ) {
    var dep = new Dep();

    var property = Object.getOwnPropertyDescriptor(obj, key);
    if (property && property.configurable === false) {
      return
    }

    // cater for pre-defined getter/setters
    var getter = property && property.get;
    var setter = property && property.set;
    if ((!getter || setter) && arguments.length === 2) {
      val = obj[key];
    }

    var childOb = !shallow && observe(val);
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter () {
        var value = getter ? getter.call(obj) : val;
        if (Dep.target) {
          dep.depend();
          if (childOb) {
            childOb.dep.depend();
            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }
        return value
      },
      set: function reactiveSetter (newVal) {
        var value = getter ? getter.call(obj) : val;
        /* eslint-disable no-self-compare */
        if (newVal === value || (newVal !== newVal && value !== value)) {
          return
        }
        /* eslint-enable no-self-compare */
        if (customSetter) {
          customSetter();
        }
        // #7981: for accessor properties without setter
        if (getter && !setter) { return }
        if (setter) {
          setter.call(obj, newVal);
        } else {
          val = newVal;
        }
        childOb = !shallow && observe(newVal);
        dep.notify();
      }
    });
  }

  /**
   * Set a property on an object. Adds the new property and
   * triggers change notification if the property doesn't
   * already exist.
   */
  function set (target, key, val) {
    if (isUndef(target) || isPrimitive(target)
    ) {
      warn(("Cannot set reactive property on undefined, null, or primitive value: " + ((target))));
    }
    if (Array.isArray(target) && isValidArrayIndex(key)) {
      target.length = Math.max(target.length, key);
      target.splice(key, 1, val);
      return val
    }
    if (key in target && !(key in Object.prototype)) {
      target[key] = val;
      return val
    }
    var ob = (target).__ob__;
    if (target._isVue || (ob && ob.vmCount)) {
      warn(
        'Avoid adding reactive properties to a Vue instance or its root $data ' +
        'at runtime - declare it upfront in the data option.'
      );
      return val
    }
    if (!ob) {
      target[key] = val;
      return val
    }
    defineReactive$$1(ob.value, key, val);
    ob.dep.notify();
    return val
  }

  /**
   * Delete a property and trigger change if necessary.
   */
  function del (target, key) {
    if (isUndef(target) || isPrimitive(target)
    ) {
      warn(("Cannot delete reactive property on undefined, null, or primitive value: " + ((target))));
    }
    if (Array.isArray(target) && isValidArrayIndex(key)) {
      target.splice(key, 1);
      return
    }
    var ob = (target).__ob__;
    if (target._isVue || (ob && ob.vmCount)) {
      warn(
        'Avoid deleting properties on a Vue instance or its root $data ' +
        '- just set it to null.'
      );
      return
    }
    if (!hasOwn(target, key)) {
      return
    }
    delete target[key];
    if (!ob) {
      return
    }
    ob.dep.notify();
  }

  /**
   * Collect dependencies on array elements when the array is touched, since
   * we cannot intercept array element access like property getters.
   */
  function dependArray (value) {
    for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
      e = value[i];
      e && e.__ob__ && e.__ob__.dep.depend();
      if (Array.isArray(e)) {
        dependArray(e);
      }
    }
  }

  /*  */

  /**
   * Option overwriting strategies are functions that handle
   * how to merge a parent option value and a child option
   * value into the final value.
   */
  var strats = config.optionMergeStrategies;

  /**
   * Options with restrictions
   */
  {
    strats.el = strats.propsData = function (parent, child, vm, key) {
      if (!vm) {
        warn(
          "option \"" + key + "\" can only be used during instance " +
          'creation with the `new` keyword.'
        );
      }
      return defaultStrat(parent, child)
    };
  }

  /**
   * Helper that recursively merges two data objects together.
   */
  function mergeData (to, from) {
    if (!from) { return to }
    var key, toVal, fromVal;

    var keys = hasSymbol
      ? Reflect.ownKeys(from)
      : Object.keys(from);

    for (var i = 0; i < keys.length; i++) {
      key = keys[i];
      // in case the object is already observed...
      if (key === '__ob__') { continue }
      toVal = to[key];
      fromVal = from[key];
      if (!hasOwn(to, key)) {
        set(to, key, fromVal);
      } else if (
        toVal !== fromVal &&
        isPlainObject(toVal) &&
        isPlainObject(fromVal)
      ) {
        mergeData(toVal, fromVal);
      }
    }
    return to
  }

  /**
   * Data
   */
  function mergeDataOrFn (
    parentVal,
    childVal,
    vm
  ) {
    if (!vm) {
      // in a Vue.extend merge, both should be functions
      if (!childVal) {
        return parentVal
      }
      if (!parentVal) {
        return childVal
      }
      // when parentVal & childVal are both present,
      // we need to return a function that returns the
      // merged result of both functions... no need to
      // check if parentVal is a function here because
      // it has to be a function to pass previous merges.
      return function mergedDataFn () {
        return mergeData(
          typeof childVal === 'function' ? childVal.call(this, this) : childVal,
          typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
        )
      }
    } else {
      return function mergedInstanceDataFn () {
        // instance merge
        var instanceData = typeof childVal === 'function'
          ? childVal.call(vm, vm)
          : childVal;
        var defaultData = typeof parentVal === 'function'
          ? parentVal.call(vm, vm)
          : parentVal;
        if (instanceData) {
          return mergeData(instanceData, defaultData)
        } else {
          return defaultData
        }
      }
    }
  }

  strats.data = function (
    parentVal,
    childVal,
    vm
  ) {
    if (!vm) {
      if (childVal && typeof childVal !== 'function') {
        warn(
          'The "data" option should be a function ' +
          'that returns a per-instance value in component ' +
          'definitions.',
          vm
        );

        return parentVal
      }
      return mergeDataOrFn(parentVal, childVal)
    }

    return mergeDataOrFn(parentVal, childVal, vm)
  };

  /**
   * Hooks and props are merged as arrays.
   */
  function mergeHook (
    parentVal,
    childVal
  ) {
    var res = childVal
      ? parentVal
        ? parentVal.concat(childVal)
        : Array.isArray(childVal)
          ? childVal
          : [childVal]
      : parentVal;
    return res
      ? dedupeHooks(res)
      : res
  }

  function dedupeHooks (hooks) {
    var res = [];
    for (var i = 0; i < hooks.length; i++) {
      if (res.indexOf(hooks[i]) === -1) {
        res.push(hooks[i]);
      }
    }
    return res
  }

  LIFECYCLE_HOOKS.forEach(function (hook) {
    strats[hook] = mergeHook;
  });

  /**
   * Assets
   *
   * When a vm is present (instance creation), we need to do
   * a three-way merge between constructor options, instance
   * options and parent options.
   */
  function mergeAssets (
    parentVal,
    childVal,
    vm,
    key
  ) {
    var res = Object.create(parentVal || null);
    if (childVal) {
      assertObjectType(key, childVal, vm);
      return extend(res, childVal)
    } else {
      return res
    }
  }

  ASSET_TYPES.forEach(function (type) {
    strats[type + 's'] = mergeAssets;
  });

  /**
   * Watchers.
   *
   * Watchers hashes should not overwrite one
   * another, so we merge them as arrays.
   */
  strats.watch = function (
    parentVal,
    childVal,
    vm,
    key
  ) {
    // work around Firefox's Object.prototype.watch...
    if (parentVal === nativeWatch) { parentVal = undefined; }
    if (childVal === nativeWatch) { childVal = undefined; }
    /* istanbul ignore if */
    if (!childVal) { return Object.create(parentVal || null) }
    {
      assertObjectType(key, childVal, vm);
    }
    if (!parentVal) { return childVal }
    var ret = {};
    extend(ret, parentVal);
    for (var key$1 in childVal) {
      var parent = ret[key$1];
      var child = childVal[key$1];
      if (parent && !Array.isArray(parent)) {
        parent = [parent];
      }
      ret[key$1] = parent
        ? parent.concat(child)
        : Array.isArray(child) ? child : [child];
    }
    return ret
  };

  /**
   * Other object hashes.
   */
  strats.props =
  strats.methods =
  strats.inject =
  strats.computed = function (
    parentVal,
    childVal,
    vm,
    key
  ) {
    if (childVal && "development" !== 'production') {
      assertObjectType(key, childVal, vm);
    }
    if (!parentVal) { return childVal }
    var ret = Object.create(null);
    extend(ret, parentVal);
    if (childVal) { extend(ret, childVal); }
    return ret
  };
  strats.provide = mergeDataOrFn;

  /**
   * Default strategy.
   */
  var defaultStrat = function (parentVal, childVal) {
    return childVal === undefined
      ? parentVal
      : childVal
  };

  /**
   * Validate component names
   */
  function checkComponents (options) {
    for (var key in options.components) {
      validateComponentName(key);
    }
  }

  function validateComponentName (name) {
    if (!new RegExp(("^[a-zA-Z][\\-\\.0-9_" + (unicodeRegExp.source) + "]*$")).test(name)) {
      warn(
        'Invalid component name: "' + name + '". Component names ' +
        'should conform to valid custom element name in html5 specification.'
      );
    }
    if (isBuiltInTag(name) || config.isReservedTag(name)) {
      warn(
        'Do not use built-in or reserved HTML elements as component ' +
        'id: ' + name
      );
    }
  }

  /**
   * Ensure all props option syntax are normalized into the
   * Object-based format.
   */
  function normalizeProps (options, vm) {
    var props = options.props;
    if (!props) { return }
    var res = {};
    var i, val, name;
    if (Array.isArray(props)) {
      i = props.length;
      while (i--) {
        val = props[i];
        if (typeof val === 'string') {
          name = camelize(val);
          res[name] = { type: null };
        } else {
          warn('props must be strings when using array syntax.');
        }
      }
    } else if (isPlainObject(props)) {
      for (var key in props) {
        val = props[key];
        name = camelize(key);
        res[name] = isPlainObject(val)
          ? val
          : { type: val };
      }
    } else {
      warn(
        "Invalid value for option \"props\": expected an Array or an Object, " +
        "but got " + (toRawType(props)) + ".",
        vm
      );
    }
    options.props = res;
  }

  /**
   * Normalize all injections into Object-based format
   */
  function normalizeInject (options, vm) {
    var inject = options.inject;
    if (!inject) { return }
    var normalized = options.inject = {};
    if (Array.isArray(inject)) {
      for (var i = 0; i < inject.length; i++) {
        normalized[inject[i]] = { from: inject[i] };
      }
    } else if (isPlainObject(inject)) {
      for (var key in inject) {
        var val = inject[key];
        normalized[key] = isPlainObject(val)
          ? extend({ from: key }, val)
          : { from: val };
      }
    } else {
      warn(
        "Invalid value for option \"inject\": expected an Array or an Object, " +
        "but got " + (toRawType(inject)) + ".",
        vm
      );
    }
  }

  /**
   * Normalize raw function directives into object format.
   */
  function normalizeDirectives (options) {
    var dirs = options.directives;
    if (dirs) {
      for (var key in dirs) {
        var def$$1 = dirs[key];
        if (typeof def$$1 === 'function') {
          dirs[key] = { bind: def$$1, update: def$$1 };
        }
      }
    }
  }

  function assertObjectType (name, value, vm) {
    if (!isPlainObject(value)) {
      warn(
        "Invalid value for option \"" + name + "\": expected an Object, " +
        "but got " + (toRawType(value)) + ".",
        vm
      );
    }
  }

  /**
   * Merge two option objects into a new one.
   * Core utility used in both instantiation and inheritance.
   */
  function mergeOptions (
    parent,
    child,
    vm
  ) {
    {
      checkComponents(child);
    }

    if (typeof child === 'function') {
      child = child.options;
    }

    normalizeProps(child, vm);
    normalizeInject(child, vm);
    normalizeDirectives(child);

    // Apply extends and mixins on the child options,
    // but only if it is a raw options object that isn't
    // the result of another mergeOptions call.
    // Only merged options has the _base property.
    if (!child._base) {
      if (child.extends) {
        parent = mergeOptions(parent, child.extends, vm);
      }
      if (child.mixins) {
        for (var i = 0, l = child.mixins.length; i < l; i++) {
          parent = mergeOptions(parent, child.mixins[i], vm);
        }
      }
    }

    var options = {};
    var key;
    for (key in parent) {
      mergeField(key);
    }
    for (key in child) {
      if (!hasOwn(parent, key)) {
        mergeField(key);
      }
    }
    function mergeField (key) {
      var strat = strats[key] || defaultStrat;
      options[key] = strat(parent[key], child[key], vm, key);
    }
    return options
  }

  /**
   * Resolve an asset.
   * This function is used because child instances need access
   * to assets defined in its ancestor chain.
   */
  function resolveAsset (
    options,
    type,
    id,
    warnMissing
  ) {
    /* istanbul ignore if */
    if (typeof id !== 'string') {
      return
    }
    var assets = options[type];
    // check local registration variations first
    if (hasOwn(assets, id)) { return assets[id] }
    var camelizedId = camelize(id);
    if (hasOwn(assets, camelizedId)) { return assets[camelizedId] }
    var PascalCaseId = capitalize(camelizedId);
    if (hasOwn(assets, PascalCaseId)) { return assets[PascalCaseId] }
    // fallback to prototype chain
    var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
    if (warnMissing && !res) {
      warn(
        'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
        options
      );
    }
    return res
  }

  /*  */



  function validateProp (
    key,
    propOptions,
    propsData,
    vm
  ) {
    var prop = propOptions[key];
    var absent = !hasOwn(propsData, key);
    var value = propsData[key];
    // boolean casting
    var booleanIndex = getTypeIndex(Boolean, prop.type);
    if (booleanIndex > -1) {
      if (absent && !hasOwn(prop, 'default')) {
        value = false;
      } else if (value === '' || value === hyphenate(key)) {
        // only cast empty string / same name to boolean if
        // boolean has higher priority
        var stringIndex = getTypeIndex(String, prop.type);
        if (stringIndex < 0 || booleanIndex < stringIndex) {
          value = true;
        }
      }
    }
    // check default value
    if (value === undefined) {
      value = getPropDefaultValue(vm, prop, key);
      // since the default value is a fresh copy,
      // make sure to observe it.
      var prevShouldObserve = shouldObserve;
      toggleObserving(true);
      observe(value);
      toggleObserving(prevShouldObserve);
    }
    {
      assertProp(prop, key, value, vm, absent);
    }
    return value
  }

  /**
   * Get the default value of a prop.
   */
  function getPropDefaultValue (vm, prop, key) {
    // no default, return undefined
    if (!hasOwn(prop, 'default')) {
      return undefined
    }
    var def = prop.default;
    // warn against non-factory defaults for Object & Array
    if (isObject(def)) {
      warn(
        'Invalid default value for prop "' + key + '": ' +
        'Props with type Object/Array must use a factory function ' +
        'to return the default value.',
        vm
      );
    }
    // the raw prop value was also undefined from previous render,
    // return previous default value to avoid unnecessary watcher trigger
    if (vm && vm.$options.propsData &&
      vm.$options.propsData[key] === undefined &&
      vm._props[key] !== undefined
    ) {
      return vm._props[key]
    }
    // call factory function for non-Function types
    // a value is Function if its prototype is function even across different execution context
    return typeof def === 'function' && getType(prop.type) !== 'Function'
      ? def.call(vm)
      : def
  }

  /**
   * Assert whether a prop is valid.
   */
  function assertProp (
    prop,
    name,
    value,
    vm,
    absent
  ) {
    if (prop.required && absent) {
      warn(
        'Missing required prop: "' + name + '"',
        vm
      );
      return
    }
    if (value == null && !prop.required) {
      return
    }
    var type = prop.type;
    var valid = !type || type === true;
    var expectedTypes = [];
    if (type) {
      if (!Array.isArray(type)) {
        type = [type];
      }
      for (var i = 0; i < type.length && !valid; i++) {
        var assertedType = assertType(value, type[i], vm);
        expectedTypes.push(assertedType.expectedType || '');
        valid = assertedType.valid;
      }
    }

    var haveExpectedTypes = expectedTypes.some(function (t) { return t; });
    if (!valid && haveExpectedTypes) {
      warn(
        getInvalidTypeMessage(name, value, expectedTypes),
        vm
      );
      return
    }
    var validator = prop.validator;
    if (validator) {
      if (!validator(value)) {
        warn(
          'Invalid prop: custom validator check failed for prop "' + name + '".',
          vm
        );
      }
    }
  }

  var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol|BigInt)$/;

  function assertType (value, type, vm) {
    var valid;
    var expectedType = getType(type);
    if (simpleCheckRE.test(expectedType)) {
      var t = typeof value;
      valid = t === expectedType.toLowerCase();
      // for primitive wrapper objects
      if (!valid && t === 'object') {
        valid = value instanceof type;
      }
    } else if (expectedType === 'Object') {
      valid = isPlainObject(value);
    } else if (expectedType === 'Array') {
      valid = Array.isArray(value);
    } else {
      try {
        valid = value instanceof type;
      } catch (e) {
        warn('Invalid prop type: "' + String(type) + '" is not a constructor', vm);
        valid = false;
      }
    }
    return {
      valid: valid,
      expectedType: expectedType
    }
  }

  var functionTypeCheckRE = /^\s*function (\w+)/;

  /**
   * Use function string name to check built-in types,
   * because a simple equality check will fail when running
   * across different vms / iframes.
   */
  function getType (fn) {
    var match = fn && fn.toString().match(functionTypeCheckRE);
    return match ? match[1] : ''
  }

  function isSameType (a, b) {
    return getType(a) === getType(b)
  }

  function getTypeIndex (type, expectedTypes) {
    if (!Array.isArray(expectedTypes)) {
      return isSameType(expectedTypes, type) ? 0 : -1
    }
    for (var i = 0, len = expectedTypes.length; i < len; i++) {
      if (isSameType(expectedTypes[i], type)) {
        return i
      }
    }
    return -1
  }

  function getInvalidTypeMessage (name, value, expectedTypes) {
    var message = "Invalid prop: type check failed for prop \"" + name + "\"." +
      " Expected " + (expectedTypes.map(capitalize).join(', '));
    var expectedType = expectedTypes[0];
    var receivedType = toRawType(value);
    // check if we need to specify expected value
    if (
      expectedTypes.length === 1 &&
      isExplicable(expectedType) &&
      isExplicable(typeof value) &&
      !isBoolean(expectedType, receivedType)
    ) {
      message += " with value " + (styleValue(value, expectedType));
    }
    message += ", got " + receivedType + " ";
    // check if we need to specify received value
    if (isExplicable(receivedType)) {
      message += "with value " + (styleValue(value, receivedType)) + ".";
    }
    return message
  }

  function styleValue (value, type) {
    if (type === 'String') {
      return ("\"" + value + "\"")
    } else if (type === 'Number') {
      return ("" + (Number(value)))
    } else {
      return ("" + value)
    }
  }

  var EXPLICABLE_TYPES = ['string', 'number', 'boolean'];
  function isExplicable (value) {
    return EXPLICABLE_TYPES.some(function (elem) { return value.toLowerCase() === elem; })
  }

  function isBoolean () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return args.some(function (elem) { return elem.toLowerCase() === 'boolean'; })
  }

  /*  */

  function handleError (err, vm, info) {
    // Deactivate deps tracking while processing error handler to avoid possible infinite rendering.
    // See: https://github.com/vuejs/vuex/issues/1505
    pushTarget();
    try {
      if (vm) {
        var cur = vm;
        while ((cur = cur.$parent)) {
          var hooks = cur.$options.errorCaptured;
          if (hooks) {
            for (var i = 0; i < hooks.length; i++) {
              try {
                var capture = hooks[i].call(cur, err, vm, info) === false;
                if (capture) { return }
              } catch (e) {
                globalHandleError(e, cur, 'errorCaptured hook');
              }
            }
          }
        }
      }
      globalHandleError(err, vm, info);
    } finally {
      popTarget();
    }
  }

  function invokeWithErrorHandling (
    handler,
    context,
    args,
    vm,
    info
  ) {
    var res;
    try {
      res = args ? handler.apply(context, args) : handler.call(context);
      if (res && !res._isVue && isPromise(res) && !res._handled) {
        res.catch(function (e) { return handleError(e, vm, info + " (Promise/async)"); });
        // issue #9511
        // avoid catch triggering multiple times when nested calls
        res._handled = true;
      }
    } catch (e) {
      handleError(e, vm, info);
    }
    return res
  }

  function globalHandleError (err, vm, info) {
    if (config.errorHandler) {
      try {
        return config.errorHandler.call(null, err, vm, info)
      } catch (e) {
        // if the user intentionally throws the original error in the handler,
        // do not log it twice
        if (e !== err) {
          logError(e, null, 'config.errorHandler');
        }
      }
    }
    logError(err, vm, info);
  }

  function logError (err, vm, info) {
    {
      warn(("Error in " + info + ": \"" + (err.toString()) + "\""), vm);
    }
    /* istanbul ignore else */
    if ((inBrowser || inWeex) && typeof console !== 'undefined') {
      console.error(err);
    } else {
      throw err
    }
  }

  /*  */

  var isUsingMicroTask = false;

  var callbacks = [];
  var pending = false;

  function flushCallbacks () {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks.length = 0;
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }

  // Here we have async deferring wrappers using microtasks.
  // In 2.5 we used (macro) tasks (in combination with microtasks).
  // However, it has subtle problems when state is changed right before repaint
  // (e.g. #6813, out-in transitions).
  // Also, using (macro) tasks in event handler would cause some weird behaviors
  // that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
  // So we now use microtasks everywhere, again.
  // A major drawback of this tradeoff is that there are some scenarios
  // where microtasks have too high a priority and fire in between supposedly
  // sequential events (e.g. #4521, #6690, which have workarounds)
  // or even between bubbling of the same event (#6566).
  var timerFunc;

  // The nextTick behavior leverages the microtask queue, which can be accessed
  // via either native Promise.then or MutationObserver.
  // MutationObserver has wider support, however it is seriously bugged in
  // UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
  // completely stops working after triggering a few times... so, if native
  // Promise is available, we will use it:
  /* istanbul ignore next, $flow-disable-line */
  if (typeof Promise !== 'undefined' && isNative(Promise)) {
    var p = Promise.resolve();
    timerFunc = function () {
      p.then(flushCallbacks);
      // In problematic UIWebViews, Promise.then doesn't completely break, but
      // it can get stuck in a weird state where callbacks are pushed into the
      // microtask queue but the queue isn't being flushed, until the browser
      // needs to do some other work, e.g. handle a timer. Therefore we can
      // "force" the microtask queue to be flushed by adding an empty timer.
      if (isIOS) { setTimeout(noop); }
    };
    isUsingMicroTask = true;
  } else if (!isIE && typeof MutationObserver !== 'undefined' && (
    isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]'
  )) {
    // Use MutationObserver where native Promise is not available,
    // e.g. PhantomJS, iOS7, Android 4.4
    // (#6466 MutationObserver is unreliable in IE11)
    var counter = 1;
    var observer = new MutationObserver(flushCallbacks);
    var textNode = document.createTextNode(String(counter));
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function () {
      counter = (counter + 1) % 2;
      textNode.data = String(counter);
    };
    isUsingMicroTask = true;
  } else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
    // Fallback to setImmediate.
    // Technically it leverages the (macro) task queue,
    // but it is still a better choice than setTimeout.
    timerFunc = function () {
      setImmediate(flushCallbacks);
    };
  } else {
    // Fallback to setTimeout.
    timerFunc = function () {
      setTimeout(flushCallbacks, 0);
    };
  }

  function nextTick (cb, ctx) {
    var _resolve;
    callbacks.push(function () {
      if (cb) {
        try {
          cb.call(ctx);
        } catch (e) {
          handleError(e, ctx, 'nextTick');
        }
      } else if (_resolve) {
        _resolve(ctx);
      }
    });
    if (!pending) {
      pending = true;
      timerFunc();
    }
    // $flow-disable-line
    if (!cb && typeof Promise !== 'undefined') {
      return new Promise(function (resolve) {
        _resolve = resolve;
      })
    }
  }

  /*  */

  var mark;
  var measure;

  {
    var perf = inBrowser && window.performance;
    /* istanbul ignore if */
    if (
      perf &&
      perf.mark &&
      perf.measure &&
      perf.clearMarks &&
      perf.clearMeasures
    ) {
      mark = function (tag) { return perf.mark(tag); };
      measure = function (name, startTag, endTag) {
        perf.measure(name, startTag, endTag);
        perf.clearMarks(startTag);
        perf.clearMarks(endTag);
        // perf.clearMeasures(name)
      };
    }
  }

  /* not type checking this file because flow doesn't play well with Proxy */

  var initProxy;

  {
    var allowedGlobals = makeMap(
      'Infinity,undefined,NaN,isFinite,isNaN,' +
      'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
      'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,' +
      'require' // for Webpack/Browserify
    );

    var warnNonPresent = function (target, key) {
      warn(
        "Property or method \"" + key + "\" is not defined on the instance but " +
        'referenced during render. Make sure that this property is reactive, ' +
        'either in the data option, or for class-based components, by ' +
        'initializing the property. ' +
        'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
        target
      );
    };

    var warnReservedPrefix = function (target, key) {
      warn(
        "Property \"" + key + "\" must be accessed with \"$data." + key + "\" because " +
        'properties starting with "$" or "_" are not proxied in the Vue instance to ' +
        'prevent conflicts with Vue internals. ' +
        'See: https://vuejs.org/v2/api/#data',
        target
      );
    };

    var hasProxy =
      typeof Proxy !== 'undefined' && isNative(Proxy);

    if (hasProxy) {
      var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact');
      config.keyCodes = new Proxy(config.keyCodes, {
        set: function set (target, key, value) {
          if (isBuiltInModifier(key)) {
            warn(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
            return false
          } else {
            target[key] = value;
            return true
          }
        }
      });
    }

    var hasHandler = {
      has: function has (target, key) {
        var has = key in target;
        var isAllowed = allowedGlobals(key) ||
          (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data));
        if (!has && !isAllowed) {
          if (key in target.$data) { warnReservedPrefix(target, key); }
          else { warnNonPresent(target, key); }
        }
        return has || !isAllowed
      }
    };

    var getHandler = {
      get: function get (target, key) {
        if (typeof key === 'string' && !(key in target)) {
          if (key in target.$data) { warnReservedPrefix(target, key); }
          else { warnNonPresent(target, key); }
        }
        return target[key]
      }
    };

    initProxy = function initProxy (vm) {
      if (hasProxy) {
        // determine which proxy handler to use
        var options = vm.$options;
        var handlers = options.render && options.render._withStripped
          ? getHandler
          : hasHandler;
        vm._renderProxy = new Proxy(vm, handlers);
      } else {
        vm._renderProxy = vm;
      }
    };
  }

  /*  */

  var seenObjects = new _Set();

  /**
   * Recursively traverse an object to evoke all converted
   * getters, so that every nested property inside the object
   * is collected as a "deep" dependency.
   */
  function traverse (val) {
    _traverse(val, seenObjects);
    seenObjects.clear();
  }

  function _traverse (val, seen) {
    var i, keys;
    var isA = Array.isArray(val);
    if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
      return
    }
    if (val.__ob__) {
      var depId = val.__ob__.dep.id;
      if (seen.has(depId)) {
        return
      }
      seen.add(depId);
    }
    if (isA) {
      i = val.length;
      while (i--) { _traverse(val[i], seen); }
    } else {
      keys = Object.keys(val);
      i = keys.length;
      while (i--) { _traverse(val[keys[i]], seen); }
    }
  }

  /*  */

  var normalizeEvent = cached(function (name) {
    var passive = name.charAt(0) === '&';
    name = passive ? name.slice(1) : name;
    var once$$1 = name.charAt(0) === '~'; // Prefixed last, checked first
    name = once$$1 ? name.slice(1) : name;
    var capture = name.charAt(0) === '!';
    name = capture ? name.slice(1) : name;
    return {
      name: name,
      once: once$$1,
      capture: capture,
      passive: passive
    }
  });

  function createFnInvoker (fns, vm) {
    function invoker () {
      var arguments$1 = arguments;

      var fns = invoker.fns;
      if (Array.isArray(fns)) {
        var cloned = fns.slice();
        for (var i = 0; i < cloned.length; i++) {
          invokeWithErrorHandling(cloned[i], null, arguments$1, vm, "v-on handler");
        }
      } else {
        // return handler return value for single handlers
        return invokeWithErrorHandling(fns, null, arguments, vm, "v-on handler")
      }
    }
    invoker.fns = fns;
    return invoker
  }

  function updateListeners (
    on,
    oldOn,
    add,
    remove$$1,
    createOnceHandler,
    vm
  ) {
    var name, def$$1, cur, old, event;
    for (name in on) {
      def$$1 = cur = on[name];
      old = oldOn[name];
      event = normalizeEvent(name);
      if (isUndef(cur)) {
        warn(
          "Invalid handler for event \"" + (event.name) + "\": got " + String(cur),
          vm
        );
      } else if (isUndef(old)) {
        if (isUndef(cur.fns)) {
          cur = on[name] = createFnInvoker(cur, vm);
        }
        if (isTrue(event.once)) {
          cur = on[name] = createOnceHandler(event.name, cur, event.capture);
        }
        add(event.name, cur, event.capture, event.passive, event.params);
      } else if (cur !== old) {
        old.fns = cur;
        on[name] = old;
      }
    }
    for (name in oldOn) {
      if (isUndef(on[name])) {
        event = normalizeEvent(name);
        remove$$1(event.name, oldOn[name], event.capture);
      }
    }
  }

  /*  */

  function mergeVNodeHook (def, hookKey, hook) {
    if (def instanceof VNode) {
      def = def.data.hook || (def.data.hook = {});
    }
    var invoker;
    var oldHook = def[hookKey];

    function wrappedHook () {
      hook.apply(this, arguments);
      // important: remove merged hook to ensure it's called only once
      // and prevent memory leak
      remove(invoker.fns, wrappedHook);
    }

    if (isUndef(oldHook)) {
      // no existing hook
      invoker = createFnInvoker([wrappedHook]);
    } else {
      /* istanbul ignore if */
      if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
        // already a merged invoker
        invoker = oldHook;
        invoker.fns.push(wrappedHook);
      } else {
        // existing plain hook
        invoker = createFnInvoker([oldHook, wrappedHook]);
      }
    }

    invoker.merged = true;
    def[hookKey] = invoker;
  }

  /*  */

  function extractPropsFromVNodeData (
    data,
    Ctor,
    tag
  ) {
    // we are only extracting raw values here.
    // validation and default values are handled in the child
    // component itself.
    var propOptions = Ctor.options.props;
    if (isUndef(propOptions)) {
      return
    }
    var res = {};
    var attrs = data.attrs;
    var props = data.props;
    if (isDef(attrs) || isDef(props)) {
      for (var key in propOptions) {
        var altKey = hyphenate(key);
        {
          var keyInLowerCase = key.toLowerCase();
          if (
            key !== keyInLowerCase &&
            attrs && hasOwn(attrs, keyInLowerCase)
          ) {
            tip(
              "Prop \"" + keyInLowerCase + "\" is passed to component " +
              (formatComponentName(tag || Ctor)) + ", but the declared prop name is" +
              " \"" + key + "\". " +
              "Note that HTML attributes are case-insensitive and camelCased " +
              "props need to use their kebab-case equivalents when using in-DOM " +
              "templates. You should probably use \"" + altKey + "\" instead of \"" + key + "\"."
            );
          }
        }
        checkProp(res, props, key, altKey, true) ||
        checkProp(res, attrs, key, altKey, false);
      }
    }
    return res
  }

  function checkProp (
    res,
    hash,
    key,
    altKey,
    preserve
  ) {
    if (isDef(hash)) {
      if (hasOwn(hash, key)) {
        res[key] = hash[key];
        if (!preserve) {
          delete hash[key];
        }
        return true
      } else if (hasOwn(hash, altKey)) {
        res[key] = hash[altKey];
        if (!preserve) {
          delete hash[altKey];
        }
        return true
      }
    }
    return false
  }

  /*  */

  // The template compiler attempts to minimize the need for normalization by
  // statically analyzing the template at compile time.
  //
  // For plain HTML markup, normalization can be completely skipped because the
  // generated render function is guaranteed to return Array<VNode>. There are
  // two cases where extra normalization is needed:

  // 1. When the children contains components - because a functional component
  // may return an Array instead of a single root. In this case, just a simple
  // normalization is needed - if any child is an Array, we flatten the whole
  // thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
  // because functional components already normalize their own children.
  function simpleNormalizeChildren (children) {
    for (var i = 0; i < children.length; i++) {
      if (Array.isArray(children[i])) {
        return Array.prototype.concat.apply([], children)
      }
    }
    return children
  }

  // 2. When the children contains constructs that always generated nested Arrays,
  // e.g. <template>, <slot>, v-for, or when the children is provided by user
  // with hand-written render functions / JSX. In such cases a full normalization
  // is needed to cater to all possible types of children values.
  function normalizeChildren (children) {
    return isPrimitive(children)
      ? [createTextVNode(children)]
      : Array.isArray(children)
        ? normalizeArrayChildren(children)
        : undefined
  }

  function isTextNode (node) {
    return isDef(node) && isDef(node.text) && isFalse(node.isComment)
  }

  function normalizeArrayChildren (children, nestedIndex) {
    var res = [];
    var i, c, lastIndex, last;
    for (i = 0; i < children.length; i++) {
      c = children[i];
      if (isUndef(c) || typeof c === 'boolean') { continue }
      lastIndex = res.length - 1;
      last = res[lastIndex];
      //  nested
      if (Array.isArray(c)) {
        if (c.length > 0) {
          c = normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i));
          // merge adjacent text nodes
          if (isTextNode(c[0]) && isTextNode(last)) {
            res[lastIndex] = createTextVNode(last.text + (c[0]).text);
            c.shift();
          }
          res.push.apply(res, c);
        }
      } else if (isPrimitive(c)) {
        if (isTextNode(last)) {
          // merge adjacent text nodes
          // this is necessary for SSR hydration because text nodes are
          // essentially merged when rendered to HTML strings
          res[lastIndex] = createTextVNode(last.text + c);
        } else if (c !== '') {
          // convert primitive to vnode
          res.push(createTextVNode(c));
        }
      } else {
        if (isTextNode(c) && isTextNode(last)) {
          // merge adjacent text nodes
          res[lastIndex] = createTextVNode(last.text + c.text);
        } else {
          // default key for nested array children (likely generated by v-for)
          if (isTrue(children._isVList) &&
            isDef(c.tag) &&
            isUndef(c.key) &&
            isDef(nestedIndex)) {
            c.key = "__vlist" + nestedIndex + "_" + i + "__";
          }
          res.push(c);
        }
      }
    }
    return res
  }

  /*  */

  function initProvide (vm) {
    var provide = vm.$options.provide;
    if (provide) {
      vm._provided = typeof provide === 'function'
        ? provide.call(vm)
        : provide;
    }
  }

  function initInjections (vm) {
    var result = resolveInject(vm.$options.inject, vm);
    if (result) {
      toggleObserving(false);
      Object.keys(result).forEach(function (key) {
        /* istanbul ignore else */
        {
          defineReactive$$1(vm, key, result[key], function () {
            warn(
              "Avoid mutating an injected value directly since the changes will be " +
              "overwritten whenever the provided component re-renders. " +
              "injection being mutated: \"" + key + "\"",
              vm
            );
          });
        }
      });
      toggleObserving(true);
    }
  }

  function resolveInject (inject, vm) {
    if (inject) {
      // inject is :any because flow is not smart enough to figure out cached
      var result = Object.create(null);
      var keys = hasSymbol
        ? Reflect.ownKeys(inject)
        : Object.keys(inject);

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        // #6574 in case the inject object is observed...
        if (key === '__ob__') { continue }
        var provideKey = inject[key].from;
        var source = vm;
        while (source) {
          if (source._provided && hasOwn(source._provided, provideKey)) {
            result[key] = source._provided[provideKey];
            break
          }
          source = source.$parent;
        }
        if (!source) {
          if ('default' in inject[key]) {
            var provideDefault = inject[key].default;
            result[key] = typeof provideDefault === 'function'
              ? provideDefault.call(vm)
              : provideDefault;
          } else {
            warn(("Injection \"" + key + "\" not found"), vm);
          }
        }
      }
      return result
    }
  }

  /*  */



  /**
   * Runtime helper for resolving raw children VNodes into a slot object.
   */
  function resolveSlots (
    children,
    context
  ) {
    if (!children || !children.length) {
      return {}
    }
    var slots = {};
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      var data = child.data;
      // remove slot attribute if the node is resolved as a Vue slot node
      if (data && data.attrs && data.attrs.slot) {
        delete data.attrs.slot;
      }
      // named slots should only be respected if the vnode was rendered in the
      // same context.
      if ((child.context === context || child.fnContext === context) &&
        data && data.slot != null
      ) {
        var name = data.slot;
        var slot = (slots[name] || (slots[name] = []));
        if (child.tag === 'template') {
          slot.push.apply(slot, child.children || []);
        } else {
          slot.push(child);
        }
      } else {
        (slots.default || (slots.default = [])).push(child);
      }
    }
    // ignore slots that contains only whitespace
    for (var name$1 in slots) {
      if (slots[name$1].every(isWhitespace)) {
        delete slots[name$1];
      }
    }
    return slots
  }

  function isWhitespace (node) {
    return (node.isComment && !node.asyncFactory) || node.text === ' '
  }

  /*  */

  function isAsyncPlaceholder (node) {
    return node.isComment && node.asyncFactory
  }

  /*  */

  function normalizeScopedSlots (
    slots,
    normalSlots,
    prevSlots
  ) {
    var res;
    var hasNormalSlots = Object.keys(normalSlots).length > 0;
    var isStable = slots ? !!slots.$stable : !hasNormalSlots;
    var key = slots && slots.$key;
    if (!slots) {
      res = {};
    } else if (slots._normalized) {
      // fast path 1: child component re-render only, parent did not change
      return slots._normalized
    } else if (
      isStable &&
      prevSlots &&
      prevSlots !== emptyObject &&
      key === prevSlots.$key &&
      !hasNormalSlots &&
      !prevSlots.$hasNormal
    ) {
      // fast path 2: stable scoped slots w/ no normal slots to proxy,
      // only need to normalize once
      return prevSlots
    } else {
      res = {};
      for (var key$1 in slots) {
        if (slots[key$1] && key$1[0] !== '$') {
          res[key$1] = normalizeScopedSlot(normalSlots, key$1, slots[key$1]);
        }
      }
    }
    // expose normal slots on scopedSlots
    for (var key$2 in normalSlots) {
      if (!(key$2 in res)) {
        res[key$2] = proxyNormalSlot(normalSlots, key$2);
      }
    }
    // avoriaz seems to mock a non-extensible $scopedSlots object
    // and when that is passed down this would cause an error
    if (slots && Object.isExtensible(slots)) {
      (slots)._normalized = res;
    }
    def(res, '$stable', isStable);
    def(res, '$key', key);
    def(res, '$hasNormal', hasNormalSlots);
    return res
  }

  function normalizeScopedSlot(normalSlots, key, fn) {
    var normalized = function () {
      var res = arguments.length ? fn.apply(null, arguments) : fn({});
      res = res && typeof res === 'object' && !Array.isArray(res)
        ? [res] // single vnode
        : normalizeChildren(res);
      var vnode = res && res[0];
      return res && (
        !vnode ||
        (res.length === 1 && vnode.isComment && !isAsyncPlaceholder(vnode)) // #9658, #10391
      ) ? undefined
        : res
    };
    // this is a slot using the new v-slot syntax without scope. although it is
    // compiled as a scoped slot, render fn users would expect it to be present
    // on this.$slots because the usage is semantically a normal slot.
    if (fn.proxy) {
      Object.defineProperty(normalSlots, key, {
        get: normalized,
        enumerable: true,
        configurable: true
      });
    }
    return normalized
  }

  function proxyNormalSlot(slots, key) {
    return function () { return slots[key]; }
  }

  /*  */

  /**
   * Runtime helper for rendering v-for lists.
   */
  function renderList (
    val,
    render
  ) {
    var ret, i, l, keys, key;
    if (Array.isArray(val) || typeof val === 'string') {
      ret = new Array(val.length);
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i);
      }
    } else if (typeof val === 'number') {
      ret = new Array(val);
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i);
      }
    } else if (isObject(val)) {
      if (hasSymbol && val[Symbol.iterator]) {
        ret = [];
        var iterator = val[Symbol.iterator]();
        var result = iterator.next();
        while (!result.done) {
          ret.push(render(result.value, ret.length));
          result = iterator.next();
        }
      } else {
        keys = Object.keys(val);
        ret = new Array(keys.length);
        for (i = 0, l = keys.length; i < l; i++) {
          key = keys[i];
          ret[i] = render(val[key], key, i);
        }
      }
    }
    if (!isDef(ret)) {
      ret = [];
    }
    (ret)._isVList = true;
    return ret
  }

  /*  */

  /**
   * Runtime helper for rendering <slot>
   */
  function renderSlot (
    name,
    fallbackRender,
    props,
    bindObject
  ) {
    var scopedSlotFn = this.$scopedSlots[name];
    var nodes;
    if (scopedSlotFn) {
      // scoped slot
      props = props || {};
      if (bindObject) {
        if (!isObject(bindObject)) {
          warn('slot v-bind without argument expects an Object', this);
        }
        props = extend(extend({}, bindObject), props);
      }
      nodes =
        scopedSlotFn(props) ||
        (typeof fallbackRender === 'function' ? fallbackRender() : fallbackRender);
    } else {
      nodes =
        this.$slots[name] ||
        (typeof fallbackRender === 'function' ? fallbackRender() : fallbackRender);
    }

    var target = props && props.slot;
    if (target) {
      return this.$createElement('template', { slot: target }, nodes)
    } else {
      return nodes
    }
  }

  /*  */

  /**
   * Runtime helper for resolving filters
   */
  function resolveFilter (id) {
    return resolveAsset(this.$options, 'filters', id, true) || identity
  }

  /*  */

  function isKeyNotMatch (expect, actual) {
    if (Array.isArray(expect)) {
      return expect.indexOf(actual) === -1
    } else {
      return expect !== actual
    }
  }

  /**
   * Runtime helper for checking keyCodes from config.
   * exposed as Vue.prototype._k
   * passing in eventKeyName as last argument separately for backwards compat
   */
  function checkKeyCodes (
    eventKeyCode,
    key,
    builtInKeyCode,
    eventKeyName,
    builtInKeyName
  ) {
    var mappedKeyCode = config.keyCodes[key] || builtInKeyCode;
    if (builtInKeyName && eventKeyName && !config.keyCodes[key]) {
      return isKeyNotMatch(builtInKeyName, eventKeyName)
    } else if (mappedKeyCode) {
      return isKeyNotMatch(mappedKeyCode, eventKeyCode)
    } else if (eventKeyName) {
      return hyphenate(eventKeyName) !== key
    }
    return eventKeyCode === undefined
  }

  /*  */

  /**
   * Runtime helper for merging v-bind="object" into a VNode's data.
   */
  function bindObjectProps (
    data,
    tag,
    value,
    asProp,
    isSync
  ) {
    if (value) {
      if (!isObject(value)) {
        warn(
          'v-bind without argument expects an Object or Array value',
          this
        );
      } else {
        if (Array.isArray(value)) {
          value = toObject(value);
        }
        var hash;
        var loop = function ( key ) {
          if (
            key === 'class' ||
            key === 'style' ||
            isReservedAttribute(key)
          ) {
            hash = data;
          } else {
            var type = data.attrs && data.attrs.type;
            hash = asProp || config.mustUseProp(tag, type, key)
              ? data.domProps || (data.domProps = {})
              : data.attrs || (data.attrs = {});
          }
          var camelizedKey = camelize(key);
          var hyphenatedKey = hyphenate(key);
          if (!(camelizedKey in hash) && !(hyphenatedKey in hash)) {
            hash[key] = value[key];

            if (isSync) {
              var on = data.on || (data.on = {});
              on[("update:" + key)] = function ($event) {
                value[key] = $event;
              };
            }
          }
        };

        for (var key in value) loop( key );
      }
    }
    return data
  }

  /*  */

  /**
   * Runtime helper for rendering static trees.
   */
  function renderStatic (
    index,
    isInFor
  ) {
    var cached = this._staticTrees || (this._staticTrees = []);
    var tree = cached[index];
    // if has already-rendered static tree and not inside v-for,
    // we can reuse the same tree.
    if (tree && !isInFor) {
      return tree
    }
    // otherwise, render a fresh tree.
    tree = cached[index] = this.$options.staticRenderFns[index].call(
      this._renderProxy,
      null,
      this // for render fns generated for functional component templates
    );
    markStatic(tree, ("__static__" + index), false);
    return tree
  }

  /**
   * Runtime helper for v-once.
   * Effectively it means marking the node as static with a unique key.
   */
  function markOnce (
    tree,
    index,
    key
  ) {
    markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
    return tree
  }

  function markStatic (
    tree,
    key,
    isOnce
  ) {
    if (Array.isArray(tree)) {
      for (var i = 0; i < tree.length; i++) {
        if (tree[i] && typeof tree[i] !== 'string') {
          markStaticNode(tree[i], (key + "_" + i), isOnce);
        }
      }
    } else {
      markStaticNode(tree, key, isOnce);
    }
  }

  function markStaticNode (node, key, isOnce) {
    node.isStatic = true;
    node.key = key;
    node.isOnce = isOnce;
  }

  /*  */

  function bindObjectListeners (data, value) {
    if (value) {
      if (!isPlainObject(value)) {
        warn(
          'v-on without argument expects an Object value',
          this
        );
      } else {
        var on = data.on = data.on ? extend({}, data.on) : {};
        for (var key in value) {
          var existing = on[key];
          var ours = value[key];
          on[key] = existing ? [].concat(existing, ours) : ours;
        }
      }
    }
    return data
  }

  /*  */

  function resolveScopedSlots (
    fns, // see flow/vnode
    res,
    // the following are added in 2.6
    hasDynamicKeys,
    contentHashKey
  ) {
    res = res || { $stable: !hasDynamicKeys };
    for (var i = 0; i < fns.length; i++) {
      var slot = fns[i];
      if (Array.isArray(slot)) {
        resolveScopedSlots(slot, res, hasDynamicKeys);
      } else if (slot) {
        // marker for reverse proxying v-slot without scope on this.$slots
        if (slot.proxy) {
          slot.fn.proxy = true;
        }
        res[slot.key] = slot.fn;
      }
    }
    if (contentHashKey) {
      (res).$key = contentHashKey;
    }
    return res
  }

  /*  */

  function bindDynamicKeys (baseObj, values) {
    for (var i = 0; i < values.length; i += 2) {
      var key = values[i];
      if (typeof key === 'string' && key) {
        baseObj[values[i]] = values[i + 1];
      } else if (key !== '' && key !== null) {
        // null is a special value for explicitly removing a binding
        warn(
          ("Invalid value for dynamic directive argument (expected string or null): " + key),
          this
        );
      }
    }
    return baseObj
  }

  // helper to dynamically append modifier runtime markers to event names.
  // ensure only append when value is already string, otherwise it will be cast
  // to string and cause the type check to miss.
  function prependModifier (value, symbol) {
    return typeof value === 'string' ? symbol + value : value
  }

  /*  */

  function installRenderHelpers (target) {
    target._o = markOnce;
    target._n = toNumber;
    target._s = toString;
    target._l = renderList;
    target._t = renderSlot;
    target._q = looseEqual;
    target._i = looseIndexOf;
    target._m = renderStatic;
    target._f = resolveFilter;
    target._k = checkKeyCodes;
    target._b = bindObjectProps;
    target._v = createTextVNode;
    target._e = createEmptyVNode;
    target._u = resolveScopedSlots;
    target._g = bindObjectListeners;
    target._d = bindDynamicKeys;
    target._p = prependModifier;
  }

  /*  */

  function FunctionalRenderContext (
    data,
    props,
    children,
    parent,
    Ctor
  ) {
    var this$1 = this;

    var options = Ctor.options;
    // ensure the createElement function in functional components
    // gets a unique context - this is necessary for correct named slot check
    var contextVm;
    if (hasOwn(parent, '_uid')) {
      contextVm = Object.create(parent);
      // $flow-disable-line
      contextVm._original = parent;
    } else {
      // the context vm passed in is a functional context as well.
      // in this case we want to make sure we are able to get a hold to the
      // real context instance.
      contextVm = parent;
      // $flow-disable-line
      parent = parent._original;
    }
    var isCompiled = isTrue(options._compiled);
    var needNormalization = !isCompiled;

    this.data = data;
    this.props = props;
    this.children = children;
    this.parent = parent;
    this.listeners = data.on || emptyObject;
    this.injections = resolveInject(options.inject, parent);
    this.slots = function () {
      if (!this$1.$slots) {
        normalizeScopedSlots(
          data.scopedSlots,
          this$1.$slots = resolveSlots(children, parent)
        );
      }
      return this$1.$slots
    };

    Object.defineProperty(this, 'scopedSlots', ({
      enumerable: true,
      get: function get () {
        return normalizeScopedSlots(data.scopedSlots, this.slots())
      }
    }));

    // support for compiled functional template
    if (isCompiled) {
      // exposing $options for renderStatic()
      this.$options = options;
      // pre-resolve slots for renderSlot()
      this.$slots = this.slots();
      this.$scopedSlots = normalizeScopedSlots(data.scopedSlots, this.$slots);
    }

    if (options._scopeId) {
      this._c = function (a, b, c, d) {
        var vnode = createElement(contextVm, a, b, c, d, needNormalization);
        if (vnode && !Array.isArray(vnode)) {
          vnode.fnScopeId = options._scopeId;
          vnode.fnContext = parent;
        }
        return vnode
      };
    } else {
      this._c = function (a, b, c, d) { return createElement(contextVm, a, b, c, d, needNormalization); };
    }
  }

  installRenderHelpers(FunctionalRenderContext.prototype);

  function createFunctionalComponent (
    Ctor,
    propsData,
    data,
    contextVm,
    children
  ) {
    var options = Ctor.options;
    var props = {};
    var propOptions = options.props;
    if (isDef(propOptions)) {
      for (var key in propOptions) {
        props[key] = validateProp(key, propOptions, propsData || emptyObject);
      }
    } else {
      if (isDef(data.attrs)) { mergeProps(props, data.attrs); }
      if (isDef(data.props)) { mergeProps(props, data.props); }
    }

    var renderContext = new FunctionalRenderContext(
      data,
      props,
      children,
      contextVm,
      Ctor
    );

    var vnode = options.render.call(null, renderContext._c, renderContext);

    if (vnode instanceof VNode) {
      return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options, renderContext)
    } else if (Array.isArray(vnode)) {
      var vnodes = normalizeChildren(vnode) || [];
      var res = new Array(vnodes.length);
      for (var i = 0; i < vnodes.length; i++) {
        res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options, renderContext);
      }
      return res
    }
  }

  function cloneAndMarkFunctionalResult (vnode, data, contextVm, options, renderContext) {
    // #7817 clone node before setting fnContext, otherwise if the node is reused
    // (e.g. it was from a cached normal slot) the fnContext causes named slots
    // that should not be matched to match.
    var clone = cloneVNode(vnode);
    clone.fnContext = contextVm;
    clone.fnOptions = options;
    {
      (clone.devtoolsMeta = clone.devtoolsMeta || {}).renderContext = renderContext;
    }
    if (data.slot) {
      (clone.data || (clone.data = {})).slot = data.slot;
    }
    return clone
  }

  function mergeProps (to, from) {
    for (var key in from) {
      to[camelize(key)] = from[key];
    }
  }

  /*  */

  /*  */

  /*  */

  /*  */

  // inline hooks to be invoked on component VNodes during patch
  var componentVNodeHooks = {
    init: function init (vnode, hydrating) {
      if (
        vnode.componentInstance &&
        !vnode.componentInstance._isDestroyed &&
        vnode.data.keepAlive
      ) {
        // kept-alive components, treat as a patch
        var mountedNode = vnode; // work around flow
        componentVNodeHooks.prepatch(mountedNode, mountedNode);
      } else {
        var child = vnode.componentInstance = createComponentInstanceForVnode(
          vnode,
          activeInstance
        );
        child.$mount(hydrating ? vnode.elm : undefined, hydrating);
      }
    },

    prepatch: function prepatch (oldVnode, vnode) {
      var options = vnode.componentOptions;
      var child = vnode.componentInstance = oldVnode.componentInstance;
      updateChildComponent(
        child,
        options.propsData, // updated props
        options.listeners, // updated listeners
        vnode, // new parent vnode
        options.children // new children
      );
    },

    insert: function insert (vnode) {
      var context = vnode.context;
      var componentInstance = vnode.componentInstance;
      if (!componentInstance._isMounted) {
        componentInstance._isMounted = true;
        callHook(componentInstance, 'mounted');
      }
      if (vnode.data.keepAlive) {
        if (context._isMounted) {
          // vue-router#1212
          // During updates, a kept-alive component's child components may
          // change, so directly walking the tree here may call activated hooks
          // on incorrect children. Instead we push them into a queue which will
          // be processed after the whole patch process ended.
          queueActivatedComponent(componentInstance);
        } else {
          activateChildComponent(componentInstance, true /* direct */);
        }
      }
    },

    destroy: function destroy (vnode) {
      var componentInstance = vnode.componentInstance;
      if (!componentInstance._isDestroyed) {
        if (!vnode.data.keepAlive) {
          componentInstance.$destroy();
        } else {
          deactivateChildComponent(componentInstance, true /* direct */);
        }
      }
    }
  };

  var hooksToMerge = Object.keys(componentVNodeHooks);

  function createComponent (
    Ctor,
    data,
    context,
    children,
    tag
  ) {
    if (isUndef(Ctor)) {
      return
    }

    var baseCtor = context.$options._base;

    // plain options object: turn it into a constructor
    if (isObject(Ctor)) {
      Ctor = baseCtor.extend(Ctor);
    }

    // if at this stage it's not a constructor or an async component factory,
    // reject.
    if (typeof Ctor !== 'function') {
      {
        warn(("Invalid Component definition: " + (String(Ctor))), context);
      }
      return
    }

    // async component
    var asyncFactory;
    if (isUndef(Ctor.cid)) {
      asyncFactory = Ctor;
      Ctor = resolveAsyncComponent(asyncFactory, baseCtor);
      if (Ctor === undefined) {
        // return a placeholder node for async component, which is rendered
        // as a comment node but preserves all the raw information for the node.
        // the information will be used for async server-rendering and hydration.
        return createAsyncPlaceholder(
          asyncFactory,
          data,
          context,
          children,
          tag
        )
      }
    }

    data = data || {};

    // resolve constructor options in case global mixins are applied after
    // component constructor creation
    resolveConstructorOptions(Ctor);

    // transform component v-model data into props & events
    if (isDef(data.model)) {
      transformModel(Ctor.options, data);
    }

    // extract props
    var propsData = extractPropsFromVNodeData(data, Ctor, tag);

    // functional component
    if (isTrue(Ctor.options.functional)) {
      return createFunctionalComponent(Ctor, propsData, data, context, children)
    }

    // extract listeners, since these needs to be treated as
    // child component listeners instead of DOM listeners
    var listeners = data.on;
    // replace with listeners with .native modifier
    // so it gets processed during parent component patch.
    data.on = data.nativeOn;

    if (isTrue(Ctor.options.abstract)) {
      // abstract components do not keep anything
      // other than props & listeners & slot

      // work around flow
      var slot = data.slot;
      data = {};
      if (slot) {
        data.slot = slot;
      }
    }

    // install component management hooks onto the placeholder node
    installComponentHooks(data);

    // return a placeholder vnode
    var name = Ctor.options.name || tag;
    var vnode = new VNode(
      ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
      data, undefined, undefined, undefined, context,
      { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children },
      asyncFactory
    );

    return vnode
  }

  function createComponentInstanceForVnode (
    // we know it's MountedComponentVNode but flow doesn't
    vnode,
    // activeInstance in lifecycle state
    parent
  ) {
    var options = {
      _isComponent: true,
      _parentVnode: vnode,
      parent: parent
    };
    // check inline-template render functions
    var inlineTemplate = vnode.data.inlineTemplate;
    if (isDef(inlineTemplate)) {
      options.render = inlineTemplate.render;
      options.staticRenderFns = inlineTemplate.staticRenderFns;
    }
    return new vnode.componentOptions.Ctor(options)
  }

  function installComponentHooks (data) {
    var hooks = data.hook || (data.hook = {});
    for (var i = 0; i < hooksToMerge.length; i++) {
      var key = hooksToMerge[i];
      var existing = hooks[key];
      var toMerge = componentVNodeHooks[key];
      if (existing !== toMerge && !(existing && existing._merged)) {
        hooks[key] = existing ? mergeHook$1(toMerge, existing) : toMerge;
      }
    }
  }

  function mergeHook$1 (f1, f2) {
    var merged = function (a, b) {
      // flow complains about extra args which is why we use any
      f1(a, b);
      f2(a, b);
    };
    merged._merged = true;
    return merged
  }

  // transform component v-model info (value and callback) into
  // prop and event handler respectively.
  function transformModel (options, data) {
    var prop = (options.model && options.model.prop) || 'value';
    var event = (options.model && options.model.event) || 'input'
    ;(data.attrs || (data.attrs = {}))[prop] = data.model.value;
    var on = data.on || (data.on = {});
    var existing = on[event];
    var callback = data.model.callback;
    if (isDef(existing)) {
      if (
        Array.isArray(existing)
          ? existing.indexOf(callback) === -1
          : existing !== callback
      ) {
        on[event] = [callback].concat(existing);
      }
    } else {
      on[event] = callback;
    }
  }

  /*  */

  var SIMPLE_NORMALIZE = 1;
  var ALWAYS_NORMALIZE = 2;

  // wrapper function for providing a more flexible interface
  // without getting yelled at by flow
  function createElement (
    context,
    tag,
    data,
    children,
    normalizationType,
    alwaysNormalize
  ) {
    if (Array.isArray(data) || isPrimitive(data)) {
      normalizationType = children;
      children = data;
      data = undefined;
    }
    if (isTrue(alwaysNormalize)) {
      normalizationType = ALWAYS_NORMALIZE;
    }
    return _createElement(context, tag, data, children, normalizationType)
  }

  function _createElement (
    context,
    tag,
    data,
    children,
    normalizationType
  ) {
    if (isDef(data) && isDef((data).__ob__)) {
      warn(
        "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
        'Always create fresh vnode data objects in each render!',
        context
      );
      return createEmptyVNode()
    }
    // object syntax in v-bind
    if (isDef(data) && isDef(data.is)) {
      tag = data.is;
    }
    if (!tag) {
      // in case of component :is set to falsy value
      return createEmptyVNode()
    }
    // warn against non-primitive key
    if (isDef(data) && isDef(data.key) && !isPrimitive(data.key)
    ) {
      {
        warn(
          'Avoid using non-primitive value as key, ' +
          'use string/number value instead.',
          context
        );
      }
    }
    // support single function children as default scoped slot
    if (Array.isArray(children) &&
      typeof children[0] === 'function'
    ) {
      data = data || {};
      data.scopedSlots = { default: children[0] };
      children.length = 0;
    }
    if (normalizationType === ALWAYS_NORMALIZE) {
      children = normalizeChildren(children);
    } else if (normalizationType === SIMPLE_NORMALIZE) {
      children = simpleNormalizeChildren(children);
    }
    var vnode, ns;
    if (typeof tag === 'string') {
      var Ctor;
      ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag);
      if (config.isReservedTag(tag)) {
        // platform built-in elements
        if (isDef(data) && isDef(data.nativeOn) && data.tag !== 'component') {
          warn(
            ("The .native modifier for v-on is only valid on components but it was used on <" + tag + ">."),
            context
          );
        }
        vnode = new VNode(
          config.parsePlatformTagName(tag), data, children,
          undefined, undefined, context
        );
      } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
        // component
        vnode = createComponent(Ctor, data, context, children, tag);
      } else {
        // unknown or unlisted namespaced elements
        // check at runtime because it may get assigned a namespace when its
        // parent normalizes children
        vnode = new VNode(
          tag, data, children,
          undefined, undefined, context
        );
      }
    } else {
      // direct component options / constructor
      vnode = createComponent(tag, data, context, children);
    }
    if (Array.isArray(vnode)) {
      return vnode
    } else if (isDef(vnode)) {
      if (isDef(ns)) { applyNS(vnode, ns); }
      if (isDef(data)) { registerDeepBindings(data); }
      return vnode
    } else {
      return createEmptyVNode()
    }
  }

  function applyNS (vnode, ns, force) {
    vnode.ns = ns;
    if (vnode.tag === 'foreignObject') {
      // use default namespace inside foreignObject
      ns = undefined;
      force = true;
    }
    if (isDef(vnode.children)) {
      for (var i = 0, l = vnode.children.length; i < l; i++) {
        var child = vnode.children[i];
        if (isDef(child.tag) && (
          isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
          applyNS(child, ns, force);
        }
      }
    }
  }

  // ref #5318
  // necessary to ensure parent re-render when deep bindings like :style and
  // :class are used on slot nodes
  function registerDeepBindings (data) {
    if (isObject(data.style)) {
      traverse(data.style);
    }
    if (isObject(data.class)) {
      traverse(data.class);
    }
  }

  /*  */

  function initRender (vm) {
    vm._vnode = null; // the root of the child tree
    vm._staticTrees = null; // v-once cached trees
    var options = vm.$options;
    var parentVnode = vm.$vnode = options._parentVnode; // the placeholder node in parent tree
    var renderContext = parentVnode && parentVnode.context;
    vm.$slots = resolveSlots(options._renderChildren, renderContext);
    vm.$scopedSlots = emptyObject;
    // bind the createElement fn to this instance
    // so that we get proper render context inside it.
    // args order: tag, data, children, normalizationType, alwaysNormalize
    // internal version is used by render functions compiled from templates
    vm._c = function (a, b, c, d) { return createElement(vm, a, b, c, d, false); };
    // normalization is always applied for the public version, used in
    // user-written render functions.
    vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); };

    // $attrs & $listeners are exposed for easier HOC creation.
    // they need to be reactive so that HOCs using them are always updated
    var parentData = parentVnode && parentVnode.data;

    /* istanbul ignore else */
    {
      defineReactive$$1(vm, '$attrs', parentData && parentData.attrs || emptyObject, function () {
        !isUpdatingChildComponent && warn("$attrs is readonly.", vm);
      }, true);
      defineReactive$$1(vm, '$listeners', options._parentListeners || emptyObject, function () {
        !isUpdatingChildComponent && warn("$listeners is readonly.", vm);
      }, true);
    }
  }

  var currentRenderingInstance = null;

  function renderMixin (Vue) {
    // install runtime convenience helpers
    installRenderHelpers(Vue.prototype);

    Vue.prototype.$nextTick = function (fn) {
      return nextTick(fn, this)
    };

    Vue.prototype._render = function () {
      var vm = this;
      var ref = vm.$options;
      var render = ref.render;
      var _parentVnode = ref._parentVnode;

      if (_parentVnode) {
        vm.$scopedSlots = normalizeScopedSlots(
          _parentVnode.data.scopedSlots,
          vm.$slots,
          vm.$scopedSlots
        );
      }

      // set parent vnode. this allows render functions to have access
      // to the data on the placeholder node.
      vm.$vnode = _parentVnode;
      // render self
      var vnode;
      try {
        // There's no need to maintain a stack because all render fns are called
        // separately from one another. Nested component's render fns are called
        // when parent component is patched.
        currentRenderingInstance = vm;
        vnode = render.call(vm._renderProxy, vm.$createElement);
      } catch (e) {
        handleError(e, vm, "render");
        // return error render result,
        // or previous vnode to prevent render error causing blank component
        /* istanbul ignore else */
        if (vm.$options.renderError) {
          try {
            vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e);
          } catch (e) {
            handleError(e, vm, "renderError");
            vnode = vm._vnode;
          }
        } else {
          vnode = vm._vnode;
        }
      } finally {
        currentRenderingInstance = null;
      }
      // if the returned array contains only a single node, allow it
      if (Array.isArray(vnode) && vnode.length === 1) {
        vnode = vnode[0];
      }
      // return empty vnode in case the render function errored out
      if (!(vnode instanceof VNode)) {
        if (Array.isArray(vnode)) {
          warn(
            'Multiple root nodes returned from render function. Render function ' +
            'should return a single root node.',
            vm
          );
        }
        vnode = createEmptyVNode();
      }
      // set parent
      vnode.parent = _parentVnode;
      return vnode
    };
  }

  /*  */

  function ensureCtor (comp, base) {
    if (
      comp.__esModule ||
      (hasSymbol && comp[Symbol.toStringTag] === 'Module')
    ) {
      comp = comp.default;
    }
    return isObject(comp)
      ? base.extend(comp)
      : comp
  }

  function createAsyncPlaceholder (
    factory,
    data,
    context,
    children,
    tag
  ) {
    var node = createEmptyVNode();
    node.asyncFactory = factory;
    node.asyncMeta = { data: data, context: context, children: children, tag: tag };
    return node
  }

  function resolveAsyncComponent (
    factory,
    baseCtor
  ) {
    if (isTrue(factory.error) && isDef(factory.errorComp)) {
      return factory.errorComp
    }

    if (isDef(factory.resolved)) {
      return factory.resolved
    }

    var owner = currentRenderingInstance;
    if (owner && isDef(factory.owners) && factory.owners.indexOf(owner) === -1) {
      // already pending
      factory.owners.push(owner);
    }

    if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
      return factory.loadingComp
    }

    if (owner && !isDef(factory.owners)) {
      var owners = factory.owners = [owner];
      var sync = true;
      var timerLoading = null;
      var timerTimeout = null

      ;(owner).$on('hook:destroyed', function () { return remove(owners, owner); });

      var forceRender = function (renderCompleted) {
        for (var i = 0, l = owners.length; i < l; i++) {
          (owners[i]).$forceUpdate();
        }

        if (renderCompleted) {
          owners.length = 0;
          if (timerLoading !== null) {
            clearTimeout(timerLoading);
            timerLoading = null;
          }
          if (timerTimeout !== null) {
            clearTimeout(timerTimeout);
            timerTimeout = null;
          }
        }
      };

      var resolve = once(function (res) {
        // cache resolved
        factory.resolved = ensureCtor(res, baseCtor);
        // invoke callbacks only if this is not a synchronous resolve
        // (async resolves are shimmed as synchronous during SSR)
        if (!sync) {
          forceRender(true);
        } else {
          owners.length = 0;
        }
      });

      var reject = once(function (reason) {
        warn(
          "Failed to resolve async component: " + (String(factory)) +
          (reason ? ("\nReason: " + reason) : '')
        );
        if (isDef(factory.errorComp)) {
          factory.error = true;
          forceRender(true);
        }
      });

      var res = factory(resolve, reject);

      if (isObject(res)) {
        if (isPromise(res)) {
          // () => Promise
          if (isUndef(factory.resolved)) {
            res.then(resolve, reject);
          }
        } else if (isPromise(res.component)) {
          res.component.then(resolve, reject);

          if (isDef(res.error)) {
            factory.errorComp = ensureCtor(res.error, baseCtor);
          }

          if (isDef(res.loading)) {
            factory.loadingComp = ensureCtor(res.loading, baseCtor);
            if (res.delay === 0) {
              factory.loading = true;
            } else {
              timerLoading = setTimeout(function () {
                timerLoading = null;
                if (isUndef(factory.resolved) && isUndef(factory.error)) {
                  factory.loading = true;
                  forceRender(false);
                }
              }, res.delay || 200);
            }
          }

          if (isDef(res.timeout)) {
            timerTimeout = setTimeout(function () {
              timerTimeout = null;
              if (isUndef(factory.resolved)) {
                reject(
                  "timeout (" + (res.timeout) + "ms)"
                );
              }
            }, res.timeout);
          }
        }
      }

      sync = false;
      // return in case resolved synchronously
      return factory.loading
        ? factory.loadingComp
        : factory.resolved
    }
  }

  /*  */

  function getFirstComponentChild (children) {
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; i++) {
        var c = children[i];
        if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
          return c
        }
      }
    }
  }

  /*  */

  /*  */

  function initEvents (vm) {
    vm._events = Object.create(null);
    vm._hasHookEvent = false;
    // init parent attached events
    var listeners = vm.$options._parentListeners;
    if (listeners) {
      updateComponentListeners(vm, listeners);
    }
  }

  var target;

  function add (event, fn) {
    target.$on(event, fn);
  }

  function remove$1 (event, fn) {
    target.$off(event, fn);
  }

  function createOnceHandler (event, fn) {
    var _target = target;
    return function onceHandler () {
      var res = fn.apply(null, arguments);
      if (res !== null) {
        _target.$off(event, onceHandler);
      }
    }
  }

  function updateComponentListeners (
    vm,
    listeners,
    oldListeners
  ) {
    target = vm;
    updateListeners(listeners, oldListeners || {}, add, remove$1, createOnceHandler, vm);
    target = undefined;
  }

  function eventsMixin (Vue) {
    var hookRE = /^hook:/;
    Vue.prototype.$on = function (event, fn) {
      var vm = this;
      if (Array.isArray(event)) {
        for (var i = 0, l = event.length; i < l; i++) {
          vm.$on(event[i], fn);
        }
      } else {
        (vm._events[event] || (vm._events[event] = [])).push(fn);
        // optimize hook:event cost by using a boolean flag marked at registration
        // instead of a hash lookup
        if (hookRE.test(event)) {
          vm._hasHookEvent = true;
        }
      }
      return vm
    };

    Vue.prototype.$once = function (event, fn) {
      var vm = this;
      function on () {
        vm.$off(event, on);
        fn.apply(vm, arguments);
      }
      on.fn = fn;
      vm.$on(event, on);
      return vm
    };

    Vue.prototype.$off = function (event, fn) {
      var vm = this;
      // all
      if (!arguments.length) {
        vm._events = Object.create(null);
        return vm
      }
      // array of events
      if (Array.isArray(event)) {
        for (var i$1 = 0, l = event.length; i$1 < l; i$1++) {
          vm.$off(event[i$1], fn);
        }
        return vm
      }
      // specific event
      var cbs = vm._events[event];
      if (!cbs) {
        return vm
      }
      if (!fn) {
        vm._events[event] = null;
        return vm
      }
      // specific handler
      var cb;
      var i = cbs.length;
      while (i--) {
        cb = cbs[i];
        if (cb === fn || cb.fn === fn) {
          cbs.splice(i, 1);
          break
        }
      }
      return vm
    };

    Vue.prototype.$emit = function (event) {
      var vm = this;
      {
        var lowerCaseEvent = event.toLowerCase();
        if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
          tip(
            "Event \"" + lowerCaseEvent + "\" is emitted in component " +
            (formatComponentName(vm)) + " but the handler is registered for \"" + event + "\". " +
            "Note that HTML attributes are case-insensitive and you cannot use " +
            "v-on to listen to camelCase events when using in-DOM templates. " +
            "You should probably use \"" + (hyphenate(event)) + "\" instead of \"" + event + "\"."
          );
        }
      }
      var cbs = vm._events[event];
      if (cbs) {
        cbs = cbs.length > 1 ? toArray(cbs) : cbs;
        var args = toArray(arguments, 1);
        var info = "event handler for \"" + event + "\"";
        for (var i = 0, l = cbs.length; i < l; i++) {
          invokeWithErrorHandling(cbs[i], vm, args, vm, info);
        }
      }
      return vm
    };
  }

  /*  */

  var activeInstance = null;
  var isUpdatingChildComponent = false;

  function setActiveInstance(vm) {
    var prevActiveInstance = activeInstance;
    activeInstance = vm;
    return function () {
      activeInstance = prevActiveInstance;
    }
  }

  function initLifecycle (vm) {
    var options = vm.$options;

    // locate first non-abstract parent
    var parent = options.parent;
    if (parent && !options.abstract) {
      while (parent.$options.abstract && parent.$parent) {
        parent = parent.$parent;
      }
      parent.$children.push(vm);
    }

    vm.$parent = parent;
    vm.$root = parent ? parent.$root : vm;

    vm.$children = [];
    vm.$refs = {};

    vm._watcher = null;
    vm._inactive = null;
    vm._directInactive = false;
    vm._isMounted = false;
    vm._isDestroyed = false;
    vm._isBeingDestroyed = false;
  }

  function lifecycleMixin (Vue) {
    Vue.prototype._update = function (vnode, hydrating) {
      var vm = this;
      var prevEl = vm.$el;
      var prevVnode = vm._vnode;
      var restoreActiveInstance = setActiveInstance(vm);
      vm._vnode = vnode;
      // Vue.prototype.__patch__ is injected in entry points
      // based on the rendering backend used.
      if (!prevVnode) {
        // initial render
        vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
      } else {
        // updates
        vm.$el = vm.__patch__(prevVnode, vnode);
      }
      restoreActiveInstance();
      // update __vue__ reference
      if (prevEl) {
        prevEl.__vue__ = null;
      }
      if (vm.$el) {
        vm.$el.__vue__ = vm;
      }
      // if parent is an HOC, update its $el as well
      if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
        vm.$parent.$el = vm.$el;
      }
      // updated hook is called by the scheduler to ensure that children are
      // updated in a parent's updated hook.
    };

    Vue.prototype.$forceUpdate = function () {
      var vm = this;
      if (vm._watcher) {
        vm._watcher.update();
      }
    };

    Vue.prototype.$destroy = function () {
      var vm = this;
      if (vm._isBeingDestroyed) {
        return
      }
      callHook(vm, 'beforeDestroy');
      vm._isBeingDestroyed = true;
      // remove self from parent
      var parent = vm.$parent;
      if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
        remove(parent.$children, vm);
      }
      // teardown watchers
      if (vm._watcher) {
        vm._watcher.teardown();
      }
      var i = vm._watchers.length;
      while (i--) {
        vm._watchers[i].teardown();
      }
      // remove reference from data ob
      // frozen object may not have observer.
      if (vm._data.__ob__) {
        vm._data.__ob__.vmCount--;
      }
      // call the last hook...
      vm._isDestroyed = true;
      // invoke destroy hooks on current rendered tree
      vm.__patch__(vm._vnode, null);
      // fire destroyed hook
      callHook(vm, 'destroyed');
      // turn off all instance listeners.
      vm.$off();
      // remove __vue__ reference
      if (vm.$el) {
        vm.$el.__vue__ = null;
      }
      // release circular reference (#6759)
      if (vm.$vnode) {
        vm.$vnode.parent = null;
      }
    };
  }

  function mountComponent (
    vm,
    el,
    hydrating
  ) {
    vm.$el = el;
    if (!vm.$options.render) {
      vm.$options.render = createEmptyVNode;
      {
        /* istanbul ignore if */
        if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
          vm.$options.el || el) {
          warn(
            'You are using the runtime-only build of Vue where the template ' +
            'compiler is not available. Either pre-compile the templates into ' +
            'render functions, or use the compiler-included build.',
            vm
          );
        } else {
          warn(
            'Failed to mount component: template or render function not defined.',
            vm
          );
        }
      }
    }
    callHook(vm, 'beforeMount');

    var updateComponent;
    /* istanbul ignore if */
    if (config.performance && mark) {
      updateComponent = function () {
        var name = vm._name;
        var id = vm._uid;
        var startTag = "vue-perf-start:" + id;
        var endTag = "vue-perf-end:" + id;

        mark(startTag);
        var vnode = vm._render();
        mark(endTag);
        measure(("vue " + name + " render"), startTag, endTag);

        mark(startTag);
        vm._update(vnode, hydrating);
        mark(endTag);
        measure(("vue " + name + " patch"), startTag, endTag);
      };
    } else {
      updateComponent = function () {
        vm._update(vm._render(), hydrating);
      };
    }

    // we set this to vm._watcher inside the watcher's constructor
    // since the watcher's initial patch may call $forceUpdate (e.g. inside child
    // component's mounted hook), which relies on vm._watcher being already defined
    new Watcher(vm, updateComponent, noop, {
      before: function before () {
        if (vm._isMounted && !vm._isDestroyed) {
          callHook(vm, 'beforeUpdate');
        }
      }
    }, true /* isRenderWatcher */);
    hydrating = false;

    // manually mounted instance, call mounted on self
    // mounted is called for render-created child components in its inserted hook
    if (vm.$vnode == null) {
      vm._isMounted = true;
      callHook(vm, 'mounted');
    }
    return vm
  }

  function updateChildComponent (
    vm,
    propsData,
    listeners,
    parentVnode,
    renderChildren
  ) {
    {
      isUpdatingChildComponent = true;
    }

    // determine whether component has slot children
    // we need to do this before overwriting $options._renderChildren.

    // check if there are dynamic scopedSlots (hand-written or compiled but with
    // dynamic slot names). Static scoped slots compiled from template has the
    // "$stable" marker.
    var newScopedSlots = parentVnode.data.scopedSlots;
    var oldScopedSlots = vm.$scopedSlots;
    var hasDynamicScopedSlot = !!(
      (newScopedSlots && !newScopedSlots.$stable) ||
      (oldScopedSlots !== emptyObject && !oldScopedSlots.$stable) ||
      (newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key) ||
      (!newScopedSlots && vm.$scopedSlots.$key)
    );

    // Any static slot children from the parent may have changed during parent's
    // update. Dynamic scoped slots may also have changed. In such cases, a forced
    // update is necessary to ensure correctness.
    var needsForceUpdate = !!(
      renderChildren ||               // has new static slots
      vm.$options._renderChildren ||  // has old static slots
      hasDynamicScopedSlot
    );

    vm.$options._parentVnode = parentVnode;
    vm.$vnode = parentVnode; // update vm's placeholder node without re-render

    if (vm._vnode) { // update child tree's parent
      vm._vnode.parent = parentVnode;
    }
    vm.$options._renderChildren = renderChildren;

    // update $attrs and $listeners hash
    // these are also reactive so they may trigger child update if the child
    // used them during render
    vm.$attrs = parentVnode.data.attrs || emptyObject;
    vm.$listeners = listeners || emptyObject;

    // update props
    if (propsData && vm.$options.props) {
      toggleObserving(false);
      var props = vm._props;
      var propKeys = vm.$options._propKeys || [];
      for (var i = 0; i < propKeys.length; i++) {
        var key = propKeys[i];
        var propOptions = vm.$options.props; // wtf flow?
        props[key] = validateProp(key, propOptions, propsData, vm);
      }
      toggleObserving(true);
      // keep a copy of raw propsData
      vm.$options.propsData = propsData;
    }

    // update listeners
    listeners = listeners || emptyObject;
    var oldListeners = vm.$options._parentListeners;
    vm.$options._parentListeners = listeners;
    updateComponentListeners(vm, listeners, oldListeners);

    // resolve slots + force update if has children
    if (needsForceUpdate) {
      vm.$slots = resolveSlots(renderChildren, parentVnode.context);
      vm.$forceUpdate();
    }

    {
      isUpdatingChildComponent = false;
    }
  }

  function isInInactiveTree (vm) {
    while (vm && (vm = vm.$parent)) {
      if (vm._inactive) { return true }
    }
    return false
  }

  function activateChildComponent (vm, direct) {
    if (direct) {
      vm._directInactive = false;
      if (isInInactiveTree(vm)) {
        return
      }
    } else if (vm._directInactive) {
      return
    }
    if (vm._inactive || vm._inactive === null) {
      vm._inactive = false;
      for (var i = 0; i < vm.$children.length; i++) {
        activateChildComponent(vm.$children[i]);
      }
      callHook(vm, 'activated');
    }
  }

  function deactivateChildComponent (vm, direct) {
    if (direct) {
      vm._directInactive = true;
      if (isInInactiveTree(vm)) {
        return
      }
    }
    if (!vm._inactive) {
      vm._inactive = true;
      for (var i = 0; i < vm.$children.length; i++) {
        deactivateChildComponent(vm.$children[i]);
      }
      callHook(vm, 'deactivated');
    }
  }

  function callHook (vm, hook) {
    // #7573 disable dep collection when invoking lifecycle hooks
    pushTarget();
    var handlers = vm.$options[hook];
    var info = hook + " hook";
    if (handlers) {
      for (var i = 0, j = handlers.length; i < j; i++) {
        invokeWithErrorHandling(handlers[i], vm, null, vm, info);
      }
    }
    if (vm._hasHookEvent) {
      vm.$emit('hook:' + hook);
    }
    popTarget();
  }

  /*  */

  var MAX_UPDATE_COUNT = 100;

  var queue = [];
  var activatedChildren = [];
  var has = {};
  var circular = {};
  var waiting = false;
  var flushing = false;
  var index = 0;

  /**
   * Reset the scheduler's state.
   */
  function resetSchedulerState () {
    index = queue.length = activatedChildren.length = 0;
    has = {};
    {
      circular = {};
    }
    waiting = flushing = false;
  }

  // Async edge case #6566 requires saving the timestamp when event listeners are
  // attached. However, calling performance.now() has a perf overhead especially
  // if the page has thousands of event listeners. Instead, we take a timestamp
  // every time the scheduler flushes and use that for all event listeners
  // attached during that flush.
  var currentFlushTimestamp = 0;

  // Async edge case fix requires storing an event listener's attach timestamp.
  var getNow = Date.now;

  // Determine what event timestamp the browser is using. Annoyingly, the
  // timestamp can either be hi-res (relative to page load) or low-res
  // (relative to UNIX epoch), so in order to compare time we have to use the
  // same timestamp type when saving the flush timestamp.
  // All IE versions use low-res event timestamps, and have problematic clock
  // implementations (#9632)
  if (inBrowser && !isIE) {
    var performance = window.performance;
    if (
      performance &&
      typeof performance.now === 'function' &&
      getNow() > document.createEvent('Event').timeStamp
    ) {
      // if the event timestamp, although evaluated AFTER the Date.now(), is
      // smaller than it, it means the event is using a hi-res timestamp,
      // and we need to use the hi-res version for event listener timestamps as
      // well.
      getNow = function () { return performance.now(); };
    }
  }

  /**
   * Flush both queues and run the watchers.
   */
  function flushSchedulerQueue () {
    currentFlushTimestamp = getNow();
    flushing = true;
    var watcher, id;

    // Sort queue before flush.
    // This ensures that:
    // 1. Components are updated from parent to child. (because parent is always
    //    created before the child)
    // 2. A component's user watchers are run before its render watcher (because
    //    user watchers are created before the render watcher)
    // 3. If a component is destroyed during a parent component's watcher run,
    //    its watchers can be skipped.
    queue.sort(function (a, b) { return a.id - b.id; });

    // do not cache length because more watchers might be pushed
    // as we run existing watchers
    for (index = 0; index < queue.length; index++) {
      watcher = queue[index];
      if (watcher.before) {
        watcher.before();
      }
      id = watcher.id;
      has[id] = null;
      watcher.run();
      // in dev build, check and stop circular updates.
      if (has[id] != null) {
        circular[id] = (circular[id] || 0) + 1;
        if (circular[id] > MAX_UPDATE_COUNT) {
          warn(
            'You may have an infinite update loop ' + (
              watcher.user
                ? ("in watcher with expression \"" + (watcher.expression) + "\"")
                : "in a component render function."
            ),
            watcher.vm
          );
          break
        }
      }
    }

    // keep copies of post queues before resetting state
    var activatedQueue = activatedChildren.slice();
    var updatedQueue = queue.slice();

    resetSchedulerState();

    // call component updated and activated hooks
    callActivatedHooks(activatedQueue);
    callUpdatedHooks(updatedQueue);

    // devtool hook
    /* istanbul ignore if */
    if (devtools && config.devtools) {
      devtools.emit('flush');
    }
  }

  function callUpdatedHooks (queue) {
    var i = queue.length;
    while (i--) {
      var watcher = queue[i];
      var vm = watcher.vm;
      if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'updated');
      }
    }
  }

  /**
   * Queue a kept-alive component that was activated during patch.
   * The queue will be processed after the entire tree has been patched.
   */
  function queueActivatedComponent (vm) {
    // setting _inactive to false here so that a render function can
    // rely on checking whether it's in an inactive tree (e.g. router-view)
    vm._inactive = false;
    activatedChildren.push(vm);
  }

  function callActivatedHooks (queue) {
    for (var i = 0; i < queue.length; i++) {
      queue[i]._inactive = true;
      activateChildComponent(queue[i], true /* true */);
    }
  }

  /**
   * Push a watcher into the watcher queue.
   * Jobs with duplicate IDs will be skipped unless it's
   * pushed when the queue is being flushed.
   */
  function queueWatcher (watcher) {
    var id = watcher.id;
    if (has[id] == null) {
      has[id] = true;
      if (!flushing) {
        queue.push(watcher);
      } else {
        // if already flushing, splice the watcher based on its id
        // if already past its id, it will be run next immediately.
        var i = queue.length - 1;
        while (i > index && queue[i].id > watcher.id) {
          i--;
        }
        queue.splice(i + 1, 0, watcher);
      }
      // queue the flush
      if (!waiting) {
        waiting = true;

        if (!config.async) {
          flushSchedulerQueue();
          return
        }
        nextTick(flushSchedulerQueue);
      }
    }
  }

  /*  */



  var uid$2 = 0;

  /**
   * A watcher parses an expression, collects dependencies,
   * and fires callback when the expression value changes.
   * This is used for both the $watch() api and directives.
   */
  var Watcher = function Watcher (
    vm,
    expOrFn,
    cb,
    options,
    isRenderWatcher
  ) {
    this.vm = vm;
    if (isRenderWatcher) {
      vm._watcher = this;
    }
    vm._watchers.push(this);
    // options
    if (options) {
      this.deep = !!options.deep;
      this.user = !!options.user;
      this.lazy = !!options.lazy;
      this.sync = !!options.sync;
      this.before = options.before;
    } else {
      this.deep = this.user = this.lazy = this.sync = false;
    }
    this.cb = cb;
    this.id = ++uid$2; // uid for batching
    this.active = true;
    this.dirty = this.lazy; // for lazy watchers
    this.deps = [];
    this.newDeps = [];
    this.depIds = new _Set();
    this.newDepIds = new _Set();
    this.expression = expOrFn.toString();
    // parse expression for getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath(expOrFn);
      if (!this.getter) {
        this.getter = noop;
        warn(
          "Failed watching path: \"" + expOrFn + "\" " +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        );
      }
    }
    this.value = this.lazy
      ? undefined
      : this.get();
  };

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  Watcher.prototype.get = function get () {
    pushTarget(this);
    var value;
    var vm = this.vm;
    try {
      value = this.getter.call(vm, vm);
    } catch (e) {
      if (this.user) {
        handleError(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value);
      }
      popTarget();
      this.cleanupDeps();
    }
    return value
  };

  /**
   * Add a dependency to this directive.
   */
  Watcher.prototype.addDep = function addDep (dep) {
    var id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  };

  /**
   * Clean up for dependency collection.
   */
  Watcher.prototype.cleanupDeps = function cleanupDeps () {
    var i = this.deps.length;
    while (i--) {
      var dep = this.deps[i];
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this);
      }
    }
    var tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0;
  };

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  Watcher.prototype.update = function update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true;
    } else if (this.sync) {
      this.run();
    } else {
      queueWatcher(this);
    }
  };

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  Watcher.prototype.run = function run () {
    if (this.active) {
      var value = this.get();
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        var oldValue = this.value;
        this.value = value;
        if (this.user) {
          var info = "callback for watcher \"" + (this.expression) + "\"";
          invokeWithErrorHandling(this.cb, this.vm, [value, oldValue], this.vm, info);
        } else {
          this.cb.call(this.vm, value, oldValue);
        }
      }
    }
  };

  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  Watcher.prototype.evaluate = function evaluate () {
    this.value = this.get();
    this.dirty = false;
  };

  /**
   * Depend on all deps collected by this watcher.
   */
  Watcher.prototype.depend = function depend () {
    var i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  };

  /**
   * Remove self from all dependencies' subscriber list.
   */
  Watcher.prototype.teardown = function teardown () {
    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this);
      }
      var i = this.deps.length;
      while (i--) {
        this.deps[i].removeSub(this);
      }
      this.active = false;
    }
  };

  /*  */

  var sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
  };

  function proxy (target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter () {
      return this[sourceKey][key]
    };
    sharedPropertyDefinition.set = function proxySetter (val) {
      this[sourceKey][key] = val;
    };
    Object.defineProperty(target, key, sharedPropertyDefinition);
  }

  function initState (vm) {
    vm._watchers = [];
    var opts = vm.$options;
    if (opts.props) { initProps(vm, opts.props); }
    if (opts.methods) { initMethods(vm, opts.methods); }
    if (opts.data) {
      initData(vm);
    } else {
      observe(vm._data = {}, true /* asRootData */);
    }
    if (opts.computed) { initComputed(vm, opts.computed); }
    if (opts.watch && opts.watch !== nativeWatch) {
      initWatch(vm, opts.watch);
    }
  }

  function initProps (vm, propsOptions) {
    var propsData = vm.$options.propsData || {};
    var props = vm._props = {};
    // cache prop keys so that future props updates can iterate using Array
    // instead of dynamic object key enumeration.
    var keys = vm.$options._propKeys = [];
    var isRoot = !vm.$parent;
    // root instance props should be converted
    if (!isRoot) {
      toggleObserving(false);
    }
    var loop = function ( key ) {
      keys.push(key);
      var value = validateProp(key, propsOptions, propsData, vm);
      /* istanbul ignore else */
      {
        var hyphenatedKey = hyphenate(key);
        if (isReservedAttribute(hyphenatedKey) ||
            config.isReservedAttr(hyphenatedKey)) {
          warn(
            ("\"" + hyphenatedKey + "\" is a reserved attribute and cannot be used as component prop."),
            vm
          );
        }
        defineReactive$$1(props, key, value, function () {
          if (!isRoot && !isUpdatingChildComponent) {
            warn(
              "Avoid mutating a prop directly since the value will be " +
              "overwritten whenever the parent component re-renders. " +
              "Instead, use a data or computed property based on the prop's " +
              "value. Prop being mutated: \"" + key + "\"",
              vm
            );
          }
        });
      }
      // static props are already proxied on the component's prototype
      // during Vue.extend(). We only need to proxy props defined at
      // instantiation here.
      if (!(key in vm)) {
        proxy(vm, "_props", key);
      }
    };

    for (var key in propsOptions) loop( key );
    toggleObserving(true);
  }

  function initData (vm) {
    var data = vm.$options.data;
    data = vm._data = typeof data === 'function'
      ? getData(data, vm)
      : data || {};
    if (!isPlainObject(data)) {
      data = {};
      warn(
        'data functions should return an object:\n' +
        'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
        vm
      );
    }
    // proxy data on instance
    var keys = Object.keys(data);
    var props = vm.$options.props;
    var methods = vm.$options.methods;
    var i = keys.length;
    while (i--) {
      var key = keys[i];
      {
        if (methods && hasOwn(methods, key)) {
          warn(
            ("Method \"" + key + "\" has already been defined as a data property."),
            vm
          );
        }
      }
      if (props && hasOwn(props, key)) {
        warn(
          "The data property \"" + key + "\" is already declared as a prop. " +
          "Use prop default value instead.",
          vm
        );
      } else if (!isReserved(key)) {
        proxy(vm, "_data", key);
      }
    }
    // observe data
    observe(data, true /* asRootData */);
  }

  function getData (data, vm) {
    // #7573 disable dep collection when invoking data getters
    pushTarget();
    try {
      return data.call(vm, vm)
    } catch (e) {
      handleError(e, vm, "data()");
      return {}
    } finally {
      popTarget();
    }
  }

  var computedWatcherOptions = { lazy: true };

  function initComputed (vm, computed) {
    // $flow-disable-line
    var watchers = vm._computedWatchers = Object.create(null);
    // computed properties are just getters during SSR
    var isSSR = isServerRendering();

    for (var key in computed) {
      var userDef = computed[key];
      var getter = typeof userDef === 'function' ? userDef : userDef.get;
      if (getter == null) {
        warn(
          ("Getter is missing for computed property \"" + key + "\"."),
          vm
        );
      }

      if (!isSSR) {
        // create internal watcher for the computed property.
        watchers[key] = new Watcher(
          vm,
          getter || noop,
          noop,
          computedWatcherOptions
        );
      }

      // component-defined computed properties are already defined on the
      // component prototype. We only need to define computed properties defined
      // at instantiation here.
      if (!(key in vm)) {
        defineComputed(vm, key, userDef);
      } else {
        if (key in vm.$data) {
          warn(("The computed property \"" + key + "\" is already defined in data."), vm);
        } else if (vm.$options.props && key in vm.$options.props) {
          warn(("The computed property \"" + key + "\" is already defined as a prop."), vm);
        } else if (vm.$options.methods && key in vm.$options.methods) {
          warn(("The computed property \"" + key + "\" is already defined as a method."), vm);
        }
      }
    }
  }

  function defineComputed (
    target,
    key,
    userDef
  ) {
    var shouldCache = !isServerRendering();
    if (typeof userDef === 'function') {
      sharedPropertyDefinition.get = shouldCache
        ? createComputedGetter(key)
        : createGetterInvoker(userDef);
      sharedPropertyDefinition.set = noop;
    } else {
      sharedPropertyDefinition.get = userDef.get
        ? shouldCache && userDef.cache !== false
          ? createComputedGetter(key)
          : createGetterInvoker(userDef.get)
        : noop;
      sharedPropertyDefinition.set = userDef.set || noop;
    }
    if (sharedPropertyDefinition.set === noop) {
      sharedPropertyDefinition.set = function () {
        warn(
          ("Computed property \"" + key + "\" was assigned to but it has no setter."),
          this
        );
      };
    }
    Object.defineProperty(target, key, sharedPropertyDefinition);
  }

  function createComputedGetter (key) {
    return function computedGetter () {
      var watcher = this._computedWatchers && this._computedWatchers[key];
      if (watcher) {
        if (watcher.dirty) {
          watcher.evaluate();
        }
        if (Dep.target) {
          watcher.depend();
        }
        return watcher.value
      }
    }
  }

  function createGetterInvoker(fn) {
    return function computedGetter () {
      return fn.call(this, this)
    }
  }

  function initMethods (vm, methods) {
    var props = vm.$options.props;
    for (var key in methods) {
      {
        if (typeof methods[key] !== 'function') {
          warn(
            "Method \"" + key + "\" has type \"" + (typeof methods[key]) + "\" in the component definition. " +
            "Did you reference the function correctly?",
            vm
          );
        }
        if (props && hasOwn(props, key)) {
          warn(
            ("Method \"" + key + "\" has already been defined as a prop."),
            vm
          );
        }
        if ((key in vm) && isReserved(key)) {
          warn(
            "Method \"" + key + "\" conflicts with an existing Vue instance method. " +
            "Avoid defining component methods that start with _ or $."
          );
        }
      }
      vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm);
    }
  }

  function initWatch (vm, watch) {
    for (var key in watch) {
      var handler = watch[key];
      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  }

  function createWatcher (
    vm,
    expOrFn,
    handler,
    options
  ) {
    if (isPlainObject(handler)) {
      options = handler;
      handler = handler.handler;
    }
    if (typeof handler === 'string') {
      handler = vm[handler];
    }
    return vm.$watch(expOrFn, handler, options)
  }

  function stateMixin (Vue) {
    // flow somehow has problems with directly declared definition object
    // when using Object.defineProperty, so we have to procedurally build up
    // the object here.
    var dataDef = {};
    dataDef.get = function () { return this._data };
    var propsDef = {};
    propsDef.get = function () { return this._props };
    {
      dataDef.set = function () {
        warn(
          'Avoid replacing instance root $data. ' +
          'Use nested data properties instead.',
          this
        );
      };
      propsDef.set = function () {
        warn("$props is readonly.", this);
      };
    }
    Object.defineProperty(Vue.prototype, '$data', dataDef);
    Object.defineProperty(Vue.prototype, '$props', propsDef);

    Vue.prototype.$set = set;
    Vue.prototype.$delete = del;

    Vue.prototype.$watch = function (
      expOrFn,
      cb,
      options
    ) {
      var vm = this;
      if (isPlainObject(cb)) {
        return createWatcher(vm, expOrFn, cb, options)
      }
      options = options || {};
      options.user = true;
      var watcher = new Watcher(vm, expOrFn, cb, options);
      if (options.immediate) {
        var info = "callback for immediate watcher \"" + (watcher.expression) + "\"";
        pushTarget();
        invokeWithErrorHandling(cb, vm, [watcher.value], vm, info);
        popTarget();
      }
      return function unwatchFn () {
        watcher.teardown();
      }
    };
  }

  /*  */

  var uid$3 = 0;

  function initMixin (Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      // a uid
      vm._uid = uid$3++;

      var startTag, endTag;
      /* istanbul ignore if */
      if (config.performance && mark) {
        startTag = "vue-perf-start:" + (vm._uid);
        endTag = "vue-perf-end:" + (vm._uid);
        mark(startTag);
      }

      // a flag to avoid this being observed
      vm._isVue = true;
      // merge options
      if (options && options._isComponent) {
        // optimize internal component instantiation
        // since dynamic options merging is pretty slow, and none of the
        // internal component options needs special treatment.
        initInternalComponent(vm, options);
      } else {
        vm.$options = mergeOptions(
          resolveConstructorOptions(vm.constructor),
          options || {},
          vm
        );
      }
      /* istanbul ignore else */
      {
        initProxy(vm);
      }
      // expose real self
      vm._self = vm;
      initLifecycle(vm);
      initEvents(vm);
      initRender(vm);
      callHook(vm, 'beforeCreate');
      initInjections(vm); // resolve injections before data/props
      initState(vm);
      initProvide(vm); // resolve provide after data/props
      callHook(vm, 'created');

      /* istanbul ignore if */
      if (config.performance && mark) {
        vm._name = formatComponentName(vm, false);
        mark(endTag);
        measure(("vue " + (vm._name) + " init"), startTag, endTag);
      }

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };
  }

  function initInternalComponent (vm, options) {
    var opts = vm.$options = Object.create(vm.constructor.options);
    // doing this because it's faster than dynamic enumeration.
    var parentVnode = options._parentVnode;
    opts.parent = options.parent;
    opts._parentVnode = parentVnode;

    var vnodeComponentOptions = parentVnode.componentOptions;
    opts.propsData = vnodeComponentOptions.propsData;
    opts._parentListeners = vnodeComponentOptions.listeners;
    opts._renderChildren = vnodeComponentOptions.children;
    opts._componentTag = vnodeComponentOptions.tag;

    if (options.render) {
      opts.render = options.render;
      opts.staticRenderFns = options.staticRenderFns;
    }
  }

  function resolveConstructorOptions (Ctor) {
    var options = Ctor.options;
    if (Ctor.super) {
      var superOptions = resolveConstructorOptions(Ctor.super);
      var cachedSuperOptions = Ctor.superOptions;
      if (superOptions !== cachedSuperOptions) {
        // super option changed,
        // need to resolve new options.
        Ctor.superOptions = superOptions;
        // check if there are any late-modified/attached options (#4976)
        var modifiedOptions = resolveModifiedOptions(Ctor);
        // update base extend options
        if (modifiedOptions) {
          extend(Ctor.extendOptions, modifiedOptions);
        }
        options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
        if (options.name) {
          options.components[options.name] = Ctor;
        }
      }
    }
    return options
  }

  function resolveModifiedOptions (Ctor) {
    var modified;
    var latest = Ctor.options;
    var sealed = Ctor.sealedOptions;
    for (var key in latest) {
      if (latest[key] !== sealed[key]) {
        if (!modified) { modified = {}; }
        modified[key] = latest[key];
      }
    }
    return modified
  }

  function Vue (options) {
    if (!(this instanceof Vue)
    ) {
      warn('Vue is a constructor and should be called with the `new` keyword');
    }
    this._init(options);
  }

  initMixin(Vue);
  stateMixin(Vue);
  eventsMixin(Vue);
  lifecycleMixin(Vue);
  renderMixin(Vue);

  /*  */

  function initUse (Vue) {
    Vue.use = function (plugin) {
      var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
      if (installedPlugins.indexOf(plugin) > -1) {
        return this
      }

      // additional parameters
      var args = toArray(arguments, 1);
      args.unshift(this);
      if (typeof plugin.install === 'function') {
        plugin.install.apply(plugin, args);
      } else if (typeof plugin === 'function') {
        plugin.apply(null, args);
      }
      installedPlugins.push(plugin);
      return this
    };
  }

  /*  */

  function initMixin$1 (Vue) {
    Vue.mixin = function (mixin) {
      this.options = mergeOptions(this.options, mixin);
      return this
    };
  }

  /*  */

  function initExtend (Vue) {
    /**
     * Each instance constructor, including Vue, has a unique
     * cid. This enables us to create wrapped "child
     * constructors" for prototypal inheritance and cache them.
     */
    Vue.cid = 0;
    var cid = 1;

    /**
     * Class inheritance
     */
    Vue.extend = function (extendOptions) {
      extendOptions = extendOptions || {};
      var Super = this;
      var SuperId = Super.cid;
      var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
      if (cachedCtors[SuperId]) {
        return cachedCtors[SuperId]
      }

      var name = extendOptions.name || Super.options.name;
      if (name) {
        validateComponentName(name);
      }

      var Sub = function VueComponent (options) {
        this._init(options);
      };
      Sub.prototype = Object.create(Super.prototype);
      Sub.prototype.constructor = Sub;
      Sub.cid = cid++;
      Sub.options = mergeOptions(
        Super.options,
        extendOptions
      );
      Sub['super'] = Super;

      // For props and computed properties, we define the proxy getters on
      // the Vue instances at extension time, on the extended prototype. This
      // avoids Object.defineProperty calls for each instance created.
      if (Sub.options.props) {
        initProps$1(Sub);
      }
      if (Sub.options.computed) {
        initComputed$1(Sub);
      }

      // allow further extension/mixin/plugin usage
      Sub.extend = Super.extend;
      Sub.mixin = Super.mixin;
      Sub.use = Super.use;

      // create asset registers, so extended classes
      // can have their private assets too.
      ASSET_TYPES.forEach(function (type) {
        Sub[type] = Super[type];
      });
      // enable recursive self-lookup
      if (name) {
        Sub.options.components[name] = Sub;
      }

      // keep a reference to the super options at extension time.
      // later at instantiation we can check if Super's options have
      // been updated.
      Sub.superOptions = Super.options;
      Sub.extendOptions = extendOptions;
      Sub.sealedOptions = extend({}, Sub.options);

      // cache constructor
      cachedCtors[SuperId] = Sub;
      return Sub
    };
  }

  function initProps$1 (Comp) {
    var props = Comp.options.props;
    for (var key in props) {
      proxy(Comp.prototype, "_props", key);
    }
  }

  function initComputed$1 (Comp) {
    var computed = Comp.options.computed;
    for (var key in computed) {
      defineComputed(Comp.prototype, key, computed[key]);
    }
  }

  /*  */

  function initAssetRegisters (Vue) {
    /**
     * Create asset registration methods.
     */
    ASSET_TYPES.forEach(function (type) {
      Vue[type] = function (
        id,
        definition
      ) {
        if (!definition) {
          return this.options[type + 's'][id]
        } else {
          /* istanbul ignore if */
          if (type === 'component') {
            validateComponentName(id);
          }
          if (type === 'component' && isPlainObject(definition)) {
            definition.name = definition.name || id;
            definition = this.options._base.extend(definition);
          }
          if (type === 'directive' && typeof definition === 'function') {
            definition = { bind: definition, update: definition };
          }
          this.options[type + 's'][id] = definition;
          return definition
        }
      };
    });
  }

  /*  */





  function getComponentName (opts) {
    return opts && (opts.Ctor.options.name || opts.tag)
  }

  function matches (pattern, name) {
    if (Array.isArray(pattern)) {
      return pattern.indexOf(name) > -1
    } else if (typeof pattern === 'string') {
      return pattern.split(',').indexOf(name) > -1
    } else if (isRegExp(pattern)) {
      return pattern.test(name)
    }
    /* istanbul ignore next */
    return false
  }

  function pruneCache (keepAliveInstance, filter) {
    var cache = keepAliveInstance.cache;
    var keys = keepAliveInstance.keys;
    var _vnode = keepAliveInstance._vnode;
    for (var key in cache) {
      var entry = cache[key];
      if (entry) {
        var name = entry.name;
        if (name && !filter(name)) {
          pruneCacheEntry(cache, key, keys, _vnode);
        }
      }
    }
  }

  function pruneCacheEntry (
    cache,
    key,
    keys,
    current
  ) {
    var entry = cache[key];
    if (entry && (!current || entry.tag !== current.tag)) {
      entry.componentInstance.$destroy();
    }
    cache[key] = null;
    remove(keys, key);
  }

  var patternTypes = [String, RegExp, Array];

  var KeepAlive = {
    name: 'keep-alive',
    abstract: true,

    props: {
      include: patternTypes,
      exclude: patternTypes,
      max: [String, Number]
    },

    methods: {
      cacheVNode: function cacheVNode() {
        var ref = this;
        var cache = ref.cache;
        var keys = ref.keys;
        var vnodeToCache = ref.vnodeToCache;
        var keyToCache = ref.keyToCache;
        if (vnodeToCache) {
          var tag = vnodeToCache.tag;
          var componentInstance = vnodeToCache.componentInstance;
          var componentOptions = vnodeToCache.componentOptions;
          cache[keyToCache] = {
            name: getComponentName(componentOptions),
            tag: tag,
            componentInstance: componentInstance,
          };
          keys.push(keyToCache);
          // prune oldest entry
          if (this.max && keys.length > parseInt(this.max)) {
            pruneCacheEntry(cache, keys[0], keys, this._vnode);
          }
          this.vnodeToCache = null;
        }
      }
    },

    created: function created () {
      this.cache = Object.create(null);
      this.keys = [];
    },

    destroyed: function destroyed () {
      for (var key in this.cache) {
        pruneCacheEntry(this.cache, key, this.keys);
      }
    },

    mounted: function mounted () {
      var this$1 = this;

      this.cacheVNode();
      this.$watch('include', function (val) {
        pruneCache(this$1, function (name) { return matches(val, name); });
      });
      this.$watch('exclude', function (val) {
        pruneCache(this$1, function (name) { return !matches(val, name); });
      });
    },

    updated: function updated () {
      this.cacheVNode();
    },

    render: function render () {
      var slot = this.$slots.default;
      var vnode = getFirstComponentChild(slot);
      var componentOptions = vnode && vnode.componentOptions;
      if (componentOptions) {
        // check pattern
        var name = getComponentName(componentOptions);
        var ref = this;
        var include = ref.include;
        var exclude = ref.exclude;
        if (
          // not included
          (include && (!name || !matches(include, name))) ||
          // excluded
          (exclude && name && matches(exclude, name))
        ) {
          return vnode
        }

        var ref$1 = this;
        var cache = ref$1.cache;
        var keys = ref$1.keys;
        var key = vnode.key == null
          // same constructor may get registered as different local components
          // so cid alone is not enough (#3269)
          ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
          : vnode.key;
        if (cache[key]) {
          vnode.componentInstance = cache[key].componentInstance;
          // make current key freshest
          remove(keys, key);
          keys.push(key);
        } else {
          // delay setting the cache until update
          this.vnodeToCache = vnode;
          this.keyToCache = key;
        }

        vnode.data.keepAlive = true;
      }
      return vnode || (slot && slot[0])
    }
  };

  var builtInComponents = {
    KeepAlive: KeepAlive
  };

  /*  */

  function initGlobalAPI (Vue) {
    // config
    var configDef = {};
    configDef.get = function () { return config; };
    {
      configDef.set = function () {
        warn(
          'Do not replace the Vue.config object, set individual fields instead.'
        );
      };
    }
    Object.defineProperty(Vue, 'config', configDef);

    // exposed util methods.
    // NOTE: these are not considered part of the public API - avoid relying on
    // them unless you are aware of the risk.
    Vue.util = {
      warn: warn,
      extend: extend,
      mergeOptions: mergeOptions,
      defineReactive: defineReactive$$1
    };

    Vue.set = set;
    Vue.delete = del;
    Vue.nextTick = nextTick;

    // 2.6 explicit observable API
    Vue.observable = function (obj) {
      observe(obj);
      return obj
    };

    Vue.options = Object.create(null);
    ASSET_TYPES.forEach(function (type) {
      Vue.options[type + 's'] = Object.create(null);
    });

    // this is used to identify the "base" constructor to extend all plain-object
    // components with in Weex's multi-instance scenarios.
    Vue.options._base = Vue;

    extend(Vue.options.components, builtInComponents);

    initUse(Vue);
    initMixin$1(Vue);
    initExtend(Vue);
    initAssetRegisters(Vue);
  }

  initGlobalAPI(Vue);

  Object.defineProperty(Vue.prototype, '$isServer', {
    get: isServerRendering
  });

  Object.defineProperty(Vue.prototype, '$ssrContext', {
    get: function get () {
      /* istanbul ignore next */
      return this.$vnode && this.$vnode.ssrContext
    }
  });

  // expose FunctionalRenderContext for ssr runtime helper installation
  Object.defineProperty(Vue, 'FunctionalRenderContext', {
    value: FunctionalRenderContext
  });

  Vue.version = '2.6.14';

  /*  */

  // these are reserved for web because they are directly compiled away
  // during template compilation
  var isReservedAttr = makeMap('style,class');

  // attributes that should be using props for binding
  var acceptValue = makeMap('input,textarea,option,select,progress');
  var mustUseProp = function (tag, type, attr) {
    return (
      (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
      (attr === 'selected' && tag === 'option') ||
      (attr === 'checked' && tag === 'input') ||
      (attr === 'muted' && tag === 'video')
    )
  };

  var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

  var isValidContentEditableValue = makeMap('events,caret,typing,plaintext-only');

  var convertEnumeratedValue = function (key, value) {
    return isFalsyAttrValue(value) || value === 'false'
      ? 'false'
      // allow arbitrary string value for contenteditable
      : key === 'contenteditable' && isValidContentEditableValue(value)
        ? value
        : 'true'
  };

  var isBooleanAttr = makeMap(
    'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
    'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
    'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
    'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
    'required,reversed,scoped,seamless,selected,sortable,' +
    'truespeed,typemustmatch,visible'
  );

  var xlinkNS = 'http://www.w3.org/1999/xlink';

  var isXlink = function (name) {
    return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
  };

  var getXlinkProp = function (name) {
    return isXlink(name) ? name.slice(6, name.length) : ''
  };

  var isFalsyAttrValue = function (val) {
    return val == null || val === false
  };

  /*  */

  function genClassForVnode (vnode) {
    var data = vnode.data;
    var parentNode = vnode;
    var childNode = vnode;
    while (isDef(childNode.componentInstance)) {
      childNode = childNode.componentInstance._vnode;
      if (childNode && childNode.data) {
        data = mergeClassData(childNode.data, data);
      }
    }
    while (isDef(parentNode = parentNode.parent)) {
      if (parentNode && parentNode.data) {
        data = mergeClassData(data, parentNode.data);
      }
    }
    return renderClass(data.staticClass, data.class)
  }

  function mergeClassData (child, parent) {
    return {
      staticClass: concat(child.staticClass, parent.staticClass),
      class: isDef(child.class)
        ? [child.class, parent.class]
        : parent.class
    }
  }

  function renderClass (
    staticClass,
    dynamicClass
  ) {
    if (isDef(staticClass) || isDef(dynamicClass)) {
      return concat(staticClass, stringifyClass(dynamicClass))
    }
    /* istanbul ignore next */
    return ''
  }

  function concat (a, b) {
    return a ? b ? (a + ' ' + b) : a : (b || '')
  }

  function stringifyClass (value) {
    if (Array.isArray(value)) {
      return stringifyArray(value)
    }
    if (isObject(value)) {
      return stringifyObject(value)
    }
    if (typeof value === 'string') {
      return value
    }
    /* istanbul ignore next */
    return ''
  }

  function stringifyArray (value) {
    var res = '';
    var stringified;
    for (var i = 0, l = value.length; i < l; i++) {
      if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
        if (res) { res += ' '; }
        res += stringified;
      }
    }
    return res
  }

  function stringifyObject (value) {
    var res = '';
    for (var key in value) {
      if (value[key]) {
        if (res) { res += ' '; }
        res += key;
      }
    }
    return res
  }

  /*  */

  var namespaceMap = {
    svg: 'http://www.w3.org/2000/svg',
    math: 'http://www.w3.org/1998/Math/MathML'
  };

  var isHTMLTag = makeMap(
    'html,body,base,head,link,meta,style,title,' +
    'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
    'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
    'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
    's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
    'embed,object,param,source,canvas,script,noscript,del,ins,' +
    'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
    'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
    'output,progress,select,textarea,' +
    'details,dialog,menu,menuitem,summary,' +
    'content,element,shadow,template,blockquote,iframe,tfoot'
  );

  // this map is intentionally selective, only covering SVG elements that may
  // contain child elements.
  var isSVG = makeMap(
    'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
    'foreignobject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
    'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
    true
  );

  var isPreTag = function (tag) { return tag === 'pre'; };

  var isReservedTag = function (tag) {
    return isHTMLTag(tag) || isSVG(tag)
  };

  function getTagNamespace (tag) {
    if (isSVG(tag)) {
      return 'svg'
    }
    // basic support for MathML
    // note it doesn't support other MathML elements being component roots
    if (tag === 'math') {
      return 'math'
    }
  }

  var unknownElementCache = Object.create(null);
  function isUnknownElement (tag) {
    /* istanbul ignore if */
    if (!inBrowser) {
      return true
    }
    if (isReservedTag(tag)) {
      return false
    }
    tag = tag.toLowerCase();
    /* istanbul ignore if */
    if (unknownElementCache[tag] != null) {
      return unknownElementCache[tag]
    }
    var el = document.createElement(tag);
    if (tag.indexOf('-') > -1) {
      // http://stackoverflow.com/a/28210364/1070244
      return (unknownElementCache[tag] = (
        el.constructor === window.HTMLUnknownElement ||
        el.constructor === window.HTMLElement
      ))
    } else {
      return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
    }
  }

  var isTextInputType = makeMap('text,number,password,search,email,tel,url');

  /*  */

  /**
   * Query an element selector if it's not an element already.
   */
  function query (el) {
    if (typeof el === 'string') {
      var selected = document.querySelector(el);
      if (!selected) {
        warn(
          'Cannot find element: ' + el
        );
        return document.createElement('div')
      }
      return selected
    } else {
      return el
    }
  }

  /*  */

  function createElement$1 (tagName, vnode) {
    var elm = document.createElement(tagName);
    if (tagName !== 'select') {
      return elm
    }
    // false or null will remove the attribute but undefined will not
    if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
      elm.setAttribute('multiple', 'multiple');
    }
    return elm
  }

  function createElementNS (namespace, tagName) {
    return document.createElementNS(namespaceMap[namespace], tagName)
  }

  function createTextNode (text) {
    return document.createTextNode(text)
  }

  function createComment (text) {
    return document.createComment(text)
  }

  function insertBefore (parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
  }

  function removeChild (node, child) {
    node.removeChild(child);
  }

  function appendChild (node, child) {
    node.appendChild(child);
  }

  function parentNode (node) {
    return node.parentNode
  }

  function nextSibling (node) {
    return node.nextSibling
  }

  function tagName (node) {
    return node.tagName
  }

  function setTextContent (node, text) {
    node.textContent = text;
  }

  function setStyleScope (node, scopeId) {
    node.setAttribute(scopeId, '');
  }

  var nodeOps = /*#__PURE__*/Object.freeze({
    createElement: createElement$1,
    createElementNS: createElementNS,
    createTextNode: createTextNode,
    createComment: createComment,
    insertBefore: insertBefore,
    removeChild: removeChild,
    appendChild: appendChild,
    parentNode: parentNode,
    nextSibling: nextSibling,
    tagName: tagName,
    setTextContent: setTextContent,
    setStyleScope: setStyleScope
  });

  /*  */

  var ref = {
    create: function create (_, vnode) {
      registerRef(vnode);
    },
    update: function update (oldVnode, vnode) {
      if (oldVnode.data.ref !== vnode.data.ref) {
        registerRef(oldVnode, true);
        registerRef(vnode);
      }
    },
    destroy: function destroy (vnode) {
      registerRef(vnode, true);
    }
  };

  function registerRef (vnode, isRemoval) {
    var key = vnode.data.ref;
    if (!isDef(key)) { return }

    var vm = vnode.context;
    var ref = vnode.componentInstance || vnode.elm;
    var refs = vm.$refs;
    if (isRemoval) {
      if (Array.isArray(refs[key])) {
        remove(refs[key], ref);
      } else if (refs[key] === ref) {
        refs[key] = undefined;
      }
    } else {
      if (vnode.data.refInFor) {
        if (!Array.isArray(refs[key])) {
          refs[key] = [ref];
        } else if (refs[key].indexOf(ref) < 0) {
          // $flow-disable-line
          refs[key].push(ref);
        }
      } else {
        refs[key] = ref;
      }
    }
  }

  /**
   * Virtual DOM patching algorithm based on Snabbdom by
   * Simon Friis Vindum (@paldepind)
   * Licensed under the MIT License
   * https://github.com/paldepind/snabbdom/blob/master/LICENSE
   *
   * modified by Evan You (@yyx990803)
   *
   * Not type-checking this because this file is perf-critical and the cost
   * of making flow understand it is not worth it.
   */

  var emptyNode = new VNode('', {}, []);

  var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

  function sameVnode (a, b) {
    return (
      a.key === b.key &&
      a.asyncFactory === b.asyncFactory && (
        (
          a.tag === b.tag &&
          a.isComment === b.isComment &&
          isDef(a.data) === isDef(b.data) &&
          sameInputType(a, b)
        ) || (
          isTrue(a.isAsyncPlaceholder) &&
          isUndef(b.asyncFactory.error)
        )
      )
    )
  }

  function sameInputType (a, b) {
    if (a.tag !== 'input') { return true }
    var i;
    var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
    var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
    return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
  }

  function createKeyToOldIdx (children, beginIdx, endIdx) {
    var i, key;
    var map = {};
    for (i = beginIdx; i <= endIdx; ++i) {
      key = children[i].key;
      if (isDef(key)) { map[key] = i; }
    }
    return map
  }

  function createPatchFunction (backend) {
    var i, j;
    var cbs = {};

    var modules = backend.modules;
    var nodeOps = backend.nodeOps;

    for (i = 0; i < hooks.length; ++i) {
      cbs[hooks[i]] = [];
      for (j = 0; j < modules.length; ++j) {
        if (isDef(modules[j][hooks[i]])) {
          cbs[hooks[i]].push(modules[j][hooks[i]]);
        }
      }
    }

    function emptyNodeAt (elm) {
      return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
    }

    function createRmCb (childElm, listeners) {
      function remove$$1 () {
        if (--remove$$1.listeners === 0) {
          removeNode(childElm);
        }
      }
      remove$$1.listeners = listeners;
      return remove$$1
    }

    function removeNode (el) {
      var parent = nodeOps.parentNode(el);
      // element may have already been removed due to v-html / v-text
      if (isDef(parent)) {
        nodeOps.removeChild(parent, el);
      }
    }

    function isUnknownElement$$1 (vnode, inVPre) {
      return (
        !inVPre &&
        !vnode.ns &&
        !(
          config.ignoredElements.length &&
          config.ignoredElements.some(function (ignore) {
            return isRegExp(ignore)
              ? ignore.test(vnode.tag)
              : ignore === vnode.tag
          })
        ) &&
        config.isUnknownElement(vnode.tag)
      )
    }

    var creatingElmInVPre = 0;

    function createElm (
      vnode,
      insertedVnodeQueue,
      parentElm,
      refElm,
      nested,
      ownerArray,
      index
    ) {
      if (isDef(vnode.elm) && isDef(ownerArray)) {
        // This vnode was used in a previous render!
        // now it's used as a new node, overwriting its elm would cause
        // potential patch errors down the road when it's used as an insertion
        // reference node. Instead, we clone the node on-demand before creating
        // associated DOM element for it.
        vnode = ownerArray[index] = cloneVNode(vnode);
      }

      vnode.isRootInsert = !nested; // for transition enter check
      if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
        return
      }

      var data = vnode.data;
      var children = vnode.children;
      var tag = vnode.tag;
      if (isDef(tag)) {
        {
          if (data && data.pre) {
            creatingElmInVPre++;
          }
          if (isUnknownElement$$1(vnode, creatingElmInVPre)) {
            warn(
              'Unknown custom element: <' + tag + '> - did you ' +
              'register the component correctly? For recursive components, ' +
              'make sure to provide the "name" option.',
              vnode.context
            );
          }
        }

        vnode.elm = vnode.ns
          ? nodeOps.createElementNS(vnode.ns, tag)
          : nodeOps.createElement(tag, vnode);
        setScope(vnode);

        /* istanbul ignore if */
        {
          createChildren(vnode, children, insertedVnodeQueue);
          if (isDef(data)) {
            invokeCreateHooks(vnode, insertedVnodeQueue);
          }
          insert(parentElm, vnode.elm, refElm);
        }

        if (data && data.pre) {
          creatingElmInVPre--;
        }
      } else if (isTrue(vnode.isComment)) {
        vnode.elm = nodeOps.createComment(vnode.text);
        insert(parentElm, vnode.elm, refElm);
      } else {
        vnode.elm = nodeOps.createTextNode(vnode.text);
        insert(parentElm, vnode.elm, refElm);
      }
    }

    function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
      var i = vnode.data;
      if (isDef(i)) {
        var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
        if (isDef(i = i.hook) && isDef(i = i.init)) {
          i(vnode, false /* hydrating */);
        }
        // after calling the init hook, if the vnode is a child component
        // it should've created a child instance and mounted it. the child
        // component also has set the placeholder vnode's elm.
        // in that case we can just return the element and be done.
        if (isDef(vnode.componentInstance)) {
          initComponent(vnode, insertedVnodeQueue);
          insert(parentElm, vnode.elm, refElm);
          if (isTrue(isReactivated)) {
            reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
          }
          return true
        }
      }
    }

    function initComponent (vnode, insertedVnodeQueue) {
      if (isDef(vnode.data.pendingInsert)) {
        insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
        vnode.data.pendingInsert = null;
      }
      vnode.elm = vnode.componentInstance.$el;
      if (isPatchable(vnode)) {
        invokeCreateHooks(vnode, insertedVnodeQueue);
        setScope(vnode);
      } else {
        // empty component root.
        // skip all element-related modules except for ref (#3455)
        registerRef(vnode);
        // make sure to invoke the insert hook
        insertedVnodeQueue.push(vnode);
      }
    }

    function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
      var i;
      // hack for #4339: a reactivated component with inner transition
      // does not trigger because the inner node's created hooks are not called
      // again. It's not ideal to involve module-specific logic in here but
      // there doesn't seem to be a better way to do it.
      var innerNode = vnode;
      while (innerNode.componentInstance) {
        innerNode = innerNode.componentInstance._vnode;
        if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
          for (i = 0; i < cbs.activate.length; ++i) {
            cbs.activate[i](emptyNode, innerNode);
          }
          insertedVnodeQueue.push(innerNode);
          break
        }
      }
      // unlike a newly created component,
      // a reactivated keep-alive component doesn't insert itself
      insert(parentElm, vnode.elm, refElm);
    }

    function insert (parent, elm, ref$$1) {
      if (isDef(parent)) {
        if (isDef(ref$$1)) {
          if (nodeOps.parentNode(ref$$1) === parent) {
            nodeOps.insertBefore(parent, elm, ref$$1);
          }
        } else {
          nodeOps.appendChild(parent, elm);
        }
      }
    }

    function createChildren (vnode, children, insertedVnodeQueue) {
      if (Array.isArray(children)) {
        {
          checkDuplicateKeys(children);
        }
        for (var i = 0; i < children.length; ++i) {
          createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
        }
      } else if (isPrimitive(vnode.text)) {
        nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
      }
    }

    function isPatchable (vnode) {
      while (vnode.componentInstance) {
        vnode = vnode.componentInstance._vnode;
      }
      return isDef(vnode.tag)
    }

    function invokeCreateHooks (vnode, insertedVnodeQueue) {
      for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
        cbs.create[i$1](emptyNode, vnode);
      }
      i = vnode.data.hook; // Reuse variable
      if (isDef(i)) {
        if (isDef(i.create)) { i.create(emptyNode, vnode); }
        if (isDef(i.insert)) { insertedVnodeQueue.push(vnode); }
      }
    }

    // set scope id attribute for scoped CSS.
    // this is implemented as a special case to avoid the overhead
    // of going through the normal attribute patching process.
    function setScope (vnode) {
      var i;
      if (isDef(i = vnode.fnScopeId)) {
        nodeOps.setStyleScope(vnode.elm, i);
      } else {
        var ancestor = vnode;
        while (ancestor) {
          if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
            nodeOps.setStyleScope(vnode.elm, i);
          }
          ancestor = ancestor.parent;
        }
      }
      // for slot content they should also get the scopeId from the host instance.
      if (isDef(i = activeInstance) &&
        i !== vnode.context &&
        i !== vnode.fnContext &&
        isDef(i = i.$options._scopeId)
      ) {
        nodeOps.setStyleScope(vnode.elm, i);
      }
    }

    function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
      for (; startIdx <= endIdx; ++startIdx) {
        createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
      }
    }

    function invokeDestroyHook (vnode) {
      var i, j;
      var data = vnode.data;
      if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.destroy)) { i(vnode); }
        for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](vnode); }
      }
      if (isDef(i = vnode.children)) {
        for (j = 0; j < vnode.children.length; ++j) {
          invokeDestroyHook(vnode.children[j]);
        }
      }
    }

    function removeVnodes (vnodes, startIdx, endIdx) {
      for (; startIdx <= endIdx; ++startIdx) {
        var ch = vnodes[startIdx];
        if (isDef(ch)) {
          if (isDef(ch.tag)) {
            removeAndInvokeRemoveHook(ch);
            invokeDestroyHook(ch);
          } else { // Text node
            removeNode(ch.elm);
          }
        }
      }
    }

    function removeAndInvokeRemoveHook (vnode, rm) {
      if (isDef(rm) || isDef(vnode.data)) {
        var i;
        var listeners = cbs.remove.length + 1;
        if (isDef(rm)) {
          // we have a recursively passed down rm callback
          // increase the listeners count
          rm.listeners += listeners;
        } else {
          // directly removing
          rm = createRmCb(vnode.elm, listeners);
        }
        // recursively invoke hooks on child component root node
        if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
          removeAndInvokeRemoveHook(i, rm);
        }
        for (i = 0; i < cbs.remove.length; ++i) {
          cbs.remove[i](vnode, rm);
        }
        if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
          i(vnode, rm);
        } else {
          rm();
        }
      } else {
        removeNode(vnode.elm);
      }
    }

    function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
      var oldStartIdx = 0;
      var newStartIdx = 0;
      var oldEndIdx = oldCh.length - 1;
      var oldStartVnode = oldCh[0];
      var oldEndVnode = oldCh[oldEndIdx];
      var newEndIdx = newCh.length - 1;
      var newStartVnode = newCh[0];
      var newEndVnode = newCh[newEndIdx];
      var oldKeyToIdx, idxInOld, vnodeToMove, refElm;

      // removeOnly is a special flag used only by <transition-group>
      // to ensure removed elements stay in correct relative positions
      // during leaving transitions
      var canMove = !removeOnly;

      {
        checkDuplicateKeys(newCh);
      }

      while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (isUndef(oldStartVnode)) {
          oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
        } else if (isUndef(oldEndVnode)) {
          oldEndVnode = oldCh[--oldEndIdx];
        } else if (sameVnode(oldStartVnode, newStartVnode)) {
          patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
          oldStartVnode = oldCh[++oldStartIdx];
          newStartVnode = newCh[++newStartIdx];
        } else if (sameVnode(oldEndVnode, newEndVnode)) {
          patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
          oldEndVnode = oldCh[--oldEndIdx];
          newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
          patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
          canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
          oldStartVnode = oldCh[++oldStartIdx];
          newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
          patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
          canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
          oldEndVnode = oldCh[--oldEndIdx];
          newStartVnode = newCh[++newStartIdx];
        } else {
          if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
          idxInOld = isDef(newStartVnode.key)
            ? oldKeyToIdx[newStartVnode.key]
            : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
          if (isUndef(idxInOld)) { // New element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
          } else {
            vnodeToMove = oldCh[idxInOld];
            if (sameVnode(vnodeToMove, newStartVnode)) {
              patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
              oldCh[idxInOld] = undefined;
              canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
            } else {
              // same key but different element. treat as new element
              createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
            }
          }
          newStartVnode = newCh[++newStartIdx];
        }
      }
      if (oldStartIdx > oldEndIdx) {
        refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
        addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
      } else if (newStartIdx > newEndIdx) {
        removeVnodes(oldCh, oldStartIdx, oldEndIdx);
      }
    }

    function checkDuplicateKeys (children) {
      var seenKeys = {};
      for (var i = 0; i < children.length; i++) {
        var vnode = children[i];
        var key = vnode.key;
        if (isDef(key)) {
          if (seenKeys[key]) {
            warn(
              ("Duplicate keys detected: '" + key + "'. This may cause an update error."),
              vnode.context
            );
          } else {
            seenKeys[key] = true;
          }
        }
      }
    }

    function findIdxInOld (node, oldCh, start, end) {
      for (var i = start; i < end; i++) {
        var c = oldCh[i];
        if (isDef(c) && sameVnode(node, c)) { return i }
      }
    }

    function patchVnode (
      oldVnode,
      vnode,
      insertedVnodeQueue,
      ownerArray,
      index,
      removeOnly
    ) {
      if (oldVnode === vnode) {
        return
      }

      if (isDef(vnode.elm) && isDef(ownerArray)) {
        // clone reused vnode
        vnode = ownerArray[index] = cloneVNode(vnode);
      }

      var elm = vnode.elm = oldVnode.elm;

      if (isTrue(oldVnode.isAsyncPlaceholder)) {
        if (isDef(vnode.asyncFactory.resolved)) {
          hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
        } else {
          vnode.isAsyncPlaceholder = true;
        }
        return
      }

      // reuse element for static trees.
      // note we only do this if the vnode is cloned -
      // if the new node is not cloned it means the render functions have been
      // reset by the hot-reload-api and we need to do a proper re-render.
      if (isTrue(vnode.isStatic) &&
        isTrue(oldVnode.isStatic) &&
        vnode.key === oldVnode.key &&
        (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
      ) {
        vnode.componentInstance = oldVnode.componentInstance;
        return
      }

      var i;
      var data = vnode.data;
      if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
        i(oldVnode, vnode);
      }

      var oldCh = oldVnode.children;
      var ch = vnode.children;
      if (isDef(data) && isPatchable(vnode)) {
        for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
        if (isDef(i = data.hook) && isDef(i = i.update)) { i(oldVnode, vnode); }
      }
      if (isUndef(vnode.text)) {
        if (isDef(oldCh) && isDef(ch)) {
          if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
        } else if (isDef(ch)) {
          {
            checkDuplicateKeys(ch);
          }
          if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, ''); }
          addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
        } else if (isDef(oldCh)) {
          removeVnodes(oldCh, 0, oldCh.length - 1);
        } else if (isDef(oldVnode.text)) {
          nodeOps.setTextContent(elm, '');
        }
      } else if (oldVnode.text !== vnode.text) {
        nodeOps.setTextContent(elm, vnode.text);
      }
      if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(oldVnode, vnode); }
      }
    }

    function invokeInsertHook (vnode, queue, initial) {
      // delay insert hooks for component root nodes, invoke them after the
      // element is really inserted
      if (isTrue(initial) && isDef(vnode.parent)) {
        vnode.parent.data.pendingInsert = queue;
      } else {
        for (var i = 0; i < queue.length; ++i) {
          queue[i].data.hook.insert(queue[i]);
        }
      }
    }

    var hydrationBailed = false;
    // list of modules that can skip create hook during hydration because they
    // are already rendered on the client or has no need for initialization
    // Note: style is excluded because it relies on initial clone for future
    // deep updates (#7063).
    var isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key');

    // Note: this is a browser-only function so we can assume elms are DOM nodes.
    function hydrate (elm, vnode, insertedVnodeQueue, inVPre) {
      var i;
      var tag = vnode.tag;
      var data = vnode.data;
      var children = vnode.children;
      inVPre = inVPre || (data && data.pre);
      vnode.elm = elm;

      if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
        vnode.isAsyncPlaceholder = true;
        return true
      }
      // assert node match
      {
        if (!assertNodeMatch(elm, vnode, inVPre)) {
          return false
        }
      }
      if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode, true /* hydrating */); }
        if (isDef(i = vnode.componentInstance)) {
          // child component. it should have hydrated its own tree.
          initComponent(vnode, insertedVnodeQueue);
          return true
        }
      }
      if (isDef(tag)) {
        if (isDef(children)) {
          // empty element, allow client to pick up and populate children
          if (!elm.hasChildNodes()) {
            createChildren(vnode, children, insertedVnodeQueue);
          } else {
            // v-html and domProps: innerHTML
            if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
              if (i !== elm.innerHTML) {
                /* istanbul ignore if */
                if (typeof console !== 'undefined' &&
                  !hydrationBailed
                ) {
                  hydrationBailed = true;
                  console.warn('Parent: ', elm);
                  console.warn('server innerHTML: ', i);
                  console.warn('client innerHTML: ', elm.innerHTML);
                }
                return false
              }
            } else {
              // iterate and compare children lists
              var childrenMatch = true;
              var childNode = elm.firstChild;
              for (var i$1 = 0; i$1 < children.length; i$1++) {
                if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue, inVPre)) {
                  childrenMatch = false;
                  break
                }
                childNode = childNode.nextSibling;
              }
              // if childNode is not null, it means the actual childNodes list is
              // longer than the virtual children list.
              if (!childrenMatch || childNode) {
                /* istanbul ignore if */
                if (typeof console !== 'undefined' &&
                  !hydrationBailed
                ) {
                  hydrationBailed = true;
                  console.warn('Parent: ', elm);
                  console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
                }
                return false
              }
            }
          }
        }
        if (isDef(data)) {
          var fullInvoke = false;
          for (var key in data) {
            if (!isRenderedModule(key)) {
              fullInvoke = true;
              invokeCreateHooks(vnode, insertedVnodeQueue);
              break
            }
          }
          if (!fullInvoke && data['class']) {
            // ensure collecting deps for deep class bindings for future updates
            traverse(data['class']);
          }
        }
      } else if (elm.data !== vnode.text) {
        elm.data = vnode.text;
      }
      return true
    }

    function assertNodeMatch (node, vnode, inVPre) {
      if (isDef(vnode.tag)) {
        return vnode.tag.indexOf('vue-component') === 0 || (
          !isUnknownElement$$1(vnode, inVPre) &&
          vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
        )
      } else {
        return node.nodeType === (vnode.isComment ? 8 : 3)
      }
    }

    return function patch (oldVnode, vnode, hydrating, removeOnly) {
      if (isUndef(vnode)) {
        if (isDef(oldVnode)) { invokeDestroyHook(oldVnode); }
        return
      }

      var isInitialPatch = false;
      var insertedVnodeQueue = [];

      if (isUndef(oldVnode)) {
        // empty mount (likely as component), create new root element
        isInitialPatch = true;
        createElm(vnode, insertedVnodeQueue);
      } else {
        var isRealElement = isDef(oldVnode.nodeType);
        if (!isRealElement && sameVnode(oldVnode, vnode)) {
          // patch existing root node
          patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
        } else {
          if (isRealElement) {
            // mounting to a real element
            // check if this is server-rendered content and if we can perform
            // a successful hydration.
            if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
              oldVnode.removeAttribute(SSR_ATTR);
              hydrating = true;
            }
            if (isTrue(hydrating)) {
              if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                invokeInsertHook(vnode, insertedVnodeQueue, true);
                return oldVnode
              } else {
                warn(
                  'The client-side rendered virtual DOM tree is not matching ' +
                  'server-rendered content. This is likely caused by incorrect ' +
                  'HTML markup, for example nesting block-level elements inside ' +
                  '<p>, or missing <tbody>. Bailing hydration and performing ' +
                  'full client-side render.'
                );
              }
            }
            // either not server-rendered, or hydration failed.
            // create an empty node and replace it
            oldVnode = emptyNodeAt(oldVnode);
          }

          // replacing existing element
          var oldElm = oldVnode.elm;
          var parentElm = nodeOps.parentNode(oldElm);

          // create new node
          createElm(
            vnode,
            insertedVnodeQueue,
            // extremely rare edge case: do not insert if old element is in a
            // leaving transition. Only happens when combining transition +
            // keep-alive + HOCs. (#4590)
            oldElm._leaveCb ? null : parentElm,
            nodeOps.nextSibling(oldElm)
          );

          // update parent placeholder node element, recursively
          if (isDef(vnode.parent)) {
            var ancestor = vnode.parent;
            var patchable = isPatchable(vnode);
            while (ancestor) {
              for (var i = 0; i < cbs.destroy.length; ++i) {
                cbs.destroy[i](ancestor);
              }
              ancestor.elm = vnode.elm;
              if (patchable) {
                for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                  cbs.create[i$1](emptyNode, ancestor);
                }
                // #6513
                // invoke insert hooks that may have been merged by create hooks.
                // e.g. for directives that uses the "inserted" hook.
                var insert = ancestor.data.hook.insert;
                if (insert.merged) {
                  // start at index 1 to avoid re-invoking component mounted hook
                  for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
                    insert.fns[i$2]();
                  }
                }
              } else {
                registerRef(ancestor);
              }
              ancestor = ancestor.parent;
            }
          }

          // destroy old node
          if (isDef(parentElm)) {
            removeVnodes([oldVnode], 0, 0);
          } else if (isDef(oldVnode.tag)) {
            invokeDestroyHook(oldVnode);
          }
        }
      }

      invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
      return vnode.elm
    }
  }

  /*  */

  var directives = {
    create: updateDirectives,
    update: updateDirectives,
    destroy: function unbindDirectives (vnode) {
      updateDirectives(vnode, emptyNode);
    }
  };

  function updateDirectives (oldVnode, vnode) {
    if (oldVnode.data.directives || vnode.data.directives) {
      _update(oldVnode, vnode);
    }
  }

  function _update (oldVnode, vnode) {
    var isCreate = oldVnode === emptyNode;
    var isDestroy = vnode === emptyNode;
    var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
    var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

    var dirsWithInsert = [];
    var dirsWithPostpatch = [];

    var key, oldDir, dir;
    for (key in newDirs) {
      oldDir = oldDirs[key];
      dir = newDirs[key];
      if (!oldDir) {
        // new directive, bind
        callHook$1(dir, 'bind', vnode, oldVnode);
        if (dir.def && dir.def.inserted) {
          dirsWithInsert.push(dir);
        }
      } else {
        // existing directive, update
        dir.oldValue = oldDir.value;
        dir.oldArg = oldDir.arg;
        callHook$1(dir, 'update', vnode, oldVnode);
        if (dir.def && dir.def.componentUpdated) {
          dirsWithPostpatch.push(dir);
        }
      }
    }

    if (dirsWithInsert.length) {
      var callInsert = function () {
        for (var i = 0; i < dirsWithInsert.length; i++) {
          callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
        }
      };
      if (isCreate) {
        mergeVNodeHook(vnode, 'insert', callInsert);
      } else {
        callInsert();
      }
    }

    if (dirsWithPostpatch.length) {
      mergeVNodeHook(vnode, 'postpatch', function () {
        for (var i = 0; i < dirsWithPostpatch.length; i++) {
          callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
        }
      });
    }

    if (!isCreate) {
      for (key in oldDirs) {
        if (!newDirs[key]) {
          // no longer present, unbind
          callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
        }
      }
    }
  }

  var emptyModifiers = Object.create(null);

  function normalizeDirectives$1 (
    dirs,
    vm
  ) {
    var res = Object.create(null);
    if (!dirs) {
      // $flow-disable-line
      return res
    }
    var i, dir;
    for (i = 0; i < dirs.length; i++) {
      dir = dirs[i];
      if (!dir.modifiers) {
        // $flow-disable-line
        dir.modifiers = emptyModifiers;
      }
      res[getRawDirName(dir)] = dir;
      dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
    }
    // $flow-disable-line
    return res
  }

  function getRawDirName (dir) {
    return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
  }

  function callHook$1 (dir, hook, vnode, oldVnode, isDestroy) {
    var fn = dir.def && dir.def[hook];
    if (fn) {
      try {
        fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
      } catch (e) {
        handleError(e, vnode.context, ("directive " + (dir.name) + " " + hook + " hook"));
      }
    }
  }

  var baseModules = [
    ref,
    directives
  ];

  /*  */

  function updateAttrs (oldVnode, vnode) {
    var opts = vnode.componentOptions;
    if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
      return
    }
    if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
      return
    }
    var key, cur, old;
    var elm = vnode.elm;
    var oldAttrs = oldVnode.data.attrs || {};
    var attrs = vnode.data.attrs || {};
    // clone observed objects, as the user probably wants to mutate it
    if (isDef(attrs.__ob__)) {
      attrs = vnode.data.attrs = extend({}, attrs);
    }

    for (key in attrs) {
      cur = attrs[key];
      old = oldAttrs[key];
      if (old !== cur) {
        setAttr(elm, key, cur, vnode.data.pre);
      }
    }
    // #4391: in IE9, setting type can reset value for input[type=radio]
    // #6666: IE/Edge forces progress value down to 1 before setting a max
    /* istanbul ignore if */
    if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
      setAttr(elm, 'value', attrs.value);
    }
    for (key in oldAttrs) {
      if (isUndef(attrs[key])) {
        if (isXlink(key)) {
          elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
        } else if (!isEnumeratedAttr(key)) {
          elm.removeAttribute(key);
        }
      }
    }
  }

  function setAttr (el, key, value, isInPre) {
    if (isInPre || el.tagName.indexOf('-') > -1) {
      baseSetAttr(el, key, value);
    } else if (isBooleanAttr(key)) {
      // set attribute for blank value
      // e.g. <option disabled>Select one</option>
      if (isFalsyAttrValue(value)) {
        el.removeAttribute(key);
      } else {
        // technically allowfullscreen is a boolean attribute for <iframe>,
        // but Flash expects a value of "true" when used on <embed> tag
        value = key === 'allowfullscreen' && el.tagName === 'EMBED'
          ? 'true'
          : key;
        el.setAttribute(key, value);
      }
    } else if (isEnumeratedAttr(key)) {
      el.setAttribute(key, convertEnumeratedValue(key, value));
    } else if (isXlink(key)) {
      if (isFalsyAttrValue(value)) {
        el.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else {
        el.setAttributeNS(xlinkNS, key, value);
      }
    } else {
      baseSetAttr(el, key, value);
    }
  }

  function baseSetAttr (el, key, value) {
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      // #7138: IE10 & 11 fires input event when setting placeholder on
      // <textarea>... block the first input event and remove the blocker
      // immediately.
      /* istanbul ignore if */
      if (
        isIE && !isIE9 &&
        el.tagName === 'TEXTAREA' &&
        key === 'placeholder' && value !== '' && !el.__ieph
      ) {
        var blocker = function (e) {
          e.stopImmediatePropagation();
          el.removeEventListener('input', blocker);
        };
        el.addEventListener('input', blocker);
        // $flow-disable-line
        el.__ieph = true; /* IE placeholder patched */
      }
      el.setAttribute(key, value);
    }
  }

  var attrs = {
    create: updateAttrs,
    update: updateAttrs
  };

  /*  */

  function updateClass (oldVnode, vnode) {
    var el = vnode.elm;
    var data = vnode.data;
    var oldData = oldVnode.data;
    if (
      isUndef(data.staticClass) &&
      isUndef(data.class) && (
        isUndef(oldData) || (
          isUndef(oldData.staticClass) &&
          isUndef(oldData.class)
        )
      )
    ) {
      return
    }

    var cls = genClassForVnode(vnode);

    // handle transition classes
    var transitionClass = el._transitionClasses;
    if (isDef(transitionClass)) {
      cls = concat(cls, stringifyClass(transitionClass));
    }

    // set the class
    if (cls !== el._prevClass) {
      el.setAttribute('class', cls);
      el._prevClass = cls;
    }
  }

  var klass = {
    create: updateClass,
    update: updateClass
  };

  /*  */

  var validDivisionCharRE = /[\w).+\-_$\]]/;

  function parseFilters (exp) {
    var inSingle = false;
    var inDouble = false;
    var inTemplateString = false;
    var inRegex = false;
    var curly = 0;
    var square = 0;
    var paren = 0;
    var lastFilterIndex = 0;
    var c, prev, i, expression, filters;

    for (i = 0; i < exp.length; i++) {
      prev = c;
      c = exp.charCodeAt(i);
      if (inSingle) {
        if (c === 0x27 && prev !== 0x5C) { inSingle = false; }
      } else if (inDouble) {
        if (c === 0x22 && prev !== 0x5C) { inDouble = false; }
      } else if (inTemplateString) {
        if (c === 0x60 && prev !== 0x5C) { inTemplateString = false; }
      } else if (inRegex) {
        if (c === 0x2f && prev !== 0x5C) { inRegex = false; }
      } else if (
        c === 0x7C && // pipe
        exp.charCodeAt(i + 1) !== 0x7C &&
        exp.charCodeAt(i - 1) !== 0x7C &&
        !curly && !square && !paren
      ) {
        if (expression === undefined) {
          // first filter, end of expression
          lastFilterIndex = i + 1;
          expression = exp.slice(0, i).trim();
        } else {
          pushFilter();
        }
      } else {
        switch (c) {
          case 0x22: inDouble = true; break         // "
          case 0x27: inSingle = true; break         // '
          case 0x60: inTemplateString = true; break // `
          case 0x28: paren++; break                 // (
          case 0x29: paren--; break                 // )
          case 0x5B: square++; break                // [
          case 0x5D: square--; break                // ]
          case 0x7B: curly++; break                 // {
          case 0x7D: curly--; break                 // }
        }
        if (c === 0x2f) { // /
          var j = i - 1;
          var p = (void 0);
          // find first non-whitespace prev char
          for (; j >= 0; j--) {
            p = exp.charAt(j);
            if (p !== ' ') { break }
          }
          if (!p || !validDivisionCharRE.test(p)) {
            inRegex = true;
          }
        }
      }
    }

    if (expression === undefined) {
      expression = exp.slice(0, i).trim();
    } else if (lastFilterIndex !== 0) {
      pushFilter();
    }

    function pushFilter () {
      (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
      lastFilterIndex = i + 1;
    }

    if (filters) {
      for (i = 0; i < filters.length; i++) {
        expression = wrapFilter(expression, filters[i]);
      }
    }

    return expression
  }

  function wrapFilter (exp, filter) {
    var i = filter.indexOf('(');
    if (i < 0) {
      // _f: resolveFilter
      return ("_f(\"" + filter + "\")(" + exp + ")")
    } else {
      var name = filter.slice(0, i);
      var args = filter.slice(i + 1);
      return ("_f(\"" + name + "\")(" + exp + (args !== ')' ? ',' + args : args))
    }
  }

  /*  */



  /* eslint-disable no-unused-vars */
  function baseWarn (msg, range) {
    console.error(("[Vue compiler]: " + msg));
  }
  /* eslint-enable no-unused-vars */

  function pluckModuleFunction (
    modules,
    key
  ) {
    return modules
      ? modules.map(function (m) { return m[key]; }).filter(function (_) { return _; })
      : []
  }

  function addProp (el, name, value, range, dynamic) {
    (el.props || (el.props = [])).push(rangeSetItem({ name: name, value: value, dynamic: dynamic }, range));
    el.plain = false;
  }

  function addAttr (el, name, value, range, dynamic) {
    var attrs = dynamic
      ? (el.dynamicAttrs || (el.dynamicAttrs = []))
      : (el.attrs || (el.attrs = []));
    attrs.push(rangeSetItem({ name: name, value: value, dynamic: dynamic }, range));
    el.plain = false;
  }

  // add a raw attr (use this in preTransforms)
  function addRawAttr (el, name, value, range) {
    el.attrsMap[name] = value;
    el.attrsList.push(rangeSetItem({ name: name, value: value }, range));
  }

  function addDirective (
    el,
    name,
    rawName,
    value,
    arg,
    isDynamicArg,
    modifiers,
    range
  ) {
    (el.directives || (el.directives = [])).push(rangeSetItem({
      name: name,
      rawName: rawName,
      value: value,
      arg: arg,
      isDynamicArg: isDynamicArg,
      modifiers: modifiers
    }, range));
    el.plain = false;
  }

  function prependModifierMarker (symbol, name, dynamic) {
    return dynamic
      ? ("_p(" + name + ",\"" + symbol + "\")")
      : symbol + name // mark the event as captured
  }

  function addHandler (
    el,
    name,
    value,
    modifiers,
    important,
    warn,
    range,
    dynamic
  ) {
    modifiers = modifiers || emptyObject;
    // warn prevent and passive modifier
    /* istanbul ignore if */
    if (
      warn &&
      modifiers.prevent && modifiers.passive
    ) {
      warn(
        'passive and prevent can\'t be used together. ' +
        'Passive handler can\'t prevent default event.',
        range
      );
    }

    // normalize click.right and click.middle since they don't actually fire
    // this is technically browser-specific, but at least for now browsers are
    // the only target envs that have right/middle clicks.
    if (modifiers.right) {
      if (dynamic) {
        name = "(" + name + ")==='click'?'contextmenu':(" + name + ")";
      } else if (name === 'click') {
        name = 'contextmenu';
        delete modifiers.right;
      }
    } else if (modifiers.middle) {
      if (dynamic) {
        name = "(" + name + ")==='click'?'mouseup':(" + name + ")";
      } else if (name === 'click') {
        name = 'mouseup';
      }
    }

    // check capture modifier
    if (modifiers.capture) {
      delete modifiers.capture;
      name = prependModifierMarker('!', name, dynamic);
    }
    if (modifiers.once) {
      delete modifiers.once;
      name = prependModifierMarker('~', name, dynamic);
    }
    /* istanbul ignore if */
    if (modifiers.passive) {
      delete modifiers.passive;
      name = prependModifierMarker('&', name, dynamic);
    }

    var events;
    if (modifiers.native) {
      delete modifiers.native;
      events = el.nativeEvents || (el.nativeEvents = {});
    } else {
      events = el.events || (el.events = {});
    }

    var newHandler = rangeSetItem({ value: value.trim(), dynamic: dynamic }, range);
    if (modifiers !== emptyObject) {
      newHandler.modifiers = modifiers;
    }

    var handlers = events[name];
    /* istanbul ignore if */
    if (Array.isArray(handlers)) {
      important ? handlers.unshift(newHandler) : handlers.push(newHandler);
    } else if (handlers) {
      events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
    } else {
      events[name] = newHandler;
    }

    el.plain = false;
  }

  function getRawBindingAttr (
    el,
    name
  ) {
    return el.rawAttrsMap[':' + name] ||
      el.rawAttrsMap['v-bind:' + name] ||
      el.rawAttrsMap[name]
  }

  function getBindingAttr (
    el,
    name,
    getStatic
  ) {
    var dynamicValue =
      getAndRemoveAttr(el, ':' + name) ||
      getAndRemoveAttr(el, 'v-bind:' + name);
    if (dynamicValue != null) {
      return parseFilters(dynamicValue)
    } else if (getStatic !== false) {
      var staticValue = getAndRemoveAttr(el, name);
      if (staticValue != null) {
        return JSON.stringify(staticValue)
      }
    }
  }

  // note: this only removes the attr from the Array (attrsList) so that it
  // doesn't get processed by processAttrs.
  // By default it does NOT remove it from the map (attrsMap) because the map is
  // needed during codegen.
  function getAndRemoveAttr (
    el,
    name,
    removeFromMap
  ) {
    var val;
    if ((val = el.attrsMap[name]) != null) {
      var list = el.attrsList;
      for (var i = 0, l = list.length; i < l; i++) {
        if (list[i].name === name) {
          list.splice(i, 1);
          break
        }
      }
    }
    if (removeFromMap) {
      delete el.attrsMap[name];
    }
    return val
  }

  function getAndRemoveAttrByRegex (
    el,
    name
  ) {
    var list = el.attrsList;
    for (var i = 0, l = list.length; i < l; i++) {
      var attr = list[i];
      if (name.test(attr.name)) {
        list.splice(i, 1);
        return attr
      }
    }
  }

  function rangeSetItem (
    item,
    range
  ) {
    if (range) {
      if (range.start != null) {
        item.start = range.start;
      }
      if (range.end != null) {
        item.end = range.end;
      }
    }
    return item
  }

  /*  */

  /**
   * Cross-platform code generation for component v-model
   */
  function genComponentModel (
    el,
    value,
    modifiers
  ) {
    var ref = modifiers || {};
    var number = ref.number;
    var trim = ref.trim;

    var baseValueExpression = '$$v';
    var valueExpression = baseValueExpression;
    if (trim) {
      valueExpression =
        "(typeof " + baseValueExpression + " === 'string'" +
        "? " + baseValueExpression + ".trim()" +
        ": " + baseValueExpression + ")";
    }
    if (number) {
      valueExpression = "_n(" + valueExpression + ")";
    }
    var assignment = genAssignmentCode(value, valueExpression);

    el.model = {
      value: ("(" + value + ")"),
      expression: JSON.stringify(value),
      callback: ("function (" + baseValueExpression + ") {" + assignment + "}")
    };
  }

  /**
   * Cross-platform codegen helper for generating v-model value assignment code.
   */
  function genAssignmentCode (
    value,
    assignment
  ) {
    var res = parseModel(value);
    if (res.key === null) {
      return (value + "=" + assignment)
    } else {
      return ("$set(" + (res.exp) + ", " + (res.key) + ", " + assignment + ")")
    }
  }

  /**
   * Parse a v-model expression into a base path and a final key segment.
   * Handles both dot-path and possible square brackets.
   *
   * Possible cases:
   *
   * - test
   * - test[key]
   * - test[test1[key]]
   * - test["a"][key]
   * - xxx.test[a[a].test1[key]]
   * - test.xxx.a["asa"][test1[key]]
   *
   */

  var len, str, chr, index$1, expressionPos, expressionEndPos;



  function parseModel (val) {
    // Fix https://github.com/vuejs/vue/pull/7730
    // allow v-model="obj.val " (trailing whitespace)
    val = val.trim();
    len = val.length;

    if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
      index$1 = val.lastIndexOf('.');
      if (index$1 > -1) {
        return {
          exp: val.slice(0, index$1),
          key: '"' + val.slice(index$1 + 1) + '"'
        }
      } else {
        return {
          exp: val,
          key: null
        }
      }
    }

    str = val;
    index$1 = expressionPos = expressionEndPos = 0;

    while (!eof()) {
      chr = next();
      /* istanbul ignore if */
      if (isStringStart(chr)) {
        parseString(chr);
      } else if (chr === 0x5B) {
        parseBracket(chr);
      }
    }

    return {
      exp: val.slice(0, expressionPos),
      key: val.slice(expressionPos + 1, expressionEndPos)
    }
  }

  function next () {
    return str.charCodeAt(++index$1)
  }

  function eof () {
    return index$1 >= len
  }

  function isStringStart (chr) {
    return chr === 0x22 || chr === 0x27
  }

  function parseBracket (chr) {
    var inBracket = 1;
    expressionPos = index$1;
    while (!eof()) {
      chr = next();
      if (isStringStart(chr)) {
        parseString(chr);
        continue
      }
      if (chr === 0x5B) { inBracket++; }
      if (chr === 0x5D) { inBracket--; }
      if (inBracket === 0) {
        expressionEndPos = index$1;
        break
      }
    }
  }

  function parseString (chr) {
    var stringQuote = chr;
    while (!eof()) {
      chr = next();
      if (chr === stringQuote) {
        break
      }
    }
  }

  /*  */

  var warn$1;

  // in some cases, the event used has to be determined at runtime
  // so we used some reserved tokens during compile.
  var RANGE_TOKEN = '__r';
  var CHECKBOX_RADIO_TOKEN = '__c';

  function model (
    el,
    dir,
    _warn
  ) {
    warn$1 = _warn;
    var value = dir.value;
    var modifiers = dir.modifiers;
    var tag = el.tag;
    var type = el.attrsMap.type;

    {
      // inputs with type="file" are read only and setting the input's
      // value will throw an error.
      if (tag === 'input' && type === 'file') {
        warn$1(
          "<" + (el.tag) + " v-model=\"" + value + "\" type=\"file\">:\n" +
          "File inputs are read only. Use a v-on:change listener instead.",
          el.rawAttrsMap['v-model']
        );
      }
    }

    if (el.component) {
      genComponentModel(el, value, modifiers);
      // component v-model doesn't need extra runtime
      return false
    } else if (tag === 'select') {
      genSelect(el, value, modifiers);
    } else if (tag === 'input' && type === 'checkbox') {
      genCheckboxModel(el, value, modifiers);
    } else if (tag === 'input' && type === 'radio') {
      genRadioModel(el, value, modifiers);
    } else if (tag === 'input' || tag === 'textarea') {
      genDefaultModel(el, value, modifiers);
    } else if (!config.isReservedTag(tag)) {
      genComponentModel(el, value, modifiers);
      // component v-model doesn't need extra runtime
      return false
    } else {
      warn$1(
        "<" + (el.tag) + " v-model=\"" + value + "\">: " +
        "v-model is not supported on this element type. " +
        'If you are working with contenteditable, it\'s recommended to ' +
        'wrap a library dedicated for that purpose inside a custom component.',
        el.rawAttrsMap['v-model']
      );
    }

    // ensure runtime directive metadata
    return true
  }

  function genCheckboxModel (
    el,
    value,
    modifiers
  ) {
    var number = modifiers && modifiers.number;
    var valueBinding = getBindingAttr(el, 'value') || 'null';
    var trueValueBinding = getBindingAttr(el, 'true-value') || 'true';
    var falseValueBinding = getBindingAttr(el, 'false-value') || 'false';
    addProp(el, 'checked',
      "Array.isArray(" + value + ")" +
      "?_i(" + value + "," + valueBinding + ")>-1" + (
        trueValueBinding === 'true'
          ? (":(" + value + ")")
          : (":_q(" + value + "," + trueValueBinding + ")")
      )
    );
    addHandler(el, 'change',
      "var $$a=" + value + "," +
          '$$el=$event.target,' +
          "$$c=$$el.checked?(" + trueValueBinding + "):(" + falseValueBinding + ");" +
      'if(Array.isArray($$a)){' +
        "var $$v=" + (number ? '_n(' + valueBinding + ')' : valueBinding) + "," +
            '$$i=_i($$a,$$v);' +
        "if($$el.checked){$$i<0&&(" + (genAssignmentCode(value, '$$a.concat([$$v])')) + ")}" +
        "else{$$i>-1&&(" + (genAssignmentCode(value, '$$a.slice(0,$$i).concat($$a.slice($$i+1))')) + ")}" +
      "}else{" + (genAssignmentCode(value, '$$c')) + "}",
      null, true
    );
  }

  function genRadioModel (
    el,
    value,
    modifiers
  ) {
    var number = modifiers && modifiers.number;
    var valueBinding = getBindingAttr(el, 'value') || 'null';
    valueBinding = number ? ("_n(" + valueBinding + ")") : valueBinding;
    addProp(el, 'checked', ("_q(" + value + "," + valueBinding + ")"));
    addHandler(el, 'change', genAssignmentCode(value, valueBinding), null, true);
  }

  function genSelect (
    el,
    value,
    modifiers
  ) {
    var number = modifiers && modifiers.number;
    var selectedVal = "Array.prototype.filter" +
      ".call($event.target.options,function(o){return o.selected})" +
      ".map(function(o){var val = \"_value\" in o ? o._value : o.value;" +
      "return " + (number ? '_n(val)' : 'val') + "})";

    var assignment = '$event.target.multiple ? $$selectedVal : $$selectedVal[0]';
    var code = "var $$selectedVal = " + selectedVal + ";";
    code = code + " " + (genAssignmentCode(value, assignment));
    addHandler(el, 'change', code, null, true);
  }

  function genDefaultModel (
    el,
    value,
    modifiers
  ) {
    var type = el.attrsMap.type;

    // warn if v-bind:value conflicts with v-model
    // except for inputs with v-bind:type
    {
      var value$1 = el.attrsMap['v-bind:value'] || el.attrsMap[':value'];
      var typeBinding = el.attrsMap['v-bind:type'] || el.attrsMap[':type'];
      if (value$1 && !typeBinding) {
        var binding = el.attrsMap['v-bind:value'] ? 'v-bind:value' : ':value';
        warn$1(
          binding + "=\"" + value$1 + "\" conflicts with v-model on the same element " +
          'because the latter already expands to a value binding internally',
          el.rawAttrsMap[binding]
        );
      }
    }

    var ref = modifiers || {};
    var lazy = ref.lazy;
    var number = ref.number;
    var trim = ref.trim;
    var needCompositionGuard = !lazy && type !== 'range';
    var event = lazy
      ? 'change'
      : type === 'range'
        ? RANGE_TOKEN
        : 'input';

    var valueExpression = '$event.target.value';
    if (trim) {
      valueExpression = "$event.target.value.trim()";
    }
    if (number) {
      valueExpression = "_n(" + valueExpression + ")";
    }

    var code = genAssignmentCode(value, valueExpression);
    if (needCompositionGuard) {
      code = "if($event.target.composing)return;" + code;
    }

    addProp(el, 'value', ("(" + value + ")"));
    addHandler(el, event, code, null, true);
    if (trim || number) {
      addHandler(el, 'blur', '$forceUpdate()');
    }
  }

  /*  */

  // normalize v-model event tokens that can only be determined at runtime.
  // it's important to place the event as the first in the array because
  // the whole point is ensuring the v-model callback gets called before
  // user-attached handlers.
  function normalizeEvents (on) {
    /* istanbul ignore if */
    if (isDef(on[RANGE_TOKEN])) {
      // IE input[type=range] only supports `change` event
      var event = isIE ? 'change' : 'input';
      on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
      delete on[RANGE_TOKEN];
    }
    // This was originally intended to fix #4521 but no longer necessary
    // after 2.5. Keeping it for backwards compat with generated code from < 2.4
    /* istanbul ignore if */
    if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
      on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []);
      delete on[CHECKBOX_RADIO_TOKEN];
    }
  }

  var target$1;

  function createOnceHandler$1 (event, handler, capture) {
    var _target = target$1; // save current target element in closure
    return function onceHandler () {
      var res = handler.apply(null, arguments);
      if (res !== null) {
        remove$2(event, onceHandler, capture, _target);
      }
    }
  }

  // #9446: Firefox <= 53 (in particular, ESR 52) has incorrect Event.timeStamp
  // implementation and does not fire microtasks in between event propagation, so
  // safe to exclude.
  var useMicrotaskFix = isUsingMicroTask && !(isFF && Number(isFF[1]) <= 53);

  function add$1 (
    name,
    handler,
    capture,
    passive
  ) {
    // async edge case #6566: inner click event triggers patch, event handler
    // attached to outer element during patch, and triggered again. This
    // happens because browsers fire microtask ticks between event propagation.
    // the solution is simple: we save the timestamp when a handler is attached,
    // and the handler would only fire if the event passed to it was fired
    // AFTER it was attached.
    if (useMicrotaskFix) {
      var attachedTimestamp = currentFlushTimestamp;
      var original = handler;
      handler = original._wrapper = function (e) {
        if (
          // no bubbling, should always fire.
          // this is just a safety net in case event.timeStamp is unreliable in
          // certain weird environments...
          e.target === e.currentTarget ||
          // event is fired after handler attachment
          e.timeStamp >= attachedTimestamp ||
          // bail for environments that have buggy event.timeStamp implementations
          // #9462 iOS 9 bug: event.timeStamp is 0 after history.pushState
          // #9681 QtWebEngine event.timeStamp is negative value
          e.timeStamp <= 0 ||
          // #9448 bail if event is fired in another document in a multi-page
          // electron/nw.js app, since event.timeStamp will be using a different
          // starting reference
          e.target.ownerDocument !== document
        ) {
          return original.apply(this, arguments)
        }
      };
    }
    target$1.addEventListener(
      name,
      handler,
      supportsPassive
        ? { capture: capture, passive: passive }
        : capture
    );
  }

  function remove$2 (
    name,
    handler,
    capture,
    _target
  ) {
    (_target || target$1).removeEventListener(
      name,
      handler._wrapper || handler,
      capture
    );
  }

  function updateDOMListeners (oldVnode, vnode) {
    if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
      return
    }
    var on = vnode.data.on || {};
    var oldOn = oldVnode.data.on || {};
    target$1 = vnode.elm;
    normalizeEvents(on);
    updateListeners(on, oldOn, add$1, remove$2, createOnceHandler$1, vnode.context);
    target$1 = undefined;
  }

  var events = {
    create: updateDOMListeners,
    update: updateDOMListeners
  };

  /*  */

  var svgContainer;

  function updateDOMProps (oldVnode, vnode) {
    if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
      return
    }
    var key, cur;
    var elm = vnode.elm;
    var oldProps = oldVnode.data.domProps || {};
    var props = vnode.data.domProps || {};
    // clone observed objects, as the user probably wants to mutate it
    if (isDef(props.__ob__)) {
      props = vnode.data.domProps = extend({}, props);
    }

    for (key in oldProps) {
      if (!(key in props)) {
        elm[key] = '';
      }
    }

    for (key in props) {
      cur = props[key];
      // ignore children if the node has textContent or innerHTML,
      // as these will throw away existing DOM nodes and cause removal errors
      // on subsequent patches (#3360)
      if (key === 'textContent' || key === 'innerHTML') {
        if (vnode.children) { vnode.children.length = 0; }
        if (cur === oldProps[key]) { continue }
        // #6601 work around Chrome version <= 55 bug where single textNode
        // replaced by innerHTML/textContent retains its parentNode property
        if (elm.childNodes.length === 1) {
          elm.removeChild(elm.childNodes[0]);
        }
      }

      if (key === 'value' && elm.tagName !== 'PROGRESS') {
        // store value as _value as well since
        // non-string values will be stringified
        elm._value = cur;
        // avoid resetting cursor position when value is the same
        var strCur = isUndef(cur) ? '' : String(cur);
        if (shouldUpdateValue(elm, strCur)) {
          elm.value = strCur;
        }
      } else if (key === 'innerHTML' && isSVG(elm.tagName) && isUndef(elm.innerHTML)) {
        // IE doesn't support innerHTML for SVG elements
        svgContainer = svgContainer || document.createElement('div');
        svgContainer.innerHTML = "<svg>" + cur + "</svg>";
        var svg = svgContainer.firstChild;
        while (elm.firstChild) {
          elm.removeChild(elm.firstChild);
        }
        while (svg.firstChild) {
          elm.appendChild(svg.firstChild);
        }
      } else if (
        // skip the update if old and new VDOM state is the same.
        // `value` is handled separately because the DOM value may be temporarily
        // out of sync with VDOM state due to focus, composition and modifiers.
        // This  #4521 by skipping the unnecessary `checked` update.
        cur !== oldProps[key]
      ) {
        // some property updates can throw
        // e.g. `value` on <progress> w/ non-finite value
        try {
          elm[key] = cur;
        } catch (e) {}
      }
    }
  }

  // check platforms/web/util/attrs.js acceptValue


  function shouldUpdateValue (elm, checkVal) {
    return (!elm.composing && (
      elm.tagName === 'OPTION' ||
      isNotInFocusAndDirty(elm, checkVal) ||
      isDirtyWithModifiers(elm, checkVal)
    ))
  }

  function isNotInFocusAndDirty (elm, checkVal) {
    // return true when textbox (.number and .trim) loses focus and its value is
    // not equal to the updated value
    var notInFocus = true;
    // #6157
    // work around IE bug when accessing document.activeElement in an iframe
    try { notInFocus = document.activeElement !== elm; } catch (e) {}
    return notInFocus && elm.value !== checkVal
  }

  function isDirtyWithModifiers (elm, newVal) {
    var value = elm.value;
    var modifiers = elm._vModifiers; // injected by v-model runtime
    if (isDef(modifiers)) {
      if (modifiers.number) {
        return toNumber(value) !== toNumber(newVal)
      }
      if (modifiers.trim) {
        return value.trim() !== newVal.trim()
      }
    }
    return value !== newVal
  }

  var domProps = {
    create: updateDOMProps,
    update: updateDOMProps
  };

  /*  */

  var parseStyleText = cached(function (cssText) {
    var res = {};
    var listDelimiter = /;(?![^(]*\))/g;
    var propertyDelimiter = /:(.+)/;
    cssText.split(listDelimiter).forEach(function (item) {
      if (item) {
        var tmp = item.split(propertyDelimiter);
        tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
      }
    });
    return res
  });

  // merge static and dynamic style data on the same vnode
  function normalizeStyleData (data) {
    var style = normalizeStyleBinding(data.style);
    // static style is pre-processed into an object during compilation
    // and is always a fresh object, so it's safe to merge into it
    return data.staticStyle
      ? extend(data.staticStyle, style)
      : style
  }

  // normalize possible array / string values into Object
  function normalizeStyleBinding (bindingStyle) {
    if (Array.isArray(bindingStyle)) {
      return toObject(bindingStyle)
    }
    if (typeof bindingStyle === 'string') {
      return parseStyleText(bindingStyle)
    }
    return bindingStyle
  }

  /**
   * parent component style should be after child's
   * so that parent component's style could override it
   */
  function getStyle (vnode, checkChild) {
    var res = {};
    var styleData;

    if (checkChild) {
      var childNode = vnode;
      while (childNode.componentInstance) {
        childNode = childNode.componentInstance._vnode;
        if (
          childNode && childNode.data &&
          (styleData = normalizeStyleData(childNode.data))
        ) {
          extend(res, styleData);
        }
      }
    }

    if ((styleData = normalizeStyleData(vnode.data))) {
      extend(res, styleData);
    }

    var parentNode = vnode;
    while ((parentNode = parentNode.parent)) {
      if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
        extend(res, styleData);
      }
    }
    return res
  }

  /*  */

  var cssVarRE = /^--/;
  var importantRE = /\s*!important$/;
  var setProp = function (el, name, val) {
    /* istanbul ignore if */
    if (cssVarRE.test(name)) {
      el.style.setProperty(name, val);
    } else if (importantRE.test(val)) {
      el.style.setProperty(hyphenate(name), val.replace(importantRE, ''), 'important');
    } else {
      var normalizedName = normalize(name);
      if (Array.isArray(val)) {
        // Support values array created by autoprefixer, e.g.
        // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
        // Set them one by one, and the browser will only set those it can recognize
        for (var i = 0, len = val.length; i < len; i++) {
          el.style[normalizedName] = val[i];
        }
      } else {
        el.style[normalizedName] = val;
      }
    }
  };

  var vendorNames = ['Webkit', 'Moz', 'ms'];

  var emptyStyle;
  var normalize = cached(function (prop) {
    emptyStyle = emptyStyle || document.createElement('div').style;
    prop = camelize(prop);
    if (prop !== 'filter' && (prop in emptyStyle)) {
      return prop
    }
    var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
    for (var i = 0; i < vendorNames.length; i++) {
      var name = vendorNames[i] + capName;
      if (name in emptyStyle) {
        return name
      }
    }
  });

  function updateStyle (oldVnode, vnode) {
    var data = vnode.data;
    var oldData = oldVnode.data;

    if (isUndef(data.staticStyle) && isUndef(data.style) &&
      isUndef(oldData.staticStyle) && isUndef(oldData.style)
    ) {
      return
    }

    var cur, name;
    var el = vnode.elm;
    var oldStaticStyle = oldData.staticStyle;
    var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

    // if static style exists, stylebinding already merged into it when doing normalizeStyleData
    var oldStyle = oldStaticStyle || oldStyleBinding;

    var style = normalizeStyleBinding(vnode.data.style) || {};

    // store normalized style under a different key for next diff
    // make sure to clone it if it's reactive, since the user likely wants
    // to mutate it.
    vnode.data.normalizedStyle = isDef(style.__ob__)
      ? extend({}, style)
      : style;

    var newStyle = getStyle(vnode, true);

    for (name in oldStyle) {
      if (isUndef(newStyle[name])) {
        setProp(el, name, '');
      }
    }
    for (name in newStyle) {
      cur = newStyle[name];
      if (cur !== oldStyle[name]) {
        // ie9 setting to null has no effect, must use empty string
        setProp(el, name, cur == null ? '' : cur);
      }
    }
  }

  var style = {
    create: updateStyle,
    update: updateStyle
  };

  /*  */

  var whitespaceRE = /\s+/;

  /**
   * Add class with compatibility for SVG since classList is not supported on
   * SVG elements in IE
   */
  function addClass (el, cls) {
    /* istanbul ignore if */
    if (!cls || !(cls = cls.trim())) {
      return
    }

    /* istanbul ignore else */
    if (el.classList) {
      if (cls.indexOf(' ') > -1) {
        cls.split(whitespaceRE).forEach(function (c) { return el.classList.add(c); });
      } else {
        el.classList.add(cls);
      }
    } else {
      var cur = " " + (el.getAttribute('class') || '') + " ";
      if (cur.indexOf(' ' + cls + ' ') < 0) {
        el.setAttribute('class', (cur + cls).trim());
      }
    }
  }

  /**
   * Remove class with compatibility for SVG since classList is not supported on
   * SVG elements in IE
   */
  function removeClass (el, cls) {
    /* istanbul ignore if */
    if (!cls || !(cls = cls.trim())) {
      return
    }

    /* istanbul ignore else */
    if (el.classList) {
      if (cls.indexOf(' ') > -1) {
        cls.split(whitespaceRE).forEach(function (c) { return el.classList.remove(c); });
      } else {
        el.classList.remove(cls);
      }
      if (!el.classList.length) {
        el.removeAttribute('class');
      }
    } else {
      var cur = " " + (el.getAttribute('class') || '') + " ";
      var tar = ' ' + cls + ' ';
      while (cur.indexOf(tar) >= 0) {
        cur = cur.replace(tar, ' ');
      }
      cur = cur.trim();
      if (cur) {
        el.setAttribute('class', cur);
      } else {
        el.removeAttribute('class');
      }
    }
  }

  /*  */

  function resolveTransition (def$$1) {
    if (!def$$1) {
      return
    }
    /* istanbul ignore else */
    if (typeof def$$1 === 'object') {
      var res = {};
      if (def$$1.css !== false) {
        extend(res, autoCssTransition(def$$1.name || 'v'));
      }
      extend(res, def$$1);
      return res
    } else if (typeof def$$1 === 'string') {
      return autoCssTransition(def$$1)
    }
  }

  var autoCssTransition = cached(function (name) {
    return {
      enterClass: (name + "-enter"),
      enterToClass: (name + "-enter-to"),
      enterActiveClass: (name + "-enter-active"),
      leaveClass: (name + "-leave"),
      leaveToClass: (name + "-leave-to"),
      leaveActiveClass: (name + "-leave-active")
    }
  });

  var hasTransition = inBrowser && !isIE9;
  var TRANSITION = 'transition';
  var ANIMATION = 'animation';

  // Transition property/event sniffing
  var transitionProp = 'transition';
  var transitionEndEvent = 'transitionend';
  var animationProp = 'animation';
  var animationEndEvent = 'animationend';
  if (hasTransition) {
    /* istanbul ignore if */
    if (window.ontransitionend === undefined &&
      window.onwebkittransitionend !== undefined
    ) {
      transitionProp = 'WebkitTransition';
      transitionEndEvent = 'webkitTransitionEnd';
    }
    if (window.onanimationend === undefined &&
      window.onwebkitanimationend !== undefined
    ) {
      animationProp = 'WebkitAnimation';
      animationEndEvent = 'webkitAnimationEnd';
    }
  }

  // binding to window is necessary to make hot reload work in IE in strict mode
  var raf = inBrowser
    ? window.requestAnimationFrame
      ? window.requestAnimationFrame.bind(window)
      : setTimeout
    : /* istanbul ignore next */ function (fn) { return fn(); };

  function nextFrame (fn) {
    raf(function () {
      raf(fn);
    });
  }

  function addTransitionClass (el, cls) {
    var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
    if (transitionClasses.indexOf(cls) < 0) {
      transitionClasses.push(cls);
      addClass(el, cls);
    }
  }

  function removeTransitionClass (el, cls) {
    if (el._transitionClasses) {
      remove(el._transitionClasses, cls);
    }
    removeClass(el, cls);
  }

  function whenTransitionEnds (
    el,
    expectedType,
    cb
  ) {
    var ref = getTransitionInfo(el, expectedType);
    var type = ref.type;
    var timeout = ref.timeout;
    var propCount = ref.propCount;
    if (!type) { return cb() }
    var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
    var ended = 0;
    var end = function () {
      el.removeEventListener(event, onEnd);
      cb();
    };
    var onEnd = function (e) {
      if (e.target === el) {
        if (++ended >= propCount) {
          end();
        }
      }
    };
    setTimeout(function () {
      if (ended < propCount) {
        end();
      }
    }, timeout + 1);
    el.addEventListener(event, onEnd);
  }

  var transformRE = /\b(transform|all)(,|$)/;

  function getTransitionInfo (el, expectedType) {
    var styles = window.getComputedStyle(el);
    // JSDOM may return undefined for transition properties
    var transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ');
    var transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ');
    var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
    var animationDelays = (styles[animationProp + 'Delay'] || '').split(', ');
    var animationDurations = (styles[animationProp + 'Duration'] || '').split(', ');
    var animationTimeout = getTimeout(animationDelays, animationDurations);

    var type;
    var timeout = 0;
    var propCount = 0;
    /* istanbul ignore if */
    if (expectedType === TRANSITION) {
      if (transitionTimeout > 0) {
        type = TRANSITION;
        timeout = transitionTimeout;
        propCount = transitionDurations.length;
      }
    } else if (expectedType === ANIMATION) {
      if (animationTimeout > 0) {
        type = ANIMATION;
        timeout = animationTimeout;
        propCount = animationDurations.length;
      }
    } else {
      timeout = Math.max(transitionTimeout, animationTimeout);
      type = timeout > 0
        ? transitionTimeout > animationTimeout
          ? TRANSITION
          : ANIMATION
        : null;
      propCount = type
        ? type === TRANSITION
          ? transitionDurations.length
          : animationDurations.length
        : 0;
    }
    var hasTransform =
      type === TRANSITION &&
      transformRE.test(styles[transitionProp + 'Property']);
    return {
      type: type,
      timeout: timeout,
      propCount: propCount,
      hasTransform: hasTransform
    }
  }

  function getTimeout (delays, durations) {
    /* istanbul ignore next */
    while (delays.length < durations.length) {
      delays = delays.concat(delays);
    }

    return Math.max.apply(null, durations.map(function (d, i) {
      return toMs(d) + toMs(delays[i])
    }))
  }

  // Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
  // in a locale-dependent way, using a comma instead of a dot.
  // If comma is not replaced with a dot, the input will be rounded down (i.e. acting
  // as a floor function) causing unexpected behaviors
  function toMs (s) {
    return Number(s.slice(0, -1).replace(',', '.')) * 1000
  }

  /*  */

  function enter (vnode, toggleDisplay) {
    var el = vnode.elm;

    // call leave callback now
    if (isDef(el._leaveCb)) {
      el._leaveCb.cancelled = true;
      el._leaveCb();
    }

    var data = resolveTransition(vnode.data.transition);
    if (isUndef(data)) {
      return
    }

    /* istanbul ignore if */
    if (isDef(el._enterCb) || el.nodeType !== 1) {
      return
    }

    var css = data.css;
    var type = data.type;
    var enterClass = data.enterClass;
    var enterToClass = data.enterToClass;
    var enterActiveClass = data.enterActiveClass;
    var appearClass = data.appearClass;
    var appearToClass = data.appearToClass;
    var appearActiveClass = data.appearActiveClass;
    var beforeEnter = data.beforeEnter;
    var enter = data.enter;
    var afterEnter = data.afterEnter;
    var enterCancelled = data.enterCancelled;
    var beforeAppear = data.beforeAppear;
    var appear = data.appear;
    var afterAppear = data.afterAppear;
    var appearCancelled = data.appearCancelled;
    var duration = data.duration;

    // activeInstance will always be the <transition> component managing this
    // transition. One edge case to check is when the <transition> is placed
    // as the root node of a child component. In that case we need to check
    // <transition>'s parent for appear check.
    var context = activeInstance;
    var transitionNode = activeInstance.$vnode;
    while (transitionNode && transitionNode.parent) {
      context = transitionNode.context;
      transitionNode = transitionNode.parent;
    }

    var isAppear = !context._isMounted || !vnode.isRootInsert;

    if (isAppear && !appear && appear !== '') {
      return
    }

    var startClass = isAppear && appearClass
      ? appearClass
      : enterClass;
    var activeClass = isAppear && appearActiveClass
      ? appearActiveClass
      : enterActiveClass;
    var toClass = isAppear && appearToClass
      ? appearToClass
      : enterToClass;

    var beforeEnterHook = isAppear
      ? (beforeAppear || beforeEnter)
      : beforeEnter;
    var enterHook = isAppear
      ? (typeof appear === 'function' ? appear : enter)
      : enter;
    var afterEnterHook = isAppear
      ? (afterAppear || afterEnter)
      : afterEnter;
    var enterCancelledHook = isAppear
      ? (appearCancelled || enterCancelled)
      : enterCancelled;

    var explicitEnterDuration = toNumber(
      isObject(duration)
        ? duration.enter
        : duration
    );

    if (explicitEnterDuration != null) {
      checkDuration(explicitEnterDuration, 'enter', vnode);
    }

    var expectsCSS = css !== false && !isIE9;
    var userWantsControl = getHookArgumentsLength(enterHook);

    var cb = el._enterCb = once(function () {
      if (expectsCSS) {
        removeTransitionClass(el, toClass);
        removeTransitionClass(el, activeClass);
      }
      if (cb.cancelled) {
        if (expectsCSS) {
          removeTransitionClass(el, startClass);
        }
        enterCancelledHook && enterCancelledHook(el);
      } else {
        afterEnterHook && afterEnterHook(el);
      }
      el._enterCb = null;
    });

    if (!vnode.data.show) {
      // remove pending leave element on enter by injecting an insert hook
      mergeVNodeHook(vnode, 'insert', function () {
        var parent = el.parentNode;
        var pendingNode = parent && parent._pending && parent._pending[vnode.key];
        if (pendingNode &&
          pendingNode.tag === vnode.tag &&
          pendingNode.elm._leaveCb
        ) {
          pendingNode.elm._leaveCb();
        }
        enterHook && enterHook(el, cb);
      });
    }

    // start enter transition
    beforeEnterHook && beforeEnterHook(el);
    if (expectsCSS) {
      addTransitionClass(el, startClass);
      addTransitionClass(el, activeClass);
      nextFrame(function () {
        removeTransitionClass(el, startClass);
        if (!cb.cancelled) {
          addTransitionClass(el, toClass);
          if (!userWantsControl) {
            if (isValidDuration(explicitEnterDuration)) {
              setTimeout(cb, explicitEnterDuration);
            } else {
              whenTransitionEnds(el, type, cb);
            }
          }
        }
      });
    }

    if (vnode.data.show) {
      toggleDisplay && toggleDisplay();
      enterHook && enterHook(el, cb);
    }

    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }

  function leave (vnode, rm) {
    var el = vnode.elm;

    // call enter callback now
    if (isDef(el._enterCb)) {
      el._enterCb.cancelled = true;
      el._enterCb();
    }

    var data = resolveTransition(vnode.data.transition);
    if (isUndef(data) || el.nodeType !== 1) {
      return rm()
    }

    /* istanbul ignore if */
    if (isDef(el._leaveCb)) {
      return
    }

    var css = data.css;
    var type = data.type;
    var leaveClass = data.leaveClass;
    var leaveToClass = data.leaveToClass;
    var leaveActiveClass = data.leaveActiveClass;
    var beforeLeave = data.beforeLeave;
    var leave = data.leave;
    var afterLeave = data.afterLeave;
    var leaveCancelled = data.leaveCancelled;
    var delayLeave = data.delayLeave;
    var duration = data.duration;

    var expectsCSS = css !== false && !isIE9;
    var userWantsControl = getHookArgumentsLength(leave);

    var explicitLeaveDuration = toNumber(
      isObject(duration)
        ? duration.leave
        : duration
    );

    if (isDef(explicitLeaveDuration)) {
      checkDuration(explicitLeaveDuration, 'leave', vnode);
    }

    var cb = el._leaveCb = once(function () {
      if (el.parentNode && el.parentNode._pending) {
        el.parentNode._pending[vnode.key] = null;
      }
      if (expectsCSS) {
        removeTransitionClass(el, leaveToClass);
        removeTransitionClass(el, leaveActiveClass);
      }
      if (cb.cancelled) {
        if (expectsCSS) {
          removeTransitionClass(el, leaveClass);
        }
        leaveCancelled && leaveCancelled(el);
      } else {
        rm();
        afterLeave && afterLeave(el);
      }
      el._leaveCb = null;
    });

    if (delayLeave) {
      delayLeave(performLeave);
    } else {
      performLeave();
    }

    function performLeave () {
      // the delayed leave may have already been cancelled
      if (cb.cancelled) {
        return
      }
      // record leaving element
      if (!vnode.data.show && el.parentNode) {
        (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
      }
      beforeLeave && beforeLeave(el);
      if (expectsCSS) {
        addTransitionClass(el, leaveClass);
        addTransitionClass(el, leaveActiveClass);
        nextFrame(function () {
          removeTransitionClass(el, leaveClass);
          if (!cb.cancelled) {
            addTransitionClass(el, leaveToClass);
            if (!userWantsControl) {
              if (isValidDuration(explicitLeaveDuration)) {
                setTimeout(cb, explicitLeaveDuration);
              } else {
                whenTransitionEnds(el, type, cb);
              }
            }
          }
        });
      }
      leave && leave(el, cb);
      if (!expectsCSS && !userWantsControl) {
        cb();
      }
    }
  }

  // only used in dev mode
  function checkDuration (val, name, vnode) {
    if (typeof val !== 'number') {
      warn(
        "<transition> explicit " + name + " duration is not a valid number - " +
        "got " + (JSON.stringify(val)) + ".",
        vnode.context
      );
    } else if (isNaN(val)) {
      warn(
        "<transition> explicit " + name + " duration is NaN - " +
        'the duration expression might be incorrect.',
        vnode.context
      );
    }
  }

  function isValidDuration (val) {
    return typeof val === 'number' && !isNaN(val)
  }

  /**
   * Normalize a transition hook's argument length. The hook may be:
   * - a merged hook (invoker) with the original in .fns
   * - a wrapped component method (check ._length)
   * - a plain function (.length)
   */
  function getHookArgumentsLength (fn) {
    if (isUndef(fn)) {
      return false
    }
    var invokerFns = fn.fns;
    if (isDef(invokerFns)) {
      // invoker
      return getHookArgumentsLength(
        Array.isArray(invokerFns)
          ? invokerFns[0]
          : invokerFns
      )
    } else {
      return (fn._length || fn.length) > 1
    }
  }

  function _enter (_, vnode) {
    if (vnode.data.show !== true) {
      enter(vnode);
    }
  }

  var transition = inBrowser ? {
    create: _enter,
    activate: _enter,
    remove: function remove$$1 (vnode, rm) {
      /* istanbul ignore else */
      if (vnode.data.show !== true) {
        leave(vnode, rm);
      } else {
        rm();
      }
    }
  } : {};

  var platformModules = [
    attrs,
    klass,
    events,
    domProps,
    style,
    transition
  ];

  /*  */

  // the directive module should be applied last, after all
  // built-in modules have been applied.
  var modules = platformModules.concat(baseModules);

  var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules });

  /**
   * Not type checking this file because flow doesn't like attaching
   * properties to Elements.
   */

  /* istanbul ignore if */
  if (isIE9) {
    // http://www.matts411.com/post/internet-explorer-9-oninput/
    document.addEventListener('selectionchange', function () {
      var el = document.activeElement;
      if (el && el.vmodel) {
        trigger(el, 'input');
      }
    });
  }

  var directive = {
    inserted: function inserted (el, binding, vnode, oldVnode) {
      if (vnode.tag === 'select') {
        // #6903
        if (oldVnode.elm && !oldVnode.elm._vOptions) {
          mergeVNodeHook(vnode, 'postpatch', function () {
            directive.componentUpdated(el, binding, vnode);
          });
        } else {
          setSelected(el, binding, vnode.context);
        }
        el._vOptions = [].map.call(el.options, getValue);
      } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
        el._vModifiers = binding.modifiers;
        if (!binding.modifiers.lazy) {
          el.addEventListener('compositionstart', onCompositionStart);
          el.addEventListener('compositionend', onCompositionEnd);
          // Safari < 10.2 & UIWebView doesn't fire compositionend when
          // switching focus before confirming composition choice
          // this also fixes the issue where some browsers e.g. iOS Chrome
          // fires "change" instead of "input" on autocomplete.
          el.addEventListener('change', onCompositionEnd);
          /* istanbul ignore if */
          if (isIE9) {
            el.vmodel = true;
          }
        }
      }
    },

    componentUpdated: function componentUpdated (el, binding, vnode) {
      if (vnode.tag === 'select') {
        setSelected(el, binding, vnode.context);
        // in case the options rendered by v-for have changed,
        // it's possible that the value is out-of-sync with the rendered options.
        // detect such cases and filter out values that no longer has a matching
        // option in the DOM.
        var prevOptions = el._vOptions;
        var curOptions = el._vOptions = [].map.call(el.options, getValue);
        if (curOptions.some(function (o, i) { return !looseEqual(o, prevOptions[i]); })) {
          // trigger change event if
          // no matching option found for at least one value
          var needReset = el.multiple
            ? binding.value.some(function (v) { return hasNoMatchingOption(v, curOptions); })
            : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions);
          if (needReset) {
            trigger(el, 'change');
          }
        }
      }
    }
  };

  function setSelected (el, binding, vm) {
    actuallySetSelected(el, binding, vm);
    /* istanbul ignore if */
    if (isIE || isEdge) {
      setTimeout(function () {
        actuallySetSelected(el, binding, vm);
      }, 0);
    }
  }

  function actuallySetSelected (el, binding, vm) {
    var value = binding.value;
    var isMultiple = el.multiple;
    if (isMultiple && !Array.isArray(value)) {
      warn(
        "<select multiple v-model=\"" + (binding.expression) + "\"> " +
        "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
        vm
      );
      return
    }
    var selected, option;
    for (var i = 0, l = el.options.length; i < l; i++) {
      option = el.options[i];
      if (isMultiple) {
        selected = looseIndexOf(value, getValue(option)) > -1;
        if (option.selected !== selected) {
          option.selected = selected;
        }
      } else {
        if (looseEqual(getValue(option), value)) {
          if (el.selectedIndex !== i) {
            el.selectedIndex = i;
          }
          return
        }
      }
    }
    if (!isMultiple) {
      el.selectedIndex = -1;
    }
  }

  function hasNoMatchingOption (value, options) {
    return options.every(function (o) { return !looseEqual(o, value); })
  }

  function getValue (option) {
    return '_value' in option
      ? option._value
      : option.value
  }

  function onCompositionStart (e) {
    e.target.composing = true;
  }

  function onCompositionEnd (e) {
    // prevent triggering an input event for no reason
    if (!e.target.composing) { return }
    e.target.composing = false;
    trigger(e.target, 'input');
  }

  function trigger (el, type) {
    var e = document.createEvent('HTMLEvents');
    e.initEvent(type, true, true);
    el.dispatchEvent(e);
  }

  /*  */

  // recursively search for possible transition defined inside the component root
  function locateNode (vnode) {
    return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
      ? locateNode(vnode.componentInstance._vnode)
      : vnode
  }

  var show = {
    bind: function bind (el, ref, vnode) {
      var value = ref.value;

      vnode = locateNode(vnode);
      var transition$$1 = vnode.data && vnode.data.transition;
      var originalDisplay = el.__vOriginalDisplay =
        el.style.display === 'none' ? '' : el.style.display;
      if (value && transition$$1) {
        vnode.data.show = true;
        enter(vnode, function () {
          el.style.display = originalDisplay;
        });
      } else {
        el.style.display = value ? originalDisplay : 'none';
      }
    },

    update: function update (el, ref, vnode) {
      var value = ref.value;
      var oldValue = ref.oldValue;

      /* istanbul ignore if */
      if (!value === !oldValue) { return }
      vnode = locateNode(vnode);
      var transition$$1 = vnode.data && vnode.data.transition;
      if (transition$$1) {
        vnode.data.show = true;
        if (value) {
          enter(vnode, function () {
            el.style.display = el.__vOriginalDisplay;
          });
        } else {
          leave(vnode, function () {
            el.style.display = 'none';
          });
        }
      } else {
        el.style.display = value ? el.__vOriginalDisplay : 'none';
      }
    },

    unbind: function unbind (
      el,
      binding,
      vnode,
      oldVnode,
      isDestroy
    ) {
      if (!isDestroy) {
        el.style.display = el.__vOriginalDisplay;
      }
    }
  };

  var platformDirectives = {
    model: directive,
    show: show
  };

  /*  */

  var transitionProps = {
    name: String,
    appear: Boolean,
    css: Boolean,
    mode: String,
    type: String,
    enterClass: String,
    leaveClass: String,
    enterToClass: String,
    leaveToClass: String,
    enterActiveClass: String,
    leaveActiveClass: String,
    appearClass: String,
    appearActiveClass: String,
    appearToClass: String,
    duration: [Number, String, Object]
  };

  // in case the child is also an abstract component, e.g. <keep-alive>
  // we want to recursively retrieve the real component to be rendered
  function getRealChild (vnode) {
    var compOptions = vnode && vnode.componentOptions;
    if (compOptions && compOptions.Ctor.options.abstract) {
      return getRealChild(getFirstComponentChild(compOptions.children))
    } else {
      return vnode
    }
  }

  function extractTransitionData (comp) {
    var data = {};
    var options = comp.$options;
    // props
    for (var key in options.propsData) {
      data[key] = comp[key];
    }
    // events.
    // extract listeners and pass them directly to the transition methods
    var listeners = options._parentListeners;
    for (var key$1 in listeners) {
      data[camelize(key$1)] = listeners[key$1];
    }
    return data
  }

  function placeholder (h, rawChild) {
    if (/\d-keep-alive$/.test(rawChild.tag)) {
      return h('keep-alive', {
        props: rawChild.componentOptions.propsData
      })
    }
  }

  function hasParentTransition (vnode) {
    while ((vnode = vnode.parent)) {
      if (vnode.data.transition) {
        return true
      }
    }
  }

  function isSameChild (child, oldChild) {
    return oldChild.key === child.key && oldChild.tag === child.tag
  }

  var isNotTextNode = function (c) { return c.tag || isAsyncPlaceholder(c); };

  var isVShowDirective = function (d) { return d.name === 'show'; };

  var Transition = {
    name: 'transition',
    props: transitionProps,
    abstract: true,

    render: function render (h) {
      var this$1 = this;

      var children = this.$slots.default;
      if (!children) {
        return
      }

      // filter out text nodes (possible whitespaces)
      children = children.filter(isNotTextNode);
      /* istanbul ignore if */
      if (!children.length) {
        return
      }

      // warn multiple elements
      if (children.length > 1) {
        warn(
          '<transition> can only be used on a single element. Use ' +
          '<transition-group> for lists.',
          this.$parent
        );
      }

      var mode = this.mode;

      // warn invalid mode
      if (mode && mode !== 'in-out' && mode !== 'out-in'
      ) {
        warn(
          'invalid <transition> mode: ' + mode,
          this.$parent
        );
      }

      var rawChild = children[0];

      // if this is a component root node and the component's
      // parent container node also has transition, skip.
      if (hasParentTransition(this.$vnode)) {
        return rawChild
      }

      // apply transition data to child
      // use getRealChild() to ignore abstract components e.g. keep-alive
      var child = getRealChild(rawChild);
      /* istanbul ignore if */
      if (!child) {
        return rawChild
      }

      if (this._leaving) {
        return placeholder(h, rawChild)
      }

      // ensure a key that is unique to the vnode type and to this transition
      // component instance. This key will be used to remove pending leaving nodes
      // during entering.
      var id = "__transition-" + (this._uid) + "-";
      child.key = child.key == null
        ? child.isComment
          ? id + 'comment'
          : id + child.tag
        : isPrimitive(child.key)
          ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
          : child.key;

      var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
      var oldRawChild = this._vnode;
      var oldChild = getRealChild(oldRawChild);

      // mark v-show
      // so that the transition module can hand over the control to the directive
      if (child.data.directives && child.data.directives.some(isVShowDirective)) {
        child.data.show = true;
      }

      if (
        oldChild &&
        oldChild.data &&
        !isSameChild(child, oldChild) &&
        !isAsyncPlaceholder(oldChild) &&
        // #6687 component root is a comment node
        !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)
      ) {
        // replace old child transition data with fresh one
        // important for dynamic transitions!
        var oldData = oldChild.data.transition = extend({}, data);
        // handle transition mode
        if (mode === 'out-in') {
          // return placeholder node and queue update when leave finishes
          this._leaving = true;
          mergeVNodeHook(oldData, 'afterLeave', function () {
            this$1._leaving = false;
            this$1.$forceUpdate();
          });
          return placeholder(h, rawChild)
        } else if (mode === 'in-out') {
          if (isAsyncPlaceholder(child)) {
            return oldRawChild
          }
          var delayedLeave;
          var performLeave = function () { delayedLeave(); };
          mergeVNodeHook(data, 'afterEnter', performLeave);
          mergeVNodeHook(data, 'enterCancelled', performLeave);
          mergeVNodeHook(oldData, 'delayLeave', function (leave) { delayedLeave = leave; });
        }
      }

      return rawChild
    }
  };

  /*  */

  var props = extend({
    tag: String,
    moveClass: String
  }, transitionProps);

  delete props.mode;

  var TransitionGroup = {
    props: props,

    beforeMount: function beforeMount () {
      var this$1 = this;

      var update = this._update;
      this._update = function (vnode, hydrating) {
        var restoreActiveInstance = setActiveInstance(this$1);
        // force removing pass
        this$1.__patch__(
          this$1._vnode,
          this$1.kept,
          false, // hydrating
          true // removeOnly (!important, avoids unnecessary moves)
        );
        this$1._vnode = this$1.kept;
        restoreActiveInstance();
        update.call(this$1, vnode, hydrating);
      };
    },

    render: function render (h) {
      var tag = this.tag || this.$vnode.data.tag || 'span';
      var map = Object.create(null);
      var prevChildren = this.prevChildren = this.children;
      var rawChildren = this.$slots.default || [];
      var children = this.children = [];
      var transitionData = extractTransitionData(this);

      for (var i = 0; i < rawChildren.length; i++) {
        var c = rawChildren[i];
        if (c.tag) {
          if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
            children.push(c);
            map[c.key] = c
            ;(c.data || (c.data = {})).transition = transitionData;
          } else {
            var opts = c.componentOptions;
            var name = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag;
            warn(("<transition-group> children must be keyed: <" + name + ">"));
          }
        }
      }

      if (prevChildren) {
        var kept = [];
        var removed = [];
        for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
          var c$1 = prevChildren[i$1];
          c$1.data.transition = transitionData;
          c$1.data.pos = c$1.elm.getBoundingClientRect();
          if (map[c$1.key]) {
            kept.push(c$1);
          } else {
            removed.push(c$1);
          }
        }
        this.kept = h(tag, null, kept);
        this.removed = removed;
      }

      return h(tag, null, children)
    },

    updated: function updated () {
      var children = this.prevChildren;
      var moveClass = this.moveClass || ((this.name || 'v') + '-move');
      if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
        return
      }

      // we divide the work into three loops to avoid mixing DOM reads and writes
      // in each iteration - which helps prevent layout thrashing.
      children.forEach(callPendingCbs);
      children.forEach(recordPosition);
      children.forEach(applyTranslation);

      // force reflow to put everything in position
      // assign to this to avoid being removed in tree-shaking
      // $flow-disable-line
      this._reflow = document.body.offsetHeight;

      children.forEach(function (c) {
        if (c.data.moved) {
          var el = c.elm;
          var s = el.style;
          addTransitionClass(el, moveClass);
          s.transform = s.WebkitTransform = s.transitionDuration = '';
          el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
            if (e && e.target !== el) {
              return
            }
            if (!e || /transform$/.test(e.propertyName)) {
              el.removeEventListener(transitionEndEvent, cb);
              el._moveCb = null;
              removeTransitionClass(el, moveClass);
            }
          });
        }
      });
    },

    methods: {
      hasMove: function hasMove (el, moveClass) {
        /* istanbul ignore if */
        if (!hasTransition) {
          return false
        }
        /* istanbul ignore if */
        if (this._hasMove) {
          return this._hasMove
        }
        // Detect whether an element with the move class applied has
        // CSS transitions. Since the element may be inside an entering
        // transition at this very moment, we make a clone of it and remove
        // all other transition classes applied to ensure only the move class
        // is applied.
        var clone = el.cloneNode();
        if (el._transitionClasses) {
          el._transitionClasses.forEach(function (cls) { removeClass(clone, cls); });
        }
        addClass(clone, moveClass);
        clone.style.display = 'none';
        this.$el.appendChild(clone);
        var info = getTransitionInfo(clone);
        this.$el.removeChild(clone);
        return (this._hasMove = info.hasTransform)
      }
    }
  };

  function callPendingCbs (c) {
    /* istanbul ignore if */
    if (c.elm._moveCb) {
      c.elm._moveCb();
    }
    /* istanbul ignore if */
    if (c.elm._enterCb) {
      c.elm._enterCb();
    }
  }

  function recordPosition (c) {
    c.data.newPos = c.elm.getBoundingClientRect();
  }

  function applyTranslation (c) {
    var oldPos = c.data.pos;
    var newPos = c.data.newPos;
    var dx = oldPos.left - newPos.left;
    var dy = oldPos.top - newPos.top;
    if (dx || dy) {
      c.data.moved = true;
      var s = c.elm.style;
      s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
      s.transitionDuration = '0s';
    }
  }

  var platformComponents = {
    Transition: Transition,
    TransitionGroup: TransitionGroup
  };

  /*  */

  // install platform specific utils
  Vue.config.mustUseProp = mustUseProp;
  Vue.config.isReservedTag = isReservedTag;
  Vue.config.isReservedAttr = isReservedAttr;
  Vue.config.getTagNamespace = getTagNamespace;
  Vue.config.isUnknownElement = isUnknownElement;

  // install platform runtime directives & components
  extend(Vue.options.directives, platformDirectives);
  extend(Vue.options.components, platformComponents);

  // install platform patch function
  Vue.prototype.__patch__ = inBrowser ? patch : noop;

  // public mount method
  Vue.prototype.$mount = function (
    el,
    hydrating
  ) {
    el = el && inBrowser ? query(el) : undefined;
    return mountComponent(this, el, hydrating)
  };

  // devtools global hook
  /* istanbul ignore next */
  if (inBrowser) {
    setTimeout(function () {
      if (config.devtools) {
        if (devtools) {
          devtools.emit('init', Vue);
        } else {
          console[console.info ? 'info' : 'log'](
            'Download the Vue Devtools extension for a better development experience:\n' +
            'https://github.com/vuejs/vue-devtools'
          );
        }
      }
      if (config.productionTip !== false &&
        typeof console !== 'undefined'
      ) {
        console[console.info ? 'info' : 'log'](
          "You are running Vue in development mode.\n" +
          "Make sure to turn on production mode when deploying for production.\n" +
          "See more tips at https://vuejs.org/guide/deployment.html"
        );
      }
    }, 0);
  }

  /*  */

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
  var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

  var buildRegex = cached(function (delimiters) {
    var open = delimiters[0].replace(regexEscapeRE, '\\$&');
    var close = delimiters[1].replace(regexEscapeRE, '\\$&');
    return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
  });



  function parseText (
    text,
    delimiters
  ) {
    var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
    if (!tagRE.test(text)) {
      return
    }
    var tokens = [];
    var rawTokens = [];
    var lastIndex = tagRE.lastIndex = 0;
    var match, index, tokenValue;
    while ((match = tagRE.exec(text))) {
      index = match.index;
      // push text token
      if (index > lastIndex) {
        rawTokens.push(tokenValue = text.slice(lastIndex, index));
        tokens.push(JSON.stringify(tokenValue));
      }
      // tag token
      var exp = parseFilters(match[1].trim());
      tokens.push(("_s(" + exp + ")"));
      rawTokens.push({ '@binding': exp });
      lastIndex = index + match[0].length;
    }
    if (lastIndex < text.length) {
      rawTokens.push(tokenValue = text.slice(lastIndex));
      tokens.push(JSON.stringify(tokenValue));
    }
    return {
      expression: tokens.join('+'),
      tokens: rawTokens
    }
  }

  /*  */

  function transformNode (el, options) {
    var warn = options.warn || baseWarn;
    var staticClass = getAndRemoveAttr(el, 'class');
    if (staticClass) {
      var res = parseText(staticClass, options.delimiters);
      if (res) {
        warn(
          "class=\"" + staticClass + "\": " +
          'Interpolation inside attributes has been removed. ' +
          'Use v-bind or the colon shorthand instead. For example, ' +
          'instead of <div class="{{ val }}">, use <div :class="val">.',
          el.rawAttrsMap['class']
        );
      }
    }
    if (staticClass) {
      el.staticClass = JSON.stringify(staticClass);
    }
    var classBinding = getBindingAttr(el, 'class', false /* getStatic */);
    if (classBinding) {
      el.classBinding = classBinding;
    }
  }

  function genData (el) {
    var data = '';
    if (el.staticClass) {
      data += "staticClass:" + (el.staticClass) + ",";
    }
    if (el.classBinding) {
      data += "class:" + (el.classBinding) + ",";
    }
    return data
  }

  var klass$1 = {
    staticKeys: ['staticClass'],
    transformNode: transformNode,
    genData: genData
  };

  /*  */

  function transformNode$1 (el, options) {
    var warn = options.warn || baseWarn;
    var staticStyle = getAndRemoveAttr(el, 'style');
    if (staticStyle) {
      /* istanbul ignore if */
      {
        var res = parseText(staticStyle, options.delimiters);
        if (res) {
          warn(
            "style=\"" + staticStyle + "\": " +
            'Interpolation inside attributes has been removed. ' +
            'Use v-bind or the colon shorthand instead. For example, ' +
            'instead of <div style="{{ val }}">, use <div :style="val">.',
            el.rawAttrsMap['style']
          );
        }
      }
      el.staticStyle = JSON.stringify(parseStyleText(staticStyle));
    }

    var styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
    if (styleBinding) {
      el.styleBinding = styleBinding;
    }
  }

  function genData$1 (el) {
    var data = '';
    if (el.staticStyle) {
      data += "staticStyle:" + (el.staticStyle) + ",";
    }
    if (el.styleBinding) {
      data += "style:(" + (el.styleBinding) + "),";
    }
    return data
  }

  var style$1 = {
    staticKeys: ['staticStyle'],
    transformNode: transformNode$1,
    genData: genData$1
  };

  /*  */

  var decoder;

  var he = {
    decode: function decode (html) {
      decoder = decoder || document.createElement('div');
      decoder.innerHTML = html;
      return decoder.textContent
    }
  };

  /*  */

  var isUnaryTag = makeMap(
    'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
    'link,meta,param,source,track,wbr'
  );

  // Elements that you can, intentionally, leave open
  // (and which close themselves)
  var canBeLeftOpenTag = makeMap(
    'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
  );

  // HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
  // Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
  var isNonPhrasingTag = makeMap(
    'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
    'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
    'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
    'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
    'title,tr,track'
  );

  /**
   * Not type-checking this file because it's mostly vendor code.
   */

  // Regular Expressions for parsing tags and attributes
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  var dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z" + (unicodeRegExp.source) + "]*";
  var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
  var startTagOpen = new RegExp(("^<" + qnameCapture));
  var startTagClose = /^\s*(\/?)>/;
  var endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>"));
  var doctype = /^<!DOCTYPE [^>]+>/i;
  // #7298: escape - to avoid being passed as HTML comment when inlined in page
  var comment = /^<!\--/;
  var conditionalComment = /^<!\[/;

  // Special Elements (can contain anything)
  var isPlainTextElement = makeMap('script,style,textarea', true);
  var reCache = {};

  var decodingMap = {
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&amp;': '&',
    '&#10;': '\n',
    '&#9;': '\t',
    '&#39;': "'"
  };
  var encodedAttr = /&(?:lt|gt|quot|amp|#39);/g;
  var encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g;

  // #5992
  var isIgnoreNewlineTag = makeMap('pre,textarea', true);
  var shouldIgnoreFirstNewline = function (tag, html) { return tag && isIgnoreNewlineTag(tag) && html[0] === '\n'; };

  function decodeAttr (value, shouldDecodeNewlines) {
    var re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
    return value.replace(re, function (match) { return decodingMap[match]; })
  }

  function parseHTML (html, options) {
    var stack = [];
    var expectHTML = options.expectHTML;
    var isUnaryTag$$1 = options.isUnaryTag || no;
    var canBeLeftOpenTag$$1 = options.canBeLeftOpenTag || no;
    var index = 0;
    var last, lastTag;
    while (html) {
      last = html;
      // Make sure we're not in a plaintext content element like script/style
      if (!lastTag || !isPlainTextElement(lastTag)) {
        var textEnd = html.indexOf('<');
        if (textEnd === 0) {
          // Comment:
          if (comment.test(html)) {
            var commentEnd = html.indexOf('-->');

            if (commentEnd >= 0) {
              if (options.shouldKeepComment) {
                options.comment(html.substring(4, commentEnd), index, index + commentEnd + 3);
              }
              advance(commentEnd + 3);
              continue
            }
          }

          // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
          if (conditionalComment.test(html)) {
            var conditionalEnd = html.indexOf(']>');

            if (conditionalEnd >= 0) {
              advance(conditionalEnd + 2);
              continue
            }
          }

          // Doctype:
          var doctypeMatch = html.match(doctype);
          if (doctypeMatch) {
            advance(doctypeMatch[0].length);
            continue
          }

          // End tag:
          var endTagMatch = html.match(endTag);
          if (endTagMatch) {
            var curIndex = index;
            advance(endTagMatch[0].length);
            parseEndTag(endTagMatch[1], curIndex, index);
            continue
          }

          // Start tag:
          var startTagMatch = parseStartTag();
          if (startTagMatch) {
            handleStartTag(startTagMatch);
            if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
              advance(1);
            }
            continue
          }
        }

        var text = (void 0), rest = (void 0), next = (void 0);
        if (textEnd >= 0) {
          rest = html.slice(textEnd);
          while (
            !endTag.test(rest) &&
            !startTagOpen.test(rest) &&
            !comment.test(rest) &&
            !conditionalComment.test(rest)
          ) {
            // < in plain text, be forgiving and treat it as text
            next = rest.indexOf('<', 1);
            if (next < 0) { break }
            textEnd += next;
            rest = html.slice(textEnd);
          }
          text = html.substring(0, textEnd);
        }

        if (textEnd < 0) {
          text = html;
        }

        if (text) {
          advance(text.length);
        }

        if (options.chars && text) {
          options.chars(text, index - text.length, index);
        }
      } else {
        var endTagLength = 0;
        var stackedTag = lastTag.toLowerCase();
        var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
        var rest$1 = html.replace(reStackedTag, function (all, text, endTag) {
          endTagLength = endTag.length;
          if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
            text = text
              .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
              .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
          }
          if (shouldIgnoreFirstNewline(stackedTag, text)) {
            text = text.slice(1);
          }
          if (options.chars) {
            options.chars(text);
          }
          return ''
        });
        index += html.length - rest$1.length;
        html = rest$1;
        parseEndTag(stackedTag, index - endTagLength, index);
      }

      if (html === last) {
        options.chars && options.chars(html);
        if (!stack.length && options.warn) {
          options.warn(("Mal-formatted tag at end of template: \"" + html + "\""), { start: index + html.length });
        }
        break
      }
    }

    // Clean up any remaining tags
    parseEndTag();

    function advance (n) {
      index += n;
      html = html.substring(n);
    }

    function parseStartTag () {
      var start = html.match(startTagOpen);
      if (start) {
        var match = {
          tagName: start[1],
          attrs: [],
          start: index
        };
        advance(start[0].length);
        var end, attr;
        while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
          attr.start = index;
          advance(attr[0].length);
          attr.end = index;
          match.attrs.push(attr);
        }
        if (end) {
          match.unarySlash = end[1];
          advance(end[0].length);
          match.end = index;
          return match
        }
      }
    }

    function handleStartTag (match) {
      var tagName = match.tagName;
      var unarySlash = match.unarySlash;

      if (expectHTML) {
        if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
          parseEndTag(lastTag);
        }
        if (canBeLeftOpenTag$$1(tagName) && lastTag === tagName) {
          parseEndTag(tagName);
        }
      }

      var unary = isUnaryTag$$1(tagName) || !!unarySlash;

      var l = match.attrs.length;
      var attrs = new Array(l);
      for (var i = 0; i < l; i++) {
        var args = match.attrs[i];
        var value = args[3] || args[4] || args[5] || '';
        var shouldDecodeNewlines = tagName === 'a' && args[1] === 'href'
          ? options.shouldDecodeNewlinesForHref
          : options.shouldDecodeNewlines;
        attrs[i] = {
          name: args[1],
          value: decodeAttr(value, shouldDecodeNewlines)
        };
        if (options.outputSourceRange) {
          attrs[i].start = args.start + args[0].match(/^\s*/).length;
          attrs[i].end = args.end;
        }
      }

      if (!unary) {
        stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs, start: match.start, end: match.end });
        lastTag = tagName;
      }

      if (options.start) {
        options.start(tagName, attrs, unary, match.start, match.end);
      }
    }

    function parseEndTag (tagName, start, end) {
      var pos, lowerCasedTagName;
      if (start == null) { start = index; }
      if (end == null) { end = index; }

      // Find the closest opened tag of the same type
      if (tagName) {
        lowerCasedTagName = tagName.toLowerCase();
        for (pos = stack.length - 1; pos >= 0; pos--) {
          if (stack[pos].lowerCasedTag === lowerCasedTagName) {
            break
          }
        }
      } else {
        // If no tag name is provided, clean shop
        pos = 0;
      }

      if (pos >= 0) {
        // Close all the open elements, up the stack
        for (var i = stack.length - 1; i >= pos; i--) {
          if (i > pos || !tagName &&
            options.warn
          ) {
            options.warn(
              ("tag <" + (stack[i].tag) + "> has no matching end tag."),
              { start: stack[i].start, end: stack[i].end }
            );
          }
          if (options.end) {
            options.end(stack[i].tag, start, end);
          }
        }

        // Remove the open elements from the stack
        stack.length = pos;
        lastTag = pos && stack[pos - 1].tag;
      } else if (lowerCasedTagName === 'br') {
        if (options.start) {
          options.start(tagName, [], true, start, end);
        }
      } else if (lowerCasedTagName === 'p') {
        if (options.start) {
          options.start(tagName, [], false, start, end);
        }
        if (options.end) {
          options.end(tagName, start, end);
        }
      }
    }
  }

  /*  */

  var onRE = /^@|^v-on:/;
  var dirRE = /^v-|^@|^:|^#/;
  var forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
  var forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
  var stripParensRE = /^\(|\)$/g;
  var dynamicArgRE = /^\[.*\]$/;

  var argRE = /:(.*)$/;
  var bindRE = /^:|^\.|^v-bind:/;
  var modifierRE = /\.[^.\]]+(?=[^\]]*$)/g;

  var slotRE = /^v-slot(:|$)|^#/;

  var lineBreakRE = /[\r\n]/;
  var whitespaceRE$1 = /[ \f\t\r\n]+/g;

  var invalidAttributeRE = /[\s"'<>\/=]/;

  var decodeHTMLCached = cached(he.decode);

  var emptySlotScopeToken = "_empty_";

  // configurable state
  var warn$2;
  var delimiters;
  var transforms;
  var preTransforms;
  var postTransforms;
  var platformIsPreTag;
  var platformMustUseProp;
  var platformGetTagNamespace;
  var maybeComponent;

  function createASTElement (
    tag,
    attrs,
    parent
  ) {
    return {
      type: 1,
      tag: tag,
      attrsList: attrs,
      attrsMap: makeAttrsMap(attrs),
      rawAttrsMap: {},
      parent: parent,
      children: []
    }
  }

  /**
   * Convert HTML string to AST.
   */
  function parse (
    template,
    options
  ) {
    warn$2 = options.warn || baseWarn;

    platformIsPreTag = options.isPreTag || no;
    platformMustUseProp = options.mustUseProp || no;
    platformGetTagNamespace = options.getTagNamespace || no;
    var isReservedTag = options.isReservedTag || no;
    maybeComponent = function (el) { return !!(
      el.component ||
      el.attrsMap[':is'] ||
      el.attrsMap['v-bind:is'] ||
      !(el.attrsMap.is ? isReservedTag(el.attrsMap.is) : isReservedTag(el.tag))
    ); };
    transforms = pluckModuleFunction(options.modules, 'transformNode');
    preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
    postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');

    delimiters = options.delimiters;

    var stack = [];
    var preserveWhitespace = options.preserveWhitespace !== false;
    var whitespaceOption = options.whitespace;
    var root;
    var currentParent;
    var inVPre = false;
    var inPre = false;
    var warned = false;

    function warnOnce (msg, range) {
      if (!warned) {
        warned = true;
        warn$2(msg, range);
      }
    }

    function closeElement (element) {
      trimEndingWhitespace(element);
      if (!inVPre && !element.processed) {
        element = processElement(element, options);
      }
      // tree management
      if (!stack.length && element !== root) {
        // allow root elements with v-if, v-else-if and v-else
        if (root.if && (element.elseif || element.else)) {
          {
            checkRootConstraints(element);
          }
          addIfCondition(root, {
            exp: element.elseif,
            block: element
          });
        } else {
          warnOnce(
            "Component template should contain exactly one root element. " +
            "If you are using v-if on multiple elements, " +
            "use v-else-if to chain them instead.",
            { start: element.start }
          );
        }
      }
      if (currentParent && !element.forbidden) {
        if (element.elseif || element.else) {
          processIfConditions(element, currentParent);
        } else {
          if (element.slotScope) {
            // scoped slot
            // keep it in the children list so that v-else(-if) conditions can
            // find it as the prev node.
            var name = element.slotTarget || '"default"'
            ;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
          }
          currentParent.children.push(element);
          element.parent = currentParent;
        }
      }

      // final children cleanup
      // filter out scoped slots
      element.children = element.children.filter(function (c) { return !(c).slotScope; });
      // remove trailing whitespace node again
      trimEndingWhitespace(element);

      // check pre state
      if (element.pre) {
        inVPre = false;
      }
      if (platformIsPreTag(element.tag)) {
        inPre = false;
      }
      // apply post-transforms
      for (var i = 0; i < postTransforms.length; i++) {
        postTransforms[i](element, options);
      }
    }

    function trimEndingWhitespace (el) {
      // remove trailing whitespace node
      if (!inPre) {
        var lastNode;
        while (
          (lastNode = el.children[el.children.length - 1]) &&
          lastNode.type === 3 &&
          lastNode.text === ' '
        ) {
          el.children.pop();
        }
      }
    }

    function checkRootConstraints (el) {
      if (el.tag === 'slot' || el.tag === 'template') {
        warnOnce(
          "Cannot use <" + (el.tag) + "> as component root element because it may " +
          'contain multiple nodes.',
          { start: el.start }
        );
      }
      if (el.attrsMap.hasOwnProperty('v-for')) {
        warnOnce(
          'Cannot use v-for on stateful component root element because ' +
          'it renders multiple elements.',
          el.rawAttrsMap['v-for']
        );
      }
    }

    parseHTML(template, {
      warn: warn$2,
      expectHTML: options.expectHTML,
      isUnaryTag: options.isUnaryTag,
      canBeLeftOpenTag: options.canBeLeftOpenTag,
      shouldDecodeNewlines: options.shouldDecodeNewlines,
      shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
      shouldKeepComment: options.comments,
      outputSourceRange: options.outputSourceRange,
      start: function start (tag, attrs, unary, start$1, end) {
        // check namespace.
        // inherit parent ns if there is one
        var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);

        // handle IE svg bug
        /* istanbul ignore if */
        if (isIE && ns === 'svg') {
          attrs = guardIESVGBug(attrs);
        }

        var element = createASTElement(tag, attrs, currentParent);
        if (ns) {
          element.ns = ns;
        }

        {
          if (options.outputSourceRange) {
            element.start = start$1;
            element.end = end;
            element.rawAttrsMap = element.attrsList.reduce(function (cumulated, attr) {
              cumulated[attr.name] = attr;
              return cumulated
            }, {});
          }
          attrs.forEach(function (attr) {
            if (invalidAttributeRE.test(attr.name)) {
              warn$2(
                "Invalid dynamic argument expression: attribute names cannot contain " +
                "spaces, quotes, <, >, / or =.",
                {
                  start: attr.start + attr.name.indexOf("["),
                  end: attr.start + attr.name.length
                }
              );
            }
          });
        }

        if (isForbiddenTag(element) && !isServerRendering()) {
          element.forbidden = true;
          warn$2(
            'Templates should only be responsible for mapping the state to the ' +
            'UI. Avoid placing tags with side-effects in your templates, such as ' +
            "<" + tag + ">" + ', as they will not be parsed.',
            { start: element.start }
          );
        }

        // apply pre-transforms
        for (var i = 0; i < preTransforms.length; i++) {
          element = preTransforms[i](element, options) || element;
        }

        if (!inVPre) {
          processPre(element);
          if (element.pre) {
            inVPre = true;
          }
        }
        if (platformIsPreTag(element.tag)) {
          inPre = true;
        }
        if (inVPre) {
          processRawAttrs(element);
        } else if (!element.processed) {
          // structural directives
          processFor(element);
          processIf(element);
          processOnce(element);
        }

        if (!root) {
          root = element;
          {
            checkRootConstraints(root);
          }
        }

        if (!unary) {
          currentParent = element;
          stack.push(element);
        } else {
          closeElement(element);
        }
      },

      end: function end (tag, start, end$1) {
        var element = stack[stack.length - 1];
        // pop stack
        stack.length -= 1;
        currentParent = stack[stack.length - 1];
        if (options.outputSourceRange) {
          element.end = end$1;
        }
        closeElement(element);
      },

      chars: function chars (text, start, end) {
        if (!currentParent) {
          {
            if (text === template) {
              warnOnce(
                'Component template requires a root element, rather than just text.',
                { start: start }
              );
            } else if ((text = text.trim())) {
              warnOnce(
                ("text \"" + text + "\" outside root element will be ignored."),
                { start: start }
              );
            }
          }
          return
        }
        // IE textarea placeholder bug
        /* istanbul ignore if */
        if (isIE &&
          currentParent.tag === 'textarea' &&
          currentParent.attrsMap.placeholder === text
        ) {
          return
        }
        var children = currentParent.children;
        if (inPre || text.trim()) {
          text = isTextTag(currentParent) ? text : decodeHTMLCached(text);
        } else if (!children.length) {
          // remove the whitespace-only node right after an opening tag
          text = '';
        } else if (whitespaceOption) {
          if (whitespaceOption === 'condense') {
            // in condense mode, remove the whitespace node if it contains
            // line break, otherwise condense to a single space
            text = lineBreakRE.test(text) ? '' : ' ';
          } else {
            text = ' ';
          }
        } else {
          text = preserveWhitespace ? ' ' : '';
        }
        if (text) {
          if (!inPre && whitespaceOption === 'condense') {
            // condense consecutive whitespaces into single space
            text = text.replace(whitespaceRE$1, ' ');
          }
          var res;
          var child;
          if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) {
            child = {
              type: 2,
              expression: res.expression,
              tokens: res.tokens,
              text: text
            };
          } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
            child = {
              type: 3,
              text: text
            };
          }
          if (child) {
            if (options.outputSourceRange) {
              child.start = start;
              child.end = end;
            }
            children.push(child);
          }
        }
      },
      comment: function comment (text, start, end) {
        // adding anything as a sibling to the root node is forbidden
        // comments should still be allowed, but ignored
        if (currentParent) {
          var child = {
            type: 3,
            text: text,
            isComment: true
          };
          if (options.outputSourceRange) {
            child.start = start;
            child.end = end;
          }
          currentParent.children.push(child);
        }
      }
    });
    return root
  }

  function processPre (el) {
    if (getAndRemoveAttr(el, 'v-pre') != null) {
      el.pre = true;
    }
  }

  function processRawAttrs (el) {
    var list = el.attrsList;
    var len = list.length;
    if (len) {
      var attrs = el.attrs = new Array(len);
      for (var i = 0; i < len; i++) {
        attrs[i] = {
          name: list[i].name,
          value: JSON.stringify(list[i].value)
        };
        if (list[i].start != null) {
          attrs[i].start = list[i].start;
          attrs[i].end = list[i].end;
        }
      }
    } else if (!el.pre) {
      // non root node in pre blocks with no attributes
      el.plain = true;
    }
  }

  function processElement (
    element,
    options
  ) {
    processKey(element);

    // determine whether this is a plain element after
    // removing structural attributes
    element.plain = (
      !element.key &&
      !element.scopedSlots &&
      !element.attrsList.length
    );

    processRef(element);
    processSlotContent(element);
    processSlotOutlet(element);
    processComponent(element);
    for (var i = 0; i < transforms.length; i++) {
      element = transforms[i](element, options) || element;
    }
    processAttrs(element);
    return element
  }

  function processKey (el) {
    var exp = getBindingAttr(el, 'key');
    if (exp) {
      {
        if (el.tag === 'template') {
          warn$2(
            "<template> cannot be keyed. Place the key on real elements instead.",
            getRawBindingAttr(el, 'key')
          );
        }
        if (el.for) {
          var iterator = el.iterator2 || el.iterator1;
          var parent = el.parent;
          if (iterator && iterator === exp && parent && parent.tag === 'transition-group') {
            warn$2(
              "Do not use v-for index as key on <transition-group> children, " +
              "this is the same as not using keys.",
              getRawBindingAttr(el, 'key'),
              true /* tip */
            );
          }
        }
      }
      el.key = exp;
    }
  }

  function processRef (el) {
    var ref = getBindingAttr(el, 'ref');
    if (ref) {
      el.ref = ref;
      el.refInFor = checkInFor(el);
    }
  }

  function processFor (el) {
    var exp;
    if ((exp = getAndRemoveAttr(el, 'v-for'))) {
      var res = parseFor(exp);
      if (res) {
        extend(el, res);
      } else {
        warn$2(
          ("Invalid v-for expression: " + exp),
          el.rawAttrsMap['v-for']
        );
      }
    }
  }



  function parseFor (exp) {
    var inMatch = exp.match(forAliasRE);
    if (!inMatch) { return }
    var res = {};
    res.for = inMatch[2].trim();
    var alias = inMatch[1].trim().replace(stripParensRE, '');
    var iteratorMatch = alias.match(forIteratorRE);
    if (iteratorMatch) {
      res.alias = alias.replace(forIteratorRE, '').trim();
      res.iterator1 = iteratorMatch[1].trim();
      if (iteratorMatch[2]) {
        res.iterator2 = iteratorMatch[2].trim();
      }
    } else {
      res.alias = alias;
    }
    return res
  }

  function processIf (el) {
    var exp = getAndRemoveAttr(el, 'v-if');
    if (exp) {
      el.if = exp;
      addIfCondition(el, {
        exp: exp,
        block: el
      });
    } else {
      if (getAndRemoveAttr(el, 'v-else') != null) {
        el.else = true;
      }
      var elseif = getAndRemoveAttr(el, 'v-else-if');
      if (elseif) {
        el.elseif = elseif;
      }
    }
  }

  function processIfConditions (el, parent) {
    var prev = findPrevElement(parent.children);
    if (prev && prev.if) {
      addIfCondition(prev, {
        exp: el.elseif,
        block: el
      });
    } else {
      warn$2(
        "v-" + (el.elseif ? ('else-if="' + el.elseif + '"') : 'else') + " " +
        "used on element <" + (el.tag) + "> without corresponding v-if.",
        el.rawAttrsMap[el.elseif ? 'v-else-if' : 'v-else']
      );
    }
  }

  function findPrevElement (children) {
    var i = children.length;
    while (i--) {
      if (children[i].type === 1) {
        return children[i]
      } else {
        if (children[i].text !== ' ') {
          warn$2(
            "text \"" + (children[i].text.trim()) + "\" between v-if and v-else(-if) " +
            "will be ignored.",
            children[i]
          );
        }
        children.pop();
      }
    }
  }

  function addIfCondition (el, condition) {
    if (!el.ifConditions) {
      el.ifConditions = [];
    }
    el.ifConditions.push(condition);
  }

  function processOnce (el) {
    var once$$1 = getAndRemoveAttr(el, 'v-once');
    if (once$$1 != null) {
      el.once = true;
    }
  }

  // handle content being passed to a component as slot,
  // e.g. <template slot="xxx">, <div slot-scope="xxx">
  function processSlotContent (el) {
    var slotScope;
    if (el.tag === 'template') {
      slotScope = getAndRemoveAttr(el, 'scope');
      /* istanbul ignore if */
      if (slotScope) {
        warn$2(
          "the \"scope\" attribute for scoped slots have been deprecated and " +
          "replaced by \"slot-scope\" since 2.5. The new \"slot-scope\" attribute " +
          "can also be used on plain elements in addition to <template> to " +
          "denote scoped slots.",
          el.rawAttrsMap['scope'],
          true
        );
      }
      el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope');
    } else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
      /* istanbul ignore if */
      if (el.attrsMap['v-for']) {
        warn$2(
          "Ambiguous combined usage of slot-scope and v-for on <" + (el.tag) + "> " +
          "(v-for takes higher priority). Use a wrapper <template> for the " +
          "scoped slot to make it clearer.",
          el.rawAttrsMap['slot-scope'],
          true
        );
      }
      el.slotScope = slotScope;
    }

    // slot="xxx"
    var slotTarget = getBindingAttr(el, 'slot');
    if (slotTarget) {
      el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget;
      el.slotTargetDynamic = !!(el.attrsMap[':slot'] || el.attrsMap['v-bind:slot']);
      // preserve slot as an attribute for native shadow DOM compat
      // only for non-scoped slots.
      if (el.tag !== 'template' && !el.slotScope) {
        addAttr(el, 'slot', slotTarget, getRawBindingAttr(el, 'slot'));
      }
    }

    // 2.6 v-slot syntax
    {
      if (el.tag === 'template') {
        // v-slot on <template>
        var slotBinding = getAndRemoveAttrByRegex(el, slotRE);
        if (slotBinding) {
          {
            if (el.slotTarget || el.slotScope) {
              warn$2(
                "Unexpected mixed usage of different slot syntaxes.",
                el
              );
            }
            if (el.parent && !maybeComponent(el.parent)) {
              warn$2(
                "<template v-slot> can only appear at the root level inside " +
                "the receiving component",
                el
              );
            }
          }
          var ref = getSlotName(slotBinding);
          var name = ref.name;
          var dynamic = ref.dynamic;
          el.slotTarget = name;
          el.slotTargetDynamic = dynamic;
          el.slotScope = slotBinding.value || emptySlotScopeToken; // force it into a scoped slot for perf
        }
      } else {
        // v-slot on component, denotes default slot
        var slotBinding$1 = getAndRemoveAttrByRegex(el, slotRE);
        if (slotBinding$1) {
          {
            if (!maybeComponent(el)) {
              warn$2(
                "v-slot can only be used on components or <template>.",
                slotBinding$1
              );
            }
            if (el.slotScope || el.slotTarget) {
              warn$2(
                "Unexpected mixed usage of different slot syntaxes.",
                el
              );
            }
            if (el.scopedSlots) {
              warn$2(
                "To avoid scope ambiguity, the default slot should also use " +
                "<template> syntax when there are other named slots.",
                slotBinding$1
              );
            }
          }
          // add the component's children to its default slot
          var slots = el.scopedSlots || (el.scopedSlots = {});
          var ref$1 = getSlotName(slotBinding$1);
          var name$1 = ref$1.name;
          var dynamic$1 = ref$1.dynamic;
          var slotContainer = slots[name$1] = createASTElement('template', [], el);
          slotContainer.slotTarget = name$1;
          slotContainer.slotTargetDynamic = dynamic$1;
          slotContainer.children = el.children.filter(function (c) {
            if (!c.slotScope) {
              c.parent = slotContainer;
              return true
            }
          });
          slotContainer.slotScope = slotBinding$1.value || emptySlotScopeToken;
          // remove children as they are returned from scopedSlots now
          el.children = [];
          // mark el non-plain so data gets generated
          el.plain = false;
        }
      }
    }
  }

  function getSlotName (binding) {
    var name = binding.name.replace(slotRE, '');
    if (!name) {
      if (binding.name[0] !== '#') {
        name = 'default';
      } else {
        warn$2(
          "v-slot shorthand syntax requires a slot name.",
          binding
        );
      }
    }
    return dynamicArgRE.test(name)
      // dynamic [name]
      ? { name: name.slice(1, -1), dynamic: true }
      // static name
      : { name: ("\"" + name + "\""), dynamic: false }
  }

  // handle <slot/> outlets
  function processSlotOutlet (el) {
    if (el.tag === 'slot') {
      el.slotName = getBindingAttr(el, 'name');
      if (el.key) {
        warn$2(
          "`key` does not work on <slot> because slots are abstract outlets " +
          "and can possibly expand into multiple elements. " +
          "Use the key on a wrapping element instead.",
          getRawBindingAttr(el, 'key')
        );
      }
    }
  }

  function processComponent (el) {
    var binding;
    if ((binding = getBindingAttr(el, 'is'))) {
      el.component = binding;
    }
    if (getAndRemoveAttr(el, 'inline-template') != null) {
      el.inlineTemplate = true;
    }
  }

  function processAttrs (el) {
    var list = el.attrsList;
    var i, l, name, rawName, value, modifiers, syncGen, isDynamic;
    for (i = 0, l = list.length; i < l; i++) {
      name = rawName = list[i].name;
      value = list[i].value;
      if (dirRE.test(name)) {
        // mark element as dynamic
        el.hasBindings = true;
        // modifiers
        modifiers = parseModifiers(name.replace(dirRE, ''));
        // support .foo shorthand syntax for the .prop modifier
        if (modifiers) {
          name = name.replace(modifierRE, '');
        }
        if (bindRE.test(name)) { // v-bind
          name = name.replace(bindRE, '');
          value = parseFilters(value);
          isDynamic = dynamicArgRE.test(name);
          if (isDynamic) {
            name = name.slice(1, -1);
          }
          if (
            value.trim().length === 0
          ) {
            warn$2(
              ("The value for a v-bind expression cannot be empty. Found in \"v-bind:" + name + "\"")
            );
          }
          if (modifiers) {
            if (modifiers.prop && !isDynamic) {
              name = camelize(name);
              if (name === 'innerHtml') { name = 'innerHTML'; }
            }
            if (modifiers.camel && !isDynamic) {
              name = camelize(name);
            }
            if (modifiers.sync) {
              syncGen = genAssignmentCode(value, "$event");
              if (!isDynamic) {
                addHandler(
                  el,
                  ("update:" + (camelize(name))),
                  syncGen,
                  null,
                  false,
                  warn$2,
                  list[i]
                );
                if (hyphenate(name) !== camelize(name)) {
                  addHandler(
                    el,
                    ("update:" + (hyphenate(name))),
                    syncGen,
                    null,
                    false,
                    warn$2,
                    list[i]
                  );
                }
              } else {
                // handler w/ dynamic event name
                addHandler(
                  el,
                  ("\"update:\"+(" + name + ")"),
                  syncGen,
                  null,
                  false,
                  warn$2,
                  list[i],
                  true // dynamic
                );
              }
            }
          }
          if ((modifiers && modifiers.prop) || (
            !el.component && platformMustUseProp(el.tag, el.attrsMap.type, name)
          )) {
            addProp(el, name, value, list[i], isDynamic);
          } else {
            addAttr(el, name, value, list[i], isDynamic);
          }
        } else if (onRE.test(name)) { // v-on
          name = name.replace(onRE, '');
          isDynamic = dynamicArgRE.test(name);
          if (isDynamic) {
            name = name.slice(1, -1);
          }
          addHandler(el, name, value, modifiers, false, warn$2, list[i], isDynamic);
        } else { // normal directives
          name = name.replace(dirRE, '');
          // parse arg
          var argMatch = name.match(argRE);
          var arg = argMatch && argMatch[1];
          isDynamic = false;
          if (arg) {
            name = name.slice(0, -(arg.length + 1));
            if (dynamicArgRE.test(arg)) {
              arg = arg.slice(1, -1);
              isDynamic = true;
            }
          }
          addDirective(el, name, rawName, value, arg, isDynamic, modifiers, list[i]);
          if (name === 'model') {
            checkForAliasModel(el, value);
          }
        }
      } else {
        // literal attribute
        {
          var res = parseText(value, delimiters);
          if (res) {
            warn$2(
              name + "=\"" + value + "\": " +
              'Interpolation inside attributes has been removed. ' +
              'Use v-bind or the colon shorthand instead. For example, ' +
              'instead of <div id="{{ val }}">, use <div :id="val">.',
              list[i]
            );
          }
        }
        addAttr(el, name, JSON.stringify(value), list[i]);
        // #6887 firefox doesn't update muted state if set via attribute
        // even immediately after element creation
        if (!el.component &&
            name === 'muted' &&
            platformMustUseProp(el.tag, el.attrsMap.type, name)) {
          addProp(el, name, 'true', list[i]);
        }
      }
    }
  }

  function checkInFor (el) {
    var parent = el;
    while (parent) {
      if (parent.for !== undefined) {
        return true
      }
      parent = parent.parent;
    }
    return false
  }

  function parseModifiers (name) {
    var match = name.match(modifierRE);
    if (match) {
      var ret = {};
      match.forEach(function (m) { ret[m.slice(1)] = true; });
      return ret
    }
  }

  function makeAttrsMap (attrs) {
    var map = {};
    for (var i = 0, l = attrs.length; i < l; i++) {
      if (
        map[attrs[i].name] && !isIE && !isEdge
      ) {
        warn$2('duplicate attribute: ' + attrs[i].name, attrs[i]);
      }
      map[attrs[i].name] = attrs[i].value;
    }
    return map
  }

  // for script (e.g. type="x/template") or style, do not decode content
  function isTextTag (el) {
    return el.tag === 'script' || el.tag === 'style'
  }

  function isForbiddenTag (el) {
    return (
      el.tag === 'style' ||
      (el.tag === 'script' && (
        !el.attrsMap.type ||
        el.attrsMap.type === 'text/javascript'
      ))
    )
  }

  var ieNSBug = /^xmlns:NS\d+/;
  var ieNSPrefix = /^NS\d+:/;

  /* istanbul ignore next */
  function guardIESVGBug (attrs) {
    var res = [];
    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];
      if (!ieNSBug.test(attr.name)) {
        attr.name = attr.name.replace(ieNSPrefix, '');
        res.push(attr);
      }
    }
    return res
  }

  function checkForAliasModel (el, value) {
    var _el = el;
    while (_el) {
      if (_el.for && _el.alias === value) {
        warn$2(
          "<" + (el.tag) + " v-model=\"" + value + "\">: " +
          "You are binding v-model directly to a v-for iteration alias. " +
          "This will not be able to modify the v-for source array because " +
          "writing to the alias is like modifying a function local variable. " +
          "Consider using an array of objects and use v-model on an object property instead.",
          el.rawAttrsMap['v-model']
        );
      }
      _el = _el.parent;
    }
  }

  /*  */

  function preTransformNode (el, options) {
    if (el.tag === 'input') {
      var map = el.attrsMap;
      if (!map['v-model']) {
        return
      }

      var typeBinding;
      if (map[':type'] || map['v-bind:type']) {
        typeBinding = getBindingAttr(el, 'type');
      }
      if (!map.type && !typeBinding && map['v-bind']) {
        typeBinding = "(" + (map['v-bind']) + ").type";
      }

      if (typeBinding) {
        var ifCondition = getAndRemoveAttr(el, 'v-if', true);
        var ifConditionExtra = ifCondition ? ("&&(" + ifCondition + ")") : "";
        var hasElse = getAndRemoveAttr(el, 'v-else', true) != null;
        var elseIfCondition = getAndRemoveAttr(el, 'v-else-if', true);
        // 1. checkbox
        var branch0 = cloneASTElement(el);
        // process for on the main node
        processFor(branch0);
        addRawAttr(branch0, 'type', 'checkbox');
        processElement(branch0, options);
        branch0.processed = true; // prevent it from double-processed
        branch0.if = "(" + typeBinding + ")==='checkbox'" + ifConditionExtra;
        addIfCondition(branch0, {
          exp: branch0.if,
          block: branch0
        });
        // 2. add radio else-if condition
        var branch1 = cloneASTElement(el);
        getAndRemoveAttr(branch1, 'v-for', true);
        addRawAttr(branch1, 'type', 'radio');
        processElement(branch1, options);
        addIfCondition(branch0, {
          exp: "(" + typeBinding + ")==='radio'" + ifConditionExtra,
          block: branch1
        });
        // 3. other
        var branch2 = cloneASTElement(el);
        getAndRemoveAttr(branch2, 'v-for', true);
        addRawAttr(branch2, ':type', typeBinding);
        processElement(branch2, options);
        addIfCondition(branch0, {
          exp: ifCondition,
          block: branch2
        });

        if (hasElse) {
          branch0.else = true;
        } else if (elseIfCondition) {
          branch0.elseif = elseIfCondition;
        }

        return branch0
      }
    }
  }

  function cloneASTElement (el) {
    return createASTElement(el.tag, el.attrsList.slice(), el.parent)
  }

  var model$1 = {
    preTransformNode: preTransformNode
  };

  var modules$1 = [
    klass$1,
    style$1,
    model$1
  ];

  /*  */

  function text (el, dir) {
    if (dir.value) {
      addProp(el, 'textContent', ("_s(" + (dir.value) + ")"), dir);
    }
  }

  /*  */

  function html (el, dir) {
    if (dir.value) {
      addProp(el, 'innerHTML', ("_s(" + (dir.value) + ")"), dir);
    }
  }

  var directives$1 = {
    model: model,
    text: text,
    html: html
  };

  /*  */

  var baseOptions = {
    expectHTML: true,
    modules: modules$1,
    directives: directives$1,
    isPreTag: isPreTag,
    isUnaryTag: isUnaryTag,
    mustUseProp: mustUseProp,
    canBeLeftOpenTag: canBeLeftOpenTag,
    isReservedTag: isReservedTag,
    getTagNamespace: getTagNamespace,
    staticKeys: genStaticKeys(modules$1)
  };

  /*  */

  var isStaticKey;
  var isPlatformReservedTag;

  var genStaticKeysCached = cached(genStaticKeys$1);

  /**
   * Goal of the optimizer: walk the generated template AST tree
   * and detect sub-trees that are purely static, i.e. parts of
   * the DOM that never needs to change.
   *
   * Once we detect these sub-trees, we can:
   *
   * 1. Hoist them into constants, so that we no longer need to
   *    create fresh nodes for them on each re-render;
   * 2. Completely skip them in the patching process.
   */
  function optimize (root, options) {
    if (!root) { return }
    isStaticKey = genStaticKeysCached(options.staticKeys || '');
    isPlatformReservedTag = options.isReservedTag || no;
    // first pass: mark all non-static nodes.
    markStatic$1(root);
    // second pass: mark static roots.
    markStaticRoots(root, false);
  }

  function genStaticKeys$1 (keys) {
    return makeMap(
      'type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' +
      (keys ? ',' + keys : '')
    )
  }

  function markStatic$1 (node) {
    node.static = isStatic(node);
    if (node.type === 1) {
      // do not make component slot content static. this avoids
      // 1. components not able to mutate slot nodes
      // 2. static slot content fails for hot-reloading
      if (
        !isPlatformReservedTag(node.tag) &&
        node.tag !== 'slot' &&
        node.attrsMap['inline-template'] == null
      ) {
        return
      }
      for (var i = 0, l = node.children.length; i < l; i++) {
        var child = node.children[i];
        markStatic$1(child);
        if (!child.static) {
          node.static = false;
        }
      }
      if (node.ifConditions) {
        for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
          var block = node.ifConditions[i$1].block;
          markStatic$1(block);
          if (!block.static) {
            node.static = false;
          }
        }
      }
    }
  }

  function markStaticRoots (node, isInFor) {
    if (node.type === 1) {
      if (node.static || node.once) {
        node.staticInFor = isInFor;
      }
      // For a node to qualify as a static root, it should have children that
      // are not just static text. Otherwise the cost of hoisting out will
      // outweigh the benefits and it's better off to just always render it fresh.
      if (node.static && node.children.length && !(
        node.children.length === 1 &&
        node.children[0].type === 3
      )) {
        node.staticRoot = true;
        return
      } else {
        node.staticRoot = false;
      }
      if (node.children) {
        for (var i = 0, l = node.children.length; i < l; i++) {
          markStaticRoots(node.children[i], isInFor || !!node.for);
        }
      }
      if (node.ifConditions) {
        for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
          markStaticRoots(node.ifConditions[i$1].block, isInFor);
        }
      }
    }
  }

  function isStatic (node) {
    if (node.type === 2) { // expression
      return false
    }
    if (node.type === 3) { // text
      return true
    }
    return !!(node.pre || (
      !node.hasBindings && // no dynamic bindings
      !node.if && !node.for && // not v-if or v-for or v-else
      !isBuiltInTag(node.tag) && // not a built-in
      isPlatformReservedTag(node.tag) && // not a component
      !isDirectChildOfTemplateFor(node) &&
      Object.keys(node).every(isStaticKey)
    ))
  }

  function isDirectChildOfTemplateFor (node) {
    while (node.parent) {
      node = node.parent;
      if (node.tag !== 'template') {
        return false
      }
      if (node.for) {
        return true
      }
    }
    return false
  }

  /*  */

  var fnExpRE = /^([\w$_]+|\([^)]*?\))\s*=>|^function(?:\s+[\w$]+)?\s*\(/;
  var fnInvokeRE = /\([^)]*?\);*$/;
  var simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/;

  // KeyboardEvent.keyCode aliases
  var keyCodes = {
    esc: 27,
    tab: 9,
    enter: 13,
    space: 32,
    up: 38,
    left: 37,
    right: 39,
    down: 40,
    'delete': [8, 46]
  };

  // KeyboardEvent.key aliases
  var keyNames = {
    // #7880: IE11 and Edge use `Esc` for Escape key name.
    esc: ['Esc', 'Escape'],
    tab: 'Tab',
    enter: 'Enter',
    // #9112: IE11 uses `Spacebar` for Space key name.
    space: [' ', 'Spacebar'],
    // #7806: IE11 uses key names without `Arrow` prefix for arrow keys.
    up: ['Up', 'ArrowUp'],
    left: ['Left', 'ArrowLeft'],
    right: ['Right', 'ArrowRight'],
    down: ['Down', 'ArrowDown'],
    // #9112: IE11 uses `Del` for Delete key name.
    'delete': ['Backspace', 'Delete', 'Del']
  };

  // #4868: modifiers that prevent the execution of the listener
  // need to explicitly return null so that we can determine whether to remove
  // the listener for .once
  var genGuard = function (condition) { return ("if(" + condition + ")return null;"); };

  var modifierCode = {
    stop: '$event.stopPropagation();',
    prevent: '$event.preventDefault();',
    self: genGuard("$event.target !== $event.currentTarget"),
    ctrl: genGuard("!$event.ctrlKey"),
    shift: genGuard("!$event.shiftKey"),
    alt: genGuard("!$event.altKey"),
    meta: genGuard("!$event.metaKey"),
    left: genGuard("'button' in $event && $event.button !== 0"),
    middle: genGuard("'button' in $event && $event.button !== 1"),
    right: genGuard("'button' in $event && $event.button !== 2")
  };

  function genHandlers (
    events,
    isNative
  ) {
    var prefix = isNative ? 'nativeOn:' : 'on:';
    var staticHandlers = "";
    var dynamicHandlers = "";
    for (var name in events) {
      var handlerCode = genHandler(events[name]);
      if (events[name] && events[name].dynamic) {
        dynamicHandlers += name + "," + handlerCode + ",";
      } else {
        staticHandlers += "\"" + name + "\":" + handlerCode + ",";
      }
    }
    staticHandlers = "{" + (staticHandlers.slice(0, -1)) + "}";
    if (dynamicHandlers) {
      return prefix + "_d(" + staticHandlers + ",[" + (dynamicHandlers.slice(0, -1)) + "])"
    } else {
      return prefix + staticHandlers
    }
  }

  function genHandler (handler) {
    if (!handler) {
      return 'function(){}'
    }

    if (Array.isArray(handler)) {
      return ("[" + (handler.map(function (handler) { return genHandler(handler); }).join(',')) + "]")
    }

    var isMethodPath = simplePathRE.test(handler.value);
    var isFunctionExpression = fnExpRE.test(handler.value);
    var isFunctionInvocation = simplePathRE.test(handler.value.replace(fnInvokeRE, ''));

    if (!handler.modifiers) {
      if (isMethodPath || isFunctionExpression) {
        return handler.value
      }
      return ("function($event){" + (isFunctionInvocation ? ("return " + (handler.value)) : handler.value) + "}") // inline statement
    } else {
      var code = '';
      var genModifierCode = '';
      var keys = [];
      for (var key in handler.modifiers) {
        if (modifierCode[key]) {
          genModifierCode += modifierCode[key];
          // left/right
          if (keyCodes[key]) {
            keys.push(key);
          }
        } else if (key === 'exact') {
          var modifiers = (handler.modifiers);
          genModifierCode += genGuard(
            ['ctrl', 'shift', 'alt', 'meta']
              .filter(function (keyModifier) { return !modifiers[keyModifier]; })
              .map(function (keyModifier) { return ("$event." + keyModifier + "Key"); })
              .join('||')
          );
        } else {
          keys.push(key);
        }
      }
      if (keys.length) {
        code += genKeyFilter(keys);
      }
      // Make sure modifiers like prevent and stop get executed after key filtering
      if (genModifierCode) {
        code += genModifierCode;
      }
      var handlerCode = isMethodPath
        ? ("return " + (handler.value) + ".apply(null, arguments)")
        : isFunctionExpression
          ? ("return (" + (handler.value) + ").apply(null, arguments)")
          : isFunctionInvocation
            ? ("return " + (handler.value))
            : handler.value;
      return ("function($event){" + code + handlerCode + "}")
    }
  }

  function genKeyFilter (keys) {
    return (
      // make sure the key filters only apply to KeyboardEvents
      // #9441: can't use 'keyCode' in $event because Chrome autofill fires fake
      // key events that do not have keyCode property...
      "if(!$event.type.indexOf('key')&&" +
      (keys.map(genFilterCode).join('&&')) + ")return null;"
    )
  }

  function genFilterCode (key) {
    var keyVal = parseInt(key, 10);
    if (keyVal) {
      return ("$event.keyCode!==" + keyVal)
    }
    var keyCode = keyCodes[key];
    var keyName = keyNames[key];
    return (
      "_k($event.keyCode," +
      (JSON.stringify(key)) + "," +
      (JSON.stringify(keyCode)) + "," +
      "$event.key," +
      "" + (JSON.stringify(keyName)) +
      ")"
    )
  }

  /*  */

  function on (el, dir) {
    if (dir.modifiers) {
      warn("v-on without argument does not support modifiers.");
    }
    el.wrapListeners = function (code) { return ("_g(" + code + "," + (dir.value) + ")"); };
  }

  /*  */

  function bind$1 (el, dir) {
    el.wrapData = function (code) {
      return ("_b(" + code + ",'" + (el.tag) + "'," + (dir.value) + "," + (dir.modifiers && dir.modifiers.prop ? 'true' : 'false') + (dir.modifiers && dir.modifiers.sync ? ',true' : '') + ")")
    };
  }

  /*  */

  var baseDirectives = {
    on: on,
    bind: bind$1,
    cloak: noop
  };

  /*  */





  var CodegenState = function CodegenState (options) {
    this.options = options;
    this.warn = options.warn || baseWarn;
    this.transforms = pluckModuleFunction(options.modules, 'transformCode');
    this.dataGenFns = pluckModuleFunction(options.modules, 'genData');
    this.directives = extend(extend({}, baseDirectives), options.directives);
    var isReservedTag = options.isReservedTag || no;
    this.maybeComponent = function (el) { return !!el.component || !isReservedTag(el.tag); };
    this.onceId = 0;
    this.staticRenderFns = [];
    this.pre = false;
  };



  function generate (
    ast,
    options
  ) {
    var state = new CodegenState(options);
    // fix #11483, Root level <script> tags should not be rendered.
    var code = ast ? (ast.tag === 'script' ? 'null' : genElement(ast, state)) : '_c("div")';
    return {
      render: ("with(this){return " + code + "}"),
      staticRenderFns: state.staticRenderFns
    }
  }

  function genElement (el, state) {
    if (el.parent) {
      el.pre = el.pre || el.parent.pre;
    }

    if (el.staticRoot && !el.staticProcessed) {
      return genStatic(el, state)
    } else if (el.once && !el.onceProcessed) {
      return genOnce(el, state)
    } else if (el.for && !el.forProcessed) {
      return genFor(el, state)
    } else if (el.if && !el.ifProcessed) {
      return genIf(el, state)
    } else if (el.tag === 'template' && !el.slotTarget && !state.pre) {
      return genChildren(el, state) || 'void 0'
    } else if (el.tag === 'slot') {
      return genSlot(el, state)
    } else {
      // component or element
      var code;
      if (el.component) {
        code = genComponent(el.component, el, state);
      } else {
        var data;
        if (!el.plain || (el.pre && state.maybeComponent(el))) {
          data = genData$2(el, state);
        }

        var children = el.inlineTemplate ? null : genChildren(el, state, true);
        code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
      }
      // module transforms
      for (var i = 0; i < state.transforms.length; i++) {
        code = state.transforms[i](el, code);
      }
      return code
    }
  }

  // hoist static sub-trees out
  function genStatic (el, state) {
    el.staticProcessed = true;
    // Some elements (templates) need to behave differently inside of a v-pre
    // node.  All pre nodes are static roots, so we can use this as a location to
    // wrap a state change and reset it upon exiting the pre node.
    var originalPreState = state.pre;
    if (el.pre) {
      state.pre = el.pre;
    }
    state.staticRenderFns.push(("with(this){return " + (genElement(el, state)) + "}"));
    state.pre = originalPreState;
    return ("_m(" + (state.staticRenderFns.length - 1) + (el.staticInFor ? ',true' : '') + ")")
  }

  // v-once
  function genOnce (el, state) {
    el.onceProcessed = true;
    if (el.if && !el.ifProcessed) {
      return genIf(el, state)
    } else if (el.staticInFor) {
      var key = '';
      var parent = el.parent;
      while (parent) {
        if (parent.for) {
          key = parent.key;
          break
        }
        parent = parent.parent;
      }
      if (!key) {
        state.warn(
          "v-once can only be used inside v-for that is keyed. ",
          el.rawAttrsMap['v-once']
        );
        return genElement(el, state)
      }
      return ("_o(" + (genElement(el, state)) + "," + (state.onceId++) + "," + key + ")")
    } else {
      return genStatic(el, state)
    }
  }

  function genIf (
    el,
    state,
    altGen,
    altEmpty
  ) {
    el.ifProcessed = true; // avoid recursion
    return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
  }

  function genIfConditions (
    conditions,
    state,
    altGen,
    altEmpty
  ) {
    if (!conditions.length) {
      return altEmpty || '_e()'
    }

    var condition = conditions.shift();
    if (condition.exp) {
      return ("(" + (condition.exp) + ")?" + (genTernaryExp(condition.block)) + ":" + (genIfConditions(conditions, state, altGen, altEmpty)))
    } else {
      return ("" + (genTernaryExp(condition.block)))
    }

    // v-if with v-once should generate code like (a)?_m(0):_m(1)
    function genTernaryExp (el) {
      return altGen
        ? altGen(el, state)
        : el.once
          ? genOnce(el, state)
          : genElement(el, state)
    }
  }

  function genFor (
    el,
    state,
    altGen,
    altHelper
  ) {
    var exp = el.for;
    var alias = el.alias;
    var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
    var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';

    if (state.maybeComponent(el) &&
      el.tag !== 'slot' &&
      el.tag !== 'template' &&
      !el.key
    ) {
      state.warn(
        "<" + (el.tag) + " v-for=\"" + alias + " in " + exp + "\">: component lists rendered with " +
        "v-for should have explicit keys. " +
        "See https://vuejs.org/guide/list.html#key for more info.",
        el.rawAttrsMap['v-for'],
        true /* tip */
      );
    }

    el.forProcessed = true; // avoid recursion
    return (altHelper || '_l') + "((" + exp + ")," +
      "function(" + alias + iterator1 + iterator2 + "){" +
        "return " + ((altGen || genElement)(el, state)) +
      '})'
  }

  function genData$2 (el, state) {
    var data = '{';

    // directives first.
    // directives may mutate the el's other properties before they are generated.
    var dirs = genDirectives(el, state);
    if (dirs) { data += dirs + ','; }

    // key
    if (el.key) {
      data += "key:" + (el.key) + ",";
    }
    // ref
    if (el.ref) {
      data += "ref:" + (el.ref) + ",";
    }
    if (el.refInFor) {
      data += "refInFor:true,";
    }
    // pre
    if (el.pre) {
      data += "pre:true,";
    }
    // record original tag name for components using "is" attribute
    if (el.component) {
      data += "tag:\"" + (el.tag) + "\",";
    }
    // module data generation functions
    for (var i = 0; i < state.dataGenFns.length; i++) {
      data += state.dataGenFns[i](el);
    }
    // attributes
    if (el.attrs) {
      data += "attrs:" + (genProps(el.attrs)) + ",";
    }
    // DOM props
    if (el.props) {
      data += "domProps:" + (genProps(el.props)) + ",";
    }
    // event handlers
    if (el.events) {
      data += (genHandlers(el.events, false)) + ",";
    }
    if (el.nativeEvents) {
      data += (genHandlers(el.nativeEvents, true)) + ",";
    }
    // slot target
    // only for non-scoped slots
    if (el.slotTarget && !el.slotScope) {
      data += "slot:" + (el.slotTarget) + ",";
    }
    // scoped slots
    if (el.scopedSlots) {
      data += (genScopedSlots(el, el.scopedSlots, state)) + ",";
    }
    // component v-model
    if (el.model) {
      data += "model:{value:" + (el.model.value) + ",callback:" + (el.model.callback) + ",expression:" + (el.model.expression) + "},";
    }
    // inline-template
    if (el.inlineTemplate) {
      var inlineTemplate = genInlineTemplate(el, state);
      if (inlineTemplate) {
        data += inlineTemplate + ",";
      }
    }
    data = data.replace(/,$/, '') + '}';
    // v-bind dynamic argument wrap
    // v-bind with dynamic arguments must be applied using the same v-bind object
    // merge helper so that class/style/mustUseProp attrs are handled correctly.
    if (el.dynamicAttrs) {
      data = "_b(" + data + ",\"" + (el.tag) + "\"," + (genProps(el.dynamicAttrs)) + ")";
    }
    // v-bind data wrap
    if (el.wrapData) {
      data = el.wrapData(data);
    }
    // v-on data wrap
    if (el.wrapListeners) {
      data = el.wrapListeners(data);
    }
    return data
  }

  function genDirectives (el, state) {
    var dirs = el.directives;
    if (!dirs) { return }
    var res = 'directives:[';
    var hasRuntime = false;
    var i, l, dir, needRuntime;
    for (i = 0, l = dirs.length; i < l; i++) {
      dir = dirs[i];
      needRuntime = true;
      var gen = state.directives[dir.name];
      if (gen) {
        // compile-time directive that manipulates AST.
        // returns true if it also needs a runtime counterpart.
        needRuntime = !!gen(el, dir, state.warn);
      }
      if (needRuntime) {
        hasRuntime = true;
        res += "{name:\"" + (dir.name) + "\",rawName:\"" + (dir.rawName) + "\"" + (dir.value ? (",value:(" + (dir.value) + "),expression:" + (JSON.stringify(dir.value))) : '') + (dir.arg ? (",arg:" + (dir.isDynamicArg ? dir.arg : ("\"" + (dir.arg) + "\""))) : '') + (dir.modifiers ? (",modifiers:" + (JSON.stringify(dir.modifiers))) : '') + "},";
      }
    }
    if (hasRuntime) {
      return res.slice(0, -1) + ']'
    }
  }

  function genInlineTemplate (el, state) {
    var ast = el.children[0];
    if (el.children.length !== 1 || ast.type !== 1) {
      state.warn(
        'Inline-template components must have exactly one child element.',
        { start: el.start }
      );
    }
    if (ast && ast.type === 1) {
      var inlineRenderFns = generate(ast, state.options);
      return ("inlineTemplate:{render:function(){" + (inlineRenderFns.render) + "},staticRenderFns:[" + (inlineRenderFns.staticRenderFns.map(function (code) { return ("function(){" + code + "}"); }).join(',')) + "]}")
    }
  }

  function genScopedSlots (
    el,
    slots,
    state
  ) {
    // by default scoped slots are considered "stable", this allows child
    // components with only scoped slots to skip forced updates from parent.
    // but in some cases we have to bail-out of this optimization
    // for example if the slot contains dynamic names, has v-if or v-for on them...
    var needsForceUpdate = el.for || Object.keys(slots).some(function (key) {
      var slot = slots[key];
      return (
        slot.slotTargetDynamic ||
        slot.if ||
        slot.for ||
        containsSlotChild(slot) // is passing down slot from parent which may be dynamic
      )
    });

    // #9534: if a component with scoped slots is inside a conditional branch,
    // it's possible for the same component to be reused but with different
    // compiled slot content. To avoid that, we generate a unique key based on
    // the generated code of all the slot contents.
    var needsKey = !!el.if;

    // OR when it is inside another scoped slot or v-for (the reactivity may be
    // disconnected due to the intermediate scope variable)
    // #9438, #9506
    // TODO: this can be further optimized by properly analyzing in-scope bindings
    // and skip force updating ones that do not actually use scope variables.
    if (!needsForceUpdate) {
      var parent = el.parent;
      while (parent) {
        if (
          (parent.slotScope && parent.slotScope !== emptySlotScopeToken) ||
          parent.for
        ) {
          needsForceUpdate = true;
          break
        }
        if (parent.if) {
          needsKey = true;
        }
        parent = parent.parent;
      }
    }

    var generatedSlots = Object.keys(slots)
      .map(function (key) { return genScopedSlot(slots[key], state); })
      .join(',');

    return ("scopedSlots:_u([" + generatedSlots + "]" + (needsForceUpdate ? ",null,true" : "") + (!needsForceUpdate && needsKey ? (",null,false," + (hash(generatedSlots))) : "") + ")")
  }

  function hash(str) {
    var hash = 5381;
    var i = str.length;
    while(i) {
      hash = (hash * 33) ^ str.charCodeAt(--i);
    }
    return hash >>> 0
  }

  function containsSlotChild (el) {
    if (el.type === 1) {
      if (el.tag === 'slot') {
        return true
      }
      return el.children.some(containsSlotChild)
    }
    return false
  }

  function genScopedSlot (
    el,
    state
  ) {
    var isLegacySyntax = el.attrsMap['slot-scope'];
    if (el.if && !el.ifProcessed && !isLegacySyntax) {
      return genIf(el, state, genScopedSlot, "null")
    }
    if (el.for && !el.forProcessed) {
      return genFor(el, state, genScopedSlot)
    }
    var slotScope = el.slotScope === emptySlotScopeToken
      ? ""
      : String(el.slotScope);
    var fn = "function(" + slotScope + "){" +
      "return " + (el.tag === 'template'
        ? el.if && isLegacySyntax
          ? ("(" + (el.if) + ")?" + (genChildren(el, state) || 'undefined') + ":undefined")
          : genChildren(el, state) || 'undefined'
        : genElement(el, state)) + "}";
    // reverse proxy v-slot without scope on this.$slots
    var reverseProxy = slotScope ? "" : ",proxy:true";
    return ("{key:" + (el.slotTarget || "\"default\"") + ",fn:" + fn + reverseProxy + "}")
  }

  function genChildren (
    el,
    state,
    checkSkip,
    altGenElement,
    altGenNode
  ) {
    var children = el.children;
    if (children.length) {
      var el$1 = children[0];
      // optimize single v-for
      if (children.length === 1 &&
        el$1.for &&
        el$1.tag !== 'template' &&
        el$1.tag !== 'slot'
      ) {
        var normalizationType = checkSkip
          ? state.maybeComponent(el$1) ? ",1" : ",0"
          : "";
        return ("" + ((altGenElement || genElement)(el$1, state)) + normalizationType)
      }
      var normalizationType$1 = checkSkip
        ? getNormalizationType(children, state.maybeComponent)
        : 0;
      var gen = altGenNode || genNode;
      return ("[" + (children.map(function (c) { return gen(c, state); }).join(',')) + "]" + (normalizationType$1 ? ("," + normalizationType$1) : ''))
    }
  }

  // determine the normalization needed for the children array.
  // 0: no normalization needed
  // 1: simple normalization needed (possible 1-level deep nested array)
  // 2: full normalization needed
  function getNormalizationType (
    children,
    maybeComponent
  ) {
    var res = 0;
    for (var i = 0; i < children.length; i++) {
      var el = children[i];
      if (el.type !== 1) {
        continue
      }
      if (needsNormalization(el) ||
          (el.ifConditions && el.ifConditions.some(function (c) { return needsNormalization(c.block); }))) {
        res = 2;
        break
      }
      if (maybeComponent(el) ||
          (el.ifConditions && el.ifConditions.some(function (c) { return maybeComponent(c.block); }))) {
        res = 1;
      }
    }
    return res
  }

  function needsNormalization (el) {
    return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
  }

  function genNode (node, state) {
    if (node.type === 1) {
      return genElement(node, state)
    } else if (node.type === 3 && node.isComment) {
      return genComment(node)
    } else {
      return genText(node)
    }
  }

  function genText (text) {
    return ("_v(" + (text.type === 2
      ? text.expression // no need for () because already wrapped in _s()
      : transformSpecialNewlines(JSON.stringify(text.text))) + ")")
  }

  function genComment (comment) {
    return ("_e(" + (JSON.stringify(comment.text)) + ")")
  }

  function genSlot (el, state) {
    var slotName = el.slotName || '"default"';
    var children = genChildren(el, state);
    var res = "_t(" + slotName + (children ? (",function(){return " + children + "}") : '');
    var attrs = el.attrs || el.dynamicAttrs
      ? genProps((el.attrs || []).concat(el.dynamicAttrs || []).map(function (attr) { return ({
          // slot props are camelized
          name: camelize(attr.name),
          value: attr.value,
          dynamic: attr.dynamic
        }); }))
      : null;
    var bind$$1 = el.attrsMap['v-bind'];
    if ((attrs || bind$$1) && !children) {
      res += ",null";
    }
    if (attrs) {
      res += "," + attrs;
    }
    if (bind$$1) {
      res += (attrs ? '' : ',null') + "," + bind$$1;
    }
    return res + ')'
  }

  // componentName is el.component, take it as argument to shun flow's pessimistic refinement
  function genComponent (
    componentName,
    el,
    state
  ) {
    var children = el.inlineTemplate ? null : genChildren(el, state, true);
    return ("_c(" + componentName + "," + (genData$2(el, state)) + (children ? ("," + children) : '') + ")")
  }

  function genProps (props) {
    var staticProps = "";
    var dynamicProps = "";
    for (var i = 0; i < props.length; i++) {
      var prop = props[i];
      var value = transformSpecialNewlines(prop.value);
      if (prop.dynamic) {
        dynamicProps += (prop.name) + "," + value + ",";
      } else {
        staticProps += "\"" + (prop.name) + "\":" + value + ",";
      }
    }
    staticProps = "{" + (staticProps.slice(0, -1)) + "}";
    if (dynamicProps) {
      return ("_d(" + staticProps + ",[" + (dynamicProps.slice(0, -1)) + "])")
    } else {
      return staticProps
    }
  }

  // #3895, #4268
  function transformSpecialNewlines (text) {
    return text
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029')
  }

  /*  */



  // these keywords should not appear inside expressions, but operators like
  // typeof, instanceof and in are allowed
  var prohibitedKeywordRE = new RegExp('\\b' + (
    'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
    'super,throw,while,yield,delete,export,import,return,switch,default,' +
    'extends,finally,continue,debugger,function,arguments'
  ).split(',').join('\\b|\\b') + '\\b');

  // these unary operators should not be used as property/method names
  var unaryOperatorsRE = new RegExp('\\b' + (
    'delete,typeof,void'
  ).split(',').join('\\s*\\([^\\)]*\\)|\\b') + '\\s*\\([^\\)]*\\)');

  // strip strings in expressions
  var stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;

  // detect problematic expressions in a template
  function detectErrors (ast, warn) {
    if (ast) {
      checkNode(ast, warn);
    }
  }

  function checkNode (node, warn) {
    if (node.type === 1) {
      for (var name in node.attrsMap) {
        if (dirRE.test(name)) {
          var value = node.attrsMap[name];
          if (value) {
            var range = node.rawAttrsMap[name];
            if (name === 'v-for') {
              checkFor(node, ("v-for=\"" + value + "\""), warn, range);
            } else if (name === 'v-slot' || name[0] === '#') {
              checkFunctionParameterExpression(value, (name + "=\"" + value + "\""), warn, range);
            } else if (onRE.test(name)) {
              checkEvent(value, (name + "=\"" + value + "\""), warn, range);
            } else {
              checkExpression(value, (name + "=\"" + value + "\""), warn, range);
            }
          }
        }
      }
      if (node.children) {
        for (var i = 0; i < node.children.length; i++) {
          checkNode(node.children[i], warn);
        }
      }
    } else if (node.type === 2) {
      checkExpression(node.expression, node.text, warn, node);
    }
  }

  function checkEvent (exp, text, warn, range) {
    var stripped = exp.replace(stripStringRE, '');
    var keywordMatch = stripped.match(unaryOperatorsRE);
    if (keywordMatch && stripped.charAt(keywordMatch.index - 1) !== '$') {
      warn(
        "avoid using JavaScript unary operator as property name: " +
        "\"" + (keywordMatch[0]) + "\" in expression " + (text.trim()),
        range
      );
    }
    checkExpression(exp, text, warn, range);
  }

  function checkFor (node, text, warn, range) {
    checkExpression(node.for || '', text, warn, range);
    checkIdentifier(node.alias, 'v-for alias', text, warn, range);
    checkIdentifier(node.iterator1, 'v-for iterator', text, warn, range);
    checkIdentifier(node.iterator2, 'v-for iterator', text, warn, range);
  }

  function checkIdentifier (
    ident,
    type,
    text,
    warn,
    range
  ) {
    if (typeof ident === 'string') {
      try {
        new Function(("var " + ident + "=_"));
      } catch (e) {
        warn(("invalid " + type + " \"" + ident + "\" in expression: " + (text.trim())), range);
      }
    }
  }

  function checkExpression (exp, text, warn, range) {
    try {
      new Function(("return " + exp));
    } catch (e) {
      var keywordMatch = exp.replace(stripStringRE, '').match(prohibitedKeywordRE);
      if (keywordMatch) {
        warn(
          "avoid using JavaScript keyword as property name: " +
          "\"" + (keywordMatch[0]) + "\"\n  Raw expression: " + (text.trim()),
          range
        );
      } else {
        warn(
          "invalid expression: " + (e.message) + " in\n\n" +
          "    " + exp + "\n\n" +
          "  Raw expression: " + (text.trim()) + "\n",
          range
        );
      }
    }
  }

  function checkFunctionParameterExpression (exp, text, warn, range) {
    try {
      new Function(exp, '');
    } catch (e) {
      warn(
        "invalid function parameter expression: " + (e.message) + " in\n\n" +
        "    " + exp + "\n\n" +
        "  Raw expression: " + (text.trim()) + "\n",
        range
      );
    }
  }

  /*  */

  var range = 2;

  function generateCodeFrame (
    source,
    start,
    end
  ) {
    if ( start === void 0 ) start = 0;
    if ( end === void 0 ) end = source.length;

    var lines = source.split(/\r?\n/);
    var count = 0;
    var res = [];
    for (var i = 0; i < lines.length; i++) {
      count += lines[i].length + 1;
      if (count >= start) {
        for (var j = i - range; j <= i + range || end > count; j++) {
          if (j < 0 || j >= lines.length) { continue }
          res.push(("" + (j + 1) + (repeat$1(" ", 3 - String(j + 1).length)) + "|  " + (lines[j])));
          var lineLength = lines[j].length;
          if (j === i) {
            // push underline
            var pad = start - (count - lineLength) + 1;
            var length = end > count ? lineLength - pad : end - start;
            res.push("   |  " + repeat$1(" ", pad) + repeat$1("^", length));
          } else if (j > i) {
            if (end > count) {
              var length$1 = Math.min(end - count, lineLength);
              res.push("   |  " + repeat$1("^", length$1));
            }
            count += lineLength + 1;
          }
        }
        break
      }
    }
    return res.join('\n')
  }

  function repeat$1 (str, n) {
    var result = '';
    if (n > 0) {
      while (true) { // eslint-disable-line
        if (n & 1) { result += str; }
        n >>>= 1;
        if (n <= 0) { break }
        str += str;
      }
    }
    return result
  }

  /*  */



  function createFunction (code, errors) {
    try {
      return new Function(code)
    } catch (err) {
      errors.push({ err: err, code: code });
      return noop
    }
  }

  function createCompileToFunctionFn (compile) {
    var cache = Object.create(null);

    return function compileToFunctions (
      template,
      options,
      vm
    ) {
      options = extend({}, options);
      var warn$$1 = options.warn || warn;
      delete options.warn;

      /* istanbul ignore if */
      {
        // detect possible CSP restriction
        try {
          new Function('return 1');
        } catch (e) {
          if (e.toString().match(/unsafe-eval|CSP/)) {
            warn$$1(
              'It seems you are using the standalone build of Vue.js in an ' +
              'environment with Content Security Policy that prohibits unsafe-eval. ' +
              'The template compiler cannot work in this environment. Consider ' +
              'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
              'templates into render functions.'
            );
          }
        }
      }

      // check cache
      var key = options.delimiters
        ? String(options.delimiters) + template
        : template;
      if (cache[key]) {
        return cache[key]
      }

      // compile
      var compiled = compile(template, options);

      // check compilation errors/tips
      {
        if (compiled.errors && compiled.errors.length) {
          if (options.outputSourceRange) {
            compiled.errors.forEach(function (e) {
              warn$$1(
                "Error compiling template:\n\n" + (e.msg) + "\n\n" +
                generateCodeFrame(template, e.start, e.end),
                vm
              );
            });
          } else {
            warn$$1(
              "Error compiling template:\n\n" + template + "\n\n" +
              compiled.errors.map(function (e) { return ("- " + e); }).join('\n') + '\n',
              vm
            );
          }
        }
        if (compiled.tips && compiled.tips.length) {
          if (options.outputSourceRange) {
            compiled.tips.forEach(function (e) { return tip(e.msg, vm); });
          } else {
            compiled.tips.forEach(function (msg) { return tip(msg, vm); });
          }
        }
      }

      // turn code into functions
      var res = {};
      var fnGenErrors = [];
      res.render = createFunction(compiled.render, fnGenErrors);
      res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
        return createFunction(code, fnGenErrors)
      });

      // check function generation errors.
      // this should only happen if there is a bug in the compiler itself.
      // mostly for codegen development use
      /* istanbul ignore if */
      {
        if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
          warn$$1(
            "Failed to generate render function:\n\n" +
            fnGenErrors.map(function (ref) {
              var err = ref.err;
              var code = ref.code;

              return ((err.toString()) + " in\n\n" + code + "\n");
          }).join('\n'),
            vm
          );
        }
      }

      return (cache[key] = res)
    }
  }

  /*  */

  function createCompilerCreator (baseCompile) {
    return function createCompiler (baseOptions) {
      function compile (
        template,
        options
      ) {
        var finalOptions = Object.create(baseOptions);
        var errors = [];
        var tips = [];

        var warn = function (msg, range, tip) {
          (tip ? tips : errors).push(msg);
        };

        if (options) {
          if (options.outputSourceRange) {
            // $flow-disable-line
            var leadingSpaceLength = template.match(/^\s*/)[0].length;

            warn = function (msg, range, tip) {
              var data = { msg: msg };
              if (range) {
                if (range.start != null) {
                  data.start = range.start + leadingSpaceLength;
                }
                if (range.end != null) {
                  data.end = range.end + leadingSpaceLength;
                }
              }
              (tip ? tips : errors).push(data);
            };
          }
          // merge custom modules
          if (options.modules) {
            finalOptions.modules =
              (baseOptions.modules || []).concat(options.modules);
          }
          // merge custom directives
          if (options.directives) {
            finalOptions.directives = extend(
              Object.create(baseOptions.directives || null),
              options.directives
            );
          }
          // copy other options
          for (var key in options) {
            if (key !== 'modules' && key !== 'directives') {
              finalOptions[key] = options[key];
            }
          }
        }

        finalOptions.warn = warn;

        var compiled = baseCompile(template.trim(), finalOptions);
        {
          detectErrors(compiled.ast, warn);
        }
        compiled.errors = errors;
        compiled.tips = tips;
        return compiled
      }

      return {
        compile: compile,
        compileToFunctions: createCompileToFunctionFn(compile)
      }
    }
  }

  /*  */

  // `createCompilerCreator` allows creating compilers that use alternative
  // parser/optimizer/codegen, e.g the SSR optimizing compiler.
  // Here we just export a default compiler using the default parts.
  var createCompiler = createCompilerCreator(function baseCompile (
    template,
    options
  ) {
    var ast = parse(template.trim(), options);
    if (options.optimize !== false) {
      optimize(ast, options);
    }
    var code = generate(ast, options);
    return {
      ast: ast,
      render: code.render,
      staticRenderFns: code.staticRenderFns
    }
  });

  /*  */

  var ref$1 = createCompiler(baseOptions);
  var compile = ref$1.compile;
  var compileToFunctions = ref$1.compileToFunctions;

  /*  */

  // check whether current browser encodes a char inside attribute values
  var div;
  function getShouldDecode (href) {
    div = div || document.createElement('div');
    div.innerHTML = href ? "<a href=\"\n\"/>" : "<div a=\"\n\"/>";
    return div.innerHTML.indexOf('&#10;') > 0
  }

  // #3663: IE encodes newlines inside attribute values while other browsers don't
  var shouldDecodeNewlines = inBrowser ? getShouldDecode(false) : false;
  // #6828: chrome encodes content in a[href]
  var shouldDecodeNewlinesForHref = inBrowser ? getShouldDecode(true) : false;

  /*  */

  var idToTemplate = cached(function (id) {
    var el = query(id);
    return el && el.innerHTML
  });

  var mount = Vue.prototype.$mount;
  Vue.prototype.$mount = function (
    el,
    hydrating
  ) {
    el = el && query(el);

    /* istanbul ignore if */
    if (el === document.body || el === document.documentElement) {
      warn(
        "Do not mount Vue to <html> or <body> - mount to normal elements instead."
      );
      return this
    }

    var options = this.$options;
    // resolve template/el and convert to render function
    if (!options.render) {
      var template = options.template;
      if (template) {
        if (typeof template === 'string') {
          if (template.charAt(0) === '#') {
            template = idToTemplate(template);
            /* istanbul ignore if */
            if (!template) {
              warn(
                ("Template element not found or is empty: " + (options.template)),
                this
              );
            }
          }
        } else if (template.nodeType) {
          template = template.innerHTML;
        } else {
          {
            warn('invalid template option:' + template, this);
          }
          return this
        }
      } else if (el) {
        template = getOuterHTML(el);
      }
      if (template) {
        /* istanbul ignore if */
        if (config.performance && mark) {
          mark('compile');
        }

        var ref = compileToFunctions(template, {
          outputSourceRange: "development" !== 'production',
          shouldDecodeNewlines: shouldDecodeNewlines,
          shouldDecodeNewlinesForHref: shouldDecodeNewlinesForHref,
          delimiters: options.delimiters,
          comments: options.comments
        }, this);
        var render = ref.render;
        var staticRenderFns = ref.staticRenderFns;
        options.render = render;
        options.staticRenderFns = staticRenderFns;

        /* istanbul ignore if */
        if (config.performance && mark) {
          mark('compile end');
          measure(("vue " + (this._name) + " compile"), 'compile', 'compile end');
        }
      }
    }
    return mount.call(this, el, hydrating)
  };

  /**
   * Get outerHTML of elements, taking care
   * of SVG elements in IE as well.
   */
  function getOuterHTML (el) {
    if (el.outerHTML) {
      return el.outerHTML
    } else {
      var container = document.createElement('div');
      container.appendChild(el.cloneNode(true));
      return container.innerHTML
    }
  }

  Vue.compile = compileToFunctions;

  return Vue;

}));

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("timers").setImmediate)

},{"timers":8}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2pzL2VudHJ5LWNvbmZpZ3MuanMiLCJfc3JjL2pzL21vZHVsZXMveGhyLmpzIiwiX3NyYy9qcy92dWUtY29tcG9uZW50cy9GaWVsZC5qcyIsIl9zcmMvanMvdnVlLWNvbXBvbmVudHMvS2V5VmFsdWUuanMiLCJfc3JjL2pzL3Z1ZS1jb21wb25lbnRzL1JlcGVhdGFibGUuanMiLCJfc3JjL2pzL3Z1ZS1jb21wb25lbnRzL1RleHRBcmVhLmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy90aW1lcnMtYnJvd3NlcmlmeS9tYWluLmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9kaXN0L3Z1ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVBLGFBQUksTUFBSixDQUFXLGVBQVgsRUFBNEIsVUFBVSxLQUFWLEVBQWlCO0FBQzNDLE1BQUksQ0FBQyxLQUFMLEVBQVksT0FBTyxFQUFQO0FBQ1osRUFBQSxLQUFLLEdBQUcsS0FBSyxDQUFDLFFBQU4sRUFBUjtBQUNBLEVBQUEsS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZCxFQUFvQixHQUFwQixDQUFSO0FBQ0EsU0FBTyxLQUFLLENBQUMsTUFBTixDQUFhLENBQWIsRUFBZ0IsV0FBaEIsS0FBZ0MsS0FBSyxDQUFDLEtBQU4sQ0FBWSxDQUFaLENBQXZDO0FBQ0QsQ0FMRDs7QUFPQSxJQUFJLFlBQUosQ0FBUTtBQUNOLEVBQUEsRUFBRSxFQUFFLHNCQURFO0FBRU4sRUFBQSxVQUFVLEVBQUU7QUFDVixJQUFBLEtBQUssRUFBTCxjQURVO0FBRVYsSUFBQSxVQUFVLEVBQVYsbUJBRlU7QUFHVixJQUFBLFFBQVEsRUFBUixpQkFIVTtBQUlWLElBQUEsUUFBUSxFQUFSO0FBSlUsR0FGTjtBQVFOLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxXQUFXLEVBQUUsSUFEVDtBQUVKLElBQUEsa0JBQWtCLEVBQUUsSUFGaEI7QUFHSixJQUFBLEtBQUssRUFBRSxFQUhIO0FBSUosSUFBQSxRQUFRLEVBQUUsTUFKTjtBQUtKLElBQUEsSUFBSSxFQUFFO0FBTEYsR0FSQTtBQWVOLEVBQUEsS0FBSyxFQUFFO0FBQ0wsSUFBQSxXQUFXLEVBQUUscUJBQVMsTUFBVCxFQUFpQixNQUFqQixFQUF5QjtBQUFBOztBQUNwQyxVQUFJLE1BQU0sS0FBSyxLQUFmLEVBQXNCO0FBQ3RCLFVBQU0sSUFBSSxHQUFLLEtBQUssV0FBcEI7QUFDQSxVQUFNLE1BQU0sR0FBRyxhQUFmO0FBRUEsd0JBQUksS0FBSyxRQUFULEVBQW1CO0FBQUMsUUFBQSxNQUFNLEVBQU4sTUFBRDtBQUFTLFFBQUEsSUFBSSxFQUFKO0FBQVQsT0FBbkIsRUFBbUMsTUFBbkMsRUFDQyxJQURELENBQ00sVUFBQyxHQUFELEVBQVM7QUFDYixRQUFBLEtBQUksQ0FBQyxrQkFBTCxHQUEwQixJQUExQjtBQUNBLFFBQUEsVUFBVSxDQUFDLFlBQU07QUFDZixjQUFNLFFBQVEsR0FBWSxHQUFHLENBQUMsTUFBSixDQUFXLFFBQXJDO0FBQ0EsVUFBQSxLQUFJLENBQUMsa0JBQUwsR0FBMEIsUUFBUSxDQUFDLElBQW5DO0FBQ0QsU0FIUyxFQUdQLElBSE8sQ0FBVjtBQUtELE9BUkQsRUFTQyxLQVRELENBU08sVUFBQyxHQUFELEVBQVM7QUFDZCxRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksT0FBWixFQUFxQixHQUFyQjtBQUNELE9BWEQ7QUFZRCxLQWxCSTtBQW1CTCxJQUFBLEtBQUssRUFBRSxpQkFBWTtBQUNqQixXQUFLLGtCQUFMLEdBQTBCLElBQTFCO0FBQ0EsV0FBSyxXQUFMLEdBQW1CLEtBQUssS0FBTCxDQUFXLENBQVgsQ0FBbkI7QUFDRDtBQXRCSSxHQWZEO0FBdUNOLEVBQUEsUUFBUSxFQUFFLEVBdkNKO0FBd0NOLEVBQUEsT0FBTyxFQUFFO0FBQ1AsSUFBQSxPQUFPLEVBQUUsbUJBQVk7QUFBQTs7QUFDbkIsV0FBSyxXQUFMLEdBQW1CLEtBQW5CO0FBQ0EsVUFBTSxJQUFJLEdBQUssSUFBZjtBQUNBLFVBQU0sTUFBTSxHQUFHLGVBQWY7QUFFQSx3QkFBSSxLQUFLLFFBQVQsRUFBbUI7QUFBQyxRQUFBLE1BQU0sRUFBTixNQUFEO0FBQVMsUUFBQSxJQUFJLEVBQUo7QUFBVCxPQUFuQixFQUFtQyxNQUFuQyxFQUNDLElBREQsQ0FDTSxVQUFDLEdBQUQsRUFBUztBQUNiLFFBQUEsTUFBSSxDQUFDLGtCQUFMLEdBQTBCLElBQTFCO0FBQ0EsUUFBQSxVQUFVLENBQUMsWUFBTTtBQUNmLGNBQU0sUUFBUSxHQUFZLEdBQUcsQ0FBQyxNQUFKLENBQVcsUUFBckM7QUFDQSxVQUFBLE1BQUksQ0FBQyxrQkFBTCxHQUEwQixRQUFRLENBQUMsSUFBbkM7QUFDRCxTQUhTLEVBR1AsSUFITyxDQUFWO0FBS0QsT0FSRCxFQVNDLEtBVEQsQ0FTTyxVQUFDLEdBQUQsRUFBUztBQUNkLFFBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaLEVBQXFCLEdBQXJCO0FBQ0QsT0FYRDtBQVlELEtBbEJNO0FBbUJQLElBQUEsYUFBYSxFQUFFLHVCQUFVLElBQVYsRUFBZ0I7QUFBQTs7QUFDN0IsVUFBTSxHQUFHLEdBQUc7QUFDVixRQUFBLE1BQU0sRUFBRSxnQkFERTtBQUVWLFFBQUEsSUFBSSxFQUFFO0FBRkksT0FBWjtBQUlBLFdBQUssSUFBTCxHQUFZLElBQVo7QUFDQSx3QkFBSSxLQUFLLFFBQVQsRUFBbUIsR0FBbkIsRUFBd0IsTUFBeEIsRUFDRyxJQURILENBQ1EsVUFBQyxHQUFELEVBQVM7QUFDYixZQUFRLFFBQVIsR0FBcUIsR0FBRyxDQUFDLE1BQXpCLENBQVEsUUFBUjtBQUNBLFFBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxRQUFaO0FBQ0QsT0FKSCxFQUtHLEtBTEgsQ0FLUyxVQUFDLEdBQUQsRUFBUztBQUNkLFFBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxHQUFaO0FBQ0QsT0FQSCxFQVFHLE9BUkgsQ0FRVyxZQUFNO0FBQ2IsUUFBQSxNQUFJLENBQUMsSUFBTCxHQUFZLEtBQVo7QUFDRCxPQVZIO0FBV0QsS0FwQ007QUFxQ1AsSUFBQSxPQUFPLEVBQUUsaUJBQVUsSUFBVixFQUFnQixLQUFoQixFQUF1QjtBQUM5QixVQUFLLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBZCxLQUF3QixRQUFPLEtBQVAsTUFBaUIsUUFBOUMsRUFBeUQ7QUFDdkQsZUFBTyxZQUFQO0FBQ0Q7O0FBRUQsYUFBTyxPQUFQO0FBQ0QsS0EzQ007QUE0Q1AsSUFBQSxNQUFNLEVBQUUsa0JBQVk7QUFBQTs7QUFDbEIsVUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGdCQUFULENBQTBCLG1DQUExQixDQUFoQjtBQUNBLE1BQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsT0FBakI7QUFDQSxVQUFNLEdBQUcsR0FBRyxFQUFaO0FBQ0EsVUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsVUFBQyxFQUFELEVBQUksQ0FBSixFQUFVO0FBQ3ZDO0FBRUEsWUFBTSxJQUFJLEdBQU0sRUFBRSxDQUFDLElBQW5CO0FBQ0EsWUFBTSxLQUFLLEdBQUssRUFBRSxDQUFDLEtBQW5CO0FBQ0EsWUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxZQUFYLENBQWhCLENBTHVDLENBT3ZDOztBQUNBLFlBQUksQ0FBQyxPQUFMLEVBQWM7QUFDWixVQUFBLEdBQUcsQ0FBQyxJQUFELENBQUgsR0FBWSxFQUFFLENBQUMsS0FBZjtBQUNBO0FBQ0QsU0FYc0MsQ0FhdkM7OztBQUNBLFlBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFMLENBQVksQ0FBWixFQUFlLElBQUksQ0FBQyxPQUFMLENBQWEsR0FBYixDQUFmLENBQWpCO0FBQ0EsWUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQVIsR0FBaUIsQ0FBaEM7QUFDQSxRQUFBLEdBQUcsQ0FBQyxRQUFELENBQUgsR0FBZ0IsR0FBRyxDQUFDLFFBQUQsQ0FBSCxLQUFrQixNQUFNLEdBQUcsRUFBSCxHQUFRLEVBQWhDLENBQWhCOztBQUNBLFlBQUksTUFBSixFQUFZO0FBQ1YsY0FBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLENBQUQsQ0FBbkI7QUFDQSxVQUFBLEdBQUcsQ0FBQyxRQUFELENBQUgsQ0FBYyxHQUFkLElBQXFCLEdBQUcsQ0FBQyxRQUFELENBQUgsQ0FBYyxHQUFkLEtBQXNCO0FBQUUsWUFBQSxHQUFHLEVBQUUsSUFBUDtBQUFhLFlBQUEsS0FBSyxFQUFFO0FBQXBCLFdBQTNDOztBQUVBLGNBQUksT0FBTyxDQUFDLENBQUQsQ0FBUCxLQUFlLE9BQW5CLEVBQTZCO0FBQzNCLFlBQUEsR0FBRyxDQUFDLFFBQUQsQ0FBSCxDQUFjLEdBQWQsRUFBbUIsR0FBbkIsR0FBeUIsS0FBekI7QUFDRCxXQUZELE1BRU8sSUFBSSxPQUFPLENBQUMsQ0FBRCxDQUFQLEtBQWUsU0FBbkIsRUFBK0I7QUFDcEMsWUFBQSxHQUFHLENBQUMsUUFBRCxDQUFILENBQWMsR0FBZCxFQUFtQixLQUFuQixHQUEyQixLQUEzQjtBQUNEO0FBR0YsU0FYRCxNQVdPO0FBQ0wsVUFBQSxHQUFHLENBQUMsUUFBRCxDQUFILENBQWMsSUFBZCxDQUFtQixLQUFuQjtBQUNEO0FBQ0YsT0EvQmMsQ0FBZjtBQWlDQSxVQUFNLE1BQU0sR0FBRyxFQUFmO0FBQ0EsTUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLEdBQVosRUFBaUIsT0FBakIsQ0FBeUIsVUFBQyxDQUFELEVBQU87QUFDOUIsWUFBSSxRQUFPLEdBQUcsQ0FBQyxDQUFELENBQVYsTUFBa0IsUUFBbEIsSUFBOEIsQ0FBRSxLQUFLLENBQUMsT0FBTixDQUFjLEdBQUcsQ0FBQyxDQUFELENBQWpCLENBQXBDLEVBQTREO0FBQzFELFVBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxHQUFHLENBQUMsQ0FBRCxDQUFqQixFQUFzQixPQUF0QixDQUE4QixVQUFBLENBQUMsRUFBSTtBQUNqQyxZQUFBLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBSCxDQUFOLEdBQWdCLENBQUMsQ0FBQyxLQUFsQjtBQUNELFdBRkQ7QUFHQSxVQUFBLEdBQUcsQ0FBQyxDQUFELENBQUgsR0FBUyxNQUFUO0FBQ0Q7QUFDRixPQVBEO0FBU0EsTUFBQSxHQUFHLENBQUMsUUFBSixHQUFlLEtBQUssV0FBcEI7QUFDQSxXQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0Esd0JBQ0UsS0FBSyxRQURQLEVBQ2lCO0FBQ2IsUUFBQSxNQUFNLEVBQUUsa0JBREs7QUFFYixRQUFBLElBQUksRUFBRTtBQUZPLE9BRGpCLEVBS0UsTUFMRixFQU9HLElBUEgsQ0FPUSxVQUFBLEdBQUcsRUFBSSxDQUFFLENBUGpCLEVBUUcsS0FSSCxDQVFTLFVBQUEsR0FBRyxFQUFJLENBQUUsQ0FSbEIsRUFTRyxPQVRILENBU1csWUFBTTtBQUNiLFFBQUEsTUFBSSxDQUFDLElBQUwsR0FBWSxLQUFaO0FBQ0QsT0FYSDtBQVlEO0FBekdNLEdBeENIO0FBbUpOLEVBQUEsV0FBVyxFQUFFLHVCQUFZO0FBQUE7O0FBQ3ZCLFFBQU0sR0FBRyxHQUFHO0FBQ1YsTUFBQSxNQUFNLEVBQUUsV0FERTtBQUVWLE1BQUEsSUFBSSxFQUFFO0FBRkksS0FBWjtBQUlBLHNCQUFJLEtBQUssUUFBVCxFQUFtQixHQUFuQixFQUF3QixNQUF4QixFQUNDLElBREQsQ0FDTSxVQUFDLEdBQUQsRUFBUztBQUNiLFVBQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxNQUFKLENBQVcsUUFBNUI7QUFDQSxVQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsSUFBdkI7QUFDQSxVQUFJLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBbkIsRUFBc0I7QUFDdEIsTUFBQSxNQUFJLENBQUMsS0FBTCxHQUFhLEtBQWI7QUFDRCxLQU5ELEVBT0MsS0FQRCxDQU9PLFVBQUMsR0FBRCxFQUFTO0FBQ2QsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLE9BQVosRUFBcUIsR0FBckI7QUFDRCxLQVREO0FBVUQsR0FsS0s7QUFtS04sRUFBQSxRQUFRO0FBbktGLENBQVI7Ozs7Ozs7Ozs7QUNkZSxrQkFBVSxHQUFWLEVBQWUsR0FBZixFQUEyQztBQUFBLE1BQXZCLFlBQXVCLHVFQUFSLE1BQVE7QUFDeEQsTUFBTSxHQUFHLEdBQUcsSUFBSSxjQUFKLEVBQVo7QUFFQSxTQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDdEMsUUFBTSxNQUFNLEdBQUcsWUFBWSxHQUFHLENBQUMsTUFBaEIsR0FBeUIsUUFBekIsR0FBb0MsSUFBSSxDQUFDLFNBQUwsQ0FBZSxHQUFHLENBQUMsSUFBbkIsQ0FBbkQ7QUFDQSxRQUFNLE9BQU8sR0FBRyxHQUFHLEdBQUcsR0FBTixHQUFZLE1BQTVCO0FBRUEsSUFBQSxHQUFHLENBQUMsSUFBSixDQUFTLE1BQVQsRUFBaUIsT0FBakI7QUFDQSxJQUFBLEdBQUcsQ0FBQyxnQkFBSixDQUFxQixjQUFyQixFQUFxQyxtQ0FBckM7QUFDQSxJQUFBLEdBQUcsQ0FBQyxZQUFKLEdBQW1CLE1BQW5COztBQUVBLElBQUEsR0FBRyxDQUFDLE1BQUosR0FBYSxVQUFDLEdBQUQsRUFBUztBQUNwQixVQUFJLEdBQUcsQ0FBQyxNQUFKLElBQWMsR0FBZCxJQUFxQixHQUFHLENBQUMsTUFBSixHQUFhLEdBQXRDLEVBQTJDLE9BQU8sQ0FBQyxHQUFELENBQVAsQ0FBM0MsS0FDSyxNQUFNLENBQUMsd0JBQUQsQ0FBTjtBQUNOLEtBSEQ7O0FBS0EsSUFBQSxHQUFHLENBQUMsSUFBSjtBQUNELEdBZE0sQ0FBUDtBQWVEOztBQUFBOzs7Ozs7Ozs7ZUNsQmM7QUFDYixFQUFBLEtBQUssRUFBRTtBQUNMLElBQUEsSUFBSSxFQUFFLENBQUMsTUFBRCxFQUFTLE1BQVQsQ0FERDtBQUVMLElBQUEsUUFBUSxFQUFFO0FBQ1IsTUFBQSxJQUFJLEVBQUUsT0FERTtBQUVSLE1BQUEsT0FBTyxFQUFFO0FBRkQsS0FGTDtBQU1MLElBQUEsS0FBSyxFQUFFLE1BTkY7QUFPTCxJQUFBLFlBQVksRUFBRSxPQVBUO0FBUUwsSUFBQSxPQUFPLEVBQUU7QUFSSixHQURNO0FBV2IsRUFBQSxVQUFVLEVBQUUsRUFYQztBQVliLEVBQUEsSUFBSSxFQUFFO0FBQUEsV0FBTztBQUNYLE1BQUEsVUFBVSxFQUFFO0FBREQsS0FBUDtBQUFBLEdBWk87QUFlYixFQUFBLEtBQUssRUFBRSxFQWZNO0FBZ0JiLEVBQUEsUUFBUSxFQUFFO0FBQ1IsSUFBQSxVQUFVLEVBQUUsc0JBQVk7QUFDdEIsYUFBTyxLQUFLLE9BQUwsSUFBZ0IsS0FBSyxJQUE1QjtBQUNELEtBSE87QUFJUixJQUFBLGNBQWMsRUFBRSwwQkFBWTtBQUMxQixhQUFPLEtBQUssWUFBTCxHQUFvQixhQUFwQixHQUFvQyxFQUEzQztBQUNELEtBTk87QUFPUixJQUFBLFlBQVksRUFBRSx3QkFBWTtBQUN4QixhQUFPLEtBQUssVUFBTCxLQUFvQixZQUEzQjtBQUNEO0FBVE8sR0FoQkc7QUEyQmIsRUFBQSxPQUFPLEVBQUU7QUFDUCxJQUFBLFNBQVMsRUFBRSxxQkFBWTtBQUNyQixXQUFLLEtBQUwsQ0FBVyxXQUFYLEVBQXdCLEtBQUssSUFBN0I7QUFDRDtBQUhNLEdBM0JJO0FBZ0NiLEVBQUEsV0FBVyxFQUFFLHVCQUFZO0FBQ3ZCLFNBQUssVUFBTCxHQUFrQixLQUFLLE9BQUwsQ0FBYSxRQUFiLENBQXNCLGFBQXhDO0FBQ0QsR0FsQ1k7QUFtQ2IsRUFBQSxRQUFRO0FBbkNLLEM7Ozs7Ozs7Ozs7Ozs7Ozs7QUNDYixFQUFBLEtBQUssRUFBRSxDQUFDLE1BQUQsRUFBUyxPQUFULEVBQWtCLEtBQWxCLEVBQXlCLFNBQXpCLEM7QUFDUCxFQUFBLElBQUksRUFBRSxFO0FBQ04sRUFBQSxVQUFVLEVBQUU7a0RBQ047QUFBQSxTQUFPLEVBQVA7QUFBQSxDLG1EQUdDLEUsc0RBQ0c7QUFDUixFQUFBLFlBQVksRUFBRSx3QkFBWTtBQUN4QixXQUFPLEtBQUssVUFBTCxLQUFvQixZQUEzQjtBQUNELEdBSE87QUFJUixFQUFBLEdBQUcsRUFBRSxlQUFZO0FBQ2YsV0FBTyxNQUFNLENBQUMsSUFBUCxDQUFZLEtBQUssS0FBakIsRUFBd0IsQ0FBeEIsQ0FBUDtBQUNELEdBTk87QUFPUixFQUFBLE1BQU0sRUFBRSxrQkFBWTtBQUNsQixXQUFPLEtBQUssS0FBTCxDQUFXLEtBQUssR0FBaEIsQ0FBUDtBQUNEO0FBVE8sQyxxREFXRDtBQUNQLEVBQUEsVUFBVSxFQUFFLG9CQUFVLE1BQVYsRUFBa0I7QUFDNUIsV0FBTyxLQUFLLE9BQUwsR0FBZSxHQUFmLEdBQXFCLE1BQXJCLEdBQThCLEdBQXJDO0FBQ0QsR0FITTtBQUlQLEVBQUEsU0FBUyxFQUFFLHFCQUFZO0FBQ3JCLFNBQUssS0FBTCxDQUFXLFdBQVgsRUFBd0IsS0FBSyxJQUE3QjtBQUNEO0FBTk0sQzs7Ozs7Ozs7Ozs7O0FDbkJYOztBQUNBOzs7O2VBRWU7QUFDYixFQUFBLEtBQUssRUFBRTtBQUNMLElBQUEsSUFBSSxFQUFFO0FBQ0osTUFBQSxJQUFJLEVBQUUsTUFERjtBQUVKLE1BQUEsT0FBTyxFQUFFLE9BRkw7QUFHSixNQUFBLFNBQVMsRUFBRSxtQkFBVSxLQUFWLEVBQWlCO0FBQzFCO0FBQ0EsZUFBTyxDQUFDLE9BQUQsRUFBVSxVQUFWLEVBQXNCLE9BQXRCLENBQThCLEtBQTlCLE1BQXlDLENBQUMsQ0FBakQ7QUFDRDtBQU5HLEtBREQ7QUFTTCxJQUFBLElBQUksRUFBRSxNQVREO0FBVUwsSUFBQSxHQUFHLEVBQUUsQ0FBQyxLQUFELEVBQVEsTUFBUjtBQVZBLEdBRE07QUFhYixFQUFBLElBQUksRUFBRTtBQUFBLFdBQU87QUFDWCxNQUFBLFdBQVcsRUFBRTtBQURGLEtBQVA7QUFBQSxHQWJPO0FBZ0JiLEVBQUEsVUFBVSxFQUFFO0FBQ1YsSUFBQSxLQUFLLEVBQUwsY0FEVTtBQUVWLElBQUEsUUFBUSxFQUFSO0FBRlUsR0FoQkM7QUFvQmIsRUFBQSxLQUFLLEVBQUUsRUFwQk07QUFxQmIsRUFBQSxRQUFRLEVBQUU7QUFDUixJQUFBLE9BQU8sRUFBRSxtQkFBWTtBQUNuQixhQUFPLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxHQUFuQixJQUEwQixPQUExQixHQUFvQyxRQUEzQztBQUNELEtBSE87QUFJUixJQUFBLE9BQU8sRUFBRSxtQkFBWTtBQUNuQjtBQUNBLGFBQU8sS0FBSyxPQUFMLEtBQWlCLE9BQWpCLEdBQTJCLE9BQTNCLEdBQXFDLFVBQTVDO0FBQ0QsS0FQTztBQVFSLElBQUEsUUFBUSxFQUFFLG9CQUFZO0FBQ3BCLFVBQU0sSUFBSSxHQUFHLEtBQUssT0FBbEI7QUFDQSxhQUFPLElBQUksS0FBSyxPQUFULEdBQW1CLEtBQW5CLEdBQTJCLElBQWxDO0FBQ0Q7QUFYTyxHQXJCRztBQWtDYixFQUFBLE9BQU8sRUFBRTtBQUNQLElBQUEsTUFBTSxFQUFFLGtCQUFZO0FBQ2xCLFVBQUksR0FBRyxHQUFHLElBQVY7O0FBQ0EsVUFBSSxLQUFLLE9BQUwsS0FBaUIsVUFBckIsRUFBaUM7QUFDL0IsWUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFLLEdBQWpCLEVBQXNCLE1BQWxDO0FBQ0EsUUFBQSxHQUFHLEdBQUcsRUFBTjtBQUNBLFFBQUEsR0FBRyxDQUFDLEVBQUQsQ0FBSCxHQUFVLElBQVY7QUFDRDs7QUFFRCxXQUFLLFdBQUwsQ0FBaUIsSUFBakIsQ0FBc0IsR0FBdEI7QUFDRCxLQVZNO0FBV1AsSUFBQSxVQUFVLEVBQUUsb0JBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsSUFBaEIsRUFBc0I7QUFDaEMsYUFBTyxJQUFJLEdBQUcsR0FBUCxHQUFhLENBQWIsR0FBaUIsR0FBeEI7QUFDRCxLQWJNO0FBY1AsSUFBQSxTQUFTLEVBQUUsbUJBQVMsSUFBVCxFQUFlO0FBQ3hCLFdBQUssV0FBTCxDQUFpQixNQUFqQixDQUF3QixJQUF4QixFQUE4QixDQUE5QjtBQUNEO0FBaEJNLEdBbENJO0FBb0RiLEVBQUEsV0FBVyxFQUFFLHVCQUFZO0FBQUE7O0FBQ3ZCLFFBQU0sSUFBSSxHQUFHLEtBQUssT0FBbEI7O0FBQ0EsUUFBSyxJQUFJLEtBQUssT0FBZCxFQUF3QjtBQUN0QixXQUFLLEdBQUwsQ0FBUyxPQUFULENBQWlCLFVBQUMsQ0FBRCxFQUFHLENBQUgsRUFBUztBQUN4QixRQUFBLEtBQUksQ0FBQyxXQUFMLENBQWlCLElBQWpCLENBQXNCLENBQXRCO0FBQ0QsT0FGRDtBQUdELEtBSkQsTUFJTztBQUNMLE1BQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFLLEdBQWpCLEVBQXNCLE9BQXRCLENBQThCLFVBQUMsQ0FBRCxFQUFPO0FBQ25DLFlBQU0sR0FBRyxHQUFHLEVBQVo7QUFDQSxRQUFBLEdBQUcsQ0FBQyxDQUFELENBQUgsR0FBUyxLQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsQ0FBVDs7QUFDQSxRQUFBLEtBQUksQ0FBQyxXQUFMLENBQWlCLElBQWpCLENBQXNCLEdBQXRCO0FBQ0QsT0FKRDtBQUtEO0FBQ0YsR0FqRVk7QUFrRWIsRUFBQSxRQUFRO0FBbEVLLEM7Ozs7Ozs7Ozs7Ozs7Ozs7QUNGYixFQUFBLEtBQUssRUFBRSxDQUFDLE1BQUQsRUFBUyxPQUFULEM7QUFDUCxFQUFBLElBQUksRUFBRSxFO0FBQ04sRUFBQSxVQUFVLEVBQUU7a0RBQ047QUFBQSxTQUFPLEVBQVA7QUFBQSxDLG1EQUNDLEUsc0RBQ0csRSxxREFDRCxFOzs7OztBQ1BYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IFhIUiBmcm9tICcuL21vZHVsZXMveGhyJztcbmltcG9ydCBWdWUgZnJvbSAndnVlL2Rpc3QvdnVlLmpzJztcbmltcG9ydCBGaWVsZCBmcm9tICAnLi92dWUtY29tcG9uZW50cy9GaWVsZCc7XG5pbXBvcnQgUmVwZWF0YWJsZSBmcm9tICAnLi92dWUtY29tcG9uZW50cy9SZXBlYXRhYmxlJztcbmltcG9ydCBLZXlWYWx1ZSBmcm9tICAnLi92dWUtY29tcG9uZW50cy9LZXlWYWx1ZSc7XG5pbXBvcnQgVGV4dEFyZWEgZnJvbSAgJy4vdnVlLWNvbXBvbmVudHMvVGV4dEFyZWEnO1xuXG5WdWUuZmlsdGVyKCdwcmV0dHlTdHJpbmdzJywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gIGlmICghdmFsdWUpIHJldHVybiAnJ1xuICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCk7XG4gIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvXy9nLCAnICcpO1xuICByZXR1cm4gdmFsdWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB2YWx1ZS5zbGljZSgxKTtcbn0pO1xuXG5uZXcgVnVlKHtcbiAgZWw6ICcjanMtLXZpZXcta2V5LWNvbmZpZycsXG4gIGNvbXBvbmVudHM6IHtcbiAgICBGaWVsZCxcbiAgICBSZXBlYXRhYmxlLFxuICAgIEtleVZhbHVlLFxuICAgIFRleHRBcmVhLFxuICB9LFxuICBkYXRhOiB7XG4gICAgY3VycmVudFNpdGU6IG51bGwsXG4gICAgY3VycmVudFNpdGVDb25maWdzOiBudWxsLFxuICAgIHNpdGVzOiBbXSxcbiAgICBBSkFYX1VSTDogJy9hcGknLFxuICAgIGJ1c3k6IGZhbHNlLFxuICB9LFxuICB3YXRjaDoge1xuICAgIGN1cnJlbnRTaXRlOiBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xuICAgICAgaWYgKG5ld1ZhbCA9PT0gJ25ldycpIHJldHVybjtcbiAgICAgIGNvbnN0IGRhdGEgICA9IHRoaXMuY3VycmVudFNpdGU7XG4gICAgICBjb25zdCBhY3Rpb24gPSAnc2l0ZS1jb25maWcnO1xuXG4gICAgICBYSFIodGhpcy5BSkFYX1VSTCwge2FjdGlvbiwgZGF0YX0sICdqc29uJylcbiAgICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgICAgdGhpcy5jdXJyZW50U2l0ZUNvbmZpZ3MgPSBudWxsO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBjb25zdCByZXNwb25zZSAgICAgICAgICA9IHJlcy50YXJnZXQucmVzcG9uc2U7XG4gICAgICAgICAgdGhpcy5jdXJyZW50U2l0ZUNvbmZpZ3MgPSByZXNwb25zZS5kYXRhO1xuICAgICAgICB9LCAxMDAwKTtcblxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdlcnJvcicsIGVycik7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHNpdGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmN1cnJlbnRTaXRlQ29uZmlncyA9IG51bGw7XG4gICAgICB0aGlzLmN1cnJlbnRTaXRlID0gdGhpcy5zaXRlc1swXTtcbiAgICB9LFxuICB9LFxuICBjb21wdXRlZDoge30sXG4gIG1ldGhvZHM6IHtcbiAgICBhZGRTaXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmN1cnJlbnRTaXRlID0gJ25ldyc7XG4gICAgICBjb25zdCBkYXRhICAgPSBudWxsXG4gICAgICBjb25zdCBhY3Rpb24gPSAnbmV3X3NpdGVfZm9ybSc7XG5cbiAgICAgIFhIUih0aGlzLkFKQVhfVVJMLCB7YWN0aW9uLCBkYXRhfSwgJ2pzb24nKVxuICAgICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICB0aGlzLmN1cnJlbnRTaXRlQ29uZmlncyA9IG51bGw7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlICAgICAgICAgID0gcmVzLnRhcmdldC5yZXNwb25zZTtcbiAgICAgICAgICB0aGlzLmN1cnJlbnRTaXRlQ29uZmlncyA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgIH0sIDEwMDApO1xuXG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ2Vycm9yJywgZXJyKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgcmVidWlsZFZob3N0czogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIGNvbnN0IG9iaiA9IHtcbiAgICAgICAgYWN0aW9uOiAncmVidWlsZC12aG9zdHMnLFxuICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgfVxuICAgICAgdGhpcy5idXN5ID0gdHJ1ZTtcbiAgICAgIFhIUih0aGlzLkFKQVhfVVJMLCBvYmosICdqc29uJylcbiAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgIGNvbnN0IHsgcmVzcG9uc2UgfSA9IHJlcy50YXJnZXQ7XG4gICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIH0pXG4gICAgICAgIC5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICB0aGlzLmJ1c3kgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBzZXRUeXBlOiBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgICAgIGlmICggQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHwgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyApIHtcbiAgICAgICAgcmV0dXJuICdSZXBlYXRhYmxlJ1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gJ0ZpZWxkJztcbiAgICB9LFxuICAgIHN1Ym1pdDogZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgJGZpZWxkcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Zvcm0ubWFpbi1mb3JtIGlucHV0W3R5cGU9XCJ0ZXh0XCJdJyk7XG4gICAgICB3aW5kb3cuJGZpZWxkcyA9ICRmaWVsZHM7XG4gICAgICBjb25zdCBvYmogPSB7fTtcbiAgICAgIGNvbnN0IHZhbHVlcyA9ICRmaWVsZHMuZm9yRWFjaCgoJGUsaSkgPT4ge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhpLCAkZS5uYW1lLCAkZS52YWx1ZSApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgbmFtZSAgICA9ICRlLm5hbWU7XG4gICAgICAgIGNvbnN0IHZhbHVlICAgPSAkZS52YWx1ZTtcbiAgICAgICAgY29uc3QgbWF0Y2hlcyA9IG5hbWUubWF0Y2goL1xcWyguKj8pXFxdL2cpO1xuXG4gICAgICAgIC8vIHN0YW5kYXJkIGZpZWxkXG4gICAgICAgIGlmICghbWF0Y2hlcykge1xuICAgICAgICAgIG9ialtuYW1lXSA9ICRlLnZhbHVlO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlzIHJlcGVhdGFibGUgZmllbGQgbGlrZSBhcnJheSBvciBrZXkgdmFsdWUgcGFpcnNcbiAgICAgICAgY29uc3QgcmVhbE5hbWUgPSBuYW1lLnN1YnN0cigwLCBuYW1lLmluZGV4T2YoJ1snKSk7XG4gICAgICAgIGNvbnN0IGlzX29iaiA9IG1hdGNoZXMubGVuZ3RoID4gMTtcbiAgICAgICAgb2JqW3JlYWxOYW1lXSA9IG9ialtyZWFsTmFtZV0gfHwgKGlzX29iaiA/IHt9IDogW10pO1xuICAgICAgICBpZiAoaXNfb2JqKSB7XG4gICAgICAgICAgY29uc3QgaWR4ID0gbWF0Y2hlc1swXTtcbiAgICAgICAgICBvYmpbcmVhbE5hbWVdW2lkeF0gPSBvYmpbcmVhbE5hbWVdW2lkeF0gfHwgeyBrZXk6IG51bGwsIHZhbHVlOiBudWxsIH07XG4gICAgICAgICAgXG4gICAgICAgICAgaWYoIG1hdGNoZXNbMV0gPT09ICdba2V5XScgKSB7XG4gICAgICAgICAgICBvYmpbcmVhbE5hbWVdW2lkeF0ua2V5ID0gdmFsdWU7XG4gICAgICAgICAgfSBlbHNlIGlmKCBtYXRjaGVzWzFdID09PSAnW3ZhbHVlXScgKSB7XG4gICAgICAgICAgICBvYmpbcmVhbE5hbWVdW2lkeF0udmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYmpbcmVhbE5hbWVdLnB1c2godmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgbmV3T2JqID0ge307XG4gICAgICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goKGUpID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBvYmpbZV0gPT09ICdvYmplY3QnICYmICEgQXJyYXkuaXNBcnJheShvYmpbZV0pICkge1xuICAgICAgICAgIE9iamVjdC52YWx1ZXMob2JqW2VdKS5mb3JFYWNoKG4gPT4ge1xuICAgICAgICAgICAgbmV3T2JqW24ua2V5XSA9IG4udmFsdWU7XG4gICAgICAgICAgfSlcbiAgICAgICAgICBvYmpbZV0gPSBuZXdPYmo7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBvYmouc2l0ZW5hbWUgPSB0aGlzLmN1cnJlbnRTaXRlO1xuICAgICAgdGhpcy5idXN5ID0gdHJ1ZTtcbiAgICAgIFhIUihcbiAgICAgICAgdGhpcy5BSkFYX1VSTCwge1xuICAgICAgICAgIGFjdGlvbjogJ3VwZGF0ZS1zaXRlLWZpbGUnLFxuICAgICAgICAgIGRhdGE6IG9iaixcbiAgICAgICAgfSxcbiAgICAgICAgJ2pzb24nXG4gICAgICApXG4gICAgICAgIC50aGVuKHJlcyA9PiB7fSlcbiAgICAgICAgLmNhdGNoKGVyciA9PiB7fSlcbiAgICAgICAgLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuYnVzeSA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9LFxuICB9LFxuICBiZWZvcmVNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IG9iaiA9IHtcbiAgICAgIGFjdGlvbjogJ3NpdGUtbGlzdCcsXG4gICAgICBkYXRhOiBudWxsLFxuICAgIH1cbiAgICBYSFIodGhpcy5BSkFYX1VSTCwgb2JqLCAnanNvbicpXG4gICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSByZXMudGFyZ2V0LnJlc3BvbnNlO1xuICAgICAgY29uc3Qgc2l0ZXMgPSByZXNwb25zZS5kYXRhO1xuICAgICAgaWYgKHNpdGVzLmxlbmd0aCA8IDEpIHJldHVybjtcbiAgICAgIHRoaXMuc2l0ZXMgPSBzaXRlcztcbiAgICB9KVxuICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZygnZXJyb3InLCBlcnIpO1xuICAgIH0pO1xuICB9LFxuICB0ZW1wbGF0ZTogYFxuPGRpdiBjbGFzcz1cInJvd1wiID5cblxuICA8ZGl2IGNsYXNzPVwiY29sLW1kLTNcIj5cbiAgICAgIDxmb3JtPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgIDxsYWJlbCBmb3I9XCJleGFtcGxlRm9ybUNvbnRyb2xTZWxlY3QxXCI+WW91ciBzaXRlczwvbGFiZWw+XG4gICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImZvcm0tY29udHJvbFwiXG4gICAgICAgICAgICBkYXRhLWFjdGlvbj1cInNpdGUtY29uZmlnXCJcbiAgICAgICAgICAgIHYtbW9kZWw9XCJjdXJyZW50U2l0ZVwiXG4gICAgICAgICAgICA6ZGlzYWJsZWQ9XCJidXN5XCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8b3B0aW9uIHNlbGVjdGVkPVwidHJ1ZVwiIGRpc2FibGVkPVwiZGlzYWJsZWRcIj4tc2VsZWN0IHNpdGUtPC9vcHRpb24+XG4gICAgICAgICAgICA8b3B0aW9uIHYtZm9yPVwic2l0ZSBpbiBzaXRlc1wiIDp2YWx1ZT1cInNpdGVcIj57e3NpdGV9fTwvb3B0aW9uPlxuICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIlxuICAgICAgICAgICAgY2xhc3M9XCJidG4gYnRuLXByaW1hcnkganMtLXJlYnVpbGQtdmhvc3RcIlxuICAgICAgICAgICAgdi1vbjpjbGljay5wcmV2ZW50PVwicmVidWlsZFZob3N0c1wiXG4gICAgICAgICAgICA6ZGlzYWJsZWQ9XCJidXN5XCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICBSZWJ1bGQgdmhvc3RzXG4gICAgICAgICAgPC9idXR0b24+XG5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCJcbiAgICAgICAgICAgIHYtb246Y2xpY2s9XCJhZGRTaXRlXCJcbiAgICAgICAgICAgIDpkaXNhYmxlZD1cIiRyb290LmJ1c3lcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxpIGNsYXNzPVwiZmFzIGZhLXBsdXMtY2lyY2xlXCI+PC9pPlxuICAgICAgICAgIDwvYnV0dG9uPlxuXG4gICAgICAgIDwvZGl2PlxuICAgICAgICBcbiAgICAgIDwvZm9ybT5cbiAgICA8L2Rpdj5cblxuICA8ZGl2IGNsYXNzPVwiY29sLW1kLTlcIj5cbiAgICA8Zm9ybSBjbGFzcz1cIm1haW4tZm9ybVwiPlxuICAgICAgPHRyYW5zaXRpb24tZ3JvdXAgbmFtZT1cImZhZGVcIj5cbiAgICAgICAgPGNvbXBvbmVudFxuICAgICAgICAgIHYtZm9yPVwiKGNvbmZpZywgaWR4KSBpbiBjdXJyZW50U2l0ZUNvbmZpZ3NcIlxuICAgICAgICAgIHYtaWY9XCJjdXJyZW50U2l0ZUNvbmZpZ3NcIiBcbiAgICAgICAgICA6a2V5PVwiaWR4XCJcbiAgICAgICAgICA6aXM9XCJzZXRUeXBlKGlkeCwgY29uZmlnKVwiXG4gICAgICAgICAgOm5hbWU9XCJpZHhcIlxuICAgICAgICAgIDpvYmo9XCJjb25maWdcIlxuICAgICAgICAgIDp2YWx1ZT1cImNvbmZpZ1wiXG4gICAgICAgIC8+XG4gICAgICA8L3RyYW5zaXRpb24tZ3JvdXA+XG4gICAgICBcbiAgICAgIDwhLS0gPHRyYW5zaXRpb24gbmFtZT1cImZhZGVcIiB2LWlmPVwiY3VycmVudFNpdGVDb25maWdzXCIgPiAtLT5cbiAgICAgICAgPGJ1dHRvbiBcbiAgICAgICAgICB0eXBlPVwic3VibWl0XCJcbiAgICAgICAgICBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiIFxuICAgICAgICAgIHYtaWY9XCJjdXJyZW50U2l0ZUNvbmZpZ3NcInYtb246Y2xpY2sucHJldmVudD1cInN1Ym1pdFwiXG4gICAgICAgID5cbiAgICAgICAgICBTdWJtaXRcbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8IS0tIDwvdHJhbnNpdGlvbj4gLS0+XG5cbiAgICA8L2Zvcm0+XG4gIDwvZGl2PlxuPC9kaXY+IDwhLS0gL3JvdyAtLT5cblxuICBgLFxufSk7IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKHVybCwgb2JqLCByZXNwb25zZVR5cGUgPSAnanNvbicpIHtcbiAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBwYXJhbXMgPSAnYWN0aW9uPScgKyBvYmouYWN0aW9uICsgJyZkYXRhPScgKyBKU09OLnN0cmluZ2lmeShvYmouZGF0YSk7XG4gICAgY29uc3QgdXJsQXJncyA9IHVybCArICc/JyArIHBhcmFtcztcblxuICAgIHhoci5vcGVuKCdQT1NUJywgdXJsQXJncyk7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcbiAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xuXG4gICAgeGhyLm9ubG9hZCA9IChyZXMpID0+IHtcbiAgICAgIGlmICh4aHIuc3RhdHVzID49IDIwMCAmJiB4aHIuc3RhdHVzIDwgMzAwKSByZXNvbHZlKHJlcyk7XG4gICAgICBlbHNlIHJlamVjdCgnc29tZXRoaW5nIGJhZCBoYXBwZW5lZCcpXG4gICAgfTtcblxuICAgIHhoci5zZW5kKCk7XG4gIH0pO1xufTsiLCJleHBvcnQgZGVmYXVsdCB7XG4gIHByb3BzOiB7XG4gICAgbmFtZTogW1N0cmluZywgTnVtYmVyXSxcbiAgICBzaG93TmFtZToge1xuICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICB2YWx1ZTogU3RyaW5nLFxuICAgIGlzUmVwZWF0YWJsZTogQm9vbGVhbixcbiAgICBuYW1lVGFnOiBTdHJpbmcsXG4gIH0sXG4gIGNvbXBvbmVudHM6IHt9LFxuICBkYXRhOiAoKSA9PiAoe1xuICAgIHBhcmVudFR5cGU6IG51bGwsXG4gIH0pLFxuICB3YXRjaDoge30sXG4gIGNvbXB1dGVkOiB7XG4gICAgZ2V0TmFtZVRhZzogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMubmFtZVRhZyB8fCB0aGlzLm5hbWU7XG4gICAgfSxcbiAgICBmb3JtR3JvdXBDbGFzczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuaW5SZXBlYXRhYmxlID8gJ2lucHV0LWdyb3VwJyA6ICcnO1xuICAgIH0sXG4gICAgaW5SZXBlYXRhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJlbnRUeXBlID09PSAnUmVwZWF0YWJsZSc7XG4gICAgfSxcbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIHJlbW92ZVJvdzogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy4kZW1pdCgncmVtb3ZlUm93JywgdGhpcy5uYW1lKTtcbiAgICB9XG4gIH0sXG4gIGJlZm9yZU1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wYXJlbnRUeXBlID0gdGhpcy4kcGFyZW50LiRvcHRpb25zLl9jb21wb25lbnRUYWc7XG4gIH0sXG4gIHRlbXBsYXRlOiBgXG4gIDxkaXYgOmNsYXNzPVwiZm9ybUdyb3VwQ2xhc3NcIiBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cbiAgICA8bGFiZWwgY2xhc3M9XCJsYWJlbC1sYXJnZVwiIHYtaWY9XCJzaG93TmFtZVwiIGZvcj1cIlwiPnt7bmFtZSB8IHByZXR0eVN0cmluZ3MgfX08L2xhYmVsPlxuICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgXG4gICAgICA6dmFsdWU9XCJ2YWx1ZVwiIDpkaXNhYmxlZD1cIiRyb290LmJ1c3lcIlxuICAgICAgOm5hbWU9XCJnZXROYW1lVGFnXCJcbiAgICAvPlxuICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1ncm91cC1hcHBlbmRcIiB2LWlmPVwiaW5SZXBlYXRhYmxlXCI+XG4gICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXJcIiB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgdi1vbjpjbGljaz1cInJlbW92ZVJvd1wiXG4gICAgICAgIDpkaXNhYmxlZD1cInRoaXMuJHJvb3QuYnVzeVwiXG4gICAgICA+XG4gICAgICAgIDxpIGNsYXNzPVwiZmFzIGZhLW1pbnVzLWNpcmNsZSB0ZXh0LXdoaXRlXCI+PC9pPlxuICAgICAgPC9idXR0b24+XG5cbiAgICA8L2Rpdj5cbiAgPC9kaXY+XG4gIGAsXG59O1xuIiwiZXhwb3J0IGRlZmF1bHQge1xuICBwcm9wczogWyduYW1lJywgJ3ZhbHVlJywgJ2lkeCcsICduYW1lVGFnJ10sXG4gIGRhdGE6IHt9LFxuICBjb21wb25lbnRzOiB7fSxcbiAgZGF0YTogKCkgPT4gKHtcblxuICB9KSxcbiAgd2F0Y2g6IHt9LFxuICBjb21wdXRlZDoge1xuICAgIGluUmVwZWF0YWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMucGFyZW50VHlwZSA9PT0gJ1JlcGVhdGFibGUnO1xuICAgIH0sXG4gICAga2V5OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy52YWx1ZSlbMF07XG4gICAgfSxcbiAgICBrZXlWYWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlW3RoaXMua2V5XTtcbiAgICB9LFxuICB9LFxuICBtZXRob2RzOiB7XG4gICAgZ2V0TmFtZVRhZzogZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgcmV0dXJuIHRoaXMubmFtZVRhZyArICdbJyArIHRhcmdldCArICddJ1xuICAgIH0sXG4gICAgcmVtb3ZlUm93OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLiRlbWl0KCdyZW1vdmVSb3cnLCB0aGlzLm5hbWUpO1xuICAgIH1cbiAgfSxcbiAgdGVtcGxhdGU6IGBcbiAgPGRpdiBjbGFzcz1cImZvcm0tcm93XCI+ICAgIFxuXG4gICAgPGRpdiBjbGFzcz1cImNvbC1tZC00XCI+XG4gICAgICA8bGFiZWw+S2V5PC9sYWJlbD5cbiAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgOnZhbHVlPVwia2V5XCIgOmRpc2FibGVkPVwiJHJvb3QuYnVzeVwiIDpuYW1lPVwiZ2V0TmFtZVRhZygna2V5JylcIj5cbiAgICA8L2Rpdj5cbiAgICBcbiAgICA8ZGl2IGNsYXNzPVwiY29sLW1kLThcIj5cbiAgICAgIDxsYWJlbD5WYWx1ZTwvbGFiZWw+XG4gICAgICA8ZGl2IGNsYXNzPVwiaW5wdXQtZ3JvdXBcIj5cbiAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiA6dmFsdWU9XCJrZXlWYWxcIlxuICAgICAgICAgIDpkaXNhYmxlZD1cIiRyb290LmJ1c3lcIlxuICAgICAgICAgIDpuYW1lPVwiZ2V0TmFtZVRhZygndmFsdWUnKVwiXG4gICAgICAgID5cbiAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0LWdyb3VwLWFwcGVuZFwiPlxuICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLWRhbmdlclwiIHR5cGU9XCJidXR0b25cIiB2LW9uOmNsaWNrPVwicmVtb3ZlUm93XCJcbiAgICAgICAgICAgIDpkaXNhYmxlZD1cIiRyb290LmJ1c3lcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxpIGNsYXNzPVwiZmFzIGZhLW1pbnVzLWNpcmNsZSB0ZXh0LXdoaXRlXCI+PC9pPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuXG5cbiAgPC9kaXY+YCxcbn07XG4iLCJpbXBvcnQgRmllbGQgZnJvbSAnLi9GaWVsZCc7XG5pbXBvcnQgS2V5VmFsdWUgZnJvbSAgJy4vS2V5VmFsdWUnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHByb3BzOiB7XG4gICAgdHlwZToge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJ0ZpZWxkJyxcbiAgICAgIHZhbGlkYXRvcjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIFRoZSB2YWx1ZSBtdXN0IG1hdGNoIG9uZSBvZiB0aGVzZSBzdHJpbmdzXG4gICAgICAgIHJldHVybiBbJ0ZpZWxkJywgJ0tleVZhbHVlJ10uaW5kZXhPZih2YWx1ZSkgIT09IC0xXG4gICAgICB9LFxuICAgIH0sXG4gICAgbmFtZTogU3RyaW5nLFxuICAgIG9iajogW0FycmF5LCBPYmplY3RdLFxuICB9LFxuICBkYXRhOiAoKSA9PiAoe1xuICAgIGZpZWxkVmFsdWVzOiBbXSxcbiAgfSksXG4gIGNvbXBvbmVudHM6IHtcbiAgICBGaWVsZCxcbiAgICBLZXlWYWx1ZSxcbiAgfSxcbiAgd2F0Y2g6IHt9LFxuICBjb21wdXRlZDoge1xuICAgIG9ialR5cGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KHRoaXMub2JqKSA/ICdhcnJheScgOiAnb2JqZWN0J1xuICAgIH0sXG4gICAgc2V0VHlwZTogZnVuY3Rpb24gKCkge1xuICAgICAgLy8gY29uc29sZS5sb2codGhpcy5vYmpUeXBlKTtcbiAgICAgIHJldHVybiB0aGlzLm9ialR5cGUgPT09ICdhcnJheScgPyAnRmllbGQnIDogJ0tleVZhbHVlJztcbiAgICB9LFxuICAgIHNob3dOYW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCB0eXBlID0gdGhpcy5zZXRUeXBlO1xuICAgICAgcmV0dXJuIHR5cGUgPT09ICdGaWVsZCcgPyBmYWxzZSA6IHRydWU7XG4gICAgfVxuICB9LFxuICBtZXRob2RzOiB7XG4gICAgYWRkUm93OiBmdW5jdGlvbiAoKSB7XG4gICAgICBsZXQgdmFsID0gbnVsbDtcbiAgICAgIGlmICh0aGlzLnNldFR5cGUgPT09ICdLZXlWYWx1ZScpIHtcbiAgICAgICAgY29uc3QgbGVuID0gT2JqZWN0LmtleXModGhpcy5vYmopLmxlbmd0aDtcbiAgICAgICAgdmFsID0ge307XG4gICAgICAgIHZhbFsnJ10gPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmZpZWxkVmFsdWVzLnB1c2godmFsKTtcbiAgICB9LFxuICAgIGdldE5hbWVUYWc6IGZ1bmN0aW9uIChlLCBpLCBuYW1lKSB7XG4gICAgICByZXR1cm4gbmFtZSArICdbJyArIGkgKyAnXSc7XG4gICAgfSxcbiAgICByZW1vdmVSb3c6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHRoaXMuZmllbGRWYWx1ZXMuc3BsaWNlKGRhdGEsIDEpO1xuICAgIH1cbiAgfSxcbiAgYmVmb3JlTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCB0eXBlID0gdGhpcy5vYmpUeXBlO1xuICAgIGlmICggdHlwZSA9PT0gJ2FycmF5JyApIHtcbiAgICAgIHRoaXMub2JqLmZvckVhY2goKGUsaSkgPT4ge1xuICAgICAgICB0aGlzLmZpZWxkVmFsdWVzLnB1c2goZSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgT2JqZWN0LmtleXModGhpcy5vYmopLmZvckVhY2goKGUpID0+IHtcbiAgICAgICAgY29uc3Qgb2JqID0ge307XG4gICAgICAgIG9ialtlXSA9IHRoaXMub2JqW2VdO1xuICAgICAgICB0aGlzLmZpZWxkVmFsdWVzLnB1c2gob2JqKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgdGVtcGxhdGU6IGBcbiAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXAgcmVwZWF0YWJsZVwiPlxuICAgIDxsYWJlbCBjbGFzcz1cImxhYmVsLWxhcmdlXCIgZm9yPVwiXCI+e3tuYW1lIHwgcHJldHR5U3RyaW5ncyB9fTwvbGFiZWw+XG4gICAgPGNvbXBvbmVudCBcbiAgICAgIHYtZm9yPVwiKGUsIGkpIGluIHRoaXMuZmllbGRWYWx1ZXNcIlxuICAgICAgOmtleT1cImlcIlxuICAgICAgOmlkeD1cImlcIlxuICAgICAgOmlzPVwic2V0VHlwZVwiXG4gICAgICA6bmFtZT1cIm5hbWVcIlxuICAgICAgOnZhbHVlPVwiZVwiXG4gICAgICA6c2hvd05hbWU9XCJzaG93TmFtZVwiXG4gICAgICA6aXNSZXBlYXRhYmxlPVwidHJ1ZVwiXG4gICAgICA6bmFtZVRhZz1cImdldE5hbWVUYWcoZSxpLCBuYW1lKVwiXG4gICAgICB2LW9uOnJlbW92ZVJvdz1cInJlbW92ZVJvd1wiXG4gICAgLz5cbiAgICA8ZGl2PlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIlxuICAgICAgICB2LW9uOmNsaWNrPVwiYWRkUm93XCJcbiAgICAgICAgOmRpc2FibGVkPVwiJHJvb3QuYnVzeVwiXG4gICAgICA+XG4gICAgICAgIDxpIGNsYXNzPVwiZmFzIGZhLXBsdXMtY2lyY2xlXCI+PC9pPlxuICAgICAgPC9idXR0b24+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuICBgLFxufTtcbiIsImV4cG9ydCBkZWZhdWx0IHtcbiAgcHJvcHM6IFsnbmFtZScsICd2YWx1ZSddLFxuICBkYXRhOiB7fSxcbiAgY29tcG9uZW50czoge30sXG4gIGRhdGE6ICgpID0+ICh7fSksXG4gIHdhdGNoOiB7fSxcbiAgY29tcHV0ZWQ6IHt9LFxuICBtZXRob2RzOiB7fSxcbiAgdGVtcGxhdGU6IGBcbiAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cbiAgICA8bGFiZWwgY2xhc3M9XCJsYWJlbC1sYXJnZVwiIGZvcj1cIlwiPnt7bmFtZSB8IHByZXR0eVN0cmluZ3N9fTwvbGFiZWw+PGJyIC8+XG4gICAgPHRleHRhcmVhIHN0eWxlPVwid2lkdGg6IDEwMCVcIiByb3dzPVwiNVwiIDpuYW1lPVwibmFtZVwiIDpkaXNhYmxlZD1cIiRyb290LmJ1c3lcIj57e3ZhbHVlfX08L3RleHRhcmVhPlxuICA8L2Rpdj5gLFxufTtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJ2YXIgbmV4dFRpY2sgPSByZXF1aXJlKCdwcm9jZXNzL2Jyb3dzZXIuanMnKS5uZXh0VGljaztcbnZhciBhcHBseSA9IEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseTtcbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBpbW1lZGlhdGVJZHMgPSB7fTtcbnZhciBuZXh0SW1tZWRpYXRlSWQgPSAwO1xuXG4vLyBET00gQVBJcywgZm9yIGNvbXBsZXRlbmVzc1xuXG5leHBvcnRzLnNldFRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBUaW1lb3V0KGFwcGx5LmNhbGwoc2V0VGltZW91dCwgd2luZG93LCBhcmd1bWVudHMpLCBjbGVhclRpbWVvdXQpO1xufTtcbmV4cG9ydHMuc2V0SW50ZXJ2YWwgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBUaW1lb3V0KGFwcGx5LmNhbGwoc2V0SW50ZXJ2YWwsIHdpbmRvdywgYXJndW1lbnRzKSwgY2xlYXJJbnRlcnZhbCk7XG59O1xuZXhwb3J0cy5jbGVhclRpbWVvdXQgPVxuZXhwb3J0cy5jbGVhckludGVydmFsID0gZnVuY3Rpb24odGltZW91dCkgeyB0aW1lb3V0LmNsb3NlKCk7IH07XG5cbmZ1bmN0aW9uIFRpbWVvdXQoaWQsIGNsZWFyRm4pIHtcbiAgdGhpcy5faWQgPSBpZDtcbiAgdGhpcy5fY2xlYXJGbiA9IGNsZWFyRm47XG59XG5UaW1lb3V0LnByb3RvdHlwZS51bnJlZiA9IFRpbWVvdXQucHJvdG90eXBlLnJlZiA9IGZ1bmN0aW9uKCkge307XG5UaW1lb3V0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9jbGVhckZuLmNhbGwod2luZG93LCB0aGlzLl9pZCk7XG59O1xuXG4vLyBEb2VzIG5vdCBzdGFydCB0aGUgdGltZSwganVzdCBzZXRzIHVwIHRoZSBtZW1iZXJzIG5lZWRlZC5cbmV4cG9ydHMuZW5yb2xsID0gZnVuY3Rpb24oaXRlbSwgbXNlY3MpIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuICBpdGVtLl9pZGxlVGltZW91dCA9IG1zZWNzO1xufTtcblxuZXhwb3J0cy51bmVucm9sbCA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuICBpdGVtLl9pZGxlVGltZW91dCA9IC0xO1xufTtcblxuZXhwb3J0cy5fdW5yZWZBY3RpdmUgPSBleHBvcnRzLmFjdGl2ZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuXG4gIHZhciBtc2VjcyA9IGl0ZW0uX2lkbGVUaW1lb3V0O1xuICBpZiAobXNlY3MgPj0gMCkge1xuICAgIGl0ZW0uX2lkbGVUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uIG9uVGltZW91dCgpIHtcbiAgICAgIGlmIChpdGVtLl9vblRpbWVvdXQpXG4gICAgICAgIGl0ZW0uX29uVGltZW91dCgpO1xuICAgIH0sIG1zZWNzKTtcbiAgfVxufTtcblxuLy8gVGhhdCdzIG5vdCBob3cgbm9kZS5qcyBpbXBsZW1lbnRzIGl0IGJ1dCB0aGUgZXhwb3NlZCBhcGkgaXMgdGhlIHNhbWUuXG5leHBvcnRzLnNldEltbWVkaWF0ZSA9IHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHNldEltbWVkaWF0ZSA6IGZ1bmN0aW9uKGZuKSB7XG4gIHZhciBpZCA9IG5leHRJbW1lZGlhdGVJZCsrO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cy5sZW5ndGggPCAyID8gZmFsc2UgOiBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgaW1tZWRpYXRlSWRzW2lkXSA9IHRydWU7XG5cbiAgbmV4dFRpY2soZnVuY3Rpb24gb25OZXh0VGljaygpIHtcbiAgICBpZiAoaW1tZWRpYXRlSWRzW2lkXSkge1xuICAgICAgLy8gZm4uY2FsbCgpIGlzIGZhc3RlciBzbyB3ZSBvcHRpbWl6ZSBmb3IgdGhlIGNvbW1vbiB1c2UtY2FzZVxuICAgICAgLy8gQHNlZSBodHRwOi8vanNwZXJmLmNvbS9jYWxsLWFwcGx5LXNlZ3VcbiAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm4uY2FsbChudWxsKTtcbiAgICAgIH1cbiAgICAgIC8vIFByZXZlbnQgaWRzIGZyb20gbGVha2luZ1xuICAgICAgZXhwb3J0cy5jbGVhckltbWVkaWF0ZShpZCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gaWQ7XG59O1xuXG5leHBvcnRzLmNsZWFySW1tZWRpYXRlID0gdHlwZW9mIGNsZWFySW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIgPyBjbGVhckltbWVkaWF0ZSA6IGZ1bmN0aW9uKGlkKSB7XG4gIGRlbGV0ZSBpbW1lZGlhdGVJZHNbaWRdO1xufTsiLCIvKiFcbiAqIFZ1ZS5qcyB2Mi42LjE0XG4gKiAoYykgMjAxNC0yMDIxIEV2YW4gWW91XG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKi9cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcbiAgKGdsb2JhbCA9IGdsb2JhbCB8fCBzZWxmLCBnbG9iYWwuVnVlID0gZmFjdG9yeSgpKTtcbn0odGhpcywgZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbiAgLyogICovXG5cbiAgdmFyIGVtcHR5T2JqZWN0ID0gT2JqZWN0LmZyZWV6ZSh7fSk7XG5cbiAgLy8gVGhlc2UgaGVscGVycyBwcm9kdWNlIGJldHRlciBWTSBjb2RlIGluIEpTIGVuZ2luZXMgZHVlIHRvIHRoZWlyXG4gIC8vIGV4cGxpY2l0bmVzcyBhbmQgZnVuY3Rpb24gaW5saW5pbmcuXG4gIGZ1bmN0aW9uIGlzVW5kZWYgKHYpIHtcbiAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IG51bGxcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRGVmICh2KSB7XG4gICAgcmV0dXJuIHYgIT09IHVuZGVmaW5lZCAmJiB2ICE9PSBudWxsXG4gIH1cblxuICBmdW5jdGlvbiBpc1RydWUgKHYpIHtcbiAgICByZXR1cm4gdiA9PT0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gaXNGYWxzZSAodikge1xuICAgIHJldHVybiB2ID09PSBmYWxzZVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHZhbHVlIGlzIHByaW1pdGl2ZS5cbiAgICovXG4gIGZ1bmN0aW9uIGlzUHJpbWl0aXZlICh2YWx1ZSkge1xuICAgIHJldHVybiAoXG4gICAgICB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8XG4gICAgICB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInIHx8XG4gICAgICAvLyAkZmxvdy1kaXNhYmxlLWxpbmVcbiAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ3N5bWJvbCcgfHxcbiAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nXG4gICAgKVxuICB9XG5cbiAgLyoqXG4gICAqIFF1aWNrIG9iamVjdCBjaGVjayAtIHRoaXMgaXMgcHJpbWFyaWx5IHVzZWQgdG8gdGVsbFxuICAgKiBPYmplY3RzIGZyb20gcHJpbWl0aXZlIHZhbHVlcyB3aGVuIHdlIGtub3cgdGhlIHZhbHVlXG4gICAqIGlzIGEgSlNPTi1jb21wbGlhbnQgdHlwZS5cbiAgICovXG4gIGZ1bmN0aW9uIGlzT2JqZWN0IChvYmopIHtcbiAgICByZXR1cm4gb2JqICE9PSBudWxsICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSByYXcgdHlwZSBzdHJpbmcgb2YgYSB2YWx1ZSwgZS5nLiwgW29iamVjdCBPYmplY3RdLlxuICAgKi9cbiAgdmFyIF90b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbiAgZnVuY3Rpb24gdG9SYXdUeXBlICh2YWx1ZSkge1xuICAgIHJldHVybiBfdG9TdHJpbmcuY2FsbCh2YWx1ZSkuc2xpY2UoOCwgLTEpXG4gIH1cblxuICAvKipcbiAgICogU3RyaWN0IG9iamVjdCB0eXBlIGNoZWNrLiBPbmx5IHJldHVybnMgdHJ1ZVxuICAgKiBmb3IgcGxhaW4gSmF2YVNjcmlwdCBvYmplY3RzLlxuICAgKi9cbiAgZnVuY3Rpb24gaXNQbGFpbk9iamVjdCAob2JqKSB7XG4gICAgcmV0dXJuIF90b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IE9iamVjdF0nXG4gIH1cblxuICBmdW5jdGlvbiBpc1JlZ0V4cCAodikge1xuICAgIHJldHVybiBfdG9TdHJpbmcuY2FsbCh2KSA9PT0gJ1tvYmplY3QgUmVnRXhwXSdcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB2YWwgaXMgYSB2YWxpZCBhcnJheSBpbmRleC5cbiAgICovXG4gIGZ1bmN0aW9uIGlzVmFsaWRBcnJheUluZGV4ICh2YWwpIHtcbiAgICB2YXIgbiA9IHBhcnNlRmxvYXQoU3RyaW5nKHZhbCkpO1xuICAgIHJldHVybiBuID49IDAgJiYgTWF0aC5mbG9vcihuKSA9PT0gbiAmJiBpc0Zpbml0ZSh2YWwpXG4gIH1cblxuICBmdW5jdGlvbiBpc1Byb21pc2UgKHZhbCkge1xuICAgIHJldHVybiAoXG4gICAgICBpc0RlZih2YWwpICYmXG4gICAgICB0eXBlb2YgdmFsLnRoZW4gPT09ICdmdW5jdGlvbicgJiZcbiAgICAgIHR5cGVvZiB2YWwuY2F0Y2ggPT09ICdmdW5jdGlvbidcbiAgICApXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBhIHZhbHVlIHRvIGEgc3RyaW5nIHRoYXQgaXMgYWN0dWFsbHkgcmVuZGVyZWQuXG4gICAqL1xuICBmdW5jdGlvbiB0b1N0cmluZyAodmFsKSB7XG4gICAgcmV0dXJuIHZhbCA9PSBudWxsXG4gICAgICA/ICcnXG4gICAgICA6IEFycmF5LmlzQXJyYXkodmFsKSB8fCAoaXNQbGFpbk9iamVjdCh2YWwpICYmIHZhbC50b1N0cmluZyA9PT0gX3RvU3RyaW5nKVxuICAgICAgICA/IEpTT04uc3RyaW5naWZ5KHZhbCwgbnVsbCwgMilcbiAgICAgICAgOiBTdHJpbmcodmFsKVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgYW4gaW5wdXQgdmFsdWUgdG8gYSBudW1iZXIgZm9yIHBlcnNpc3RlbmNlLlxuICAgKiBJZiB0aGUgY29udmVyc2lvbiBmYWlscywgcmV0dXJuIG9yaWdpbmFsIHN0cmluZy5cbiAgICovXG4gIGZ1bmN0aW9uIHRvTnVtYmVyICh2YWwpIHtcbiAgICB2YXIgbiA9IHBhcnNlRmxvYXQodmFsKTtcbiAgICByZXR1cm4gaXNOYU4obikgPyB2YWwgOiBuXG4gIH1cblxuICAvKipcbiAgICogTWFrZSBhIG1hcCBhbmQgcmV0dXJuIGEgZnVuY3Rpb24gZm9yIGNoZWNraW5nIGlmIGEga2V5XG4gICAqIGlzIGluIHRoYXQgbWFwLlxuICAgKi9cbiAgZnVuY3Rpb24gbWFrZU1hcCAoXG4gICAgc3RyLFxuICAgIGV4cGVjdHNMb3dlckNhc2VcbiAgKSB7XG4gICAgdmFyIG1hcCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgdmFyIGxpc3QgPSBzdHIuc3BsaXQoJywnKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIG1hcFtsaXN0W2ldXSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBleHBlY3RzTG93ZXJDYXNlXG4gICAgICA/IGZ1bmN0aW9uICh2YWwpIHsgcmV0dXJuIG1hcFt2YWwudG9Mb3dlckNhc2UoKV07IH1cbiAgICAgIDogZnVuY3Rpb24gKHZhbCkgeyByZXR1cm4gbWFwW3ZhbF07IH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBhIHRhZyBpcyBhIGJ1aWx0LWluIHRhZy5cbiAgICovXG4gIHZhciBpc0J1aWx0SW5UYWcgPSBtYWtlTWFwKCdzbG90LGNvbXBvbmVudCcsIHRydWUpO1xuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBhbiBhdHRyaWJ1dGUgaXMgYSByZXNlcnZlZCBhdHRyaWJ1dGUuXG4gICAqL1xuICB2YXIgaXNSZXNlcnZlZEF0dHJpYnV0ZSA9IG1ha2VNYXAoJ2tleSxyZWYsc2xvdCxzbG90LXNjb3BlLGlzJyk7XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbiBpdGVtIGZyb20gYW4gYXJyYXkuXG4gICAqL1xuICBmdW5jdGlvbiByZW1vdmUgKGFyciwgaXRlbSkge1xuICAgIGlmIChhcnIubGVuZ3RoKSB7XG4gICAgICB2YXIgaW5kZXggPSBhcnIuaW5kZXhPZihpdGVtKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIHJldHVybiBhcnIuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIGFuIG9iamVjdCBoYXMgdGhlIHByb3BlcnR5LlxuICAgKi9cbiAgdmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbiAgZnVuY3Rpb24gaGFzT3duIChvYmosIGtleSkge1xuICAgIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGNhY2hlZCB2ZXJzaW9uIG9mIGEgcHVyZSBmdW5jdGlvbi5cbiAgICovXG4gIGZ1bmN0aW9uIGNhY2hlZCAoZm4pIHtcbiAgICB2YXIgY2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIHJldHVybiAoZnVuY3Rpb24gY2FjaGVkRm4gKHN0cikge1xuICAgICAgdmFyIGhpdCA9IGNhY2hlW3N0cl07XG4gICAgICByZXR1cm4gaGl0IHx8IChjYWNoZVtzdHJdID0gZm4oc3RyKSlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIENhbWVsaXplIGEgaHlwaGVuLWRlbGltaXRlZCBzdHJpbmcuXG4gICAqL1xuICB2YXIgY2FtZWxpemVSRSA9IC8tKFxcdykvZztcbiAgdmFyIGNhbWVsaXplID0gY2FjaGVkKGZ1bmN0aW9uIChzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoY2FtZWxpemVSRSwgZnVuY3Rpb24gKF8sIGMpIHsgcmV0dXJuIGMgPyBjLnRvVXBwZXJDYXNlKCkgOiAnJzsgfSlcbiAgfSk7XG5cbiAgLyoqXG4gICAqIENhcGl0YWxpemUgYSBzdHJpbmcuXG4gICAqL1xuICB2YXIgY2FwaXRhbGl6ZSA9IGNhY2hlZChmdW5jdGlvbiAoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zbGljZSgxKVxuICB9KTtcblxuICAvKipcbiAgICogSHlwaGVuYXRlIGEgY2FtZWxDYXNlIHN0cmluZy5cbiAgICovXG4gIHZhciBoeXBoZW5hdGVSRSA9IC9cXEIoW0EtWl0pL2c7XG4gIHZhciBoeXBoZW5hdGUgPSBjYWNoZWQoZnVuY3Rpb24gKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZShoeXBoZW5hdGVSRSwgJy0kMScpLnRvTG93ZXJDYXNlKClcbiAgfSk7XG5cbiAgLyoqXG4gICAqIFNpbXBsZSBiaW5kIHBvbHlmaWxsIGZvciBlbnZpcm9ubWVudHMgdGhhdCBkbyBub3Qgc3VwcG9ydCBpdCxcbiAgICogZS5nLiwgUGhhbnRvbUpTIDEueC4gVGVjaG5pY2FsbHksIHdlIGRvbid0IG5lZWQgdGhpcyBhbnltb3JlXG4gICAqIHNpbmNlIG5hdGl2ZSBiaW5kIGlzIG5vdyBwZXJmb3JtYW50IGVub3VnaCBpbiBtb3N0IGJyb3dzZXJzLlxuICAgKiBCdXQgcmVtb3ZpbmcgaXQgd291bGQgbWVhbiBicmVha2luZyBjb2RlIHRoYXQgd2FzIGFibGUgdG8gcnVuIGluXG4gICAqIFBoYW50b21KUyAxLngsIHNvIHRoaXMgbXVzdCBiZSBrZXB0IGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5LlxuICAgKi9cblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBmdW5jdGlvbiBwb2x5ZmlsbEJpbmQgKGZuLCBjdHgpIHtcbiAgICBmdW5jdGlvbiBib3VuZEZuIChhKSB7XG4gICAgICB2YXIgbCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICByZXR1cm4gbFxuICAgICAgICA/IGwgPiAxXG4gICAgICAgICAgPyBmbi5hcHBseShjdHgsIGFyZ3VtZW50cylcbiAgICAgICAgICA6IGZuLmNhbGwoY3R4LCBhKVxuICAgICAgICA6IGZuLmNhbGwoY3R4KVxuICAgIH1cblxuICAgIGJvdW5kRm4uX2xlbmd0aCA9IGZuLmxlbmd0aDtcbiAgICByZXR1cm4gYm91bmRGblxuICB9XG5cbiAgZnVuY3Rpb24gbmF0aXZlQmluZCAoZm4sIGN0eCkge1xuICAgIHJldHVybiBmbi5iaW5kKGN0eClcbiAgfVxuXG4gIHZhciBiaW5kID0gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmRcbiAgICA/IG5hdGl2ZUJpbmRcbiAgICA6IHBvbHlmaWxsQmluZDtcblxuICAvKipcbiAgICogQ29udmVydCBhbiBBcnJheS1saWtlIG9iamVjdCB0byBhIHJlYWwgQXJyYXkuXG4gICAqL1xuICBmdW5jdGlvbiB0b0FycmF5IChsaXN0LCBzdGFydCkge1xuICAgIHN0YXJ0ID0gc3RhcnQgfHwgMDtcbiAgICB2YXIgaSA9IGxpc3QubGVuZ3RoIC0gc3RhcnQ7XG4gICAgdmFyIHJldCA9IG5ldyBBcnJheShpKTtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICByZXRbaV0gPSBsaXN0W2kgKyBzdGFydF07XG4gICAgfVxuICAgIHJldHVybiByZXRcbiAgfVxuXG4gIC8qKlxuICAgKiBNaXggcHJvcGVydGllcyBpbnRvIHRhcmdldCBvYmplY3QuXG4gICAqL1xuICBmdW5jdGlvbiBleHRlbmQgKHRvLCBfZnJvbSkge1xuICAgIGZvciAodmFyIGtleSBpbiBfZnJvbSkge1xuICAgICAgdG9ba2V5XSA9IF9mcm9tW2tleV07XG4gICAgfVxuICAgIHJldHVybiB0b1xuICB9XG5cbiAgLyoqXG4gICAqIE1lcmdlIGFuIEFycmF5IG9mIE9iamVjdHMgaW50byBhIHNpbmdsZSBPYmplY3QuXG4gICAqL1xuICBmdW5jdGlvbiB0b09iamVjdCAoYXJyKSB7XG4gICAgdmFyIHJlcyA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYXJyW2ldKSB7XG4gICAgICAgIGV4dGVuZChyZXMsIGFycltpXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIC8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG5cbiAgLyoqXG4gICAqIFBlcmZvcm0gbm8gb3BlcmF0aW9uLlxuICAgKiBTdHViYmluZyBhcmdzIHRvIG1ha2UgRmxvdyBoYXBweSB3aXRob3V0IGxlYXZpbmcgdXNlbGVzcyB0cmFuc3BpbGVkIGNvZGVcbiAgICogd2l0aCAuLi5yZXN0IChodHRwczovL2Zsb3cub3JnL2Jsb2cvMjAxNy8wNS8wNy9TdHJpY3QtRnVuY3Rpb24tQ2FsbC1Bcml0eS8pLlxuICAgKi9cbiAgZnVuY3Rpb24gbm9vcCAoYSwgYiwgYykge31cblxuICAvKipcbiAgICogQWx3YXlzIHJldHVybiBmYWxzZS5cbiAgICovXG4gIHZhciBubyA9IGZ1bmN0aW9uIChhLCBiLCBjKSB7IHJldHVybiBmYWxzZTsgfTtcblxuICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgc2FtZSB2YWx1ZS5cbiAgICovXG4gIHZhciBpZGVudGl0eSA9IGZ1bmN0aW9uIChfKSB7IHJldHVybiBfOyB9O1xuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIHN0cmluZyBjb250YWluaW5nIHN0YXRpYyBrZXlzIGZyb20gY29tcGlsZXIgbW9kdWxlcy5cbiAgICovXG4gIGZ1bmN0aW9uIGdlblN0YXRpY0tleXMgKG1vZHVsZXMpIHtcbiAgICByZXR1cm4gbW9kdWxlcy5yZWR1Y2UoZnVuY3Rpb24gKGtleXMsIG0pIHtcbiAgICAgIHJldHVybiBrZXlzLmNvbmNhdChtLnN0YXRpY0tleXMgfHwgW10pXG4gICAgfSwgW10pLmpvaW4oJywnKVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHR3byB2YWx1ZXMgYXJlIGxvb3NlbHkgZXF1YWwgLSB0aGF0IGlzLFxuICAgKiBpZiB0aGV5IGFyZSBwbGFpbiBvYmplY3RzLCBkbyB0aGV5IGhhdmUgdGhlIHNhbWUgc2hhcGU/XG4gICAqL1xuICBmdW5jdGlvbiBsb29zZUVxdWFsIChhLCBiKSB7XG4gICAgaWYgKGEgPT09IGIpIHsgcmV0dXJuIHRydWUgfVxuICAgIHZhciBpc09iamVjdEEgPSBpc09iamVjdChhKTtcbiAgICB2YXIgaXNPYmplY3RCID0gaXNPYmplY3QoYik7XG4gICAgaWYgKGlzT2JqZWN0QSAmJiBpc09iamVjdEIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBpc0FycmF5QSA9IEFycmF5LmlzQXJyYXkoYSk7XG4gICAgICAgIHZhciBpc0FycmF5QiA9IEFycmF5LmlzQXJyYXkoYik7XG4gICAgICAgIGlmIChpc0FycmF5QSAmJiBpc0FycmF5Qikge1xuICAgICAgICAgIHJldHVybiBhLmxlbmd0aCA9PT0gYi5sZW5ndGggJiYgYS5ldmVyeShmdW5jdGlvbiAoZSwgaSkge1xuICAgICAgICAgICAgcmV0dXJuIGxvb3NlRXF1YWwoZSwgYltpXSlcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2UgaWYgKGEgaW5zdGFuY2VvZiBEYXRlICYmIGIgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgICAgcmV0dXJuIGEuZ2V0VGltZSgpID09PSBiLmdldFRpbWUoKVxuICAgICAgICB9IGVsc2UgaWYgKCFpc0FycmF5QSAmJiAhaXNBcnJheUIpIHtcbiAgICAgICAgICB2YXIga2V5c0EgPSBPYmplY3Qua2V5cyhhKTtcbiAgICAgICAgICB2YXIga2V5c0IgPSBPYmplY3Qua2V5cyhiKTtcbiAgICAgICAgICByZXR1cm4ga2V5c0EubGVuZ3RoID09PSBrZXlzQi5sZW5ndGggJiYga2V5c0EuZXZlcnkoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIGxvb3NlRXF1YWwoYVtrZXldLCBiW2tleV0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIWlzT2JqZWN0QSAmJiAhaXNPYmplY3RCKSB7XG4gICAgICByZXR1cm4gU3RyaW5nKGEpID09PSBTdHJpbmcoYilcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgZmlyc3QgaW5kZXggYXQgd2hpY2ggYSBsb29zZWx5IGVxdWFsIHZhbHVlIGNhbiBiZVxuICAgKiBmb3VuZCBpbiB0aGUgYXJyYXkgKGlmIHZhbHVlIGlzIGEgcGxhaW4gb2JqZWN0LCB0aGUgYXJyYXkgbXVzdFxuICAgKiBjb250YWluIGFuIG9iamVjdCBvZiB0aGUgc2FtZSBzaGFwZSksIG9yIC0xIGlmIGl0IGlzIG5vdCBwcmVzZW50LlxuICAgKi9cbiAgZnVuY3Rpb24gbG9vc2VJbmRleE9mIChhcnIsIHZhbCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAobG9vc2VFcXVhbChhcnJbaV0sIHZhbCkpIHsgcmV0dXJuIGkgfVxuICAgIH1cbiAgICByZXR1cm4gLTFcbiAgfVxuXG4gIC8qKlxuICAgKiBFbnN1cmUgYSBmdW5jdGlvbiBpcyBjYWxsZWQgb25seSBvbmNlLlxuICAgKi9cbiAgZnVuY3Rpb24gb25jZSAoZm4pIHtcbiAgICB2YXIgY2FsbGVkID0gZmFsc2U7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghY2FsbGVkKSB7XG4gICAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIFNTUl9BVFRSID0gJ2RhdGEtc2VydmVyLXJlbmRlcmVkJztcblxuICB2YXIgQVNTRVRfVFlQRVMgPSBbXG4gICAgJ2NvbXBvbmVudCcsXG4gICAgJ2RpcmVjdGl2ZScsXG4gICAgJ2ZpbHRlcidcbiAgXTtcblxuICB2YXIgTElGRUNZQ0xFX0hPT0tTID0gW1xuICAgICdiZWZvcmVDcmVhdGUnLFxuICAgICdjcmVhdGVkJyxcbiAgICAnYmVmb3JlTW91bnQnLFxuICAgICdtb3VudGVkJyxcbiAgICAnYmVmb3JlVXBkYXRlJyxcbiAgICAndXBkYXRlZCcsXG4gICAgJ2JlZm9yZURlc3Ryb3knLFxuICAgICdkZXN0cm95ZWQnLFxuICAgICdhY3RpdmF0ZWQnLFxuICAgICdkZWFjdGl2YXRlZCcsXG4gICAgJ2Vycm9yQ2FwdHVyZWQnLFxuICAgICdzZXJ2ZXJQcmVmZXRjaCdcbiAgXTtcblxuICAvKiAgKi9cblxuXG5cbiAgdmFyIGNvbmZpZyA9ICh7XG4gICAgLyoqXG4gICAgICogT3B0aW9uIG1lcmdlIHN0cmF0ZWdpZXMgKHVzZWQgaW4gY29yZS91dGlsL29wdGlvbnMpXG4gICAgICovXG4gICAgLy8gJGZsb3ctZGlzYWJsZS1saW5lXG4gICAgb3B0aW9uTWVyZ2VTdHJhdGVnaWVzOiBPYmplY3QuY3JlYXRlKG51bGwpLFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0byBzdXBwcmVzcyB3YXJuaW5ncy5cbiAgICAgKi9cbiAgICBzaWxlbnQ6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBwcm9kdWN0aW9uIG1vZGUgdGlwIG1lc3NhZ2Ugb24gYm9vdD9cbiAgICAgKi9cbiAgICBwcm9kdWN0aW9uVGlwOiBcImRldmVsb3BtZW50XCIgIT09ICdwcm9kdWN0aW9uJyxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdG8gZW5hYmxlIGRldnRvb2xzXG4gICAgICovXG4gICAgZGV2dG9vbHM6IFwiZGV2ZWxvcG1lbnRcIiAhPT0gJ3Byb2R1Y3Rpb24nLFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0byByZWNvcmQgcGVyZlxuICAgICAqL1xuICAgIHBlcmZvcm1hbmNlOiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIEVycm9yIGhhbmRsZXIgZm9yIHdhdGNoZXIgZXJyb3JzXG4gICAgICovXG4gICAgZXJyb3JIYW5kbGVyOiBudWxsLFxuXG4gICAgLyoqXG4gICAgICogV2FybiBoYW5kbGVyIGZvciB3YXRjaGVyIHdhcm5zXG4gICAgICovXG4gICAgd2FybkhhbmRsZXI6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBJZ25vcmUgY2VydGFpbiBjdXN0b20gZWxlbWVudHNcbiAgICAgKi9cbiAgICBpZ25vcmVkRWxlbWVudHM6IFtdLFxuXG4gICAgLyoqXG4gICAgICogQ3VzdG9tIHVzZXIga2V5IGFsaWFzZXMgZm9yIHYtb25cbiAgICAgKi9cbiAgICAvLyAkZmxvdy1kaXNhYmxlLWxpbmVcbiAgICBrZXlDb2RlczogT2JqZWN0LmNyZWF0ZShudWxsKSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGEgdGFnIGlzIHJlc2VydmVkIHNvIHRoYXQgaXQgY2Fubm90IGJlIHJlZ2lzdGVyZWQgYXMgYVxuICAgICAqIGNvbXBvbmVudC4gVGhpcyBpcyBwbGF0Zm9ybS1kZXBlbmRlbnQgYW5kIG1heSBiZSBvdmVyd3JpdHRlbi5cbiAgICAgKi9cbiAgICBpc1Jlc2VydmVkVGFnOiBubyxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGFuIGF0dHJpYnV0ZSBpcyByZXNlcnZlZCBzbyB0aGF0IGl0IGNhbm5vdCBiZSB1c2VkIGFzIGEgY29tcG9uZW50XG4gICAgICogcHJvcC4gVGhpcyBpcyBwbGF0Zm9ybS1kZXBlbmRlbnQgYW5kIG1heSBiZSBvdmVyd3JpdHRlbi5cbiAgICAgKi9cbiAgICBpc1Jlc2VydmVkQXR0cjogbm8sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhIHRhZyBpcyBhbiB1bmtub3duIGVsZW1lbnQuXG4gICAgICogUGxhdGZvcm0tZGVwZW5kZW50LlxuICAgICAqL1xuICAgIGlzVW5rbm93bkVsZW1lbnQ6IG5vLFxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBuYW1lc3BhY2Ugb2YgYW4gZWxlbWVudFxuICAgICAqL1xuICAgIGdldFRhZ05hbWVzcGFjZTogbm9vcCxcblxuICAgIC8qKlxuICAgICAqIFBhcnNlIHRoZSByZWFsIHRhZyBuYW1lIGZvciB0aGUgc3BlY2lmaWMgcGxhdGZvcm0uXG4gICAgICovXG4gICAgcGFyc2VQbGF0Zm9ybVRhZ05hbWU6IGlkZW50aXR5LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgYW4gYXR0cmlidXRlIG11c3QgYmUgYm91bmQgdXNpbmcgcHJvcGVydHksIGUuZy4gdmFsdWVcbiAgICAgKiBQbGF0Zm9ybS1kZXBlbmRlbnQuXG4gICAgICovXG4gICAgbXVzdFVzZVByb3A6IG5vLFxuXG4gICAgLyoqXG4gICAgICogUGVyZm9ybSB1cGRhdGVzIGFzeW5jaHJvbm91c2x5LiBJbnRlbmRlZCB0byBiZSB1c2VkIGJ5IFZ1ZSBUZXN0IFV0aWxzXG4gICAgICogVGhpcyB3aWxsIHNpZ25pZmljYW50bHkgcmVkdWNlIHBlcmZvcm1hbmNlIGlmIHNldCB0byBmYWxzZS5cbiAgICAgKi9cbiAgICBhc3luYzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEV4cG9zZWQgZm9yIGxlZ2FjeSByZWFzb25zXG4gICAgICovXG4gICAgX2xpZmVjeWNsZUhvb2tzOiBMSUZFQ1lDTEVfSE9PS1NcbiAgfSk7XG5cbiAgLyogICovXG5cbiAgLyoqXG4gICAqIHVuaWNvZGUgbGV0dGVycyB1c2VkIGZvciBwYXJzaW5nIGh0bWwgdGFncywgY29tcG9uZW50IG5hbWVzIGFuZCBwcm9wZXJ0eSBwYXRocy5cbiAgICogdXNpbmcgaHR0cHM6Ly93d3cudzMub3JnL1RSL2h0bWw1My9zZW1hbnRpY3Mtc2NyaXB0aW5nLmh0bWwjcG90ZW50aWFsY3VzdG9tZWxlbWVudG5hbWVcbiAgICogc2tpcHBpbmcgXFx1MTAwMDAtXFx1RUZGRkYgZHVlIHRvIGl0IGZyZWV6aW5nIHVwIFBoYW50b21KU1xuICAgKi9cbiAgdmFyIHVuaWNvZGVSZWdFeHAgPSAvYS16QS1aXFx1MDBCN1xcdTAwQzAtXFx1MDBENlxcdTAwRDgtXFx1MDBGNlxcdTAwRjgtXFx1MDM3RFxcdTAzN0YtXFx1MUZGRlxcdTIwMEMtXFx1MjAwRFxcdTIwM0YtXFx1MjA0MFxcdTIwNzAtXFx1MjE4RlxcdTJDMDAtXFx1MkZFRlxcdTMwMDEtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZGRC87XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGEgc3RyaW5nIHN0YXJ0cyB3aXRoICQgb3IgX1xuICAgKi9cbiAgZnVuY3Rpb24gaXNSZXNlcnZlZCAoc3RyKSB7XG4gICAgdmFyIGMgPSAoc3RyICsgJycpLmNoYXJDb2RlQXQoMCk7XG4gICAgcmV0dXJuIGMgPT09IDB4MjQgfHwgYyA9PT0gMHg1RlxuICB9XG5cbiAgLyoqXG4gICAqIERlZmluZSBhIHByb3BlcnR5LlxuICAgKi9cbiAgZnVuY3Rpb24gZGVmIChvYmosIGtleSwgdmFsLCBlbnVtZXJhYmxlKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7XG4gICAgICB2YWx1ZTogdmFsLFxuICAgICAgZW51bWVyYWJsZTogISFlbnVtZXJhYmxlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBzaW1wbGUgcGF0aC5cbiAgICovXG4gIHZhciBiYWlsUkUgPSBuZXcgUmVnRXhwKChcIlteXCIgKyAodW5pY29kZVJlZ0V4cC5zb3VyY2UpICsgXCIuJF9cXFxcZF1cIikpO1xuICBmdW5jdGlvbiBwYXJzZVBhdGggKHBhdGgpIHtcbiAgICBpZiAoYmFpbFJFLnRlc3QocGF0aCkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2YXIgc2VnbWVudHMgPSBwYXRoLnNwbGl0KCcuJyk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VnbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCFvYmopIHsgcmV0dXJuIH1cbiAgICAgICAgb2JqID0gb2JqW3NlZ21lbnRzW2ldXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmpcbiAgICB9XG4gIH1cblxuICAvKiAgKi9cblxuICAvLyBjYW4gd2UgdXNlIF9fcHJvdG9fXz9cbiAgdmFyIGhhc1Byb3RvID0gJ19fcHJvdG9fXycgaW4ge307XG5cbiAgLy8gQnJvd3NlciBlbnZpcm9ubWVudCBzbmlmZmluZ1xuICB2YXIgaW5Ccm93c2VyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCc7XG4gIHZhciBpbldlZXggPSB0eXBlb2YgV1hFbnZpcm9ubWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgISFXWEVudmlyb25tZW50LnBsYXRmb3JtO1xuICB2YXIgd2VleFBsYXRmb3JtID0gaW5XZWV4ICYmIFdYRW52aXJvbm1lbnQucGxhdGZvcm0udG9Mb3dlckNhc2UoKTtcbiAgdmFyIFVBID0gaW5Ccm93c2VyICYmIHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCk7XG4gIHZhciBpc0lFID0gVUEgJiYgL21zaWV8dHJpZGVudC8udGVzdChVQSk7XG4gIHZhciBpc0lFOSA9IFVBICYmIFVBLmluZGV4T2YoJ21zaWUgOS4wJykgPiAwO1xuICB2YXIgaXNFZGdlID0gVUEgJiYgVUEuaW5kZXhPZignZWRnZS8nKSA+IDA7XG4gIHZhciBpc0FuZHJvaWQgPSAoVUEgJiYgVUEuaW5kZXhPZignYW5kcm9pZCcpID4gMCkgfHwgKHdlZXhQbGF0Zm9ybSA9PT0gJ2FuZHJvaWQnKTtcbiAgdmFyIGlzSU9TID0gKFVBICYmIC9pcGhvbmV8aXBhZHxpcG9kfGlvcy8udGVzdChVQSkpIHx8ICh3ZWV4UGxhdGZvcm0gPT09ICdpb3MnKTtcbiAgdmFyIGlzQ2hyb21lID0gVUEgJiYgL2Nocm9tZVxcL1xcZCsvLnRlc3QoVUEpICYmICFpc0VkZ2U7XG4gIHZhciBpc1BoYW50b21KUyA9IFVBICYmIC9waGFudG9tanMvLnRlc3QoVUEpO1xuICB2YXIgaXNGRiA9IFVBICYmIFVBLm1hdGNoKC9maXJlZm94XFwvKFxcZCspLyk7XG5cbiAgLy8gRmlyZWZveCBoYXMgYSBcIndhdGNoXCIgZnVuY3Rpb24gb24gT2JqZWN0LnByb3RvdHlwZS4uLlxuICB2YXIgbmF0aXZlV2F0Y2ggPSAoe30pLndhdGNoO1xuXG4gIHZhciBzdXBwb3J0c1Bhc3NpdmUgPSBmYWxzZTtcbiAgaWYgKGluQnJvd3Nlcikge1xuICAgIHRyeSB7XG4gICAgICB2YXIgb3B0cyA9IHt9O1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9wdHMsICdwYXNzaXZlJywgKHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQgKCkge1xuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgc3VwcG9ydHNQYXNzaXZlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSkpOyAvLyBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svZmxvdy9pc3N1ZXMvMjg1XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndGVzdC1wYXNzaXZlJywgbnVsbCwgb3B0cyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgfVxuXG4gIC8vIHRoaXMgbmVlZHMgdG8gYmUgbGF6eS1ldmFsZWQgYmVjYXVzZSB2dWUgbWF5IGJlIHJlcXVpcmVkIGJlZm9yZVxuICAvLyB2dWUtc2VydmVyLXJlbmRlcmVyIGNhbiBzZXQgVlVFX0VOVlxuICB2YXIgX2lzU2VydmVyO1xuICB2YXIgaXNTZXJ2ZXJSZW5kZXJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKF9pc1NlcnZlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmICghaW5Ccm93c2VyICYmICFpbldlZXggJiYgdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgLy8gZGV0ZWN0IHByZXNlbmNlIG9mIHZ1ZS1zZXJ2ZXItcmVuZGVyZXIgYW5kIGF2b2lkXG4gICAgICAgIC8vIFdlYnBhY2sgc2hpbW1pbmcgdGhlIHByb2Nlc3NcbiAgICAgICAgX2lzU2VydmVyID0gZ2xvYmFsWydwcm9jZXNzJ10gJiYgZ2xvYmFsWydwcm9jZXNzJ10uZW52LlZVRV9FTlYgPT09ICdzZXJ2ZXInO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX2lzU2VydmVyID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBfaXNTZXJ2ZXJcbiAgfTtcblxuICAvLyBkZXRlY3QgZGV2dG9vbHNcbiAgdmFyIGRldnRvb2xzID0gaW5Ccm93c2VyICYmIHdpbmRvdy5fX1ZVRV9ERVZUT09MU19HTE9CQUxfSE9PS19fO1xuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGZ1bmN0aW9uIGlzTmF0aXZlIChDdG9yKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBDdG9yID09PSAnZnVuY3Rpb24nICYmIC9uYXRpdmUgY29kZS8udGVzdChDdG9yLnRvU3RyaW5nKCkpXG4gIH1cblxuICB2YXIgaGFzU3ltYm9sID1cbiAgICB0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBpc05hdGl2ZShTeW1ib2wpICYmXG4gICAgdHlwZW9mIFJlZmxlY3QgIT09ICd1bmRlZmluZWQnICYmIGlzTmF0aXZlKFJlZmxlY3Qub3duS2V5cyk7XG5cbiAgdmFyIF9TZXQ7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqLyAvLyAkZmxvdy1kaXNhYmxlLWxpbmVcbiAgaWYgKHR5cGVvZiBTZXQgIT09ICd1bmRlZmluZWQnICYmIGlzTmF0aXZlKFNldCkpIHtcbiAgICAvLyB1c2UgbmF0aXZlIFNldCB3aGVuIGF2YWlsYWJsZS5cbiAgICBfU2V0ID0gU2V0O1xuICB9IGVsc2Uge1xuICAgIC8vIGEgbm9uLXN0YW5kYXJkIFNldCBwb2x5ZmlsbCB0aGF0IG9ubHkgd29ya3Mgd2l0aCBwcmltaXRpdmUga2V5cy5cbiAgICBfU2V0ID0gLypAX19QVVJFX18qLyhmdW5jdGlvbiAoKSB7XG4gICAgICBmdW5jdGlvbiBTZXQgKCkge1xuICAgICAgICB0aGlzLnNldCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICB9XG4gICAgICBTZXQucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uIGhhcyAoa2V5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldFtrZXldID09PSB0cnVlXG4gICAgICB9O1xuICAgICAgU2V0LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiBhZGQgKGtleSkge1xuICAgICAgICB0aGlzLnNldFtrZXldID0gdHJ1ZTtcbiAgICAgIH07XG4gICAgICBTZXQucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gY2xlYXIgKCkge1xuICAgICAgICB0aGlzLnNldCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gU2V0O1xuICAgIH0oKSk7XG4gIH1cblxuICAvKiAgKi9cblxuICB2YXIgd2FybiA9IG5vb3A7XG4gIHZhciB0aXAgPSBub29wO1xuICB2YXIgZ2VuZXJhdGVDb21wb25lbnRUcmFjZSA9IChub29wKTsgLy8gd29yayBhcm91bmQgZmxvdyBjaGVja1xuICB2YXIgZm9ybWF0Q29tcG9uZW50TmFtZSA9IChub29wKTtcblxuICB7XG4gICAgdmFyIGhhc0NvbnNvbGUgPSB0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCc7XG4gICAgdmFyIGNsYXNzaWZ5UkUgPSAvKD86XnxbLV9dKShcXHcpL2c7XG4gICAgdmFyIGNsYXNzaWZ5ID0gZnVuY3Rpb24gKHN0cikgeyByZXR1cm4gc3RyXG4gICAgICAucmVwbGFjZShjbGFzc2lmeVJFLCBmdW5jdGlvbiAoYykgeyByZXR1cm4gYy50b1VwcGVyQ2FzZSgpOyB9KVxuICAgICAgLnJlcGxhY2UoL1stX10vZywgJycpOyB9O1xuXG4gICAgd2FybiA9IGZ1bmN0aW9uIChtc2csIHZtKSB7XG4gICAgICB2YXIgdHJhY2UgPSB2bSA/IGdlbmVyYXRlQ29tcG9uZW50VHJhY2Uodm0pIDogJyc7XG5cbiAgICAgIGlmIChjb25maWcud2FybkhhbmRsZXIpIHtcbiAgICAgICAgY29uZmlnLndhcm5IYW5kbGVyLmNhbGwobnVsbCwgbXNnLCB2bSwgdHJhY2UpO1xuICAgICAgfSBlbHNlIGlmIChoYXNDb25zb2xlICYmICghY29uZmlnLnNpbGVudCkpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcigoXCJbVnVlIHdhcm5dOiBcIiArIG1zZyArIHRyYWNlKSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRpcCA9IGZ1bmN0aW9uIChtc2csIHZtKSB7XG4gICAgICBpZiAoaGFzQ29uc29sZSAmJiAoIWNvbmZpZy5zaWxlbnQpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcIltWdWUgdGlwXTogXCIgKyBtc2cgKyAoXG4gICAgICAgICAgdm0gPyBnZW5lcmF0ZUNvbXBvbmVudFRyYWNlKHZtKSA6ICcnXG4gICAgICAgICkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBmb3JtYXRDb21wb25lbnROYW1lID0gZnVuY3Rpb24gKHZtLCBpbmNsdWRlRmlsZSkge1xuICAgICAgaWYgKHZtLiRyb290ID09PSB2bSkge1xuICAgICAgICByZXR1cm4gJzxSb290PidcbiAgICAgIH1cbiAgICAgIHZhciBvcHRpb25zID0gdHlwZW9mIHZtID09PSAnZnVuY3Rpb24nICYmIHZtLmNpZCAhPSBudWxsXG4gICAgICAgID8gdm0ub3B0aW9uc1xuICAgICAgICA6IHZtLl9pc1Z1ZVxuICAgICAgICAgID8gdm0uJG9wdGlvbnMgfHwgdm0uY29uc3RydWN0b3Iub3B0aW9uc1xuICAgICAgICAgIDogdm07XG4gICAgICB2YXIgbmFtZSA9IG9wdGlvbnMubmFtZSB8fCBvcHRpb25zLl9jb21wb25lbnRUYWc7XG4gICAgICB2YXIgZmlsZSA9IG9wdGlvbnMuX19maWxlO1xuICAgICAgaWYgKCFuYW1lICYmIGZpbGUpIHtcbiAgICAgICAgdmFyIG1hdGNoID0gZmlsZS5tYXRjaCgvKFteL1xcXFxdKylcXC52dWUkLyk7XG4gICAgICAgIG5hbWUgPSBtYXRjaCAmJiBtYXRjaFsxXTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgKG5hbWUgPyAoXCI8XCIgKyAoY2xhc3NpZnkobmFtZSkpICsgXCI+XCIpIDogXCI8QW5vbnltb3VzPlwiKSArXG4gICAgICAgIChmaWxlICYmIGluY2x1ZGVGaWxlICE9PSBmYWxzZSA/IChcIiBhdCBcIiArIGZpbGUpIDogJycpXG4gICAgICApXG4gICAgfTtcblxuICAgIHZhciByZXBlYXQgPSBmdW5jdGlvbiAoc3RyLCBuKSB7XG4gICAgICB2YXIgcmVzID0gJyc7XG4gICAgICB3aGlsZSAobikge1xuICAgICAgICBpZiAobiAlIDIgPT09IDEpIHsgcmVzICs9IHN0cjsgfVxuICAgICAgICBpZiAobiA+IDEpIHsgc3RyICs9IHN0cjsgfVxuICAgICAgICBuID4+PSAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc1xuICAgIH07XG5cbiAgICBnZW5lcmF0ZUNvbXBvbmVudFRyYWNlID0gZnVuY3Rpb24gKHZtKSB7XG4gICAgICBpZiAodm0uX2lzVnVlICYmIHZtLiRwYXJlbnQpIHtcbiAgICAgICAgdmFyIHRyZWUgPSBbXTtcbiAgICAgICAgdmFyIGN1cnJlbnRSZWN1cnNpdmVTZXF1ZW5jZSA9IDA7XG4gICAgICAgIHdoaWxlICh2bSkge1xuICAgICAgICAgIGlmICh0cmVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHZhciBsYXN0ID0gdHJlZVt0cmVlLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgaWYgKGxhc3QuY29uc3RydWN0b3IgPT09IHZtLmNvbnN0cnVjdG9yKSB7XG4gICAgICAgICAgICAgIGN1cnJlbnRSZWN1cnNpdmVTZXF1ZW5jZSsrO1xuICAgICAgICAgICAgICB2bSA9IHZtLiRwYXJlbnQ7XG4gICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRSZWN1cnNpdmVTZXF1ZW5jZSA+IDApIHtcbiAgICAgICAgICAgICAgdHJlZVt0cmVlLmxlbmd0aCAtIDFdID0gW2xhc3QsIGN1cnJlbnRSZWN1cnNpdmVTZXF1ZW5jZV07XG4gICAgICAgICAgICAgIGN1cnJlbnRSZWN1cnNpdmVTZXF1ZW5jZSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHRyZWUucHVzaCh2bSk7XG4gICAgICAgICAgdm0gPSB2bS4kcGFyZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAnXFxuXFxuZm91bmQgaW5cXG5cXG4nICsgdHJlZVxuICAgICAgICAgIC5tYXAoZnVuY3Rpb24gKHZtLCBpKSB7IHJldHVybiAoXCJcIiArIChpID09PSAwID8gJy0tLT4gJyA6IHJlcGVhdCgnICcsIDUgKyBpICogMikpICsgKEFycmF5LmlzQXJyYXkodm0pXG4gICAgICAgICAgICAgID8gKChmb3JtYXRDb21wb25lbnROYW1lKHZtWzBdKSkgKyBcIi4uLiAoXCIgKyAodm1bMV0pICsgXCIgcmVjdXJzaXZlIGNhbGxzKVwiKVxuICAgICAgICAgICAgICA6IGZvcm1hdENvbXBvbmVudE5hbWUodm0pKSk7IH0pXG4gICAgICAgICAgLmpvaW4oJ1xcbicpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gKFwiXFxuXFxuKGZvdW5kIGluIFwiICsgKGZvcm1hdENvbXBvbmVudE5hbWUodm0pKSArIFwiKVwiKVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKiAgKi9cblxuICB2YXIgdWlkID0gMDtcblxuICAvKipcbiAgICogQSBkZXAgaXMgYW4gb2JzZXJ2YWJsZSB0aGF0IGNhbiBoYXZlIG11bHRpcGxlXG4gICAqIGRpcmVjdGl2ZXMgc3Vic2NyaWJpbmcgdG8gaXQuXG4gICAqL1xuICB2YXIgRGVwID0gZnVuY3Rpb24gRGVwICgpIHtcbiAgICB0aGlzLmlkID0gdWlkKys7XG4gICAgdGhpcy5zdWJzID0gW107XG4gIH07XG5cbiAgRGVwLnByb3RvdHlwZS5hZGRTdWIgPSBmdW5jdGlvbiBhZGRTdWIgKHN1Yikge1xuICAgIHRoaXMuc3Vicy5wdXNoKHN1Yik7XG4gIH07XG5cbiAgRGVwLnByb3RvdHlwZS5yZW1vdmVTdWIgPSBmdW5jdGlvbiByZW1vdmVTdWIgKHN1Yikge1xuICAgIHJlbW92ZSh0aGlzLnN1YnMsIHN1Yik7XG4gIH07XG5cbiAgRGVwLnByb3RvdHlwZS5kZXBlbmQgPSBmdW5jdGlvbiBkZXBlbmQgKCkge1xuICAgIGlmIChEZXAudGFyZ2V0KSB7XG4gICAgICBEZXAudGFyZ2V0LmFkZERlcCh0aGlzKTtcbiAgICB9XG4gIH07XG5cbiAgRGVwLnByb3RvdHlwZS5ub3RpZnkgPSBmdW5jdGlvbiBub3RpZnkgKCkge1xuICAgIC8vIHN0YWJpbGl6ZSB0aGUgc3Vic2NyaWJlciBsaXN0IGZpcnN0XG4gICAgdmFyIHN1YnMgPSB0aGlzLnN1YnMuc2xpY2UoKTtcbiAgICBpZiAoIWNvbmZpZy5hc3luYykge1xuICAgICAgLy8gc3VicyBhcmVuJ3Qgc29ydGVkIGluIHNjaGVkdWxlciBpZiBub3QgcnVubmluZyBhc3luY1xuICAgICAgLy8gd2UgbmVlZCB0byBzb3J0IHRoZW0gbm93IHRvIG1ha2Ugc3VyZSB0aGV5IGZpcmUgaW4gY29ycmVjdFxuICAgICAgLy8gb3JkZXJcbiAgICAgIHN1YnMuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYS5pZCAtIGIuaWQ7IH0pO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHN1YnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBzdWJzW2ldLnVwZGF0ZSgpO1xuICAgIH1cbiAgfTtcblxuICAvLyBUaGUgY3VycmVudCB0YXJnZXQgd2F0Y2hlciBiZWluZyBldmFsdWF0ZWQuXG4gIC8vIFRoaXMgaXMgZ2xvYmFsbHkgdW5pcXVlIGJlY2F1c2Ugb25seSBvbmUgd2F0Y2hlclxuICAvLyBjYW4gYmUgZXZhbHVhdGVkIGF0IGEgdGltZS5cbiAgRGVwLnRhcmdldCA9IG51bGw7XG4gIHZhciB0YXJnZXRTdGFjayA9IFtdO1xuXG4gIGZ1bmN0aW9uIHB1c2hUYXJnZXQgKHRhcmdldCkge1xuICAgIHRhcmdldFN0YWNrLnB1c2godGFyZ2V0KTtcbiAgICBEZXAudGFyZ2V0ID0gdGFyZ2V0O1xuICB9XG5cbiAgZnVuY3Rpb24gcG9wVGFyZ2V0ICgpIHtcbiAgICB0YXJnZXRTdGFjay5wb3AoKTtcbiAgICBEZXAudGFyZ2V0ID0gdGFyZ2V0U3RhY2tbdGFyZ2V0U3RhY2subGVuZ3RoIC0gMV07XG4gIH1cblxuICAvKiAgKi9cblxuICB2YXIgVk5vZGUgPSBmdW5jdGlvbiBWTm9kZSAoXG4gICAgdGFnLFxuICAgIGRhdGEsXG4gICAgY2hpbGRyZW4sXG4gICAgdGV4dCxcbiAgICBlbG0sXG4gICAgY29udGV4dCxcbiAgICBjb21wb25lbnRPcHRpb25zLFxuICAgIGFzeW5jRmFjdG9yeVxuICApIHtcbiAgICB0aGlzLnRhZyA9IHRhZztcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICB0aGlzLnRleHQgPSB0ZXh0O1xuICAgIHRoaXMuZWxtID0gZWxtO1xuICAgIHRoaXMubnMgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgICB0aGlzLmZuQ29udGV4dCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmZuT3B0aW9ucyA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmZuU2NvcGVJZCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmtleSA9IGRhdGEgJiYgZGF0YS5rZXk7XG4gICAgdGhpcy5jb21wb25lbnRPcHRpb25zID0gY29tcG9uZW50T3B0aW9ucztcbiAgICB0aGlzLmNvbXBvbmVudEluc3RhbmNlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMucGFyZW50ID0gdW5kZWZpbmVkO1xuICAgIHRoaXMucmF3ID0gZmFsc2U7XG4gICAgdGhpcy5pc1N0YXRpYyA9IGZhbHNlO1xuICAgIHRoaXMuaXNSb290SW5zZXJ0ID0gdHJ1ZTtcbiAgICB0aGlzLmlzQ29tbWVudCA9IGZhbHNlO1xuICAgIHRoaXMuaXNDbG9uZWQgPSBmYWxzZTtcbiAgICB0aGlzLmlzT25jZSA9IGZhbHNlO1xuICAgIHRoaXMuYXN5bmNGYWN0b3J5ID0gYXN5bmNGYWN0b3J5O1xuICAgIHRoaXMuYXN5bmNNZXRhID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuaXNBc3luY1BsYWNlaG9sZGVyID0gZmFsc2U7XG4gIH07XG5cbiAgdmFyIHByb3RvdHlwZUFjY2Vzc29ycyA9IHsgY2hpbGQ6IHsgY29uZmlndXJhYmxlOiB0cnVlIH0gfTtcblxuICAvLyBERVBSRUNBVEVEOiBhbGlhcyBmb3IgY29tcG9uZW50SW5zdGFuY2UgZm9yIGJhY2t3YXJkcyBjb21wYXQuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIHByb3RvdHlwZUFjY2Vzc29ycy5jaGlsZC5nZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tcG9uZW50SW5zdGFuY2VcbiAgfTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyggVk5vZGUucHJvdG90eXBlLCBwcm90b3R5cGVBY2Nlc3NvcnMgKTtcblxuICB2YXIgY3JlYXRlRW1wdHlWTm9kZSA9IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgaWYgKCB0ZXh0ID09PSB2b2lkIDAgKSB0ZXh0ID0gJyc7XG5cbiAgICB2YXIgbm9kZSA9IG5ldyBWTm9kZSgpO1xuICAgIG5vZGUudGV4dCA9IHRleHQ7XG4gICAgbm9kZS5pc0NvbW1lbnQgPSB0cnVlO1xuICAgIHJldHVybiBub2RlXG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlVGV4dFZOb2RlICh2YWwpIHtcbiAgICByZXR1cm4gbmV3IFZOb2RlKHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFN0cmluZyh2YWwpKVxuICB9XG5cbiAgLy8gb3B0aW1pemVkIHNoYWxsb3cgY2xvbmVcbiAgLy8gdXNlZCBmb3Igc3RhdGljIG5vZGVzIGFuZCBzbG90IG5vZGVzIGJlY2F1c2UgdGhleSBtYXkgYmUgcmV1c2VkIGFjcm9zc1xuICAvLyBtdWx0aXBsZSByZW5kZXJzLCBjbG9uaW5nIHRoZW0gYXZvaWRzIGVycm9ycyB3aGVuIERPTSBtYW5pcHVsYXRpb25zIHJlbHlcbiAgLy8gb24gdGhlaXIgZWxtIHJlZmVyZW5jZS5cbiAgZnVuY3Rpb24gY2xvbmVWTm9kZSAodm5vZGUpIHtcbiAgICB2YXIgY2xvbmVkID0gbmV3IFZOb2RlKFxuICAgICAgdm5vZGUudGFnLFxuICAgICAgdm5vZGUuZGF0YSxcbiAgICAgIC8vICM3OTc1XG4gICAgICAvLyBjbG9uZSBjaGlsZHJlbiBhcnJheSB0byBhdm9pZCBtdXRhdGluZyBvcmlnaW5hbCBpbiBjYXNlIG9mIGNsb25pbmdcbiAgICAgIC8vIGEgY2hpbGQuXG4gICAgICB2bm9kZS5jaGlsZHJlbiAmJiB2bm9kZS5jaGlsZHJlbi5zbGljZSgpLFxuICAgICAgdm5vZGUudGV4dCxcbiAgICAgIHZub2RlLmVsbSxcbiAgICAgIHZub2RlLmNvbnRleHQsXG4gICAgICB2bm9kZS5jb21wb25lbnRPcHRpb25zLFxuICAgICAgdm5vZGUuYXN5bmNGYWN0b3J5XG4gICAgKTtcbiAgICBjbG9uZWQubnMgPSB2bm9kZS5ucztcbiAgICBjbG9uZWQuaXNTdGF0aWMgPSB2bm9kZS5pc1N0YXRpYztcbiAgICBjbG9uZWQua2V5ID0gdm5vZGUua2V5O1xuICAgIGNsb25lZC5pc0NvbW1lbnQgPSB2bm9kZS5pc0NvbW1lbnQ7XG4gICAgY2xvbmVkLmZuQ29udGV4dCA9IHZub2RlLmZuQ29udGV4dDtcbiAgICBjbG9uZWQuZm5PcHRpb25zID0gdm5vZGUuZm5PcHRpb25zO1xuICAgIGNsb25lZC5mblNjb3BlSWQgPSB2bm9kZS5mblNjb3BlSWQ7XG4gICAgY2xvbmVkLmFzeW5jTWV0YSA9IHZub2RlLmFzeW5jTWV0YTtcbiAgICBjbG9uZWQuaXNDbG9uZWQgPSB0cnVlO1xuICAgIHJldHVybiBjbG9uZWRcbiAgfVxuXG4gIC8qXG4gICAqIG5vdCB0eXBlIGNoZWNraW5nIHRoaXMgZmlsZSBiZWNhdXNlIGZsb3cgZG9lc24ndCBwbGF5IHdlbGwgd2l0aFxuICAgKiBkeW5hbWljYWxseSBhY2Nlc3NpbmcgbWV0aG9kcyBvbiBBcnJheSBwcm90b3R5cGVcbiAgICovXG5cbiAgdmFyIGFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGU7XG4gIHZhciBhcnJheU1ldGhvZHMgPSBPYmplY3QuY3JlYXRlKGFycmF5UHJvdG8pO1xuXG4gIHZhciBtZXRob2RzVG9QYXRjaCA9IFtcbiAgICAncHVzaCcsXG4gICAgJ3BvcCcsXG4gICAgJ3NoaWZ0JyxcbiAgICAndW5zaGlmdCcsXG4gICAgJ3NwbGljZScsXG4gICAgJ3NvcnQnLFxuICAgICdyZXZlcnNlJ1xuICBdO1xuXG4gIC8qKlxuICAgKiBJbnRlcmNlcHQgbXV0YXRpbmcgbWV0aG9kcyBhbmQgZW1pdCBldmVudHNcbiAgICovXG4gIG1ldGhvZHNUb1BhdGNoLmZvckVhY2goZnVuY3Rpb24gKG1ldGhvZCkge1xuICAgIC8vIGNhY2hlIG9yaWdpbmFsIG1ldGhvZFxuICAgIHZhciBvcmlnaW5hbCA9IGFycmF5UHJvdG9bbWV0aG9kXTtcbiAgICBkZWYoYXJyYXlNZXRob2RzLCBtZXRob2QsIGZ1bmN0aW9uIG11dGF0b3IgKCkge1xuICAgICAgdmFyIGFyZ3MgPSBbXSwgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgIHdoaWxlICggbGVuLS0gKSBhcmdzWyBsZW4gXSA9IGFyZ3VtZW50c1sgbGVuIF07XG5cbiAgICAgIHZhciByZXN1bHQgPSBvcmlnaW5hbC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIHZhciBvYiA9IHRoaXMuX19vYl9fO1xuICAgICAgdmFyIGluc2VydGVkO1xuICAgICAgc3dpdGNoIChtZXRob2QpIHtcbiAgICAgICAgY2FzZSAncHVzaCc6XG4gICAgICAgIGNhc2UgJ3Vuc2hpZnQnOlxuICAgICAgICAgIGluc2VydGVkID0gYXJncztcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdzcGxpY2UnOlxuICAgICAgICAgIGluc2VydGVkID0gYXJncy5zbGljZSgyKTtcbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgaWYgKGluc2VydGVkKSB7IG9iLm9ic2VydmVBcnJheShpbnNlcnRlZCk7IH1cbiAgICAgIC8vIG5vdGlmeSBjaGFuZ2VcbiAgICAgIG9iLmRlcC5ub3RpZnkoKTtcbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9KTtcbiAgfSk7XG5cbiAgLyogICovXG5cbiAgdmFyIGFycmF5S2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGFycmF5TWV0aG9kcyk7XG5cbiAgLyoqXG4gICAqIEluIHNvbWUgY2FzZXMgd2UgbWF5IHdhbnQgdG8gZGlzYWJsZSBvYnNlcnZhdGlvbiBpbnNpZGUgYSBjb21wb25lbnQnc1xuICAgKiB1cGRhdGUgY29tcHV0YXRpb24uXG4gICAqL1xuICB2YXIgc2hvdWxkT2JzZXJ2ZSA9IHRydWU7XG5cbiAgZnVuY3Rpb24gdG9nZ2xlT2JzZXJ2aW5nICh2YWx1ZSkge1xuICAgIHNob3VsZE9ic2VydmUgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPYnNlcnZlciBjbGFzcyB0aGF0IGlzIGF0dGFjaGVkIHRvIGVhY2ggb2JzZXJ2ZWRcbiAgICogb2JqZWN0LiBPbmNlIGF0dGFjaGVkLCB0aGUgb2JzZXJ2ZXIgY29udmVydHMgdGhlIHRhcmdldFxuICAgKiBvYmplY3QncyBwcm9wZXJ0eSBrZXlzIGludG8gZ2V0dGVyL3NldHRlcnMgdGhhdFxuICAgKiBjb2xsZWN0IGRlcGVuZGVuY2llcyBhbmQgZGlzcGF0Y2ggdXBkYXRlcy5cbiAgICovXG4gIHZhciBPYnNlcnZlciA9IGZ1bmN0aW9uIE9ic2VydmVyICh2YWx1ZSkge1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmRlcCA9IG5ldyBEZXAoKTtcbiAgICB0aGlzLnZtQ291bnQgPSAwO1xuICAgIGRlZih2YWx1ZSwgJ19fb2JfXycsIHRoaXMpO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgaWYgKGhhc1Byb3RvKSB7XG4gICAgICAgIHByb3RvQXVnbWVudCh2YWx1ZSwgYXJyYXlNZXRob2RzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvcHlBdWdtZW50KHZhbHVlLCBhcnJheU1ldGhvZHMsIGFycmF5S2V5cyk7XG4gICAgICB9XG4gICAgICB0aGlzLm9ic2VydmVBcnJheSh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMud2Fsayh2YWx1ZSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBXYWxrIHRocm91Z2ggYWxsIHByb3BlcnRpZXMgYW5kIGNvbnZlcnQgdGhlbSBpbnRvXG4gICAqIGdldHRlci9zZXR0ZXJzLiBUaGlzIG1ldGhvZCBzaG91bGQgb25seSBiZSBjYWxsZWQgd2hlblxuICAgKiB2YWx1ZSB0eXBlIGlzIE9iamVjdC5cbiAgICovXG4gIE9ic2VydmVyLnByb3RvdHlwZS53YWxrID0gZnVuY3Rpb24gd2FsayAob2JqKSB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgZGVmaW5lUmVhY3RpdmUkJDEob2JqLCBrZXlzW2ldKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIE9ic2VydmUgYSBsaXN0IG9mIEFycmF5IGl0ZW1zLlxuICAgKi9cbiAgT2JzZXJ2ZXIucHJvdG90eXBlLm9ic2VydmVBcnJheSA9IGZ1bmN0aW9uIG9ic2VydmVBcnJheSAoaXRlbXMpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGl0ZW1zLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgb2JzZXJ2ZShpdGVtc1tpXSk7XG4gICAgfVxuICB9O1xuXG4gIC8vIGhlbHBlcnNcblxuICAvKipcbiAgICogQXVnbWVudCBhIHRhcmdldCBPYmplY3Qgb3IgQXJyYXkgYnkgaW50ZXJjZXB0aW5nXG4gICAqIHRoZSBwcm90b3R5cGUgY2hhaW4gdXNpbmcgX19wcm90b19fXG4gICAqL1xuICBmdW5jdGlvbiBwcm90b0F1Z21lbnQgKHRhcmdldCwgc3JjKSB7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cbiAgICB0YXJnZXQuX19wcm90b19fID0gc3JjO1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tcHJvdG8gKi9cbiAgfVxuXG4gIC8qKlxuICAgKiBBdWdtZW50IGEgdGFyZ2V0IE9iamVjdCBvciBBcnJheSBieSBkZWZpbmluZ1xuICAgKiBoaWRkZW4gcHJvcGVydGllcy5cbiAgICovXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGZ1bmN0aW9uIGNvcHlBdWdtZW50ICh0YXJnZXQsIHNyYywga2V5cykge1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0ga2V5cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgICAgZGVmKHRhcmdldCwga2V5LCBzcmNba2V5XSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEF0dGVtcHQgdG8gY3JlYXRlIGFuIG9ic2VydmVyIGluc3RhbmNlIGZvciBhIHZhbHVlLFxuICAgKiByZXR1cm5zIHRoZSBuZXcgb2JzZXJ2ZXIgaWYgc3VjY2Vzc2Z1bGx5IG9ic2VydmVkLFxuICAgKiBvciB0aGUgZXhpc3Rpbmcgb2JzZXJ2ZXIgaWYgdGhlIHZhbHVlIGFscmVhZHkgaGFzIG9uZS5cbiAgICovXG4gIGZ1bmN0aW9uIG9ic2VydmUgKHZhbHVlLCBhc1Jvb3REYXRhKSB7XG4gICAgaWYgKCFpc09iamVjdCh2YWx1ZSkgfHwgdmFsdWUgaW5zdGFuY2VvZiBWTm9kZSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZhciBvYjtcbiAgICBpZiAoaGFzT3duKHZhbHVlLCAnX19vYl9fJykgJiYgdmFsdWUuX19vYl9fIGluc3RhbmNlb2YgT2JzZXJ2ZXIpIHtcbiAgICAgIG9iID0gdmFsdWUuX19vYl9fO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICBzaG91bGRPYnNlcnZlICYmXG4gICAgICAhaXNTZXJ2ZXJSZW5kZXJpbmcoKSAmJlxuICAgICAgKEFycmF5LmlzQXJyYXkodmFsdWUpIHx8IGlzUGxhaW5PYmplY3QodmFsdWUpKSAmJlxuICAgICAgT2JqZWN0LmlzRXh0ZW5zaWJsZSh2YWx1ZSkgJiZcbiAgICAgICF2YWx1ZS5faXNWdWVcbiAgICApIHtcbiAgICAgIG9iID0gbmV3IE9ic2VydmVyKHZhbHVlKTtcbiAgICB9XG4gICAgaWYgKGFzUm9vdERhdGEgJiYgb2IpIHtcbiAgICAgIG9iLnZtQ291bnQrKztcbiAgICB9XG4gICAgcmV0dXJuIG9iXG4gIH1cblxuICAvKipcbiAgICogRGVmaW5lIGEgcmVhY3RpdmUgcHJvcGVydHkgb24gYW4gT2JqZWN0LlxuICAgKi9cbiAgZnVuY3Rpb24gZGVmaW5lUmVhY3RpdmUkJDEgKFxuICAgIG9iaixcbiAgICBrZXksXG4gICAgdmFsLFxuICAgIGN1c3RvbVNldHRlcixcbiAgICBzaGFsbG93XG4gICkge1xuICAgIHZhciBkZXAgPSBuZXcgRGVwKCk7XG5cbiAgICB2YXIgcHJvcGVydHkgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwga2V5KTtcbiAgICBpZiAocHJvcGVydHkgJiYgcHJvcGVydHkuY29uZmlndXJhYmxlID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gY2F0ZXIgZm9yIHByZS1kZWZpbmVkIGdldHRlci9zZXR0ZXJzXG4gICAgdmFyIGdldHRlciA9IHByb3BlcnR5ICYmIHByb3BlcnR5LmdldDtcbiAgICB2YXIgc2V0dGVyID0gcHJvcGVydHkgJiYgcHJvcGVydHkuc2V0O1xuICAgIGlmICgoIWdldHRlciB8fCBzZXR0ZXIpICYmIGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgIHZhbCA9IG9ialtrZXldO1xuICAgIH1cblxuICAgIHZhciBjaGlsZE9iID0gIXNoYWxsb3cgJiYgb2JzZXJ2ZSh2YWwpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGdldDogZnVuY3Rpb24gcmVhY3RpdmVHZXR0ZXIgKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBnZXR0ZXIgPyBnZXR0ZXIuY2FsbChvYmopIDogdmFsO1xuICAgICAgICBpZiAoRGVwLnRhcmdldCkge1xuICAgICAgICAgIGRlcC5kZXBlbmQoKTtcbiAgICAgICAgICBpZiAoY2hpbGRPYikge1xuICAgICAgICAgICAgY2hpbGRPYi5kZXAuZGVwZW5kKCk7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgZGVwZW5kQXJyYXkodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgIH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uIHJlYWN0aXZlU2V0dGVyIChuZXdWYWwpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gZ2V0dGVyID8gZ2V0dGVyLmNhbGwob2JqKSA6IHZhbDtcbiAgICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tc2VsZi1jb21wYXJlICovXG4gICAgICAgIGlmIChuZXdWYWwgPT09IHZhbHVlIHx8IChuZXdWYWwgIT09IG5ld1ZhbCAmJiB2YWx1ZSAhPT0gdmFsdWUpKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgLyogZXNsaW50LWVuYWJsZSBuby1zZWxmLWNvbXBhcmUgKi9cbiAgICAgICAgaWYgKGN1c3RvbVNldHRlcikge1xuICAgICAgICAgIGN1c3RvbVNldHRlcigpO1xuICAgICAgICB9XG4gICAgICAgIC8vICM3OTgxOiBmb3IgYWNjZXNzb3IgcHJvcGVydGllcyB3aXRob3V0IHNldHRlclxuICAgICAgICBpZiAoZ2V0dGVyICYmICFzZXR0ZXIpIHsgcmV0dXJuIH1cbiAgICAgICAgaWYgKHNldHRlcikge1xuICAgICAgICAgIHNldHRlci5jYWxsKG9iaiwgbmV3VmFsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWwgPSBuZXdWYWw7XG4gICAgICAgIH1cbiAgICAgICAgY2hpbGRPYiA9ICFzaGFsbG93ICYmIG9ic2VydmUobmV3VmFsKTtcbiAgICAgICAgZGVwLm5vdGlmeSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhIHByb3BlcnR5IG9uIGFuIG9iamVjdC4gQWRkcyB0aGUgbmV3IHByb3BlcnR5IGFuZFxuICAgKiB0cmlnZ2VycyBjaGFuZ2Ugbm90aWZpY2F0aW9uIGlmIHRoZSBwcm9wZXJ0eSBkb2Vzbid0XG4gICAqIGFscmVhZHkgZXhpc3QuXG4gICAqL1xuICBmdW5jdGlvbiBzZXQgKHRhcmdldCwga2V5LCB2YWwpIHtcbiAgICBpZiAoaXNVbmRlZih0YXJnZXQpIHx8IGlzUHJpbWl0aXZlKHRhcmdldClcbiAgICApIHtcbiAgICAgIHdhcm4oKFwiQ2Fubm90IHNldCByZWFjdGl2ZSBwcm9wZXJ0eSBvbiB1bmRlZmluZWQsIG51bGwsIG9yIHByaW1pdGl2ZSB2YWx1ZTogXCIgKyAoKHRhcmdldCkpKSk7XG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KHRhcmdldCkgJiYgaXNWYWxpZEFycmF5SW5kZXgoa2V5KSkge1xuICAgICAgdGFyZ2V0Lmxlbmd0aCA9IE1hdGgubWF4KHRhcmdldC5sZW5ndGgsIGtleSk7XG4gICAgICB0YXJnZXQuc3BsaWNlKGtleSwgMSwgdmFsKTtcbiAgICAgIHJldHVybiB2YWxcbiAgICB9XG4gICAgaWYgKGtleSBpbiB0YXJnZXQgJiYgIShrZXkgaW4gT2JqZWN0LnByb3RvdHlwZSkpIHtcbiAgICAgIHRhcmdldFtrZXldID0gdmFsO1xuICAgICAgcmV0dXJuIHZhbFxuICAgIH1cbiAgICB2YXIgb2IgPSAodGFyZ2V0KS5fX29iX187XG4gICAgaWYgKHRhcmdldC5faXNWdWUgfHwgKG9iICYmIG9iLnZtQ291bnQpKSB7XG4gICAgICB3YXJuKFxuICAgICAgICAnQXZvaWQgYWRkaW5nIHJlYWN0aXZlIHByb3BlcnRpZXMgdG8gYSBWdWUgaW5zdGFuY2Ugb3IgaXRzIHJvb3QgJGRhdGEgJyArXG4gICAgICAgICdhdCBydW50aW1lIC0gZGVjbGFyZSBpdCB1cGZyb250IGluIHRoZSBkYXRhIG9wdGlvbi4nXG4gICAgICApO1xuICAgICAgcmV0dXJuIHZhbFxuICAgIH1cbiAgICBpZiAoIW9iKSB7XG4gICAgICB0YXJnZXRba2V5XSA9IHZhbDtcbiAgICAgIHJldHVybiB2YWxcbiAgICB9XG4gICAgZGVmaW5lUmVhY3RpdmUkJDEob2IudmFsdWUsIGtleSwgdmFsKTtcbiAgICBvYi5kZXAubm90aWZ5KCk7XG4gICAgcmV0dXJuIHZhbFxuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZSBhIHByb3BlcnR5IGFuZCB0cmlnZ2VyIGNoYW5nZSBpZiBuZWNlc3NhcnkuXG4gICAqL1xuICBmdW5jdGlvbiBkZWwgKHRhcmdldCwga2V5KSB7XG4gICAgaWYgKGlzVW5kZWYodGFyZ2V0KSB8fCBpc1ByaW1pdGl2ZSh0YXJnZXQpXG4gICAgKSB7XG4gICAgICB3YXJuKChcIkNhbm5vdCBkZWxldGUgcmVhY3RpdmUgcHJvcGVydHkgb24gdW5kZWZpbmVkLCBudWxsLCBvciBwcmltaXRpdmUgdmFsdWU6IFwiICsgKCh0YXJnZXQpKSkpO1xuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0YXJnZXQpICYmIGlzVmFsaWRBcnJheUluZGV4KGtleSkpIHtcbiAgICAgIHRhcmdldC5zcGxpY2Uoa2V5LCAxKTtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2YXIgb2IgPSAodGFyZ2V0KS5fX29iX187XG4gICAgaWYgKHRhcmdldC5faXNWdWUgfHwgKG9iICYmIG9iLnZtQ291bnQpKSB7XG4gICAgICB3YXJuKFxuICAgICAgICAnQXZvaWQgZGVsZXRpbmcgcHJvcGVydGllcyBvbiBhIFZ1ZSBpbnN0YW5jZSBvciBpdHMgcm9vdCAkZGF0YSAnICtcbiAgICAgICAgJy0ganVzdCBzZXQgaXQgdG8gbnVsbC4nXG4gICAgICApO1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmICghaGFzT3duKHRhcmdldCwga2V5KSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGRlbGV0ZSB0YXJnZXRba2V5XTtcbiAgICBpZiAoIW9iKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgb2IuZGVwLm5vdGlmeSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbGxlY3QgZGVwZW5kZW5jaWVzIG9uIGFycmF5IGVsZW1lbnRzIHdoZW4gdGhlIGFycmF5IGlzIHRvdWNoZWQsIHNpbmNlXG4gICAqIHdlIGNhbm5vdCBpbnRlcmNlcHQgYXJyYXkgZWxlbWVudCBhY2Nlc3MgbGlrZSBwcm9wZXJ0eSBnZXR0ZXJzLlxuICAgKi9cbiAgZnVuY3Rpb24gZGVwZW5kQXJyYXkgKHZhbHVlKSB7XG4gICAgZm9yICh2YXIgZSA9ICh2b2lkIDApLCBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgZSA9IHZhbHVlW2ldO1xuICAgICAgZSAmJiBlLl9fb2JfXyAmJiBlLl9fb2JfXy5kZXAuZGVwZW5kKCk7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShlKSkge1xuICAgICAgICBkZXBlbmRBcnJheShlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiAgKi9cblxuICAvKipcbiAgICogT3B0aW9uIG92ZXJ3cml0aW5nIHN0cmF0ZWdpZXMgYXJlIGZ1bmN0aW9ucyB0aGF0IGhhbmRsZVxuICAgKiBob3cgdG8gbWVyZ2UgYSBwYXJlbnQgb3B0aW9uIHZhbHVlIGFuZCBhIGNoaWxkIG9wdGlvblxuICAgKiB2YWx1ZSBpbnRvIHRoZSBmaW5hbCB2YWx1ZS5cbiAgICovXG4gIHZhciBzdHJhdHMgPSBjb25maWcub3B0aW9uTWVyZ2VTdHJhdGVnaWVzO1xuXG4gIC8qKlxuICAgKiBPcHRpb25zIHdpdGggcmVzdHJpY3Rpb25zXG4gICAqL1xuICB7XG4gICAgc3RyYXRzLmVsID0gc3RyYXRzLnByb3BzRGF0YSA9IGZ1bmN0aW9uIChwYXJlbnQsIGNoaWxkLCB2bSwga2V5KSB7XG4gICAgICBpZiAoIXZtKSB7XG4gICAgICAgIHdhcm4oXG4gICAgICAgICAgXCJvcHRpb24gXFxcIlwiICsga2V5ICsgXCJcXFwiIGNhbiBvbmx5IGJlIHVzZWQgZHVyaW5nIGluc3RhbmNlIFwiICtcbiAgICAgICAgICAnY3JlYXRpb24gd2l0aCB0aGUgYG5ld2Aga2V5d29yZC4nXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZGVmYXVsdFN0cmF0KHBhcmVudCwgY2hpbGQpXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgdGhhdCByZWN1cnNpdmVseSBtZXJnZXMgdHdvIGRhdGEgb2JqZWN0cyB0b2dldGhlci5cbiAgICovXG4gIGZ1bmN0aW9uIG1lcmdlRGF0YSAodG8sIGZyb20pIHtcbiAgICBpZiAoIWZyb20pIHsgcmV0dXJuIHRvIH1cbiAgICB2YXIga2V5LCB0b1ZhbCwgZnJvbVZhbDtcblxuICAgIHZhciBrZXlzID0gaGFzU3ltYm9sXG4gICAgICA/IFJlZmxlY3Qub3duS2V5cyhmcm9tKVxuICAgICAgOiBPYmplY3Qua2V5cyhmcm9tKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgIC8vIGluIGNhc2UgdGhlIG9iamVjdCBpcyBhbHJlYWR5IG9ic2VydmVkLi4uXG4gICAgICBpZiAoa2V5ID09PSAnX19vYl9fJykgeyBjb250aW51ZSB9XG4gICAgICB0b1ZhbCA9IHRvW2tleV07XG4gICAgICBmcm9tVmFsID0gZnJvbVtrZXldO1xuICAgICAgaWYgKCFoYXNPd24odG8sIGtleSkpIHtcbiAgICAgICAgc2V0KHRvLCBrZXksIGZyb21WYWwpO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgdG9WYWwgIT09IGZyb21WYWwgJiZcbiAgICAgICAgaXNQbGFpbk9iamVjdCh0b1ZhbCkgJiZcbiAgICAgICAgaXNQbGFpbk9iamVjdChmcm9tVmFsKVxuICAgICAgKSB7XG4gICAgICAgIG1lcmdlRGF0YSh0b1ZhbCwgZnJvbVZhbCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0b1xuICB9XG5cbiAgLyoqXG4gICAqIERhdGFcbiAgICovXG4gIGZ1bmN0aW9uIG1lcmdlRGF0YU9yRm4gKFxuICAgIHBhcmVudFZhbCxcbiAgICBjaGlsZFZhbCxcbiAgICB2bVxuICApIHtcbiAgICBpZiAoIXZtKSB7XG4gICAgICAvLyBpbiBhIFZ1ZS5leHRlbmQgbWVyZ2UsIGJvdGggc2hvdWxkIGJlIGZ1bmN0aW9uc1xuICAgICAgaWYgKCFjaGlsZFZhbCkge1xuICAgICAgICByZXR1cm4gcGFyZW50VmFsXG4gICAgICB9XG4gICAgICBpZiAoIXBhcmVudFZhbCkge1xuICAgICAgICByZXR1cm4gY2hpbGRWYWxcbiAgICAgIH1cbiAgICAgIC8vIHdoZW4gcGFyZW50VmFsICYgY2hpbGRWYWwgYXJlIGJvdGggcHJlc2VudCxcbiAgICAgIC8vIHdlIG5lZWQgdG8gcmV0dXJuIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZVxuICAgICAgLy8gbWVyZ2VkIHJlc3VsdCBvZiBib3RoIGZ1bmN0aW9ucy4uLiBubyBuZWVkIHRvXG4gICAgICAvLyBjaGVjayBpZiBwYXJlbnRWYWwgaXMgYSBmdW5jdGlvbiBoZXJlIGJlY2F1c2VcbiAgICAgIC8vIGl0IGhhcyB0byBiZSBhIGZ1bmN0aW9uIHRvIHBhc3MgcHJldmlvdXMgbWVyZ2VzLlxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIG1lcmdlZERhdGFGbiAoKSB7XG4gICAgICAgIHJldHVybiBtZXJnZURhdGEoXG4gICAgICAgICAgdHlwZW9mIGNoaWxkVmFsID09PSAnZnVuY3Rpb24nID8gY2hpbGRWYWwuY2FsbCh0aGlzLCB0aGlzKSA6IGNoaWxkVmFsLFxuICAgICAgICAgIHR5cGVvZiBwYXJlbnRWYWwgPT09ICdmdW5jdGlvbicgPyBwYXJlbnRWYWwuY2FsbCh0aGlzLCB0aGlzKSA6IHBhcmVudFZhbFxuICAgICAgICApXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiBtZXJnZWRJbnN0YW5jZURhdGFGbiAoKSB7XG4gICAgICAgIC8vIGluc3RhbmNlIG1lcmdlXG4gICAgICAgIHZhciBpbnN0YW5jZURhdGEgPSB0eXBlb2YgY2hpbGRWYWwgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICA/IGNoaWxkVmFsLmNhbGwodm0sIHZtKVxuICAgICAgICAgIDogY2hpbGRWYWw7XG4gICAgICAgIHZhciBkZWZhdWx0RGF0YSA9IHR5cGVvZiBwYXJlbnRWYWwgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICA/IHBhcmVudFZhbC5jYWxsKHZtLCB2bSlcbiAgICAgICAgICA6IHBhcmVudFZhbDtcbiAgICAgICAgaWYgKGluc3RhbmNlRGF0YSkge1xuICAgICAgICAgIHJldHVybiBtZXJnZURhdGEoaW5zdGFuY2VEYXRhLCBkZWZhdWx0RGF0YSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZGVmYXVsdERhdGFcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHN0cmF0cy5kYXRhID0gZnVuY3Rpb24gKFxuICAgIHBhcmVudFZhbCxcbiAgICBjaGlsZFZhbCxcbiAgICB2bVxuICApIHtcbiAgICBpZiAoIXZtKSB7XG4gICAgICBpZiAoY2hpbGRWYWwgJiYgdHlwZW9mIGNoaWxkVmFsICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHdhcm4oXG4gICAgICAgICAgJ1RoZSBcImRhdGFcIiBvcHRpb24gc2hvdWxkIGJlIGEgZnVuY3Rpb24gJyArXG4gICAgICAgICAgJ3RoYXQgcmV0dXJucyBhIHBlci1pbnN0YW5jZSB2YWx1ZSBpbiBjb21wb25lbnQgJyArXG4gICAgICAgICAgJ2RlZmluaXRpb25zLicsXG4gICAgICAgICAgdm1cbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gcGFyZW50VmFsXG4gICAgICB9XG4gICAgICByZXR1cm4gbWVyZ2VEYXRhT3JGbihwYXJlbnRWYWwsIGNoaWxkVmFsKVxuICAgIH1cblxuICAgIHJldHVybiBtZXJnZURhdGFPckZuKHBhcmVudFZhbCwgY2hpbGRWYWwsIHZtKVxuICB9O1xuXG4gIC8qKlxuICAgKiBIb29rcyBhbmQgcHJvcHMgYXJlIG1lcmdlZCBhcyBhcnJheXMuXG4gICAqL1xuICBmdW5jdGlvbiBtZXJnZUhvb2sgKFxuICAgIHBhcmVudFZhbCxcbiAgICBjaGlsZFZhbFxuICApIHtcbiAgICB2YXIgcmVzID0gY2hpbGRWYWxcbiAgICAgID8gcGFyZW50VmFsXG4gICAgICAgID8gcGFyZW50VmFsLmNvbmNhdChjaGlsZFZhbClcbiAgICAgICAgOiBBcnJheS5pc0FycmF5KGNoaWxkVmFsKVxuICAgICAgICAgID8gY2hpbGRWYWxcbiAgICAgICAgICA6IFtjaGlsZFZhbF1cbiAgICAgIDogcGFyZW50VmFsO1xuICAgIHJldHVybiByZXNcbiAgICAgID8gZGVkdXBlSG9va3MocmVzKVxuICAgICAgOiByZXNcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlZHVwZUhvb2tzIChob29rcykge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvb2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocmVzLmluZGV4T2YoaG9va3NbaV0pID09PSAtMSkge1xuICAgICAgICByZXMucHVzaChob29rc1tpXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIExJRkVDWUNMRV9IT09LUy5mb3JFYWNoKGZ1bmN0aW9uIChob29rKSB7XG4gICAgc3RyYXRzW2hvb2tdID0gbWVyZ2VIb29rO1xuICB9KTtcblxuICAvKipcbiAgICogQXNzZXRzXG4gICAqXG4gICAqIFdoZW4gYSB2bSBpcyBwcmVzZW50IChpbnN0YW5jZSBjcmVhdGlvbiksIHdlIG5lZWQgdG8gZG9cbiAgICogYSB0aHJlZS13YXkgbWVyZ2UgYmV0d2VlbiBjb25zdHJ1Y3RvciBvcHRpb25zLCBpbnN0YW5jZVxuICAgKiBvcHRpb25zIGFuZCBwYXJlbnQgb3B0aW9ucy5cbiAgICovXG4gIGZ1bmN0aW9uIG1lcmdlQXNzZXRzIChcbiAgICBwYXJlbnRWYWwsXG4gICAgY2hpbGRWYWwsXG4gICAgdm0sXG4gICAga2V5XG4gICkge1xuICAgIHZhciByZXMgPSBPYmplY3QuY3JlYXRlKHBhcmVudFZhbCB8fCBudWxsKTtcbiAgICBpZiAoY2hpbGRWYWwpIHtcbiAgICAgIGFzc2VydE9iamVjdFR5cGUoa2V5LCBjaGlsZFZhbCwgdm0pO1xuICAgICAgcmV0dXJuIGV4dGVuZChyZXMsIGNoaWxkVmFsKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcmVzXG4gICAgfVxuICB9XG5cbiAgQVNTRVRfVFlQRVMuZm9yRWFjaChmdW5jdGlvbiAodHlwZSkge1xuICAgIHN0cmF0c1t0eXBlICsgJ3MnXSA9IG1lcmdlQXNzZXRzO1xuICB9KTtcblxuICAvKipcbiAgICogV2F0Y2hlcnMuXG4gICAqXG4gICAqIFdhdGNoZXJzIGhhc2hlcyBzaG91bGQgbm90IG92ZXJ3cml0ZSBvbmVcbiAgICogYW5vdGhlciwgc28gd2UgbWVyZ2UgdGhlbSBhcyBhcnJheXMuXG4gICAqL1xuICBzdHJhdHMud2F0Y2ggPSBmdW5jdGlvbiAoXG4gICAgcGFyZW50VmFsLFxuICAgIGNoaWxkVmFsLFxuICAgIHZtLFxuICAgIGtleVxuICApIHtcbiAgICAvLyB3b3JrIGFyb3VuZCBGaXJlZm94J3MgT2JqZWN0LnByb3RvdHlwZS53YXRjaC4uLlxuICAgIGlmIChwYXJlbnRWYWwgPT09IG5hdGl2ZVdhdGNoKSB7IHBhcmVudFZhbCA9IHVuZGVmaW5lZDsgfVxuICAgIGlmIChjaGlsZFZhbCA9PT0gbmF0aXZlV2F0Y2gpIHsgY2hpbGRWYWwgPSB1bmRlZmluZWQ7IH1cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoIWNoaWxkVmFsKSB7IHJldHVybiBPYmplY3QuY3JlYXRlKHBhcmVudFZhbCB8fCBudWxsKSB9XG4gICAge1xuICAgICAgYXNzZXJ0T2JqZWN0VHlwZShrZXksIGNoaWxkVmFsLCB2bSk7XG4gICAgfVxuICAgIGlmICghcGFyZW50VmFsKSB7IHJldHVybiBjaGlsZFZhbCB9XG4gICAgdmFyIHJldCA9IHt9O1xuICAgIGV4dGVuZChyZXQsIHBhcmVudFZhbCk7XG4gICAgZm9yICh2YXIga2V5JDEgaW4gY2hpbGRWYWwpIHtcbiAgICAgIHZhciBwYXJlbnQgPSByZXRba2V5JDFdO1xuICAgICAgdmFyIGNoaWxkID0gY2hpbGRWYWxba2V5JDFdO1xuICAgICAgaWYgKHBhcmVudCAmJiAhQXJyYXkuaXNBcnJheShwYXJlbnQpKSB7XG4gICAgICAgIHBhcmVudCA9IFtwYXJlbnRdO1xuICAgICAgfVxuICAgICAgcmV0W2tleSQxXSA9IHBhcmVudFxuICAgICAgICA/IHBhcmVudC5jb25jYXQoY2hpbGQpXG4gICAgICAgIDogQXJyYXkuaXNBcnJheShjaGlsZCkgPyBjaGlsZCA6IFtjaGlsZF07XG4gICAgfVxuICAgIHJldHVybiByZXRcbiAgfTtcblxuICAvKipcbiAgICogT3RoZXIgb2JqZWN0IGhhc2hlcy5cbiAgICovXG4gIHN0cmF0cy5wcm9wcyA9XG4gIHN0cmF0cy5tZXRob2RzID1cbiAgc3RyYXRzLmluamVjdCA9XG4gIHN0cmF0cy5jb21wdXRlZCA9IGZ1bmN0aW9uIChcbiAgICBwYXJlbnRWYWwsXG4gICAgY2hpbGRWYWwsXG4gICAgdm0sXG4gICAga2V5XG4gICkge1xuICAgIGlmIChjaGlsZFZhbCAmJiBcImRldmVsb3BtZW50XCIgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgYXNzZXJ0T2JqZWN0VHlwZShrZXksIGNoaWxkVmFsLCB2bSk7XG4gICAgfVxuICAgIGlmICghcGFyZW50VmFsKSB7IHJldHVybiBjaGlsZFZhbCB9XG4gICAgdmFyIHJldCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgZXh0ZW5kKHJldCwgcGFyZW50VmFsKTtcbiAgICBpZiAoY2hpbGRWYWwpIHsgZXh0ZW5kKHJldCwgY2hpbGRWYWwpOyB9XG4gICAgcmV0dXJuIHJldFxuICB9O1xuICBzdHJhdHMucHJvdmlkZSA9IG1lcmdlRGF0YU9yRm47XG5cbiAgLyoqXG4gICAqIERlZmF1bHQgc3RyYXRlZ3kuXG4gICAqL1xuICB2YXIgZGVmYXVsdFN0cmF0ID0gZnVuY3Rpb24gKHBhcmVudFZhbCwgY2hpbGRWYWwpIHtcbiAgICByZXR1cm4gY2hpbGRWYWwgPT09IHVuZGVmaW5lZFxuICAgICAgPyBwYXJlbnRWYWxcbiAgICAgIDogY2hpbGRWYWxcbiAgfTtcblxuICAvKipcbiAgICogVmFsaWRhdGUgY29tcG9uZW50IG5hbWVzXG4gICAqL1xuICBmdW5jdGlvbiBjaGVja0NvbXBvbmVudHMgKG9wdGlvbnMpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gb3B0aW9ucy5jb21wb25lbnRzKSB7XG4gICAgICB2YWxpZGF0ZUNvbXBvbmVudE5hbWUoa2V5KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB2YWxpZGF0ZUNvbXBvbmVudE5hbWUgKG5hbWUpIHtcbiAgICBpZiAoIW5ldyBSZWdFeHAoKFwiXlthLXpBLVpdW1xcXFwtXFxcXC4wLTlfXCIgKyAodW5pY29kZVJlZ0V4cC5zb3VyY2UpICsgXCJdKiRcIikpLnRlc3QobmFtZSkpIHtcbiAgICAgIHdhcm4oXG4gICAgICAgICdJbnZhbGlkIGNvbXBvbmVudCBuYW1lOiBcIicgKyBuYW1lICsgJ1wiLiBDb21wb25lbnQgbmFtZXMgJyArXG4gICAgICAgICdzaG91bGQgY29uZm9ybSB0byB2YWxpZCBjdXN0b20gZWxlbWVudCBuYW1lIGluIGh0bWw1IHNwZWNpZmljYXRpb24uJ1xuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGlzQnVpbHRJblRhZyhuYW1lKSB8fCBjb25maWcuaXNSZXNlcnZlZFRhZyhuYW1lKSkge1xuICAgICAgd2FybihcbiAgICAgICAgJ0RvIG5vdCB1c2UgYnVpbHQtaW4gb3IgcmVzZXJ2ZWQgSFRNTCBlbGVtZW50cyBhcyBjb21wb25lbnQgJyArXG4gICAgICAgICdpZDogJyArIG5hbWVcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEVuc3VyZSBhbGwgcHJvcHMgb3B0aW9uIHN5bnRheCBhcmUgbm9ybWFsaXplZCBpbnRvIHRoZVxuICAgKiBPYmplY3QtYmFzZWQgZm9ybWF0LlxuICAgKi9cbiAgZnVuY3Rpb24gbm9ybWFsaXplUHJvcHMgKG9wdGlvbnMsIHZtKSB7XG4gICAgdmFyIHByb3BzID0gb3B0aW9ucy5wcm9wcztcbiAgICBpZiAoIXByb3BzKSB7IHJldHVybiB9XG4gICAgdmFyIHJlcyA9IHt9O1xuICAgIHZhciBpLCB2YWwsIG5hbWU7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocHJvcHMpKSB7XG4gICAgICBpID0gcHJvcHMubGVuZ3RoO1xuICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICB2YWwgPSBwcm9wc1tpXTtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgbmFtZSA9IGNhbWVsaXplKHZhbCk7XG4gICAgICAgICAgcmVzW25hbWVdID0geyB0eXBlOiBudWxsIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd2FybigncHJvcHMgbXVzdCBiZSBzdHJpbmdzIHdoZW4gdXNpbmcgYXJyYXkgc3ludGF4LicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHByb3BzKSkge1xuICAgICAgZm9yICh2YXIga2V5IGluIHByb3BzKSB7XG4gICAgICAgIHZhbCA9IHByb3BzW2tleV07XG4gICAgICAgIG5hbWUgPSBjYW1lbGl6ZShrZXkpO1xuICAgICAgICByZXNbbmFtZV0gPSBpc1BsYWluT2JqZWN0KHZhbClcbiAgICAgICAgICA/IHZhbFxuICAgICAgICAgIDogeyB0eXBlOiB2YWwgfTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgd2FybihcbiAgICAgICAgXCJJbnZhbGlkIHZhbHVlIGZvciBvcHRpb24gXFxcInByb3BzXFxcIjogZXhwZWN0ZWQgYW4gQXJyYXkgb3IgYW4gT2JqZWN0LCBcIiArXG4gICAgICAgIFwiYnV0IGdvdCBcIiArICh0b1Jhd1R5cGUocHJvcHMpKSArIFwiLlwiLFxuICAgICAgICB2bVxuICAgICAgKTtcbiAgICB9XG4gICAgb3B0aW9ucy5wcm9wcyA9IHJlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemUgYWxsIGluamVjdGlvbnMgaW50byBPYmplY3QtYmFzZWQgZm9ybWF0XG4gICAqL1xuICBmdW5jdGlvbiBub3JtYWxpemVJbmplY3QgKG9wdGlvbnMsIHZtKSB7XG4gICAgdmFyIGluamVjdCA9IG9wdGlvbnMuaW5qZWN0O1xuICAgIGlmICghaW5qZWN0KSB7IHJldHVybiB9XG4gICAgdmFyIG5vcm1hbGl6ZWQgPSBvcHRpb25zLmluamVjdCA9IHt9O1xuICAgIGlmIChBcnJheS5pc0FycmF5KGluamVjdCkpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5qZWN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG5vcm1hbGl6ZWRbaW5qZWN0W2ldXSA9IHsgZnJvbTogaW5qZWN0W2ldIH07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KGluamVjdCkpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBpbmplY3QpIHtcbiAgICAgICAgdmFyIHZhbCA9IGluamVjdFtrZXldO1xuICAgICAgICBub3JtYWxpemVkW2tleV0gPSBpc1BsYWluT2JqZWN0KHZhbClcbiAgICAgICAgICA/IGV4dGVuZCh7IGZyb206IGtleSB9LCB2YWwpXG4gICAgICAgICAgOiB7IGZyb206IHZhbCB9O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB3YXJuKFxuICAgICAgICBcIkludmFsaWQgdmFsdWUgZm9yIG9wdGlvbiBcXFwiaW5qZWN0XFxcIjogZXhwZWN0ZWQgYW4gQXJyYXkgb3IgYW4gT2JqZWN0LCBcIiArXG4gICAgICAgIFwiYnV0IGdvdCBcIiArICh0b1Jhd1R5cGUoaW5qZWN0KSkgKyBcIi5cIixcbiAgICAgICAgdm1cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZSByYXcgZnVuY3Rpb24gZGlyZWN0aXZlcyBpbnRvIG9iamVjdCBmb3JtYXQuXG4gICAqL1xuICBmdW5jdGlvbiBub3JtYWxpemVEaXJlY3RpdmVzIChvcHRpb25zKSB7XG4gICAgdmFyIGRpcnMgPSBvcHRpb25zLmRpcmVjdGl2ZXM7XG4gICAgaWYgKGRpcnMpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBkaXJzKSB7XG4gICAgICAgIHZhciBkZWYkJDEgPSBkaXJzW2tleV07XG4gICAgICAgIGlmICh0eXBlb2YgZGVmJCQxID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgZGlyc1trZXldID0geyBiaW5kOiBkZWYkJDEsIHVwZGF0ZTogZGVmJCQxIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBhc3NlcnRPYmplY3RUeXBlIChuYW1lLCB2YWx1ZSwgdm0pIHtcbiAgICBpZiAoIWlzUGxhaW5PYmplY3QodmFsdWUpKSB7XG4gICAgICB3YXJuKFxuICAgICAgICBcIkludmFsaWQgdmFsdWUgZm9yIG9wdGlvbiBcXFwiXCIgKyBuYW1lICsgXCJcXFwiOiBleHBlY3RlZCBhbiBPYmplY3QsIFwiICtcbiAgICAgICAgXCJidXQgZ290IFwiICsgKHRvUmF3VHlwZSh2YWx1ZSkpICsgXCIuXCIsXG4gICAgICAgIHZtXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNZXJnZSB0d28gb3B0aW9uIG9iamVjdHMgaW50byBhIG5ldyBvbmUuXG4gICAqIENvcmUgdXRpbGl0eSB1c2VkIGluIGJvdGggaW5zdGFudGlhdGlvbiBhbmQgaW5oZXJpdGFuY2UuXG4gICAqL1xuICBmdW5jdGlvbiBtZXJnZU9wdGlvbnMgKFxuICAgIHBhcmVudCxcbiAgICBjaGlsZCxcbiAgICB2bVxuICApIHtcbiAgICB7XG4gICAgICBjaGVja0NvbXBvbmVudHMoY2hpbGQpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgY2hpbGQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNoaWxkID0gY2hpbGQub3B0aW9ucztcbiAgICB9XG5cbiAgICBub3JtYWxpemVQcm9wcyhjaGlsZCwgdm0pO1xuICAgIG5vcm1hbGl6ZUluamVjdChjaGlsZCwgdm0pO1xuICAgIG5vcm1hbGl6ZURpcmVjdGl2ZXMoY2hpbGQpO1xuXG4gICAgLy8gQXBwbHkgZXh0ZW5kcyBhbmQgbWl4aW5zIG9uIHRoZSBjaGlsZCBvcHRpb25zLFxuICAgIC8vIGJ1dCBvbmx5IGlmIGl0IGlzIGEgcmF3IG9wdGlvbnMgb2JqZWN0IHRoYXQgaXNuJ3RcbiAgICAvLyB0aGUgcmVzdWx0IG9mIGFub3RoZXIgbWVyZ2VPcHRpb25zIGNhbGwuXG4gICAgLy8gT25seSBtZXJnZWQgb3B0aW9ucyBoYXMgdGhlIF9iYXNlIHByb3BlcnR5LlxuICAgIGlmICghY2hpbGQuX2Jhc2UpIHtcbiAgICAgIGlmIChjaGlsZC5leHRlbmRzKSB7XG4gICAgICAgIHBhcmVudCA9IG1lcmdlT3B0aW9ucyhwYXJlbnQsIGNoaWxkLmV4dGVuZHMsIHZtKTtcbiAgICAgIH1cbiAgICAgIGlmIChjaGlsZC5taXhpbnMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjaGlsZC5taXhpbnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgcGFyZW50ID0gbWVyZ2VPcHRpb25zKHBhcmVudCwgY2hpbGQubWl4aW5zW2ldLCB2bSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgb3B0aW9ucyA9IHt9O1xuICAgIHZhciBrZXk7XG4gICAgZm9yIChrZXkgaW4gcGFyZW50KSB7XG4gICAgICBtZXJnZUZpZWxkKGtleSk7XG4gICAgfVxuICAgIGZvciAoa2V5IGluIGNoaWxkKSB7XG4gICAgICBpZiAoIWhhc093bihwYXJlbnQsIGtleSkpIHtcbiAgICAgICAgbWVyZ2VGaWVsZChrZXkpO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBtZXJnZUZpZWxkIChrZXkpIHtcbiAgICAgIHZhciBzdHJhdCA9IHN0cmF0c1trZXldIHx8IGRlZmF1bHRTdHJhdDtcbiAgICAgIG9wdGlvbnNba2V5XSA9IHN0cmF0KHBhcmVudFtrZXldLCBjaGlsZFtrZXldLCB2bSwga2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlIGFuIGFzc2V0LlxuICAgKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgYmVjYXVzZSBjaGlsZCBpbnN0YW5jZXMgbmVlZCBhY2Nlc3NcbiAgICogdG8gYXNzZXRzIGRlZmluZWQgaW4gaXRzIGFuY2VzdG9yIGNoYWluLlxuICAgKi9cbiAgZnVuY3Rpb24gcmVzb2x2ZUFzc2V0IChcbiAgICBvcHRpb25zLFxuICAgIHR5cGUsXG4gICAgaWQsXG4gICAgd2Fybk1pc3NpbmdcbiAgKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKHR5cGVvZiBpZCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2YXIgYXNzZXRzID0gb3B0aW9uc1t0eXBlXTtcbiAgICAvLyBjaGVjayBsb2NhbCByZWdpc3RyYXRpb24gdmFyaWF0aW9ucyBmaXJzdFxuICAgIGlmIChoYXNPd24oYXNzZXRzLCBpZCkpIHsgcmV0dXJuIGFzc2V0c1tpZF0gfVxuICAgIHZhciBjYW1lbGl6ZWRJZCA9IGNhbWVsaXplKGlkKTtcbiAgICBpZiAoaGFzT3duKGFzc2V0cywgY2FtZWxpemVkSWQpKSB7IHJldHVybiBhc3NldHNbY2FtZWxpemVkSWRdIH1cbiAgICB2YXIgUGFzY2FsQ2FzZUlkID0gY2FwaXRhbGl6ZShjYW1lbGl6ZWRJZCk7XG4gICAgaWYgKGhhc093bihhc3NldHMsIFBhc2NhbENhc2VJZCkpIHsgcmV0dXJuIGFzc2V0c1tQYXNjYWxDYXNlSWRdIH1cbiAgICAvLyBmYWxsYmFjayB0byBwcm90b3R5cGUgY2hhaW5cbiAgICB2YXIgcmVzID0gYXNzZXRzW2lkXSB8fCBhc3NldHNbY2FtZWxpemVkSWRdIHx8IGFzc2V0c1tQYXNjYWxDYXNlSWRdO1xuICAgIGlmICh3YXJuTWlzc2luZyAmJiAhcmVzKSB7XG4gICAgICB3YXJuKFxuICAgICAgICAnRmFpbGVkIHRvIHJlc29sdmUgJyArIHR5cGUuc2xpY2UoMCwgLTEpICsgJzogJyArIGlkLFxuICAgICAgICBvcHRpb25zXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvKiAgKi9cblxuXG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVQcm9wIChcbiAgICBrZXksXG4gICAgcHJvcE9wdGlvbnMsXG4gICAgcHJvcHNEYXRhLFxuICAgIHZtXG4gICkge1xuICAgIHZhciBwcm9wID0gcHJvcE9wdGlvbnNba2V5XTtcbiAgICB2YXIgYWJzZW50ID0gIWhhc093bihwcm9wc0RhdGEsIGtleSk7XG4gICAgdmFyIHZhbHVlID0gcHJvcHNEYXRhW2tleV07XG4gICAgLy8gYm9vbGVhbiBjYXN0aW5nXG4gICAgdmFyIGJvb2xlYW5JbmRleCA9IGdldFR5cGVJbmRleChCb29sZWFuLCBwcm9wLnR5cGUpO1xuICAgIGlmIChib29sZWFuSW5kZXggPiAtMSkge1xuICAgICAgaWYgKGFic2VudCAmJiAhaGFzT3duKHByb3AsICdkZWZhdWx0JykpIHtcbiAgICAgICAgdmFsdWUgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT09ICcnIHx8IHZhbHVlID09PSBoeXBoZW5hdGUoa2V5KSkge1xuICAgICAgICAvLyBvbmx5IGNhc3QgZW1wdHkgc3RyaW5nIC8gc2FtZSBuYW1lIHRvIGJvb2xlYW4gaWZcbiAgICAgICAgLy8gYm9vbGVhbiBoYXMgaGlnaGVyIHByaW9yaXR5XG4gICAgICAgIHZhciBzdHJpbmdJbmRleCA9IGdldFR5cGVJbmRleChTdHJpbmcsIHByb3AudHlwZSk7XG4gICAgICAgIGlmIChzdHJpbmdJbmRleCA8IDAgfHwgYm9vbGVhbkluZGV4IDwgc3RyaW5nSW5kZXgpIHtcbiAgICAgICAgICB2YWx1ZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gY2hlY2sgZGVmYXVsdCB2YWx1ZVxuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YWx1ZSA9IGdldFByb3BEZWZhdWx0VmFsdWUodm0sIHByb3AsIGtleSk7XG4gICAgICAvLyBzaW5jZSB0aGUgZGVmYXVsdCB2YWx1ZSBpcyBhIGZyZXNoIGNvcHksXG4gICAgICAvLyBtYWtlIHN1cmUgdG8gb2JzZXJ2ZSBpdC5cbiAgICAgIHZhciBwcmV2U2hvdWxkT2JzZXJ2ZSA9IHNob3VsZE9ic2VydmU7XG4gICAgICB0b2dnbGVPYnNlcnZpbmcodHJ1ZSk7XG4gICAgICBvYnNlcnZlKHZhbHVlKTtcbiAgICAgIHRvZ2dsZU9ic2VydmluZyhwcmV2U2hvdWxkT2JzZXJ2ZSk7XG4gICAgfVxuICAgIHtcbiAgICAgIGFzc2VydFByb3AocHJvcCwga2V5LCB2YWx1ZSwgdm0sIGFic2VudCk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgZGVmYXVsdCB2YWx1ZSBvZiBhIHByb3AuXG4gICAqL1xuICBmdW5jdGlvbiBnZXRQcm9wRGVmYXVsdFZhbHVlICh2bSwgcHJvcCwga2V5KSB7XG4gICAgLy8gbm8gZGVmYXVsdCwgcmV0dXJuIHVuZGVmaW5lZFxuICAgIGlmICghaGFzT3duKHByb3AsICdkZWZhdWx0JykpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG4gICAgdmFyIGRlZiA9IHByb3AuZGVmYXVsdDtcbiAgICAvLyB3YXJuIGFnYWluc3Qgbm9uLWZhY3RvcnkgZGVmYXVsdHMgZm9yIE9iamVjdCAmIEFycmF5XG4gICAgaWYgKGlzT2JqZWN0KGRlZikpIHtcbiAgICAgIHdhcm4oXG4gICAgICAgICdJbnZhbGlkIGRlZmF1bHQgdmFsdWUgZm9yIHByb3AgXCInICsga2V5ICsgJ1wiOiAnICtcbiAgICAgICAgJ1Byb3BzIHdpdGggdHlwZSBPYmplY3QvQXJyYXkgbXVzdCB1c2UgYSBmYWN0b3J5IGZ1bmN0aW9uICcgK1xuICAgICAgICAndG8gcmV0dXJuIHRoZSBkZWZhdWx0IHZhbHVlLicsXG4gICAgICAgIHZtXG4gICAgICApO1xuICAgIH1cbiAgICAvLyB0aGUgcmF3IHByb3AgdmFsdWUgd2FzIGFsc28gdW5kZWZpbmVkIGZyb20gcHJldmlvdXMgcmVuZGVyLFxuICAgIC8vIHJldHVybiBwcmV2aW91cyBkZWZhdWx0IHZhbHVlIHRvIGF2b2lkIHVubmVjZXNzYXJ5IHdhdGNoZXIgdHJpZ2dlclxuICAgIGlmICh2bSAmJiB2bS4kb3B0aW9ucy5wcm9wc0RhdGEgJiZcbiAgICAgIHZtLiRvcHRpb25zLnByb3BzRGF0YVtrZXldID09PSB1bmRlZmluZWQgJiZcbiAgICAgIHZtLl9wcm9wc1trZXldICE9PSB1bmRlZmluZWRcbiAgICApIHtcbiAgICAgIHJldHVybiB2bS5fcHJvcHNba2V5XVxuICAgIH1cbiAgICAvLyBjYWxsIGZhY3RvcnkgZnVuY3Rpb24gZm9yIG5vbi1GdW5jdGlvbiB0eXBlc1xuICAgIC8vIGEgdmFsdWUgaXMgRnVuY3Rpb24gaWYgaXRzIHByb3RvdHlwZSBpcyBmdW5jdGlvbiBldmVuIGFjcm9zcyBkaWZmZXJlbnQgZXhlY3V0aW9uIGNvbnRleHRcbiAgICByZXR1cm4gdHlwZW9mIGRlZiA9PT0gJ2Z1bmN0aW9uJyAmJiBnZXRUeXBlKHByb3AudHlwZSkgIT09ICdGdW5jdGlvbidcbiAgICAgID8gZGVmLmNhbGwodm0pXG4gICAgICA6IGRlZlxuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydCB3aGV0aGVyIGEgcHJvcCBpcyB2YWxpZC5cbiAgICovXG4gIGZ1bmN0aW9uIGFzc2VydFByb3AgKFxuICAgIHByb3AsXG4gICAgbmFtZSxcbiAgICB2YWx1ZSxcbiAgICB2bSxcbiAgICBhYnNlbnRcbiAgKSB7XG4gICAgaWYgKHByb3AucmVxdWlyZWQgJiYgYWJzZW50KSB7XG4gICAgICB3YXJuKFxuICAgICAgICAnTWlzc2luZyByZXF1aXJlZCBwcm9wOiBcIicgKyBuYW1lICsgJ1wiJyxcbiAgICAgICAgdm1cbiAgICAgICk7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKHZhbHVlID09IG51bGwgJiYgIXByb3AucmVxdWlyZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2YXIgdHlwZSA9IHByb3AudHlwZTtcbiAgICB2YXIgdmFsaWQgPSAhdHlwZSB8fCB0eXBlID09PSB0cnVlO1xuICAgIHZhciBleHBlY3RlZFR5cGVzID0gW107XG4gICAgaWYgKHR5cGUpIHtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheSh0eXBlKSkge1xuICAgICAgICB0eXBlID0gW3R5cGVdO1xuICAgICAgfVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0eXBlLmxlbmd0aCAmJiAhdmFsaWQ7IGkrKykge1xuICAgICAgICB2YXIgYXNzZXJ0ZWRUeXBlID0gYXNzZXJ0VHlwZSh2YWx1ZSwgdHlwZVtpXSwgdm0pO1xuICAgICAgICBleHBlY3RlZFR5cGVzLnB1c2goYXNzZXJ0ZWRUeXBlLmV4cGVjdGVkVHlwZSB8fCAnJyk7XG4gICAgICAgIHZhbGlkID0gYXNzZXJ0ZWRUeXBlLnZhbGlkO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBoYXZlRXhwZWN0ZWRUeXBlcyA9IGV4cGVjdGVkVHlwZXMuc29tZShmdW5jdGlvbiAodCkgeyByZXR1cm4gdDsgfSk7XG4gICAgaWYgKCF2YWxpZCAmJiBoYXZlRXhwZWN0ZWRUeXBlcykge1xuICAgICAgd2FybihcbiAgICAgICAgZ2V0SW52YWxpZFR5cGVNZXNzYWdlKG5hbWUsIHZhbHVlLCBleHBlY3RlZFR5cGVzKSxcbiAgICAgICAgdm1cbiAgICAgICk7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdmFyIHZhbGlkYXRvciA9IHByb3AudmFsaWRhdG9yO1xuICAgIGlmICh2YWxpZGF0b3IpIHtcbiAgICAgIGlmICghdmFsaWRhdG9yKHZhbHVlKSkge1xuICAgICAgICB3YXJuKFxuICAgICAgICAgICdJbnZhbGlkIHByb3A6IGN1c3RvbSB2YWxpZGF0b3IgY2hlY2sgZmFpbGVkIGZvciBwcm9wIFwiJyArIG5hbWUgKyAnXCIuJyxcbiAgICAgICAgICB2bVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZhciBzaW1wbGVDaGVja1JFID0gL14oU3RyaW5nfE51bWJlcnxCb29sZWFufEZ1bmN0aW9ufFN5bWJvbHxCaWdJbnQpJC87XG5cbiAgZnVuY3Rpb24gYXNzZXJ0VHlwZSAodmFsdWUsIHR5cGUsIHZtKSB7XG4gICAgdmFyIHZhbGlkO1xuICAgIHZhciBleHBlY3RlZFR5cGUgPSBnZXRUeXBlKHR5cGUpO1xuICAgIGlmIChzaW1wbGVDaGVja1JFLnRlc3QoZXhwZWN0ZWRUeXBlKSkge1xuICAgICAgdmFyIHQgPSB0eXBlb2YgdmFsdWU7XG4gICAgICB2YWxpZCA9IHQgPT09IGV4cGVjdGVkVHlwZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgLy8gZm9yIHByaW1pdGl2ZSB3cmFwcGVyIG9iamVjdHNcbiAgICAgIGlmICghdmFsaWQgJiYgdCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgdmFsaWQgPSB2YWx1ZSBpbnN0YW5jZW9mIHR5cGU7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChleHBlY3RlZFR5cGUgPT09ICdPYmplY3QnKSB7XG4gICAgICB2YWxpZCA9IGlzUGxhaW5PYmplY3QodmFsdWUpO1xuICAgIH0gZWxzZSBpZiAoZXhwZWN0ZWRUeXBlID09PSAnQXJyYXknKSB7XG4gICAgICB2YWxpZCA9IEFycmF5LmlzQXJyYXkodmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0cnkge1xuICAgICAgICB2YWxpZCA9IHZhbHVlIGluc3RhbmNlb2YgdHlwZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgd2FybignSW52YWxpZCBwcm9wIHR5cGU6IFwiJyArIFN0cmluZyh0eXBlKSArICdcIiBpcyBub3QgYSBjb25zdHJ1Y3RvcicsIHZtKTtcbiAgICAgICAgdmFsaWQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbGlkOiB2YWxpZCxcbiAgICAgIGV4cGVjdGVkVHlwZTogZXhwZWN0ZWRUeXBlXG4gICAgfVxuICB9XG5cbiAgdmFyIGZ1bmN0aW9uVHlwZUNoZWNrUkUgPSAvXlxccypmdW5jdGlvbiAoXFx3KykvO1xuXG4gIC8qKlxuICAgKiBVc2UgZnVuY3Rpb24gc3RyaW5nIG5hbWUgdG8gY2hlY2sgYnVpbHQtaW4gdHlwZXMsXG4gICAqIGJlY2F1c2UgYSBzaW1wbGUgZXF1YWxpdHkgY2hlY2sgd2lsbCBmYWlsIHdoZW4gcnVubmluZ1xuICAgKiBhY3Jvc3MgZGlmZmVyZW50IHZtcyAvIGlmcmFtZXMuXG4gICAqL1xuICBmdW5jdGlvbiBnZXRUeXBlIChmbikge1xuICAgIHZhciBtYXRjaCA9IGZuICYmIGZuLnRvU3RyaW5nKCkubWF0Y2goZnVuY3Rpb25UeXBlQ2hlY2tSRSk7XG4gICAgcmV0dXJuIG1hdGNoID8gbWF0Y2hbMV0gOiAnJ1xuICB9XG5cbiAgZnVuY3Rpb24gaXNTYW1lVHlwZSAoYSwgYikge1xuICAgIHJldHVybiBnZXRUeXBlKGEpID09PSBnZXRUeXBlKGIpXG4gIH1cblxuICBmdW5jdGlvbiBnZXRUeXBlSW5kZXggKHR5cGUsIGV4cGVjdGVkVHlwZXMpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZXhwZWN0ZWRUeXBlcykpIHtcbiAgICAgIHJldHVybiBpc1NhbWVUeXBlKGV4cGVjdGVkVHlwZXMsIHR5cGUpID8gMCA6IC0xXG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBleHBlY3RlZFR5cGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAoaXNTYW1lVHlwZShleHBlY3RlZFR5cGVzW2ldLCB0eXBlKSkge1xuICAgICAgICByZXR1cm4gaVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTFcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEludmFsaWRUeXBlTWVzc2FnZSAobmFtZSwgdmFsdWUsIGV4cGVjdGVkVHlwZXMpIHtcbiAgICB2YXIgbWVzc2FnZSA9IFwiSW52YWxpZCBwcm9wOiB0eXBlIGNoZWNrIGZhaWxlZCBmb3IgcHJvcCBcXFwiXCIgKyBuYW1lICsgXCJcXFwiLlwiICtcbiAgICAgIFwiIEV4cGVjdGVkIFwiICsgKGV4cGVjdGVkVHlwZXMubWFwKGNhcGl0YWxpemUpLmpvaW4oJywgJykpO1xuICAgIHZhciBleHBlY3RlZFR5cGUgPSBleHBlY3RlZFR5cGVzWzBdO1xuICAgIHZhciByZWNlaXZlZFR5cGUgPSB0b1Jhd1R5cGUodmFsdWUpO1xuICAgIC8vIGNoZWNrIGlmIHdlIG5lZWQgdG8gc3BlY2lmeSBleHBlY3RlZCB2YWx1ZVxuICAgIGlmIChcbiAgICAgIGV4cGVjdGVkVHlwZXMubGVuZ3RoID09PSAxICYmXG4gICAgICBpc0V4cGxpY2FibGUoZXhwZWN0ZWRUeXBlKSAmJlxuICAgICAgaXNFeHBsaWNhYmxlKHR5cGVvZiB2YWx1ZSkgJiZcbiAgICAgICFpc0Jvb2xlYW4oZXhwZWN0ZWRUeXBlLCByZWNlaXZlZFR5cGUpXG4gICAgKSB7XG4gICAgICBtZXNzYWdlICs9IFwiIHdpdGggdmFsdWUgXCIgKyAoc3R5bGVWYWx1ZSh2YWx1ZSwgZXhwZWN0ZWRUeXBlKSk7XG4gICAgfVxuICAgIG1lc3NhZ2UgKz0gXCIsIGdvdCBcIiArIHJlY2VpdmVkVHlwZSArIFwiIFwiO1xuICAgIC8vIGNoZWNrIGlmIHdlIG5lZWQgdG8gc3BlY2lmeSByZWNlaXZlZCB2YWx1ZVxuICAgIGlmIChpc0V4cGxpY2FibGUocmVjZWl2ZWRUeXBlKSkge1xuICAgICAgbWVzc2FnZSArPSBcIndpdGggdmFsdWUgXCIgKyAoc3R5bGVWYWx1ZSh2YWx1ZSwgcmVjZWl2ZWRUeXBlKSkgKyBcIi5cIjtcbiAgICB9XG4gICAgcmV0dXJuIG1lc3NhZ2VcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0eWxlVmFsdWUgKHZhbHVlLCB0eXBlKSB7XG4gICAgaWYgKHR5cGUgPT09ICdTdHJpbmcnKSB7XG4gICAgICByZXR1cm4gKFwiXFxcIlwiICsgdmFsdWUgKyBcIlxcXCJcIilcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdOdW1iZXInKSB7XG4gICAgICByZXR1cm4gKFwiXCIgKyAoTnVtYmVyKHZhbHVlKSkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAoXCJcIiArIHZhbHVlKVxuICAgIH1cbiAgfVxuXG4gIHZhciBFWFBMSUNBQkxFX1RZUEVTID0gWydzdHJpbmcnLCAnbnVtYmVyJywgJ2Jvb2xlYW4nXTtcbiAgZnVuY3Rpb24gaXNFeHBsaWNhYmxlICh2YWx1ZSkge1xuICAgIHJldHVybiBFWFBMSUNBQkxFX1RZUEVTLnNvbWUoZnVuY3Rpb24gKGVsZW0pIHsgcmV0dXJuIHZhbHVlLnRvTG93ZXJDYXNlKCkgPT09IGVsZW07IH0pXG4gIH1cblxuICBmdW5jdGlvbiBpc0Jvb2xlYW4gKCkge1xuICAgIHZhciBhcmdzID0gW10sIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgd2hpbGUgKCBsZW4tLSApIGFyZ3NbIGxlbiBdID0gYXJndW1lbnRzWyBsZW4gXTtcblxuICAgIHJldHVybiBhcmdzLnNvbWUoZnVuY3Rpb24gKGVsZW0pIHsgcmV0dXJuIGVsZW0udG9Mb3dlckNhc2UoKSA9PT0gJ2Jvb2xlYW4nOyB9KVxuICB9XG5cbiAgLyogICovXG5cbiAgZnVuY3Rpb24gaGFuZGxlRXJyb3IgKGVyciwgdm0sIGluZm8pIHtcbiAgICAvLyBEZWFjdGl2YXRlIGRlcHMgdHJhY2tpbmcgd2hpbGUgcHJvY2Vzc2luZyBlcnJvciBoYW5kbGVyIHRvIGF2b2lkIHBvc3NpYmxlIGluZmluaXRlIHJlbmRlcmluZy5cbiAgICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS92dWVqcy92dWV4L2lzc3Vlcy8xNTA1XG4gICAgcHVzaFRhcmdldCgpO1xuICAgIHRyeSB7XG4gICAgICBpZiAodm0pIHtcbiAgICAgICAgdmFyIGN1ciA9IHZtO1xuICAgICAgICB3aGlsZSAoKGN1ciA9IGN1ci4kcGFyZW50KSkge1xuICAgICAgICAgIHZhciBob29rcyA9IGN1ci4kb3B0aW9ucy5lcnJvckNhcHR1cmVkO1xuICAgICAgICAgIGlmIChob29rcykge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBob29rcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHZhciBjYXB0dXJlID0gaG9va3NbaV0uY2FsbChjdXIsIGVyciwgdm0sIGluZm8pID09PSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoY2FwdHVyZSkgeyByZXR1cm4gfVxuICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgZ2xvYmFsSGFuZGxlRXJyb3IoZSwgY3VyLCAnZXJyb3JDYXB0dXJlZCBob29rJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGdsb2JhbEhhbmRsZUVycm9yKGVyciwgdm0sIGluZm8pO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBwb3BUYXJnZXQoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbnZva2VXaXRoRXJyb3JIYW5kbGluZyAoXG4gICAgaGFuZGxlcixcbiAgICBjb250ZXh0LFxuICAgIGFyZ3MsXG4gICAgdm0sXG4gICAgaW5mb1xuICApIHtcbiAgICB2YXIgcmVzO1xuICAgIHRyeSB7XG4gICAgICByZXMgPSBhcmdzID8gaGFuZGxlci5hcHBseShjb250ZXh0LCBhcmdzKSA6IGhhbmRsZXIuY2FsbChjb250ZXh0KTtcbiAgICAgIGlmIChyZXMgJiYgIXJlcy5faXNWdWUgJiYgaXNQcm9taXNlKHJlcykgJiYgIXJlcy5faGFuZGxlZCkge1xuICAgICAgICByZXMuY2F0Y2goZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGhhbmRsZUVycm9yKGUsIHZtLCBpbmZvICsgXCIgKFByb21pc2UvYXN5bmMpXCIpOyB9KTtcbiAgICAgICAgLy8gaXNzdWUgIzk1MTFcbiAgICAgICAgLy8gYXZvaWQgY2F0Y2ggdHJpZ2dlcmluZyBtdWx0aXBsZSB0aW1lcyB3aGVuIG5lc3RlZCBjYWxsc1xuICAgICAgICByZXMuX2hhbmRsZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGhhbmRsZUVycm9yKGUsIHZtLCBpbmZvKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgZnVuY3Rpb24gZ2xvYmFsSGFuZGxlRXJyb3IgKGVyciwgdm0sIGluZm8pIHtcbiAgICBpZiAoY29uZmlnLmVycm9ySGFuZGxlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5lcnJvckhhbmRsZXIuY2FsbChudWxsLCBlcnIsIHZtLCBpbmZvKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBpZiB0aGUgdXNlciBpbnRlbnRpb25hbGx5IHRocm93cyB0aGUgb3JpZ2luYWwgZXJyb3IgaW4gdGhlIGhhbmRsZXIsXG4gICAgICAgIC8vIGRvIG5vdCBsb2cgaXQgdHdpY2VcbiAgICAgICAgaWYgKGUgIT09IGVycikge1xuICAgICAgICAgIGxvZ0Vycm9yKGUsIG51bGwsICdjb25maWcuZXJyb3JIYW5kbGVyJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgbG9nRXJyb3IoZXJyLCB2bSwgaW5mbyk7XG4gIH1cblxuICBmdW5jdGlvbiBsb2dFcnJvciAoZXJyLCB2bSwgaW5mbykge1xuICAgIHtcbiAgICAgIHdhcm4oKFwiRXJyb3IgaW4gXCIgKyBpbmZvICsgXCI6IFxcXCJcIiArIChlcnIudG9TdHJpbmcoKSkgKyBcIlxcXCJcIiksIHZtKTtcbiAgICB9XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICBpZiAoKGluQnJvd3NlciB8fCBpbldlZXgpICYmIHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICAvKiAgKi9cblxuICB2YXIgaXNVc2luZ01pY3JvVGFzayA9IGZhbHNlO1xuXG4gIHZhciBjYWxsYmFja3MgPSBbXTtcbiAgdmFyIHBlbmRpbmcgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBmbHVzaENhbGxiYWNrcyAoKSB7XG4gICAgcGVuZGluZyA9IGZhbHNlO1xuICAgIHZhciBjb3BpZXMgPSBjYWxsYmFja3Muc2xpY2UoMCk7XG4gICAgY2FsbGJhY2tzLmxlbmd0aCA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3BpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvcGllc1tpXSgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEhlcmUgd2UgaGF2ZSBhc3luYyBkZWZlcnJpbmcgd3JhcHBlcnMgdXNpbmcgbWljcm90YXNrcy5cbiAgLy8gSW4gMi41IHdlIHVzZWQgKG1hY3JvKSB0YXNrcyAoaW4gY29tYmluYXRpb24gd2l0aCBtaWNyb3Rhc2tzKS5cbiAgLy8gSG93ZXZlciwgaXQgaGFzIHN1YnRsZSBwcm9ibGVtcyB3aGVuIHN0YXRlIGlzIGNoYW5nZWQgcmlnaHQgYmVmb3JlIHJlcGFpbnRcbiAgLy8gKGUuZy4gIzY4MTMsIG91dC1pbiB0cmFuc2l0aW9ucykuXG4gIC8vIEFsc28sIHVzaW5nIChtYWNybykgdGFza3MgaW4gZXZlbnQgaGFuZGxlciB3b3VsZCBjYXVzZSBzb21lIHdlaXJkIGJlaGF2aW9yc1xuICAvLyB0aGF0IGNhbm5vdCBiZSBjaXJjdW12ZW50ZWQgKGUuZy4gIzcxMDksICM3MTUzLCAjNzU0NiwgIzc4MzQsICM4MTA5KS5cbiAgLy8gU28gd2Ugbm93IHVzZSBtaWNyb3Rhc2tzIGV2ZXJ5d2hlcmUsIGFnYWluLlxuICAvLyBBIG1ham9yIGRyYXdiYWNrIG9mIHRoaXMgdHJhZGVvZmYgaXMgdGhhdCB0aGVyZSBhcmUgc29tZSBzY2VuYXJpb3NcbiAgLy8gd2hlcmUgbWljcm90YXNrcyBoYXZlIHRvbyBoaWdoIGEgcHJpb3JpdHkgYW5kIGZpcmUgaW4gYmV0d2VlbiBzdXBwb3NlZGx5XG4gIC8vIHNlcXVlbnRpYWwgZXZlbnRzIChlLmcuICM0NTIxLCAjNjY5MCwgd2hpY2ggaGF2ZSB3b3JrYXJvdW5kcylcbiAgLy8gb3IgZXZlbiBiZXR3ZWVuIGJ1YmJsaW5nIG9mIHRoZSBzYW1lIGV2ZW50ICgjNjU2NikuXG4gIHZhciB0aW1lckZ1bmM7XG5cbiAgLy8gVGhlIG5leHRUaWNrIGJlaGF2aW9yIGxldmVyYWdlcyB0aGUgbWljcm90YXNrIHF1ZXVlLCB3aGljaCBjYW4gYmUgYWNjZXNzZWRcbiAgLy8gdmlhIGVpdGhlciBuYXRpdmUgUHJvbWlzZS50aGVuIG9yIE11dGF0aW9uT2JzZXJ2ZXIuXG4gIC8vIE11dGF0aW9uT2JzZXJ2ZXIgaGFzIHdpZGVyIHN1cHBvcnQsIGhvd2V2ZXIgaXQgaXMgc2VyaW91c2x5IGJ1Z2dlZCBpblxuICAvLyBVSVdlYlZpZXcgaW4gaU9TID49IDkuMy4zIHdoZW4gdHJpZ2dlcmVkIGluIHRvdWNoIGV2ZW50IGhhbmRsZXJzLiBJdFxuICAvLyBjb21wbGV0ZWx5IHN0b3BzIHdvcmtpbmcgYWZ0ZXIgdHJpZ2dlcmluZyBhIGZldyB0aW1lcy4uLiBzbywgaWYgbmF0aXZlXG4gIC8vIFByb21pc2UgaXMgYXZhaWxhYmxlLCB3ZSB3aWxsIHVzZSBpdDpcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQsICRmbG93LWRpc2FibGUtbGluZSAqL1xuICBpZiAodHlwZW9mIFByb21pc2UgIT09ICd1bmRlZmluZWQnICYmIGlzTmF0aXZlKFByb21pc2UpKSB7XG4gICAgdmFyIHAgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB0aW1lckZ1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBwLnRoZW4oZmx1c2hDYWxsYmFja3MpO1xuICAgICAgLy8gSW4gcHJvYmxlbWF0aWMgVUlXZWJWaWV3cywgUHJvbWlzZS50aGVuIGRvZXNuJ3QgY29tcGxldGVseSBicmVhaywgYnV0XG4gICAgICAvLyBpdCBjYW4gZ2V0IHN0dWNrIGluIGEgd2VpcmQgc3RhdGUgd2hlcmUgY2FsbGJhY2tzIGFyZSBwdXNoZWQgaW50byB0aGVcbiAgICAgIC8vIG1pY3JvdGFzayBxdWV1ZSBidXQgdGhlIHF1ZXVlIGlzbid0IGJlaW5nIGZsdXNoZWQsIHVudGlsIHRoZSBicm93c2VyXG4gICAgICAvLyBuZWVkcyB0byBkbyBzb21lIG90aGVyIHdvcmssIGUuZy4gaGFuZGxlIGEgdGltZXIuIFRoZXJlZm9yZSB3ZSBjYW5cbiAgICAgIC8vIFwiZm9yY2VcIiB0aGUgbWljcm90YXNrIHF1ZXVlIHRvIGJlIGZsdXNoZWQgYnkgYWRkaW5nIGFuIGVtcHR5IHRpbWVyLlxuICAgICAgaWYgKGlzSU9TKSB7IHNldFRpbWVvdXQobm9vcCk7IH1cbiAgICB9O1xuICAgIGlzVXNpbmdNaWNyb1Rhc2sgPSB0cnVlO1xuICB9IGVsc2UgaWYgKCFpc0lFICYmIHR5cGVvZiBNdXRhdGlvbk9ic2VydmVyICE9PSAndW5kZWZpbmVkJyAmJiAoXG4gICAgaXNOYXRpdmUoTXV0YXRpb25PYnNlcnZlcikgfHxcbiAgICAvLyBQaGFudG9tSlMgYW5kIGlPUyA3LnhcbiAgICBNdXRhdGlvbk9ic2VydmVyLnRvU3RyaW5nKCkgPT09ICdbb2JqZWN0IE11dGF0aW9uT2JzZXJ2ZXJDb25zdHJ1Y3Rvcl0nXG4gICkpIHtcbiAgICAvLyBVc2UgTXV0YXRpb25PYnNlcnZlciB3aGVyZSBuYXRpdmUgUHJvbWlzZSBpcyBub3QgYXZhaWxhYmxlLFxuICAgIC8vIGUuZy4gUGhhbnRvbUpTLCBpT1M3LCBBbmRyb2lkIDQuNFxuICAgIC8vICgjNjQ2NiBNdXRhdGlvbk9ic2VydmVyIGlzIHVucmVsaWFibGUgaW4gSUUxMSlcbiAgICB2YXIgY291bnRlciA9IDE7XG4gICAgdmFyIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZmx1c2hDYWxsYmFja3MpO1xuICAgIHZhciB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFN0cmluZyhjb3VudGVyKSk7XG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZSh0ZXh0Tm9kZSwge1xuICAgICAgY2hhcmFjdGVyRGF0YTogdHJ1ZVxuICAgIH0pO1xuICAgIHRpbWVyRnVuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvdW50ZXIgPSAoY291bnRlciArIDEpICUgMjtcbiAgICAgIHRleHROb2RlLmRhdGEgPSBTdHJpbmcoY291bnRlcik7XG4gICAgfTtcbiAgICBpc1VzaW5nTWljcm9UYXNrID0gdHJ1ZTtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygc2V0SW1tZWRpYXRlICE9PSAndW5kZWZpbmVkJyAmJiBpc05hdGl2ZShzZXRJbW1lZGlhdGUpKSB7XG4gICAgLy8gRmFsbGJhY2sgdG8gc2V0SW1tZWRpYXRlLlxuICAgIC8vIFRlY2huaWNhbGx5IGl0IGxldmVyYWdlcyB0aGUgKG1hY3JvKSB0YXNrIHF1ZXVlLFxuICAgIC8vIGJ1dCBpdCBpcyBzdGlsbCBhIGJldHRlciBjaG9pY2UgdGhhbiBzZXRUaW1lb3V0LlxuICAgIHRpbWVyRnVuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNldEltbWVkaWF0ZShmbHVzaENhbGxiYWNrcyk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjayB0byBzZXRUaW1lb3V0LlxuICAgIHRpbWVyRnVuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNldFRpbWVvdXQoZmx1c2hDYWxsYmFja3MsIDApO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBuZXh0VGljayAoY2IsIGN0eCkge1xuICAgIHZhciBfcmVzb2x2ZTtcbiAgICBjYWxsYmFja3MucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoY2IpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjYi5jYWxsKGN0eCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBoYW5kbGVFcnJvcihlLCBjdHgsICduZXh0VGljaycpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKF9yZXNvbHZlKSB7XG4gICAgICAgIF9yZXNvbHZlKGN0eCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKCFwZW5kaW5nKSB7XG4gICAgICBwZW5kaW5nID0gdHJ1ZTtcbiAgICAgIHRpbWVyRnVuYygpO1xuICAgIH1cbiAgICAvLyAkZmxvdy1kaXNhYmxlLWxpbmVcbiAgICBpZiAoIWNiICYmIHR5cGVvZiBQcm9taXNlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgIF9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgLyogICovXG5cbiAgdmFyIG1hcms7XG4gIHZhciBtZWFzdXJlO1xuXG4gIHtcbiAgICB2YXIgcGVyZiA9IGluQnJvd3NlciAmJiB3aW5kb3cucGVyZm9ybWFuY2U7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKFxuICAgICAgcGVyZiAmJlxuICAgICAgcGVyZi5tYXJrICYmXG4gICAgICBwZXJmLm1lYXN1cmUgJiZcbiAgICAgIHBlcmYuY2xlYXJNYXJrcyAmJlxuICAgICAgcGVyZi5jbGVhck1lYXN1cmVzXG4gICAgKSB7XG4gICAgICBtYXJrID0gZnVuY3Rpb24gKHRhZykgeyByZXR1cm4gcGVyZi5tYXJrKHRhZyk7IH07XG4gICAgICBtZWFzdXJlID0gZnVuY3Rpb24gKG5hbWUsIHN0YXJ0VGFnLCBlbmRUYWcpIHtcbiAgICAgICAgcGVyZi5tZWFzdXJlKG5hbWUsIHN0YXJ0VGFnLCBlbmRUYWcpO1xuICAgICAgICBwZXJmLmNsZWFyTWFya3Moc3RhcnRUYWcpO1xuICAgICAgICBwZXJmLmNsZWFyTWFya3MoZW5kVGFnKTtcbiAgICAgICAgLy8gcGVyZi5jbGVhck1lYXN1cmVzKG5hbWUpXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIC8qIG5vdCB0eXBlIGNoZWNraW5nIHRoaXMgZmlsZSBiZWNhdXNlIGZsb3cgZG9lc24ndCBwbGF5IHdlbGwgd2l0aCBQcm94eSAqL1xuXG4gIHZhciBpbml0UHJveHk7XG5cbiAge1xuICAgIHZhciBhbGxvd2VkR2xvYmFscyA9IG1ha2VNYXAoXG4gICAgICAnSW5maW5pdHksdW5kZWZpbmVkLE5hTixpc0Zpbml0ZSxpc05hTiwnICtcbiAgICAgICdwYXJzZUZsb2F0LHBhcnNlSW50LGRlY29kZVVSSSxkZWNvZGVVUklDb21wb25lbnQsZW5jb2RlVVJJLGVuY29kZVVSSUNvbXBvbmVudCwnICtcbiAgICAgICdNYXRoLE51bWJlcixEYXRlLEFycmF5LE9iamVjdCxCb29sZWFuLFN0cmluZyxSZWdFeHAsTWFwLFNldCxKU09OLEludGwsQmlnSW50LCcgK1xuICAgICAgJ3JlcXVpcmUnIC8vIGZvciBXZWJwYWNrL0Jyb3dzZXJpZnlcbiAgICApO1xuXG4gICAgdmFyIHdhcm5Ob25QcmVzZW50ID0gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7XG4gICAgICB3YXJuKFxuICAgICAgICBcIlByb3BlcnR5IG9yIG1ldGhvZCBcXFwiXCIgKyBrZXkgKyBcIlxcXCIgaXMgbm90IGRlZmluZWQgb24gdGhlIGluc3RhbmNlIGJ1dCBcIiArXG4gICAgICAgICdyZWZlcmVuY2VkIGR1cmluZyByZW5kZXIuIE1ha2Ugc3VyZSB0aGF0IHRoaXMgcHJvcGVydHkgaXMgcmVhY3RpdmUsICcgK1xuICAgICAgICAnZWl0aGVyIGluIHRoZSBkYXRhIG9wdGlvbiwgb3IgZm9yIGNsYXNzLWJhc2VkIGNvbXBvbmVudHMsIGJ5ICcgK1xuICAgICAgICAnaW5pdGlhbGl6aW5nIHRoZSBwcm9wZXJ0eS4gJyArXG4gICAgICAgICdTZWU6IGh0dHBzOi8vdnVlanMub3JnL3YyL2d1aWRlL3JlYWN0aXZpdHkuaHRtbCNEZWNsYXJpbmctUmVhY3RpdmUtUHJvcGVydGllcy4nLFxuICAgICAgICB0YXJnZXRcbiAgICAgICk7XG4gICAgfTtcblxuICAgIHZhciB3YXJuUmVzZXJ2ZWRQcmVmaXggPSBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHtcbiAgICAgIHdhcm4oXG4gICAgICAgIFwiUHJvcGVydHkgXFxcIlwiICsga2V5ICsgXCJcXFwiIG11c3QgYmUgYWNjZXNzZWQgd2l0aCBcXFwiJGRhdGEuXCIgKyBrZXkgKyBcIlxcXCIgYmVjYXVzZSBcIiArXG4gICAgICAgICdwcm9wZXJ0aWVzIHN0YXJ0aW5nIHdpdGggXCIkXCIgb3IgXCJfXCIgYXJlIG5vdCBwcm94aWVkIGluIHRoZSBWdWUgaW5zdGFuY2UgdG8gJyArXG4gICAgICAgICdwcmV2ZW50IGNvbmZsaWN0cyB3aXRoIFZ1ZSBpbnRlcm5hbHMuICcgK1xuICAgICAgICAnU2VlOiBodHRwczovL3Z1ZWpzLm9yZy92Mi9hcGkvI2RhdGEnLFxuICAgICAgICB0YXJnZXRcbiAgICAgICk7XG4gICAgfTtcblxuICAgIHZhciBoYXNQcm94eSA9XG4gICAgICB0eXBlb2YgUHJveHkgIT09ICd1bmRlZmluZWQnICYmIGlzTmF0aXZlKFByb3h5KTtcblxuICAgIGlmIChoYXNQcm94eSkge1xuICAgICAgdmFyIGlzQnVpbHRJbk1vZGlmaWVyID0gbWFrZU1hcCgnc3RvcCxwcmV2ZW50LHNlbGYsY3RybCxzaGlmdCxhbHQsbWV0YSxleGFjdCcpO1xuICAgICAgY29uZmlnLmtleUNvZGVzID0gbmV3IFByb3h5KGNvbmZpZy5rZXlDb2Rlcywge1xuICAgICAgICBzZXQ6IGZ1bmN0aW9uIHNldCAodGFyZ2V0LCBrZXksIHZhbHVlKSB7XG4gICAgICAgICAgaWYgKGlzQnVpbHRJbk1vZGlmaWVyKGtleSkpIHtcbiAgICAgICAgICAgIHdhcm4oKFwiQXZvaWQgb3ZlcndyaXRpbmcgYnVpbHQtaW4gbW9kaWZpZXIgaW4gY29uZmlnLmtleUNvZGVzOiAuXCIgKyBrZXkpKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciBoYXNIYW5kbGVyID0ge1xuICAgICAgaGFzOiBmdW5jdGlvbiBoYXMgKHRhcmdldCwga2V5KSB7XG4gICAgICAgIHZhciBoYXMgPSBrZXkgaW4gdGFyZ2V0O1xuICAgICAgICB2YXIgaXNBbGxvd2VkID0gYWxsb3dlZEdsb2JhbHMoa2V5KSB8fFxuICAgICAgICAgICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJyAmJiBrZXkuY2hhckF0KDApID09PSAnXycgJiYgIShrZXkgaW4gdGFyZ2V0LiRkYXRhKSk7XG4gICAgICAgIGlmICghaGFzICYmICFpc0FsbG93ZWQpIHtcbiAgICAgICAgICBpZiAoa2V5IGluIHRhcmdldC4kZGF0YSkgeyB3YXJuUmVzZXJ2ZWRQcmVmaXgodGFyZ2V0LCBrZXkpOyB9XG4gICAgICAgICAgZWxzZSB7IHdhcm5Ob25QcmVzZW50KHRhcmdldCwga2V5KTsgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoYXMgfHwgIWlzQWxsb3dlZFxuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZ2V0SGFuZGxlciA9IHtcbiAgICAgIGdldDogZnVuY3Rpb24gZ2V0ICh0YXJnZXQsIGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycgJiYgIShrZXkgaW4gdGFyZ2V0KSkge1xuICAgICAgICAgIGlmIChrZXkgaW4gdGFyZ2V0LiRkYXRhKSB7IHdhcm5SZXNlcnZlZFByZWZpeCh0YXJnZXQsIGtleSk7IH1cbiAgICAgICAgICBlbHNlIHsgd2Fybk5vblByZXNlbnQodGFyZ2V0LCBrZXkpOyB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRhcmdldFtrZXldXG4gICAgICB9XG4gICAgfTtcblxuICAgIGluaXRQcm94eSA9IGZ1bmN0aW9uIGluaXRQcm94eSAodm0pIHtcbiAgICAgIGlmIChoYXNQcm94eSkge1xuICAgICAgICAvLyBkZXRlcm1pbmUgd2hpY2ggcHJveHkgaGFuZGxlciB0byB1c2VcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB2bS4kb3B0aW9ucztcbiAgICAgICAgdmFyIGhhbmRsZXJzID0gb3B0aW9ucy5yZW5kZXIgJiYgb3B0aW9ucy5yZW5kZXIuX3dpdGhTdHJpcHBlZFxuICAgICAgICAgID8gZ2V0SGFuZGxlclxuICAgICAgICAgIDogaGFzSGFuZGxlcjtcbiAgICAgICAgdm0uX3JlbmRlclByb3h5ID0gbmV3IFByb3h5KHZtLCBoYW5kbGVycyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2bS5fcmVuZGVyUHJveHkgPSB2bTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyogICovXG5cbiAgdmFyIHNlZW5PYmplY3RzID0gbmV3IF9TZXQoKTtcblxuICAvKipcbiAgICogUmVjdXJzaXZlbHkgdHJhdmVyc2UgYW4gb2JqZWN0IHRvIGV2b2tlIGFsbCBjb252ZXJ0ZWRcbiAgICogZ2V0dGVycywgc28gdGhhdCBldmVyeSBuZXN0ZWQgcHJvcGVydHkgaW5zaWRlIHRoZSBvYmplY3RcbiAgICogaXMgY29sbGVjdGVkIGFzIGEgXCJkZWVwXCIgZGVwZW5kZW5jeS5cbiAgICovXG4gIGZ1bmN0aW9uIHRyYXZlcnNlICh2YWwpIHtcbiAgICBfdHJhdmVyc2UodmFsLCBzZWVuT2JqZWN0cyk7XG4gICAgc2Vlbk9iamVjdHMuY2xlYXIoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF90cmF2ZXJzZSAodmFsLCBzZWVuKSB7XG4gICAgdmFyIGksIGtleXM7XG4gICAgdmFyIGlzQSA9IEFycmF5LmlzQXJyYXkodmFsKTtcbiAgICBpZiAoKCFpc0EgJiYgIWlzT2JqZWN0KHZhbCkpIHx8IE9iamVjdC5pc0Zyb3plbih2YWwpIHx8IHZhbCBpbnN0YW5jZW9mIFZOb2RlKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKHZhbC5fX29iX18pIHtcbiAgICAgIHZhciBkZXBJZCA9IHZhbC5fX29iX18uZGVwLmlkO1xuICAgICAgaWYgKHNlZW4uaGFzKGRlcElkKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHNlZW4uYWRkKGRlcElkKTtcbiAgICB9XG4gICAgaWYgKGlzQSkge1xuICAgICAgaSA9IHZhbC5sZW5ndGg7XG4gICAgICB3aGlsZSAoaS0tKSB7IF90cmF2ZXJzZSh2YWxbaV0sIHNlZW4pOyB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGtleXMgPSBPYmplY3Qua2V5cyh2YWwpO1xuICAgICAgaSA9IGtleXMubGVuZ3RoO1xuICAgICAgd2hpbGUgKGktLSkgeyBfdHJhdmVyc2UodmFsW2tleXNbaV1dLCBzZWVuKTsgfVxuICAgIH1cbiAgfVxuXG4gIC8qICAqL1xuXG4gIHZhciBub3JtYWxpemVFdmVudCA9IGNhY2hlZChmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciBwYXNzaXZlID0gbmFtZS5jaGFyQXQoMCkgPT09ICcmJztcbiAgICBuYW1lID0gcGFzc2l2ZSA/IG5hbWUuc2xpY2UoMSkgOiBuYW1lO1xuICAgIHZhciBvbmNlJCQxID0gbmFtZS5jaGFyQXQoMCkgPT09ICd+JzsgLy8gUHJlZml4ZWQgbGFzdCwgY2hlY2tlZCBmaXJzdFxuICAgIG5hbWUgPSBvbmNlJCQxID8gbmFtZS5zbGljZSgxKSA6IG5hbWU7XG4gICAgdmFyIGNhcHR1cmUgPSBuYW1lLmNoYXJBdCgwKSA9PT0gJyEnO1xuICAgIG5hbWUgPSBjYXB0dXJlID8gbmFtZS5zbGljZSgxKSA6IG5hbWU7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICBvbmNlOiBvbmNlJCQxLFxuICAgICAgY2FwdHVyZTogY2FwdHVyZSxcbiAgICAgIHBhc3NpdmU6IHBhc3NpdmVcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZUZuSW52b2tlciAoZm5zLCB2bSkge1xuICAgIGZ1bmN0aW9uIGludm9rZXIgKCkge1xuICAgICAgdmFyIGFyZ3VtZW50cyQxID0gYXJndW1lbnRzO1xuXG4gICAgICB2YXIgZm5zID0gaW52b2tlci5mbnM7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShmbnMpKSB7XG4gICAgICAgIHZhciBjbG9uZWQgPSBmbnMuc2xpY2UoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbG9uZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpbnZva2VXaXRoRXJyb3JIYW5kbGluZyhjbG9uZWRbaV0sIG51bGwsIGFyZ3VtZW50cyQxLCB2bSwgXCJ2LW9uIGhhbmRsZXJcIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHJldHVybiBoYW5kbGVyIHJldHVybiB2YWx1ZSBmb3Igc2luZ2xlIGhhbmRsZXJzXG4gICAgICAgIHJldHVybiBpbnZva2VXaXRoRXJyb3JIYW5kbGluZyhmbnMsIG51bGwsIGFyZ3VtZW50cywgdm0sIFwidi1vbiBoYW5kbGVyXCIpXG4gICAgICB9XG4gICAgfVxuICAgIGludm9rZXIuZm5zID0gZm5zO1xuICAgIHJldHVybiBpbnZva2VyXG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVMaXN0ZW5lcnMgKFxuICAgIG9uLFxuICAgIG9sZE9uLFxuICAgIGFkZCxcbiAgICByZW1vdmUkJDEsXG4gICAgY3JlYXRlT25jZUhhbmRsZXIsXG4gICAgdm1cbiAgKSB7XG4gICAgdmFyIG5hbWUsIGRlZiQkMSwgY3VyLCBvbGQsIGV2ZW50O1xuICAgIGZvciAobmFtZSBpbiBvbikge1xuICAgICAgZGVmJCQxID0gY3VyID0gb25bbmFtZV07XG4gICAgICBvbGQgPSBvbGRPbltuYW1lXTtcbiAgICAgIGV2ZW50ID0gbm9ybWFsaXplRXZlbnQobmFtZSk7XG4gICAgICBpZiAoaXNVbmRlZihjdXIpKSB7XG4gICAgICAgIHdhcm4oXG4gICAgICAgICAgXCJJbnZhbGlkIGhhbmRsZXIgZm9yIGV2ZW50IFxcXCJcIiArIChldmVudC5uYW1lKSArIFwiXFxcIjogZ290IFwiICsgU3RyaW5nKGN1ciksXG4gICAgICAgICAgdm1cbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNVbmRlZihvbGQpKSB7XG4gICAgICAgIGlmIChpc1VuZGVmKGN1ci5mbnMpKSB7XG4gICAgICAgICAgY3VyID0gb25bbmFtZV0gPSBjcmVhdGVGbkludm9rZXIoY3VyLCB2bSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzVHJ1ZShldmVudC5vbmNlKSkge1xuICAgICAgICAgIGN1ciA9IG9uW25hbWVdID0gY3JlYXRlT25jZUhhbmRsZXIoZXZlbnQubmFtZSwgY3VyLCBldmVudC5jYXB0dXJlKTtcbiAgICAgICAgfVxuICAgICAgICBhZGQoZXZlbnQubmFtZSwgY3VyLCBldmVudC5jYXB0dXJlLCBldmVudC5wYXNzaXZlLCBldmVudC5wYXJhbXMpO1xuICAgICAgfSBlbHNlIGlmIChjdXIgIT09IG9sZCkge1xuICAgICAgICBvbGQuZm5zID0gY3VyO1xuICAgICAgICBvbltuYW1lXSA9IG9sZDtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yIChuYW1lIGluIG9sZE9uKSB7XG4gICAgICBpZiAoaXNVbmRlZihvbltuYW1lXSkpIHtcbiAgICAgICAgZXZlbnQgPSBub3JtYWxpemVFdmVudChuYW1lKTtcbiAgICAgICAgcmVtb3ZlJCQxKGV2ZW50Lm5hbWUsIG9sZE9uW25hbWVdLCBldmVudC5jYXB0dXJlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiAgKi9cblxuICBmdW5jdGlvbiBtZXJnZVZOb2RlSG9vayAoZGVmLCBob29rS2V5LCBob29rKSB7XG4gICAgaWYgKGRlZiBpbnN0YW5jZW9mIFZOb2RlKSB7XG4gICAgICBkZWYgPSBkZWYuZGF0YS5ob29rIHx8IChkZWYuZGF0YS5ob29rID0ge30pO1xuICAgIH1cbiAgICB2YXIgaW52b2tlcjtcbiAgICB2YXIgb2xkSG9vayA9IGRlZltob29rS2V5XTtcblxuICAgIGZ1bmN0aW9uIHdyYXBwZWRIb29rICgpIHtcbiAgICAgIGhvb2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIC8vIGltcG9ydGFudDogcmVtb3ZlIG1lcmdlZCBob29rIHRvIGVuc3VyZSBpdCdzIGNhbGxlZCBvbmx5IG9uY2VcbiAgICAgIC8vIGFuZCBwcmV2ZW50IG1lbW9yeSBsZWFrXG4gICAgICByZW1vdmUoaW52b2tlci5mbnMsIHdyYXBwZWRIb29rKTtcbiAgICB9XG5cbiAgICBpZiAoaXNVbmRlZihvbGRIb29rKSkge1xuICAgICAgLy8gbm8gZXhpc3RpbmcgaG9va1xuICAgICAgaW52b2tlciA9IGNyZWF0ZUZuSW52b2tlcihbd3JhcHBlZEhvb2tdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICBpZiAoaXNEZWYob2xkSG9vay5mbnMpICYmIGlzVHJ1ZShvbGRIb29rLm1lcmdlZCkpIHtcbiAgICAgICAgLy8gYWxyZWFkeSBhIG1lcmdlZCBpbnZva2VyXG4gICAgICAgIGludm9rZXIgPSBvbGRIb29rO1xuICAgICAgICBpbnZva2VyLmZucy5wdXNoKHdyYXBwZWRIb29rKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGV4aXN0aW5nIHBsYWluIGhvb2tcbiAgICAgICAgaW52b2tlciA9IGNyZWF0ZUZuSW52b2tlcihbb2xkSG9vaywgd3JhcHBlZEhvb2tdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpbnZva2VyLm1lcmdlZCA9IHRydWU7XG4gICAgZGVmW2hvb2tLZXldID0gaW52b2tlcjtcbiAgfVxuXG4gIC8qICAqL1xuXG4gIGZ1bmN0aW9uIGV4dHJhY3RQcm9wc0Zyb21WTm9kZURhdGEgKFxuICAgIGRhdGEsXG4gICAgQ3RvcixcbiAgICB0YWdcbiAgKSB7XG4gICAgLy8gd2UgYXJlIG9ubHkgZXh0cmFjdGluZyByYXcgdmFsdWVzIGhlcmUuXG4gICAgLy8gdmFsaWRhdGlvbiBhbmQgZGVmYXVsdCB2YWx1ZXMgYXJlIGhhbmRsZWQgaW4gdGhlIGNoaWxkXG4gICAgLy8gY29tcG9uZW50IGl0c2VsZi5cbiAgICB2YXIgcHJvcE9wdGlvbnMgPSBDdG9yLm9wdGlvbnMucHJvcHM7XG4gICAgaWYgKGlzVW5kZWYocHJvcE9wdGlvbnMpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdmFyIHJlcyA9IHt9O1xuICAgIHZhciBhdHRycyA9IGRhdGEuYXR0cnM7XG4gICAgdmFyIHByb3BzID0gZGF0YS5wcm9wcztcbiAgICBpZiAoaXNEZWYoYXR0cnMpIHx8IGlzRGVmKHByb3BzKSkge1xuICAgICAgZm9yICh2YXIga2V5IGluIHByb3BPcHRpb25zKSB7XG4gICAgICAgIHZhciBhbHRLZXkgPSBoeXBoZW5hdGUoa2V5KTtcbiAgICAgICAge1xuICAgICAgICAgIHZhciBrZXlJbkxvd2VyQ2FzZSA9IGtleS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGtleSAhPT0ga2V5SW5Mb3dlckNhc2UgJiZcbiAgICAgICAgICAgIGF0dHJzICYmIGhhc093bihhdHRycywga2V5SW5Mb3dlckNhc2UpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICB0aXAoXG4gICAgICAgICAgICAgIFwiUHJvcCBcXFwiXCIgKyBrZXlJbkxvd2VyQ2FzZSArIFwiXFxcIiBpcyBwYXNzZWQgdG8gY29tcG9uZW50IFwiICtcbiAgICAgICAgICAgICAgKGZvcm1hdENvbXBvbmVudE5hbWUodGFnIHx8IEN0b3IpKSArIFwiLCBidXQgdGhlIGRlY2xhcmVkIHByb3AgbmFtZSBpc1wiICtcbiAgICAgICAgICAgICAgXCIgXFxcIlwiICsga2V5ICsgXCJcXFwiLiBcIiArXG4gICAgICAgICAgICAgIFwiTm90ZSB0aGF0IEhUTUwgYXR0cmlidXRlcyBhcmUgY2FzZS1pbnNlbnNpdGl2ZSBhbmQgY2FtZWxDYXNlZCBcIiArXG4gICAgICAgICAgICAgIFwicHJvcHMgbmVlZCB0byB1c2UgdGhlaXIga2ViYWItY2FzZSBlcXVpdmFsZW50cyB3aGVuIHVzaW5nIGluLURPTSBcIiArXG4gICAgICAgICAgICAgIFwidGVtcGxhdGVzLiBZb3Ugc2hvdWxkIHByb2JhYmx5IHVzZSBcXFwiXCIgKyBhbHRLZXkgKyBcIlxcXCIgaW5zdGVhZCBvZiBcXFwiXCIgKyBrZXkgKyBcIlxcXCIuXCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNoZWNrUHJvcChyZXMsIHByb3BzLCBrZXksIGFsdEtleSwgdHJ1ZSkgfHxcbiAgICAgICAgY2hlY2tQcm9wKHJlcywgYXR0cnMsIGtleSwgYWx0S2V5LCBmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrUHJvcCAoXG4gICAgcmVzLFxuICAgIGhhc2gsXG4gICAga2V5LFxuICAgIGFsdEtleSxcbiAgICBwcmVzZXJ2ZVxuICApIHtcbiAgICBpZiAoaXNEZWYoaGFzaCkpIHtcbiAgICAgIGlmIChoYXNPd24oaGFzaCwga2V5KSkge1xuICAgICAgICByZXNba2V5XSA9IGhhc2hba2V5XTtcbiAgICAgICAgaWYgKCFwcmVzZXJ2ZSkge1xuICAgICAgICAgIGRlbGV0ZSBoYXNoW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gZWxzZSBpZiAoaGFzT3duKGhhc2gsIGFsdEtleSkpIHtcbiAgICAgICAgcmVzW2tleV0gPSBoYXNoW2FsdEtleV07XG4gICAgICAgIGlmICghcHJlc2VydmUpIHtcbiAgICAgICAgICBkZWxldGUgaGFzaFthbHRLZXldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLyogICovXG5cbiAgLy8gVGhlIHRlbXBsYXRlIGNvbXBpbGVyIGF0dGVtcHRzIHRvIG1pbmltaXplIHRoZSBuZWVkIGZvciBub3JtYWxpemF0aW9uIGJ5XG4gIC8vIHN0YXRpY2FsbHkgYW5hbHl6aW5nIHRoZSB0ZW1wbGF0ZSBhdCBjb21waWxlIHRpbWUuXG4gIC8vXG4gIC8vIEZvciBwbGFpbiBIVE1MIG1hcmt1cCwgbm9ybWFsaXphdGlvbiBjYW4gYmUgY29tcGxldGVseSBza2lwcGVkIGJlY2F1c2UgdGhlXG4gIC8vIGdlbmVyYXRlZCByZW5kZXIgZnVuY3Rpb24gaXMgZ3VhcmFudGVlZCB0byByZXR1cm4gQXJyYXk8Vk5vZGU+LiBUaGVyZSBhcmVcbiAgLy8gdHdvIGNhc2VzIHdoZXJlIGV4dHJhIG5vcm1hbGl6YXRpb24gaXMgbmVlZGVkOlxuXG4gIC8vIDEuIFdoZW4gdGhlIGNoaWxkcmVuIGNvbnRhaW5zIGNvbXBvbmVudHMgLSBiZWNhdXNlIGEgZnVuY3Rpb25hbCBjb21wb25lbnRcbiAgLy8gbWF5IHJldHVybiBhbiBBcnJheSBpbnN0ZWFkIG9mIGEgc2luZ2xlIHJvb3QuIEluIHRoaXMgY2FzZSwganVzdCBhIHNpbXBsZVxuICAvLyBub3JtYWxpemF0aW9uIGlzIG5lZWRlZCAtIGlmIGFueSBjaGlsZCBpcyBhbiBBcnJheSwgd2UgZmxhdHRlbiB0aGUgd2hvbGVcbiAgLy8gdGhpbmcgd2l0aCBBcnJheS5wcm90b3R5cGUuY29uY2F0LiBJdCBpcyBndWFyYW50ZWVkIHRvIGJlIG9ubHkgMS1sZXZlbCBkZWVwXG4gIC8vIGJlY2F1c2UgZnVuY3Rpb25hbCBjb21wb25lbnRzIGFscmVhZHkgbm9ybWFsaXplIHRoZWlyIG93biBjaGlsZHJlbi5cbiAgZnVuY3Rpb24gc2ltcGxlTm9ybWFsaXplQ2hpbGRyZW4gKGNoaWxkcmVuKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW5baV0pKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCBjaGlsZHJlbilcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNoaWxkcmVuXG4gIH1cblxuICAvLyAyLiBXaGVuIHRoZSBjaGlsZHJlbiBjb250YWlucyBjb25zdHJ1Y3RzIHRoYXQgYWx3YXlzIGdlbmVyYXRlZCBuZXN0ZWQgQXJyYXlzLFxuICAvLyBlLmcuIDx0ZW1wbGF0ZT4sIDxzbG90Piwgdi1mb3IsIG9yIHdoZW4gdGhlIGNoaWxkcmVuIGlzIHByb3ZpZGVkIGJ5IHVzZXJcbiAgLy8gd2l0aCBoYW5kLXdyaXR0ZW4gcmVuZGVyIGZ1bmN0aW9ucyAvIEpTWC4gSW4gc3VjaCBjYXNlcyBhIGZ1bGwgbm9ybWFsaXphdGlvblxuICAvLyBpcyBuZWVkZWQgdG8gY2F0ZXIgdG8gYWxsIHBvc3NpYmxlIHR5cGVzIG9mIGNoaWxkcmVuIHZhbHVlcy5cbiAgZnVuY3Rpb24gbm9ybWFsaXplQ2hpbGRyZW4gKGNoaWxkcmVuKSB7XG4gICAgcmV0dXJuIGlzUHJpbWl0aXZlKGNoaWxkcmVuKVxuICAgICAgPyBbY3JlYXRlVGV4dFZOb2RlKGNoaWxkcmVuKV1cbiAgICAgIDogQXJyYXkuaXNBcnJheShjaGlsZHJlbilcbiAgICAgICAgPyBub3JtYWxpemVBcnJheUNoaWxkcmVuKGNoaWxkcmVuKVxuICAgICAgICA6IHVuZGVmaW5lZFxuICB9XG5cbiAgZnVuY3Rpb24gaXNUZXh0Tm9kZSAobm9kZSkge1xuICAgIHJldHVybiBpc0RlZihub2RlKSAmJiBpc0RlZihub2RlLnRleHQpICYmIGlzRmFsc2Uobm9kZS5pc0NvbW1lbnQpXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVBcnJheUNoaWxkcmVuIChjaGlsZHJlbiwgbmVzdGVkSW5kZXgpIHtcbiAgICB2YXIgcmVzID0gW107XG4gICAgdmFyIGksIGMsIGxhc3RJbmRleCwgbGFzdDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGMgPSBjaGlsZHJlbltpXTtcbiAgICAgIGlmIChpc1VuZGVmKGMpIHx8IHR5cGVvZiBjID09PSAnYm9vbGVhbicpIHsgY29udGludWUgfVxuICAgICAgbGFzdEluZGV4ID0gcmVzLmxlbmd0aCAtIDE7XG4gICAgICBsYXN0ID0gcmVzW2xhc3RJbmRleF07XG4gICAgICAvLyAgbmVzdGVkXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShjKSkge1xuICAgICAgICBpZiAoYy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgYyA9IG5vcm1hbGl6ZUFycmF5Q2hpbGRyZW4oYywgKChuZXN0ZWRJbmRleCB8fCAnJykgKyBcIl9cIiArIGkpKTtcbiAgICAgICAgICAvLyBtZXJnZSBhZGphY2VudCB0ZXh0IG5vZGVzXG4gICAgICAgICAgaWYgKGlzVGV4dE5vZGUoY1swXSkgJiYgaXNUZXh0Tm9kZShsYXN0KSkge1xuICAgICAgICAgICAgcmVzW2xhc3RJbmRleF0gPSBjcmVhdGVUZXh0Vk5vZGUobGFzdC50ZXh0ICsgKGNbMF0pLnRleHQpO1xuICAgICAgICAgICAgYy5zaGlmdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXMucHVzaC5hcHBseShyZXMsIGMpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGlzUHJpbWl0aXZlKGMpKSB7XG4gICAgICAgIGlmIChpc1RleHROb2RlKGxhc3QpKSB7XG4gICAgICAgICAgLy8gbWVyZ2UgYWRqYWNlbnQgdGV4dCBub2Rlc1xuICAgICAgICAgIC8vIHRoaXMgaXMgbmVjZXNzYXJ5IGZvciBTU1IgaHlkcmF0aW9uIGJlY2F1c2UgdGV4dCBub2RlcyBhcmVcbiAgICAgICAgICAvLyBlc3NlbnRpYWxseSBtZXJnZWQgd2hlbiByZW5kZXJlZCB0byBIVE1MIHN0cmluZ3NcbiAgICAgICAgICByZXNbbGFzdEluZGV4XSA9IGNyZWF0ZVRleHRWTm9kZShsYXN0LnRleHQgKyBjKTtcbiAgICAgICAgfSBlbHNlIGlmIChjICE9PSAnJykge1xuICAgICAgICAgIC8vIGNvbnZlcnQgcHJpbWl0aXZlIHRvIHZub2RlXG4gICAgICAgICAgcmVzLnB1c2goY3JlYXRlVGV4dFZOb2RlKGMpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGlzVGV4dE5vZGUoYykgJiYgaXNUZXh0Tm9kZShsYXN0KSkge1xuICAgICAgICAgIC8vIG1lcmdlIGFkamFjZW50IHRleHQgbm9kZXNcbiAgICAgICAgICByZXNbbGFzdEluZGV4XSA9IGNyZWF0ZVRleHRWTm9kZShsYXN0LnRleHQgKyBjLnRleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGRlZmF1bHQga2V5IGZvciBuZXN0ZWQgYXJyYXkgY2hpbGRyZW4gKGxpa2VseSBnZW5lcmF0ZWQgYnkgdi1mb3IpXG4gICAgICAgICAgaWYgKGlzVHJ1ZShjaGlsZHJlbi5faXNWTGlzdCkgJiZcbiAgICAgICAgICAgIGlzRGVmKGMudGFnKSAmJlxuICAgICAgICAgICAgaXNVbmRlZihjLmtleSkgJiZcbiAgICAgICAgICAgIGlzRGVmKG5lc3RlZEluZGV4KSkge1xuICAgICAgICAgICAgYy5rZXkgPSBcIl9fdmxpc3RcIiArIG5lc3RlZEluZGV4ICsgXCJfXCIgKyBpICsgXCJfX1wiO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXMucHVzaChjKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvKiAgKi9cblxuICBmdW5jdGlvbiBpbml0UHJvdmlkZSAodm0pIHtcbiAgICB2YXIgcHJvdmlkZSA9IHZtLiRvcHRpb25zLnByb3ZpZGU7XG4gICAgaWYgKHByb3ZpZGUpIHtcbiAgICAgIHZtLl9wcm92aWRlZCA9IHR5cGVvZiBwcm92aWRlID09PSAnZnVuY3Rpb24nXG4gICAgICAgID8gcHJvdmlkZS5jYWxsKHZtKVxuICAgICAgICA6IHByb3ZpZGU7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5pdEluamVjdGlvbnMgKHZtKSB7XG4gICAgdmFyIHJlc3VsdCA9IHJlc29sdmVJbmplY3Qodm0uJG9wdGlvbnMuaW5qZWN0LCB2bSk7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgdG9nZ2xlT2JzZXJ2aW5nKGZhbHNlKTtcbiAgICAgIE9iamVjdC5rZXlzKHJlc3VsdCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICAgIHtcbiAgICAgICAgICBkZWZpbmVSZWFjdGl2ZSQkMSh2bSwga2V5LCByZXN1bHRba2V5XSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgd2FybihcbiAgICAgICAgICAgICAgXCJBdm9pZCBtdXRhdGluZyBhbiBpbmplY3RlZCB2YWx1ZSBkaXJlY3RseSBzaW5jZSB0aGUgY2hhbmdlcyB3aWxsIGJlIFwiICtcbiAgICAgICAgICAgICAgXCJvdmVyd3JpdHRlbiB3aGVuZXZlciB0aGUgcHJvdmlkZWQgY29tcG9uZW50IHJlLXJlbmRlcnMuIFwiICtcbiAgICAgICAgICAgICAgXCJpbmplY3Rpb24gYmVpbmcgbXV0YXRlZDogXFxcIlwiICsga2V5ICsgXCJcXFwiXCIsXG4gICAgICAgICAgICAgIHZtXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRvZ2dsZU9ic2VydmluZyh0cnVlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZXNvbHZlSW5qZWN0IChpbmplY3QsIHZtKSB7XG4gICAgaWYgKGluamVjdCkge1xuICAgICAgLy8gaW5qZWN0IGlzIDphbnkgYmVjYXVzZSBmbG93IGlzIG5vdCBzbWFydCBlbm91Z2ggdG8gZmlndXJlIG91dCBjYWNoZWRcbiAgICAgIHZhciByZXN1bHQgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgdmFyIGtleXMgPSBoYXNTeW1ib2xcbiAgICAgICAgPyBSZWZsZWN0Lm93bktleXMoaW5qZWN0KVxuICAgICAgICA6IE9iamVjdC5rZXlzKGluamVjdCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgLy8gIzY1NzQgaW4gY2FzZSB0aGUgaW5qZWN0IG9iamVjdCBpcyBvYnNlcnZlZC4uLlxuICAgICAgICBpZiAoa2V5ID09PSAnX19vYl9fJykgeyBjb250aW51ZSB9XG4gICAgICAgIHZhciBwcm92aWRlS2V5ID0gaW5qZWN0W2tleV0uZnJvbTtcbiAgICAgICAgdmFyIHNvdXJjZSA9IHZtO1xuICAgICAgICB3aGlsZSAoc291cmNlKSB7XG4gICAgICAgICAgaWYgKHNvdXJjZS5fcHJvdmlkZWQgJiYgaGFzT3duKHNvdXJjZS5fcHJvdmlkZWQsIHByb3ZpZGVLZXkpKSB7XG4gICAgICAgICAgICByZXN1bHRba2V5XSA9IHNvdXJjZS5fcHJvdmlkZWRbcHJvdmlkZUtleV07XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgICBzb3VyY2UgPSBzb3VyY2UuJHBhcmVudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXNvdXJjZSkge1xuICAgICAgICAgIGlmICgnZGVmYXVsdCcgaW4gaW5qZWN0W2tleV0pIHtcbiAgICAgICAgICAgIHZhciBwcm92aWRlRGVmYXVsdCA9IGluamVjdFtrZXldLmRlZmF1bHQ7XG4gICAgICAgICAgICByZXN1bHRba2V5XSA9IHR5cGVvZiBwcm92aWRlRGVmYXVsdCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICA/IHByb3ZpZGVEZWZhdWx0LmNhbGwodm0pXG4gICAgICAgICAgICAgIDogcHJvdmlkZURlZmF1bHQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdhcm4oKFwiSW5qZWN0aW9uIFxcXCJcIiArIGtleSArIFwiXFxcIiBub3QgZm91bmRcIiksIHZtKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG4gIH1cblxuICAvKiAgKi9cblxuXG5cbiAgLyoqXG4gICAqIFJ1bnRpbWUgaGVscGVyIGZvciByZXNvbHZpbmcgcmF3IGNoaWxkcmVuIFZOb2RlcyBpbnRvIGEgc2xvdCBvYmplY3QuXG4gICAqL1xuICBmdW5jdGlvbiByZXNvbHZlU2xvdHMgKFxuICAgIGNoaWxkcmVuLFxuICAgIGNvbnRleHRcbiAgKSB7XG4gICAgaWYgKCFjaGlsZHJlbiB8fCAhY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICByZXR1cm4ge31cbiAgICB9XG4gICAgdmFyIHNsb3RzID0ge307XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgICAgdmFyIGRhdGEgPSBjaGlsZC5kYXRhO1xuICAgICAgLy8gcmVtb3ZlIHNsb3QgYXR0cmlidXRlIGlmIHRoZSBub2RlIGlzIHJlc29sdmVkIGFzIGEgVnVlIHNsb3Qgbm9kZVxuICAgICAgaWYgKGRhdGEgJiYgZGF0YS5hdHRycyAmJiBkYXRhLmF0dHJzLnNsb3QpIHtcbiAgICAgICAgZGVsZXRlIGRhdGEuYXR0cnMuc2xvdDtcbiAgICAgIH1cbiAgICAgIC8vIG5hbWVkIHNsb3RzIHNob3VsZCBvbmx5IGJlIHJlc3BlY3RlZCBpZiB0aGUgdm5vZGUgd2FzIHJlbmRlcmVkIGluIHRoZVxuICAgICAgLy8gc2FtZSBjb250ZXh0LlxuICAgICAgaWYgKChjaGlsZC5jb250ZXh0ID09PSBjb250ZXh0IHx8IGNoaWxkLmZuQ29udGV4dCA9PT0gY29udGV4dCkgJiZcbiAgICAgICAgZGF0YSAmJiBkYXRhLnNsb3QgIT0gbnVsbFxuICAgICAgKSB7XG4gICAgICAgIHZhciBuYW1lID0gZGF0YS5zbG90O1xuICAgICAgICB2YXIgc2xvdCA9IChzbG90c1tuYW1lXSB8fCAoc2xvdHNbbmFtZV0gPSBbXSkpO1xuICAgICAgICBpZiAoY2hpbGQudGFnID09PSAndGVtcGxhdGUnKSB7XG4gICAgICAgICAgc2xvdC5wdXNoLmFwcGx5KHNsb3QsIGNoaWxkLmNoaWxkcmVuIHx8IFtdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzbG90LnB1c2goY2hpbGQpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAoc2xvdHMuZGVmYXVsdCB8fCAoc2xvdHMuZGVmYXVsdCA9IFtdKSkucHVzaChjaGlsZCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIGlnbm9yZSBzbG90cyB0aGF0IGNvbnRhaW5zIG9ubHkgd2hpdGVzcGFjZVxuICAgIGZvciAodmFyIG5hbWUkMSBpbiBzbG90cykge1xuICAgICAgaWYgKHNsb3RzW25hbWUkMV0uZXZlcnkoaXNXaGl0ZXNwYWNlKSkge1xuICAgICAgICBkZWxldGUgc2xvdHNbbmFtZSQxXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNsb3RzXG4gIH1cblxuICBmdW5jdGlvbiBpc1doaXRlc3BhY2UgKG5vZGUpIHtcbiAgICByZXR1cm4gKG5vZGUuaXNDb21tZW50ICYmICFub2RlLmFzeW5jRmFjdG9yeSkgfHwgbm9kZS50ZXh0ID09PSAnICdcbiAgfVxuXG4gIC8qICAqL1xuXG4gIGZ1bmN0aW9uIGlzQXN5bmNQbGFjZWhvbGRlciAobm9kZSkge1xuICAgIHJldHVybiBub2RlLmlzQ29tbWVudCAmJiBub2RlLmFzeW5jRmFjdG9yeVxuICB9XG5cbiAgLyogICovXG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplU2NvcGVkU2xvdHMgKFxuICAgIHNsb3RzLFxuICAgIG5vcm1hbFNsb3RzLFxuICAgIHByZXZTbG90c1xuICApIHtcbiAgICB2YXIgcmVzO1xuICAgIHZhciBoYXNOb3JtYWxTbG90cyA9IE9iamVjdC5rZXlzKG5vcm1hbFNsb3RzKS5sZW5ndGggPiAwO1xuICAgIHZhciBpc1N0YWJsZSA9IHNsb3RzID8gISFzbG90cy4kc3RhYmxlIDogIWhhc05vcm1hbFNsb3RzO1xuICAgIHZhciBrZXkgPSBzbG90cyAmJiBzbG90cy4ka2V5O1xuICAgIGlmICghc2xvdHMpIHtcbiAgICAgIHJlcyA9IHt9O1xuICAgIH0gZWxzZSBpZiAoc2xvdHMuX25vcm1hbGl6ZWQpIHtcbiAgICAgIC8vIGZhc3QgcGF0aCAxOiBjaGlsZCBjb21wb25lbnQgcmUtcmVuZGVyIG9ubHksIHBhcmVudCBkaWQgbm90IGNoYW5nZVxuICAgICAgcmV0dXJuIHNsb3RzLl9ub3JtYWxpemVkXG4gICAgfSBlbHNlIGlmIChcbiAgICAgIGlzU3RhYmxlICYmXG4gICAgICBwcmV2U2xvdHMgJiZcbiAgICAgIHByZXZTbG90cyAhPT0gZW1wdHlPYmplY3QgJiZcbiAgICAgIGtleSA9PT0gcHJldlNsb3RzLiRrZXkgJiZcbiAgICAgICFoYXNOb3JtYWxTbG90cyAmJlxuICAgICAgIXByZXZTbG90cy4kaGFzTm9ybWFsXG4gICAgKSB7XG4gICAgICAvLyBmYXN0IHBhdGggMjogc3RhYmxlIHNjb3BlZCBzbG90cyB3LyBubyBub3JtYWwgc2xvdHMgdG8gcHJveHksXG4gICAgICAvLyBvbmx5IG5lZWQgdG8gbm9ybWFsaXplIG9uY2VcbiAgICAgIHJldHVybiBwcmV2U2xvdHNcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzID0ge307XG4gICAgICBmb3IgKHZhciBrZXkkMSBpbiBzbG90cykge1xuICAgICAgICBpZiAoc2xvdHNba2V5JDFdICYmIGtleSQxWzBdICE9PSAnJCcpIHtcbiAgICAgICAgICByZXNba2V5JDFdID0gbm9ybWFsaXplU2NvcGVkU2xvdChub3JtYWxTbG90cywga2V5JDEsIHNsb3RzW2tleSQxXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gZXhwb3NlIG5vcm1hbCBzbG90cyBvbiBzY29wZWRTbG90c1xuICAgIGZvciAodmFyIGtleSQyIGluIG5vcm1hbFNsb3RzKSB7XG4gICAgICBpZiAoIShrZXkkMiBpbiByZXMpKSB7XG4gICAgICAgIHJlc1trZXkkMl0gPSBwcm94eU5vcm1hbFNsb3Qobm9ybWFsU2xvdHMsIGtleSQyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gYXZvcmlheiBzZWVtcyB0byBtb2NrIGEgbm9uLWV4dGVuc2libGUgJHNjb3BlZFNsb3RzIG9iamVjdFxuICAgIC8vIGFuZCB3aGVuIHRoYXQgaXMgcGFzc2VkIGRvd24gdGhpcyB3b3VsZCBjYXVzZSBhbiBlcnJvclxuICAgIGlmIChzbG90cyAmJiBPYmplY3QuaXNFeHRlbnNpYmxlKHNsb3RzKSkge1xuICAgICAgKHNsb3RzKS5fbm9ybWFsaXplZCA9IHJlcztcbiAgICB9XG4gICAgZGVmKHJlcywgJyRzdGFibGUnLCBpc1N0YWJsZSk7XG4gICAgZGVmKHJlcywgJyRrZXknLCBrZXkpO1xuICAgIGRlZihyZXMsICckaGFzTm9ybWFsJywgaGFzTm9ybWFsU2xvdHMpO1xuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVNjb3BlZFNsb3Qobm9ybWFsU2xvdHMsIGtleSwgZm4pIHtcbiAgICB2YXIgbm9ybWFsaXplZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciByZXMgPSBhcmd1bWVudHMubGVuZ3RoID8gZm4uYXBwbHkobnVsbCwgYXJndW1lbnRzKSA6IGZuKHt9KTtcbiAgICAgIHJlcyA9IHJlcyAmJiB0eXBlb2YgcmVzID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShyZXMpXG4gICAgICAgID8gW3Jlc10gLy8gc2luZ2xlIHZub2RlXG4gICAgICAgIDogbm9ybWFsaXplQ2hpbGRyZW4ocmVzKTtcbiAgICAgIHZhciB2bm9kZSA9IHJlcyAmJiByZXNbMF07XG4gICAgICByZXR1cm4gcmVzICYmIChcbiAgICAgICAgIXZub2RlIHx8XG4gICAgICAgIChyZXMubGVuZ3RoID09PSAxICYmIHZub2RlLmlzQ29tbWVudCAmJiAhaXNBc3luY1BsYWNlaG9sZGVyKHZub2RlKSkgLy8gIzk2NTgsICMxMDM5MVxuICAgICAgKSA/IHVuZGVmaW5lZFxuICAgICAgICA6IHJlc1xuICAgIH07XG4gICAgLy8gdGhpcyBpcyBhIHNsb3QgdXNpbmcgdGhlIG5ldyB2LXNsb3Qgc3ludGF4IHdpdGhvdXQgc2NvcGUuIGFsdGhvdWdoIGl0IGlzXG4gICAgLy8gY29tcGlsZWQgYXMgYSBzY29wZWQgc2xvdCwgcmVuZGVyIGZuIHVzZXJzIHdvdWxkIGV4cGVjdCBpdCB0byBiZSBwcmVzZW50XG4gICAgLy8gb24gdGhpcy4kc2xvdHMgYmVjYXVzZSB0aGUgdXNhZ2UgaXMgc2VtYW50aWNhbGx5IGEgbm9ybWFsIHNsb3QuXG4gICAgaWYgKGZuLnByb3h5KSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobm9ybWFsU2xvdHMsIGtleSwge1xuICAgICAgICBnZXQ6IG5vcm1hbGl6ZWQsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBub3JtYWxpemVkXG4gIH1cblxuICBmdW5jdGlvbiBwcm94eU5vcm1hbFNsb3Qoc2xvdHMsIGtleSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7IHJldHVybiBzbG90c1trZXldOyB9XG4gIH1cblxuICAvKiAgKi9cblxuICAvKipcbiAgICogUnVudGltZSBoZWxwZXIgZm9yIHJlbmRlcmluZyB2LWZvciBsaXN0cy5cbiAgICovXG4gIGZ1bmN0aW9uIHJlbmRlckxpc3QgKFxuICAgIHZhbCxcbiAgICByZW5kZXJcbiAgKSB7XG4gICAgdmFyIHJldCwgaSwgbCwga2V5cywga2V5O1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbCkgfHwgdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldCA9IG5ldyBBcnJheSh2YWwubGVuZ3RoKTtcbiAgICAgIGZvciAoaSA9IDAsIGwgPSB2YWwubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHJldFtpXSA9IHJlbmRlcih2YWxbaV0sIGkpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICAgIHJldCA9IG5ldyBBcnJheSh2YWwpO1xuICAgICAgZm9yIChpID0gMDsgaSA8IHZhbDsgaSsrKSB7XG4gICAgICAgIHJldFtpXSA9IHJlbmRlcihpICsgMSwgaSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc09iamVjdCh2YWwpKSB7XG4gICAgICBpZiAoaGFzU3ltYm9sICYmIHZhbFtTeW1ib2wuaXRlcmF0b3JdKSB7XG4gICAgICAgIHJldCA9IFtdO1xuICAgICAgICB2YXIgaXRlcmF0b3IgPSB2YWxbU3ltYm9sLml0ZXJhdG9yXSgpO1xuICAgICAgICB2YXIgcmVzdWx0ID0gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICB3aGlsZSAoIXJlc3VsdC5kb25lKSB7XG4gICAgICAgICAgcmV0LnB1c2gocmVuZGVyKHJlc3VsdC52YWx1ZSwgcmV0Lmxlbmd0aCkpO1xuICAgICAgICAgIHJlc3VsdCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAga2V5cyA9IE9iamVjdC5rZXlzKHZhbCk7XG4gICAgICAgIHJldCA9IG5ldyBBcnJheShrZXlzLmxlbmd0aCk7XG4gICAgICAgIGZvciAoaSA9IDAsIGwgPSBrZXlzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgcmV0W2ldID0gcmVuZGVyKHZhbFtrZXldLCBrZXksIGkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghaXNEZWYocmV0KSkge1xuICAgICAgcmV0ID0gW107XG4gICAgfVxuICAgIChyZXQpLl9pc1ZMaXN0ID0gdHJ1ZTtcbiAgICByZXR1cm4gcmV0XG4gIH1cblxuICAvKiAgKi9cblxuICAvKipcbiAgICogUnVudGltZSBoZWxwZXIgZm9yIHJlbmRlcmluZyA8c2xvdD5cbiAgICovXG4gIGZ1bmN0aW9uIHJlbmRlclNsb3QgKFxuICAgIG5hbWUsXG4gICAgZmFsbGJhY2tSZW5kZXIsXG4gICAgcHJvcHMsXG4gICAgYmluZE9iamVjdFxuICApIHtcbiAgICB2YXIgc2NvcGVkU2xvdEZuID0gdGhpcy4kc2NvcGVkU2xvdHNbbmFtZV07XG4gICAgdmFyIG5vZGVzO1xuICAgIGlmIChzY29wZWRTbG90Rm4pIHtcbiAgICAgIC8vIHNjb3BlZCBzbG90XG4gICAgICBwcm9wcyA9IHByb3BzIHx8IHt9O1xuICAgICAgaWYgKGJpbmRPYmplY3QpIHtcbiAgICAgICAgaWYgKCFpc09iamVjdChiaW5kT2JqZWN0KSkge1xuICAgICAgICAgIHdhcm4oJ3Nsb3Qgdi1iaW5kIHdpdGhvdXQgYXJndW1lbnQgZXhwZWN0cyBhbiBPYmplY3QnLCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBwcm9wcyA9IGV4dGVuZChleHRlbmQoe30sIGJpbmRPYmplY3QpLCBwcm9wcyk7XG4gICAgICB9XG4gICAgICBub2RlcyA9XG4gICAgICAgIHNjb3BlZFNsb3RGbihwcm9wcykgfHxcbiAgICAgICAgKHR5cGVvZiBmYWxsYmFja1JlbmRlciA9PT0gJ2Z1bmN0aW9uJyA/IGZhbGxiYWNrUmVuZGVyKCkgOiBmYWxsYmFja1JlbmRlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGVzID1cbiAgICAgICAgdGhpcy4kc2xvdHNbbmFtZV0gfHxcbiAgICAgICAgKHR5cGVvZiBmYWxsYmFja1JlbmRlciA9PT0gJ2Z1bmN0aW9uJyA/IGZhbGxiYWNrUmVuZGVyKCkgOiBmYWxsYmFja1JlbmRlcik7XG4gICAgfVxuXG4gICAgdmFyIHRhcmdldCA9IHByb3BzICYmIHByb3BzLnNsb3Q7XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJywgeyBzbG90OiB0YXJnZXQgfSwgbm9kZXMpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBub2Rlc1xuICAgIH1cbiAgfVxuXG4gIC8qICAqL1xuXG4gIC8qKlxuICAgKiBSdW50aW1lIGhlbHBlciBmb3IgcmVzb2x2aW5nIGZpbHRlcnNcbiAgICovXG4gIGZ1bmN0aW9uIHJlc29sdmVGaWx0ZXIgKGlkKSB7XG4gICAgcmV0dXJuIHJlc29sdmVBc3NldCh0aGlzLiRvcHRpb25zLCAnZmlsdGVycycsIGlkLCB0cnVlKSB8fCBpZGVudGl0eVxuICB9XG5cbiAgLyogICovXG5cbiAgZnVuY3Rpb24gaXNLZXlOb3RNYXRjaCAoZXhwZWN0LCBhY3R1YWwpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShleHBlY3QpKSB7XG4gICAgICByZXR1cm4gZXhwZWN0LmluZGV4T2YoYWN0dWFsKSA9PT0gLTFcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGV4cGVjdCAhPT0gYWN0dWFsXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnRpbWUgaGVscGVyIGZvciBjaGVja2luZyBrZXlDb2RlcyBmcm9tIGNvbmZpZy5cbiAgICogZXhwb3NlZCBhcyBWdWUucHJvdG90eXBlLl9rXG4gICAqIHBhc3NpbmcgaW4gZXZlbnRLZXlOYW1lIGFzIGxhc3QgYXJndW1lbnQgc2VwYXJhdGVseSBmb3IgYmFja3dhcmRzIGNvbXBhdFxuICAgKi9cbiAgZnVuY3Rpb24gY2hlY2tLZXlDb2RlcyAoXG4gICAgZXZlbnRLZXlDb2RlLFxuICAgIGtleSxcbiAgICBidWlsdEluS2V5Q29kZSxcbiAgICBldmVudEtleU5hbWUsXG4gICAgYnVpbHRJbktleU5hbWVcbiAgKSB7XG4gICAgdmFyIG1hcHBlZEtleUNvZGUgPSBjb25maWcua2V5Q29kZXNba2V5XSB8fCBidWlsdEluS2V5Q29kZTtcbiAgICBpZiAoYnVpbHRJbktleU5hbWUgJiYgZXZlbnRLZXlOYW1lICYmICFjb25maWcua2V5Q29kZXNba2V5XSkge1xuICAgICAgcmV0dXJuIGlzS2V5Tm90TWF0Y2goYnVpbHRJbktleU5hbWUsIGV2ZW50S2V5TmFtZSlcbiAgICB9IGVsc2UgaWYgKG1hcHBlZEtleUNvZGUpIHtcbiAgICAgIHJldHVybiBpc0tleU5vdE1hdGNoKG1hcHBlZEtleUNvZGUsIGV2ZW50S2V5Q29kZSlcbiAgICB9IGVsc2UgaWYgKGV2ZW50S2V5TmFtZSkge1xuICAgICAgcmV0dXJuIGh5cGhlbmF0ZShldmVudEtleU5hbWUpICE9PSBrZXlcbiAgICB9XG4gICAgcmV0dXJuIGV2ZW50S2V5Q29kZSA9PT0gdW5kZWZpbmVkXG4gIH1cblxuICAvKiAgKi9cblxuICAvKipcbiAgICogUnVudGltZSBoZWxwZXIgZm9yIG1lcmdpbmcgdi1iaW5kPVwib2JqZWN0XCIgaW50byBhIFZOb2RlJ3MgZGF0YS5cbiAgICovXG4gIGZ1bmN0aW9uIGJpbmRPYmplY3RQcm9wcyAoXG4gICAgZGF0YSxcbiAgICB0YWcsXG4gICAgdmFsdWUsXG4gICAgYXNQcm9wLFxuICAgIGlzU3luY1xuICApIHtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIGlmICghaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICAgIHdhcm4oXG4gICAgICAgICAgJ3YtYmluZCB3aXRob3V0IGFyZ3VtZW50IGV4cGVjdHMgYW4gT2JqZWN0IG9yIEFycmF5IHZhbHVlJyxcbiAgICAgICAgICB0aGlzXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICB2YWx1ZSA9IHRvT2JqZWN0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaGFzaDtcbiAgICAgICAgdmFyIGxvb3AgPSBmdW5jdGlvbiAoIGtleSApIHtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBrZXkgPT09ICdjbGFzcycgfHxcbiAgICAgICAgICAgIGtleSA9PT0gJ3N0eWxlJyB8fFxuICAgICAgICAgICAgaXNSZXNlcnZlZEF0dHJpYnV0ZShrZXkpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBoYXNoID0gZGF0YTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHR5cGUgPSBkYXRhLmF0dHJzICYmIGRhdGEuYXR0cnMudHlwZTtcbiAgICAgICAgICAgIGhhc2ggPSBhc1Byb3AgfHwgY29uZmlnLm11c3RVc2VQcm9wKHRhZywgdHlwZSwga2V5KVxuICAgICAgICAgICAgICA/IGRhdGEuZG9tUHJvcHMgfHwgKGRhdGEuZG9tUHJvcHMgPSB7fSlcbiAgICAgICAgICAgICAgOiBkYXRhLmF0dHJzIHx8IChkYXRhLmF0dHJzID0ge30pO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgY2FtZWxpemVkS2V5ID0gY2FtZWxpemUoa2V5KTtcbiAgICAgICAgICB2YXIgaHlwaGVuYXRlZEtleSA9IGh5cGhlbmF0ZShrZXkpO1xuICAgICAgICAgIGlmICghKGNhbWVsaXplZEtleSBpbiBoYXNoKSAmJiAhKGh5cGhlbmF0ZWRLZXkgaW4gaGFzaCkpIHtcbiAgICAgICAgICAgIGhhc2hba2V5XSA9IHZhbHVlW2tleV07XG5cbiAgICAgICAgICAgIGlmIChpc1N5bmMpIHtcbiAgICAgICAgICAgICAgdmFyIG9uID0gZGF0YS5vbiB8fCAoZGF0YS5vbiA9IHt9KTtcbiAgICAgICAgICAgICAgb25bKFwidXBkYXRlOlwiICsga2V5KV0gPSBmdW5jdGlvbiAoJGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdmFsdWVba2V5XSA9ICRldmVudDtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHZhbHVlKSBsb29wKCBrZXkgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRhdGFcbiAgfVxuXG4gIC8qICAqL1xuXG4gIC8qKlxuICAgKiBSdW50aW1lIGhlbHBlciBmb3IgcmVuZGVyaW5nIHN0YXRpYyB0cmVlcy5cbiAgICovXG4gIGZ1bmN0aW9uIHJlbmRlclN0YXRpYyAoXG4gICAgaW5kZXgsXG4gICAgaXNJbkZvclxuICApIHtcbiAgICB2YXIgY2FjaGVkID0gdGhpcy5fc3RhdGljVHJlZXMgfHwgKHRoaXMuX3N0YXRpY1RyZWVzID0gW10pO1xuICAgIHZhciB0cmVlID0gY2FjaGVkW2luZGV4XTtcbiAgICAvLyBpZiBoYXMgYWxyZWFkeS1yZW5kZXJlZCBzdGF0aWMgdHJlZSBhbmQgbm90IGluc2lkZSB2LWZvcixcbiAgICAvLyB3ZSBjYW4gcmV1c2UgdGhlIHNhbWUgdHJlZS5cbiAgICBpZiAodHJlZSAmJiAhaXNJbkZvcikge1xuICAgICAgcmV0dXJuIHRyZWVcbiAgICB9XG4gICAgLy8gb3RoZXJ3aXNlLCByZW5kZXIgYSBmcmVzaCB0cmVlLlxuICAgIHRyZWUgPSBjYWNoZWRbaW5kZXhdID0gdGhpcy4kb3B0aW9ucy5zdGF0aWNSZW5kZXJGbnNbaW5kZXhdLmNhbGwoXG4gICAgICB0aGlzLl9yZW5kZXJQcm94eSxcbiAgICAgIG51bGwsXG4gICAgICB0aGlzIC8vIGZvciByZW5kZXIgZm5zIGdlbmVyYXRlZCBmb3IgZnVuY3Rpb25hbCBjb21wb25lbnQgdGVtcGxhdGVzXG4gICAgKTtcbiAgICBtYXJrU3RhdGljKHRyZWUsIChcIl9fc3RhdGljX19cIiArIGluZGV4KSwgZmFsc2UpO1xuICAgIHJldHVybiB0cmVlXG4gIH1cblxuICAvKipcbiAgICogUnVudGltZSBoZWxwZXIgZm9yIHYtb25jZS5cbiAgICogRWZmZWN0aXZlbHkgaXQgbWVhbnMgbWFya2luZyB0aGUgbm9kZSBhcyBzdGF0aWMgd2l0aCBhIHVuaXF1ZSBrZXkuXG4gICAqL1xuICBmdW5jdGlvbiBtYXJrT25jZSAoXG4gICAgdHJlZSxcbiAgICBpbmRleCxcbiAgICBrZXlcbiAgKSB7XG4gICAgbWFya1N0YXRpYyh0cmVlLCAoXCJfX29uY2VfX1wiICsgaW5kZXggKyAoa2V5ID8gKFwiX1wiICsga2V5KSA6IFwiXCIpKSwgdHJ1ZSk7XG4gICAgcmV0dXJuIHRyZWVcbiAgfVxuXG4gIGZ1bmN0aW9uIG1hcmtTdGF0aWMgKFxuICAgIHRyZWUsXG4gICAga2V5LFxuICAgIGlzT25jZVxuICApIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0cmVlKSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0cmVlW2ldICYmIHR5cGVvZiB0cmVlW2ldICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIG1hcmtTdGF0aWNOb2RlKHRyZWVbaV0sIChrZXkgKyBcIl9cIiArIGkpLCBpc09uY2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcmtTdGF0aWNOb2RlKHRyZWUsIGtleSwgaXNPbmNlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtYXJrU3RhdGljTm9kZSAobm9kZSwga2V5LCBpc09uY2UpIHtcbiAgICBub2RlLmlzU3RhdGljID0gdHJ1ZTtcbiAgICBub2RlLmtleSA9IGtleTtcbiAgICBub2RlLmlzT25jZSA9IGlzT25jZTtcbiAgfVxuXG4gIC8qICAqL1xuXG4gIGZ1bmN0aW9uIGJpbmRPYmplY3RMaXN0ZW5lcnMgKGRhdGEsIHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICBpZiAoIWlzUGxhaW5PYmplY3QodmFsdWUpKSB7XG4gICAgICAgIHdhcm4oXG4gICAgICAgICAgJ3Ytb24gd2l0aG91dCBhcmd1bWVudCBleHBlY3RzIGFuIE9iamVjdCB2YWx1ZScsXG4gICAgICAgICAgdGhpc1xuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG9uID0gZGF0YS5vbiA9IGRhdGEub24gPyBleHRlbmQoe30sIGRhdGEub24pIDoge307XG4gICAgICAgIGZvciAodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgICAgICAgIHZhciBleGlzdGluZyA9IG9uW2tleV07XG4gICAgICAgICAgdmFyIG91cnMgPSB2YWx1ZVtrZXldO1xuICAgICAgICAgIG9uW2tleV0gPSBleGlzdGluZyA/IFtdLmNvbmNhdChleGlzdGluZywgb3VycykgOiBvdXJzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkYXRhXG4gIH1cblxuICAvKiAgKi9cblxuICBmdW5jdGlvbiByZXNvbHZlU2NvcGVkU2xvdHMgKFxuICAgIGZucywgLy8gc2VlIGZsb3cvdm5vZGVcbiAgICByZXMsXG4gICAgLy8gdGhlIGZvbGxvd2luZyBhcmUgYWRkZWQgaW4gMi42XG4gICAgaGFzRHluYW1pY0tleXMsXG4gICAgY29udGVudEhhc2hLZXlcbiAgKSB7XG4gICAgcmVzID0gcmVzIHx8IHsgJHN0YWJsZTogIWhhc0R5bmFtaWNLZXlzIH07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzbG90ID0gZm5zW2ldO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoc2xvdCkpIHtcbiAgICAgICAgcmVzb2x2ZVNjb3BlZFNsb3RzKHNsb3QsIHJlcywgaGFzRHluYW1pY0tleXMpO1xuICAgICAgfSBlbHNlIGlmIChzbG90KSB7XG4gICAgICAgIC8vIG1hcmtlciBmb3IgcmV2ZXJzZSBwcm94eWluZyB2LXNsb3Qgd2l0aG91dCBzY29wZSBvbiB0aGlzLiRzbG90c1xuICAgICAgICBpZiAoc2xvdC5wcm94eSkge1xuICAgICAgICAgIHNsb3QuZm4ucHJveHkgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJlc1tzbG90LmtleV0gPSBzbG90LmZuO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoY29udGVudEhhc2hLZXkpIHtcbiAgICAgIChyZXMpLiRrZXkgPSBjb250ZW50SGFzaEtleTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgLyogICovXG5cbiAgZnVuY3Rpb24gYmluZER5bmFtaWNLZXlzIChiYXNlT2JqLCB2YWx1ZXMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgdmFyIGtleSA9IHZhbHVlc1tpXTtcbiAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJyAmJiBrZXkpIHtcbiAgICAgICAgYmFzZU9ialt2YWx1ZXNbaV1dID0gdmFsdWVzW2kgKyAxXTtcbiAgICAgIH0gZWxzZSBpZiAoa2V5ICE9PSAnJyAmJiBrZXkgIT09IG51bGwpIHtcbiAgICAgICAgLy8gbnVsbCBpcyBhIHNwZWNpYWwgdmFsdWUgZm9yIGV4cGxpY2l0bHkgcmVtb3ZpbmcgYSBiaW5kaW5nXG4gICAgICAgIHdhcm4oXG4gICAgICAgICAgKFwiSW52YWxpZCB2YWx1ZSBmb3IgZHluYW1pYyBkaXJlY3RpdmUgYXJndW1lbnQgKGV4cGVjdGVkIHN0cmluZyBvciBudWxsKTogXCIgKyBrZXkpLFxuICAgICAgICAgIHRoaXNcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJhc2VPYmpcbiAgfVxuXG4gIC8vIGhlbHBlciB0byBkeW5hbWljYWxseSBhcHBlbmQgbW9kaWZpZXIgcnVudGltZSBtYXJrZXJzIHRvIGV2ZW50IG5hbWVzLlxuICAvLyBlbnN1cmUgb25seSBhcHBlbmQgd2hlbiB2YWx1ZSBpcyBhbHJlYWR5IHN0cmluZywgb3RoZXJ3aXNlIGl0IHdpbGwgYmUgY2FzdFxuICAvLyB0byBzdHJpbmcgYW5kIGNhdXNlIHRoZSB0eXBlIGNoZWNrIHRvIG1pc3MuXG4gIGZ1bmN0aW9uIHByZXBlbmRNb2RpZmllciAodmFsdWUsIHN5bWJvbCkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gc3ltYm9sICsgdmFsdWUgOiB2YWx1ZVxuICB9XG5cbiAgLyogICovXG5cbiAgZnVuY3Rpb24gaW5zdGFsbFJlbmRlckhlbHBlcnMgKHRhcmdldCkge1xuICAgIHRhcmdldC5fbyA9IG1hcmtPbmNlO1xuICAgIHRhcmdldC5fbiA9IHRvTnVtYmVyO1xuICAgIHRhcmdldC5fcyA9IHRvU3RyaW5nO1xuICAgIHRhcmdldC5fbCA9IHJlbmRlckxpc3Q7XG4gICAgdGFyZ2V0Ll90ID0gcmVuZGVyU2xvdDtcbiAgICB0YXJnZXQuX3EgPSBsb29zZUVxdWFsO1xuICAgIHRhcmdldC5faSA9IGxvb3NlSW5kZXhPZjtcbiAgICB0YXJnZXQuX20gPSByZW5kZXJTdGF0aWM7XG4gICAgdGFyZ2V0Ll9mID0gcmVzb2x2ZUZpbHRlcjtcbiAgICB0YXJnZXQuX2sgPSBjaGVja0tleUNvZGVzO1xuICAgIHRhcmdldC5fYiA9IGJpbmRPYmplY3RQcm9wcztcbiAgICB0YXJnZXQuX3YgPSBjcmVhdGVUZXh0Vk5vZGU7XG4gICAgdGFyZ2V0Ll9lID0gY3JlYXRlRW1wdHlWTm9kZTtcbiAgICB0YXJnZXQuX3UgPSByZXNvbHZlU2NvcGVkU2xvdHM7XG4gICAgdGFyZ2V0Ll9nID0gYmluZE9iamVjdExpc3RlbmVycztcbiAgICB0YXJnZXQuX2QgPSBiaW5kRHluYW1pY0tleXM7XG4gICAgdGFyZ2V0Ll9wID0gcHJlcGVuZE1vZGlmaWVyO1xuICB9XG5cbiAgLyogICovXG5cbiAgZnVuY3Rpb24gRnVuY3Rpb25hbFJlbmRlckNvbnRleHQgKFxuICAgIGRhdGEsXG4gICAgcHJvcHMsXG4gICAgY2hpbGRyZW4sXG4gICAgcGFyZW50LFxuICAgIEN0b3JcbiAgKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICB2YXIgb3B0aW9ucyA9IEN0b3Iub3B0aW9ucztcbiAgICAvLyBlbnN1cmUgdGhlIGNyZWF0ZUVsZW1lbnQgZnVuY3Rpb24gaW4gZnVuY3Rpb25hbCBjb21wb25lbnRzXG4gICAgLy8gZ2V0cyBhIHVuaXF1ZSBjb250ZXh0IC0gdGhpcyBpcyBuZWNlc3NhcnkgZm9yIGNvcnJlY3QgbmFtZWQgc2xvdCBjaGVja1xuICAgIHZhciBjb250ZXh0Vm07XG4gICAgaWYgKGhhc093bihwYXJlbnQsICdfdWlkJykpIHtcbiAgICAgIGNvbnRleHRWbSA9IE9iamVjdC5jcmVhdGUocGFyZW50KTtcbiAgICAgIC8vICRmbG93LWRpc2FibGUtbGluZVxuICAgICAgY29udGV4dFZtLl9vcmlnaW5hbCA9IHBhcmVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gdGhlIGNvbnRleHQgdm0gcGFzc2VkIGluIGlzIGEgZnVuY3Rpb25hbCBjb250ZXh0IGFzIHdlbGwuXG4gICAgICAvLyBpbiB0aGlzIGNhc2Ugd2Ugd2FudCB0byBtYWtlIHN1cmUgd2UgYXJlIGFibGUgdG8gZ2V0IGEgaG9sZCB0byB0aGVcbiAgICAgIC8vIHJlYWwgY29udGV4dCBpbnN0YW5jZS5cbiAgICAgIGNvbnRleHRWbSA9IHBhcmVudDtcbiAgICAgIC8vICRmbG93LWRpc2FibGUtbGluZVxuICAgICAgcGFyZW50ID0gcGFyZW50Ll9vcmlnaW5hbDtcbiAgICB9XG4gICAgdmFyIGlzQ29tcGlsZWQgPSBpc1RydWUob3B0aW9ucy5fY29tcGlsZWQpO1xuICAgIHZhciBuZWVkTm9ybWFsaXphdGlvbiA9ICFpc0NvbXBpbGVkO1xuXG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB0aGlzLnByb3BzID0gcHJvcHM7XG4gICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMubGlzdGVuZXJzID0gZGF0YS5vbiB8fCBlbXB0eU9iamVjdDtcbiAgICB0aGlzLmluamVjdGlvbnMgPSByZXNvbHZlSW5qZWN0KG9wdGlvbnMuaW5qZWN0LCBwYXJlbnQpO1xuICAgIHRoaXMuc2xvdHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIXRoaXMkMS4kc2xvdHMpIHtcbiAgICAgICAgbm9ybWFsaXplU2NvcGVkU2xvdHMoXG4gICAgICAgICAgZGF0YS5zY29wZWRTbG90cyxcbiAgICAgICAgICB0aGlzJDEuJHNsb3RzID0gcmVzb2x2ZVNsb3RzKGNoaWxkcmVuLCBwYXJlbnQpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcyQxLiRzbG90c1xuICAgIH07XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3Njb3BlZFNsb3RzJywgKHtcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBnZXQ6IGZ1bmN0aW9uIGdldCAoKSB7XG4gICAgICAgIHJldHVybiBub3JtYWxpemVTY29wZWRTbG90cyhkYXRhLnNjb3BlZFNsb3RzLCB0aGlzLnNsb3RzKCkpXG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgLy8gc3VwcG9ydCBmb3IgY29tcGlsZWQgZnVuY3Rpb25hbCB0ZW1wbGF0ZVxuICAgIGlmIChpc0NvbXBpbGVkKSB7XG4gICAgICAvLyBleHBvc2luZyAkb3B0aW9ucyBmb3IgcmVuZGVyU3RhdGljKClcbiAgICAgIHRoaXMuJG9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgLy8gcHJlLXJlc29sdmUgc2xvdHMgZm9yIHJlbmRlclNsb3QoKVxuICAgICAgdGhpcy4kc2xvdHMgPSB0aGlzLnNsb3RzKCk7XG4gICAgICB0aGlzLiRzY29wZWRTbG90cyA9IG5vcm1hbGl6ZVNjb3BlZFNsb3RzKGRhdGEuc2NvcGVkU2xvdHMsIHRoaXMuJHNsb3RzKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5fc2NvcGVJZCkge1xuICAgICAgdGhpcy5fYyA9IGZ1bmN0aW9uIChhLCBiLCBjLCBkKSB7XG4gICAgICAgIHZhciB2bm9kZSA9IGNyZWF0ZUVsZW1lbnQoY29udGV4dFZtLCBhLCBiLCBjLCBkLCBuZWVkTm9ybWFsaXphdGlvbik7XG4gICAgICAgIGlmICh2bm9kZSAmJiAhQXJyYXkuaXNBcnJheSh2bm9kZSkpIHtcbiAgICAgICAgICB2bm9kZS5mblNjb3BlSWQgPSBvcHRpb25zLl9zY29wZUlkO1xuICAgICAgICAgIHZub2RlLmZuQ29udGV4dCA9IHBhcmVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdm5vZGVcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2MgPSBmdW5jdGlvbiAoYSwgYiwgYywgZCkgeyByZXR1cm4gY3JlYXRlRWxlbWVudChjb250ZXh0Vm0sIGEsIGIsIGMsIGQsIG5lZWROb3JtYWxpemF0aW9uKTsgfTtcbiAgICB9XG4gIH1cblxuICBpbnN0YWxsUmVuZGVySGVscGVycyhGdW5jdGlvbmFsUmVuZGVyQ29udGV4dC5wcm90b3R5cGUpO1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZUZ1bmN0aW9uYWxDb21wb25lbnQgKFxuICAgIEN0b3IsXG4gICAgcHJvcHNEYXRhLFxuICAgIGRhdGEsXG4gICAgY29udGV4dFZtLFxuICAgIGNoaWxkcmVuXG4gICkge1xuICAgIHZhciBvcHRpb25zID0gQ3Rvci5vcHRpb25zO1xuICAgIHZhciBwcm9wcyA9IHt9O1xuICAgIHZhciBwcm9wT3B0aW9ucyA9IG9wdGlvbnMucHJvcHM7XG4gICAgaWYgKGlzRGVmKHByb3BPcHRpb25zKSkge1xuICAgICAgZm9yICh2YXIga2V5IGluIHByb3BPcHRpb25zKSB7XG4gICAgICAgIHByb3BzW2tleV0gPSB2YWxpZGF0ZVByb3Aoa2V5LCBwcm9wT3B0aW9ucywgcHJvcHNEYXRhIHx8IGVtcHR5T2JqZWN0KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGlzRGVmKGRhdGEuYXR0cnMpKSB7IG1lcmdlUHJvcHMocHJvcHMsIGRhdGEuYXR0cnMpOyB9XG4gICAgICBpZiAoaXNEZWYoZGF0YS5wcm9wcykpIHsgbWVyZ2VQcm9wcyhwcm9wcywgZGF0YS5wcm9wcyk7IH1cbiAgICB9XG5cbiAgICB2YXIgcmVuZGVyQ29udGV4dCA9IG5ldyBGdW5jdGlvbmFsUmVuZGVyQ29udGV4dChcbiAgICAgIGRhdGEsXG4gICAgICBwcm9wcyxcbiAgICAgIGNoaWxkcmVuLFxuICAgICAgY29udGV4dFZtLFxuICAgICAgQ3RvclxuICAgICk7XG5cbiAgICB2YXIgdm5vZGUgPSBvcHRpb25zLnJlbmRlci5jYWxsKG51bGwsIHJlbmRlckNvbnRleHQuX2MsIHJlbmRlckNvbnRleHQpO1xuXG4gICAgaWYgKHZub2RlIGluc3RhbmNlb2YgVk5vZGUpIHtcbiAgICAgIHJldHVybiBjbG9uZUFuZE1hcmtGdW5jdGlvbmFsUmVzdWx0KHZub2RlLCBkYXRhLCByZW5kZXJDb250ZXh0LnBhcmVudCwgb3B0aW9ucywgcmVuZGVyQ29udGV4dClcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodm5vZGUpKSB7XG4gICAgICB2YXIgdm5vZGVzID0gbm9ybWFsaXplQ2hpbGRyZW4odm5vZGUpIHx8IFtdO1xuICAgICAgdmFyIHJlcyA9IG5ldyBBcnJheSh2bm9kZXMubGVuZ3RoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdm5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlc1tpXSA9IGNsb25lQW5kTWFya0Z1bmN0aW9uYWxSZXN1bHQodm5vZGVzW2ldLCBkYXRhLCByZW5kZXJDb250ZXh0LnBhcmVudCwgb3B0aW9ucywgcmVuZGVyQ29udGV4dCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2xvbmVBbmRNYXJrRnVuY3Rpb25hbFJlc3VsdCAodm5vZGUsIGRhdGEsIGNvbnRleHRWbSwgb3B0aW9ucywgcmVuZGVyQ29udGV4dCkge1xuICAgIC8vICM3ODE3IGNsb25lIG5vZGUgYmVmb3JlIHNldHRpbmcgZm5Db250ZXh0LCBvdGhlcndpc2UgaWYgdGhlIG5vZGUgaXMgcmV1c2VkXG4gICAgLy8gKGUuZy4gaXQgd2FzIGZyb20gYSBjYWNoZWQgbm9ybWFsIHNsb3QpIHRoZSBmbkNvbnRleHQgY2F1c2VzIG5hbWVkIHNsb3RzXG4gICAgLy8gdGhhdCBzaG91bGQgbm90IGJlIG1hdGNoZWQgdG8gbWF0Y2guXG4gICAgdmFyIGNsb25lID0gY2xvbmVWTm9kZSh2bm9kZSk7XG4gICAgY2xvbmUuZm5Db250ZXh0ID0gY29udGV4dFZtO1xuICAgIGNsb25lLmZuT3B0aW9ucyA9IG9wdGlvbnM7XG4gICAge1xuICAgICAgKGNsb25lLmRldnRvb2xzTWV0YSA9IGNsb25lLmRldnRvb2xzTWV0YSB8fCB7fSkucmVuZGVyQ29udGV4dCA9IHJlbmRlckNvbnRleHQ7XG4gICAgfVxuICAgIGlmIChkYXRhLnNsb3QpIHtcbiAgICAgIChjbG9uZS5kYXRhIHx8IChjbG9uZS5kYXRhID0ge30pKS5zbG90ID0gZGF0YS5zbG90O1xuICAgIH1cbiAgICByZXR1cm4gY2xvbmVcbiAgfVxuXG4gIGZ1bmN0aW9uIG1lcmdlUHJvcHMgKHRvLCBmcm9tKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGZyb20pIHtcbiAgICAgIHRvW2NhbWVsaXplKGtleSldID0gZnJvbVtrZXldO1xuICAgIH1cbiAgfVxuXG4gIC8qICAqL1xuXG4gIC8qICAqL1xuXG4gIC8qICAqL1xuXG4gIC8qICAqL1xuXG4gIC8vIGlubGluZSBob29rcyB0byBiZSBpbnZva2VkIG9uIGNvbXBvbmVudCBWTm9kZXMgZHVyaW5nIHBhdGNoXG4gIHZhciBjb21wb25lbnRWTm9kZUhvb2tzID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uIGluaXQgKHZub2RlLCBoeWRyYXRpbmcpIHtcbiAgICAgIGlmIChcbiAgICAgICAgdm5vZGUuY29tcG9uZW50SW5zdGFuY2UgJiZcbiAgICAgICAgIXZub2RlLmNvbXBvbmVudEluc3RhbmNlLl9pc0Rlc3Ryb3llZCAmJlxuICAgICAgICB2bm9kZS5kYXRhLmtlZXBBbGl2ZVxuICAgICAgKSB7XG4gICAgICAgIC8vIGtlcHQtYWxpdmUgY29tcG9uZW50cywgdHJlYXQgYXMgYSBwYXRjaFxuICAgICAgICB2YXIgbW91bnRlZE5vZGUgPSB2bm9kZTsgLy8gd29yayBhcm91bmQgZmxvd1xuICAgICAgICBjb21wb25lbnRWTm9kZUhvb2tzLnByZXBhdGNoKG1vdW50ZWROb2RlLCBtb3VudGVkTm9kZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgY2hpbGQgPSB2bm9kZS5jb21wb25lbnRJbnN0YW5jZSA9IGNyZWF0ZUNvbXBvbmVudEluc3RhbmNlRm9yVm5vZGUoXG4gICAgICAgICAgdm5vZGUsXG4gICAgICAgICAgYWN0aXZlSW5zdGFuY2VcbiAgICAgICAgKTtcbiAgICAgICAgY2hpbGQuJG1vdW50KGh5ZHJhdGluZyA/IHZub2RlLmVsbSA6IHVuZGVmaW5lZCwgaHlkcmF0aW5nKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcHJlcGF0Y2g6IGZ1bmN0aW9uIHByZXBhdGNoIChvbGRWbm9kZSwgdm5vZGUpIHtcbiAgICAgIHZhciBvcHRpb25zID0gdm5vZGUuY29tcG9uZW50T3B0aW9ucztcbiAgICAgIHZhciBjaGlsZCA9IHZub2RlLmNvbXBvbmVudEluc3RhbmNlID0gb2xkVm5vZGUuY29tcG9uZW50SW5zdGFuY2U7XG4gICAgICB1cGRhdGVDaGlsZENvbXBvbmVudChcbiAgICAgICAgY2hpbGQsXG4gICAgICAgIG9wdGlvbnMucHJvcHNEYXRhLCAvLyB1cGRhdGVkIHByb3BzXG4gICAgICAgIG9wdGlvbnMubGlzdGVuZXJzLCAvLyB1cGRhdGVkIGxpc3RlbmVyc1xuICAgICAgICB2bm9kZSwgLy8gbmV3IHBhcmVudCB2bm9kZVxuICAgICAgICBvcHRpb25zLmNoaWxkcmVuIC8vIG5ldyBjaGlsZHJlblxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgaW5zZXJ0OiBmdW5jdGlvbiBpbnNlcnQgKHZub2RlKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHZub2RlLmNvbnRleHQ7XG4gICAgICB2YXIgY29tcG9uZW50SW5zdGFuY2UgPSB2bm9kZS5jb21wb25lbnRJbnN0YW5jZTtcbiAgICAgIGlmICghY29tcG9uZW50SW5zdGFuY2UuX2lzTW91bnRlZCkge1xuICAgICAgICBjb21wb25lbnRJbnN0YW5jZS5faXNNb3VudGVkID0gdHJ1ZTtcbiAgICAgICAgY2FsbEhvb2soY29tcG9uZW50SW5zdGFuY2UsICdtb3VudGVkJyk7XG4gICAgICB9XG4gICAgICBpZiAodm5vZGUuZGF0YS5rZWVwQWxpdmUpIHtcbiAgICAgICAgaWYgKGNvbnRleHQuX2lzTW91bnRlZCkge1xuICAgICAgICAgIC8vIHZ1ZS1yb3V0ZXIjMTIxMlxuICAgICAgICAgIC8vIER1cmluZyB1cGRhdGVzLCBhIGtlcHQtYWxpdmUgY29tcG9uZW50J3MgY2hpbGQgY29tcG9uZW50cyBtYXlcbiAgICAgICAgICAvLyBjaGFuZ2UsIHNvIGRpcmVjdGx5IHdhbGtpbmcgdGhlIHRyZWUgaGVyZSBtYXkgY2FsbCBhY3RpdmF0ZWQgaG9va3NcbiAgICAgICAgICAvLyBvbiBpbmNvcnJlY3QgY2hpbGRyZW4uIEluc3RlYWQgd2UgcHVzaCB0aGVtIGludG8gYSBxdWV1ZSB3aGljaCB3aWxsXG4gICAgICAgICAgLy8gYmUgcHJvY2Vzc2VkIGFmdGVyIHRoZSB3aG9sZSBwYXRjaCBwcm9jZXNzIGVuZGVkLlxuICAgICAgICAgIHF1ZXVlQWN0aXZhdGVkQ29tcG9uZW50KGNvbXBvbmVudEluc3RhbmNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhY3RpdmF0ZUNoaWxkQ29tcG9uZW50KGNvbXBvbmVudEluc3RhbmNlLCB0cnVlIC8qIGRpcmVjdCAqLyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZGVzdHJveTogZnVuY3Rpb24gZGVzdHJveSAodm5vZGUpIHtcbiAgICAgIHZhciBjb21wb25lbnRJbnN0YW5jZSA9IHZub2RlLmNvbXBvbmVudEluc3RhbmNlO1xuICAgICAgaWYgKCFjb21wb25lbnRJbnN0YW5jZS5faXNEZXN0cm95ZWQpIHtcbiAgICAgICAgaWYgKCF2bm9kZS5kYXRhLmtlZXBBbGl2ZSkge1xuICAgICAgICAgIGNvbXBvbmVudEluc3RhbmNlLiRkZXN0cm95KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVhY3RpdmF0ZUNoaWxkQ29tcG9uZW50KGNvbXBvbmVudEluc3RhbmNlLCB0cnVlIC8qIGRpcmVjdCAqLyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgdmFyIGhvb2tzVG9NZXJnZSA9IE9iamVjdC5rZXlzKGNvbXBvbmVudFZOb2RlSG9va3MpO1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudCAoXG4gICAgQ3RvcixcbiAgICBkYXRhLFxuICAgIGNvbnRleHQsXG4gICAgY2hpbGRyZW4sXG4gICAgdGFnXG4gICkge1xuICAgIGlmIChpc1VuZGVmKEN0b3IpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB2YXIgYmFzZUN0b3IgPSBjb250ZXh0LiRvcHRpb25zLl9iYXNlO1xuXG4gICAgLy8gcGxhaW4gb3B0aW9ucyBvYmplY3Q6IHR1cm4gaXQgaW50byBhIGNvbnN0cnVjdG9yXG4gICAgaWYgKGlzT2JqZWN0KEN0b3IpKSB7XG4gICAgICBDdG9yID0gYmFzZUN0b3IuZXh0ZW5kKEN0b3IpO1xuICAgIH1cblxuICAgIC8vIGlmIGF0IHRoaXMgc3RhZ2UgaXQncyBub3QgYSBjb25zdHJ1Y3RvciBvciBhbiBhc3luYyBjb21wb25lbnQgZmFjdG9yeSxcbiAgICAvLyByZWplY3QuXG4gICAgaWYgKHR5cGVvZiBDdG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB7XG4gICAgICAgIHdhcm4oKFwiSW52YWxpZCBDb21wb25lbnQgZGVmaW5pdGlvbjogXCIgKyAoU3RyaW5nKEN0b3IpKSksIGNvbnRleHQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gYXN5bmMgY29tcG9uZW50XG4gICAgdmFyIGFzeW5jRmFjdG9yeTtcbiAgICBpZiAoaXNVbmRlZihDdG9yLmNpZCkpIHtcbiAgICAgIGFzeW5jRmFjdG9yeSA9IEN0b3I7XG4gICAgICBDdG9yID0gcmVzb2x2ZUFzeW5jQ29tcG9uZW50KGFzeW5jRmFjdG9yeSwgYmFzZUN0b3IpO1xuICAgICAgaWYgKEN0b3IgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyByZXR1cm4gYSBwbGFjZWhvbGRlciBub2RlIGZvciBhc3luYyBjb21wb25lbnQsIHdoaWNoIGlzIHJlbmRlcmVkXG4gICAgICAgIC8vIGFzIGEgY29tbWVudCBub2RlIGJ1dCBwcmVzZXJ2ZXMgYWxsIHRoZSByYXcgaW5mb3JtYXRpb24gZm9yIHRoZSBub2RlLlxuICAgICAgICAvLyB0aGUgaW5mb3JtYXRpb24gd2lsbCBiZSB1c2VkIGZvciBhc3luYyBzZXJ2ZXItcmVuZGVyaW5nIGFuZCBoeWRyYXRpb24uXG4gICAgICAgIHJldHVybiBjcmVhdGVBc3luY1BsYWNlaG9sZGVyKFxuICAgICAgICAgIGFzeW5jRmFjdG9yeSxcbiAgICAgICAgICBkYXRhLFxuICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgY2hpbGRyZW4sXG4gICAgICAgICAgdGFnXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBkYXRhID0gZGF0YSB8fCB7fTtcblxuICAgIC8vIHJlc29sdmUgY29uc3RydWN0b3Igb3B0aW9ucyBpbiBjYXNlIGdsb2JhbCBtaXhpbnMgYXJlIGFwcGxpZWQgYWZ0ZXJcbiAgICAvLyBjb21wb25lbnQgY29uc3RydWN0b3IgY3JlYXRpb25cbiAgICByZXNvbHZlQ29uc3RydWN0b3JPcHRpb25zKEN0b3IpO1xuXG4gICAgLy8gdHJhbnNmb3JtIGNvbXBvbmVudCB2LW1vZGVsIGRhdGEgaW50byBwcm9wcyAmIGV2ZW50c1xuICAgIGlmIChpc0RlZihkYXRhLm1vZGVsKSkge1xuICAgICAgdHJhbnNmb3JtTW9kZWwoQ3Rvci5vcHRpb25zLCBkYXRhKTtcbiAgICB9XG5cbiAgICAvLyBleHRyYWN0IHByb3BzXG4gICAgdmFyIHByb3BzRGF0YSA9IGV4dHJhY3RQcm9wc0Zyb21WTm9kZURhdGEoZGF0YSwgQ3RvciwgdGFnKTtcblxuICAgIC8vIGZ1bmN0aW9uYWwgY29tcG9uZW50XG4gICAgaWYgKGlzVHJ1ZShDdG9yLm9wdGlvbnMuZnVuY3Rpb25hbCkpIHtcbiAgICAgIHJldHVybiBjcmVhdGVGdW5jdGlvbmFsQ29tcG9uZW50KEN0b3IsIHByb3BzRGF0YSwgZGF0YSwgY29udGV4dCwgY2hpbGRyZW4pXG4gICAgfVxuXG4gICAgLy8gZXh0cmFjdCBsaXN0ZW5lcnMsIHNpbmNlIHRoZXNlIG5lZWRzIHRvIGJlIHRyZWF0ZWQgYXNcbiAgICAvLyBjaGlsZCBjb21wb25lbnQgbGlzdGVuZXJzIGluc3RlYWQgb2YgRE9NIGxpc3RlbmVyc1xuICAgIHZhciBsaXN0ZW5lcnMgPSBkYXRhLm9uO1xuICAgIC8vIHJlcGxhY2Ugd2l0aCBsaXN0ZW5lcnMgd2l0aCAubmF0aXZlIG1vZGlmaWVyXG4gICAgLy8gc28gaXQgZ2V0cyBwcm9jZXNzZWQgZHVyaW5nIHBhcmVudCBjb21wb25lbnQgcGF0Y2guXG4gICAgZGF0YS5vbiA9IGRhdGEubmF0aXZlT247XG5cbiAgICBpZiAoaXNUcnVlKEN0b3Iub3B0aW9ucy5hYnN0cmFjdCkpIHtcbiAgICAgIC8vIGFic3RyYWN0IGNvbXBvbmVudHMgZG8gbm90IGtlZXAgYW55dGhpbmdcbiAgICAgIC8vIG90aGVyIHRoYW4gcHJvcHMgJiBsaXN0ZW5lcnMgJiBzbG90XG5cbiAgICAgIC8vIHdvcmsgYXJvdW5kIGZsb3dcbiAgICAgIHZhciBzbG90ID0gZGF0YS5zbG90O1xuICAgICAgZGF0YSA9IHt9O1xuICAgICAgaWYgKHNsb3QpIHtcbiAgICAgICAgZGF0YS5zbG90ID0gc2xvdDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpbnN0YWxsIGNvbXBvbmVudCBtYW5hZ2VtZW50IGhvb2tzIG9udG8gdGhlIHBsYWNlaG9sZGVyIG5vZGVcbiAgICBpbnN0YWxsQ29tcG9uZW50SG9va3MoZGF0YSk7XG5cbiAgICAvLyByZXR1cm4gYSBwbGFjZWhvbGRlciB2bm9kZVxuICAgIHZhciBuYW1lID0gQ3Rvci5vcHRpb25zLm5hbWUgfHwgdGFnO1xuICAgIHZhciB2bm9kZSA9IG5ldyBWTm9kZShcbiAgICAgIChcInZ1ZS1jb21wb25lbnQtXCIgKyAoQ3Rvci5jaWQpICsgKG5hbWUgPyAoXCItXCIgKyBuYW1lKSA6ICcnKSksXG4gICAgICBkYXRhLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBjb250ZXh0LFxuICAgICAgeyBDdG9yOiBDdG9yLCBwcm9wc0RhdGE6IHByb3BzRGF0YSwgbGlzdGVuZXJzOiBsaXN0ZW5lcnMsIHRhZzogdGFnLCBjaGlsZHJlbjogY2hpbGRyZW4gfSxcbiAgICAgIGFzeW5jRmFjdG9yeVxuICAgICk7XG5cbiAgICByZXR1cm4gdm5vZGVcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudEluc3RhbmNlRm9yVm5vZGUgKFxuICAgIC8vIHdlIGtub3cgaXQncyBNb3VudGVkQ29tcG9uZW50Vk5vZGUgYnV0IGZsb3cgZG9lc24ndFxuICAgIHZub2RlLFxuICAgIC8vIGFjdGl2ZUluc3RhbmNlIGluIGxpZmVjeWNsZSBzdGF0ZVxuICAgIHBhcmVudFxuICApIHtcbiAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgIF9pc0NvbXBvbmVudDogdHJ1ZSxcbiAgICAgIF9wYXJlbnRWbm9kZTogdm5vZGUsXG4gICAgICBwYXJlbnQ6IHBhcmVudFxuICAgIH07XG4gICAgLy8gY2hlY2sgaW5saW5lLXRlbXBsYXRlIHJlbmRlciBmdW5jdGlvbnNcbiAgICB2YXIgaW5saW5lVGVtcGxhdGUgPSB2bm9kZS5kYXRhLmlubGluZVRlbXBsYXRlO1xuICAgIGlmIChpc0RlZihpbmxpbmVUZW1wbGF0ZSkpIHtcbiAgICAgIG9wdGlvbnMucmVuZGVyID0gaW5saW5lVGVtcGxhdGUucmVuZGVyO1xuICAgICAgb3B0aW9ucy5zdGF0aWNSZW5kZXJGbnMgPSBpbmxpbmVUZW1wbGF0ZS5zdGF0aWNSZW5kZXJGbnM7XG4gICAgfVxuICAgIHJldHVybiBuZXcgdm5vZGUuY29tcG9uZW50T3B0aW9ucy5DdG9yKG9wdGlvbnMpXG4gIH1cblxuICBmdW5jdGlvbiBpbnN0YWxsQ29tcG9uZW50SG9va3MgKGRhdGEpIHtcbiAgICB2YXIgaG9va3MgPSBkYXRhLmhvb2sgfHwgKGRhdGEuaG9vayA9IHt9KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvb2tzVG9NZXJnZS5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGtleSA9IGhvb2tzVG9NZXJnZVtpXTtcbiAgICAgIHZhciBleGlzdGluZyA9IGhvb2tzW2tleV07XG4gICAgICB2YXIgdG9NZXJnZSA9IGNvbXBvbmVudFZOb2RlSG9va3Nba2V5XTtcbiAgICAgIGlmIChleGlzdGluZyAhPT0gdG9NZXJnZSAmJiAhKGV4aXN0aW5nICYmIGV4aXN0aW5nLl9tZXJnZWQpKSB7XG4gICAgICAgIGhvb2tzW2tleV0gPSBleGlzdGluZyA/IG1lcmdlSG9vayQxKHRvTWVyZ2UsIGV4aXN0aW5nKSA6IHRvTWVyZ2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbWVyZ2VIb29rJDEgKGYxLCBmMikge1xuICAgIHZhciBtZXJnZWQgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgLy8gZmxvdyBjb21wbGFpbnMgYWJvdXQgZXh0cmEgYXJncyB3aGljaCBpcyB3aHkgd2UgdXNlIGFueVxuICAgICAgZjEoYSwgYik7XG4gICAgICBmMihhLCBiKTtcbiAgICB9O1xuICAgIG1lcmdlZC5fbWVyZ2VkID0gdHJ1ZTtcbiAgICByZXR1cm4gbWVyZ2VkXG4gIH1cblxuICAvLyB0cmFuc2Zvcm0gY29tcG9uZW50IHYtbW9kZWwgaW5mbyAodmFsdWUgYW5kIGNhbGxiYWNrKSBpbnRvXG4gIC8vIHByb3AgYW5kIGV2ZW50IGhhbmRsZXIgcmVzcGVjdGl2ZWx5LlxuICBmdW5jdGlvbiB0cmFuc2Zvcm1Nb2RlbCAob3B0aW9ucywgZGF0YSkge1xuICAgIHZhciBwcm9wID0gKG9wdGlvbnMubW9kZWwgJiYgb3B0aW9ucy5tb2RlbC5wcm9wKSB8fCAndmFsdWUnO1xuICAgIHZhciBldmVudCA9IChvcHRpb25zLm1vZGVsICYmIG9wdGlvbnMubW9kZWwuZXZlbnQpIHx8ICdpbnB1dCdcbiAgICA7KGRhdGEuYXR0cnMgfHwgKGRhdGEuYXR0cnMgPSB7fSkpW3Byb3BdID0gZGF0YS5tb2RlbC52YWx1ZTtcbiAgICB2YXIgb24gPSBkYXRhLm9uIHx8IChkYXRhLm9uID0ge30pO1xuICAgIHZhciBleGlzdGluZyA9IG9uW2V2ZW50XTtcbiAgICB2YXIgY2FsbGJhY2sgPSBkYXRhLm1vZGVsLmNhbGxiYWNrO1xuICAgIGlmIChpc0RlZihleGlzdGluZykpIHtcbiAgICAgIGlmIChcbiAgICAgICAgQXJyYXkuaXNBcnJheShleGlzdGluZylcbiAgICAgICAgICA/IGV4aXN0aW5nLmluZGV4T2YoY2FsbGJhY2spID09PSAtMVxuICAgICAgICAgIDogZXhpc3RpbmcgIT09IGNhbGxiYWNrXG4gICAgICApIHtcbiAgICAgICAgb25bZXZlbnRdID0gW2NhbGxiYWNrXS5jb25jYXQoZXhpc3RpbmcpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBvbltldmVudF0gPSBjYWxsYmFjaztcbiAgICB9XG4gIH1cblxuICAvKiAgKi9cblxuICB2YXIgU0lNUExFX05PUk1BTElaRSA9IDE7XG4gIHZhciBBTFdBWVNfTk9STUFMSVpFID0gMjtcblxuICAvLyB3cmFwcGVyIGZ1bmN0aW9uIGZvciBwcm92aWRpbmcgYSBtb3JlIGZsZXhpYmxlIGludGVyZmFjZVxuICAvLyB3aXRob3V0IGdldHRpbmcgeWVsbGVkIGF0IGJ5IGZsb3dcbiAgZnVuY3Rpb24gY3JlYXRlRWxlbWVudCAoXG4gICAgY29udGV4dCxcbiAgICB0YWcsXG4gICAgZGF0YSxcbiAgICBjaGlsZHJlbixcbiAgICBub3JtYWxpemF0aW9uVHlwZSxcbiAgICBhbHdheXNOb3JtYWxpemVcbiAgKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkgfHwgaXNQcmltaXRpdmUoZGF0YSkpIHtcbiAgICAgIG5vcm1hbGl6YXRpb25UeXBlID0gY2hpbGRyZW47XG4gICAgICBjaGlsZHJlbiA9IGRhdGE7XG4gICAgICBkYXRhID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAoaXNUcnVlKGFsd2F5c05vcm1hbGl6ZSkpIHtcbiAgICAgIG5vcm1hbGl6YXRpb25UeXBlID0gQUxXQVlTX05PUk1BTElaRTtcbiAgICB9XG4gICAgcmV0dXJuIF9jcmVhdGVFbGVtZW50KGNvbnRleHQsIHRhZywgZGF0YSwgY2hpbGRyZW4sIG5vcm1hbGl6YXRpb25UeXBlKVxuICB9XG5cbiAgZnVuY3Rpb24gX2NyZWF0ZUVsZW1lbnQgKFxuICAgIGNvbnRleHQsXG4gICAgdGFnLFxuICAgIGRhdGEsXG4gICAgY2hpbGRyZW4sXG4gICAgbm9ybWFsaXphdGlvblR5cGVcbiAgKSB7XG4gICAgaWYgKGlzRGVmKGRhdGEpICYmIGlzRGVmKChkYXRhKS5fX29iX18pKSB7XG4gICAgICB3YXJuKFxuICAgICAgICBcIkF2b2lkIHVzaW5nIG9ic2VydmVkIGRhdGEgb2JqZWN0IGFzIHZub2RlIGRhdGE6IFwiICsgKEpTT04uc3RyaW5naWZ5KGRhdGEpKSArIFwiXFxuXCIgK1xuICAgICAgICAnQWx3YXlzIGNyZWF0ZSBmcmVzaCB2bm9kZSBkYXRhIG9iamVjdHMgaW4gZWFjaCByZW5kZXIhJyxcbiAgICAgICAgY29udGV4dFxuICAgICAgKTtcbiAgICAgIHJldHVybiBjcmVhdGVFbXB0eVZOb2RlKClcbiAgICB9XG4gICAgLy8gb2JqZWN0IHN5bnRheCBpbiB2LWJpbmRcbiAgICBpZiAoaXNEZWYoZGF0YSkgJiYgaXNEZWYoZGF0YS5pcykpIHtcbiAgICAgIHRhZyA9IGRhdGEuaXM7XG4gICAgfVxuICAgIGlmICghdGFnKSB7XG4gICAgICAvLyBpbiBjYXNlIG9mIGNvbXBvbmVudCA6aXMgc2V0IHRvIGZhbHN5IHZhbHVlXG4gICAgICByZXR1cm4gY3JlYXRlRW1wdHlWTm9kZSgpXG4gICAgfVxuICAgIC8vIHdhcm4gYWdhaW5zdCBub24tcHJpbWl0aXZlIGtleVxuICAgIGlmIChpc0RlZihkYXRhKSAmJiBpc0RlZihkYXRhLmtleSkgJiYgIWlzUHJpbWl0aXZlKGRhdGEua2V5KVxuICAgICkge1xuICAgICAge1xuICAgICAgICB3YXJuKFxuICAgICAgICAgICdBdm9pZCB1c2luZyBub24tcHJpbWl0aXZlIHZhbHVlIGFzIGtleSwgJyArXG4gICAgICAgICAgJ3VzZSBzdHJpbmcvbnVtYmVyIHZhbHVlIGluc3RlYWQuJyxcbiAgICAgICAgICBjb250ZXh0XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIHN1cHBvcnQgc2luZ2xlIGZ1bmN0aW9uIGNoaWxkcmVuIGFzIGRlZmF1bHQgc2NvcGVkIHNsb3RcbiAgICBpZiAoQXJyYXkuaXNBcnJheShjaGlsZHJlbikgJiZcbiAgICAgIHR5cGVvZiBjaGlsZHJlblswXSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICkge1xuICAgICAgZGF0YSA9IGRhdGEgfHwge307XG4gICAgICBkYXRhLnNjb3BlZFNsb3RzID0geyBkZWZhdWx0OiBjaGlsZHJlblswXSB9O1xuICAgICAgY2hpbGRyZW4ubGVuZ3RoID0gMDtcbiAgICB9XG4gICAgaWYgKG5vcm1hbGl6YXRpb25UeXBlID09PSBBTFdBWVNfTk9STUFMSVpFKSB7XG4gICAgICBjaGlsZHJlbiA9IG5vcm1hbGl6ZUNoaWxkcmVuKGNoaWxkcmVuKTtcbiAgICB9IGVsc2UgaWYgKG5vcm1hbGl6YXRpb25UeXBlID09PSBTSU1QTEVfTk9STUFMSVpFKSB7XG4gICAgICBjaGlsZHJlbiA9IHNpbXBsZU5vcm1hbGl6ZUNoaWxkcmVuKGNoaWxkcmVuKTtcbiAgICB9XG4gICAgdmFyIHZub2RlLCBucztcbiAgICBpZiAodHlwZW9mIHRhZyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHZhciBDdG9yO1xuICAgICAgbnMgPSAoY29udGV4dC4kdm5vZGUgJiYgY29udGV4dC4kdm5vZGUubnMpIHx8IGNvbmZpZy5nZXRUYWdOYW1lc3BhY2UodGFnKTtcbiAgICAgIGlmIChjb25maWcuaXNSZXNlcnZlZFRhZyh0YWcpKSB7XG4gICAgICAgIC8vIHBsYXRmb3JtIGJ1aWx0LWluIGVsZW1lbnRzXG4gICAgICAgIGlmIChpc0RlZihkYXRhKSAmJiBpc0RlZihkYXRhLm5hdGl2ZU9uKSAmJiBkYXRhLnRhZyAhPT0gJ2NvbXBvbmVudCcpIHtcbiAgICAgICAgICB3YXJuKFxuICAgICAgICAgICAgKFwiVGhlIC5uYXRpdmUgbW9kaWZpZXIgZm9yIHYtb24gaXMgb25seSB2YWxpZCBvbiBjb21wb25lbnRzIGJ1dCBpdCB3YXMgdXNlZCBvbiA8XCIgKyB0YWcgKyBcIj4uXCIpLFxuICAgICAgICAgICAgY29udGV4dFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdm5vZGUgPSBuZXcgVk5vZGUoXG4gICAgICAgICAgY29uZmlnLnBhcnNlUGxhdGZvcm1UYWdOYW1lKHRhZyksIGRhdGEsIGNoaWxkcmVuLFxuICAgICAgICAgIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBjb250ZXh0XG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKCghZGF0YSB8fCAhZGF0YS5wcmUpICYmIGlzRGVmKEN0b3IgPSByZXNvbHZlQXNzZXQoY29udGV4dC4kb3B0aW9ucywgJ2NvbXBvbmVudHMnLCB0YWcpKSkge1xuICAgICAgICAvLyBjb21wb25lbnRcbiAgICAgICAgdm5vZGUgPSBjcmVhdGVDb21wb25lbnQoQ3RvciwgZGF0YSwgY29udGV4dCwgY2hpbGRyZW4sIHRhZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyB1bmtub3duIG9yIHVubGlzdGVkIG5hbWVzcGFjZWQgZWxlbWVudHNcbiAgICAgICAgLy8gY2hlY2sgYXQgcnVudGltZSBiZWNhdXNlIGl0IG1heSBnZXQgYXNzaWduZWQgYSBuYW1lc3BhY2Ugd2hlbiBpdHNcbiAgICAgICAgLy8gcGFyZW50IG5vcm1hbGl6ZXMgY2hpbGRyZW5cbiAgICAgICAgdm5vZGUgPSBuZXcgVk5vZGUoXG4gICAgICAgICAgdGFnLCBkYXRhLCBjaGlsZHJlbixcbiAgICAgICAgICB1bmRlZmluZWQsIHVuZGVmaW5lZCwgY29udGV4dFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBkaXJlY3QgY29tcG9uZW50IG9wdGlvbnMgLyBjb25zdHJ1Y3RvclxuICAgICAgdm5vZGUgPSBjcmVhdGVDb21wb25lbnQodGFnLCBkYXRhLCBjb250ZXh0LCBjaGlsZHJlbik7XG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KHZub2RlKSkge1xuICAgICAgcmV0dXJuIHZub2RlXG4gICAgfSBlbHNlIGlmIChpc0RlZih2bm9kZSkpIHtcbiAgICAgIGlmIChpc0RlZihucykpIHsgYXBwbHlOUyh2bm9kZSwgbnMpOyB9XG4gICAgICBpZiAoaXNEZWYoZGF0YSkpIHsgcmVnaXN0ZXJEZWVwQmluZGluZ3MoZGF0YSk7IH1cbiAgICAgIHJldHVybiB2bm9kZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3JlYXRlRW1wdHlWTm9kZSgpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYXBwbHlOUyAodm5vZGUsIG5zLCBmb3JjZSkge1xuICAgIHZub2RlLm5zID0gbnM7XG4gICAgaWYgKHZub2RlLnRhZyA9PT0gJ2ZvcmVpZ25PYmplY3QnKSB7XG4gICAgICAvLyB1c2UgZGVmYXVsdCBuYW1lc3BhY2UgaW5zaWRlIGZvcmVpZ25PYmplY3RcbiAgICAgIG5zID0gdW5kZWZpbmVkO1xuICAgICAgZm9yY2UgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoaXNEZWYodm5vZGUuY2hpbGRyZW4pKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHZub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgY2hpbGQgPSB2bm9kZS5jaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKGlzRGVmKGNoaWxkLnRhZykgJiYgKFxuICAgICAgICAgIGlzVW5kZWYoY2hpbGQubnMpIHx8IChpc1RydWUoZm9yY2UpICYmIGNoaWxkLnRhZyAhPT0gJ3N2ZycpKSkge1xuICAgICAgICAgIGFwcGx5TlMoY2hpbGQsIG5zLCBmb3JjZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyByZWYgIzUzMThcbiAgLy8gbmVjZXNzYXJ5IHRvIGVuc3VyZSBwYXJlbnQgcmUtcmVuZGVyIHdoZW4gZGVlcCBiaW5kaW5ncyBsaWtlIDpzdHlsZSBhbmRcbiAgLy8gOmNsYXNzIGFyZSB1c2VkIG9uIHNsb3Qgbm9kZXNcbiAgZnVuY3Rpb24gcmVnaXN0ZXJEZWVwQmluZGluZ3MgKGRhdGEpIHtcbiAgICBpZiAoaXNPYmplY3QoZGF0YS5zdHlsZSkpIHtcbiAgICAgIHRyYXZlcnNlKGRhdGEuc3R5bGUpO1xuICAgIH1cbiAgICBpZiAoaXNPYmplY3QoZGF0YS5jbGFzcykpIHtcbiAgICAgIHRyYXZlcnNlKGRhdGEuY2xhc3MpO1xuICAgIH1cbiAgfVxuXG4gIC8qICAqL1xuXG4gIGZ1bmN0aW9uIGluaXRSZW5kZXIgKHZtKSB7XG4gICAgdm0uX3Zub2RlID0gbnVsbDsgLy8gdGhlIHJvb3Qgb2YgdGhlIGNoaWxkIHRyZWVcbiAgICB2bS5fc3RhdGljVHJlZXMgPSBudWxsOyAvLyB2LW9uY2UgY2FjaGVkIHRyZWVzXG4gICAgdmFyIG9wdGlvbnMgPSB2bS4kb3B0aW9ucztcbiAgICB2YXIgcGFyZW50Vm5vZGUgPSB2bS4kdm5vZGUgPSBvcHRpb25zLl9wYXJlbnRWbm9kZTsgLy8gdGhlIHBsYWNlaG9sZGVyIG5vZGUgaW4gcGFyZW50IHRyZWVcbiAgICB2YXIgcmVuZGVyQ29udGV4dCA9IHBhcmVudFZub2RlICYmIHBhcmVudFZub2RlLmNvbnRleHQ7XG4gICAgdm0uJHNsb3RzID0gcmVzb2x2ZVNsb3RzKG9wdGlvbnMuX3JlbmRlckNoaWxkcmVuLCByZW5kZXJDb250ZXh0KTtcbiAgICB2bS4kc2NvcGVkU2xvdHMgPSBlbXB0eU9iamVjdDtcbiAgICAvLyBiaW5kIHRoZSBjcmVhdGVFbGVtZW50IGZuIHRvIHRoaXMgaW5zdGFuY2VcbiAgICAvLyBzbyB0aGF0IHdlIGdldCBwcm9wZXIgcmVuZGVyIGNvbnRleHQgaW5zaWRlIGl0LlxuICAgIC8vIGFyZ3Mgb3JkZXI6IHRhZywgZGF0YSwgY2hpbGRyZW4sIG5vcm1hbGl6YXRpb25UeXBlLCBhbHdheXNOb3JtYWxpemVcbiAgICAvLyBpbnRlcm5hbCB2ZXJzaW9uIGlzIHVzZWQgYnkgcmVuZGVyIGZ1bmN0aW9ucyBjb21waWxlZCBmcm9tIHRlbXBsYXRlc1xuICAgIHZtLl9jID0gZnVuY3Rpb24gKGEsIGIsIGMsIGQpIHsgcmV0dXJuIGNyZWF0ZUVsZW1lbnQodm0sIGEsIGIsIGMsIGQsIGZhbHNlKTsgfTtcbiAgICAvLyBub3JtYWxpemF0aW9uIGlzIGFsd2F5cyBhcHBsaWVkIGZvciB0aGUgcHVibGljIHZlcnNpb24sIHVzZWQgaW5cbiAgICAvLyB1c2VyLXdyaXR0ZW4gcmVuZGVyIGZ1bmN0aW9ucy5cbiAgICB2bS4kY3JlYXRlRWxlbWVudCA9IGZ1bmN0aW9uIChhLCBiLCBjLCBkKSB7IHJldHVybiBjcmVhdGVFbGVtZW50KHZtLCBhLCBiLCBjLCBkLCB0cnVlKTsgfTtcblxuICAgIC8vICRhdHRycyAmICRsaXN0ZW5lcnMgYXJlIGV4cG9zZWQgZm9yIGVhc2llciBIT0MgY3JlYXRpb24uXG4gICAgLy8gdGhleSBuZWVkIHRvIGJlIHJlYWN0aXZlIHNvIHRoYXQgSE9DcyB1c2luZyB0aGVtIGFyZSBhbHdheXMgdXBkYXRlZFxuICAgIHZhciBwYXJlbnREYXRhID0gcGFyZW50Vm5vZGUgJiYgcGFyZW50Vm5vZGUuZGF0YTtcblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAge1xuICAgICAgZGVmaW5lUmVhY3RpdmUkJDEodm0sICckYXR0cnMnLCBwYXJlbnREYXRhICYmIHBhcmVudERhdGEuYXR0cnMgfHwgZW1wdHlPYmplY3QsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIWlzVXBkYXRpbmdDaGlsZENvbXBvbmVudCAmJiB3YXJuKFwiJGF0dHJzIGlzIHJlYWRvbmx5LlwiLCB2bSk7XG4gICAgICB9LCB0cnVlKTtcbiAgICAgIGRlZmluZVJlYWN0aXZlJCQxKHZtLCAnJGxpc3RlbmVycycsIG9wdGlvbnMuX3BhcmVudExpc3RlbmVycyB8fCBlbXB0eU9iamVjdCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAhaXNVcGRhdGluZ0NoaWxkQ29tcG9uZW50ICYmIHdhcm4oXCIkbGlzdGVuZXJzIGlzIHJlYWRvbmx5LlwiLCB2bSk7XG4gICAgICB9LCB0cnVlKTtcbiAgICB9XG4gIH1cblxuICB2YXIgY3VycmVudFJlbmRlcmluZ0luc3RhbmNlID0gbnVsbDtcblxuICBmdW5jdGlvbiByZW5kZXJNaXhpbiAoVnVlKSB7XG4gICAgLy8gaW5zdGFsbCBydW50aW1lIGNvbnZlbmllbmNlIGhlbHBlcnNcbiAgICBpbnN0YWxsUmVuZGVySGVscGVycyhWdWUucHJvdG90eXBlKTtcblxuICAgIFZ1ZS5wcm90b3R5cGUuJG5leHRUaWNrID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICByZXR1cm4gbmV4dFRpY2soZm4sIHRoaXMpXG4gICAgfTtcblxuICAgIFZ1ZS5wcm90b3R5cGUuX3JlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB2bSA9IHRoaXM7XG4gICAgICB2YXIgcmVmID0gdm0uJG9wdGlvbnM7XG4gICAgICB2YXIgcmVuZGVyID0gcmVmLnJlbmRlcjtcbiAgICAgIHZhciBfcGFyZW50Vm5vZGUgPSByZWYuX3BhcmVudFZub2RlO1xuXG4gICAgICBpZiAoX3BhcmVudFZub2RlKSB7XG4gICAgICAgIHZtLiRzY29wZWRTbG90cyA9IG5vcm1hbGl6ZVNjb3BlZFNsb3RzKFxuICAgICAgICAgIF9wYXJlbnRWbm9kZS5kYXRhLnNjb3BlZFNsb3RzLFxuICAgICAgICAgIHZtLiRzbG90cyxcbiAgICAgICAgICB2bS4kc2NvcGVkU2xvdHNcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gc2V0IHBhcmVudCB2bm9kZS4gdGhpcyBhbGxvd3MgcmVuZGVyIGZ1bmN0aW9ucyB0byBoYXZlIGFjY2Vzc1xuICAgICAgLy8gdG8gdGhlIGRhdGEgb24gdGhlIHBsYWNlaG9sZGVyIG5vZGUuXG4gICAgICB2bS4kdm5vZGUgPSBfcGFyZW50Vm5vZGU7XG4gICAgICAvLyByZW5kZXIgc2VsZlxuICAgICAgdmFyIHZub2RlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVGhlcmUncyBubyBuZWVkIHRvIG1haW50YWluIGEgc3RhY2sgYmVjYXVzZSBhbGwgcmVuZGVyIGZucyBhcmUgY2FsbGVkXG4gICAgICAgIC8vIHNlcGFyYXRlbHkgZnJvbSBvbmUgYW5vdGhlci4gTmVzdGVkIGNvbXBvbmVudCdzIHJlbmRlciBmbnMgYXJlIGNhbGxlZFxuICAgICAgICAvLyB3aGVuIHBhcmVudCBjb21wb25lbnQgaXMgcGF0Y2hlZC5cbiAgICAgICAgY3VycmVudFJlbmRlcmluZ0luc3RhbmNlID0gdm07XG4gICAgICAgIHZub2RlID0gcmVuZGVyLmNhbGwodm0uX3JlbmRlclByb3h5LCB2bS4kY3JlYXRlRWxlbWVudCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGhhbmRsZUVycm9yKGUsIHZtLCBcInJlbmRlclwiKTtcbiAgICAgICAgLy8gcmV0dXJuIGVycm9yIHJlbmRlciByZXN1bHQsXG4gICAgICAgIC8vIG9yIHByZXZpb3VzIHZub2RlIHRvIHByZXZlbnQgcmVuZGVyIGVycm9yIGNhdXNpbmcgYmxhbmsgY29tcG9uZW50XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICAgIGlmICh2bS4kb3B0aW9ucy5yZW5kZXJFcnJvcikge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2bm9kZSA9IHZtLiRvcHRpb25zLnJlbmRlckVycm9yLmNhbGwodm0uX3JlbmRlclByb3h5LCB2bS4kY3JlYXRlRWxlbWVudCwgZSk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaGFuZGxlRXJyb3IoZSwgdm0sIFwicmVuZGVyRXJyb3JcIik7XG4gICAgICAgICAgICB2bm9kZSA9IHZtLl92bm9kZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdm5vZGUgPSB2bS5fdm5vZGU7XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGN1cnJlbnRSZW5kZXJpbmdJbnN0YW5jZSA9IG51bGw7XG4gICAgICB9XG4gICAgICAvLyBpZiB0aGUgcmV0dXJuZWQgYXJyYXkgY29udGFpbnMgb25seSBhIHNpbmdsZSBub2RlLCBhbGxvdyBpdFxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodm5vZGUpICYmIHZub2RlLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICB2bm9kZSA9IHZub2RlWzBdO1xuICAgICAgfVxuICAgICAgLy8gcmV0dXJuIGVtcHR5IHZub2RlIGluIGNhc2UgdGhlIHJlbmRlciBmdW5jdGlvbiBlcnJvcmVkIG91dFxuICAgICAgaWYgKCEodm5vZGUgaW5zdGFuY2VvZiBWTm9kZSkpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodm5vZGUpKSB7XG4gICAgICAgICAgd2FybihcbiAgICAgICAgICAgICdNdWx0aXBsZSByb290IG5vZGVzIHJldHVybmVkIGZyb20gcmVuZGVyIGZ1bmN0aW9uLiBSZW5kZXIgZnVuY3Rpb24gJyArXG4gICAgICAgICAgICAnc2hvdWxkIHJldHVybiBhIHNpbmdsZSByb290IG5vZGUuJyxcbiAgICAgICAgICAgIHZtXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB2bm9kZSA9IGNyZWF0ZUVtcHR5Vk5vZGUoKTtcbiAgICAgIH1cbiAgICAgIC8vIHNldCBwYXJlbnRcbiAgICAgIHZub2RlLnBhcmVudCA9IF9wYXJlbnRWbm9kZTtcbiAgICAgIHJldHVybiB2bm9kZVxuICAgIH07XG4gIH1cblxuICAvKiAgKi9cblxuICBmdW5jdGlvbiBlbnN1cmVDdG9yIChjb21wLCBiYXNlKSB7XG4gICAgaWYgKFxuICAgICAgY29tcC5fX2VzTW9kdWxlIHx8XG4gICAgICAoaGFzU3ltYm9sICYmIGNvbXBbU3ltYm9sLnRvU3RyaW5nVGFnXSA9PT0gJ01vZHVsZScpXG4gICAgKSB7XG4gICAgICBjb21wID0gY29tcC5kZWZhdWx0O1xuICAgIH1cbiAgICByZXR1cm4gaXNPYmplY3QoY29tcClcbiAgICAgID8gYmFzZS5leHRlbmQoY29tcClcbiAgICAgIDogY29tcFxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQXN5bmNQbGFjZWhvbGRlciAoXG4gICAgZmFjdG9yeSxcbiAgICBkYXRhLFxuICAgIGNvbnRleHQsXG4gICAgY2hpbGRyZW4sXG4gICAgdGFnXG4gICkge1xuICAgIHZhciBub2RlID0gY3JlYXRlRW1wdHlWTm9kZSgpO1xuICAgIG5vZGUuYXN5bmNGYWN0b3J5ID0gZmFjdG9yeTtcbiAgICBub2RlLmFzeW5jTWV0YSA9IHsgZGF0YTogZGF0YSwgY29udGV4dDogY29udGV4dCwgY2hpbGRyZW46IGNoaWxkcmVuLCB0YWc6IHRhZyB9O1xuICAgIHJldHVybiBub2RlXG4gIH1cblxuICBmdW5jdGlvbiByZXNvbHZlQXN5bmNDb21wb25lbnQgKFxuICAgIGZhY3RvcnksXG4gICAgYmFzZUN0b3JcbiAgKSB7XG4gICAgaWYgKGlzVHJ1ZShmYWN0b3J5LmVycm9yKSAmJiBpc0RlZihmYWN0b3J5LmVycm9yQ29tcCkpIHtcbiAgICAgIHJldHVybiBmYWN0b3J5LmVycm9yQ29tcFxuICAgIH1cblxuICAgIGlmIChpc0RlZihmYWN0b3J5LnJlc29sdmVkKSkge1xuICAgICAgcmV0dXJuIGZhY3RvcnkucmVzb2x2ZWRcbiAgICB9XG5cbiAgICB2YXIgb3duZXIgPSBjdXJyZW50UmVuZGVyaW5nSW5zdGFuY2U7XG4gICAgaWYgKG93bmVyICYmIGlzRGVmKGZhY3Rvcnkub3duZXJzKSAmJiBmYWN0b3J5Lm93bmVycy5pbmRleE9mKG93bmVyKSA9PT0gLTEpIHtcbiAgICAgIC8vIGFscmVhZHkgcGVuZGluZ1xuICAgICAgZmFjdG9yeS5vd25lcnMucHVzaChvd25lcik7XG4gICAgfVxuXG4gICAgaWYgKGlzVHJ1ZShmYWN0b3J5LmxvYWRpbmcpICYmIGlzRGVmKGZhY3RvcnkubG9hZGluZ0NvbXApKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeS5sb2FkaW5nQ29tcFxuICAgIH1cblxuICAgIGlmIChvd25lciAmJiAhaXNEZWYoZmFjdG9yeS5vd25lcnMpKSB7XG4gICAgICB2YXIgb3duZXJzID0gZmFjdG9yeS5vd25lcnMgPSBbb3duZXJdO1xuICAgICAgdmFyIHN5bmMgPSB0cnVlO1xuICAgICAgdmFyIHRpbWVyTG9hZGluZyA9IG51bGw7XG4gICAgICB2YXIgdGltZXJUaW1lb3V0ID0gbnVsbFxuXG4gICAgICA7KG93bmVyKS4kb24oJ2hvb2s6ZGVzdHJveWVkJywgZnVuY3Rpb24gKCkgeyByZXR1cm4gcmVtb3ZlKG93bmVycywgb3duZXIpOyB9KTtcblxuICAgICAgdmFyIGZvcmNlUmVuZGVyID0gZnVuY3Rpb24gKHJlbmRlckNvbXBsZXRlZCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IG93bmVycy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAob3duZXJzW2ldKS4kZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZW5kZXJDb21wbGV0ZWQpIHtcbiAgICAgICAgICBvd25lcnMubGVuZ3RoID0gMDtcbiAgICAgICAgICBpZiAodGltZXJMb2FkaW5nICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXJMb2FkaW5nKTtcbiAgICAgICAgICAgIHRpbWVyTG9hZGluZyA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0aW1lclRpbWVvdXQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lclRpbWVvdXQpO1xuICAgICAgICAgICAgdGltZXJUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHZhciByZXNvbHZlID0gb25jZShmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIC8vIGNhY2hlIHJlc29sdmVkXG4gICAgICAgIGZhY3RvcnkucmVzb2x2ZWQgPSBlbnN1cmVDdG9yKHJlcywgYmFzZUN0b3IpO1xuICAgICAgICAvLyBpbnZva2UgY2FsbGJhY2tzIG9ubHkgaWYgdGhpcyBpcyBub3QgYSBzeW5jaHJvbm91cyByZXNvbHZlXG4gICAgICAgIC8vIChhc3luYyByZXNvbHZlcyBhcmUgc2hpbW1lZCBhcyBzeW5jaHJvbm91cyBkdXJpbmcgU1NSKVxuICAgICAgICBpZiAoIXN5bmMpIHtcbiAgICAgICAgICBmb3JjZVJlbmRlcih0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvd25lcnMubGVuZ3RoID0gMDtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHZhciByZWplY3QgPSBvbmNlKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgd2FybihcbiAgICAgICAgICBcIkZhaWxlZCB0byByZXNvbHZlIGFzeW5jIGNvbXBvbmVudDogXCIgKyAoU3RyaW5nKGZhY3RvcnkpKSArXG4gICAgICAgICAgKHJlYXNvbiA/IChcIlxcblJlYXNvbjogXCIgKyByZWFzb24pIDogJycpXG4gICAgICAgICk7XG4gICAgICAgIGlmIChpc0RlZihmYWN0b3J5LmVycm9yQ29tcCkpIHtcbiAgICAgICAgICBmYWN0b3J5LmVycm9yID0gdHJ1ZTtcbiAgICAgICAgICBmb3JjZVJlbmRlcih0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHZhciByZXMgPSBmYWN0b3J5KHJlc29sdmUsIHJlamVjdCk7XG5cbiAgICAgIGlmIChpc09iamVjdChyZXMpKSB7XG4gICAgICAgIGlmIChpc1Byb21pc2UocmVzKSkge1xuICAgICAgICAgIC8vICgpID0+IFByb21pc2VcbiAgICAgICAgICBpZiAoaXNVbmRlZihmYWN0b3J5LnJlc29sdmVkKSkge1xuICAgICAgICAgICAgcmVzLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaXNQcm9taXNlKHJlcy5jb21wb25lbnQpKSB7XG4gICAgICAgICAgcmVzLmNvbXBvbmVudC50aGVuKHJlc29sdmUsIHJlamVjdCk7XG5cbiAgICAgICAgICBpZiAoaXNEZWYocmVzLmVycm9yKSkge1xuICAgICAgICAgICAgZmFjdG9yeS5lcnJvckNvbXAgPSBlbnN1cmVDdG9yKHJlcy5lcnJvciwgYmFzZUN0b3IpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChpc0RlZihyZXMubG9hZGluZykpIHtcbiAgICAgICAgICAgIGZhY3RvcnkubG9hZGluZ0NvbXAgPSBlbnN1cmVDdG9yKHJlcy5sb2FkaW5nLCBiYXNlQ3Rvcik7XG4gICAgICAgICAgICBpZiAocmVzLmRlbGF5ID09PSAwKSB7XG4gICAgICAgICAgICAgIGZhY3RvcnkubG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aW1lckxvYWRpbmcgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aW1lckxvYWRpbmcgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmIChpc1VuZGVmKGZhY3RvcnkucmVzb2x2ZWQpICYmIGlzVW5kZWYoZmFjdG9yeS5lcnJvcikpIHtcbiAgICAgICAgICAgICAgICAgIGZhY3RvcnkubG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICBmb3JjZVJlbmRlcihmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LCByZXMuZGVsYXkgfHwgMjAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaXNEZWYocmVzLnRpbWVvdXQpKSB7XG4gICAgICAgICAgICB0aW1lclRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgdGltZXJUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgICAgaWYgKGlzVW5kZWYoZmFjdG9yeS5yZXNvbHZlZCkpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoXG4gICAgICAgICAgICAgICAgICBcInRpbWVvdXQgKFwiICsgKHJlcy50aW1lb3V0KSArIFwibXMpXCJcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCByZXMudGltZW91dCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHN5bmMgPSBmYWxzZTtcbiAgICAgIC8vIHJldHVybiBpbiBjYXNlIHJlc29sdmVkIHN5bmNocm9ub3VzbHlcbiAgICAgIHJldHVybiBmYWN0b3J5LmxvYWRpbmdcbiAgICAgICAgPyBmYWN0b3J5LmxvYWRpbmdDb21wXG4gICAgICAgIDogZmFjdG9yeS5yZXNvbHZlZFxuICAgIH1cbiAgfVxuXG4gIC8qICAqL1xuXG4gIGZ1bmN0aW9uIGdldEZpcnN0Q29tcG9uZW50Q2hpbGQgKGNoaWxkcmVuKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjID0gY2hpbGRyZW5baV07XG4gICAgICAgIGlmIChpc0RlZihjKSAmJiAoaXNEZWYoYy5jb21wb25lbnRPcHRpb25zKSB8fCBpc0FzeW5jUGxhY2Vob2xkZXIoYykpKSB7XG4gICAgICAgICAgcmV0dXJuIGNcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qICAqL1xuXG4gIC8qICAqL1xuXG4gIGZ1bmN0aW9uIGluaXRFdmVudHMgKHZtKSB7XG4gICAgdm0uX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgdm0uX2hhc0hvb2tFdmVudCA9IGZhbHNlO1xuICAgIC8vIGluaXQgcGFyZW50IGF0dGFjaGVkIGV2ZW50c1xuICAgIHZhciBsaXN0ZW5lcnMgPSB2bS4kb3B0aW9ucy5fcGFyZW50TGlzdGVuZXJzO1xuICAgIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgIHVwZGF0ZUNvbXBvbmVudExpc3RlbmVycyh2bSwgbGlzdGVuZXJzKTtcbiAgICB9XG4gIH1cblxuICB2YXIgdGFyZ2V0O1xuXG4gIGZ1bmN0aW9uIGFkZCAoZXZlbnQsIGZuKSB7XG4gICAgdGFyZ2V0LiRvbihldmVudCwgZm4pO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlJDEgKGV2ZW50LCBmbikge1xuICAgIHRhcmdldC4kb2ZmKGV2ZW50LCBmbik7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVPbmNlSGFuZGxlciAoZXZlbnQsIGZuKSB7XG4gICAgdmFyIF90YXJnZXQgPSB0YXJnZXQ7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIG9uY2VIYW5kbGVyICgpIHtcbiAgICAgIHZhciByZXMgPSBmbi5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgaWYgKHJlcyAhPT0gbnVsbCkge1xuICAgICAgICBfdGFyZ2V0LiRvZmYoZXZlbnQsIG9uY2VIYW5kbGVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVDb21wb25lbnRMaXN0ZW5lcnMgKFxuICAgIHZtLFxuICAgIGxpc3RlbmVycyxcbiAgICBvbGRMaXN0ZW5lcnNcbiAgKSB7XG4gICAgdGFyZ2V0ID0gdm07XG4gICAgdXBkYXRlTGlzdGVuZXJzKGxpc3RlbmVycywgb2xkTGlzdGVuZXJzIHx8IHt9LCBhZGQsIHJlbW92ZSQxLCBjcmVhdGVPbmNlSGFuZGxlciwgdm0pO1xuICAgIHRhcmdldCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV2ZW50c01peGluIChWdWUpIHtcbiAgICB2YXIgaG9va1JFID0gL15ob29rOi87XG4gICAgVnVlLnByb3RvdHlwZS4kb24gPSBmdW5jdGlvbiAoZXZlbnQsIGZuKSB7XG4gICAgICB2YXIgdm0gPSB0aGlzO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZXZlbnQpKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gZXZlbnQubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgdm0uJG9uKGV2ZW50W2ldLCBmbik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICh2bS5fZXZlbnRzW2V2ZW50XSB8fCAodm0uX2V2ZW50c1tldmVudF0gPSBbXSkpLnB1c2goZm4pO1xuICAgICAgICAvLyBvcHRpbWl6ZSBob29rOmV2ZW50IGNvc3QgYnkgdXNpbmcgYSBib29sZWFuIGZsYWcgbWFya2VkIGF0IHJlZ2lzdHJhdGlvblxuICAgICAgICAvLyBpbnN0ZWFkIG9mIGEgaGFzaCBsb29rdXBcbiAgICAgICAgaWYgKGhvb2tSRS50ZXN0KGV2ZW50KSkge1xuICAgICAgICAgIHZtLl9oYXNIb29rRXZlbnQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdm1cbiAgICB9O1xuXG4gICAgVnVlLnByb3RvdHlwZS4kb25jZSA9IGZ1bmN0aW9uIChldmVudCwgZm4pIHtcbiAgICAgIHZhciB2bSA9IHRoaXM7XG4gICAgICBmdW5jdGlvbiBvbiAoKSB7XG4gICAgICAgIHZtLiRvZmYoZXZlbnQsIG9uKTtcbiAgICAgICAgZm4uYXBwbHkodm0sIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgICBvbi5mbiA9IGZuO1xuICAgICAgdm0uJG9uKGV2ZW50LCBvbik7XG4gICAgICByZXR1cm4gdm1cbiAgICB9O1xuXG4gICAgVnVlLnByb3RvdHlwZS4kb2ZmID0gZnVuY3Rpb24gKGV2ZW50LCBmbikge1xuICAgICAgdmFyIHZtID0gdGhpcztcbiAgICAgIC8vIGFsbFxuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgIHZtLl9ldmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICByZXR1cm4gdm1cbiAgICAgIH1cbiAgICAgIC8vIGFycmF5IG9mIGV2ZW50c1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZXZlbnQpKSB7XG4gICAgICAgIGZvciAodmFyIGkkMSA9IDAsIGwgPSBldmVudC5sZW5ndGg7IGkkMSA8IGw7IGkkMSsrKSB7XG4gICAgICAgICAgdm0uJG9mZihldmVudFtpJDFdLCBmbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZtXG4gICAgICB9XG4gICAgICAvLyBzcGVjaWZpYyBldmVudFxuICAgICAgdmFyIGNicyA9IHZtLl9ldmVudHNbZXZlbnRdO1xuICAgICAgaWYgKCFjYnMpIHtcbiAgICAgICAgcmV0dXJuIHZtXG4gICAgICB9XG4gICAgICBpZiAoIWZuKSB7XG4gICAgICAgIHZtLl9ldmVudHNbZXZlbnRdID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIHZtXG4gICAgICB9XG4gICAgICAvLyBzcGVjaWZpYyBoYW5kbGVyXG4gICAgICB2YXIgY2I7XG4gICAgICB2YXIgaSA9IGNicy5sZW5ndGg7XG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGNiID0gY2JzW2ldO1xuICAgICAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xuICAgICAgICAgIGNicy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZtXG4gICAgfTtcblxuICAgIFZ1ZS5wcm90b3R5cGUuJGVtaXQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHZhciB2bSA9IHRoaXM7XG4gICAgICB7XG4gICAgICAgIHZhciBsb3dlckNhc2VFdmVudCA9IGV2ZW50LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChsb3dlckNhc2VFdmVudCAhPT0gZXZlbnQgJiYgdm0uX2V2ZW50c1tsb3dlckNhc2VFdmVudF0pIHtcbiAgICAgICAgICB0aXAoXG4gICAgICAgICAgICBcIkV2ZW50IFxcXCJcIiArIGxvd2VyQ2FzZUV2ZW50ICsgXCJcXFwiIGlzIGVtaXR0ZWQgaW4gY29tcG9uZW50IFwiICtcbiAgICAgICAgICAgIChmb3JtYXRDb21wb25lbnROYW1lKHZtKSkgKyBcIiBidXQgdGhlIGhhbmRsZXIgaXMgcmVnaXN0ZXJlZCBmb3IgXFxcIlwiICsgZXZlbnQgKyBcIlxcXCIuIFwiICtcbiAgICAgICAgICAgIFwiTm90ZSB0aGF0IEhUTUwgYXR0cmlidXRlcyBhcmUgY2FzZS1pbnNlbnNpdGl2ZSBhbmQgeW91IGNhbm5vdCB1c2UgXCIgK1xuICAgICAgICAgICAgXCJ2LW9uIHRvIGxpc3RlbiB0byBjYW1lbENhc2UgZXZlbnRzIHdoZW4gdXNpbmcgaW4tRE9NIHRlbXBsYXRlcy4gXCIgK1xuICAgICAgICAgICAgXCJZb3Ugc2hvdWxkIHByb2JhYmx5IHVzZSBcXFwiXCIgKyAoaHlwaGVuYXRlKGV2ZW50KSkgKyBcIlxcXCIgaW5zdGVhZCBvZiBcXFwiXCIgKyBldmVudCArIFwiXFxcIi5cIlxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBjYnMgPSB2bS5fZXZlbnRzW2V2ZW50XTtcbiAgICAgIGlmIChjYnMpIHtcbiAgICAgICAgY2JzID0gY2JzLmxlbmd0aCA+IDEgPyB0b0FycmF5KGNicykgOiBjYnM7XG4gICAgICAgIHZhciBhcmdzID0gdG9BcnJheShhcmd1bWVudHMsIDEpO1xuICAgICAgICB2YXIgaW5mbyA9IFwiZXZlbnQgaGFuZGxlciBmb3IgXFxcIlwiICsgZXZlbnQgKyBcIlxcXCJcIjtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjYnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgaW52b2tlV2l0aEVycm9ySGFuZGxpbmcoY2JzW2ldLCB2bSwgYXJncywgdm0sIGluZm8pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdm1cbiAgICB9O1xuICB9XG5cbiAgLyogICovXG5cbiAgdmFyIGFjdGl2ZUluc3RhbmNlID0gbnVsbDtcbiAgdmFyIGlzVXBkYXRpbmdDaGlsZENvbXBvbmVudCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIHNldEFjdGl2ZUluc3RhbmNlKHZtKSB7XG4gICAgdmFyIHByZXZBY3RpdmVJbnN0YW5jZSA9IGFjdGl2ZUluc3RhbmNlO1xuICAgIGFjdGl2ZUluc3RhbmNlID0gdm07XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIGFjdGl2ZUluc3RhbmNlID0gcHJldkFjdGl2ZUluc3RhbmNlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRMaWZlY3ljbGUgKHZtKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB2bS4kb3B0aW9ucztcblxuICAgIC8vIGxvY2F0ZSBmaXJzdCBub24tYWJzdHJhY3QgcGFyZW50XG4gICAgdmFyIHBhcmVudCA9IG9wdGlvbnMucGFyZW50O1xuICAgIGlmIChwYXJlbnQgJiYgIW9wdGlvbnMuYWJzdHJhY3QpIHtcbiAgICAgIHdoaWxlIChwYXJlbnQuJG9wdGlvbnMuYWJzdHJhY3QgJiYgcGFyZW50LiRwYXJlbnQpIHtcbiAgICAgICAgcGFyZW50ID0gcGFyZW50LiRwYXJlbnQ7XG4gICAgICB9XG4gICAgICBwYXJlbnQuJGNoaWxkcmVuLnB1c2godm0pO1xuICAgIH1cblxuICAgIHZtLiRwYXJlbnQgPSBwYXJlbnQ7XG4gICAgdm0uJHJvb3QgPSBwYXJlbnQgPyBwYXJlbnQuJHJvb3QgOiB2bTtcblxuICAgIHZtLiRjaGlsZHJlbiA9IFtdO1xuICAgIHZtLiRyZWZzID0ge307XG5cbiAgICB2bS5fd2F0Y2hlciA9IG51bGw7XG4gICAgdm0uX2luYWN0aXZlID0gbnVsbDtcbiAgICB2bS5fZGlyZWN0SW5hY3RpdmUgPSBmYWxzZTtcbiAgICB2bS5faXNNb3VudGVkID0gZmFsc2U7XG4gICAgdm0uX2lzRGVzdHJveWVkID0gZmFsc2U7XG4gICAgdm0uX2lzQmVpbmdEZXN0cm95ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxpZmVjeWNsZU1peGluIChWdWUpIHtcbiAgICBWdWUucHJvdG90eXBlLl91cGRhdGUgPSBmdW5jdGlvbiAodm5vZGUsIGh5ZHJhdGluZykge1xuICAgICAgdmFyIHZtID0gdGhpcztcbiAgICAgIHZhciBwcmV2RWwgPSB2bS4kZWw7XG4gICAgICB2YXIgcHJldlZub2RlID0gdm0uX3Zub2RlO1xuICAgICAgdmFyIHJlc3RvcmVBY3RpdmVJbnN0YW5jZSA9IHNldEFjdGl2ZUluc3RhbmNlKHZtKTtcbiAgICAgIHZtLl92bm9kZSA9IHZub2RlO1xuICAgICAgLy8gVnVlLnByb3RvdHlwZS5fX3BhdGNoX18gaXMgaW5qZWN0ZWQgaW4gZW50cnkgcG9pbnRzXG4gICAgICAvLyBiYXNlZCBvbiB0aGUgcmVuZGVyaW5nIGJhY2tlbmQgdXNlZC5cbiAgICAgIGlmICghcHJldlZub2RlKSB7XG4gICAgICAgIC8vIGluaXRpYWwgcmVuZGVyXG4gICAgICAgIHZtLiRlbCA9IHZtLl9fcGF0Y2hfXyh2bS4kZWwsIHZub2RlLCBoeWRyYXRpbmcsIGZhbHNlIC8qIHJlbW92ZU9ubHkgKi8pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gdXBkYXRlc1xuICAgICAgICB2bS4kZWwgPSB2bS5fX3BhdGNoX18ocHJldlZub2RlLCB2bm9kZSk7XG4gICAgICB9XG4gICAgICByZXN0b3JlQWN0aXZlSW5zdGFuY2UoKTtcbiAgICAgIC8vIHVwZGF0ZSBfX3Z1ZV9fIHJlZmVyZW5jZVxuICAgICAgaWYgKHByZXZFbCkge1xuICAgICAgICBwcmV2RWwuX192dWVfXyA9IG51bGw7XG4gICAgICB9XG4gICAgICBpZiAodm0uJGVsKSB7XG4gICAgICAgIHZtLiRlbC5fX3Z1ZV9fID0gdm07XG4gICAgICB9XG4gICAgICAvLyBpZiBwYXJlbnQgaXMgYW4gSE9DLCB1cGRhdGUgaXRzICRlbCBhcyB3ZWxsXG4gICAgICBpZiAodm0uJHZub2RlICYmIHZtLiRwYXJlbnQgJiYgdm0uJHZub2RlID09PSB2bS4kcGFyZW50Ll92bm9kZSkge1xuICAgICAgICB2bS4kcGFyZW50LiRlbCA9IHZtLiRlbDtcbiAgICAgIH1cbiAgICAgIC8vIHVwZGF0ZWQgaG9vayBpcyBjYWxsZWQgYnkgdGhlIHNjaGVkdWxlciB0byBlbnN1cmUgdGhhdCBjaGlsZHJlbiBhcmVcbiAgICAgIC8vIHVwZGF0ZWQgaW4gYSBwYXJlbnQncyB1cGRhdGVkIGhvb2suXG4gICAgfTtcblxuICAgIFZ1ZS5wcm90b3R5cGUuJGZvcmNlVXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHZtID0gdGhpcztcbiAgICAgIGlmICh2bS5fd2F0Y2hlcikge1xuICAgICAgICB2bS5fd2F0Y2hlci51cGRhdGUoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgVnVlLnByb3RvdHlwZS4kZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB2bSA9IHRoaXM7XG4gICAgICBpZiAodm0uX2lzQmVpbmdEZXN0cm95ZWQpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjYWxsSG9vayh2bSwgJ2JlZm9yZURlc3Ryb3knKTtcbiAgICAgIHZtLl9pc0JlaW5nRGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgIC8vIHJlbW92ZSBzZWxmIGZyb20gcGFyZW50XG4gICAgICB2YXIgcGFyZW50ID0gdm0uJHBhcmVudDtcbiAgICAgIGlmIChwYXJlbnQgJiYgIXBhcmVudC5faXNCZWluZ0Rlc3Ryb3llZCAmJiAhdm0uJG9wdGlvbnMuYWJzdHJhY3QpIHtcbiAgICAgICAgcmVtb3ZlKHBhcmVudC4kY2hpbGRyZW4sIHZtKTtcbiAgICAgIH1cbiAgICAgIC8vIHRlYXJkb3duIHdhdGNoZXJzXG4gICAgICBpZiAodm0uX3dhdGNoZXIpIHtcbiAgICAgICAgdm0uX3dhdGNoZXIudGVhcmRvd24oKTtcbiAgICAgIH1cbiAgICAgIHZhciBpID0gdm0uX3dhdGNoZXJzLmxlbmd0aDtcbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgdm0uX3dhdGNoZXJzW2ldLnRlYXJkb3duKCk7XG4gICAgICB9XG4gICAgICAvLyByZW1vdmUgcmVmZXJlbmNlIGZyb20gZGF0YSBvYlxuICAgICAgLy8gZnJvemVuIG9iamVjdCBtYXkgbm90IGhhdmUgb2JzZXJ2ZXIuXG4gICAgICBpZiAodm0uX2RhdGEuX19vYl9fKSB7XG4gICAgICAgIHZtLl9kYXRhLl9fb2JfXy52bUNvdW50LS07XG4gICAgICB9XG4gICAgICAvLyBjYWxsIHRoZSBsYXN0IGhvb2suLi5cbiAgICAgIHZtLl9pc0Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICAvLyBpbnZva2UgZGVzdHJveSBob29rcyBvbiBjdXJyZW50IHJlbmRlcmVkIHRyZWVcbiAgICAgIHZtLl9fcGF0Y2hfXyh2bS5fdm5vZGUsIG51bGwpO1xuICAgICAgLy8gZmlyZSBkZXN0cm95ZWQgaG9va1xuICAgICAgY2FsbEhvb2sodm0sICdkZXN0cm95ZWQnKTtcbiAgICAgIC8vIHR1cm4gb2ZmIGFsbCBpbnN0YW5jZSBsaXN0ZW5lcnMuXG4gICAgICB2bS4kb2ZmKCk7XG4gICAgICAvLyByZW1vdmUgX192dWVfXyByZWZlcmVuY2VcbiAgICAgIGlmICh2bS4kZWwpIHtcbiAgICAgICAgdm0uJGVsLl9fdnVlX18gPSBudWxsO1xuICAgICAgfVxuICAgICAgLy8gcmVsZWFzZSBjaXJjdWxhciByZWZlcmVuY2UgKCM2NzU5KVxuICAgICAgaWYgKHZtLiR2bm9kZSkge1xuICAgICAgICB2bS4kdm5vZGUucGFyZW50ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gbW91bnRDb21wb25lbnQgKFxuICAgIHZtLFxuICAgIGVsLFxuICAgIGh5ZHJhdGluZ1xuICApIHtcbiAgICB2bS4kZWwgPSBlbDtcbiAgICBpZiAoIXZtLiRvcHRpb25zLnJlbmRlcikge1xuICAgICAgdm0uJG9wdGlvbnMucmVuZGVyID0gY3JlYXRlRW1wdHlWTm9kZTtcbiAgICAgIHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgIGlmICgodm0uJG9wdGlvbnMudGVtcGxhdGUgJiYgdm0uJG9wdGlvbnMudGVtcGxhdGUuY2hhckF0KDApICE9PSAnIycpIHx8XG4gICAgICAgICAgdm0uJG9wdGlvbnMuZWwgfHwgZWwpIHtcbiAgICAgICAgICB3YXJuKFxuICAgICAgICAgICAgJ1lvdSBhcmUgdXNpbmcgdGhlIHJ1bnRpbWUtb25seSBidWlsZCBvZiBWdWUgd2hlcmUgdGhlIHRlbXBsYXRlICcgK1xuICAgICAgICAgICAgJ2NvbXBpbGVyIGlzIG5vdCBhdmFpbGFibGUuIEVpdGhlciBwcmUtY29tcGlsZSB0aGUgdGVtcGxhdGVzIGludG8gJyArXG4gICAgICAgICAgICAncmVuZGVyIGZ1bmN0aW9ucywgb3IgdXNlIHRoZSBjb21waWxlci1pbmNsdWRlZCBidWlsZC4nLFxuICAgICAgICAgICAgdm1cbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdhcm4oXG4gICAgICAgICAgICAnRmFpbGVkIHRvIG1vdW50IGNvbXBvbmVudDogdGVtcGxhdGUgb3IgcmVuZGVyIGZ1bmN0aW9uIG5vdCBkZWZpbmVkLicsXG4gICAgICAgICAgICB2bVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY2FsbEhvb2sodm0sICdiZWZvcmVNb3VudCcpO1xuXG4gICAgdmFyIHVwZGF0ZUNvbXBvbmVudDtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoY29uZmlnLnBlcmZvcm1hbmNlICYmIG1hcmspIHtcbiAgICAgIHVwZGF0ZUNvbXBvbmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG5hbWUgPSB2bS5fbmFtZTtcbiAgICAgICAgdmFyIGlkID0gdm0uX3VpZDtcbiAgICAgICAgdmFyIHN0YXJ0VGFnID0gXCJ2dWUtcGVyZi1zdGFydDpcIiArIGlkO1xuICAgICAgICB2YXIgZW5kVGFnID0gXCJ2dWUtcGVyZi1lbmQ6XCIgKyBpZDtcblxuICAgICAgICBtYXJrKHN0YXJ0VGFnKTtcbiAgICAgICAgdmFyIHZub2RlID0gdm0uX3JlbmRlcigpO1xuICAgICAgICBtYXJrKGVuZFRhZyk7XG4gICAgICAgIG1lYXN1cmUoKFwidnVlIFwiICsgbmFtZSArIFwiIHJlbmRlclwiKSwgc3RhcnRUYWcsIGVuZFRhZyk7XG5cbiAgICAgICAgbWFyayhzdGFydFRhZyk7XG4gICAgICAgIHZtLl91cGRhdGUodm5vZGUsIGh5ZHJhdGluZyk7XG4gICAgICAgIG1hcmsoZW5kVGFnKTtcbiAgICAgICAgbWVhc3VyZSgoXCJ2dWUgXCIgKyBuYW1lICsgXCIgcGF0Y2hcIiksIHN0YXJ0VGFnLCBlbmRUYWcpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgdXBkYXRlQ29tcG9uZW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2bS5fdXBkYXRlKHZtLl9yZW5kZXIoKSwgaHlkcmF0aW5nKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gd2Ugc2V0IHRoaXMgdG8gdm0uX3dhdGNoZXIgaW5zaWRlIHRoZSB3YXRjaGVyJ3MgY29uc3RydWN0b3JcbiAgICAvLyBzaW5jZSB0aGUgd2F0Y2hlcidzIGluaXRpYWwgcGF0Y2ggbWF5IGNhbGwgJGZvcmNlVXBkYXRlIChlLmcuIGluc2lkZSBjaGlsZFxuICAgIC8vIGNvbXBvbmVudCdzIG1vdW50ZWQgaG9vayksIHdoaWNoIHJlbGllcyBvbiB2bS5fd2F0Y2hlciBiZWluZyBhbHJlYWR5IGRlZmluZWRcbiAgICBuZXcgV2F0Y2hlcih2bSwgdXBkYXRlQ29tcG9uZW50LCBub29wLCB7XG4gICAgICBiZWZvcmU6IGZ1bmN0aW9uIGJlZm9yZSAoKSB7XG4gICAgICAgIGlmICh2bS5faXNNb3VudGVkICYmICF2bS5faXNEZXN0cm95ZWQpIHtcbiAgICAgICAgICBjYWxsSG9vayh2bSwgJ2JlZm9yZVVwZGF0ZScpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgdHJ1ZSAvKiBpc1JlbmRlcldhdGNoZXIgKi8pO1xuICAgIGh5ZHJhdGluZyA9IGZhbHNlO1xuXG4gICAgLy8gbWFudWFsbHkgbW91bnRlZCBpbnN0YW5jZSwgY2FsbCBtb3VudGVkIG9uIHNlbGZcbiAgICAvLyBtb3VudGVkIGlzIGNhbGxlZCBmb3IgcmVuZGVyLWNyZWF0ZWQgY2hpbGQgY29tcG9uZW50cyBpbiBpdHMgaW5zZXJ0ZWQgaG9va1xuICAgIGlmICh2bS4kdm5vZGUgPT0gbnVsbCkge1xuICAgICAgdm0uX2lzTW91bnRlZCA9IHRydWU7XG4gICAgICBjYWxsSG9vayh2bSwgJ21vdW50ZWQnKTtcbiAgICB9XG4gICAgcmV0dXJuIHZtXG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVDaGlsZENvbXBvbmVudCAoXG4gICAgdm0sXG4gICAgcHJvcHNEYXRhLFxuICAgIGxpc3RlbmVycyxcbiAgICBwYXJlbnRWbm9kZSxcbiAgICByZW5kZXJDaGlsZHJlblxuICApIHtcbiAgICB7XG4gICAgICBpc1VwZGF0aW5nQ2hpbGRDb21wb25lbnQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIGRldGVybWluZSB3aGV0aGVyIGNvbXBvbmVudCBoYXMgc2xvdCBjaGlsZHJlblxuICAgIC8vIHdlIG5lZWQgdG8gZG8gdGhpcyBiZWZvcmUgb3ZlcndyaXRpbmcgJG9wdGlvbnMuX3JlbmRlckNoaWxkcmVuLlxuXG4gICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGR5bmFtaWMgc2NvcGVkU2xvdHMgKGhhbmQtd3JpdHRlbiBvciBjb21waWxlZCBidXQgd2l0aFxuICAgIC8vIGR5bmFtaWMgc2xvdCBuYW1lcykuIFN0YXRpYyBzY29wZWQgc2xvdHMgY29tcGlsZWQgZnJvbSB0ZW1wbGF0ZSBoYXMgdGhlXG4gICAgLy8gXCIkc3RhYmxlXCIgbWFya2VyLlxuICAgIHZhciBuZXdTY29wZWRTbG90cyA9IHBhcmVudFZub2RlLmRhdGEuc2NvcGVkU2xvdHM7XG4gICAgdmFyIG9sZFNjb3BlZFNsb3RzID0gdm0uJHNjb3BlZFNsb3RzO1xuICAgIHZhciBoYXNEeW5hbWljU2NvcGVkU2xvdCA9ICEhKFxuICAgICAgKG5ld1Njb3BlZFNsb3RzICYmICFuZXdTY29wZWRTbG90cy4kc3RhYmxlKSB8fFxuICAgICAgKG9sZFNjb3BlZFNsb3RzICE9PSBlbXB0eU9iamVjdCAmJiAhb2xkU2NvcGVkU2xvdHMuJHN0YWJsZSkgfHxcbiAgICAgIChuZXdTY29wZWRTbG90cyAmJiB2bS4kc2NvcGVkU2xvdHMuJGtleSAhPT0gbmV3U2NvcGVkU2xvdHMuJGtleSkgfHxcbiAgICAgICghbmV3U2NvcGVkU2xvdHMgJiYgdm0uJHNjb3BlZFNsb3RzLiRrZXkpXG4gICAgKTtcblxuICAgIC8vIEFueSBzdGF0aWMgc2xvdCBjaGlsZHJlbiBmcm9tIHRoZSBwYXJlbnQgbWF5IGhhdmUgY2hhbmdlZCBkdXJpbmcgcGFyZW50J3NcbiAgICAvLyB1cGRhdGUuIER5bmFtaWMgc2NvcGVkIHNsb3RzIG1heSBhbHNvIGhhdmUgY2hhbmdlZC4gSW4gc3VjaCBjYXNlcywgYSBmb3JjZWRcbiAgICAvLyB1cGRhdGUgaXMgbmVjZXNzYXJ5IHRvIGVuc3VyZSBjb3JyZWN0bmVzcy5cbiAgICB2YXIgbmVlZHNGb3JjZVVwZGF0ZSA9ICEhKFxuICAgICAgcmVuZGVyQ2hpbGRyZW4gfHwgICAgICAgICAgICAgICAvLyBoYXMgbmV3IHN0YXRpYyBzbG90c1xuICAgICAgdm0uJG9wdGlvbnMuX3JlbmRlckNoaWxkcmVuIHx8ICAvLyBoYXMgb2xkIHN0YXRpYyBzbG90c1xuICAgICAgaGFzRHluYW1pY1Njb3BlZFNsb3RcbiAgICApO1xuXG4gICAgdm0uJG9wdGlvbnMuX3BhcmVudFZub2RlID0gcGFyZW50Vm5vZGU7XG4gICAgdm0uJHZub2RlID0gcGFyZW50Vm5vZGU7IC8vIHVwZGF0ZSB2bSdzIHBsYWNlaG9sZGVyIG5vZGUgd2l0aG91dCByZS1yZW5kZXJcblxuICAgIGlmICh2bS5fdm5vZGUpIHsgLy8gdXBkYXRlIGNoaWxkIHRyZWUncyBwYXJlbnRcbiAgICAgIHZtLl92bm9kZS5wYXJlbnQgPSBwYXJlbnRWbm9kZTtcbiAgICB9XG4gICAgdm0uJG9wdGlvbnMuX3JlbmRlckNoaWxkcmVuID0gcmVuZGVyQ2hpbGRyZW47XG5cbiAgICAvLyB1cGRhdGUgJGF0dHJzIGFuZCAkbGlzdGVuZXJzIGhhc2hcbiAgICAvLyB0aGVzZSBhcmUgYWxzbyByZWFjdGl2ZSBzbyB0aGV5IG1heSB0cmlnZ2VyIGNoaWxkIHVwZGF0ZSBpZiB0aGUgY2hpbGRcbiAgICAvLyB1c2VkIHRoZW0gZHVyaW5nIHJlbmRlclxuICAgIHZtLiRhdHRycyA9IHBhcmVudFZub2RlLmRhdGEuYXR0cnMgfHwgZW1wdHlPYmplY3Q7XG4gICAgdm0uJGxpc3RlbmVycyA9IGxpc3RlbmVycyB8fCBlbXB0eU9iamVjdDtcblxuICAgIC8vIHVwZGF0ZSBwcm9wc1xuICAgIGlmIChwcm9wc0RhdGEgJiYgdm0uJG9wdGlvbnMucHJvcHMpIHtcbiAgICAgIHRvZ2dsZU9ic2VydmluZyhmYWxzZSk7XG4gICAgICB2YXIgcHJvcHMgPSB2bS5fcHJvcHM7XG4gICAgICB2YXIgcHJvcEtleXMgPSB2bS4kb3B0aW9ucy5fcHJvcEtleXMgfHwgW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBrZXkgPSBwcm9wS2V5c1tpXTtcbiAgICAgICAgdmFyIHByb3BPcHRpb25zID0gdm0uJG9wdGlvbnMucHJvcHM7IC8vIHd0ZiBmbG93P1xuICAgICAgICBwcm9wc1trZXldID0gdmFsaWRhdGVQcm9wKGtleSwgcHJvcE9wdGlvbnMsIHByb3BzRGF0YSwgdm0pO1xuICAgICAgfVxuICAgICAgdG9nZ2xlT2JzZXJ2aW5nKHRydWUpO1xuICAgICAgLy8ga2VlcCBhIGNvcHkgb2YgcmF3IHByb3BzRGF0YVxuICAgICAgdm0uJG9wdGlvbnMucHJvcHNEYXRhID0gcHJvcHNEYXRhO1xuICAgIH1cblxuICAgIC8vIHVwZGF0ZSBsaXN0ZW5lcnNcbiAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMgfHwgZW1wdHlPYmplY3Q7XG4gICAgdmFyIG9sZExpc3RlbmVycyA9IHZtLiRvcHRpb25zLl9wYXJlbnRMaXN0ZW5lcnM7XG4gICAgdm0uJG9wdGlvbnMuX3BhcmVudExpc3RlbmVycyA9IGxpc3RlbmVycztcbiAgICB1cGRhdGVDb21wb25lbnRMaXN0ZW5lcnModm0sIGxpc3RlbmVycywgb2xkTGlzdGVuZXJzKTtcblxuICAgIC8vIHJlc29sdmUgc2xvdHMgKyBmb3JjZSB1cGRhdGUgaWYgaGFzIGNoaWxkcmVuXG4gICAgaWYgKG5lZWRzRm9yY2VVcGRhdGUpIHtcbiAgICAgIHZtLiRzbG90cyA9IHJlc29sdmVTbG90cyhyZW5kZXJDaGlsZHJlbiwgcGFyZW50Vm5vZGUuY29udGV4dCk7XG4gICAgICB2bS4kZm9yY2VVcGRhdGUoKTtcbiAgICB9XG5cbiAgICB7XG4gICAgICBpc1VwZGF0aW5nQ2hpbGRDb21wb25lbnQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpc0luSW5hY3RpdmVUcmVlICh2bSkge1xuICAgIHdoaWxlICh2bSAmJiAodm0gPSB2bS4kcGFyZW50KSkge1xuICAgICAgaWYgKHZtLl9pbmFjdGl2ZSkgeyByZXR1cm4gdHJ1ZSB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgZnVuY3Rpb24gYWN0aXZhdGVDaGlsZENvbXBvbmVudCAodm0sIGRpcmVjdCkge1xuICAgIGlmIChkaXJlY3QpIHtcbiAgICAgIHZtLl9kaXJlY3RJbmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgaWYgKGlzSW5JbmFjdGl2ZVRyZWUodm0pKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodm0uX2RpcmVjdEluYWN0aXZlKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKHZtLl9pbmFjdGl2ZSB8fCB2bS5faW5hY3RpdmUgPT09IG51bGwpIHtcbiAgICAgIHZtLl9pbmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2bS4kY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYWN0aXZhdGVDaGlsZENvbXBvbmVudCh2bS4kY2hpbGRyZW5baV0pO1xuICAgICAgfVxuICAgICAgY2FsbEhvb2sodm0sICdhY3RpdmF0ZWQnKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkZWFjdGl2YXRlQ2hpbGRDb21wb25lbnQgKHZtLCBkaXJlY3QpIHtcbiAgICBpZiAoZGlyZWN0KSB7XG4gICAgICB2bS5fZGlyZWN0SW5hY3RpdmUgPSB0cnVlO1xuICAgICAgaWYgKGlzSW5JbmFjdGl2ZVRyZWUodm0pKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXZtLl9pbmFjdGl2ZSkge1xuICAgICAgdm0uX2luYWN0aXZlID0gdHJ1ZTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdm0uJGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRlYWN0aXZhdGVDaGlsZENvbXBvbmVudCh2bS4kY2hpbGRyZW5baV0pO1xuICAgICAgfVxuICAgICAgY2FsbEhvb2sodm0sICdkZWFjdGl2YXRlZCcpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbGxIb29rICh2bSwgaG9vaykge1xuICAgIC8vICM3NTczIGRpc2FibGUgZGVwIGNvbGxlY3Rpb24gd2hlbiBpbnZva2luZyBsaWZlY3ljbGUgaG9va3NcbiAgICBwdXNoVGFyZ2V0KCk7XG4gICAgdmFyIGhhbmRsZXJzID0gdm0uJG9wdGlvbnNbaG9va107XG4gICAgdmFyIGluZm8gPSBob29rICsgXCIgaG9va1wiO1xuICAgIGlmIChoYW5kbGVycykge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBoYW5kbGVycy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgaW52b2tlV2l0aEVycm9ySGFuZGxpbmcoaGFuZGxlcnNbaV0sIHZtLCBudWxsLCB2bSwgaW5mbyk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh2bS5faGFzSG9va0V2ZW50KSB7XG4gICAgICB2bS4kZW1pdCgnaG9vazonICsgaG9vayk7XG4gICAgfVxuICAgIHBvcFRhcmdldCgpO1xuICB9XG5cbiAgLyogICovXG5cbiAgdmFyIE1BWF9VUERBVEVfQ09VTlQgPSAxMDA7XG5cbiAgdmFyIHF1ZXVlID0gW107XG4gIHZhciBhY3RpdmF0ZWRDaGlsZHJlbiA9IFtdO1xuICB2YXIgaGFzID0ge307XG4gIHZhciBjaXJjdWxhciA9IHt9O1xuICB2YXIgd2FpdGluZyA9IGZhbHNlO1xuICB2YXIgZmx1c2hpbmcgPSBmYWxzZTtcbiAgdmFyIGluZGV4ID0gMDtcblxuICAvKipcbiAgICogUmVzZXQgdGhlIHNjaGVkdWxlcidzIHN0YXRlLlxuICAgKi9cbiAgZnVuY3Rpb24gcmVzZXRTY2hlZHVsZXJTdGF0ZSAoKSB7XG4gICAgaW5kZXggPSBxdWV1ZS5sZW5ndGggPSBhY3RpdmF0ZWRDaGlsZHJlbi5sZW5ndGggPSAwO1xuICAgIGhhcyA9IHt9O1xuICAgIHtcbiAgICAgIGNpcmN1bGFyID0ge307XG4gICAgfVxuICAgIHdhaXRpbmcgPSBmbHVzaGluZyA9IGZhbHNlO1xuICB9XG5cbiAgLy8gQXN5bmMgZWRnZSBjYXNlICM2NTY2IHJlcXVpcmVzIHNhdmluZyB0aGUgdGltZXN0YW1wIHdoZW4gZXZlbnQgbGlzdGVuZXJzIGFyZVxuICAvLyBhdHRhY2hlZC4gSG93ZXZlciwgY2FsbGluZyBwZXJmb3JtYW5jZS5ub3coKSBoYXMgYSBwZXJmIG92ZXJoZWFkIGVzcGVjaWFsbHlcbiAgLy8gaWYgdGhlIHBhZ2UgaGFzIHRob3VzYW5kcyBvZiBldmVudCBsaXN0ZW5lcnMuIEluc3RlYWQsIHdlIHRha2UgYSB0aW1lc3RhbXBcbiAgLy8gZXZlcnkgdGltZSB0aGUgc2NoZWR1bGVyIGZsdXNoZXMgYW5kIHVzZSB0aGF0IGZvciBhbGwgZXZlbnQgbGlzdGVuZXJzXG4gIC8vIGF0dGFjaGVkIGR1cmluZyB0aGF0IGZsdXNoLlxuICB2YXIgY3VycmVudEZsdXNoVGltZXN0YW1wID0gMDtcblxuICAvLyBBc3luYyBlZGdlIGNhc2UgZml4IHJlcXVpcmVzIHN0b3JpbmcgYW4gZXZlbnQgbGlzdGVuZXIncyBhdHRhY2ggdGltZXN0YW1wLlxuICB2YXIgZ2V0Tm93ID0gRGF0ZS5ub3c7XG5cbiAgLy8gRGV0ZXJtaW5lIHdoYXQgZXZlbnQgdGltZXN0YW1wIHRoZSBicm93c2VyIGlzIHVzaW5nLiBBbm5veWluZ2x5LCB0aGVcbiAgLy8gdGltZXN0YW1wIGNhbiBlaXRoZXIgYmUgaGktcmVzIChyZWxhdGl2ZSB0byBwYWdlIGxvYWQpIG9yIGxvdy1yZXNcbiAgLy8gKHJlbGF0aXZlIHRvIFVOSVggZXBvY2gpLCBzbyBpbiBvcmRlciB0byBjb21wYXJlIHRpbWUgd2UgaGF2ZSB0byB1c2UgdGhlXG4gIC8vIHNhbWUgdGltZXN0YW1wIHR5cGUgd2hlbiBzYXZpbmcgdGhlIGZsdXNoIHRpbWVzdGFtcC5cbiAgLy8gQWxsIElFIHZlcnNpb25zIHVzZSBsb3ctcmVzIGV2ZW50IHRpbWVzdGFtcHMsIGFuZCBoYXZlIHByb2JsZW1hdGljIGNsb2NrXG4gIC8vIGltcGxlbWVudGF0aW9ucyAoIzk2MzIpXG4gIGlmIChpbkJyb3dzZXIgJiYgIWlzSUUpIHtcbiAgICB2YXIgcGVyZm9ybWFuY2UgPSB3aW5kb3cucGVyZm9ybWFuY2U7XG4gICAgaWYgKFxuICAgICAgcGVyZm9ybWFuY2UgJiZcbiAgICAgIHR5cGVvZiBwZXJmb3JtYW5jZS5ub3cgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgIGdldE5vdygpID4gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50JykudGltZVN0YW1wXG4gICAgKSB7XG4gICAgICAvLyBpZiB0aGUgZXZlbnQgdGltZXN0YW1wLCBhbHRob3VnaCBldmFsdWF0ZWQgQUZURVIgdGhlIERhdGUubm93KCksIGlzXG4gICAgICAvLyBzbWFsbGVyIHRoYW4gaXQsIGl0IG1lYW5zIHRoZSBldmVudCBpcyB1c2luZyBhIGhpLXJlcyB0aW1lc3RhbXAsXG4gICAgICAvLyBhbmQgd2UgbmVlZCB0byB1c2UgdGhlIGhpLXJlcyB2ZXJzaW9uIGZvciBldmVudCBsaXN0ZW5lciB0aW1lc3RhbXBzIGFzXG4gICAgICAvLyB3ZWxsLlxuICAgICAgZ2V0Tm93ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gcGVyZm9ybWFuY2Uubm93KCk7IH07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZsdXNoIGJvdGggcXVldWVzIGFuZCBydW4gdGhlIHdhdGNoZXJzLlxuICAgKi9cbiAgZnVuY3Rpb24gZmx1c2hTY2hlZHVsZXJRdWV1ZSAoKSB7XG4gICAgY3VycmVudEZsdXNoVGltZXN0YW1wID0gZ2V0Tm93KCk7XG4gICAgZmx1c2hpbmcgPSB0cnVlO1xuICAgIHZhciB3YXRjaGVyLCBpZDtcblxuICAgIC8vIFNvcnQgcXVldWUgYmVmb3JlIGZsdXNoLlxuICAgIC8vIFRoaXMgZW5zdXJlcyB0aGF0OlxuICAgIC8vIDEuIENvbXBvbmVudHMgYXJlIHVwZGF0ZWQgZnJvbSBwYXJlbnQgdG8gY2hpbGQuIChiZWNhdXNlIHBhcmVudCBpcyBhbHdheXNcbiAgICAvLyAgICBjcmVhdGVkIGJlZm9yZSB0aGUgY2hpbGQpXG4gICAgLy8gMi4gQSBjb21wb25lbnQncyB1c2VyIHdhdGNoZXJzIGFyZSBydW4gYmVmb3JlIGl0cyByZW5kZXIgd2F0Y2hlciAoYmVjYXVzZVxuICAgIC8vICAgIHVzZXIgd2F0Y2hlcnMgYXJlIGNyZWF0ZWQgYmVmb3JlIHRoZSByZW5kZXIgd2F0Y2hlcilcbiAgICAvLyAzLiBJZiBhIGNvbXBvbmVudCBpcyBkZXN0cm95ZWQgZHVyaW5nIGEgcGFyZW50IGNvbXBvbmVudCdzIHdhdGNoZXIgcnVuLFxuICAgIC8vICAgIGl0cyB3YXRjaGVycyBjYW4gYmUgc2tpcHBlZC5cbiAgICBxdWV1ZS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhLmlkIC0gYi5pZDsgfSk7XG5cbiAgICAvLyBkbyBub3QgY2FjaGUgbGVuZ3RoIGJlY2F1c2UgbW9yZSB3YXRjaGVycyBtaWdodCBiZSBwdXNoZWRcbiAgICAvLyBhcyB3ZSBydW4gZXhpc3Rpbmcgd2F0Y2hlcnNcbiAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBxdWV1ZS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHdhdGNoZXIgPSBxdWV1ZVtpbmRleF07XG4gICAgICBpZiAod2F0Y2hlci5iZWZvcmUpIHtcbiAgICAgICAgd2F0Y2hlci5iZWZvcmUoKTtcbiAgICAgIH1cbiAgICAgIGlkID0gd2F0Y2hlci5pZDtcbiAgICAgIGhhc1tpZF0gPSBudWxsO1xuICAgICAgd2F0Y2hlci5ydW4oKTtcbiAgICAgIC8vIGluIGRldiBidWlsZCwgY2hlY2sgYW5kIHN0b3AgY2lyY3VsYXIgdXBkYXRlcy5cbiAgICAgIGlmIChoYXNbaWRdICE9IG51bGwpIHtcbiAgICAgICAgY2lyY3VsYXJbaWRdID0gKGNpcmN1bGFyW2lkXSB8fCAwKSArIDE7XG4gICAgICAgIGlmIChjaXJjdWxhcltpZF0gPiBNQVhfVVBEQVRFX0NPVU5UKSB7XG4gICAgICAgICAgd2FybihcbiAgICAgICAgICAgICdZb3UgbWF5IGhhdmUgYW4gaW5maW5pdGUgdXBkYXRlIGxvb3AgJyArIChcbiAgICAgICAgICAgICAgd2F0Y2hlci51c2VyXG4gICAgICAgICAgICAgICAgPyAoXCJpbiB3YXRjaGVyIHdpdGggZXhwcmVzc2lvbiBcXFwiXCIgKyAod2F0Y2hlci5leHByZXNzaW9uKSArIFwiXFxcIlwiKVxuICAgICAgICAgICAgICAgIDogXCJpbiBhIGNvbXBvbmVudCByZW5kZXIgZnVuY3Rpb24uXCJcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICB3YXRjaGVyLnZtXG4gICAgICAgICAgKTtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8ga2VlcCBjb3BpZXMgb2YgcG9zdCBxdWV1ZXMgYmVmb3JlIHJlc2V0dGluZyBzdGF0ZVxuICAgIHZhciBhY3RpdmF0ZWRRdWV1ZSA9IGFjdGl2YXRlZENoaWxkcmVuLnNsaWNlKCk7XG4gICAgdmFyIHVwZGF0ZWRRdWV1ZSA9IHF1ZXVlLnNsaWNlKCk7XG5cbiAgICByZXNldFNjaGVkdWxlclN0YXRlKCk7XG5cbiAgICAvLyBjYWxsIGNvbXBvbmVudCB1cGRhdGVkIGFuZCBhY3RpdmF0ZWQgaG9va3NcbiAgICBjYWxsQWN0aXZhdGVkSG9va3MoYWN0aXZhdGVkUXVldWUpO1xuICAgIGNhbGxVcGRhdGVkSG9va3ModXBkYXRlZFF1ZXVlKTtcblxuICAgIC8vIGRldnRvb2wgaG9va1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmIChkZXZ0b29scyAmJiBjb25maWcuZGV2dG9vbHMpIHtcbiAgICAgIGRldnRvb2xzLmVtaXQoJ2ZsdXNoJyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2FsbFVwZGF0ZWRIb29rcyAocXVldWUpIHtcbiAgICB2YXIgaSA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICB2YXIgd2F0Y2hlciA9IHF1ZXVlW2ldO1xuICAgICAgdmFyIHZtID0gd2F0Y2hlci52bTtcbiAgICAgIGlmICh2bS5fd2F0Y2hlciA9PT0gd2F0Y2hlciAmJiB2bS5faXNNb3VudGVkICYmICF2bS5faXNEZXN0cm95ZWQpIHtcbiAgICAgICAgY2FsbEhvb2sodm0sICd1cGRhdGVkJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFF1ZXVlIGEga2VwdC1hbGl2ZSBjb21wb25lbnQgdGhhdCB3YXMgYWN0aXZhdGVkIGR1cmluZyBwYXRjaC5cbiAgICogVGhlIHF1ZXVlIHdpbGwgYmUgcHJvY2Vzc2VkIGFmdGVyIHRoZSBlbnRpcmUgdHJlZSBoYXMgYmVlbiBwYXRjaGVkLlxuICAgKi9cbiAgZnVuY3Rpb24gcXVldWVBY3RpdmF0ZWRDb21wb25lbnQgKHZtKSB7XG4gICAgLy8gc2V0dGluZyBfaW5hY3RpdmUgdG8gZmFsc2UgaGVyZSBzbyB0aGF0IGEgcmVuZGVyIGZ1bmN0aW9uIGNhblxuICAgIC8vIHJlbHkgb24gY2hlY2tpbmcgd2hldGhlciBpdCdzIGluIGFuIGluYWN0aXZlIHRyZWUgKGUuZy4gcm91dGVyLXZpZXcpXG4gICAgdm0uX2luYWN0aXZlID0gZmFsc2U7XG4gICAgYWN0aXZhdGVkQ2hpbGRyZW4ucHVzaCh2bSk7XG4gIH1cblxuICBmdW5jdGlvbiBjYWxsQWN0aXZhdGVkSG9va3MgKHF1ZXVlKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBxdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgcXVldWVbaV0uX2luYWN0aXZlID0gdHJ1ZTtcbiAgICAgIGFjdGl2YXRlQ2hpbGRDb21wb25lbnQocXVldWVbaV0sIHRydWUgLyogdHJ1ZSAqLyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFB1c2ggYSB3YXRjaGVyIGludG8gdGhlIHdhdGNoZXIgcXVldWUuXG4gICAqIEpvYnMgd2l0aCBkdXBsaWNhdGUgSURzIHdpbGwgYmUgc2tpcHBlZCB1bmxlc3MgaXQnc1xuICAgKiBwdXNoZWQgd2hlbiB0aGUgcXVldWUgaXMgYmVpbmcgZmx1c2hlZC5cbiAgICovXG4gIGZ1bmN0aW9uIHF1ZXVlV2F0Y2hlciAod2F0Y2hlcikge1xuICAgIHZhciBpZCA9IHdhdGNoZXIuaWQ7XG4gICAgaWYgKGhhc1tpZF0gPT0gbnVsbCkge1xuICAgICAgaGFzW2lkXSA9IHRydWU7XG4gICAgICBpZiAoIWZsdXNoaW5nKSB7XG4gICAgICAgIHF1ZXVlLnB1c2god2F0Y2hlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBpZiBhbHJlYWR5IGZsdXNoaW5nLCBzcGxpY2UgdGhlIHdhdGNoZXIgYmFzZWQgb24gaXRzIGlkXG4gICAgICAgIC8vIGlmIGFscmVhZHkgcGFzdCBpdHMgaWQsIGl0IHdpbGwgYmUgcnVuIG5leHQgaW1tZWRpYXRlbHkuXG4gICAgICAgIHZhciBpID0gcXVldWUubGVuZ3RoIC0gMTtcbiAgICAgICAgd2hpbGUgKGkgPiBpbmRleCAmJiBxdWV1ZVtpXS5pZCA+IHdhdGNoZXIuaWQpIHtcbiAgICAgICAgICBpLS07XG4gICAgICAgIH1cbiAgICAgICAgcXVldWUuc3BsaWNlKGkgKyAxLCAwLCB3YXRjaGVyKTtcbiAgICAgIH1cbiAgICAgIC8vIHF1ZXVlIHRoZSBmbHVzaFxuICAgICAgaWYgKCF3YWl0aW5nKSB7XG4gICAgICAgIHdhaXRpbmcgPSB0cnVlO1xuXG4gICAgICAgIGlmICghY29uZmlnLmFzeW5jKSB7XG4gICAgICAgICAgZmx1c2hTY2hlZHVsZXJRdWV1ZSgpO1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIG5leHRUaWNrKGZsdXNoU2NoZWR1bGVyUXVldWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qICAqL1xuXG5cblxuICB2YXIgdWlkJDIgPSAwO1xuXG4gIC8qKlxuICAgKiBBIHdhdGNoZXIgcGFyc2VzIGFuIGV4cHJlc3Npb24sIGNvbGxlY3RzIGRlcGVuZGVuY2llcyxcbiAgICogYW5kIGZpcmVzIGNhbGxiYWNrIHdoZW4gdGhlIGV4cHJlc3Npb24gdmFsdWUgY2hhbmdlcy5cbiAgICogVGhpcyBpcyB1c2VkIGZvciBib3RoIHRoZSAkd2F0Y2goKSBhcGkgYW5kIGRpcmVjdGl2ZXMuXG4gICAqL1xuICB2YXIgV2F0Y2hlciA9IGZ1bmN0aW9uIFdhdGNoZXIgKFxuICAgIHZtLFxuICAgIGV4cE9yRm4sXG4gICAgY2IsXG4gICAgb3B0aW9ucyxcbiAgICBpc1JlbmRlcldhdGNoZXJcbiAgKSB7XG4gICAgdGhpcy52bSA9IHZtO1xuICAgIGlmIChpc1JlbmRlcldhdGNoZXIpIHtcbiAgICAgIHZtLl93YXRjaGVyID0gdGhpcztcbiAgICB9XG4gICAgdm0uX3dhdGNoZXJzLnB1c2godGhpcyk7XG4gICAgLy8gb3B0aW9uc1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICB0aGlzLmRlZXAgPSAhIW9wdGlvbnMuZGVlcDtcbiAgICAgIHRoaXMudXNlciA9ICEhb3B0aW9ucy51c2VyO1xuICAgICAgdGhpcy5sYXp5ID0gISFvcHRpb25zLmxhenk7XG4gICAgICB0aGlzLnN5bmMgPSAhIW9wdGlvbnMuc3luYztcbiAgICAgIHRoaXMuYmVmb3JlID0gb3B0aW9ucy5iZWZvcmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGVlcCA9IHRoaXMudXNlciA9IHRoaXMubGF6eSA9IHRoaXMuc3luYyA9IGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLmNiID0gY2I7XG4gICAgdGhpcy5pZCA9ICsrdWlkJDI7IC8vIHVpZCBmb3IgYmF0Y2hpbmdcbiAgICB0aGlzLmFjdGl2ZSA9IHRydWU7XG4gICAgdGhpcy5kaXJ0eSA9IHRoaXMubGF6eTsgLy8gZm9yIGxhenkgd2F0Y2hlcnNcbiAgICB0aGlzLmRlcHMgPSBbXTtcbiAgICB0aGlzLm5ld0RlcHMgPSBbXTtcbiAgICB0aGlzLmRlcElkcyA9IG5ldyBfU2V0KCk7XG4gICAgdGhpcy5uZXdEZXBJZHMgPSBuZXcgX1NldCgpO1xuICAgIHRoaXMuZXhwcmVzc2lvbiA9IGV4cE9yRm4udG9TdHJpbmcoKTtcbiAgICAvLyBwYXJzZSBleHByZXNzaW9uIGZvciBnZXR0ZXJcbiAgICBpZiAodHlwZW9mIGV4cE9yRm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuZ2V0dGVyID0gZXhwT3JGbjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5nZXR0ZXIgPSBwYXJzZVBhdGgoZXhwT3JGbik7XG4gICAgICBpZiAoIXRoaXMuZ2V0dGVyKSB7XG4gICAgICAgIHRoaXMuZ2V0dGVyID0gbm9vcDtcbiAgICAgICAgd2FybihcbiAgICAgICAgICBcIkZhaWxlZCB3YXRjaGluZyBwYXRoOiBcXFwiXCIgKyBleHBPckZuICsgXCJcXFwiIFwiICtcbiAgICAgICAgICAnV2F0Y2hlciBvbmx5IGFjY2VwdHMgc2ltcGxlIGRvdC1kZWxpbWl0ZWQgcGF0aHMuICcgK1xuICAgICAgICAgICdGb3IgZnVsbCBjb250cm9sLCB1c2UgYSBmdW5jdGlvbiBpbnN0ZWFkLicsXG4gICAgICAgICAgdm1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy52YWx1ZSA9IHRoaXMubGF6eVxuICAgICAgPyB1bmRlZmluZWRcbiAgICAgIDogdGhpcy5nZXQoKTtcbiAgfTtcblxuICAvKipcbiAgICogRXZhbHVhdGUgdGhlIGdldHRlciwgYW5kIHJlLWNvbGxlY3QgZGVwZW5kZW5jaWVzLlxuICAgKi9cbiAgV2F0Y2hlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0ICgpIHtcbiAgICBwdXNoVGFyZ2V0KHRoaXMpO1xuICAgIHZhciB2YWx1ZTtcbiAgICB2YXIgdm0gPSB0aGlzLnZtO1xuICAgIHRyeSB7XG4gICAgICB2YWx1ZSA9IHRoaXMuZ2V0dGVyLmNhbGwodm0sIHZtKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAodGhpcy51c2VyKSB7XG4gICAgICAgIGhhbmRsZUVycm9yKGUsIHZtLCAoXCJnZXR0ZXIgZm9yIHdhdGNoZXIgXFxcIlwiICsgKHRoaXMuZXhwcmVzc2lvbikgKyBcIlxcXCJcIikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZVxuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICAvLyBcInRvdWNoXCIgZXZlcnkgcHJvcGVydHkgc28gdGhleSBhcmUgYWxsIHRyYWNrZWQgYXNcbiAgICAgIC8vIGRlcGVuZGVuY2llcyBmb3IgZGVlcCB3YXRjaGluZ1xuICAgICAgaWYgKHRoaXMuZGVlcCkge1xuICAgICAgICB0cmF2ZXJzZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgICBwb3BUYXJnZXQoKTtcbiAgICAgIHRoaXMuY2xlYW51cERlcHMoKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlXG4gIH07XG5cbiAgLyoqXG4gICAqIEFkZCBhIGRlcGVuZGVuY3kgdG8gdGhpcyBkaXJlY3RpdmUuXG4gICAqL1xuICBXYXRjaGVyLnByb3RvdHlwZS5hZGREZXAgPSBmdW5jdGlvbiBhZGREZXAgKGRlcCkge1xuICAgIHZhciBpZCA9IGRlcC5pZDtcbiAgICBpZiAoIXRoaXMubmV3RGVwSWRzLmhhcyhpZCkpIHtcbiAgICAgIHRoaXMubmV3RGVwSWRzLmFkZChpZCk7XG4gICAgICB0aGlzLm5ld0RlcHMucHVzaChkZXApO1xuICAgICAgaWYgKCF0aGlzLmRlcElkcy5oYXMoaWQpKSB7XG4gICAgICAgIGRlcC5hZGRTdWIodGhpcyk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBDbGVhbiB1cCBmb3IgZGVwZW5kZW5jeSBjb2xsZWN0aW9uLlxuICAgKi9cbiAgV2F0Y2hlci5wcm90b3R5cGUuY2xlYW51cERlcHMgPSBmdW5jdGlvbiBjbGVhbnVwRGVwcyAoKSB7XG4gICAgdmFyIGkgPSB0aGlzLmRlcHMubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIHZhciBkZXAgPSB0aGlzLmRlcHNbaV07XG4gICAgICBpZiAoIXRoaXMubmV3RGVwSWRzLmhhcyhkZXAuaWQpKSB7XG4gICAgICAgIGRlcC5yZW1vdmVTdWIodGhpcyk7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciB0bXAgPSB0aGlzLmRlcElkcztcbiAgICB0aGlzLmRlcElkcyA9IHRoaXMubmV3RGVwSWRzO1xuICAgIHRoaXMubmV3RGVwSWRzID0gdG1wO1xuICAgIHRoaXMubmV3RGVwSWRzLmNsZWFyKCk7XG4gICAgdG1wID0gdGhpcy5kZXBzO1xuICAgIHRoaXMuZGVwcyA9IHRoaXMubmV3RGVwcztcbiAgICB0aGlzLm5ld0RlcHMgPSB0bXA7XG4gICAgdGhpcy5uZXdEZXBzLmxlbmd0aCA9IDA7XG4gIH07XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZXIgaW50ZXJmYWNlLlxuICAgKiBXaWxsIGJlIGNhbGxlZCB3aGVuIGEgZGVwZW5kZW5jeSBjaGFuZ2VzLlxuICAgKi9cbiAgV2F0Y2hlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gdXBkYXRlICgpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgIGlmICh0aGlzLmxhenkpIHtcbiAgICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zeW5jKSB7XG4gICAgICB0aGlzLnJ1bigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBxdWV1ZVdhdGNoZXIodGhpcyk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBTY2hlZHVsZXIgam9iIGludGVyZmFjZS5cbiAgICogV2lsbCBiZSBjYWxsZWQgYnkgdGhlIHNjaGVkdWxlci5cbiAgICovXG4gIFdhdGNoZXIucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uIHJ1biAoKSB7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICB2YXIgdmFsdWUgPSB0aGlzLmdldCgpO1xuICAgICAgaWYgKFxuICAgICAgICB2YWx1ZSAhPT0gdGhpcy52YWx1ZSB8fFxuICAgICAgICAvLyBEZWVwIHdhdGNoZXJzIGFuZCB3YXRjaGVycyBvbiBPYmplY3QvQXJyYXlzIHNob3VsZCBmaXJlIGV2ZW5cbiAgICAgICAgLy8gd2hlbiB0aGUgdmFsdWUgaXMgdGhlIHNhbWUsIGJlY2F1c2UgdGhlIHZhbHVlIG1heVxuICAgICAgICAvLyBoYXZlIG11dGF0ZWQuXG4gICAgICAgIGlzT2JqZWN0KHZhbHVlKSB8fFxuICAgICAgICB0aGlzLmRlZXBcbiAgICAgICkge1xuICAgICAgICAvLyBzZXQgbmV3IHZhbHVlXG4gICAgICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgaWYgKHRoaXMudXNlcikge1xuICAgICAgICAgIHZhciBpbmZvID0gXCJjYWxsYmFjayBmb3Igd2F0Y2hlciBcXFwiXCIgKyAodGhpcy5leHByZXNzaW9uKSArIFwiXFxcIlwiO1xuICAgICAgICAgIGludm9rZVdpdGhFcnJvckhhbmRsaW5nKHRoaXMuY2IsIHRoaXMudm0sIFt2YWx1ZSwgb2xkVmFsdWVdLCB0aGlzLnZtLCBpbmZvKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmNiLmNhbGwodGhpcy52bSwgdmFsdWUsIG9sZFZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogRXZhbHVhdGUgdGhlIHZhbHVlIG9mIHRoZSB3YXRjaGVyLlxuICAgKiBUaGlzIG9ubHkgZ2V0cyBjYWxsZWQgZm9yIGxhenkgd2F0Y2hlcnMuXG4gICAqL1xuICBXYXRjaGVyLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uIGV2YWx1YXRlICgpIHtcbiAgICB0aGlzLnZhbHVlID0gdGhpcy5nZXQoKTtcbiAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG4gIH07XG5cbiAgLyoqXG4gICAqIERlcGVuZCBvbiBhbGwgZGVwcyBjb2xsZWN0ZWQgYnkgdGhpcyB3YXRjaGVyLlxuICAgKi9cbiAgV2F0Y2hlci5wcm90b3R5cGUuZGVwZW5kID0gZnVuY3Rpb24gZGVwZW5kICgpIHtcbiAgICB2YXIgaSA9IHRoaXMuZGVwcy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgdGhpcy5kZXBzW2ldLmRlcGVuZCgpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogUmVtb3ZlIHNlbGYgZnJvbSBhbGwgZGVwZW5kZW5jaWVzJyBzdWJzY3JpYmVyIGxpc3QuXG4gICAqL1xuICBXYXRjaGVyLnByb3RvdHlwZS50ZWFyZG93biA9IGZ1bmN0aW9uIHRlYXJkb3duICgpIHtcbiAgICBpZiAodGhpcy5hY3RpdmUpIHtcbiAgICAgIC8vIHJlbW92ZSBzZWxmIGZyb20gdm0ncyB3YXRjaGVyIGxpc3RcbiAgICAgIC8vIHRoaXMgaXMgYSBzb21ld2hhdCBleHBlbnNpdmUgb3BlcmF0aW9uIHNvIHdlIHNraXAgaXRcbiAgICAgIC8vIGlmIHRoZSB2bSBpcyBiZWluZyBkZXN0cm95ZWQuXG4gICAgICBpZiAoIXRoaXMudm0uX2lzQmVpbmdEZXN0cm95ZWQpIHtcbiAgICAgICAgcmVtb3ZlKHRoaXMudm0uX3dhdGNoZXJzLCB0aGlzKTtcbiAgICAgIH1cbiAgICAgIHZhciBpID0gdGhpcy5kZXBzLmxlbmd0aDtcbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgdGhpcy5kZXBzW2ldLnJlbW92ZVN1Yih0aGlzKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIC8qICAqL1xuXG4gIHZhciBzaGFyZWRQcm9wZXJ0eURlZmluaXRpb24gPSB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZ2V0OiBub29wLFxuICAgIHNldDogbm9vcFxuICB9O1xuXG4gIGZ1bmN0aW9uIHByb3h5ICh0YXJnZXQsIHNvdXJjZUtleSwga2V5KSB7XG4gICAgc2hhcmVkUHJvcGVydHlEZWZpbml0aW9uLmdldCA9IGZ1bmN0aW9uIHByb3h5R2V0dGVyICgpIHtcbiAgICAgIHJldHVybiB0aGlzW3NvdXJjZUtleV1ba2V5XVxuICAgIH07XG4gICAgc2hhcmVkUHJvcGVydHlEZWZpbml0aW9uLnNldCA9IGZ1bmN0aW9uIHByb3h5U2V0dGVyICh2YWwpIHtcbiAgICAgIHRoaXNbc291cmNlS2V5XVtrZXldID0gdmFsO1xuICAgIH07XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBzaGFyZWRQcm9wZXJ0eURlZmluaXRpb24pO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdFN0YXRlICh2bSkge1xuICAgIHZtLl93YXRjaGVycyA9IFtdO1xuICAgIHZhciBvcHRzID0gdm0uJG9wdGlvbnM7XG4gICAgaWYgKG9wdHMucHJvcHMpIHsgaW5pdFByb3BzKHZtLCBvcHRzLnByb3BzKTsgfVxuICAgIGlmIChvcHRzLm1ldGhvZHMpIHsgaW5pdE1ldGhvZHModm0sIG9wdHMubWV0aG9kcyk7IH1cbiAgICBpZiAob3B0cy5kYXRhKSB7XG4gICAgICBpbml0RGF0YSh2bSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9ic2VydmUodm0uX2RhdGEgPSB7fSwgdHJ1ZSAvKiBhc1Jvb3REYXRhICovKTtcbiAgICB9XG4gICAgaWYgKG9wdHMuY29tcHV0ZWQpIHsgaW5pdENvbXB1dGVkKHZtLCBvcHRzLmNvbXB1dGVkKTsgfVxuICAgIGlmIChvcHRzLndhdGNoICYmIG9wdHMud2F0Y2ggIT09IG5hdGl2ZVdhdGNoKSB7XG4gICAgICBpbml0V2F0Y2godm0sIG9wdHMud2F0Y2gpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRQcm9wcyAodm0sIHByb3BzT3B0aW9ucykge1xuICAgIHZhciBwcm9wc0RhdGEgPSB2bS4kb3B0aW9ucy5wcm9wc0RhdGEgfHwge307XG4gICAgdmFyIHByb3BzID0gdm0uX3Byb3BzID0ge307XG4gICAgLy8gY2FjaGUgcHJvcCBrZXlzIHNvIHRoYXQgZnV0dXJlIHByb3BzIHVwZGF0ZXMgY2FuIGl0ZXJhdGUgdXNpbmcgQXJyYXlcbiAgICAvLyBpbnN0ZWFkIG9mIGR5bmFtaWMgb2JqZWN0IGtleSBlbnVtZXJhdGlvbi5cbiAgICB2YXIga2V5cyA9IHZtLiRvcHRpb25zLl9wcm9wS2V5cyA9IFtdO1xuICAgIHZhciBpc1Jvb3QgPSAhdm0uJHBhcmVudDtcbiAgICAvLyByb290IGluc3RhbmNlIHByb3BzIHNob3VsZCBiZSBjb252ZXJ0ZWRcbiAgICBpZiAoIWlzUm9vdCkge1xuICAgICAgdG9nZ2xlT2JzZXJ2aW5nKGZhbHNlKTtcbiAgICB9XG4gICAgdmFyIGxvb3AgPSBmdW5jdGlvbiAoIGtleSApIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgICAgdmFyIHZhbHVlID0gdmFsaWRhdGVQcm9wKGtleSwgcHJvcHNPcHRpb25zLCBwcm9wc0RhdGEsIHZtKTtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICB7XG4gICAgICAgIHZhciBoeXBoZW5hdGVkS2V5ID0gaHlwaGVuYXRlKGtleSk7XG4gICAgICAgIGlmIChpc1Jlc2VydmVkQXR0cmlidXRlKGh5cGhlbmF0ZWRLZXkpIHx8XG4gICAgICAgICAgICBjb25maWcuaXNSZXNlcnZlZEF0dHIoaHlwaGVuYXRlZEtleSkpIHtcbiAgICAgICAgICB3YXJuKFxuICAgICAgICAgICAgKFwiXFxcIlwiICsgaHlwaGVuYXRlZEtleSArIFwiXFxcIiBpcyBhIHJlc2VydmVkIGF0dHJpYnV0ZSBhbmQgY2Fubm90IGJlIHVzZWQgYXMgY29tcG9uZW50IHByb3AuXCIpLFxuICAgICAgICAgICAgdm1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGRlZmluZVJlYWN0aXZlJCQxKHByb3BzLCBrZXksIHZhbHVlLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKCFpc1Jvb3QgJiYgIWlzVXBkYXRpbmdDaGlsZENvbXBvbmVudCkge1xuICAgICAgICAgICAgd2FybihcbiAgICAgICAgICAgICAgXCJBdm9pZCBtdXRhdGluZyBhIHByb3AgZGlyZWN0bHkgc2luY2UgdGhlIHZhbHVlIHdpbGwgYmUgXCIgK1xuICAgICAgICAgICAgICBcIm92ZXJ3cml0dGVuIHdoZW5ldmVyIHRoZSBwYXJlbnQgY29tcG9uZW50IHJlLXJlbmRlcnMuIFwiICtcbiAgICAgICAgICAgICAgXCJJbnN0ZWFkLCB1c2UgYSBkYXRhIG9yIGNvbXB1dGVkIHByb3BlcnR5IGJhc2VkIG9uIHRoZSBwcm9wJ3MgXCIgK1xuICAgICAgICAgICAgICBcInZhbHVlLiBQcm9wIGJlaW5nIG11dGF0ZWQ6IFxcXCJcIiArIGtleSArIFwiXFxcIlwiLFxuICAgICAgICAgICAgICB2bVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgLy8gc3RhdGljIHByb3BzIGFyZSBhbHJlYWR5IHByb3hpZWQgb24gdGhlIGNvbXBvbmVudCdzIHByb3RvdHlwZVxuICAgICAgLy8gZHVyaW5nIFZ1ZS5leHRlbmQoKS4gV2Ugb25seSBuZWVkIHRvIHByb3h5IHByb3BzIGRlZmluZWQgYXRcbiAgICAgIC8vIGluc3RhbnRpYXRpb24gaGVyZS5cbiAgICAgIGlmICghKGtleSBpbiB2bSkpIHtcbiAgICAgICAgcHJveHkodm0sIFwiX3Byb3BzXCIsIGtleSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGZvciAodmFyIGtleSBpbiBwcm9wc09wdGlvbnMpIGxvb3AoIGtleSApO1xuICAgIHRvZ2dsZU9ic2VydmluZyh0cnVlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXREYXRhICh2bSkge1xuICAgIHZhciBkYXRhID0gdm0uJG9wdGlvbnMuZGF0YTtcbiAgICBkYXRhID0gdm0uX2RhdGEgPSB0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgPyBnZXREYXRhKGRhdGEsIHZtKVxuICAgICAgOiBkYXRhIHx8IHt9O1xuICAgIGlmICghaXNQbGFpbk9iamVjdChkYXRhKSkge1xuICAgICAgZGF0YSA9IHt9O1xuICAgICAgd2FybihcbiAgICAgICAgJ2RhdGEgZnVuY3Rpb25zIHNob3VsZCByZXR1cm4gYW4gb2JqZWN0OlxcbicgK1xuICAgICAgICAnaHR0cHM6Ly92dWVqcy5vcmcvdjIvZ3VpZGUvY29tcG9uZW50cy5odG1sI2RhdGEtTXVzdC1CZS1hLUZ1bmN0aW9uJyxcbiAgICAgICAgdm1cbiAgICAgICk7XG4gICAgfVxuICAgIC8vIHByb3h5IGRhdGEgb24gaW5zdGFuY2VcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGRhdGEpO1xuICAgIHZhciBwcm9wcyA9IHZtLiRvcHRpb25zLnByb3BzO1xuICAgIHZhciBtZXRob2RzID0gdm0uJG9wdGlvbnMubWV0aG9kcztcbiAgICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgICAge1xuICAgICAgICBpZiAobWV0aG9kcyAmJiBoYXNPd24obWV0aG9kcywga2V5KSkge1xuICAgICAgICAgIHdhcm4oXG4gICAgICAgICAgICAoXCJNZXRob2QgXFxcIlwiICsga2V5ICsgXCJcXFwiIGhhcyBhbHJlYWR5IGJlZW4gZGVmaW5lZCBhcyBhIGRhdGEgcHJvcGVydHkuXCIpLFxuICAgICAgICAgICAgdm1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocHJvcHMgJiYgaGFzT3duKHByb3BzLCBrZXkpKSB7XG4gICAgICAgIHdhcm4oXG4gICAgICAgICAgXCJUaGUgZGF0YSBwcm9wZXJ0eSBcXFwiXCIgKyBrZXkgKyBcIlxcXCIgaXMgYWxyZWFkeSBkZWNsYXJlZCBhcyBhIHByb3AuIFwiICtcbiAgICAgICAgICBcIlVzZSBwcm9wIGRlZmF1bHQgdmFsdWUgaW5zdGVhZC5cIixcbiAgICAgICAgICB2bVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIGlmICghaXNSZXNlcnZlZChrZXkpKSB7XG4gICAgICAgIHByb3h5KHZtLCBcIl9kYXRhXCIsIGtleSk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIG9ic2VydmUgZGF0YVxuICAgIG9ic2VydmUoZGF0YSwgdHJ1ZSAvKiBhc1Jvb3REYXRhICovKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldERhdGEgKGRhdGEsIHZtKSB7XG4gICAgLy8gIzc1NzMgZGlzYWJsZSBkZXAgY29sbGVjdGlvbiB3aGVuIGludm9raW5nIGRhdGEgZ2V0dGVyc1xuICAgIHB1c2hUYXJnZXQoKTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGRhdGEuY2FsbCh2bSwgdm0pXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaGFuZGxlRXJyb3IoZSwgdm0sIFwiZGF0YSgpXCIpO1xuICAgICAgcmV0dXJuIHt9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHBvcFRhcmdldCgpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBjb21wdXRlZFdhdGNoZXJPcHRpb25zID0geyBsYXp5OiB0cnVlIH07XG5cbiAgZnVuY3Rpb24gaW5pdENvbXB1dGVkICh2bSwgY29tcHV0ZWQpIHtcbiAgICAvLyAkZmxvdy1kaXNhYmxlLWxpbmVcbiAgICB2YXIgd2F0Y2hlcnMgPSB2bS5fY29tcHV0ZWRXYXRjaGVycyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgLy8gY29tcHV0ZWQgcHJvcGVydGllcyBhcmUganVzdCBnZXR0ZXJzIGR1cmluZyBTU1JcbiAgICB2YXIgaXNTU1IgPSBpc1NlcnZlclJlbmRlcmluZygpO1xuXG4gICAgZm9yICh2YXIga2V5IGluIGNvbXB1dGVkKSB7XG4gICAgICB2YXIgdXNlckRlZiA9IGNvbXB1dGVkW2tleV07XG4gICAgICB2YXIgZ2V0dGVyID0gdHlwZW9mIHVzZXJEZWYgPT09ICdmdW5jdGlvbicgPyB1c2VyRGVmIDogdXNlckRlZi5nZXQ7XG4gICAgICBpZiAoZ2V0dGVyID09IG51bGwpIHtcbiAgICAgICAgd2FybihcbiAgICAgICAgICAoXCJHZXR0ZXIgaXMgbWlzc2luZyBmb3IgY29tcHV0ZWQgcHJvcGVydHkgXFxcIlwiICsga2V5ICsgXCJcXFwiLlwiKSxcbiAgICAgICAgICB2bVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzU1NSKSB7XG4gICAgICAgIC8vIGNyZWF0ZSBpbnRlcm5hbCB3YXRjaGVyIGZvciB0aGUgY29tcHV0ZWQgcHJvcGVydHkuXG4gICAgICAgIHdhdGNoZXJzW2tleV0gPSBuZXcgV2F0Y2hlcihcbiAgICAgICAgICB2bSxcbiAgICAgICAgICBnZXR0ZXIgfHwgbm9vcCxcbiAgICAgICAgICBub29wLFxuICAgICAgICAgIGNvbXB1dGVkV2F0Y2hlck9wdGlvbnNcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gY29tcG9uZW50LWRlZmluZWQgY29tcHV0ZWQgcHJvcGVydGllcyBhcmUgYWxyZWFkeSBkZWZpbmVkIG9uIHRoZVxuICAgICAgLy8gY29tcG9uZW50IHByb3RvdHlwZS4gV2Ugb25seSBuZWVkIHRvIGRlZmluZSBjb21wdXRlZCBwcm9wZXJ0aWVzIGRlZmluZWRcbiAgICAgIC8vIGF0IGluc3RhbnRpYXRpb24gaGVyZS5cbiAgICAgIGlmICghKGtleSBpbiB2bSkpIHtcbiAgICAgICAgZGVmaW5lQ29tcHV0ZWQodm0sIGtleSwgdXNlckRlZik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoa2V5IGluIHZtLiRkYXRhKSB7XG4gICAgICAgICAgd2FybigoXCJUaGUgY29tcHV0ZWQgcHJvcGVydHkgXFxcIlwiICsga2V5ICsgXCJcXFwiIGlzIGFscmVhZHkgZGVmaW5lZCBpbiBkYXRhLlwiKSwgdm0pO1xuICAgICAgICB9IGVsc2UgaWYgKHZtLiRvcHRpb25zLnByb3BzICYmIGtleSBpbiB2bS4kb3B0aW9ucy5wcm9wcykge1xuICAgICAgICAgIHdhcm4oKFwiVGhlIGNvbXB1dGVkIHByb3BlcnR5IFxcXCJcIiArIGtleSArIFwiXFxcIiBpcyBhbHJlYWR5IGRlZmluZWQgYXMgYSBwcm9wLlwiKSwgdm0pO1xuICAgICAgICB9IGVsc2UgaWYgKHZtLiRvcHRpb25zLm1ldGhvZHMgJiYga2V5IGluIHZtLiRvcHRpb25zLm1ldGhvZHMpIHtcbiAgICAgICAgICB3YXJuKChcIlRoZSBjb21wdXRlZCBwcm9wZXJ0eSBcXFwiXCIgKyBrZXkgKyBcIlxcXCIgaXMgYWxyZWFkeSBkZWZpbmVkIGFzIGEgbWV0aG9kLlwiKSwgdm0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZGVmaW5lQ29tcHV0ZWQgKFxuICAgIHRhcmdldCxcbiAgICBrZXksXG4gICAgdXNlckRlZlxuICApIHtcbiAgICB2YXIgc2hvdWxkQ2FjaGUgPSAhaXNTZXJ2ZXJSZW5kZXJpbmcoKTtcbiAgICBpZiAodHlwZW9mIHVzZXJEZWYgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHNoYXJlZFByb3BlcnR5RGVmaW5pdGlvbi5nZXQgPSBzaG91bGRDYWNoZVxuICAgICAgICA/IGNyZWF0ZUNvbXB1dGVkR2V0dGVyKGtleSlcbiAgICAgICAgOiBjcmVhdGVHZXR0ZXJJbnZva2VyKHVzZXJEZWYpO1xuICAgICAgc2hhcmVkUHJvcGVydHlEZWZpbml0aW9uLnNldCA9IG5vb3A7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNoYXJlZFByb3BlcnR5RGVmaW5pdGlvbi5nZXQgPSB1c2VyRGVmLmdldFxuICAgICAgICA/IHNob3VsZENhY2hlICYmIHVzZXJEZWYuY2FjaGUgIT09IGZhbHNlXG4gICAgICAgICAgPyBjcmVhdGVDb21wdXRlZEdldHRlcihrZXkpXG4gICAgICAgICAgOiBjcmVhdGVHZXR0ZXJJbnZva2VyKHVzZXJEZWYuZ2V0KVxuICAgICAgICA6IG5vb3A7XG4gICAgICBzaGFyZWRQcm9wZXJ0eURlZmluaXRpb24uc2V0ID0gdXNlckRlZi5zZXQgfHwgbm9vcDtcbiAgICB9XG4gICAgaWYgKHNoYXJlZFByb3BlcnR5RGVmaW5pdGlvbi5zZXQgPT09IG5vb3ApIHtcbiAgICAgIHNoYXJlZFByb3BlcnR5RGVmaW5pdGlvbi5zZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHdhcm4oXG4gICAgICAgICAgKFwiQ29tcHV0ZWQgcHJvcGVydHkgXFxcIlwiICsga2V5ICsgXCJcXFwiIHdhcyBhc3NpZ25lZCB0byBidXQgaXQgaGFzIG5vIHNldHRlci5cIiksXG4gICAgICAgICAgdGhpc1xuICAgICAgICApO1xuICAgICAgfTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBzaGFyZWRQcm9wZXJ0eURlZmluaXRpb24pO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ29tcHV0ZWRHZXR0ZXIgKGtleSkge1xuICAgIHJldHVybiBmdW5jdGlvbiBjb21wdXRlZEdldHRlciAoKSB7XG4gICAgICB2YXIgd2F0Y2hlciA9IHRoaXMuX2NvbXB1dGVkV2F0Y2hlcnMgJiYgdGhpcy5fY29tcHV0ZWRXYXRjaGVyc1trZXldO1xuICAgICAgaWYgKHdhdGNoZXIpIHtcbiAgICAgICAgaWYgKHdhdGNoZXIuZGlydHkpIHtcbiAgICAgICAgICB3YXRjaGVyLmV2YWx1YXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKERlcC50YXJnZXQpIHtcbiAgICAgICAgICB3YXRjaGVyLmRlcGVuZCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB3YXRjaGVyLnZhbHVlXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlR2V0dGVySW52b2tlcihmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiBjb21wdXRlZEdldHRlciAoKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGlzLCB0aGlzKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRNZXRob2RzICh2bSwgbWV0aG9kcykge1xuICAgIHZhciBwcm9wcyA9IHZtLiRvcHRpb25zLnByb3BzO1xuICAgIGZvciAodmFyIGtleSBpbiBtZXRob2RzKSB7XG4gICAgICB7XG4gICAgICAgIGlmICh0eXBlb2YgbWV0aG9kc1trZXldICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgd2FybihcbiAgICAgICAgICAgIFwiTWV0aG9kIFxcXCJcIiArIGtleSArIFwiXFxcIiBoYXMgdHlwZSBcXFwiXCIgKyAodHlwZW9mIG1ldGhvZHNba2V5XSkgKyBcIlxcXCIgaW4gdGhlIGNvbXBvbmVudCBkZWZpbml0aW9uLiBcIiArXG4gICAgICAgICAgICBcIkRpZCB5b3UgcmVmZXJlbmNlIHRoZSBmdW5jdGlvbiBjb3JyZWN0bHk/XCIsXG4gICAgICAgICAgICB2bVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByb3BzICYmIGhhc093bihwcm9wcywga2V5KSkge1xuICAgICAgICAgIHdhcm4oXG4gICAgICAgICAgICAoXCJNZXRob2QgXFxcIlwiICsga2V5ICsgXCJcXFwiIGhhcyBhbHJlYWR5IGJlZW4gZGVmaW5lZCBhcyBhIHByb3AuXCIpLFxuICAgICAgICAgICAgdm1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGlmICgoa2V5IGluIHZtKSAmJiBpc1Jlc2VydmVkKGtleSkpIHtcbiAgICAgICAgICB3YXJuKFxuICAgICAgICAgICAgXCJNZXRob2QgXFxcIlwiICsga2V5ICsgXCJcXFwiIGNvbmZsaWN0cyB3aXRoIGFuIGV4aXN0aW5nIFZ1ZSBpbnN0YW5jZSBtZXRob2QuIFwiICtcbiAgICAgICAgICAgIFwiQXZvaWQgZGVmaW5pbmcgY29tcG9uZW50IG1ldGhvZHMgdGhhdCBzdGFydCB3aXRoIF8gb3IgJC5cIlxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZtW2tleV0gPSB0eXBlb2YgbWV0aG9kc1trZXldICE9PSAnZnVuY3Rpb24nID8gbm9vcCA6IGJpbmQobWV0aG9kc1trZXldLCB2bSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5pdFdhdGNoICh2bSwgd2F0Y2gpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gd2F0Y2gpIHtcbiAgICAgIHZhciBoYW5kbGVyID0gd2F0Y2hba2V5XTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGhhbmRsZXIpKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGFuZGxlci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNyZWF0ZVdhdGNoZXIodm0sIGtleSwgaGFuZGxlcltpXSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNyZWF0ZVdhdGNoZXIodm0sIGtleSwgaGFuZGxlcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlV2F0Y2hlciAoXG4gICAgdm0sXG4gICAgZXhwT3JGbixcbiAgICBoYW5kbGVyLFxuICAgIG9wdGlvbnNcbiAgKSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QoaGFuZGxlcikpIHtcbiAgICAgIG9wdGlvbnMgPSBoYW5kbGVyO1xuICAgICAgaGFuZGxlciA9IGhhbmRsZXIuaGFuZGxlcjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnc3RyaW5nJykge1xuICAgICAgaGFuZGxlciA9IHZtW2hhbmRsZXJdO1xuICAgIH1cbiAgICByZXR1cm4gdm0uJHdhdGNoKGV4cE9yRm4sIGhhbmRsZXIsIG9wdGlvbnMpXG4gIH1cblxuICBmdW5jdGlvbiBzdGF0ZU1peGluIChWdWUpIHtcbiAgICAvLyBmbG93IHNvbWVob3cgaGFzIHByb2JsZW1zIHdpdGggZGlyZWN0bHkgZGVjbGFyZWQgZGVmaW5pdGlvbiBvYmplY3RcbiAgICAvLyB3aGVuIHVzaW5nIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSwgc28gd2UgaGF2ZSB0byBwcm9jZWR1cmFsbHkgYnVpbGQgdXBcbiAgICAvLyB0aGUgb2JqZWN0IGhlcmUuXG4gICAgdmFyIGRhdGFEZWYgPSB7fTtcbiAgICBkYXRhRGVmLmdldCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuX2RhdGEgfTtcbiAgICB2YXIgcHJvcHNEZWYgPSB7fTtcbiAgICBwcm9wc0RlZi5nZXQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLl9wcm9wcyB9O1xuICAgIHtcbiAgICAgIGRhdGFEZWYuc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB3YXJuKFxuICAgICAgICAgICdBdm9pZCByZXBsYWNpbmcgaW5zdGFuY2Ugcm9vdCAkZGF0YS4gJyArXG4gICAgICAgICAgJ1VzZSBuZXN0ZWQgZGF0YSBwcm9wZXJ0aWVzIGluc3RlYWQuJyxcbiAgICAgICAgICB0aGlzXG4gICAgICAgICk7XG4gICAgICB9O1xuICAgICAgcHJvcHNEZWYuc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB3YXJuKFwiJHByb3BzIGlzIHJlYWRvbmx5LlwiLCB0aGlzKTtcbiAgICAgIH07XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShWdWUucHJvdG90eXBlLCAnJGRhdGEnLCBkYXRhRGVmKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVnVlLnByb3RvdHlwZSwgJyRwcm9wcycsIHByb3BzRGVmKTtcblxuICAgIFZ1ZS5wcm90b3R5cGUuJHNldCA9IHNldDtcbiAgICBWdWUucHJvdG90eXBlLiRkZWxldGUgPSBkZWw7XG5cbiAgICBWdWUucHJvdG90eXBlLiR3YXRjaCA9IGZ1bmN0aW9uIChcbiAgICAgIGV4cE9yRm4sXG4gICAgICBjYixcbiAgICAgIG9wdGlvbnNcbiAgICApIHtcbiAgICAgIHZhciB2bSA9IHRoaXM7XG4gICAgICBpZiAoaXNQbGFpbk9iamVjdChjYikpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVdhdGNoZXIodm0sIGV4cE9yRm4sIGNiLCBvcHRpb25zKVxuICAgICAgfVxuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICBvcHRpb25zLnVzZXIgPSB0cnVlO1xuICAgICAgdmFyIHdhdGNoZXIgPSBuZXcgV2F0Y2hlcih2bSwgZXhwT3JGbiwgY2IsIG9wdGlvbnMpO1xuICAgICAgaWYgKG9wdGlvbnMuaW1tZWRpYXRlKSB7XG4gICAgICAgIHZhciBpbmZvID0gXCJjYWxsYmFjayBmb3IgaW1tZWRpYXRlIHdhdGNoZXIgXFxcIlwiICsgKHdhdGNoZXIuZXhwcmVzc2lvbikgKyBcIlxcXCJcIjtcbiAgICAgICAgcHVzaFRhcmdldCgpO1xuICAgICAgICBpbnZva2VXaXRoRXJyb3JIYW5kbGluZyhjYiwgdm0sIFt3YXRjaGVyLnZhbHVlXSwgdm0sIGluZm8pO1xuICAgICAgICBwb3BUYXJnZXQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmdW5jdGlvbiB1bndhdGNoRm4gKCkge1xuICAgICAgICB3YXRjaGVyLnRlYXJkb3duKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qICAqL1xuXG4gIHZhciB1aWQkMyA9IDA7XG5cbiAgZnVuY3Rpb24gaW5pdE1peGluIChWdWUpIHtcbiAgICBWdWUucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIHZhciB2bSA9IHRoaXM7XG4gICAgICAvLyBhIHVpZFxuICAgICAgdm0uX3VpZCA9IHVpZCQzKys7XG5cbiAgICAgIHZhciBzdGFydFRhZywgZW5kVGFnO1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICBpZiAoY29uZmlnLnBlcmZvcm1hbmNlICYmIG1hcmspIHtcbiAgICAgICAgc3RhcnRUYWcgPSBcInZ1ZS1wZXJmLXN0YXJ0OlwiICsgKHZtLl91aWQpO1xuICAgICAgICBlbmRUYWcgPSBcInZ1ZS1wZXJmLWVuZDpcIiArICh2bS5fdWlkKTtcbiAgICAgICAgbWFyayhzdGFydFRhZyk7XG4gICAgICB9XG5cbiAgICAgIC8vIGEgZmxhZyB0byBhdm9pZCB0aGlzIGJlaW5nIG9ic2VydmVkXG4gICAgICB2bS5faXNWdWUgPSB0cnVlO1xuICAgICAgLy8gbWVyZ2Ugb3B0aW9uc1xuICAgICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5faXNDb21wb25lbnQpIHtcbiAgICAgICAgLy8gb3B0aW1pemUgaW50ZXJuYWwgY29tcG9uZW50IGluc3RhbnRpYXRpb25cbiAgICAgICAgLy8gc2luY2UgZHluYW1pYyBvcHRpb25zIG1lcmdpbmcgaXMgcHJldHR5IHNsb3csIGFuZCBub25lIG9mIHRoZVxuICAgICAgICAvLyBpbnRlcm5hbCBjb21wb25lbnQgb3B0aW9ucyBuZWVkcyBzcGVjaWFsIHRyZWF0bWVudC5cbiAgICAgICAgaW5pdEludGVybmFsQ29tcG9uZW50KHZtLCBvcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZtLiRvcHRpb25zID0gbWVyZ2VPcHRpb25zKFxuICAgICAgICAgIHJlc29sdmVDb25zdHJ1Y3Rvck9wdGlvbnModm0uY29uc3RydWN0b3IpLFxuICAgICAgICAgIG9wdGlvbnMgfHwge30sXG4gICAgICAgICAgdm1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICB7XG4gICAgICAgIGluaXRQcm94eSh2bSk7XG4gICAgICB9XG4gICAgICAvLyBleHBvc2UgcmVhbCBzZWxmXG4gICAgICB2bS5fc2VsZiA9IHZtO1xuICAgICAgaW5pdExpZmVjeWNsZSh2bSk7XG4gICAgICBpbml0RXZlbnRzKHZtKTtcbiAgICAgIGluaXRSZW5kZXIodm0pO1xuICAgICAgY2FsbEhvb2sodm0sICdiZWZvcmVDcmVhdGUnKTtcbiAgICAgIGluaXRJbmplY3Rpb25zKHZtKTsgLy8gcmVzb2x2ZSBpbmplY3Rpb25zIGJlZm9yZSBkYXRhL3Byb3BzXG4gICAgICBpbml0U3RhdGUodm0pO1xuICAgICAgaW5pdFByb3ZpZGUodm0pOyAvLyByZXNvbHZlIHByb3ZpZGUgYWZ0ZXIgZGF0YS9wcm9wc1xuICAgICAgY2FsbEhvb2sodm0sICdjcmVhdGVkJyk7XG5cbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgaWYgKGNvbmZpZy5wZXJmb3JtYW5jZSAmJiBtYXJrKSB7XG4gICAgICAgIHZtLl9uYW1lID0gZm9ybWF0Q29tcG9uZW50TmFtZSh2bSwgZmFsc2UpO1xuICAgICAgICBtYXJrKGVuZFRhZyk7XG4gICAgICAgIG1lYXN1cmUoKFwidnVlIFwiICsgKHZtLl9uYW1lKSArIFwiIGluaXRcIiksIHN0YXJ0VGFnLCBlbmRUYWcpO1xuICAgICAgfVxuXG4gICAgICBpZiAodm0uJG9wdGlvbnMuZWwpIHtcbiAgICAgICAgdm0uJG1vdW50KHZtLiRvcHRpb25zLmVsKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdEludGVybmFsQ29tcG9uZW50ICh2bSwgb3B0aW9ucykge1xuICAgIHZhciBvcHRzID0gdm0uJG9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKHZtLmNvbnN0cnVjdG9yLm9wdGlvbnMpO1xuICAgIC8vIGRvaW5nIHRoaXMgYmVjYXVzZSBpdCdzIGZhc3RlciB0aGFuIGR5bmFtaWMgZW51bWVyYXRpb24uXG4gICAgdmFyIHBhcmVudFZub2RlID0gb3B0aW9ucy5fcGFyZW50Vm5vZGU7XG4gICAgb3B0cy5wYXJlbnQgPSBvcHRpb25zLnBhcmVudDtcbiAgICBvcHRzLl9wYXJlbnRWbm9kZSA9IHBhcmVudFZub2RlO1xuXG4gICAgdmFyIHZub2RlQ29tcG9uZW50T3B0aW9ucyA9IHBhcmVudFZub2RlLmNvbXBvbmVudE9wdGlvbnM7XG4gICAgb3B0cy5wcm9wc0RhdGEgPSB2bm9kZUNvbXBvbmVudE9wdGlvbnMucHJvcHNEYXRhO1xuICAgIG9wdHMuX3BhcmVudExpc3RlbmVycyA9IHZub2RlQ29tcG9uZW50T3B0aW9ucy5saXN0ZW5lcnM7XG4gICAgb3B0cy5fcmVuZGVyQ2hpbGRyZW4gPSB2bm9kZUNvbXBvbmVudE9wdGlvbnMuY2hpbGRyZW47XG4gICAgb3B0cy5fY29tcG9uZW50VGFnID0gdm5vZGVDb21wb25lbnRPcHRpb25zLnRhZztcblxuICAgIGlmIChvcHRpb25zLnJlbmRlcikge1xuICAgICAgb3B0cy5yZW5kZXIgPSBvcHRpb25zLnJlbmRlcjtcbiAgICAgIG9wdHMuc3RhdGljUmVuZGVyRm5zID0gb3B0aW9ucy5zdGF0aWNSZW5kZXJGbnM7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVzb2x2ZUNvbnN0cnVjdG9yT3B0aW9ucyAoQ3Rvcikge1xuICAgIHZhciBvcHRpb25zID0gQ3Rvci5vcHRpb25zO1xuICAgIGlmIChDdG9yLnN1cGVyKSB7XG4gICAgICB2YXIgc3VwZXJPcHRpb25zID0gcmVzb2x2ZUNvbnN0cnVjdG9yT3B0aW9ucyhDdG9yLnN1cGVyKTtcbiAgICAgIHZhciBjYWNoZWRTdXBlck9wdGlvbnMgPSBDdG9yLnN1cGVyT3B0aW9ucztcbiAgICAgIGlmIChzdXBlck9wdGlvbnMgIT09IGNhY2hlZFN1cGVyT3B0aW9ucykge1xuICAgICAgICAvLyBzdXBlciBvcHRpb24gY2hhbmdlZCxcbiAgICAgICAgLy8gbmVlZCB0byByZXNvbHZlIG5ldyBvcHRpb25zLlxuICAgICAgICBDdG9yLnN1cGVyT3B0aW9ucyA9IHN1cGVyT3B0aW9ucztcbiAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBsYXRlLW1vZGlmaWVkL2F0dGFjaGVkIG9wdGlvbnMgKCM0OTc2KVxuICAgICAgICB2YXIgbW9kaWZpZWRPcHRpb25zID0gcmVzb2x2ZU1vZGlmaWVkT3B0aW9ucyhDdG9yKTtcbiAgICAgICAgLy8gdXBkYXRlIGJhc2UgZXh0ZW5kIG9wdGlvbnNcbiAgICAgICAgaWYgKG1vZGlmaWVkT3B0aW9ucykge1xuICAgICAgICAgIGV4dGVuZChDdG9yLmV4dGVuZE9wdGlvbnMsIG1vZGlmaWVkT3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgb3B0aW9ucyA9IEN0b3Iub3B0aW9ucyA9IG1lcmdlT3B0aW9ucyhzdXBlck9wdGlvbnMsIEN0b3IuZXh0ZW5kT3B0aW9ucyk7XG4gICAgICAgIGlmIChvcHRpb25zLm5hbWUpIHtcbiAgICAgICAgICBvcHRpb25zLmNvbXBvbmVudHNbb3B0aW9ucy5uYW1lXSA9IEN0b3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc29sdmVNb2RpZmllZE9wdGlvbnMgKEN0b3IpIHtcbiAgICB2YXIgbW9kaWZpZWQ7XG4gICAgdmFyIGxhdGVzdCA9IEN0b3Iub3B0aW9ucztcbiAgICB2YXIgc2VhbGVkID0gQ3Rvci5zZWFsZWRPcHRpb25zO1xuICAgIGZvciAodmFyIGtleSBpbiBsYXRlc3QpIHtcbiAgICAgIGlmIChsYXRlc3Rba2V5XSAhPT0gc2VhbGVkW2tleV0pIHtcbiAgICAgICAgaWYgKCFtb2RpZmllZCkgeyBtb2RpZmllZCA9IHt9OyB9XG4gICAgICAgIG1vZGlmaWVkW2tleV0gPSBsYXRlc3Rba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1vZGlmaWVkXG4gIH1cblxuICBmdW5jdGlvbiBWdWUgKG9wdGlvbnMpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgVnVlKVxuICAgICkge1xuICAgICAgd2FybignVnVlIGlzIGEgY29uc3RydWN0b3IgYW5kIHNob3VsZCBiZSBjYWxsZWQgd2l0aCB0aGUgYG5ld2Aga2V5d29yZCcpO1xuICAgIH1cbiAgICB0aGlzLl9pbml0KG9wdGlvbnMpO1xuICB9XG5cbiAgaW5pdE1peGluKFZ1ZSk7XG4gIHN0YXRlTWl4aW4oVnVlKTtcbiAgZXZlbnRzTWl4aW4oVnVlKTtcbiAgbGlmZWN5Y2xlTWl4aW4oVnVlKTtcbiAgcmVuZGVyTWl4aW4oVnVlKTtcblxuICAvKiAgKi9cblxuICBmdW5jdGlvbiBpbml0VXNlIChWdWUpIHtcbiAgICBWdWUudXNlID0gZnVuY3Rpb24gKHBsdWdpbikge1xuICAgICAgdmFyIGluc3RhbGxlZFBsdWdpbnMgPSAodGhpcy5faW5zdGFsbGVkUGx1Z2lucyB8fCAodGhpcy5faW5zdGFsbGVkUGx1Z2lucyA9IFtdKSk7XG4gICAgICBpZiAoaW5zdGFsbGVkUGx1Z2lucy5pbmRleE9mKHBsdWdpbikgPiAtMSkge1xuICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgfVxuXG4gICAgICAvLyBhZGRpdGlvbmFsIHBhcmFtZXRlcnNcbiAgICAgIHZhciBhcmdzID0gdG9BcnJheShhcmd1bWVudHMsIDEpO1xuICAgICAgYXJncy51bnNoaWZ0KHRoaXMpO1xuICAgICAgaWYgKHR5cGVvZiBwbHVnaW4uaW5zdGFsbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwbHVnaW4uaW5zdGFsbC5hcHBseShwbHVnaW4sIGFyZ3MpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcGx1Z2luID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHBsdWdpbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgIH1cbiAgICAgIGluc3RhbGxlZFBsdWdpbnMucHVzaChwbHVnaW4pO1xuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9O1xuICB9XG5cbiAgLyogICovXG5cbiAgZnVuY3Rpb24gaW5pdE1peGluJDEgKFZ1ZSkge1xuICAgIFZ1ZS5taXhpbiA9IGZ1bmN0aW9uIChtaXhpbikge1xuICAgICAgdGhpcy5vcHRpb25zID0gbWVyZ2VPcHRpb25zKHRoaXMub3B0aW9ucywgbWl4aW4pO1xuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9O1xuICB9XG5cbiAgLyogICovXG5cbiAgZnVuY3Rpb24gaW5pdEV4dGVuZCAoVnVlKSB7XG4gICAgLyoqXG4gICAgICogRWFjaCBpbnN0YW5jZSBjb25zdHJ1Y3RvciwgaW5jbHVkaW5nIFZ1ZSwgaGFzIGEgdW5pcXVlXG4gICAgICogY2lkLiBUaGlzIGVuYWJsZXMgdXMgdG8gY3JlYXRlIHdyYXBwZWQgXCJjaGlsZFxuICAgICAqIGNvbnN0cnVjdG9yc1wiIGZvciBwcm90b3R5cGFsIGluaGVyaXRhbmNlIGFuZCBjYWNoZSB0aGVtLlxuICAgICAqL1xuICAgIFZ1ZS5jaWQgPSAwO1xuICAgIHZhciBjaWQgPSAxO1xuXG4gICAgLyoqXG4gICAgICogQ2xhc3MgaW5oZXJpdGFuY2VcbiAgICAgKi9cbiAgICBWdWUuZXh0ZW5kID0gZnVuY3Rpb24gKGV4dGVuZE9wdGlvbnMpIHtcbiAgICAgIGV4dGVuZE9wdGlvbnMgPSBleHRlbmRPcHRpb25zIHx8IHt9O1xuICAgICAgdmFyIFN1cGVyID0gdGhpcztcbiAgICAgIHZhciBTdXBlcklkID0gU3VwZXIuY2lkO1xuICAgICAgdmFyIGNhY2hlZEN0b3JzID0gZXh0ZW5kT3B0aW9ucy5fQ3RvciB8fCAoZXh0ZW5kT3B0aW9ucy5fQ3RvciA9IHt9KTtcbiAgICAgIGlmIChjYWNoZWRDdG9yc1tTdXBlcklkXSkge1xuICAgICAgICByZXR1cm4gY2FjaGVkQ3RvcnNbU3VwZXJJZF1cbiAgICAgIH1cblxuICAgICAgdmFyIG5hbWUgPSBleHRlbmRPcHRpb25zLm5hbWUgfHwgU3VwZXIub3B0aW9ucy5uYW1lO1xuICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgdmFsaWRhdGVDb21wb25lbnROYW1lKG5hbWUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgU3ViID0gZnVuY3Rpb24gVnVlQ29tcG9uZW50IChvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuX2luaXQob3B0aW9ucyk7XG4gICAgICB9O1xuICAgICAgU3ViLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoU3VwZXIucHJvdG90eXBlKTtcbiAgICAgIFN1Yi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdWI7XG4gICAgICBTdWIuY2lkID0gY2lkKys7XG4gICAgICBTdWIub3B0aW9ucyA9IG1lcmdlT3B0aW9ucyhcbiAgICAgICAgU3VwZXIub3B0aW9ucyxcbiAgICAgICAgZXh0ZW5kT3B0aW9uc1xuICAgICAgKTtcbiAgICAgIFN1Ylsnc3VwZXInXSA9IFN1cGVyO1xuXG4gICAgICAvLyBGb3IgcHJvcHMgYW5kIGNvbXB1dGVkIHByb3BlcnRpZXMsIHdlIGRlZmluZSB0aGUgcHJveHkgZ2V0dGVycyBvblxuICAgICAgLy8gdGhlIFZ1ZSBpbnN0YW5jZXMgYXQgZXh0ZW5zaW9uIHRpbWUsIG9uIHRoZSBleHRlbmRlZCBwcm90b3R5cGUuIFRoaXNcbiAgICAgIC8vIGF2b2lkcyBPYmplY3QuZGVmaW5lUHJvcGVydHkgY2FsbHMgZm9yIGVhY2ggaW5zdGFuY2UgY3JlYXRlZC5cbiAgICAgIGlmIChTdWIub3B0aW9ucy5wcm9wcykge1xuICAgICAgICBpbml0UHJvcHMkMShTdWIpO1xuICAgICAgfVxuICAgICAgaWYgKFN1Yi5vcHRpb25zLmNvbXB1dGVkKSB7XG4gICAgICAgIGluaXRDb21wdXRlZCQxKFN1Yik7XG4gICAgICB9XG5cbiAgICAgIC8vIGFsbG93IGZ1cnRoZXIgZXh0ZW5zaW9uL21peGluL3BsdWdpbiB1c2FnZVxuICAgICAgU3ViLmV4dGVuZCA9IFN1cGVyLmV4dGVuZDtcbiAgICAgIFN1Yi5taXhpbiA9IFN1cGVyLm1peGluO1xuICAgICAgU3ViLnVzZSA9IFN1cGVyLnVzZTtcblxuICAgICAgLy8gY3JlYXRlIGFzc2V0IHJlZ2lzdGVycywgc28gZXh0ZW5kZWQgY2xhc3Nlc1xuICAgICAgLy8gY2FuIGhhdmUgdGhlaXIgcHJpdmF0ZSBhc3NldHMgdG9vLlxuICAgICAgQVNTRVRfVFlQRVMuZm9yRWFjaChmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICBTdWJbdHlwZV0gPSBTdXBlclt0eXBlXTtcbiAgICAgIH0pO1xuICAgICAgLy8gZW5hYmxlIHJlY3Vyc2l2ZSBzZWxmLWxvb2t1cFxuICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgU3ViLm9wdGlvbnMuY29tcG9uZW50c1tuYW1lXSA9IFN1YjtcbiAgICAgIH1cblxuICAgICAgLy8ga2VlcCBhIHJlZmVyZW5jZSB0byB0aGUgc3VwZXIgb3B0aW9ucyBhdCBleHRlbnNpb24gdGltZS5cbiAgICAgIC8vIGxhdGVyIGF0IGluc3RhbnRpYXRpb24gd2UgY2FuIGNoZWNrIGlmIFN1cGVyJ3Mgb3B0aW9ucyBoYXZlXG4gICAgICAvLyBiZWVuIHVwZGF0ZWQuXG4gICAgICBTdWIuc3VwZXJPcHRpb25zID0gU3VwZXIub3B0aW9ucztcbiAgICAgIFN1Yi5leHRlbmRPcHRpb25zID0gZXh0ZW5kT3B0aW9ucztcbiAgICAgIFN1Yi5zZWFsZWRPcHRpb25zID0gZXh0ZW5kKHt9LCBTdWIub3B0aW9ucyk7XG5cbiAgICAgIC8vIGNhY2hlIGNvbnN0cnVjdG9yXG4gICAgICBjYWNoZWRDdG9yc1tTdXBlcklkXSA9IFN1YjtcbiAgICAgIHJldHVybiBTdWJcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdFByb3BzJDEgKENvbXApIHtcbiAgICB2YXIgcHJvcHMgPSBDb21wLm9wdGlvbnMucHJvcHM7XG4gICAgZm9yICh2YXIga2V5IGluIHByb3BzKSB7XG4gICAgICBwcm94eShDb21wLnByb3RvdHlwZSwgXCJfcHJvcHNcIiwga2V5KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Q29tcHV0ZWQkMSAoQ29tcCkge1xuICAgIHZhciBjb21wdXRlZCA9IENvbXAub3B0aW9ucy5jb21wdXRlZDtcbiAgICBmb3IgKHZhciBrZXkgaW4gY29tcHV0ZWQpIHtcbiAgICAgIGRlZmluZUNvbXB1dGVkKENvbXAucHJvdG90eXBlLCBrZXksIGNvbXB1dGVkW2tleV0pO1xuICAgIH1cbiAgfVxuXG4gIC8qICAqL1xuXG4gIGZ1bmN0aW9uIGluaXRBc3NldFJlZ2lzdGVycyAoVnVlKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGFzc2V0IHJlZ2lzdHJhdGlvbiBtZXRob2RzLlxuICAgICAqL1xuICAgIEFTU0VUX1RZUEVTLmZvckVhY2goZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgIFZ1ZVt0eXBlXSA9IGZ1bmN0aW9uIChcbiAgICAgICAgaWQsXG4gICAgICAgIGRlZmluaXRpb25cbiAgICAgICkge1xuICAgICAgICBpZiAoIWRlZmluaXRpb24pIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zW3R5cGUgKyAncyddW2lkXVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgIGlmICh0eXBlID09PSAnY29tcG9uZW50Jykge1xuICAgICAgICAgICAgdmFsaWRhdGVDb21wb25lbnROYW1lKGlkKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGUgPT09ICdjb21wb25lbnQnICYmIGlzUGxhaW5PYmplY3QoZGVmaW5pdGlvbikpIHtcbiAgICAgICAgICAgIGRlZmluaXRpb24ubmFtZSA9IGRlZmluaXRpb24ubmFtZSB8fCBpZDtcbiAgICAgICAgICAgIGRlZmluaXRpb24gPSB0aGlzLm9wdGlvbnMuX2Jhc2UuZXh0ZW5kKGRlZmluaXRpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZSA9PT0gJ2RpcmVjdGl2ZScgJiYgdHlwZW9mIGRlZmluaXRpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGRlZmluaXRpb24gPSB7IGJpbmQ6IGRlZmluaXRpb24sIHVwZGF0ZTogZGVmaW5pdGlvbiB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLm9wdGlvbnNbdHlwZSArICdzJ11baWRdID0gZGVmaW5pdGlvbjtcbiAgICAgICAgICByZXR1cm4gZGVmaW5pdGlvblxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgLyogICovXG5cblxuXG5cblxuICBmdW5jdGlvbiBnZXRDb21wb25lbnROYW1lIChvcHRzKSB7XG4gICAgcmV0dXJuIG9wdHMgJiYgKG9wdHMuQ3Rvci5vcHRpb25zLm5hbWUgfHwgb3B0cy50YWcpXG4gIH1cblxuICBmdW5jdGlvbiBtYXRjaGVzIChwYXR0ZXJuLCBuYW1lKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocGF0dGVybikpIHtcbiAgICAgIHJldHVybiBwYXR0ZXJuLmluZGV4T2YobmFtZSkgPiAtMVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHBhdHRlcm4gPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gcGF0dGVybi5zcGxpdCgnLCcpLmluZGV4T2YobmFtZSkgPiAtMVxuICAgIH0gZWxzZSBpZiAoaXNSZWdFeHAocGF0dGVybikpIHtcbiAgICAgIHJldHVybiBwYXR0ZXJuLnRlc3QobmFtZSlcbiAgICB9XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIHBydW5lQ2FjaGUgKGtlZXBBbGl2ZUluc3RhbmNlLCBmaWx0ZXIpIHtcbiAgICB2YXIgY2FjaGUgPSBrZWVwQWxpdmVJbnN0YW5jZS5jYWNoZTtcbiAgICB2YXIga2V5cyA9IGtlZXBBbGl2ZUluc3RhbmNlLmtleXM7XG4gICAgdmFyIF92bm9kZSA9IGtlZXBBbGl2ZUluc3RhbmNlLl92bm9kZTtcbiAgICBmb3IgKHZhciBrZXkgaW4gY2FjaGUpIHtcbiAgICAgIHZhciBlbnRyeSA9IGNhY2hlW2tleV07XG4gICAgICBpZiAoZW50cnkpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBlbnRyeS5uYW1lO1xuICAgICAgICBpZiAobmFtZSAmJiAhZmlsdGVyKG5hbWUpKSB7XG4gICAgICAgICAgcHJ1bmVDYWNoZUVudHJ5KGNhY2hlLCBrZXksIGtleXMsIF92bm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwcnVuZUNhY2hlRW50cnkgKFxuICAgIGNhY2hlLFxuICAgIGtleSxcbiAgICBrZXlzLFxuICAgIGN1cnJlbnRcbiAgKSB7XG4gICAgdmFyIGVudHJ5ID0gY2FjaGVba2V5XTtcbiAgICBpZiAoZW50cnkgJiYgKCFjdXJyZW50IHx8IGVudHJ5LnRhZyAhPT0gY3VycmVudC50YWcpKSB7XG4gICAgICBlbnRyeS5jb21wb25lbnRJbnN0YW5jZS4kZGVzdHJveSgpO1xuICAgIH1cbiAgICBjYWNoZVtrZXldID0gbnVsbDtcbiAgICByZW1vdmUoa2V5cywga2V5KTtcbiAgfVxuXG4gIHZhciBwYXR0ZXJuVHlwZXMgPSBbU3RyaW5nLCBSZWdFeHAsIEFycmF5XTtcblxuICB2YXIgS2VlcEFsaXZlID0ge1xuICAgIG5hbWU6ICdrZWVwLWFsaXZlJyxcbiAgICBhYnN0cmFjdDogdHJ1ZSxcblxuICAgIHByb3BzOiB7XG4gICAgICBpbmNsdWRlOiBwYXR0ZXJuVHlwZXMsXG4gICAgICBleGNsdWRlOiBwYXR0ZXJuVHlwZXMsXG4gICAgICBtYXg6IFtTdHJpbmcsIE51bWJlcl1cbiAgICB9LFxuXG4gICAgbWV0aG9kczoge1xuICAgICAgY2FjaGVWTm9kZTogZnVuY3Rpb24gY2FjaGVWTm9kZSgpIHtcbiAgICAgICAgdmFyIHJlZiA9IHRoaXM7XG4gICAgICAgIHZhciBjYWNoZSA9IHJlZi5jYWNoZTtcbiAgICAgICAgdmFyIGtleXMgPSByZWYua2V5cztcbiAgICAgICAgdmFyIHZub2RlVG9DYWNoZSA9IHJlZi52bm9kZVRvQ2FjaGU7XG4gICAgICAgIHZhciBrZXlUb0NhY2hlID0gcmVmLmtleVRvQ2FjaGU7XG4gICAgICAgIGlmICh2bm9kZVRvQ2FjaGUpIHtcbiAgICAgICAgICB2YXIgdGFnID0gdm5vZGVUb0NhY2hlLnRhZztcbiAgICAgICAgICB2YXIgY29tcG9uZW50SW5zdGFuY2UgPSB2bm9kZVRvQ2FjaGUuY29tcG9uZW50SW5zdGFuY2U7XG4gICAgICAgICAgdmFyIGNvbXBvbmVudE9wdGlvbnMgPSB2bm9kZVRvQ2FjaGUuY29tcG9uZW50T3B0aW9ucztcbiAgICAgICAgICBjYWNoZVtrZXlUb0NhY2hlXSA9IHtcbiAgICAgICAgICAgIG5hbWU6IGdldENvbXBvbmVudE5hbWUoY29tcG9uZW50T3B0aW9ucyksXG4gICAgICAgICAgICB0YWc6IHRhZyxcbiAgICAgICAgICAgIGNvbXBvbmVudEluc3RhbmNlOiBjb21wb25lbnRJbnN0YW5jZSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIGtleXMucHVzaChrZXlUb0NhY2hlKTtcbiAgICAgICAgICAvLyBwcnVuZSBvbGRlc3QgZW50cnlcbiAgICAgICAgICBpZiAodGhpcy5tYXggJiYga2V5cy5sZW5ndGggPiBwYXJzZUludCh0aGlzLm1heCkpIHtcbiAgICAgICAgICAgIHBydW5lQ2FjaGVFbnRyeShjYWNoZSwga2V5c1swXSwga2V5cywgdGhpcy5fdm5vZGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnZub2RlVG9DYWNoZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY3JlYXRlZDogZnVuY3Rpb24gY3JlYXRlZCAoKSB7XG4gICAgICB0aGlzLmNhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgIHRoaXMua2V5cyA9IFtdO1xuICAgIH0sXG5cbiAgICBkZXN0cm95ZWQ6IGZ1bmN0aW9uIGRlc3Ryb3llZCAoKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5jYWNoZSkge1xuICAgICAgICBwcnVuZUNhY2hlRW50cnkodGhpcy5jYWNoZSwga2V5LCB0aGlzLmtleXMpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBtb3VudGVkOiBmdW5jdGlvbiBtb3VudGVkICgpIHtcbiAgICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gICAgICB0aGlzLmNhY2hlVk5vZGUoKTtcbiAgICAgIHRoaXMuJHdhdGNoKCdpbmNsdWRlJywgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICBwcnVuZUNhY2hlKHRoaXMkMSwgZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIG1hdGNoZXModmFsLCBuYW1lKTsgfSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuJHdhdGNoKCdleGNsdWRlJywgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICBwcnVuZUNhY2hlKHRoaXMkMSwgZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuICFtYXRjaGVzKHZhbCwgbmFtZSk7IH0pO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHVwZGF0ZWQ6IGZ1bmN0aW9uIHVwZGF0ZWQgKCkge1xuICAgICAgdGhpcy5jYWNoZVZOb2RlKCk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyICgpIHtcbiAgICAgIHZhciBzbG90ID0gdGhpcy4kc2xvdHMuZGVmYXVsdDtcbiAgICAgIHZhciB2bm9kZSA9IGdldEZpcnN0Q29tcG9uZW50Q2hpbGQoc2xvdCk7XG4gICAgICB2YXIgY29tcG9uZW50T3B0aW9ucyA9IHZub2RlICYmIHZub2RlLmNvbXBvbmVudE9wdGlvbnM7XG4gICAgICBpZiAoY29tcG9uZW50T3B0aW9ucykge1xuICAgICAgICAvLyBjaGVjayBwYXR0ZXJuXG4gICAgICAgIHZhciBuYW1lID0gZ2V0Q29tcG9uZW50TmFtZShjb21wb25lbnRPcHRpb25zKTtcbiAgICAgICAgdmFyIHJlZiA9IHRoaXM7XG4gICAgICAgIHZhciBpbmNsdWRlID0gcmVmLmluY2x1ZGU7XG4gICAgICAgIHZhciBleGNsdWRlID0gcmVmLmV4Y2x1ZGU7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAvLyBub3QgaW5jbHVkZWRcbiAgICAgICAgICAoaW5jbHVkZSAmJiAoIW5hbWUgfHwgIW1hdGNoZXMoaW5jbHVkZSwgbmFtZSkpKSB8fFxuICAgICAgICAgIC8vIGV4Y2x1ZGVkXG4gICAgICAgICAgKGV4Y2x1ZGUgJiYgbmFtZSAmJiBtYXRjaGVzKGV4Y2x1ZGUsIG5hbWUpKVxuICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm4gdm5vZGVcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZWYkMSA9IHRoaXM7XG4gICAgICAgIHZhciBjYWNoZSA9IHJlZiQxLmNhY2hlO1xuICAgICAgICB2YXIga2V5cyA9IHJlZiQxLmtleXM7XG4gICAgICAgIHZhciBrZXkgPSB2bm9kZS5rZXkgPT0gbnVsbFxuICAgICAgICAgIC8vIHNhbWUgY29uc3RydWN0b3IgbWF5IGdldCByZWdpc3RlcmVkIGFzIGRpZmZlcmVudCBsb2NhbCBjb21wb25lbnRzXG4gICAgICAgICAgLy8gc28gY2lkIGFsb25lIGlzIG5vdCBlbm91Z2ggKCMzMjY5KVxuICAgICAgICAgID8gY29tcG9uZW50T3B0aW9ucy5DdG9yLmNpZCArIChjb21wb25lbnRPcHRpb25zLnRhZyA/IChcIjo6XCIgKyAoY29tcG9uZW50T3B0aW9ucy50YWcpKSA6ICcnKVxuICAgICAgICAgIDogdm5vZGUua2V5O1xuICAgICAgICBpZiAoY2FjaGVba2V5XSkge1xuICAgICAgICAgIHZub2RlLmNvbXBvbmVudEluc3RhbmNlID0gY2FjaGVba2V5XS5jb21wb25lbnRJbnN0YW5jZTtcbiAgICAgICAgICAvLyBtYWtlIGN1cnJlbnQga2V5IGZyZXNoZXN0XG4gICAgICAgICAgcmVtb3ZlKGtleXMsIGtleSk7XG4gICAgICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gZGVsYXkgc2V0dGluZyB0aGUgY2FjaGUgdW50aWwgdXBkYXRlXG4gICAgICAgICAgdGhpcy52bm9kZVRvQ2FjaGUgPSB2bm9kZTtcbiAgICAgICAgICB0aGlzLmtleVRvQ2FjaGUgPSBrZXk7XG4gICAgICAgIH1cblxuICAgICAgICB2bm9kZS5kYXRhLmtlZXBBbGl2ZSA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gdm5vZGUgfHwgKHNsb3QgJiYgc2xvdFswXSlcbiAgICB9XG4gIH07XG5cbiAgdmFyIGJ1aWx0SW5Db21wb25lbnRzID0ge1xuICAgIEtlZXBBbGl2ZTogS2VlcEFsaXZlXG4gIH07XG5cbiAgLyogICovXG5cbiAgZnVuY3Rpb24gaW5pdEdsb2JhbEFQSSAoVnVlKSB7XG4gICAgLy8gY29uZmlnXG4gICAgdmFyIGNvbmZpZ0RlZiA9IHt9O1xuICAgIGNvbmZpZ0RlZi5nZXQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBjb25maWc7IH07XG4gICAge1xuICAgICAgY29uZmlnRGVmLnNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgd2FybihcbiAgICAgICAgICAnRG8gbm90IHJlcGxhY2UgdGhlIFZ1ZS5jb25maWcgb2JqZWN0LCBzZXQgaW5kaXZpZHVhbCBmaWVsZHMgaW5zdGVhZC4nXG4gICAgICAgICk7XG4gICAgICB9O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVnVlLCAnY29uZmlnJywgY29uZmlnRGVmKTtcblxuICAgIC8vIGV4cG9zZWQgdXRpbCBtZXRob2RzLlxuICAgIC8vIE5PVEU6IHRoZXNlIGFyZSBub3QgY29uc2lkZXJlZCBwYXJ0IG9mIHRoZSBwdWJsaWMgQVBJIC0gYXZvaWQgcmVseWluZyBvblxuICAgIC8vIHRoZW0gdW5sZXNzIHlvdSBhcmUgYXdhcmUgb2YgdGhlIHJpc2suXG4gICAgVnVlLnV0aWwgPSB7XG4gICAgICB3YXJuOiB3YXJuLFxuICAgICAgZXh0ZW5kOiBleHRlbmQsXG4gICAgICBtZXJnZU9wdGlvbnM6IG1lcmdlT3B0aW9ucyxcbiAgICAgIGRlZmluZVJlYWN0aXZlOiBkZWZpbmVSZWFjdGl2ZSQkMVxuICAgIH07XG5cbiAgICBWdWUuc2V0ID0gc2V0O1xuICAgIFZ1ZS5kZWxldGUgPSBkZWw7XG4gICAgVnVlLm5leHRUaWNrID0gbmV4dFRpY2s7XG5cbiAgICAvLyAyLjYgZXhwbGljaXQgb2JzZXJ2YWJsZSBBUElcbiAgICBWdWUub2JzZXJ2YWJsZSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIG9ic2VydmUob2JqKTtcbiAgICAgIHJldHVybiBvYmpcbiAgICB9O1xuXG4gICAgVnVlLm9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIEFTU0VUX1RZUEVTLmZvckVhY2goZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgIFZ1ZS5vcHRpb25zW3R5cGUgKyAncyddID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB9KTtcblxuICAgIC8vIHRoaXMgaXMgdXNlZCB0byBpZGVudGlmeSB0aGUgXCJiYXNlXCIgY29uc3RydWN0b3IgdG8gZXh0ZW5kIGFsbCBwbGFpbi1vYmplY3RcbiAgICAvLyBjb21wb25lbnRzIHdpdGggaW4gV2VleCdzIG11bHRpLWluc3RhbmNlIHNjZW5hcmlvcy5cbiAgICBWdWUub3B0aW9ucy5fYmFzZSA9IFZ1ZTtcblxuICAgIGV4dGVuZChWdWUub3B0aW9ucy5jb21wb25lbnRzLCBidWlsdEluQ29tcG9uZW50cyk7XG5cbiAgICBpbml0VXNlKFZ1ZSk7XG4gICAgaW5pdE1peGluJDEoVnVlKTtcbiAgICBpbml0RXh0ZW5kKFZ1ZSk7XG4gICAgaW5pdEFzc2V0UmVnaXN0ZXJzKFZ1ZSk7XG4gIH1cblxuICBpbml0R2xvYmFsQVBJKFZ1ZSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFZ1ZS5wcm90b3R5cGUsICckaXNTZXJ2ZXInLCB7XG4gICAgZ2V0OiBpc1NlcnZlclJlbmRlcmluZ1xuICB9KTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVnVlLnByb3RvdHlwZSwgJyRzc3JDb250ZXh0Jywge1xuICAgIGdldDogZnVuY3Rpb24gZ2V0ICgpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICByZXR1cm4gdGhpcy4kdm5vZGUgJiYgdGhpcy4kdm5vZGUuc3NyQ29udGV4dFxuICAgIH1cbiAgfSk7XG5cbiAgLy8gZXhwb3NlIEZ1bmN0aW9uYWxSZW5kZXJDb250ZXh0IGZvciBzc3IgcnVudGltZSBoZWxwZXIgaW5zdGFsbGF0aW9uXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShWdWUsICdGdW5jdGlvbmFsUmVuZGVyQ29udGV4dCcsIHtcbiAgICB2YWx1ZTogRnVuY3Rpb25hbFJlbmRlckNvbnRleHRcbiAgfSk7XG5cbiAgVnVlLnZlcnNpb24gPSAnMi42LjE0JztcblxuICAvKiAgKi9cblxuICAvLyB0aGVzZSBhcmUgcmVzZXJ2ZWQgZm9yIHdlYiBiZWNhdXNlIHRoZXkgYXJlIGRpcmVjdGx5IGNvbXBpbGVkIGF3YXlcbiAgLy8gZHVyaW5nIHRlbXBsYXRlIGNvbXBpbGF0aW9uXG4gIHZhciBpc1Jlc2VydmVkQXR0ciA9IG1ha2VNYXAoJ3N0eWxlLGNsYXNzJyk7XG5cbiAgLy8gYXR0cmlidXRlcyB0aGF0IHNob3VsZCBiZSB1c2luZyBwcm9wcyBmb3IgYmluZGluZ1xuICB2YXIgYWNjZXB0VmFsdWUgPSBtYWtlTWFwKCdpbnB1dCx0ZXh0YXJlYSxvcHRpb24sc2VsZWN0LHByb2dyZXNzJyk7XG4gIHZhciBtdXN0VXNlUHJvcCA9IGZ1bmN0aW9uICh0YWcsIHR5cGUsIGF0dHIpIHtcbiAgICByZXR1cm4gKFxuICAgICAgKGF0dHIgPT09ICd2YWx1ZScgJiYgYWNjZXB0VmFsdWUodGFnKSkgJiYgdHlwZSAhPT0gJ2J1dHRvbicgfHxcbiAgICAgIChhdHRyID09PSAnc2VsZWN0ZWQnICYmIHRhZyA9PT0gJ29wdGlvbicpIHx8XG4gICAgICAoYXR0ciA9PT0gJ2NoZWNrZWQnICYmIHRhZyA9PT0gJ2lucHV0JykgfHxcbiAgICAgIChhdHRyID09PSAnbXV0ZWQnICYmIHRhZyA9PT0gJ3ZpZGVvJylcbiAgICApXG4gIH07XG5cbiAgdmFyIGlzRW51bWVyYXRlZEF0dHIgPSBtYWtlTWFwKCdjb250ZW50ZWRpdGFibGUsZHJhZ2dhYmxlLHNwZWxsY2hlY2snKTtcblxuICB2YXIgaXNWYWxpZENvbnRlbnRFZGl0YWJsZVZhbHVlID0gbWFrZU1hcCgnZXZlbnRzLGNhcmV0LHR5cGluZyxwbGFpbnRleHQtb25seScpO1xuXG4gIHZhciBjb252ZXJ0RW51bWVyYXRlZFZhbHVlID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICByZXR1cm4gaXNGYWxzeUF0dHJWYWx1ZSh2YWx1ZSkgfHwgdmFsdWUgPT09ICdmYWxzZSdcbiAgICAgID8gJ2ZhbHNlJ1xuICAgICAgLy8gYWxsb3cgYXJiaXRyYXJ5IHN0cmluZyB2YWx1ZSBmb3IgY29udGVudGVkaXRhYmxlXG4gICAgICA6IGtleSA9PT0gJ2NvbnRlbnRlZGl0YWJsZScgJiYgaXNWYWxpZENvbnRlbnRFZGl0YWJsZVZhbHVlKHZhbHVlKVxuICAgICAgICA/IHZhbHVlXG4gICAgICAgIDogJ3RydWUnXG4gIH07XG5cbiAgdmFyIGlzQm9vbGVhbkF0dHIgPSBtYWtlTWFwKFxuICAgICdhbGxvd2Z1bGxzY3JlZW4sYXN5bmMsYXV0b2ZvY3VzLGF1dG9wbGF5LGNoZWNrZWQsY29tcGFjdCxjb250cm9scyxkZWNsYXJlLCcgK1xuICAgICdkZWZhdWx0LGRlZmF1bHRjaGVja2VkLGRlZmF1bHRtdXRlZCxkZWZhdWx0c2VsZWN0ZWQsZGVmZXIsZGlzYWJsZWQsJyArXG4gICAgJ2VuYWJsZWQsZm9ybW5vdmFsaWRhdGUsaGlkZGVuLGluZGV0ZXJtaW5hdGUsaW5lcnQsaXNtYXAsaXRlbXNjb3BlLGxvb3AsbXVsdGlwbGUsJyArXG4gICAgJ211dGVkLG5vaHJlZixub3Jlc2l6ZSxub3NoYWRlLG5vdmFsaWRhdGUsbm93cmFwLG9wZW4scGF1c2VvbmV4aXQscmVhZG9ubHksJyArXG4gICAgJ3JlcXVpcmVkLHJldmVyc2VkLHNjb3BlZCxzZWFtbGVzcyxzZWxlY3RlZCxzb3J0YWJsZSwnICtcbiAgICAndHJ1ZXNwZWVkLHR5cGVtdXN0bWF0Y2gsdmlzaWJsZSdcbiAgKTtcblxuICB2YXIgeGxpbmtOUyA9ICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJztcblxuICB2YXIgaXNYbGluayA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIG5hbWUuY2hhckF0KDUpID09PSAnOicgJiYgbmFtZS5zbGljZSgwLCA1KSA9PT0gJ3hsaW5rJ1xuICB9O1xuXG4gIHZhciBnZXRYbGlua1Byb3AgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiBpc1hsaW5rKG5hbWUpID8gbmFtZS5zbGljZSg2LCBuYW1lLmxlbmd0aCkgOiAnJ1xuICB9O1xuXG4gIHZhciBpc0ZhbHN5QXR0clZhbHVlID0gZnVuY3Rpb24gKHZhbCkge1xuICAgIHJldHVybiB2YWwgPT0gbnVsbCB8fCB2YWwgPT09IGZhbHNlXG4gIH07XG5cbiAgLyogICovXG5cbiAgZnVuY3Rpb24gZ2VuQ2xhc3NGb3JWbm9kZSAodm5vZGUpIHtcbiAgICB2YXIgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgdmFyIHBhcmVudE5vZGUgPSB2bm9kZTtcbiAgICB2YXIgY2hpbGROb2RlID0gdm5vZGU7XG4gICAgd2hpbGUgKGlzRGVmKGNoaWxkTm9kZS5jb21wb25lbnRJbnN0YW5jZSkpIHtcbiAgICAgIGNoaWxkTm9kZSA9IGNoaWxkTm9kZS5jb21wb25lbnRJbnN0YW5jZS5fdm5vZGU7XG4gICAgICBpZiAoY2hpbGROb2RlICYmIGNoaWxkTm9kZS5kYXRhKSB7XG4gICAgICAgIGRhdGEgPSBtZXJnZUNsYXNzRGF0YShjaGlsZE5vZGUuZGF0YSwgZGF0YSk7XG4gICAgICB9XG4gICAgfVxuICAgIHdoaWxlIChpc0RlZihwYXJlbnROb2RlID0gcGFyZW50Tm9kZS5wYXJlbnQpKSB7XG4gICAgICBpZiAocGFyZW50Tm9kZSAmJiBwYXJlbnROb2RlLmRhdGEpIHtcbiAgICAgICAgZGF0YSA9IG1lcmdlQ2xhc3NEYXRhKGRhdGEsIHBhcmVudE5vZGUuZGF0YSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZW5kZXJDbGFzcyhkYXRhLnN0YXRpY0NsYXNzLCBkYXRhLmNsYXNzKVxuICB9XG5cbiAgZnVuY3Rpb24gbWVyZ2VDbGFzc0RhdGEgKGNoaWxkLCBwYXJlbnQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdGljQ2xhc3M6IGNvbmNhdChjaGlsZC5zdGF0aWNDbGFzcywgcGFyZW50LnN0YXRpY0NsYXNzKSxcbiAgICAgIGNsYXNzOiBpc0RlZihjaGlsZC5jbGFzcylcbiAgICAgICAgPyBbY2hpbGQuY2xhc3MsIHBhcmVudC5jbGFzc11cbiAgICAgICAgOiBwYXJlbnQuY2xhc3NcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJDbGFzcyAoXG4gICAgc3RhdGljQ2xhc3MsXG4gICAgZHluYW1pY0NsYXNzXG4gICkge1xuICAgIGlmIChpc0RlZihzdGF0aWNDbGFzcykgfHwgaXNEZWYoZHluYW1pY0NsYXNzKSkge1xuICAgICAgcmV0dXJuIGNvbmNhdChzdGF0aWNDbGFzcywgc3RyaW5naWZ5Q2xhc3MoZHluYW1pY0NsYXNzKSlcbiAgICB9XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbmNhdCAoYSwgYikge1xuICAgIHJldHVybiBhID8gYiA/IChhICsgJyAnICsgYikgOiBhIDogKGIgfHwgJycpXG4gIH1cblxuICBmdW5jdGlvbiBzdHJpbmdpZnlDbGFzcyAodmFsdWUpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBzdHJpbmdpZnlBcnJheSh2YWx1ZSlcbiAgICB9XG4gICAgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHN0cmluZ2lmeU9iamVjdCh2YWx1ZSlcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH1cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgZnVuY3Rpb24gc3RyaW5naWZ5QXJyYXkgKHZhbHVlKSB7XG4gICAgdmFyIHJlcyA9ICcnO1xuICAgIHZhciBzdHJpbmdpZmllZDtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKGlzRGVmKHN0cmluZ2lmaWVkID0gc3RyaW5naWZ5Q2xhc3ModmFsdWVbaV0pKSAmJiBzdHJpbmdpZmllZCAhPT0gJycpIHtcbiAgICAgICAgaWYgKHJlcykgeyByZXMgKz0gJyAnOyB9XG4gICAgICAgIHJlcyArPSBzdHJpbmdpZmllZDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgZnVuY3Rpb24gc3RyaW5naWZ5T2JqZWN0ICh2YWx1ZSkge1xuICAgIHZhciByZXMgPSAnJztcbiAgICBmb3IgKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZVtrZXldKSB7XG4gICAgICAgIGlmIChyZXMpIHsgcmVzICs9ICcgJzsgfVxuICAgICAgICByZXMgKz0ga2V5O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICAvKiAgKi9cblxuICB2YXIgbmFtZXNwYWNlTWFwID0ge1xuICAgIHN2ZzogJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyxcbiAgICBtYXRoOiAnaHR0cDovL3d3dy53My5vcmcvMTk5OC9NYXRoL01hdGhNTCdcbiAgfTtcblxuICB2YXIgaXNIVE1MVGFnID0gbWFrZU1hcChcbiAgICAnaHRtbCxib2R5LGJhc2UsaGVhZCxsaW5rLG1ldGEsc3R5bGUsdGl0bGUsJyArXG4gICAgJ2FkZHJlc3MsYXJ0aWNsZSxhc2lkZSxmb290ZXIsaGVhZGVyLGgxLGgyLGgzLGg0LGg1LGg2LGhncm91cCxuYXYsc2VjdGlvbiwnICtcbiAgICAnZGl2LGRkLGRsLGR0LGZpZ2NhcHRpb24sZmlndXJlLHBpY3R1cmUsaHIsaW1nLGxpLG1haW4sb2wscCxwcmUsdWwsJyArXG4gICAgJ2EsYixhYmJyLGJkaSxiZG8sYnIsY2l0ZSxjb2RlLGRhdGEsZGZuLGVtLGksa2JkLG1hcmsscSxycCxydCxydGMscnVieSwnICtcbiAgICAncyxzYW1wLHNtYWxsLHNwYW4sc3Ryb25nLHN1YixzdXAsdGltZSx1LHZhcix3YnIsYXJlYSxhdWRpbyxtYXAsdHJhY2ssdmlkZW8sJyArXG4gICAgJ2VtYmVkLG9iamVjdCxwYXJhbSxzb3VyY2UsY2FudmFzLHNjcmlwdCxub3NjcmlwdCxkZWwsaW5zLCcgK1xuICAgICdjYXB0aW9uLGNvbCxjb2xncm91cCx0YWJsZSx0aGVhZCx0Ym9keSx0ZCx0aCx0ciwnICtcbiAgICAnYnV0dG9uLGRhdGFsaXN0LGZpZWxkc2V0LGZvcm0saW5wdXQsbGFiZWwsbGVnZW5kLG1ldGVyLG9wdGdyb3VwLG9wdGlvbiwnICtcbiAgICAnb3V0cHV0LHByb2dyZXNzLHNlbGVjdCx0ZXh0YXJlYSwnICtcbiAgICAnZGV0YWlscyxkaWFsb2csbWVudSxtZW51aXRlbSxzdW1tYXJ5LCcgK1xuICAgICdjb250ZW50LGVsZW1lbnQsc2hhZG93LHRlbXBsYXRlLGJsb2NrcXVvdGUsaWZyYW1lLHRmb290J1xuICApO1xuXG4gIC8vIHRoaXMgbWFwIGlzIGludGVudGlvbmFsbHkgc2VsZWN0aXZlLCBvbmx5IGNvdmVyaW5nIFNWRyBlbGVtZW50cyB0aGF0IG1heVxuICAvLyBjb250YWluIGNoaWxkIGVsZW1lbnRzLlxuICB2YXIgaXNTVkcgPSBtYWtlTWFwKFxuICAgICdzdmcsYW5pbWF0ZSxjaXJjbGUsY2xpcHBhdGgsY3Vyc29yLGRlZnMsZGVzYyxlbGxpcHNlLGZpbHRlcixmb250LWZhY2UsJyArXG4gICAgJ2ZvcmVpZ25vYmplY3QsZyxnbHlwaCxpbWFnZSxsaW5lLG1hcmtlcixtYXNrLG1pc3NpbmctZ2x5cGgscGF0aCxwYXR0ZXJuLCcgK1xuICAgICdwb2x5Z29uLHBvbHlsaW5lLHJlY3Qsc3dpdGNoLHN5bWJvbCx0ZXh0LHRleHRwYXRoLHRzcGFuLHVzZSx2aWV3JyxcbiAgICB0cnVlXG4gICk7XG5cbiAgdmFyIGlzUHJlVGFnID0gZnVuY3Rpb24gKHRhZykgeyByZXR1cm4gdGFnID09PSAncHJlJzsgfTtcblxuICB2YXIgaXNSZXNlcnZlZFRhZyA9IGZ1bmN0aW9uICh0YWcpIHtcbiAgICByZXR1cm4gaXNIVE1MVGFnKHRhZykgfHwgaXNTVkcodGFnKVxuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFRhZ05hbWVzcGFjZSAodGFnKSB7XG4gICAgaWYgKGlzU1ZHKHRhZykpIHtcbiAgICAgIHJldHVybiAnc3ZnJ1xuICAgIH1cbiAgICAvLyBiYXNpYyBzdXBwb3J0IGZvciBNYXRoTUxcbiAgICAvLyBub3RlIGl0IGRvZXNuJ3Qgc3VwcG9ydCBvdGhlciBNYXRoTUwgZWxlbWVudHMgYmVpbmcgY29tcG9uZW50IHJvb3RzXG4gICAgaWYgKHRhZyA9PT0gJ21hdGgnKSB7XG4gICAgICByZXR1cm4gJ21hdGgnXG4gICAgfVxuICB9XG5cbiAgdmFyIHVua25vd25FbGVtZW50Q2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBmdW5jdGlvbiBpc1Vua25vd25FbGVtZW50ICh0YWcpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoIWluQnJvd3Nlcikge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgaWYgKGlzUmVzZXJ2ZWRUYWcodGFnKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIHRhZyA9IHRhZy50b0xvd2VyQ2FzZSgpO1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICh1bmtub3duRWxlbWVudENhY2hlW3RhZ10gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHVua25vd25FbGVtZW50Q2FjaGVbdGFnXVxuICAgIH1cbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG4gICAgaWYgKHRhZy5pbmRleE9mKCctJykgPiAtMSkge1xuICAgICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjgyMTAzNjQvMTA3MDI0NFxuICAgICAgcmV0dXJuICh1bmtub3duRWxlbWVudENhY2hlW3RhZ10gPSAoXG4gICAgICAgIGVsLmNvbnN0cnVjdG9yID09PSB3aW5kb3cuSFRNTFVua25vd25FbGVtZW50IHx8XG4gICAgICAgIGVsLmNvbnN0cnVjdG9yID09PSB3aW5kb3cuSFRNTEVsZW1lbnRcbiAgICAgICkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAodW5rbm93bkVsZW1lbnRDYWNoZVt0YWddID0gL0hUTUxVbmtub3duRWxlbWVudC8udGVzdChlbC50b1N0cmluZygpKSlcbiAgICB9XG4gIH1cblxuICB2YXIgaXNUZXh0SW5wdXRUeXBlID0gbWFrZU1hcCgndGV4dCxudW1iZXIscGFzc3dvcmQsc2VhcmNoLGVtYWlsLHRlbCx1cmwnKTtcblxuICAvKiAgKi9cblxuICAvKipcbiAgICogUXVlcnkgYW4gZWxlbWVudCBzZWxlY3RvciBpZiBpdCdzIG5vdCBhbiBlbGVtZW50IGFscmVhZHkuXG4gICAqL1xuICBmdW5jdGlvbiBxdWVyeSAoZWwpIHtcbiAgICBpZiAodHlwZW9mIGVsID09PSAnc3RyaW5nJykge1xuICAgICAgdmFyIHNlbGVjdGVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbCk7XG4gICAgICBpZiAoIXNlbGVjdGVkKSB7XG4gICAgICAgIHdhcm4oXG4gICAgICAgICAgJ0Nhbm5vdCBmaW5kIGVsZW1lbnQ6ICcgKyBlbFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZWxlY3RlZFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZWxcbiAgICB9XG4gIH1cblxuICAvKiAgKi9cblxuICBmdW5jdGlvbiBjcmVhdGVFbGVtZW50JDEgKHRhZ05hbWUsIHZub2RlKSB7XG4gICAgdmFyIGVsbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XG4gICAgaWYgKHRhZ05hbWUgIT09ICdzZWxlY3QnKSB7XG4gICAgICByZXR1cm4gZWxtXG4gICAgfVxuICAgIC8vIGZhbHNlIG9yIG51bGwgd2lsbCByZW1vdmUgdGhlIGF0dHJpYnV0ZSBidXQgdW5kZWZpbmVkIHdpbGwgbm90XG4gICAgaWYgKHZub2RlLmRhdGEgJiYgdm5vZGUuZGF0YS5hdHRycyAmJiB2bm9kZS5kYXRhLmF0dHJzLm11bHRpcGxlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGVsbS5zZXRBdHRyaWJ1dGUoJ211bHRpcGxlJywgJ211bHRpcGxlJyk7XG4gICAgfVxuICAgIHJldHVybiBlbG1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnROUyAobmFtZXNwYWNlLCB0YWdOYW1lKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2VNYXBbbmFtZXNwYWNlXSwgdGFnTmFtZSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVRleHROb2RlICh0ZXh0KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpXG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVDb21tZW50ICh0ZXh0KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQodGV4dClcbiAgfVxuXG4gIGZ1bmN0aW9uIGluc2VydEJlZm9yZSAocGFyZW50Tm9kZSwgbmV3Tm9kZSwgcmVmZXJlbmNlTm9kZSkge1xuICAgIHBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlQ2hpbGQgKG5vZGUsIGNoaWxkKSB7XG4gICAgbm9kZS5yZW1vdmVDaGlsZChjaGlsZCk7XG4gIH1cblxuICBmdW5jdGlvbiBhcHBlbmRDaGlsZCAobm9kZSwgY2hpbGQpIHtcbiAgICBub2RlLmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcmVudE5vZGUgKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5wYXJlbnROb2RlXG4gIH1cblxuICBmdW5jdGlvbiBuZXh0U2libGluZyAobm9kZSkge1xuICAgIHJldHVybiBub2RlLm5leHRTaWJsaW5nXG4gIH1cblxuICBmdW5jdGlvbiB0YWdOYW1lIChub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUudGFnTmFtZVxuICB9XG5cbiAgZnVuY3Rpb24gc2V0VGV4dENvbnRlbnQgKG5vZGUsIHRleHQpIHtcbiAgICBub2RlLnRleHRDb250ZW50ID0gdGV4dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFN0eWxlU2NvcGUgKG5vZGUsIHNjb3BlSWQpIHtcbiAgICBub2RlLnNldEF0dHJpYnV0ZShzY29wZUlkLCAnJyk7XG4gIH1cblxuICB2YXIgbm9kZU9wcyA9IC8qI19fUFVSRV9fKi9PYmplY3QuZnJlZXplKHtcbiAgICBjcmVhdGVFbGVtZW50OiBjcmVhdGVFbGVtZW50JDEsXG4gICAgY3JlYXRlRWxlbWVudE5TOiBjcmVhdGVFbGVtZW50TlMsXG4gICAgY3JlYXRlVGV4dE5vZGU6IGNyZWF0ZVRleHROb2RlLFxuICAgIGNyZWF0ZUNvbW1lbnQ6IGNyZWF0ZUNvbW1lbnQsXG4gICAgaW5zZXJ0QmVmb3JlOiBpbnNlcnRCZWZvcmUsXG4gICAgcmVtb3ZlQ2hpbGQ6IHJlbW92ZUNoaWxkLFxuICAgIGFwcGVuZENoaWxkOiBhcHBlbmRDaGlsZCxcbiAgICBwYXJlbnROb2RlOiBwYXJlbnROb2RlLFxuICAgIG5leHRTaWJsaW5nOiBuZXh0U2libGluZyxcbiAgICB0YWdOYW1lOiB0YWdOYW1lLFxuICAgIHNldFRleHRDb250ZW50OiBzZXRUZXh0Q29udGVudCxcbiAgICBzZXRTdHlsZVNjb3BlOiBzZXRTdHlsZVNjb3BlXG4gIH0pO1xuXG4gIC8qICAqL1xuXG4gIHZhciByZWYgPSB7XG4gICAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGUgKF8sIHZub2RlKSB7XG4gICAgICByZWdpc3RlclJlZih2bm9kZSk7XG4gICAgfSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSAob2xkVm5vZGUsIHZub2RlKSB7XG4gICAgICBpZiAob2xkVm5vZGUuZGF0YS5yZWYgIT09IHZub2RlLmRhdGEucmVmKSB7XG4gICAgICAgIHJlZ2lzdGVyUmVmKG9sZFZub2RlLCB0cnVlKTtcbiAgICAgICAgcmVnaXN0ZXJSZWYodm5vZGUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZGVzdHJveTogZnVuY3Rpb24gZGVzdHJveSAodm5vZGUpIHtcbiAgICAgIHJlZ2lzdGVyUmVmKHZub2RlLCB0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gcmVnaXN0ZXJSZWYgKHZub2RlLCBpc1JlbW92YWwpIHtcbiAgICB2YXIga2V5ID0gdm5vZGUuZGF0YS5yZWY7XG4gICAgaWYgKCFpc0RlZihrZXkpKSB7IHJldHVybiB9XG5cbiAgICB2YXIgdm0gPSB2bm9kZS5jb250ZXh0O1xuICAgIHZhciByZWYgPSB2bm9kZS5jb21wb25lbnRJbnN0YW5jZSB8fCB2bm9kZS5lbG07XG4gICAgdmFyIHJlZnMgPSB2bS4kcmVmcztcbiAgICBpZiAoaXNSZW1vdmFsKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShyZWZzW2tleV0pKSB7XG4gICAgICAgIHJlbW92ZShyZWZzW2tleV0sIHJlZik7XG4gICAgICB9IGVsc2UgaWYgKHJlZnNba2V5XSA9PT0gcmVmKSB7XG4gICAgICAgIHJlZnNba2V5XSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHZub2RlLmRhdGEucmVmSW5Gb3IpIHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHJlZnNba2V5XSkpIHtcbiAgICAgICAgICByZWZzW2tleV0gPSBbcmVmXTtcbiAgICAgICAgfSBlbHNlIGlmIChyZWZzW2tleV0uaW5kZXhPZihyZWYpIDwgMCkge1xuICAgICAgICAgIC8vICRmbG93LWRpc2FibGUtbGluZVxuICAgICAgICAgIHJlZnNba2V5XS5wdXNoKHJlZik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlZnNba2V5XSA9IHJlZjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVmlydHVhbCBET00gcGF0Y2hpbmcgYWxnb3JpdGhtIGJhc2VkIG9uIFNuYWJiZG9tIGJ5XG4gICAqIFNpbW9uIEZyaWlzIFZpbmR1bSAoQHBhbGRlcGluZClcbiAgICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9wYWxkZXBpbmQvc25hYmJkb20vYmxvYi9tYXN0ZXIvTElDRU5TRVxuICAgKlxuICAgKiBtb2RpZmllZCBieSBFdmFuIFlvdSAoQHl5eDk5MDgwMylcbiAgICpcbiAgICogTm90IHR5cGUtY2hlY2tpbmcgdGhpcyBiZWNhdXNlIHRoaXMgZmlsZSBpcyBwZXJmLWNyaXRpY2FsIGFuZCB0aGUgY29zdFxuICAgKiBvZiBtYWtpbmcgZmxvdyB1bmRlcnN0YW5kIGl0IGlzIG5vdCB3b3J0aCBpdC5cbiAgICovXG5cbiAgdmFyIGVtcHR5Tm9kZSA9IG5ldyBWTm9kZSgnJywge30sIFtdKTtcblxuICB2YXIgaG9va3MgPSBbJ2NyZWF0ZScsICdhY3RpdmF0ZScsICd1cGRhdGUnLCAncmVtb3ZlJywgJ2Rlc3Ryb3knXTtcblxuICBmdW5jdGlvbiBzYW1lVm5vZGUgKGEsIGIpIHtcbiAgICByZXR1cm4gKFxuICAgICAgYS5rZXkgPT09IGIua2V5ICYmXG4gICAgICBhLmFzeW5jRmFjdG9yeSA9PT0gYi5hc3luY0ZhY3RvcnkgJiYgKFxuICAgICAgICAoXG4gICAgICAgICAgYS50YWcgPT09IGIudGFnICYmXG4gICAgICAgICAgYS5pc0NvbW1lbnQgPT09IGIuaXNDb21tZW50ICYmXG4gICAgICAgICAgaXNEZWYoYS5kYXRhKSA9PT0gaXNEZWYoYi5kYXRhKSAmJlxuICAgICAgICAgIHNhbWVJbnB1dFR5cGUoYSwgYilcbiAgICAgICAgKSB8fCAoXG4gICAgICAgICAgaXNUcnVlKGEuaXNBc3luY1BsYWNlaG9sZGVyKSAmJlxuICAgICAgICAgIGlzVW5kZWYoYi5hc3luY0ZhY3RvcnkuZXJyb3IpXG4gICAgICAgIClcbiAgICAgIClcbiAgICApXG4gIH1cblxuICBmdW5jdGlvbiBzYW1lSW5wdXRUeXBlIChhLCBiKSB7XG4gICAgaWYgKGEudGFnICE9PSAnaW5wdXQnKSB7IHJldHVybiB0cnVlIH1cbiAgICB2YXIgaTtcbiAgICB2YXIgdHlwZUEgPSBpc0RlZihpID0gYS5kYXRhKSAmJiBpc0RlZihpID0gaS5hdHRycykgJiYgaS50eXBlO1xuICAgIHZhciB0eXBlQiA9IGlzRGVmKGkgPSBiLmRhdGEpICYmIGlzRGVmKGkgPSBpLmF0dHJzKSAmJiBpLnR5cGU7XG4gICAgcmV0dXJuIHR5cGVBID09PSB0eXBlQiB8fCBpc1RleHRJbnB1dFR5cGUodHlwZUEpICYmIGlzVGV4dElucHV0VHlwZSh0eXBlQilcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUtleVRvT2xkSWR4IChjaGlsZHJlbiwgYmVnaW5JZHgsIGVuZElkeCkge1xuICAgIHZhciBpLCBrZXk7XG4gICAgdmFyIG1hcCA9IHt9O1xuICAgIGZvciAoaSA9IGJlZ2luSWR4OyBpIDw9IGVuZElkeDsgKytpKSB7XG4gICAgICBrZXkgPSBjaGlsZHJlbltpXS5rZXk7XG4gICAgICBpZiAoaXNEZWYoa2V5KSkgeyBtYXBba2V5XSA9IGk7IH1cbiAgICB9XG4gICAgcmV0dXJuIG1hcFxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlUGF0Y2hGdW5jdGlvbiAoYmFja2VuZCkge1xuICAgIHZhciBpLCBqO1xuICAgIHZhciBjYnMgPSB7fTtcblxuICAgIHZhciBtb2R1bGVzID0gYmFja2VuZC5tb2R1bGVzO1xuICAgIHZhciBub2RlT3BzID0gYmFja2VuZC5ub2RlT3BzO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGhvb2tzLmxlbmd0aDsgKytpKSB7XG4gICAgICBjYnNbaG9va3NbaV1dID0gW107XG4gICAgICBmb3IgKGogPSAwOyBqIDwgbW9kdWxlcy5sZW5ndGg7ICsraikge1xuICAgICAgICBpZiAoaXNEZWYobW9kdWxlc1tqXVtob29rc1tpXV0pKSB7XG4gICAgICAgICAgY2JzW2hvb2tzW2ldXS5wdXNoKG1vZHVsZXNbal1baG9va3NbaV1dKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVtcHR5Tm9kZUF0IChlbG0pIHtcbiAgICAgIHJldHVybiBuZXcgVk5vZGUobm9kZU9wcy50YWdOYW1lKGVsbSkudG9Mb3dlckNhc2UoKSwge30sIFtdLCB1bmRlZmluZWQsIGVsbSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVSbUNiIChjaGlsZEVsbSwgbGlzdGVuZXJzKSB7XG4gICAgICBmdW5jdGlvbiByZW1vdmUkJDEgKCkge1xuICAgICAgICBpZiAoLS1yZW1vdmUkJDEubGlzdGVuZXJzID09PSAwKSB7XG4gICAgICAgICAgcmVtb3ZlTm9kZShjaGlsZEVsbSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlbW92ZSQkMS5saXN0ZW5lcnMgPSBsaXN0ZW5lcnM7XG4gICAgICByZXR1cm4gcmVtb3ZlJCQxXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlTm9kZSAoZWwpIHtcbiAgICAgIHZhciBwYXJlbnQgPSBub2RlT3BzLnBhcmVudE5vZGUoZWwpO1xuICAgICAgLy8gZWxlbWVudCBtYXkgaGF2ZSBhbHJlYWR5IGJlZW4gcmVtb3ZlZCBkdWUgdG8gdi1odG1sIC8gdi10ZXh0XG4gICAgICBpZiAoaXNEZWYocGFyZW50KSkge1xuICAgICAgICBub2RlT3BzLnJlbW92ZUNoaWxkKHBhcmVudCwgZWwpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzVW5rbm93bkVsZW1lbnQkJDEgKHZub2RlLCBpblZQcmUpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgICFpblZQcmUgJiZcbiAgICAgICAgIXZub2RlLm5zICYmXG4gICAgICAgICEoXG4gICAgICAgICAgY29uZmlnLmlnbm9yZWRFbGVtZW50cy5sZW5ndGggJiZcbiAgICAgICAgICBjb25maWcuaWdub3JlZEVsZW1lbnRzLnNvbWUoZnVuY3Rpb24gKGlnbm9yZSkge1xuICAgICAgICAgICAgcmV0dXJuIGlzUmVnRXhwKGlnbm9yZSlcbiAgICAgICAgICAgICAgPyBpZ25vcmUudGVzdCh2bm9kZS50YWcpXG4gICAgICAgICAgICAgIDogaWdub3JlID09PSB2bm9kZS50YWdcbiAgICAgICAgICB9KVxuICAgICAgICApICYmXG4gICAgICAgIGNvbmZpZy5pc1Vua25vd25FbGVtZW50KHZub2RlLnRhZylcbiAgICAgIClcbiAgICB9XG5cbiAgICB2YXIgY3JlYXRpbmdFbG1JblZQcmUgPSAwO1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlRWxtIChcbiAgICAgIHZub2RlLFxuICAgICAgaW5zZXJ0ZWRWbm9kZVF1ZXVlLFxuICAgICAgcGFyZW50RWxtLFxuICAgICAgcmVmRWxtLFxuICAgICAgbmVzdGVkLFxuICAgICAgb3duZXJBcnJheSxcbiAgICAgIGluZGV4XG4gICAgKSB7XG4gICAgICBpZiAoaXNEZWYodm5vZGUuZWxtKSAmJiBpc0RlZihvd25lckFycmF5KSkge1xuICAgICAgICAvLyBUaGlzIHZub2RlIHdhcyB1c2VkIGluIGEgcHJldmlvdXMgcmVuZGVyIVxuICAgICAgICAvLyBub3cgaXQncyB1c2VkIGFzIGEgbmV3IG5vZGUsIG92ZXJ3cml0aW5nIGl0cyBlbG0gd291bGQgY2F1c2VcbiAgICAgICAgLy8gcG90ZW50aWFsIHBhdGNoIGVycm9ycyBkb3duIHRoZSByb2FkIHdoZW4gaXQncyB1c2VkIGFzIGFuIGluc2VydGlvblxuICAgICAgICAvLyByZWZlcmVuY2Ugbm9kZS4gSW5zdGVhZCwgd2UgY2xvbmUgdGhlIG5vZGUgb24tZGVtYW5kIGJlZm9yZSBjcmVhdGluZ1xuICAgICAgICAvLyBhc3NvY2lhdGVkIERPTSBlbGVtZW50IGZvciBpdC5cbiAgICAgICAgdm5vZGUgPSBvd25lckFycmF5W2luZGV4XSA9IGNsb25lVk5vZGUodm5vZGUpO1xuICAgICAgfVxuXG4gICAgICB2bm9kZS5pc1Jvb3RJbnNlcnQgPSAhbmVzdGVkOyAvLyBmb3IgdHJhbnNpdGlvbiBlbnRlciBjaGVja1xuICAgICAgaWYgKGNyZWF0ZUNvbXBvbmVudCh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLCBwYXJlbnRFbG0sIHJlZkVsbSkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIHZhciBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgIHZhciBjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuO1xuICAgICAgdmFyIHRhZyA9IHZub2RlLnRhZztcbiAgICAgIGlmIChpc0RlZih0YWcpKSB7XG4gICAgICAgIHtcbiAgICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLnByZSkge1xuICAgICAgICAgICAgY3JlYXRpbmdFbG1JblZQcmUrKztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlzVW5rbm93bkVsZW1lbnQkJDEodm5vZGUsIGNyZWF0aW5nRWxtSW5WUHJlKSkge1xuICAgICAgICAgICAgd2FybihcbiAgICAgICAgICAgICAgJ1Vua25vd24gY3VzdG9tIGVsZW1lbnQ6IDwnICsgdGFnICsgJz4gLSBkaWQgeW91ICcgK1xuICAgICAgICAgICAgICAncmVnaXN0ZXIgdGhlIGNvbXBvbmVudCBjb3JyZWN0bHk/IEZvciByZWN1cnNpdmUgY29tcG9uZW50cywgJyArXG4gICAgICAgICAgICAgICdtYWtlIHN1cmUgdG8gcHJvdmlkZSB0aGUgXCJuYW1lXCIgb3B0aW9uLicsXG4gICAgICAgICAgICAgIHZub2RlLmNvbnRleHRcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdm5vZGUuZWxtID0gdm5vZGUubnNcbiAgICAgICAgICA/IG5vZGVPcHMuY3JlYXRlRWxlbWVudE5TKHZub2RlLm5zLCB0YWcpXG4gICAgICAgICAgOiBub2RlT3BzLmNyZWF0ZUVsZW1lbnQodGFnLCB2bm9kZSk7XG4gICAgICAgIHNldFNjb3BlKHZub2RlKTtcblxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAge1xuICAgICAgICAgIGNyZWF0ZUNoaWxkcmVuKHZub2RlLCBjaGlsZHJlbiwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICBpZiAoaXNEZWYoZGF0YSkpIHtcbiAgICAgICAgICAgIGludm9rZUNyZWF0ZUhvb2tzKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpbnNlcnQocGFyZW50RWxtLCB2bm9kZS5lbG0sIHJlZkVsbSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLnByZSkge1xuICAgICAgICAgIGNyZWF0aW5nRWxtSW5WUHJlLS07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaXNUcnVlKHZub2RlLmlzQ29tbWVudCkpIHtcbiAgICAgICAgdm5vZGUuZWxtID0gbm9kZU9wcy5jcmVhdGVDb21tZW50KHZub2RlLnRleHQpO1xuICAgICAgICBpbnNlcnQocGFyZW50RWxtLCB2bm9kZS5lbG0sIHJlZkVsbSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2bm9kZS5lbG0gPSBub2RlT3BzLmNyZWF0ZVRleHROb2RlKHZub2RlLnRleHQpO1xuICAgICAgICBpbnNlcnQocGFyZW50RWxtLCB2bm9kZS5lbG0sIHJlZkVsbSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50ICh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLCBwYXJlbnRFbG0sIHJlZkVsbSkge1xuICAgICAgdmFyIGkgPSB2bm9kZS5kYXRhO1xuICAgICAgaWYgKGlzRGVmKGkpKSB7XG4gICAgICAgIHZhciBpc1JlYWN0aXZhdGVkID0gaXNEZWYodm5vZGUuY29tcG9uZW50SW5zdGFuY2UpICYmIGkua2VlcEFsaXZlO1xuICAgICAgICBpZiAoaXNEZWYoaSA9IGkuaG9vaykgJiYgaXNEZWYoaSA9IGkuaW5pdCkpIHtcbiAgICAgICAgICBpKHZub2RlLCBmYWxzZSAvKiBoeWRyYXRpbmcgKi8pO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFmdGVyIGNhbGxpbmcgdGhlIGluaXQgaG9vaywgaWYgdGhlIHZub2RlIGlzIGEgY2hpbGQgY29tcG9uZW50XG4gICAgICAgIC8vIGl0IHNob3VsZCd2ZSBjcmVhdGVkIGEgY2hpbGQgaW5zdGFuY2UgYW5kIG1vdW50ZWQgaXQuIHRoZSBjaGlsZFxuICAgICAgICAvLyBjb21wb25lbnQgYWxzbyBoYXMgc2V0IHRoZSBwbGFjZWhvbGRlciB2bm9kZSdzIGVsbS5cbiAgICAgICAgLy8gaW4gdGhhdCBjYXNlIHdlIGNhbiBqdXN0IHJldHVybiB0aGUgZWxlbWVudCBhbmQgYmUgZG9uZS5cbiAgICAgICAgaWYgKGlzRGVmKHZub2RlLmNvbXBvbmVudEluc3RhbmNlKSkge1xuICAgICAgICAgIGluaXRDb21wb25lbnQodm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgaW5zZXJ0KHBhcmVudEVsbSwgdm5vZGUuZWxtLCByZWZFbG0pO1xuICAgICAgICAgIGlmIChpc1RydWUoaXNSZWFjdGl2YXRlZCkpIHtcbiAgICAgICAgICAgIHJlYWN0aXZhdGVDb21wb25lbnQodm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSwgcGFyZW50RWxtLCByZWZFbG0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdENvbXBvbmVudCAodm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgaWYgKGlzRGVmKHZub2RlLmRhdGEucGVuZGluZ0luc2VydCkpIHtcbiAgICAgICAgaW5zZXJ0ZWRWbm9kZVF1ZXVlLnB1c2guYXBwbHkoaW5zZXJ0ZWRWbm9kZVF1ZXVlLCB2bm9kZS5kYXRhLnBlbmRpbmdJbnNlcnQpO1xuICAgICAgICB2bm9kZS5kYXRhLnBlbmRpbmdJbnNlcnQgPSBudWxsO1xuICAgICAgfVxuICAgICAgdm5vZGUuZWxtID0gdm5vZGUuY29tcG9uZW50SW5zdGFuY2UuJGVsO1xuICAgICAgaWYgKGlzUGF0Y2hhYmxlKHZub2RlKSkge1xuICAgICAgICBpbnZva2VDcmVhdGVIb29rcyh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgc2V0U2NvcGUodm5vZGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZW1wdHkgY29tcG9uZW50IHJvb3QuXG4gICAgICAgIC8vIHNraXAgYWxsIGVsZW1lbnQtcmVsYXRlZCBtb2R1bGVzIGV4Y2VwdCBmb3IgcmVmICgjMzQ1NSlcbiAgICAgICAgcmVnaXN0ZXJSZWYodm5vZGUpO1xuICAgICAgICAvLyBtYWtlIHN1cmUgdG8gaW52b2tlIHRoZSBpbnNlcnQgaG9va1xuICAgICAgICBpbnNlcnRlZFZub2RlUXVldWUucHVzaCh2bm9kZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhY3RpdmF0ZUNvbXBvbmVudCAodm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSwgcGFyZW50RWxtLCByZWZFbG0pIHtcbiAgICAgIHZhciBpO1xuICAgICAgLy8gaGFjayBmb3IgIzQzMzk6IGEgcmVhY3RpdmF0ZWQgY29tcG9uZW50IHdpdGggaW5uZXIgdHJhbnNpdGlvblxuICAgICAgLy8gZG9lcyBub3QgdHJpZ2dlciBiZWNhdXNlIHRoZSBpbm5lciBub2RlJ3MgY3JlYXRlZCBob29rcyBhcmUgbm90IGNhbGxlZFxuICAgICAgLy8gYWdhaW4uIEl0J3Mgbm90IGlkZWFsIHRvIGludm9sdmUgbW9kdWxlLXNwZWNpZmljIGxvZ2ljIGluIGhlcmUgYnV0XG4gICAgICAvLyB0aGVyZSBkb2Vzbid0IHNlZW0gdG8gYmUgYSBiZXR0ZXIgd2F5IHRvIGRvIGl0LlxuICAgICAgdmFyIGlubmVyTm9kZSA9IHZub2RlO1xuICAgICAgd2hpbGUgKGlubmVyTm9kZS5jb21wb25lbnRJbnN0YW5jZSkge1xuICAgICAgICBpbm5lck5vZGUgPSBpbm5lck5vZGUuY29tcG9uZW50SW5zdGFuY2UuX3Zub2RlO1xuICAgICAgICBpZiAoaXNEZWYoaSA9IGlubmVyTm9kZS5kYXRhKSAmJiBpc0RlZihpID0gaS50cmFuc2l0aW9uKSkge1xuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMuYWN0aXZhdGUubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGNicy5hY3RpdmF0ZVtpXShlbXB0eU5vZGUsIGlubmVyTm9kZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGluc2VydGVkVm5vZGVRdWV1ZS5wdXNoKGlubmVyTm9kZSk7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gdW5saWtlIGEgbmV3bHkgY3JlYXRlZCBjb21wb25lbnQsXG4gICAgICAvLyBhIHJlYWN0aXZhdGVkIGtlZXAtYWxpdmUgY29tcG9uZW50IGRvZXNuJ3QgaW5zZXJ0IGl0c2VsZlxuICAgICAgaW5zZXJ0KHBhcmVudEVsbSwgdm5vZGUuZWxtLCByZWZFbG0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc2VydCAocGFyZW50LCBlbG0sIHJlZiQkMSkge1xuICAgICAgaWYgKGlzRGVmKHBhcmVudCkpIHtcbiAgICAgICAgaWYgKGlzRGVmKHJlZiQkMSkpIHtcbiAgICAgICAgICBpZiAobm9kZU9wcy5wYXJlbnROb2RlKHJlZiQkMSkgPT09IHBhcmVudCkge1xuICAgICAgICAgICAgbm9kZU9wcy5pbnNlcnRCZWZvcmUocGFyZW50LCBlbG0sIHJlZiQkMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5vZGVPcHMuYXBwZW5kQ2hpbGQocGFyZW50LCBlbG0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlQ2hpbGRyZW4gKHZub2RlLCBjaGlsZHJlbiwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShjaGlsZHJlbikpIHtcbiAgICAgICAge1xuICAgICAgICAgIGNoZWNrRHVwbGljYXRlS2V5cyhjaGlsZHJlbik7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIGNyZWF0ZUVsbShjaGlsZHJlbltpXSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLCB2bm9kZS5lbG0sIG51bGwsIHRydWUsIGNoaWxkcmVuLCBpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpc1ByaW1pdGl2ZSh2bm9kZS50ZXh0KSkge1xuICAgICAgICBub2RlT3BzLmFwcGVuZENoaWxkKHZub2RlLmVsbSwgbm9kZU9wcy5jcmVhdGVUZXh0Tm9kZShTdHJpbmcodm5vZGUudGV4dCkpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc1BhdGNoYWJsZSAodm5vZGUpIHtcbiAgICAgIHdoaWxlICh2bm9kZS5jb21wb25lbnRJbnN0YW5jZSkge1xuICAgICAgICB2bm9kZSA9IHZub2RlLmNvbXBvbmVudEluc3RhbmNlLl92bm9kZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpc0RlZih2bm9kZS50YWcpXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW52b2tlQ3JlYXRlSG9va3MgKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICAgIGZvciAodmFyIGkkMSA9IDA7IGkkMSA8IGNicy5jcmVhdGUubGVuZ3RoOyArK2kkMSkge1xuICAgICAgICBjYnMuY3JlYXRlW2kkMV0oZW1wdHlOb2RlLCB2bm9kZSk7XG4gICAgICB9XG4gICAgICBpID0gdm5vZGUuZGF0YS5ob29rOyAvLyBSZXVzZSB2YXJpYWJsZVxuICAgICAgaWYgKGlzRGVmKGkpKSB7XG4gICAgICAgIGlmIChpc0RlZihpLmNyZWF0ZSkpIHsgaS5jcmVhdGUoZW1wdHlOb2RlLCB2bm9kZSk7IH1cbiAgICAgICAgaWYgKGlzRGVmKGkuaW5zZXJ0KSkgeyBpbnNlcnRlZFZub2RlUXVldWUucHVzaCh2bm9kZSk7IH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBzZXQgc2NvcGUgaWQgYXR0cmlidXRlIGZvciBzY29wZWQgQ1NTLlxuICAgIC8vIHRoaXMgaXMgaW1wbGVtZW50ZWQgYXMgYSBzcGVjaWFsIGNhc2UgdG8gYXZvaWQgdGhlIG92ZXJoZWFkXG4gICAgLy8gb2YgZ29pbmcgdGhyb3VnaCB0aGUgbm9ybWFsIGF0dHJpYnV0ZSBwYXRjaGluZyBwcm9jZXNzLlxuICAgIGZ1bmN0aW9uIHNldFNjb3BlICh2bm9kZSkge1xuICAgICAgdmFyIGk7XG4gICAgICBpZiAoaXNEZWYoaSA9IHZub2RlLmZuU2NvcGVJZCkpIHtcbiAgICAgICAgbm9kZU9wcy5zZXRTdHlsZVNjb3BlKHZub2RlLmVsbSwgaSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgYW5jZXN0b3IgPSB2bm9kZTtcbiAgICAgICAgd2hpbGUgKGFuY2VzdG9yKSB7XG4gICAgICAgICAgaWYgKGlzRGVmKGkgPSBhbmNlc3Rvci5jb250ZXh0KSAmJiBpc0RlZihpID0gaS4kb3B0aW9ucy5fc2NvcGVJZCkpIHtcbiAgICAgICAgICAgIG5vZGVPcHMuc2V0U3R5bGVTY29wZSh2bm9kZS5lbG0sIGkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhbmNlc3RvciA9IGFuY2VzdG9yLnBhcmVudDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gZm9yIHNsb3QgY29udGVudCB0aGV5IHNob3VsZCBhbHNvIGdldCB0aGUgc2NvcGVJZCBmcm9tIHRoZSBob3N0IGluc3RhbmNlLlxuICAgICAgaWYgKGlzRGVmKGkgPSBhY3RpdmVJbnN0YW5jZSkgJiZcbiAgICAgICAgaSAhPT0gdm5vZGUuY29udGV4dCAmJlxuICAgICAgICBpICE9PSB2bm9kZS5mbkNvbnRleHQgJiZcbiAgICAgICAgaXNEZWYoaSA9IGkuJG9wdGlvbnMuX3Njb3BlSWQpXG4gICAgICApIHtcbiAgICAgICAgbm9kZU9wcy5zZXRTdHlsZVNjb3BlKHZub2RlLmVsbSwgaSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkVm5vZGVzIChwYXJlbnRFbG0sIHJlZkVsbSwgdm5vZGVzLCBzdGFydElkeCwgZW5kSWR4LCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgICAgY3JlYXRlRWxtKHZub2Rlc1tzdGFydElkeF0sIGluc2VydGVkVm5vZGVRdWV1ZSwgcGFyZW50RWxtLCByZWZFbG0sIGZhbHNlLCB2bm9kZXMsIHN0YXJ0SWR4KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnZva2VEZXN0cm95SG9vayAodm5vZGUpIHtcbiAgICAgIHZhciBpLCBqO1xuICAgICAgdmFyIGRhdGEgPSB2bm9kZS5kYXRhO1xuICAgICAgaWYgKGlzRGVmKGRhdGEpKSB7XG4gICAgICAgIGlmIChpc0RlZihpID0gZGF0YS5ob29rKSAmJiBpc0RlZihpID0gaS5kZXN0cm95KSkgeyBpKHZub2RlKTsgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmRlc3Ryb3kubGVuZ3RoOyArK2kpIHsgY2JzLmRlc3Ryb3lbaV0odm5vZGUpOyB9XG4gICAgICB9XG4gICAgICBpZiAoaXNEZWYoaSA9IHZub2RlLmNoaWxkcmVuKSkge1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgdm5vZGUuY2hpbGRyZW4ubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICBpbnZva2VEZXN0cm95SG9vayh2bm9kZS5jaGlsZHJlbltqXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW1vdmVWbm9kZXMgKHZub2Rlcywgc3RhcnRJZHgsIGVuZElkeCkge1xuICAgICAgZm9yICg7IHN0YXJ0SWR4IDw9IGVuZElkeDsgKytzdGFydElkeCkge1xuICAgICAgICB2YXIgY2ggPSB2bm9kZXNbc3RhcnRJZHhdO1xuICAgICAgICBpZiAoaXNEZWYoY2gpKSB7XG4gICAgICAgICAgaWYgKGlzRGVmKGNoLnRhZykpIHtcbiAgICAgICAgICAgIHJlbW92ZUFuZEludm9rZVJlbW92ZUhvb2soY2gpO1xuICAgICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soY2gpO1xuICAgICAgICAgIH0gZWxzZSB7IC8vIFRleHQgbm9kZVxuICAgICAgICAgICAgcmVtb3ZlTm9kZShjaC5lbG0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbW92ZUFuZEludm9rZVJlbW92ZUhvb2sgKHZub2RlLCBybSkge1xuICAgICAgaWYgKGlzRGVmKHJtKSB8fCBpc0RlZih2bm9kZS5kYXRhKSkge1xuICAgICAgICB2YXIgaTtcbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IGNicy5yZW1vdmUubGVuZ3RoICsgMTtcbiAgICAgICAgaWYgKGlzRGVmKHJtKSkge1xuICAgICAgICAgIC8vIHdlIGhhdmUgYSByZWN1cnNpdmVseSBwYXNzZWQgZG93biBybSBjYWxsYmFja1xuICAgICAgICAgIC8vIGluY3JlYXNlIHRoZSBsaXN0ZW5lcnMgY291bnRcbiAgICAgICAgICBybS5saXN0ZW5lcnMgKz0gbGlzdGVuZXJzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGRpcmVjdGx5IHJlbW92aW5nXG4gICAgICAgICAgcm0gPSBjcmVhdGVSbUNiKHZub2RlLmVsbSwgbGlzdGVuZXJzKTtcbiAgICAgICAgfVxuICAgICAgICAvLyByZWN1cnNpdmVseSBpbnZva2UgaG9va3Mgb24gY2hpbGQgY29tcG9uZW50IHJvb3Qgbm9kZVxuICAgICAgICBpZiAoaXNEZWYoaSA9IHZub2RlLmNvbXBvbmVudEluc3RhbmNlKSAmJiBpc0RlZihpID0gaS5fdm5vZGUpICYmIGlzRGVmKGkuZGF0YSkpIHtcbiAgICAgICAgICByZW1vdmVBbmRJbnZva2VSZW1vdmVIb29rKGksIHJtKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnJlbW92ZS5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIGNicy5yZW1vdmVbaV0odm5vZGUsIHJtKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNEZWYoaSA9IHZub2RlLmRhdGEuaG9vaykgJiYgaXNEZWYoaSA9IGkucmVtb3ZlKSkge1xuICAgICAgICAgIGkodm5vZGUsIHJtKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBybSgpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZW1vdmVOb2RlKHZub2RlLmVsbSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlQ2hpbGRyZW4gKHBhcmVudEVsbSwgb2xkQ2gsIG5ld0NoLCBpbnNlcnRlZFZub2RlUXVldWUsIHJlbW92ZU9ubHkpIHtcbiAgICAgIHZhciBvbGRTdGFydElkeCA9IDA7XG4gICAgICB2YXIgbmV3U3RhcnRJZHggPSAwO1xuICAgICAgdmFyIG9sZEVuZElkeCA9IG9sZENoLmxlbmd0aCAtIDE7XG4gICAgICB2YXIgb2xkU3RhcnRWbm9kZSA9IG9sZENoWzBdO1xuICAgICAgdmFyIG9sZEVuZFZub2RlID0gb2xkQ2hbb2xkRW5kSWR4XTtcbiAgICAgIHZhciBuZXdFbmRJZHggPSBuZXdDaC5sZW5ndGggLSAxO1xuICAgICAgdmFyIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFswXTtcbiAgICAgIHZhciBuZXdFbmRWbm9kZSA9IG5ld0NoW25ld0VuZElkeF07XG4gICAgICB2YXIgb2xkS2V5VG9JZHgsIGlkeEluT2xkLCB2bm9kZVRvTW92ZSwgcmVmRWxtO1xuXG4gICAgICAvLyByZW1vdmVPbmx5IGlzIGEgc3BlY2lhbCBmbGFnIHVzZWQgb25seSBieSA8dHJhbnNpdGlvbi1ncm91cD5cbiAgICAgIC8vIHRvIGVuc3VyZSByZW1vdmVkIGVsZW1lbnRzIHN0YXkgaW4gY29ycmVjdCByZWxhdGl2ZSBwb3NpdGlvbnNcbiAgICAgIC8vIGR1cmluZyBsZWF2aW5nIHRyYW5zaXRpb25zXG4gICAgICB2YXIgY2FuTW92ZSA9ICFyZW1vdmVPbmx5O1xuXG4gICAgICB7XG4gICAgICAgIGNoZWNrRHVwbGljYXRlS2V5cyhuZXdDaCk7XG4gICAgICB9XG5cbiAgICAgIHdoaWxlIChvbGRTdGFydElkeCA8PSBvbGRFbmRJZHggJiYgbmV3U3RhcnRJZHggPD0gbmV3RW5kSWR4KSB7XG4gICAgICAgIGlmIChpc1VuZGVmKG9sZFN0YXJ0Vm5vZGUpKSB7XG4gICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdOyAvLyBWbm9kZSBoYXMgYmVlbiBtb3ZlZCBsZWZ0XG4gICAgICAgIH0gZWxzZSBpZiAoaXNVbmRlZihvbGRFbmRWbm9kZSkpIHtcbiAgICAgICAgICBvbGRFbmRWbm9kZSA9IG9sZENoWy0tb2xkRW5kSWR4XTtcbiAgICAgICAgfSBlbHNlIGlmIChzYW1lVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3U3RhcnRWbm9kZSkpIHtcbiAgICAgICAgICBwYXRjaFZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSwgbmV3Q2gsIG5ld1N0YXJ0SWR4KTtcbiAgICAgICAgICBvbGRTdGFydFZub2RlID0gb2xkQ2hbKytvbGRTdGFydElkeF07XG4gICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICB9IGVsc2UgaWYgKHNhbWVWbm9kZShvbGRFbmRWbm9kZSwgbmV3RW5kVm5vZGUpKSB7XG4gICAgICAgICAgcGF0Y2hWbm9kZShvbGRFbmRWbm9kZSwgbmV3RW5kVm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSwgbmV3Q2gsIG5ld0VuZElkeCk7XG4gICAgICAgICAgb2xkRW5kVm5vZGUgPSBvbGRDaFstLW9sZEVuZElkeF07XG4gICAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICAgIH0gZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld0VuZFZub2RlKSkgeyAvLyBWbm9kZSBtb3ZlZCByaWdodFxuICAgICAgICAgIHBhdGNoVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3RW5kVm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSwgbmV3Q2gsIG5ld0VuZElkeCk7XG4gICAgICAgICAgY2FuTW92ZSAmJiBub2RlT3BzLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtLCBub2RlT3BzLm5leHRTaWJsaW5nKG9sZEVuZFZub2RlLmVsbSkpO1xuICAgICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTtcbiAgICAgICAgICBuZXdFbmRWbm9kZSA9IG5ld0NoWy0tbmV3RW5kSWR4XTtcbiAgICAgICAgfSBlbHNlIGlmIChzYW1lVm5vZGUob2xkRW5kVm5vZGUsIG5ld1N0YXJ0Vm5vZGUpKSB7IC8vIFZub2RlIG1vdmVkIGxlZnRcbiAgICAgICAgICBwYXRjaFZub2RlKG9sZEVuZFZub2RlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUsIG5ld0NoLCBuZXdTdGFydElkeCk7XG4gICAgICAgICAgY2FuTW92ZSAmJiBub2RlT3BzLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZEVuZFZub2RlLmVsbSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoaXNVbmRlZihvbGRLZXlUb0lkeCkpIHsgb2xkS2V5VG9JZHggPSBjcmVhdGVLZXlUb09sZElkeChvbGRDaCwgb2xkU3RhcnRJZHgsIG9sZEVuZElkeCk7IH1cbiAgICAgICAgICBpZHhJbk9sZCA9IGlzRGVmKG5ld1N0YXJ0Vm5vZGUua2V5KVxuICAgICAgICAgICAgPyBvbGRLZXlUb0lkeFtuZXdTdGFydFZub2RlLmtleV1cbiAgICAgICAgICAgIDogZmluZElkeEluT2xkKG5ld1N0YXJ0Vm5vZGUsIG9sZENoLCBvbGRTdGFydElkeCwgb2xkRW5kSWR4KTtcbiAgICAgICAgICBpZiAoaXNVbmRlZihpZHhJbk9sZCkpIHsgLy8gTmV3IGVsZW1lbnRcbiAgICAgICAgICAgIGNyZWF0ZUVsbShuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUsIHBhcmVudEVsbSwgb2xkU3RhcnRWbm9kZS5lbG0sIGZhbHNlLCBuZXdDaCwgbmV3U3RhcnRJZHgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2bm9kZVRvTW92ZSA9IG9sZENoW2lkeEluT2xkXTtcbiAgICAgICAgICAgIGlmIChzYW1lVm5vZGUodm5vZGVUb01vdmUsIG5ld1N0YXJ0Vm5vZGUpKSB7XG4gICAgICAgICAgICAgIHBhdGNoVm5vZGUodm5vZGVUb01vdmUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSwgbmV3Q2gsIG5ld1N0YXJ0SWR4KTtcbiAgICAgICAgICAgICAgb2xkQ2hbaWR4SW5PbGRdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICBjYW5Nb3ZlICYmIG5vZGVPcHMuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgdm5vZGVUb01vdmUuZWxtLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBzYW1lIGtleSBidXQgZGlmZmVyZW50IGVsZW1lbnQuIHRyZWF0IGFzIG5ldyBlbGVtZW50XG4gICAgICAgICAgICAgIGNyZWF0ZUVsbShuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUsIHBhcmVudEVsbSwgb2xkU3RhcnRWbm9kZS5lbG0sIGZhbHNlLCBuZXdDaCwgbmV3U3RhcnRJZHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChvbGRTdGFydElkeCA+IG9sZEVuZElkeCkge1xuICAgICAgICByZWZFbG0gPSBpc1VuZGVmKG5ld0NoW25ld0VuZElkeCArIDFdKSA/IG51bGwgOiBuZXdDaFtuZXdFbmRJZHggKyAxXS5lbG07XG4gICAgICAgIGFkZFZub2RlcyhwYXJlbnRFbG0sIHJlZkVsbSwgbmV3Q2gsIG5ld1N0YXJ0SWR4LCBuZXdFbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICB9IGVsc2UgaWYgKG5ld1N0YXJ0SWR4ID4gbmV3RW5kSWR4KSB7XG4gICAgICAgIHJlbW92ZVZub2RlcyhvbGRDaCwgb2xkU3RhcnRJZHgsIG9sZEVuZElkeCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2hlY2tEdXBsaWNhdGVLZXlzIChjaGlsZHJlbikge1xuICAgICAgdmFyIHNlZW5LZXlzID0ge307XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB2bm9kZSA9IGNoaWxkcmVuW2ldO1xuICAgICAgICB2YXIga2V5ID0gdm5vZGUua2V5O1xuICAgICAgICBpZiAoaXNEZWYoa2V5KSkge1xuICAgICAgICAgIGlmIChzZWVuS2V5c1trZXldKSB7XG4gICAgICAgICAgICB3YXJuKFxuICAgICAgICAgICAgICAoXCJEdXBsaWNhdGUga2V5cyBkZXRlY3RlZDogJ1wiICsga2V5ICsgXCInLiBUaGlzIG1heSBjYXVzZSBhbiB1cGRhdGUgZXJyb3IuXCIpLFxuICAgICAgICAgICAgICB2bm9kZS5jb250ZXh0XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWVuS2V5c1trZXldID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmaW5kSWR4SW5PbGQgKG5vZGUsIG9sZENoLCBzdGFydCwgZW5kKSB7XG4gICAgICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgICB2YXIgYyA9IG9sZENoW2ldO1xuICAgICAgICBpZiAoaXNEZWYoYykgJiYgc2FtZVZub2RlKG5vZGUsIGMpKSB7IHJldHVybiBpIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXRjaFZub2RlIChcbiAgICAgIG9sZFZub2RlLFxuICAgICAgdm5vZGUsXG4gICAgICBpbnNlcnRlZFZub2RlUXVldWUsXG4gICAgICBvd25lckFycmF5LFxuICAgICAgaW5kZXgsXG4gICAgICByZW1vdmVPbmx5XG4gICAgKSB7XG4gICAgICBpZiAob2xkVm5vZGUgPT09IHZub2RlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAoaXNEZWYodm5vZGUuZWxtKSAmJiBpc0RlZihvd25lckFycmF5KSkge1xuICAgICAgICAvLyBjbG9uZSByZXVzZWQgdm5vZGVcbiAgICAgICAgdm5vZGUgPSBvd25lckFycmF5W2luZGV4XSA9IGNsb25lVk5vZGUodm5vZGUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgZWxtID0gdm5vZGUuZWxtID0gb2xkVm5vZGUuZWxtO1xuXG4gICAgICBpZiAoaXNUcnVlKG9sZFZub2RlLmlzQXN5bmNQbGFjZWhvbGRlcikpIHtcbiAgICAgICAgaWYgKGlzRGVmKHZub2RlLmFzeW5jRmFjdG9yeS5yZXNvbHZlZCkpIHtcbiAgICAgICAgICBoeWRyYXRlKG9sZFZub2RlLmVsbSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdm5vZGUuaXNBc3luY1BsYWNlaG9sZGVyID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgLy8gcmV1c2UgZWxlbWVudCBmb3Igc3RhdGljIHRyZWVzLlxuICAgICAgLy8gbm90ZSB3ZSBvbmx5IGRvIHRoaXMgaWYgdGhlIHZub2RlIGlzIGNsb25lZCAtXG4gICAgICAvLyBpZiB0aGUgbmV3IG5vZGUgaXMgbm90IGNsb25lZCBpdCBtZWFucyB0aGUgcmVuZGVyIGZ1bmN0aW9ucyBoYXZlIGJlZW5cbiAgICAgIC8vIHJlc2V0IGJ5IHRoZSBob3QtcmVsb2FkLWFwaSBhbmQgd2UgbmVlZCB0byBkbyBhIHByb3BlciByZS1yZW5kZXIuXG4gICAgICBpZiAoaXNUcnVlKHZub2RlLmlzU3RhdGljKSAmJlxuICAgICAgICBpc1RydWUob2xkVm5vZGUuaXNTdGF0aWMpICYmXG4gICAgICAgIHZub2RlLmtleSA9PT0gb2xkVm5vZGUua2V5ICYmXG4gICAgICAgIChpc1RydWUodm5vZGUuaXNDbG9uZWQpIHx8IGlzVHJ1ZSh2bm9kZS5pc09uY2UpKVxuICAgICAgKSB7XG4gICAgICAgIHZub2RlLmNvbXBvbmVudEluc3RhbmNlID0gb2xkVm5vZGUuY29tcG9uZW50SW5zdGFuY2U7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICB2YXIgaTtcbiAgICAgIHZhciBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgIGlmIChpc0RlZihkYXRhKSAmJiBpc0RlZihpID0gZGF0YS5ob29rKSAmJiBpc0RlZihpID0gaS5wcmVwYXRjaCkpIHtcbiAgICAgICAgaShvbGRWbm9kZSwgdm5vZGUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgb2xkQ2ggPSBvbGRWbm9kZS5jaGlsZHJlbjtcbiAgICAgIHZhciBjaCA9IHZub2RlLmNoaWxkcmVuO1xuICAgICAgaWYgKGlzRGVmKGRhdGEpICYmIGlzUGF0Y2hhYmxlKHZub2RlKSkge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnVwZGF0ZS5sZW5ndGg7ICsraSkgeyBjYnMudXBkYXRlW2ldKG9sZFZub2RlLCB2bm9kZSk7IH1cbiAgICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLnVwZGF0ZSkpIHsgaShvbGRWbm9kZSwgdm5vZGUpOyB9XG4gICAgICB9XG4gICAgICBpZiAoaXNVbmRlZih2bm9kZS50ZXh0KSkge1xuICAgICAgICBpZiAoaXNEZWYob2xkQ2gpICYmIGlzRGVmKGNoKSkge1xuICAgICAgICAgIGlmIChvbGRDaCAhPT0gY2gpIHsgdXBkYXRlQ2hpbGRyZW4oZWxtLCBvbGRDaCwgY2gsIGluc2VydGVkVm5vZGVRdWV1ZSwgcmVtb3ZlT25seSk7IH1cbiAgICAgICAgfSBlbHNlIGlmIChpc0RlZihjaCkpIHtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjaGVja0R1cGxpY2F0ZUtleXMoY2gpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpIHsgbm9kZU9wcy5zZXRUZXh0Q29udGVudChlbG0sICcnKTsgfVxuICAgICAgICAgIGFkZFZub2RlcyhlbG0sIG51bGwsIGNoLCAwLCBjaC5sZW5ndGggLSAxLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzRGVmKG9sZENoKSkge1xuICAgICAgICAgIHJlbW92ZVZub2RlcyhvbGRDaCwgMCwgb2xkQ2gubGVuZ3RoIC0gMSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpIHtcbiAgICAgICAgICBub2RlT3BzLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKG9sZFZub2RlLnRleHQgIT09IHZub2RlLnRleHQpIHtcbiAgICAgICAgbm9kZU9wcy5zZXRUZXh0Q29udGVudChlbG0sIHZub2RlLnRleHQpO1xuICAgICAgfVxuICAgICAgaWYgKGlzRGVmKGRhdGEpKSB7XG4gICAgICAgIGlmIChpc0RlZihpID0gZGF0YS5ob29rKSAmJiBpc0RlZihpID0gaS5wb3N0cGF0Y2gpKSB7IGkob2xkVm5vZGUsIHZub2RlKTsgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGludm9rZUluc2VydEhvb2sgKHZub2RlLCBxdWV1ZSwgaW5pdGlhbCkge1xuICAgICAgLy8gZGVsYXkgaW5zZXJ0IGhvb2tzIGZvciBjb21wb25lbnQgcm9vdCBub2RlcywgaW52b2tlIHRoZW0gYWZ0ZXIgdGhlXG4gICAgICAvLyBlbGVtZW50IGlzIHJlYWxseSBpbnNlcnRlZFxuICAgICAgaWYgKGlzVHJ1ZShpbml0aWFsKSAmJiBpc0RlZih2bm9kZS5wYXJlbnQpKSB7XG4gICAgICAgIHZub2RlLnBhcmVudC5kYXRhLnBlbmRpbmdJbnNlcnQgPSBxdWV1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcXVldWUubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICBxdWV1ZVtpXS5kYXRhLmhvb2suaW5zZXJ0KHF1ZXVlW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBoeWRyYXRpb25CYWlsZWQgPSBmYWxzZTtcbiAgICAvLyBsaXN0IG9mIG1vZHVsZXMgdGhhdCBjYW4gc2tpcCBjcmVhdGUgaG9vayBkdXJpbmcgaHlkcmF0aW9uIGJlY2F1c2UgdGhleVxuICAgIC8vIGFyZSBhbHJlYWR5IHJlbmRlcmVkIG9uIHRoZSBjbGllbnQgb3IgaGFzIG5vIG5lZWQgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgLy8gTm90ZTogc3R5bGUgaXMgZXhjbHVkZWQgYmVjYXVzZSBpdCByZWxpZXMgb24gaW5pdGlhbCBjbG9uZSBmb3IgZnV0dXJlXG4gICAgLy8gZGVlcCB1cGRhdGVzICgjNzA2MykuXG4gICAgdmFyIGlzUmVuZGVyZWRNb2R1bGUgPSBtYWtlTWFwKCdhdHRycyxjbGFzcyxzdGF0aWNDbGFzcyxzdGF0aWNTdHlsZSxrZXknKTtcblxuICAgIC8vIE5vdGU6IHRoaXMgaXMgYSBicm93c2VyLW9ubHkgZnVuY3Rpb24gc28gd2UgY2FuIGFzc3VtZSBlbG1zIGFyZSBET00gbm9kZXMuXG4gICAgZnVuY3Rpb24gaHlkcmF0ZSAoZWxtLCB2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLCBpblZQcmUpIHtcbiAgICAgIHZhciBpO1xuICAgICAgdmFyIHRhZyA9IHZub2RlLnRhZztcbiAgICAgIHZhciBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgIHZhciBjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuO1xuICAgICAgaW5WUHJlID0gaW5WUHJlIHx8IChkYXRhICYmIGRhdGEucHJlKTtcbiAgICAgIHZub2RlLmVsbSA9IGVsbTtcblxuICAgICAgaWYgKGlzVHJ1ZSh2bm9kZS5pc0NvbW1lbnQpICYmIGlzRGVmKHZub2RlLmFzeW5jRmFjdG9yeSkpIHtcbiAgICAgICAgdm5vZGUuaXNBc3luY1BsYWNlaG9sZGVyID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIC8vIGFzc2VydCBub2RlIG1hdGNoXG4gICAgICB7XG4gICAgICAgIGlmICghYXNzZXJ0Tm9kZU1hdGNoKGVsbSwgdm5vZGUsIGluVlByZSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGlzRGVmKGRhdGEpKSB7XG4gICAgICAgIGlmIChpc0RlZihpID0gZGF0YS5ob29rKSAmJiBpc0RlZihpID0gaS5pbml0KSkgeyBpKHZub2RlLCB0cnVlIC8qIGh5ZHJhdGluZyAqLyk7IH1cbiAgICAgICAgaWYgKGlzRGVmKGkgPSB2bm9kZS5jb21wb25lbnRJbnN0YW5jZSkpIHtcbiAgICAgICAgICAvLyBjaGlsZCBjb21wb25lbnQuIGl0IHNob3VsZCBoYXZlIGh5ZHJhdGVkIGl0cyBvd24gdHJlZS5cbiAgICAgICAgICBpbml0Q29tcG9uZW50KHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpc0RlZih0YWcpKSB7XG4gICAgICAgIGlmIChpc0RlZihjaGlsZHJlbikpIHtcbiAgICAgICAgICAvLyBlbXB0eSBlbGVtZW50LCBhbGxvdyBjbGllbnQgdG8gcGljayB1cCBhbmQgcG9wdWxhdGUgY2hpbGRyZW5cbiAgICAgICAgICBpZiAoIWVsbS5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgICAgICAgIGNyZWF0ZUNoaWxkcmVuKHZub2RlLCBjaGlsZHJlbiwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gdi1odG1sIGFuZCBkb21Qcm9wczogaW5uZXJIVE1MXG4gICAgICAgICAgICBpZiAoaXNEZWYoaSA9IGRhdGEpICYmIGlzRGVmKGkgPSBpLmRvbVByb3BzKSAmJiBpc0RlZihpID0gaS5pbm5lckhUTUwpKSB7XG4gICAgICAgICAgICAgIGlmIChpICE9PSBlbG0uaW5uZXJIVE1MKSB7XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAgICAgICAgICAgIWh5ZHJhdGlvbkJhaWxlZFxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgaHlkcmF0aW9uQmFpbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignUGFyZW50OiAnLCBlbG0pO1xuICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdzZXJ2ZXIgaW5uZXJIVE1MOiAnLCBpKTtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignY2xpZW50IGlubmVySFRNTDogJywgZWxtLmlubmVySFRNTCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBpdGVyYXRlIGFuZCBjb21wYXJlIGNoaWxkcmVuIGxpc3RzXG4gICAgICAgICAgICAgIHZhciBjaGlsZHJlbk1hdGNoID0gdHJ1ZTtcbiAgICAgICAgICAgICAgdmFyIGNoaWxkTm9kZSA9IGVsbS5maXJzdENoaWxkO1xuICAgICAgICAgICAgICBmb3IgKHZhciBpJDEgPSAwOyBpJDEgPCBjaGlsZHJlbi5sZW5ndGg7IGkkMSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjaGlsZE5vZGUgfHwgIWh5ZHJhdGUoY2hpbGROb2RlLCBjaGlsZHJlbltpJDFdLCBpbnNlcnRlZFZub2RlUXVldWUsIGluVlByZSkpIHtcbiAgICAgICAgICAgICAgICAgIGNoaWxkcmVuTWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkTm9kZS5uZXh0U2libGluZztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBpZiBjaGlsZE5vZGUgaXMgbm90IG51bGwsIGl0IG1lYW5zIHRoZSBhY3R1YWwgY2hpbGROb2RlcyBsaXN0IGlzXG4gICAgICAgICAgICAgIC8vIGxvbmdlciB0aGFuIHRoZSB2aXJ0dWFsIGNoaWxkcmVuIGxpc3QuXG4gICAgICAgICAgICAgIGlmICghY2hpbGRyZW5NYXRjaCB8fCBjaGlsZE5vZGUpIHtcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgICAgICAgICAgICAhaHlkcmF0aW9uQmFpbGVkXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICBoeWRyYXRpb25CYWlsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdQYXJlbnQ6ICcsIGVsbSk7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ01pc21hdGNoaW5nIGNoaWxkTm9kZXMgdnMuIFZOb2RlczogJywgZWxtLmNoaWxkTm9kZXMsIGNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzRGVmKGRhdGEpKSB7XG4gICAgICAgICAgdmFyIGZ1bGxJbnZva2UgPSBmYWxzZTtcbiAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkge1xuICAgICAgICAgICAgaWYgKCFpc1JlbmRlcmVkTW9kdWxlKGtleSkpIHtcbiAgICAgICAgICAgICAgZnVsbEludm9rZSA9IHRydWU7XG4gICAgICAgICAgICAgIGludm9rZUNyZWF0ZUhvb2tzKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIWZ1bGxJbnZva2UgJiYgZGF0YVsnY2xhc3MnXSkge1xuICAgICAgICAgICAgLy8gZW5zdXJlIGNvbGxlY3RpbmcgZGVwcyBmb3IgZGVlcCBjbGFzcyBiaW5kaW5ncyBmb3IgZnV0dXJlIHVwZGF0ZXNcbiAgICAgICAgICAgIHRyYXZlcnNlKGRhdGFbJ2NsYXNzJ10pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChlbG0uZGF0YSAhPT0gdm5vZGUudGV4dCkge1xuICAgICAgICBlbG0uZGF0YSA9IHZub2RlLnRleHQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFzc2VydE5vZGVNYXRjaCAobm9kZSwgdm5vZGUsIGluVlByZSkge1xuICAgICAgaWYgKGlzRGVmKHZub2RlLnRhZykpIHtcbiAgICAgICAgcmV0dXJuIHZub2RlLnRhZy5pbmRleE9mKCd2dWUtY29tcG9uZW50JykgPT09IDAgfHwgKFxuICAgICAgICAgICFpc1Vua25vd25FbGVtZW50JCQxKHZub2RlLCBpblZQcmUpICYmXG4gICAgICAgICAgdm5vZGUudGFnLnRvTG93ZXJDYXNlKCkgPT09IChub2RlLnRhZ05hbWUgJiYgbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkpXG4gICAgICAgIClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBub2RlLm5vZGVUeXBlID09PSAodm5vZGUuaXNDb21tZW50ID8gOCA6IDMpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIHBhdGNoIChvbGRWbm9kZSwgdm5vZGUsIGh5ZHJhdGluZywgcmVtb3ZlT25seSkge1xuICAgICAgaWYgKGlzVW5kZWYodm5vZGUpKSB7XG4gICAgICAgIGlmIChpc0RlZihvbGRWbm9kZSkpIHsgaW52b2tlRGVzdHJveUhvb2sob2xkVm5vZGUpOyB9XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICB2YXIgaXNJbml0aWFsUGF0Y2ggPSBmYWxzZTtcbiAgICAgIHZhciBpbnNlcnRlZFZub2RlUXVldWUgPSBbXTtcblxuICAgICAgaWYgKGlzVW5kZWYob2xkVm5vZGUpKSB7XG4gICAgICAgIC8vIGVtcHR5IG1vdW50IChsaWtlbHkgYXMgY29tcG9uZW50KSwgY3JlYXRlIG5ldyByb290IGVsZW1lbnRcbiAgICAgICAgaXNJbml0aWFsUGF0Y2ggPSB0cnVlO1xuICAgICAgICBjcmVhdGVFbG0odm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaXNSZWFsRWxlbWVudCA9IGlzRGVmKG9sZFZub2RlLm5vZGVUeXBlKTtcbiAgICAgICAgaWYgKCFpc1JlYWxFbGVtZW50ICYmIHNhbWVWbm9kZShvbGRWbm9kZSwgdm5vZGUpKSB7XG4gICAgICAgICAgLy8gcGF0Y2ggZXhpc3Rpbmcgcm9vdCBub2RlXG4gICAgICAgICAgcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSwgbnVsbCwgbnVsbCwgcmVtb3ZlT25seSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGlzUmVhbEVsZW1lbnQpIHtcbiAgICAgICAgICAgIC8vIG1vdW50aW5nIHRvIGEgcmVhbCBlbGVtZW50XG4gICAgICAgICAgICAvLyBjaGVjayBpZiB0aGlzIGlzIHNlcnZlci1yZW5kZXJlZCBjb250ZW50IGFuZCBpZiB3ZSBjYW4gcGVyZm9ybVxuICAgICAgICAgICAgLy8gYSBzdWNjZXNzZnVsIGh5ZHJhdGlvbi5cbiAgICAgICAgICAgIGlmIChvbGRWbm9kZS5ub2RlVHlwZSA9PT0gMSAmJiBvbGRWbm9kZS5oYXNBdHRyaWJ1dGUoU1NSX0FUVFIpKSB7XG4gICAgICAgICAgICAgIG9sZFZub2RlLnJlbW92ZUF0dHJpYnV0ZShTU1JfQVRUUik7XG4gICAgICAgICAgICAgIGh5ZHJhdGluZyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNUcnVlKGh5ZHJhdGluZykpIHtcbiAgICAgICAgICAgICAgaWYgKGh5ZHJhdGUob2xkVm5vZGUsIHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpKSB7XG4gICAgICAgICAgICAgICAgaW52b2tlSW5zZXJ0SG9vayh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLCB0cnVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2xkVm5vZGVcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3YXJuKFxuICAgICAgICAgICAgICAgICAgJ1RoZSBjbGllbnQtc2lkZSByZW5kZXJlZCB2aXJ0dWFsIERPTSB0cmVlIGlzIG5vdCBtYXRjaGluZyAnICtcbiAgICAgICAgICAgICAgICAgICdzZXJ2ZXItcmVuZGVyZWQgY29udGVudC4gVGhpcyBpcyBsaWtlbHkgY2F1c2VkIGJ5IGluY29ycmVjdCAnICtcbiAgICAgICAgICAgICAgICAgICdIVE1MIG1hcmt1cCwgZm9yIGV4YW1wbGUgbmVzdGluZyBibG9jay1sZXZlbCBlbGVtZW50cyBpbnNpZGUgJyArXG4gICAgICAgICAgICAgICAgICAnPHA+LCBvciBtaXNzaW5nIDx0Ym9keT4uIEJhaWxpbmcgaHlkcmF0aW9uIGFuZCBwZXJmb3JtaW5nICcgK1xuICAgICAgICAgICAgICAgICAgJ2Z1bGwgY2xpZW50LXNpZGUgcmVuZGVyLidcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBlaXRoZXIgbm90IHNlcnZlci1yZW5kZXJlZCwgb3IgaHlkcmF0aW9uIGZhaWxlZC5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhbiBlbXB0eSBub2RlIGFuZCByZXBsYWNlIGl0XG4gICAgICAgICAgICBvbGRWbm9kZSA9IGVtcHR5Tm9kZUF0KG9sZFZub2RlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyByZXBsYWNpbmcgZXhpc3RpbmcgZWxlbWVudFxuICAgICAgICAgIHZhciBvbGRFbG0gPSBvbGRWbm9kZS5lbG07XG4gICAgICAgICAgdmFyIHBhcmVudEVsbSA9IG5vZGVPcHMucGFyZW50Tm9kZShvbGRFbG0pO1xuXG4gICAgICAgICAgLy8gY3JlYXRlIG5ldyBub2RlXG4gICAgICAgICAgY3JlYXRlRWxtKFxuICAgICAgICAgICAgdm5vZGUsXG4gICAgICAgICAgICBpbnNlcnRlZFZub2RlUXVldWUsXG4gICAgICAgICAgICAvLyBleHRyZW1lbHkgcmFyZSBlZGdlIGNhc2U6IGRvIG5vdCBpbnNlcnQgaWYgb2xkIGVsZW1lbnQgaXMgaW4gYVxuICAgICAgICAgICAgLy8gbGVhdmluZyB0cmFuc2l0aW9uLiBPbmx5IGhhcHBlbnMgd2hlbiBjb21iaW5pbmcgdHJhbnNpdGlvbiArXG4gICAgICAgICAgICAvLyBrZWVwLWFsaXZlICsgSE9Dcy4gKCM0NTkwKVxuICAgICAgICAgICAgb2xkRWxtLl9sZWF2ZUNiID8gbnVsbCA6IHBhcmVudEVsbSxcbiAgICAgICAgICAgIG5vZGVPcHMubmV4dFNpYmxpbmcob2xkRWxtKVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICAvLyB1cGRhdGUgcGFyZW50IHBsYWNlaG9sZGVyIG5vZGUgZWxlbWVudCwgcmVjdXJzaXZlbHlcbiAgICAgICAgICBpZiAoaXNEZWYodm5vZGUucGFyZW50KSkge1xuICAgICAgICAgICAgdmFyIGFuY2VzdG9yID0gdm5vZGUucGFyZW50O1xuICAgICAgICAgICAgdmFyIHBhdGNoYWJsZSA9IGlzUGF0Y2hhYmxlKHZub2RlKTtcbiAgICAgICAgICAgIHdoaWxlIChhbmNlc3Rvcikge1xuICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNicy5kZXN0cm95Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgY2JzLmRlc3Ryb3lbaV0oYW5jZXN0b3IpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGFuY2VzdG9yLmVsbSA9IHZub2RlLmVsbTtcbiAgICAgICAgICAgICAgaWYgKHBhdGNoYWJsZSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkkMSA9IDA7IGkkMSA8IGNicy5jcmVhdGUubGVuZ3RoOyArK2kkMSkge1xuICAgICAgICAgICAgICAgICAgY2JzLmNyZWF0ZVtpJDFdKGVtcHR5Tm9kZSwgYW5jZXN0b3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyAjNjUxM1xuICAgICAgICAgICAgICAgIC8vIGludm9rZSBpbnNlcnQgaG9va3MgdGhhdCBtYXkgaGF2ZSBiZWVuIG1lcmdlZCBieSBjcmVhdGUgaG9va3MuXG4gICAgICAgICAgICAgICAgLy8gZS5nLiBmb3IgZGlyZWN0aXZlcyB0aGF0IHVzZXMgdGhlIFwiaW5zZXJ0ZWRcIiBob29rLlxuICAgICAgICAgICAgICAgIHZhciBpbnNlcnQgPSBhbmNlc3Rvci5kYXRhLmhvb2suaW5zZXJ0O1xuICAgICAgICAgICAgICAgIGlmIChpbnNlcnQubWVyZ2VkKSB7XG4gICAgICAgICAgICAgICAgICAvLyBzdGFydCBhdCBpbmRleCAxIHRvIGF2b2lkIHJlLWludm9raW5nIGNvbXBvbmVudCBtb3VudGVkIGhvb2tcbiAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkkMiA9IDE7IGkkMiA8IGluc2VydC5mbnMubGVuZ3RoOyBpJDIrKykge1xuICAgICAgICAgICAgICAgICAgICBpbnNlcnQuZm5zW2kkMl0oKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVnaXN0ZXJSZWYoYW5jZXN0b3IpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGFuY2VzdG9yID0gYW5jZXN0b3IucGFyZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGRlc3Ryb3kgb2xkIG5vZGVcbiAgICAgICAgICBpZiAoaXNEZWYocGFyZW50RWxtKSkge1xuICAgICAgICAgICAgcmVtb3ZlVm5vZGVzKFtvbGRWbm9kZV0sIDAsIDApO1xuICAgICAgICAgIH0gZWxzZSBpZiAoaXNEZWYob2xkVm5vZGUudGFnKSkge1xuICAgICAgICAgICAgaW52b2tlRGVzdHJveUhvb2sob2xkVm5vZGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpbnZva2VJbnNlcnRIb29rKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUsIGlzSW5pdGlhbFBhdGNoKTtcbiAgICAgIHJldHVybiB2bm9kZS5lbG1cbiAgICB9XG4gIH1cblxuICAvKiAgKi9cblxuICB2YXIgZGlyZWN0aXZlcyA9IHtcbiAgICBjcmVhdGU6IHVwZGF0ZURpcmVjdGl2ZXMsXG4gICAgdXBkYXRlOiB1cGRhdGVEaXJlY3RpdmVzLFxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uIHVuYmluZERpcmVjdGl2ZXMgKHZub2RlKSB7XG4gICAgICB1cGRhdGVEaXJlY3RpdmVzKHZub2RlLCBlbXB0eU5vZGUpO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiB1cGRhdGVEaXJlY3RpdmVzIChvbGRWbm9kZSwgdm5vZGUpIHtcbiAgICBpZiAob2xkVm5vZGUuZGF0YS5kaXJlY3RpdmVzIHx8IHZub2RlLmRhdGEuZGlyZWN0aXZlcykge1xuICAgICAgX3VwZGF0ZShvbGRWbm9kZSwgdm5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIF91cGRhdGUgKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBpc0NyZWF0ZSA9IG9sZFZub2RlID09PSBlbXB0eU5vZGU7XG4gICAgdmFyIGlzRGVzdHJveSA9IHZub2RlID09PSBlbXB0eU5vZGU7XG4gICAgdmFyIG9sZERpcnMgPSBub3JtYWxpemVEaXJlY3RpdmVzJDEob2xkVm5vZGUuZGF0YS5kaXJlY3RpdmVzLCBvbGRWbm9kZS5jb250ZXh0KTtcbiAgICB2YXIgbmV3RGlycyA9IG5vcm1hbGl6ZURpcmVjdGl2ZXMkMSh2bm9kZS5kYXRhLmRpcmVjdGl2ZXMsIHZub2RlLmNvbnRleHQpO1xuXG4gICAgdmFyIGRpcnNXaXRoSW5zZXJ0ID0gW107XG4gICAgdmFyIGRpcnNXaXRoUG9zdHBhdGNoID0gW107XG5cbiAgICB2YXIga2V5LCBvbGREaXIsIGRpcjtcbiAgICBmb3IgKGtleSBpbiBuZXdEaXJzKSB7XG4gICAgICBvbGREaXIgPSBvbGREaXJzW2tleV07XG4gICAgICBkaXIgPSBuZXdEaXJzW2tleV07XG4gICAgICBpZiAoIW9sZERpcikge1xuICAgICAgICAvLyBuZXcgZGlyZWN0aXZlLCBiaW5kXG4gICAgICAgIGNhbGxIb29rJDEoZGlyLCAnYmluZCcsIHZub2RlLCBvbGRWbm9kZSk7XG4gICAgICAgIGlmIChkaXIuZGVmICYmIGRpci5kZWYuaW5zZXJ0ZWQpIHtcbiAgICAgICAgICBkaXJzV2l0aEluc2VydC5wdXNoKGRpcik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGV4aXN0aW5nIGRpcmVjdGl2ZSwgdXBkYXRlXG4gICAgICAgIGRpci5vbGRWYWx1ZSA9IG9sZERpci52YWx1ZTtcbiAgICAgICAgZGlyLm9sZEFyZyA9IG9sZERpci5hcmc7XG4gICAgICAgIGNhbGxIb29rJDEoZGlyLCAndXBkYXRlJywgdm5vZGUsIG9sZFZub2RlKTtcbiAgICAgICAgaWYgKGRpci5kZWYgJiYgZGlyLmRlZi5jb21wb25lbnRVcGRhdGVkKSB7XG4gICAgICAgICAgZGlyc1dpdGhQb3N0cGF0Y2gucHVzaChkaXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGRpcnNXaXRoSW5zZXJ0Lmxlbmd0aCkge1xuICAgICAgdmFyIGNhbGxJbnNlcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGlyc1dpdGhJbnNlcnQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjYWxsSG9vayQxKGRpcnNXaXRoSW5zZXJ0W2ldLCAnaW5zZXJ0ZWQnLCB2bm9kZSwgb2xkVm5vZGUpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgaWYgKGlzQ3JlYXRlKSB7XG4gICAgICAgIG1lcmdlVk5vZGVIb29rKHZub2RlLCAnaW5zZXJ0JywgY2FsbEluc2VydCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsSW5zZXJ0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGRpcnNXaXRoUG9zdHBhdGNoLmxlbmd0aCkge1xuICAgICAgbWVyZ2VWTm9kZUhvb2sodm5vZGUsICdwb3N0cGF0Y2gnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGlyc1dpdGhQb3N0cGF0Y2gubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjYWxsSG9vayQxKGRpcnNXaXRoUG9zdHBhdGNoW2ldLCAnY29tcG9uZW50VXBkYXRlZCcsIHZub2RlLCBvbGRWbm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghaXNDcmVhdGUpIHtcbiAgICAgIGZvciAoa2V5IGluIG9sZERpcnMpIHtcbiAgICAgICAgaWYgKCFuZXdEaXJzW2tleV0pIHtcbiAgICAgICAgICAvLyBubyBsb25nZXIgcHJlc2VudCwgdW5iaW5kXG4gICAgICAgICAgY2FsbEhvb2skMShvbGREaXJzW2tleV0sICd1bmJpbmQnLCBvbGRWbm9kZSwgb2xkVm5vZGUsIGlzRGVzdHJveSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB2YXIgZW1wdHlNb2RpZmllcnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZURpcmVjdGl2ZXMkMSAoXG4gICAgZGlycyxcbiAgICB2bVxuICApIHtcbiAgICB2YXIgcmVzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICBpZiAoIWRpcnMpIHtcbiAgICAgIC8vICRmbG93LWRpc2FibGUtbGluZVxuICAgICAgcmV0dXJuIHJlc1xuICAgIH1cbiAgICB2YXIgaSwgZGlyO1xuICAgIGZvciAoaSA9IDA7IGkgPCBkaXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBkaXIgPSBkaXJzW2ldO1xuICAgICAgaWYgKCFkaXIubW9kaWZpZXJzKSB7XG4gICAgICAgIC8vICRmbG93LWRpc2FibGUtbGluZVxuICAgICAgICBkaXIubW9kaWZpZXJzID0gZW1wdHlNb2RpZmllcnM7XG4gICAgICB9XG4gICAgICByZXNbZ2V0UmF3RGlyTmFtZShkaXIpXSA9IGRpcjtcbiAgICAgIGRpci5kZWYgPSByZXNvbHZlQXNzZXQodm0uJG9wdGlvbnMsICdkaXJlY3RpdmVzJywgZGlyLm5hbWUsIHRydWUpO1xuICAgIH1cbiAgICAvLyAkZmxvdy1kaXNhYmxlLWxpbmVcbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICBmdW5jdGlvbiBnZXRSYXdEaXJOYW1lIChkaXIpIHtcbiAgICByZXR1cm4gZGlyLnJhd05hbWUgfHwgKChkaXIubmFtZSkgKyBcIi5cIiArIChPYmplY3Qua2V5cyhkaXIubW9kaWZpZXJzIHx8IHt9KS5qb2luKCcuJykpKVxuICB9XG5cbiAgZnVuY3Rpb24gY2FsbEhvb2skMSAoZGlyLCBob29rLCB2bm9kZSwgb2xkVm5vZGUsIGlzRGVzdHJveSkge1xuICAgIHZhciBmbiA9IGRpci5kZWYgJiYgZGlyLmRlZltob29rXTtcbiAgICBpZiAoZm4pIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZuKHZub2RlLmVsbSwgZGlyLCB2bm9kZSwgb2xkVm5vZGUsIGlzRGVzdHJveSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGhhbmRsZUVycm9yKGUsIHZub2RlLmNvbnRleHQsIChcImRpcmVjdGl2ZSBcIiArIChkaXIubmFtZSkgKyBcIiBcIiArIGhvb2sgKyBcIiBob29rXCIpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB2YXIgYmFzZU1vZHVsZXMgPSBbXG4gICAgcmVmLFxuICAgIGRpcmVjdGl2ZXNcbiAgXTtcblxuICAvKiAgKi9cblxuICBmdW5jdGlvbiB1cGRhdGVBdHRycyAob2xkVm5vZGUsIHZub2RlKSB7XG4gICAgdmFyIG9wdHMgPSB2bm9kZS5jb21wb25lbnRPcHRpb25zO1xuICAgIGlmIChpc0RlZihvcHRzKSAmJiBvcHRzLkN0b3Iub3B0aW9ucy5pbmhlcml0QXR0cnMgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKGlzVW5kZWYob2xkVm5vZGUuZGF0YS5hdHRycykgJiYgaXNVbmRlZih2bm9kZS5kYXRhLmF0dHJzKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZhciBrZXksIGN1ciwgb2xkO1xuICAgIHZhciBlbG0gPSB2bm9kZS5lbG07XG4gICAgdmFyIG9sZEF0dHJzID0gb2xkVm5vZGUuZGF0YS5hdHRycyB8fCB7fTtcbiAgICB2YXIgYXR0cnMgPSB2bm9kZS5kYXRhLmF0dHJzIHx8IHt9O1xuICAgIC8vIGNsb25lIG9ic2VydmVkIG9iamVjdHMsIGFzIHRoZSB1c2VyIHByb2JhYmx5IHdhbnRzIHRvIG11dGF0ZSBpdFxuICAgIGlmIChpc0RlZihhdHRycy5fX29iX18pKSB7XG4gICAgICBhdHRycyA9IHZub2RlLmRhdGEuYXR0cnMgPSBleHRlbmQoe30sIGF0dHJzKTtcbiAgICB9XG5cbiAgICBmb3IgKGtleSBpbiBhdHRycykge1xuICAgICAgY3VyID0gYXR0cnNba2V5XTtcbiAgICAgIG9sZCA9IG9sZEF0dHJzW2tleV07XG4gICAgICBpZiAob2xkICE9PSBjdXIpIHtcbiAgICAgICAgc2V0QXR0cihlbG0sIGtleSwgY3VyLCB2bm9kZS5kYXRhLnByZSk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vICM0MzkxOiBpbiBJRTksIHNldHRpbmcgdHlwZSBjYW4gcmVzZXQgdmFsdWUgZm9yIGlucHV0W3R5cGU9cmFkaW9dXG4gICAgLy8gIzY2NjY6IElFL0VkZ2UgZm9yY2VzIHByb2dyZXNzIHZhbHVlIGRvd24gdG8gMSBiZWZvcmUgc2V0dGluZyBhIG1heFxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICgoaXNJRSB8fCBpc0VkZ2UpICYmIGF0dHJzLnZhbHVlICE9PSBvbGRBdHRycy52YWx1ZSkge1xuICAgICAgc2V0QXR0cihlbG0sICd2YWx1ZScsIGF0dHJzLnZhbHVlKTtcbiAgICB9XG4gICAgZm9yIChrZXkgaW4gb2xkQXR0cnMpIHtcbiAgICAgIGlmIChpc1VuZGVmKGF0dHJzW2tleV0pKSB7XG4gICAgICAgIGlmIChpc1hsaW5rKGtleSkpIHtcbiAgICAgICAgICBlbG0ucmVtb3ZlQXR0cmlidXRlTlMoeGxpbmtOUywgZ2V0WGxpbmtQcm9wKGtleSkpO1xuICAgICAgICB9IGVsc2UgaWYgKCFpc0VudW1lcmF0ZWRBdHRyKGtleSkpIHtcbiAgICAgICAgICBlbG0ucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzZXRBdHRyIChlbCwga2V5LCB2YWx1ZSwgaXNJblByZSkge1xuICAgIGlmIChpc0luUHJlIHx8IGVsLnRhZ05hbWUuaW5kZXhPZignLScpID4gLTEpIHtcbiAgICAgIGJhc2VTZXRBdHRyKGVsLCBrZXksIHZhbHVlKTtcbiAgICB9IGVsc2UgaWYgKGlzQm9vbGVhbkF0dHIoa2V5KSkge1xuICAgICAgLy8gc2V0IGF0dHJpYnV0ZSBmb3IgYmxhbmsgdmFsdWVcbiAgICAgIC8vIGUuZy4gPG9wdGlvbiBkaXNhYmxlZD5TZWxlY3Qgb25lPC9vcHRpb24+XG4gICAgICBpZiAoaXNGYWxzeUF0dHJWYWx1ZSh2YWx1ZSkpIHtcbiAgICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyB0ZWNobmljYWxseSBhbGxvd2Z1bGxzY3JlZW4gaXMgYSBib29sZWFuIGF0dHJpYnV0ZSBmb3IgPGlmcmFtZT4sXG4gICAgICAgIC8vIGJ1dCBGbGFzaCBleHBlY3RzIGEgdmFsdWUgb2YgXCJ0cnVlXCIgd2hlbiB1c2VkIG9uIDxlbWJlZD4gdGFnXG4gICAgICAgIHZhbHVlID0ga2V5ID09PSAnYWxsb3dmdWxsc2NyZWVuJyAmJiBlbC50YWdOYW1lID09PSAnRU1CRUQnXG4gICAgICAgICAgPyAndHJ1ZSdcbiAgICAgICAgICA6IGtleTtcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKGtleSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNFbnVtZXJhdGVkQXR0cihrZXkpKSB7XG4gICAgICBlbC5zZXRBdHRyaWJ1dGUoa2V5LCBjb252ZXJ0RW51bWVyYXRlZFZhbHVlKGtleSwgdmFsdWUpKTtcbiAgICB9IGVsc2UgaWYgKGlzWGxpbmsoa2V5KSkge1xuICAgICAgaWYgKGlzRmFsc3lBdHRyVmFsdWUodmFsdWUpKSB7XG4gICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZU5TKHhsaW5rTlMsIGdldFhsaW5rUHJvcChrZXkpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZU5TKHhsaW5rTlMsIGtleSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBiYXNlU2V0QXR0cihlbCwga2V5LCB2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYmFzZVNldEF0dHIgKGVsLCBrZXksIHZhbHVlKSB7XG4gICAgaWYgKGlzRmFsc3lBdHRyVmFsdWUodmFsdWUpKSB7XG4gICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gIzcxMzg6IElFMTAgJiAxMSBmaXJlcyBpbnB1dCBldmVudCB3aGVuIHNldHRpbmcgcGxhY2Vob2xkZXIgb25cbiAgICAgIC8vIDx0ZXh0YXJlYT4uLi4gYmxvY2sgdGhlIGZpcnN0IGlucHV0IGV2ZW50IGFuZCByZW1vdmUgdGhlIGJsb2NrZXJcbiAgICAgIC8vIGltbWVkaWF0ZWx5LlxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICBpZiAoXG4gICAgICAgIGlzSUUgJiYgIWlzSUU5ICYmXG4gICAgICAgIGVsLnRhZ05hbWUgPT09ICdURVhUQVJFQScgJiZcbiAgICAgICAga2V5ID09PSAncGxhY2Vob2xkZXInICYmIHZhbHVlICE9PSAnJyAmJiAhZWwuX19pZXBoXG4gICAgICApIHtcbiAgICAgICAgdmFyIGJsb2NrZXIgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBibG9ja2VyKTtcbiAgICAgICAgfTtcbiAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBibG9ja2VyKTtcbiAgICAgICAgLy8gJGZsb3ctZGlzYWJsZS1saW5lXG4gICAgICAgIGVsLl9faWVwaCA9IHRydWU7IC8qIElFIHBsYWNlaG9sZGVyIHBhdGNoZWQgKi9cbiAgICAgIH1cbiAgICAgIGVsLnNldEF0dHJpYnV0ZShrZXksIHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB2YXIgYXR0cnMgPSB7XG4gICAgY3JlYXRlOiB1cGRhdGVBdHRycyxcbiAgICB1cGRhdGU6IHVwZGF0ZUF0dHJzXG4gIH07XG5cbiAgLyogICovXG5cbiAgZnVuY3Rpb24gdXBkYXRlQ2xhc3MgKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBlbCA9IHZub2RlLmVsbTtcbiAgICB2YXIgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgdmFyIG9sZERhdGEgPSBvbGRWbm9kZS5kYXRhO1xuICAgIGlmIChcbiAgICAgIGlzVW5kZWYoZGF0YS5zdGF0aWNDbGFzcykgJiZcbiAgICAgIGlzVW5kZWYoZGF0YS5jbGFzcykgJiYgKFxuICAgICAgICBpc1VuZGVmKG9sZERhdGEpIHx8IChcbiAgICAgICAgICBpc1VuZGVmKG9sZERhdGEuc3RhdGljQ2xhc3MpICYmXG4gICAgICAgICAgaXNVbmRlZihvbGREYXRhLmNsYXNzKVxuICAgICAgICApXG4gICAgICApXG4gICAgKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB2YXIgY2xzID0gZ2VuQ2xhc3NGb3JWbm9kZSh2bm9kZSk7XG5cbiAgICAvLyBoYW5kbGUgdHJhbnNpdGlvbiBjbGFzc2VzXG4gICAgdmFyIHRyYW5zaXRpb25DbGFzcyA9IGVsLl90cmFuc2l0aW9uQ2xhc3NlcztcbiAgICBpZiAoaXNEZWYodHJhbnNpdGlvbkNsYXNzKSkge1xuICAgICAgY2xzID0gY29uY2F0KGNscywgc3RyaW5naWZ5Q2xhc3ModHJhbnNpdGlvbkNsYXNzKSk7XG4gICAgfVxuXG4gICAgLy8gc2V0IHRoZSBjbGFzc1xuICAgIGlmIChjbHMgIT09IGVsLl9wcmV2Q2xhc3MpIHtcbiAgICAgIGVsLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBjbHMpO1xuICAgICAgZWwuX3ByZXZDbGFzcyA9IGNscztcbiAgICB9XG4gIH1cblxuICB2YXIga2xhc3MgPSB7XG4gICAgY3JlYXRlOiB1cGRhdGVDbGFzcyxcbiAgICB1cGRhdGU6IHVwZGF0ZUNsYXNzXG4gIH07XG5cbiAgLyogICovXG5cbiAgdmFyIHZhbGlkRGl2aXNpb25DaGFyUkUgPSAvW1xcdykuK1xcLV8kXFxdXS87XG5cbiAgZnVuY3Rpb24gcGFyc2VGaWx0ZXJzIChleHApIHtcbiAgICB2YXIgaW5TaW5nbGUgPSBmYWxzZTtcbiAgICB2YXIgaW5Eb3VibGUgPSBmYWxzZTtcbiAgICB2YXIgaW5UZW1wbGF0ZVN0cmluZyA9IGZhbHNlO1xuICAgIHZhciBpblJlZ2V4ID0gZmFsc2U7XG4gICAgdmFyIGN1cmx5ID0gMDtcbiAgICB2YXIgc3F1YXJlID0gMDtcbiAgICB2YXIgcGFyZW4gPSAwO1xuICAgIHZhciBsYXN0RmlsdGVySW5kZXggPSAwO1xuICAgIHZhciBjLCBwcmV2LCBpLCBleHByZXNzaW9uLCBmaWx0ZXJzO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGV4cC5sZW5ndGg7IGkrKykge1xuICAgICAgcHJldiA9IGM7XG4gICAgICBjID0gZXhwLmNoYXJDb2RlQXQoaSk7XG4gICAgICBpZiAoaW5TaW5nbGUpIHtcbiAgICAgICAgaWYgKGMgPT09IDB4MjcgJiYgcHJldiAhPT0gMHg1QykgeyBpblNpbmdsZSA9IGZhbHNlOyB9XG4gICAgICB9IGVsc2UgaWYgKGluRG91YmxlKSB7XG4gICAgICAgIGlmIChjID09PSAweDIyICYmIHByZXYgIT09IDB4NUMpIHsgaW5Eb3VibGUgPSBmYWxzZTsgfVxuICAgICAgfSBlbHNlIGlmIChpblRlbXBsYXRlU3RyaW5nKSB7XG4gICAgICAgIGlmIChjID09PSAweDYwICYmIHByZXYgIT09IDB4NUMpIHsgaW5UZW1wbGF0ZVN0cmluZyA9IGZhbHNlOyB9XG4gICAgICB9IGVsc2UgaWYgKGluUmVnZXgpIHtcbiAgICAgICAgaWYgKGMgPT09IDB4MmYgJiYgcHJldiAhPT0gMHg1QykgeyBpblJlZ2V4ID0gZmFsc2U7IH1cbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIGMgPT09IDB4N0MgJiYgLy8gcGlwZVxuICAgICAgICBleHAuY2hhckNvZGVBdChpICsgMSkgIT09IDB4N0MgJiZcbiAgICAgICAgZXhwLmNoYXJDb2RlQXQoaSAtIDEpICE9PSAweDdDICYmXG4gICAgICAgICFjdXJseSAmJiAhc3F1YXJlICYmICFwYXJlblxuICAgICAgKSB7XG4gICAgICAgIGlmIChleHByZXNzaW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBmaXJzdCBmaWx0ZXIsIGVuZCBvZiBleHByZXNzaW9uXG4gICAgICAgICAgbGFzdEZpbHRlckluZGV4ID0gaSArIDE7XG4gICAgICAgICAgZXhwcmVzc2lvbiA9IGV4cC5zbGljZSgwLCBpKS50cmltKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHVzaEZpbHRlcigpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzd2l0Y2ggKGMpIHtcbiAgICAgICAgICBjYXNlIDB4MjI6IGluRG91YmxlID0gdHJ1ZTsgYnJlYWsgICAgICAgICAvLyBcIlxuICAgICAgICAgIGNhc2UgMHgyNzogaW5TaW5nbGUgPSB0cnVlOyBicmVhayAgICAgICAgIC8vICdcbiAgICAgICAgICBjYXNlIDB4NjA6IGluVGVtcGxhdGVTdHJpbmcgPSB0cnVlOyBicmVhayAvLyBgXG4gICAgICAgICAgY2FzZSAweDI4OiBwYXJlbisrOyBicmVhayAgICAgICAgICAgICAgICAgLy8gKFxuICAgICAgICAgIGNhc2UgMHgyOTogcGFyZW4tLTsgYnJlYWsgICAgICAgICAgICAgICAgIC8vIClcbiAgICAgICAgICBjYXNlIDB4NUI6IHNxdWFyZSsrOyBicmVhayAgICAgICAgICAgICAgICAvLyBbXG4gICAgICAgICAgY2FzZSAweDVEOiBzcXVhcmUtLTsgYnJlYWsgICAgICAgICAgICAgICAgLy8gXVxuICAgICAgICAgIGNhc2UgMHg3QjogY3VybHkrKzsgYnJlYWsgICAgICAgICAgICAgICAgIC8vIHtcbiAgICAgICAgICBjYXNlIDB4N0Q6IGN1cmx5LS07IGJyZWFrICAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGMgPT09IDB4MmYpIHsgLy8gL1xuICAgICAgICAgIHZhciBqID0gaSAtIDE7XG4gICAgICAgICAgdmFyIHAgPSAodm9pZCAwKTtcbiAgICAgICAgICAvLyBmaW5kIGZpcnN0IG5vbi13aGl0ZXNwYWNlIHByZXYgY2hhclxuICAgICAgICAgIGZvciAoOyBqID49IDA7IGotLSkge1xuICAgICAgICAgICAgcCA9IGV4cC5jaGFyQXQoaik7XG4gICAgICAgICAgICBpZiAocCAhPT0gJyAnKSB7IGJyZWFrIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFwIHx8ICF2YWxpZERpdmlzaW9uQ2hhclJFLnRlc3QocCkpIHtcbiAgICAgICAgICAgIGluUmVnZXggPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChleHByZXNzaW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGV4cHJlc3Npb24gPSBleHAuc2xpY2UoMCwgaSkudHJpbSgpO1xuICAgIH0gZWxzZSBpZiAobGFzdEZpbHRlckluZGV4ICE9PSAwKSB7XG4gICAgICBwdXNoRmlsdGVyKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHVzaEZpbHRlciAoKSB7XG4gICAgICAoZmlsdGVycyB8fCAoZmlsdGVycyA9IFtdKSkucHVzaChleHAuc2xpY2UobGFzdEZpbHRlckluZGV4LCBpKS50cmltKCkpO1xuICAgICAgbGFzdEZpbHRlckluZGV4ID0gaSArIDE7XG4gICAgfVxuXG4gICAgaWYgKGZpbHRlcnMpIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBmaWx0ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGV4cHJlc3Npb24gPSB3cmFwRmlsdGVyKGV4cHJlc3Npb24sIGZpbHRlcnNbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBleHByZXNzaW9uXG4gIH1cblxuICBmdW5jdGlvbiB3cmFwRmlsdGVyIChleHAsIGZpbHRlcikge1xuICAgIHZhciBpID0gZmlsdGVyLmluZGV4T2YoJygnKTtcbiAgICBpZiAoaSA8IDApIHtcbiAgICAgIC8vIF9mOiByZXNvbHZlRmlsdGVyXG4gICAgICByZXR1cm4gKFwiX2YoXFxcIlwiICsgZmlsdGVyICsgXCJcXFwiKShcIiArIGV4cCArIFwiKVwiKVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgbmFtZSA9IGZpbHRlci5zbGljZSgwLCBpKTtcbiAgICAgIHZhciBhcmdzID0gZmlsdGVyLnNsaWNlKGkgKyAxKTtcbiAgICAgIHJldHVybiAoXCJfZihcXFwiXCIgKyBuYW1lICsgXCJcXFwiKShcIiArIGV4cCArIChhcmdzICE9PSAnKScgPyAnLCcgKyBhcmdzIDogYXJncykpXG4gICAgfVxuICB9XG5cbiAgLyogICovXG5cblxuXG4gIC8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4gIGZ1bmN0aW9uIGJhc2VXYXJuIChtc2csIHJhbmdlKSB7XG4gICAgY29uc29sZS5lcnJvcigoXCJbVnVlIGNvbXBpbGVyXTogXCIgKyBtc2cpKTtcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5cbiAgZnVuY3Rpb24gcGx1Y2tNb2R1bGVGdW5jdGlvbiAoXG4gICAgbW9kdWxlcyxcbiAgICBrZXlcbiAgKSB7XG4gICAgcmV0dXJuIG1vZHVsZXNcbiAgICAgID8gbW9kdWxlcy5tYXAoZnVuY3Rpb24gKG0pIHsgcmV0dXJuIG1ba2V5XTsgfSkuZmlsdGVyKGZ1bmN0aW9uIChfKSB7IHJldHVybiBfOyB9KVxuICAgICAgOiBbXVxuICB9XG5cbiAgZnVuY3Rpb24gYWRkUHJvcCAoZWwsIG5hbWUsIHZhbHVlLCByYW5nZSwgZHluYW1pYykge1xuICAgIChlbC5wcm9wcyB8fCAoZWwucHJvcHMgPSBbXSkpLnB1c2gocmFuZ2VTZXRJdGVtKHsgbmFtZTogbmFtZSwgdmFsdWU6IHZhbHVlLCBkeW5hbWljOiBkeW5hbWljIH0sIHJhbmdlKSk7XG4gICAgZWwucGxhaW4gPSBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZEF0dHIgKGVsLCBuYW1lLCB2YWx1ZSwgcmFuZ2UsIGR5bmFtaWMpIHtcbiAgICB2YXIgYXR0cnMgPSBkeW5hbWljXG4gICAgICA/IChlbC5keW5hbWljQXR0cnMgfHwgKGVsLmR5bmFtaWNBdHRycyA9IFtdKSlcbiAgICAgIDogKGVsLmF0dHJzIHx8IChlbC5hdHRycyA9IFtdKSk7XG4gICAgYXR0cnMucHVzaChyYW5nZVNldEl0ZW0oeyBuYW1lOiBuYW1lLCB2YWx1ZTogdmFsdWUsIGR5bmFtaWM6IGR5bmFtaWMgfSwgcmFuZ2UpKTtcbiAgICBlbC5wbGFpbiA9IGZhbHNlO1xuICB9XG5cbiAgLy8gYWRkIGEgcmF3IGF0dHIgKHVzZSB0aGlzIGluIHByZVRyYW5zZm9ybXMpXG4gIGZ1bmN0aW9uIGFkZFJhd0F0dHIgKGVsLCBuYW1lLCB2YWx1ZSwgcmFuZ2UpIHtcbiAgICBlbC5hdHRyc01hcFtuYW1lXSA9IHZhbHVlO1xuICAgIGVsLmF0dHJzTGlzdC5wdXNoKHJhbmdlU2V0SXRlbSh7IG5hbWU6IG5hbWUsIHZhbHVlOiB2YWx1ZSB9LCByYW5nZSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkRGlyZWN0aXZlIChcbiAgICBlbCxcbiAgICBuYW1lLFxuICAgIHJhd05hbWUsXG4gICAgdmFsdWUsXG4gICAgYXJnLFxuICAgIGlzRHluYW1pY0FyZyxcbiAgICBtb2RpZmllcnMsXG4gICAgcmFuZ2VcbiAgKSB7XG4gICAgKGVsLmRpcmVjdGl2ZXMgfHwgKGVsLmRpcmVjdGl2ZXMgPSBbXSkpLnB1c2gocmFuZ2VTZXRJdGVtKHtcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICByYXdOYW1lOiByYXdOYW1lLFxuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgYXJnOiBhcmcsXG4gICAgICBpc0R5bmFtaWNBcmc6IGlzRHluYW1pY0FyZyxcbiAgICAgIG1vZGlmaWVyczogbW9kaWZpZXJzXG4gICAgfSwgcmFuZ2UpKTtcbiAgICBlbC5wbGFpbiA9IGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJlcGVuZE1vZGlmaWVyTWFya2VyIChzeW1ib2wsIG5hbWUsIGR5bmFtaWMpIHtcbiAgICByZXR1cm4gZHluYW1pY1xuICAgICAgPyAoXCJfcChcIiArIG5hbWUgKyBcIixcXFwiXCIgKyBzeW1ib2wgKyBcIlxcXCIpXCIpXG4gICAgICA6IHN5bWJvbCArIG5hbWUgLy8gbWFyayB0aGUgZXZlbnQgYXMgY2FwdHVyZWRcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZEhhbmRsZXIgKFxuICAgIGVsLFxuICAgIG5hbWUsXG4gICAgdmFsdWUsXG4gICAgbW9kaWZpZXJzLFxuICAgIGltcG9ydGFudCxcbiAgICB3YXJuLFxuICAgIHJhbmdlLFxuICAgIGR5bmFtaWNcbiAgKSB7XG4gICAgbW9kaWZpZXJzID0gbW9kaWZpZXJzIHx8IGVtcHR5T2JqZWN0O1xuICAgIC8vIHdhcm4gcHJldmVudCBhbmQgcGFzc2l2ZSBtb2RpZmllclxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmIChcbiAgICAgIHdhcm4gJiZcbiAgICAgIG1vZGlmaWVycy5wcmV2ZW50ICYmIG1vZGlmaWVycy5wYXNzaXZlXG4gICAgKSB7XG4gICAgICB3YXJuKFxuICAgICAgICAncGFzc2l2ZSBhbmQgcHJldmVudCBjYW5cXCd0IGJlIHVzZWQgdG9nZXRoZXIuICcgK1xuICAgICAgICAnUGFzc2l2ZSBoYW5kbGVyIGNhblxcJ3QgcHJldmVudCBkZWZhdWx0IGV2ZW50LicsXG4gICAgICAgIHJhbmdlXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIG5vcm1hbGl6ZSBjbGljay5yaWdodCBhbmQgY2xpY2subWlkZGxlIHNpbmNlIHRoZXkgZG9uJ3QgYWN0dWFsbHkgZmlyZVxuICAgIC8vIHRoaXMgaXMgdGVjaG5pY2FsbHkgYnJvd3Nlci1zcGVjaWZpYywgYnV0IGF0IGxlYXN0IGZvciBub3cgYnJvd3NlcnMgYXJlXG4gICAgLy8gdGhlIG9ubHkgdGFyZ2V0IGVudnMgdGhhdCBoYXZlIHJpZ2h0L21pZGRsZSBjbGlja3MuXG4gICAgaWYgKG1vZGlmaWVycy5yaWdodCkge1xuICAgICAgaWYgKGR5bmFtaWMpIHtcbiAgICAgICAgbmFtZSA9IFwiKFwiICsgbmFtZSArIFwiKT09PSdjbGljayc/J2NvbnRleHRtZW51JzooXCIgKyBuYW1lICsgXCIpXCI7XG4gICAgICB9IGVsc2UgaWYgKG5hbWUgPT09ICdjbGljaycpIHtcbiAgICAgICAgbmFtZSA9ICdjb250ZXh0bWVudSc7XG4gICAgICAgIGRlbGV0ZSBtb2RpZmllcnMucmlnaHQ7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChtb2RpZmllcnMubWlkZGxlKSB7XG4gICAgICBpZiAoZHluYW1pYykge1xuICAgICAgICBuYW1lID0gXCIoXCIgKyBuYW1lICsgXCIpPT09J2NsaWNrJz8nbW91c2V1cCc6KFwiICsgbmFtZSArIFwiKVwiO1xuICAgICAgfSBlbHNlIGlmIChuYW1lID09PSAnY2xpY2snKSB7XG4gICAgICAgIG5hbWUgPSAnbW91c2V1cCc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgY2FwdHVyZSBtb2RpZmllclxuICAgIGlmIChtb2RpZmllcnMuY2FwdHVyZSkge1xuICAgICAgZGVsZXRlIG1vZGlmaWVycy5jYXB0dXJlO1xuICAgICAgbmFtZSA9IHByZXBlbmRNb2RpZmllck1hcmtlcignIScsIG5hbWUsIGR5bmFtaWMpO1xuICAgIH1cbiAgICBpZiAobW9kaWZpZXJzLm9uY2UpIHtcbiAgICAgIGRlbGV0ZSBtb2RpZmllcnMub25jZTtcbiAgICAgIG5hbWUgPSBwcmVwZW5kTW9kaWZpZXJNYXJrZXIoJ34nLCBuYW1lLCBkeW5hbWljKTtcbiAgICB9XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKG1vZGlmaWVycy5wYXNzaXZlKSB7XG4gICAgICBkZWxldGUgbW9kaWZpZXJzLnBhc3NpdmU7XG4gICAgICBuYW1lID0gcHJlcGVuZE1vZGlmaWVyTWFya2VyKCcmJywgbmFtZSwgZHluYW1pYyk7XG4gICAgfVxuXG4gICAgdmFyIGV2ZW50cztcbiAgICBpZiAobW9kaWZpZXJzLm5hdGl2ZSkge1xuICAgICAgZGVsZXRlIG1vZGlmaWVycy5uYXRpdmU7XG4gICAgICBldmVudHMgPSBlbC5uYXRpdmVFdmVudHMgfHwgKGVsLm5hdGl2ZUV2ZW50cyA9IHt9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnRzID0gZWwuZXZlbnRzIHx8IChlbC5ldmVudHMgPSB7fSk7XG4gICAgfVxuXG4gICAgdmFyIG5ld0hhbmRsZXIgPSByYW5nZVNldEl0ZW0oeyB2YWx1ZTogdmFsdWUudHJpbSgpLCBkeW5hbWljOiBkeW5hbWljIH0sIHJhbmdlKTtcbiAgICBpZiAobW9kaWZpZXJzICE9PSBlbXB0eU9iamVjdCkge1xuICAgICAgbmV3SGFuZGxlci5tb2RpZmllcnMgPSBtb2RpZmllcnM7XG4gICAgfVxuXG4gICAgdmFyIGhhbmRsZXJzID0gZXZlbnRzW25hbWVdO1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmIChBcnJheS5pc0FycmF5KGhhbmRsZXJzKSkge1xuICAgICAgaW1wb3J0YW50ID8gaGFuZGxlcnMudW5zaGlmdChuZXdIYW5kbGVyKSA6IGhhbmRsZXJzLnB1c2gobmV3SGFuZGxlcik7XG4gICAgfSBlbHNlIGlmIChoYW5kbGVycykge1xuICAgICAgZXZlbnRzW25hbWVdID0gaW1wb3J0YW50ID8gW25ld0hhbmRsZXIsIGhhbmRsZXJzXSA6IFtoYW5kbGVycywgbmV3SGFuZGxlcl07XG4gICAgfSBlbHNlIHtcbiAgICAgIGV2ZW50c1tuYW1lXSA9IG5ld0hhbmRsZXI7XG4gICAgfVxuXG4gICAgZWwucGxhaW4gPSBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFJhd0JpbmRpbmdBdHRyIChcbiAgICBlbCxcbiAgICBuYW1lXG4gICkge1xuICAgIHJldHVybiBlbC5yYXdBdHRyc01hcFsnOicgKyBuYW1lXSB8fFxuICAgICAgZWwucmF3QXR0cnNNYXBbJ3YtYmluZDonICsgbmFtZV0gfHxcbiAgICAgIGVsLnJhd0F0dHJzTWFwW25hbWVdXG4gIH1cblxuICBmdW5jdGlvbiBnZXRCaW5kaW5nQXR0ciAoXG4gICAgZWwsXG4gICAgbmFtZSxcbiAgICBnZXRTdGF0aWNcbiAgKSB7XG4gICAgdmFyIGR5bmFtaWNWYWx1ZSA9XG4gICAgICBnZXRBbmRSZW1vdmVBdHRyKGVsLCAnOicgKyBuYW1lKSB8fFxuICAgICAgZ2V0QW5kUmVtb3ZlQXR0cihlbCwgJ3YtYmluZDonICsgbmFtZSk7XG4gICAgaWYgKGR5bmFtaWNWYWx1ZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gcGFyc2VGaWx0ZXJzKGR5bmFtaWNWYWx1ZSlcbiAgICB9IGVsc2UgaWYgKGdldFN0YXRpYyAhPT0gZmFsc2UpIHtcbiAgICAgIHZhciBzdGF0aWNWYWx1ZSA9IGdldEFuZFJlbW92ZUF0dHIoZWwsIG5hbWUpO1xuICAgICAgaWYgKHN0YXRpY1ZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHN0YXRpY1ZhbHVlKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIG5vdGU6IHRoaXMgb25seSByZW1vdmVzIHRoZSBhdHRyIGZyb20gdGhlIEFycmF5IChhdHRyc0xpc3QpIHNvIHRoYXQgaXRcbiAgLy8gZG9lc24ndCBnZXQgcHJvY2Vzc2VkIGJ5IHByb2Nlc3NBdHRycy5cbiAgLy8gQnkgZGVmYXVsdCBpdCBkb2VzIE5PVCByZW1vdmUgaXQgZnJvbSB0aGUgbWFwIChhdHRyc01hcCkgYmVjYXVzZSB0aGUgbWFwIGlzXG4gIC8vIG5lZWRlZCBkdXJpbmcgY29kZWdlbi5cbiAgZnVuY3Rpb24gZ2V0QW5kUmVtb3ZlQXR0ciAoXG4gICAgZWwsXG4gICAgbmFtZSxcbiAgICByZW1vdmVGcm9tTWFwXG4gICkge1xuICAgIHZhciB2YWw7XG4gICAgaWYgKCh2YWwgPSBlbC5hdHRyc01hcFtuYW1lXSkgIT0gbnVsbCkge1xuICAgICAgdmFyIGxpc3QgPSBlbC5hdHRyc0xpc3Q7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChsaXN0W2ldLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICBsaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChyZW1vdmVGcm9tTWFwKSB7XG4gICAgICBkZWxldGUgZWwuYXR0cnNNYXBbbmFtZV07XG4gICAgfVxuICAgIHJldHVybiB2YWxcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEFuZFJlbW92ZUF0dHJCeVJlZ2V4IChcbiAgICBlbCxcbiAgICBuYW1lXG4gICkge1xuICAgIHZhciBsaXN0ID0gZWwuYXR0cnNMaXN0O1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBhdHRyID0gbGlzdFtpXTtcbiAgICAgIGlmIChuYW1lLnRlc3QoYXR0ci5uYW1lKSkge1xuICAgICAgICBsaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgcmV0dXJuIGF0dHJcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByYW5nZVNldEl0ZW0gKFxuICAgIGl0ZW0sXG4gICAgcmFuZ2VcbiAgKSB7XG4gICAgaWYgKHJhbmdlKSB7XG4gICAgICBpZiAocmFuZ2Uuc3RhcnQgIT0gbnVsbCkge1xuICAgICAgICBpdGVtLnN0YXJ0ID0gcmFuZ2Uuc3RhcnQ7XG4gICAgICB9XG4gICAgICBpZiAocmFuZ2UuZW5kICE9IG51bGwpIHtcbiAgICAgICAgaXRlbS5lbmQgPSByYW5nZS5lbmQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpdGVtXG4gIH1cblxuICAvKiAgKi9cblxuICAvKipcbiAgICogQ3Jvc3MtcGxhdGZvcm0gY29kZSBnZW5lcmF0aW9uIGZvciBjb21wb25lbnQgdi1tb2RlbFxuICAgKi9cbiAgZnVuY3Rpb24gZ2VuQ29tcG9uZW50TW9kZWwgKFxuICAgIGVsLFxuICAgIHZhbHVlLFxuICAgIG1vZGlmaWVyc1xuICApIHtcbiAgICB2YXIgcmVmID0gbW9kaWZpZXJzIHx8IHt9O1xuICAgIHZhciBudW1iZXIgPSByZWYubnVtYmVyO1xuICAgIHZhciB0cmltID0gcmVmLnRyaW07XG5cbiAgICB2YXIgYmFzZVZhbHVlRXhwcmVzc2lvbiA9ICckJHYnO1xuICAgIHZhciB2YWx1ZUV4cHJlc3Npb24gPSBiYXNlVmFsdWVFeHByZXNzaW9uO1xuICAgIGlmICh0cmltKSB7XG4gICAgICB2YWx1ZUV4cHJlc3Npb24gPVxuICAgICAgICBcIih0eXBlb2YgXCIgKyBiYXNlVmFsdWVFeHByZXNzaW9uICsgXCIgPT09ICdzdHJpbmcnXCIgK1xuICAgICAgICBcIj8gXCIgKyBiYXNlVmFsdWVFeHByZXNzaW9uICsgXCIudHJpbSgpXCIgK1xuICAgICAgICBcIjogXCIgKyBiYXNlVmFsdWVFeHByZXNzaW9uICsgXCIpXCI7XG4gICAgfVxuICAgIGlmIChudW1iZXIpIHtcbiAgICAgIHZhbHVlRXhwcmVzc2lvbiA9IFwiX24oXCIgKyB2YWx1ZUV4cHJlc3Npb24gKyBcIilcIjtcbiAgICB9XG4gICAgdmFyIGFzc2lnbm1lbnQgPSBnZW5Bc3NpZ25tZW50Q29kZSh2YWx1ZSwgdmFsdWVFeHByZXNzaW9uKTtcblxuICAgIGVsLm1vZGVsID0ge1xuICAgICAgdmFsdWU6IChcIihcIiArIHZhbHVlICsgXCIpXCIpLFxuICAgICAgZXhwcmVzc2lvbjogSlNPTi5zdHJpbmdpZnkodmFsdWUpLFxuICAgICAgY2FsbGJhY2s6IChcImZ1bmN0aW9uIChcIiArIGJhc2VWYWx1ZUV4cHJlc3Npb24gKyBcIikge1wiICsgYXNzaWdubWVudCArIFwifVwiKVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ3Jvc3MtcGxhdGZvcm0gY29kZWdlbiBoZWxwZXIgZm9yIGdlbmVyYXRpbmcgdi1tb2RlbCB2YWx1ZSBhc3NpZ25tZW50IGNvZGUuXG4gICAqL1xuICBmdW5jdGlvbiBnZW5Bc3NpZ25tZW50Q29kZSAoXG4gICAgdmFsdWUsXG4gICAgYXNzaWdubWVudFxuICApIHtcbiAgICB2YXIgcmVzID0gcGFyc2VNb2RlbCh2YWx1ZSk7XG4gICAgaWYgKHJlcy5rZXkgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiAodmFsdWUgKyBcIj1cIiArIGFzc2lnbm1lbnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAoXCIkc2V0KFwiICsgKHJlcy5leHApICsgXCIsIFwiICsgKHJlcy5rZXkpICsgXCIsIFwiICsgYXNzaWdubWVudCArIFwiKVwiKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBhIHYtbW9kZWwgZXhwcmVzc2lvbiBpbnRvIGEgYmFzZSBwYXRoIGFuZCBhIGZpbmFsIGtleSBzZWdtZW50LlxuICAgKiBIYW5kbGVzIGJvdGggZG90LXBhdGggYW5kIHBvc3NpYmxlIHNxdWFyZSBicmFja2V0cy5cbiAgICpcbiAgICogUG9zc2libGUgY2FzZXM6XG4gICAqXG4gICAqIC0gdGVzdFxuICAgKiAtIHRlc3Rba2V5XVxuICAgKiAtIHRlc3RbdGVzdDFba2V5XV1cbiAgICogLSB0ZXN0W1wiYVwiXVtrZXldXG4gICAqIC0geHh4LnRlc3RbYVthXS50ZXN0MVtrZXldXVxuICAgKiAtIHRlc3QueHh4LmFbXCJhc2FcIl1bdGVzdDFba2V5XV1cbiAgICpcbiAgICovXG5cbiAgdmFyIGxlbiwgc3RyLCBjaHIsIGluZGV4JDEsIGV4cHJlc3Npb25Qb3MsIGV4cHJlc3Npb25FbmRQb3M7XG5cblxuXG4gIGZ1bmN0aW9uIHBhcnNlTW9kZWwgKHZhbCkge1xuICAgIC8vIEZpeCBodHRwczovL2dpdGh1Yi5jb20vdnVlanMvdnVlL3B1bGwvNzczMFxuICAgIC8vIGFsbG93IHYtbW9kZWw9XCJvYmoudmFsIFwiICh0cmFpbGluZyB3aGl0ZXNwYWNlKVxuICAgIHZhbCA9IHZhbC50cmltKCk7XG4gICAgbGVuID0gdmFsLmxlbmd0aDtcblxuICAgIGlmICh2YWwuaW5kZXhPZignWycpIDwgMCB8fCB2YWwubGFzdEluZGV4T2YoJ10nKSA8IGxlbiAtIDEpIHtcbiAgICAgIGluZGV4JDEgPSB2YWwubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgIGlmIChpbmRleCQxID4gLTEpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBleHA6IHZhbC5zbGljZSgwLCBpbmRleCQxKSxcbiAgICAgICAgICBrZXk6ICdcIicgKyB2YWwuc2xpY2UoaW5kZXgkMSArIDEpICsgJ1wiJ1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGV4cDogdmFsLFxuICAgICAgICAgIGtleTogbnVsbFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RyID0gdmFsO1xuICAgIGluZGV4JDEgPSBleHByZXNzaW9uUG9zID0gZXhwcmVzc2lvbkVuZFBvcyA9IDA7XG5cbiAgICB3aGlsZSAoIWVvZigpKSB7XG4gICAgICBjaHIgPSBuZXh0KCk7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmIChpc1N0cmluZ1N0YXJ0KGNocikpIHtcbiAgICAgICAgcGFyc2VTdHJpbmcoY2hyKTtcbiAgICAgIH0gZWxzZSBpZiAoY2hyID09PSAweDVCKSB7XG4gICAgICAgIHBhcnNlQnJhY2tldChjaHIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBleHA6IHZhbC5zbGljZSgwLCBleHByZXNzaW9uUG9zKSxcbiAgICAgIGtleTogdmFsLnNsaWNlKGV4cHJlc3Npb25Qb3MgKyAxLCBleHByZXNzaW9uRW5kUG9zKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG5leHQgKCkge1xuICAgIHJldHVybiBzdHIuY2hhckNvZGVBdCgrK2luZGV4JDEpXG4gIH1cblxuICBmdW5jdGlvbiBlb2YgKCkge1xuICAgIHJldHVybiBpbmRleCQxID49IGxlblxuICB9XG5cbiAgZnVuY3Rpb24gaXNTdHJpbmdTdGFydCAoY2hyKSB7XG4gICAgcmV0dXJuIGNociA9PT0gMHgyMiB8fCBjaHIgPT09IDB4MjdcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlQnJhY2tldCAoY2hyKSB7XG4gICAgdmFyIGluQnJhY2tldCA9IDE7XG4gICAgZXhwcmVzc2lvblBvcyA9IGluZGV4JDE7XG4gICAgd2hpbGUgKCFlb2YoKSkge1xuICAgICAgY2hyID0gbmV4dCgpO1xuICAgICAgaWYgKGlzU3RyaW5nU3RhcnQoY2hyKSkge1xuICAgICAgICBwYXJzZVN0cmluZyhjaHIpO1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgaWYgKGNociA9PT0gMHg1QikgeyBpbkJyYWNrZXQrKzsgfVxuICAgICAgaWYgKGNociA9PT0gMHg1RCkgeyBpbkJyYWNrZXQtLTsgfVxuICAgICAgaWYgKGluQnJhY2tldCA9PT0gMCkge1xuICAgICAgICBleHByZXNzaW9uRW5kUG9zID0gaW5kZXgkMTtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVN0cmluZyAoY2hyKSB7XG4gICAgdmFyIHN0cmluZ1F1b3RlID0gY2hyO1xuICAgIHdoaWxlICghZW9mKCkpIHtcbiAgICAgIGNociA9IG5leHQoKTtcbiAgICAgIGlmIChjaHIgPT09IHN0cmluZ1F1b3RlKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyogICovXG5cbiAgdmFyIHdhcm4kMTtcblxuICAvLyBpbiBzb21lIGNhc2VzLCB0aGUgZXZlbnQgdXNlZCBoYXMgdG8gYmUgZGV0ZXJtaW5lZCBhdCBydW50aW1lXG4gIC8vIHNvIHdlIHVzZWQgc29tZSByZXNlcnZlZCB0b2tlbnMgZHVyaW5nIGNvbXBpbGUuXG4gIHZhciBSQU5HRV9UT0tFTiA9ICdfX3InO1xuICB2YXIgQ0hFQ0tCT1hfUkFESU9fVE9LRU4gPSAnX19jJztcblxuICBmdW5jdGlvbiBtb2RlbCAoXG4gICAgZWwsXG4gICAgZGlyLFxuICAgIF93YXJuXG4gICkge1xuICAgIHdhcm4kMSA9IF93YXJuO1xuICAgIHZhciB2YWx1ZSA9IGRpci52YWx1ZTtcbiAgICB2YXIgbW9kaWZpZXJzID0gZGlyLm1vZGlmaWVycztcbiAgICB2YXIgdGFnID0gZWwudGFnO1xuICAgIHZhciB0eXBlID0gZWwuYXR0cnNNYXAudHlwZTtcblxuICAgIHtcbiAgICAgIC8vIGlucHV0cyB3aXRoIHR5cGU9XCJmaWxlXCIgYXJlIHJlYWQgb25seSBhbmQgc2V0dGluZyB0aGUgaW5wdXQnc1xuICAgICAgLy8gdmFsdWUgd2lsbCB0aHJvdyBhbiBlcnJvci5cbiAgICAgIGlmICh0YWcgPT09ICdpbnB1dCcgJiYgdHlwZSA9PT0gJ2ZpbGUnKSB7XG4gICAgICAgIHdhcm4kMShcbiAgICAgICAgICBcIjxcIiArIChlbC50YWcpICsgXCIgdi1tb2RlbD1cXFwiXCIgKyB2YWx1ZSArIFwiXFxcIiB0eXBlPVxcXCJmaWxlXFxcIj46XFxuXCIgK1xuICAgICAgICAgIFwiRmlsZSBpbnB1dHMgYXJlIHJlYWQgb25seS4gVXNlIGEgdi1vbjpjaGFuZ2UgbGlzdGVuZXIgaW5zdGVhZC5cIixcbiAgICAgICAgICBlbC5yYXdBdHRyc01hcFsndi1tb2RlbCddXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVsLmNvbXBvbmVudCkge1xuICAgICAgZ2VuQ29tcG9uZW50TW9kZWwoZWwsIHZhbHVlLCBtb2RpZmllcnMpO1xuICAgICAgLy8gY29tcG9uZW50IHYtbW9kZWwgZG9lc24ndCBuZWVkIGV4dHJhIHJ1bnRpbWVcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0gZWxzZSBpZiAodGFnID09PSAnc2VsZWN0Jykge1xuICAgICAgZ2VuU2VsZWN0KGVsLCB2YWx1ZSwgbW9kaWZpZXJzKTtcbiAgICB9IGVsc2UgaWYgKHRhZyA9PT0gJ2lucHV0JyAmJiB0eXBlID09PSAnY2hlY2tib3gnKSB7XG4gICAgICBnZW5DaGVja2JveE1vZGVsKGVsLCB2YWx1ZSwgbW9kaWZpZXJzKTtcbiAgICB9IGVsc2UgaWYgKHRhZyA9PT0gJ2lucHV0JyAmJiB0eXBlID09PSAncmFkaW8nKSB7XG4gICAgICBnZW5SYWRpb01vZGVsKGVsLCB2YWx1ZSwgbW9kaWZpZXJzKTtcbiAgICB9IGVsc2UgaWYgKHRhZyA9PT0gJ2lucHV0JyB8fCB0YWcgPT09ICd0ZXh0YXJlYScpIHtcbiAgICAgIGdlbkRlZmF1bHRNb2RlbChlbCwgdmFsdWUsIG1vZGlmaWVycyk7XG4gICAgfSBlbHNlIGlmICghY29uZmlnLmlzUmVzZXJ2ZWRUYWcodGFnKSkge1xuICAgICAgZ2VuQ29tcG9uZW50TW9kZWwoZWwsIHZhbHVlLCBtb2RpZmllcnMpO1xuICAgICAgLy8gY29tcG9uZW50IHYtbW9kZWwgZG9lc24ndCBuZWVkIGV4dHJhIHJ1bnRpbWVcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0gZWxzZSB7XG4gICAgICB3YXJuJDEoXG4gICAgICAgIFwiPFwiICsgKGVsLnRhZykgKyBcIiB2LW1vZGVsPVxcXCJcIiArIHZhbHVlICsgXCJcXFwiPjogXCIgK1xuICAgICAgICBcInYtbW9kZWwgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGlzIGVsZW1lbnQgdHlwZS4gXCIgK1xuICAgICAgICAnSWYgeW91IGFyZSB3b3JraW5nIHdpdGggY29udGVudGVkaXRhYmxlLCBpdFxcJ3MgcmVjb21tZW5kZWQgdG8gJyArXG4gICAgICAgICd3cmFwIGEgbGlicmFyeSBkZWRpY2F0ZWQgZm9yIHRoYXQgcHVycG9zZSBpbnNpZGUgYSBjdXN0b20gY29tcG9uZW50LicsXG4gICAgICAgIGVsLnJhd0F0dHJzTWFwWyd2LW1vZGVsJ11cbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gZW5zdXJlIHJ1bnRpbWUgZGlyZWN0aXZlIG1ldGFkYXRhXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbkNoZWNrYm94TW9kZWwgKFxuICAgIGVsLFxuICAgIHZhbHVlLFxuICAgIG1vZGlmaWVyc1xuICApIHtcbiAgICB2YXIgbnVtYmVyID0gbW9kaWZpZXJzICYmIG1vZGlmaWVycy5udW1iZXI7XG4gICAgdmFyIHZhbHVlQmluZGluZyA9IGdldEJpbmRpbmdBdHRyKGVsLCAndmFsdWUnKSB8fCAnbnVsbCc7XG4gICAgdmFyIHRydWVWYWx1ZUJpbmRpbmcgPSBnZXRCaW5kaW5nQXR0cihlbCwgJ3RydWUtdmFsdWUnKSB8fCAndHJ1ZSc7XG4gICAgdmFyIGZhbHNlVmFsdWVCaW5kaW5nID0gZ2V0QmluZGluZ0F0dHIoZWwsICdmYWxzZS12YWx1ZScpIHx8ICdmYWxzZSc7XG4gICAgYWRkUHJvcChlbCwgJ2NoZWNrZWQnLFxuICAgICAgXCJBcnJheS5pc0FycmF5KFwiICsgdmFsdWUgKyBcIilcIiArXG4gICAgICBcIj9faShcIiArIHZhbHVlICsgXCIsXCIgKyB2YWx1ZUJpbmRpbmcgKyBcIik+LTFcIiArIChcbiAgICAgICAgdHJ1ZVZhbHVlQmluZGluZyA9PT0gJ3RydWUnXG4gICAgICAgICAgPyAoXCI6KFwiICsgdmFsdWUgKyBcIilcIilcbiAgICAgICAgICA6IChcIjpfcShcIiArIHZhbHVlICsgXCIsXCIgKyB0cnVlVmFsdWVCaW5kaW5nICsgXCIpXCIpXG4gICAgICApXG4gICAgKTtcbiAgICBhZGRIYW5kbGVyKGVsLCAnY2hhbmdlJyxcbiAgICAgIFwidmFyICQkYT1cIiArIHZhbHVlICsgXCIsXCIgK1xuICAgICAgICAgICckJGVsPSRldmVudC50YXJnZXQsJyArXG4gICAgICAgICAgXCIkJGM9JCRlbC5jaGVja2VkPyhcIiArIHRydWVWYWx1ZUJpbmRpbmcgKyBcIik6KFwiICsgZmFsc2VWYWx1ZUJpbmRpbmcgKyBcIik7XCIgK1xuICAgICAgJ2lmKEFycmF5LmlzQXJyYXkoJCRhKSl7JyArXG4gICAgICAgIFwidmFyICQkdj1cIiArIChudW1iZXIgPyAnX24oJyArIHZhbHVlQmluZGluZyArICcpJyA6IHZhbHVlQmluZGluZykgKyBcIixcIiArXG4gICAgICAgICAgICAnJCRpPV9pKCQkYSwkJHYpOycgK1xuICAgICAgICBcImlmKCQkZWwuY2hlY2tlZCl7JCRpPDAmJihcIiArIChnZW5Bc3NpZ25tZW50Q29kZSh2YWx1ZSwgJyQkYS5jb25jYXQoWyQkdl0pJykpICsgXCIpfVwiICtcbiAgICAgICAgXCJlbHNleyQkaT4tMSYmKFwiICsgKGdlbkFzc2lnbm1lbnRDb2RlKHZhbHVlLCAnJCRhLnNsaWNlKDAsJCRpKS5jb25jYXQoJCRhLnNsaWNlKCQkaSsxKSknKSkgKyBcIil9XCIgK1xuICAgICAgXCJ9ZWxzZXtcIiArIChnZW5Bc3NpZ25tZW50Q29kZSh2YWx1ZSwgJyQkYycpKSArIFwifVwiLFxuICAgICAgbnVsbCwgdHJ1ZVxuICAgICk7XG4gIH1cblxuICBmdW5jdGlvbiBnZW5SYWRpb01vZGVsIChcbiAgICBlbCxcbiAgICB2YWx1ZSxcbiAgICBtb2RpZmllcnNcbiAgKSB7XG4gICAgdmFyIG51bWJlciA9IG1vZGlmaWVycyAmJiBtb2RpZmllcnMubnVtYmVyO1xuICAgIHZhciB2YWx1ZUJpbmRpbmcgPSBnZXRCaW5kaW5nQXR0cihlbCwgJ3ZhbHVlJykgfHwgJ251bGwnO1xuICAgIHZhbHVlQmluZGluZyA9IG51bWJlciA/IChcIl9uKFwiICsgdmFsdWVCaW5kaW5nICsgXCIpXCIpIDogdmFsdWVCaW5kaW5nO1xuICAgIGFkZFByb3AoZWwsICdjaGVja2VkJywgKFwiX3EoXCIgKyB2YWx1ZSArIFwiLFwiICsgdmFsdWVCaW5kaW5nICsgXCIpXCIpKTtcbiAgICBhZGRIYW5kbGVyKGVsLCAnY2hhbmdlJywgZ2VuQXNzaWdubWVudENvZGUodmFsdWUsIHZhbHVlQmluZGluZyksIG51bGwsIHRydWUpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuU2VsZWN0IChcbiAgICBlbCxcbiAgICB2YWx1ZSxcbiAgICBtb2RpZmllcnNcbiAgKSB7XG4gICAgdmFyIG51bWJlciA9IG1vZGlmaWVycyAmJiBtb2RpZmllcnMubnVtYmVyO1xuICAgIHZhciBzZWxlY3RlZFZhbCA9IFwiQXJyYXkucHJvdG90eXBlLmZpbHRlclwiICtcbiAgICAgIFwiLmNhbGwoJGV2ZW50LnRhcmdldC5vcHRpb25zLGZ1bmN0aW9uKG8pe3JldHVybiBvLnNlbGVjdGVkfSlcIiArXG4gICAgICBcIi5tYXAoZnVuY3Rpb24obyl7dmFyIHZhbCA9IFxcXCJfdmFsdWVcXFwiIGluIG8gPyBvLl92YWx1ZSA6IG8udmFsdWU7XCIgK1xuICAgICAgXCJyZXR1cm4gXCIgKyAobnVtYmVyID8gJ19uKHZhbCknIDogJ3ZhbCcpICsgXCJ9KVwiO1xuXG4gICAgdmFyIGFzc2lnbm1lbnQgPSAnJGV2ZW50LnRhcmdldC5tdWx0aXBsZSA/ICQkc2VsZWN0ZWRWYWwgOiAkJHNlbGVjdGVkVmFsWzBdJztcbiAgICB2YXIgY29kZSA9IFwidmFyICQkc2VsZWN0ZWRWYWwgPSBcIiArIHNlbGVjdGVkVmFsICsgXCI7XCI7XG4gICAgY29kZSA9IGNvZGUgKyBcIiBcIiArIChnZW5Bc3NpZ25tZW50Q29kZSh2YWx1ZSwgYXNzaWdubWVudCkpO1xuICAgIGFkZEhhbmRsZXIoZWwsICdjaGFuZ2UnLCBjb2RlLCBudWxsLCB0cnVlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbkRlZmF1bHRNb2RlbCAoXG4gICAgZWwsXG4gICAgdmFsdWUsXG4gICAgbW9kaWZpZXJzXG4gICkge1xuICAgIHZhciB0eXBlID0gZWwuYXR0cnNNYXAudHlwZTtcblxuICAgIC8vIHdhcm4gaWYgdi1iaW5kOnZhbHVlIGNvbmZsaWN0cyB3aXRoIHYtbW9kZWxcbiAgICAvLyBleGNlcHQgZm9yIGlucHV0cyB3aXRoIHYtYmluZDp0eXBlXG4gICAge1xuICAgICAgdmFyIHZhbHVlJDEgPSBlbC5hdHRyc01hcFsndi1iaW5kOnZhbHVlJ10gfHwgZWwuYXR0cnNNYXBbJzp2YWx1ZSddO1xuICAgICAgdmFyIHR5cGVCaW5kaW5nID0gZWwuYXR0cnNNYXBbJ3YtYmluZDp0eXBlJ10gfHwgZWwuYXR0cnNNYXBbJzp0eXBlJ107XG4gICAgICBpZiAodmFsdWUkMSAmJiAhdHlwZUJpbmRpbmcpIHtcbiAgICAgICAgdmFyIGJpbmRpbmcgPSBlbC5hdHRyc01hcFsndi1iaW5kOnZhbHVlJ10gPyAndi1iaW5kOnZhbHVlJyA6ICc6dmFsdWUnO1xuICAgICAgICB3YXJuJDEoXG4gICAgICAgICAgYmluZGluZyArIFwiPVxcXCJcIiArIHZhbHVlJDEgKyBcIlxcXCIgY29uZmxpY3RzIHdpdGggdi1tb2RlbCBvbiB0aGUgc2FtZSBlbGVtZW50IFwiICtcbiAgICAgICAgICAnYmVjYXVzZSB0aGUgbGF0dGVyIGFscmVhZHkgZXhwYW5kcyB0byBhIHZhbHVlIGJpbmRpbmcgaW50ZXJuYWxseScsXG4gICAgICAgICAgZWwucmF3QXR0cnNNYXBbYmluZGluZ11cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcmVmID0gbW9kaWZpZXJzIHx8IHt9O1xuICAgIHZhciBsYXp5ID0gcmVmLmxhenk7XG4gICAgdmFyIG51bWJlciA9IHJlZi5udW1iZXI7XG4gICAgdmFyIHRyaW0gPSByZWYudHJpbTtcbiAgICB2YXIgbmVlZENvbXBvc2l0aW9uR3VhcmQgPSAhbGF6eSAmJiB0eXBlICE9PSAncmFuZ2UnO1xuICAgIHZhciBldmVudCA9IGxhenlcbiAgICAgID8gJ2NoYW5nZSdcbiAgICAgIDogdHlwZSA9PT0gJ3JhbmdlJ1xuICAgICAgICA/IFJBTkdFX1RPS0VOXG4gICAgICAgIDogJ2lucHV0JztcblxuICAgIHZhciB2YWx1ZUV4cHJlc3Npb24gPSAnJGV2ZW50LnRhcmdldC52YWx1ZSc7XG4gICAgaWYgKHRyaW0pIHtcbiAgICAgIHZhbHVlRXhwcmVzc2lvbiA9IFwiJGV2ZW50LnRhcmdldC52YWx1ZS50cmltKClcIjtcbiAgICB9XG4gICAgaWYgKG51bWJlcikge1xuICAgICAgdmFsdWVFeHByZXNzaW9uID0gXCJfbihcIiArIHZhbHVlRXhwcmVzc2lvbiArIFwiKVwiO1xuICAgIH1cblxuICAgIHZhciBjb2RlID0gZ2VuQXNzaWdubWVudENvZGUodmFsdWUsIHZhbHVlRXhwcmVzc2lvbik7XG4gICAgaWYgKG5lZWRDb21wb3NpdGlvbkd1YXJkKSB7XG4gICAgICBjb2RlID0gXCJpZigkZXZlbnQudGFyZ2V0LmNvbXBvc2luZylyZXR1cm47XCIgKyBjb2RlO1xuICAgIH1cblxuICAgIGFkZFByb3AoZWwsICd2YWx1ZScsIChcIihcIiArIHZhbHVlICsgXCIpXCIpKTtcbiAgICBhZGRIYW5kbGVyKGVsLCBldmVudCwgY29kZSwgbnVsbCwgdHJ1ZSk7XG4gICAgaWYgKHRyaW0gfHwgbnVtYmVyKSB7XG4gICAgICBhZGRIYW5kbGVyKGVsLCAnYmx1cicsICckZm9yY2VVcGRhdGUoKScpO1xuICAgIH1cbiAgfVxuXG4gIC8qICAqL1xuXG4gIC8vIG5vcm1hbGl6ZSB2LW1vZGVsIGV2ZW50IHRva2VucyB0aGF0IGNhbiBvbmx5IGJlIGRldGVybWluZWQgYXQgcnVudGltZS5cbiAgLy8gaXQncyBpbXBvcnRhbnQgdG8gcGxhY2UgdGhlIGV2ZW50IGFzIHRoZSBmaXJzdCBpbiB0aGUgYXJyYXkgYmVjYXVzZVxuICAvLyB0aGUgd2hvbGUgcG9pbnQgaXMgZW5zdXJpbmcgdGhlIHYtbW9kZWwgY2FsbGJhY2sgZ2V0cyBjYWxsZWQgYmVmb3JlXG4gIC8vIHVzZXItYXR0YWNoZWQgaGFuZGxlcnMuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZUV2ZW50cyAob24pIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoaXNEZWYob25bUkFOR0VfVE9LRU5dKSkge1xuICAgICAgLy8gSUUgaW5wdXRbdHlwZT1yYW5nZV0gb25seSBzdXBwb3J0cyBgY2hhbmdlYCBldmVudFxuICAgICAgdmFyIGV2ZW50ID0gaXNJRSA/ICdjaGFuZ2UnIDogJ2lucHV0JztcbiAgICAgIG9uW2V2ZW50XSA9IFtdLmNvbmNhdChvbltSQU5HRV9UT0tFTl0sIG9uW2V2ZW50XSB8fCBbXSk7XG4gICAgICBkZWxldGUgb25bUkFOR0VfVE9LRU5dO1xuICAgIH1cbiAgICAvLyBUaGlzIHdhcyBvcmlnaW5hbGx5IGludGVuZGVkIHRvIGZpeCAjNDUyMSBidXQgbm8gbG9uZ2VyIG5lY2Vzc2FyeVxuICAgIC8vIGFmdGVyIDIuNS4gS2VlcGluZyBpdCBmb3IgYmFja3dhcmRzIGNvbXBhdCB3aXRoIGdlbmVyYXRlZCBjb2RlIGZyb20gPCAyLjRcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoaXNEZWYob25bQ0hFQ0tCT1hfUkFESU9fVE9LRU5dKSkge1xuICAgICAgb24uY2hhbmdlID0gW10uY29uY2F0KG9uW0NIRUNLQk9YX1JBRElPX1RPS0VOXSwgb24uY2hhbmdlIHx8IFtdKTtcbiAgICAgIGRlbGV0ZSBvbltDSEVDS0JPWF9SQURJT19UT0tFTl07XG4gICAgfVxuICB9XG5cbiAgdmFyIHRhcmdldCQxO1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZU9uY2VIYW5kbGVyJDEgKGV2ZW50LCBoYW5kbGVyLCBjYXB0dXJlKSB7XG4gICAgdmFyIF90YXJnZXQgPSB0YXJnZXQkMTsgLy8gc2F2ZSBjdXJyZW50IHRhcmdldCBlbGVtZW50IGluIGNsb3N1cmVcbiAgICByZXR1cm4gZnVuY3Rpb24gb25jZUhhbmRsZXIgKCkge1xuICAgICAgdmFyIHJlcyA9IGhhbmRsZXIuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgIGlmIChyZXMgIT09IG51bGwpIHtcbiAgICAgICAgcmVtb3ZlJDIoZXZlbnQsIG9uY2VIYW5kbGVyLCBjYXB0dXJlLCBfdGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyAjOTQ0NjogRmlyZWZveCA8PSA1MyAoaW4gcGFydGljdWxhciwgRVNSIDUyKSBoYXMgaW5jb3JyZWN0IEV2ZW50LnRpbWVTdGFtcFxuICAvLyBpbXBsZW1lbnRhdGlvbiBhbmQgZG9lcyBub3QgZmlyZSBtaWNyb3Rhc2tzIGluIGJldHdlZW4gZXZlbnQgcHJvcGFnYXRpb24sIHNvXG4gIC8vIHNhZmUgdG8gZXhjbHVkZS5cbiAgdmFyIHVzZU1pY3JvdGFza0ZpeCA9IGlzVXNpbmdNaWNyb1Rhc2sgJiYgIShpc0ZGICYmIE51bWJlcihpc0ZGWzFdKSA8PSA1Myk7XG5cbiAgZnVuY3Rpb24gYWRkJDEgKFxuICAgIG5hbWUsXG4gICAgaGFuZGxlcixcbiAgICBjYXB0dXJlLFxuICAgIHBhc3NpdmVcbiAgKSB7XG4gICAgLy8gYXN5bmMgZWRnZSBjYXNlICM2NTY2OiBpbm5lciBjbGljayBldmVudCB0cmlnZ2VycyBwYXRjaCwgZXZlbnQgaGFuZGxlclxuICAgIC8vIGF0dGFjaGVkIHRvIG91dGVyIGVsZW1lbnQgZHVyaW5nIHBhdGNoLCBhbmQgdHJpZ2dlcmVkIGFnYWluLiBUaGlzXG4gICAgLy8gaGFwcGVucyBiZWNhdXNlIGJyb3dzZXJzIGZpcmUgbWljcm90YXNrIHRpY2tzIGJldHdlZW4gZXZlbnQgcHJvcGFnYXRpb24uXG4gICAgLy8gdGhlIHNvbHV0aW9uIGlzIHNpbXBsZTogd2Ugc2F2ZSB0aGUgdGltZXN0YW1wIHdoZW4gYSBoYW5kbGVyIGlzIGF0dGFjaGVkLFxuICAgIC8vIGFuZCB0aGUgaGFuZGxlciB3b3VsZCBvbmx5IGZpcmUgaWYgdGhlIGV2ZW50IHBhc3NlZCB0byBpdCB3YXMgZmlyZWRcbiAgICAvLyBBRlRFUiBpdCB3YXMgYXR0YWNoZWQuXG4gICAgaWYgKHVzZU1pY3JvdGFza0ZpeCkge1xuICAgICAgdmFyIGF0dGFjaGVkVGltZXN0YW1wID0gY3VycmVudEZsdXNoVGltZXN0YW1wO1xuICAgICAgdmFyIG9yaWdpbmFsID0gaGFuZGxlcjtcbiAgICAgIGhhbmRsZXIgPSBvcmlnaW5hbC5fd3JhcHBlciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAvLyBubyBidWJibGluZywgc2hvdWxkIGFsd2F5cyBmaXJlLlxuICAgICAgICAgIC8vIHRoaXMgaXMganVzdCBhIHNhZmV0eSBuZXQgaW4gY2FzZSBldmVudC50aW1lU3RhbXAgaXMgdW5yZWxpYWJsZSBpblxuICAgICAgICAgIC8vIGNlcnRhaW4gd2VpcmQgZW52aXJvbm1lbnRzLi4uXG4gICAgICAgICAgZS50YXJnZXQgPT09IGUuY3VycmVudFRhcmdldCB8fFxuICAgICAgICAgIC8vIGV2ZW50IGlzIGZpcmVkIGFmdGVyIGhhbmRsZXIgYXR0YWNobWVudFxuICAgICAgICAgIGUudGltZVN0YW1wID49IGF0dGFjaGVkVGltZXN0YW1wIHx8XG4gICAgICAgICAgLy8gYmFpbCBmb3IgZW52aXJvbm1lbnRzIHRoYXQgaGF2ZSBidWdneSBldmVudC50aW1lU3RhbXAgaW1wbGVtZW50YXRpb25zXG4gICAgICAgICAgLy8gIzk0NjIgaU9TIDkgYnVnOiBldmVudC50aW1lU3RhbXAgaXMgMCBhZnRlciBoaXN0b3J5LnB1c2hTdGF0ZVxuICAgICAgICAgIC8vICM5NjgxIFF0V2ViRW5naW5lIGV2ZW50LnRpbWVTdGFtcCBpcyBuZWdhdGl2ZSB2YWx1ZVxuICAgICAgICAgIGUudGltZVN0YW1wIDw9IDAgfHxcbiAgICAgICAgICAvLyAjOTQ0OCBiYWlsIGlmIGV2ZW50IGlzIGZpcmVkIGluIGFub3RoZXIgZG9jdW1lbnQgaW4gYSBtdWx0aS1wYWdlXG4gICAgICAgICAgLy8gZWxlY3Ryb24vbncuanMgYXBwLCBzaW5jZSBldmVudC50aW1lU3RhbXAgd2lsbCBiZSB1c2luZyBhIGRpZmZlcmVudFxuICAgICAgICAgIC8vIHN0YXJ0aW5nIHJlZmVyZW5jZVxuICAgICAgICAgIGUudGFyZ2V0Lm93bmVyRG9jdW1lbnQgIT09IGRvY3VtZW50XG4gICAgICAgICkge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5hbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICAgIHRhcmdldCQxLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBuYW1lLFxuICAgICAgaGFuZGxlcixcbiAgICAgIHN1cHBvcnRzUGFzc2l2ZVxuICAgICAgICA/IHsgY2FwdHVyZTogY2FwdHVyZSwgcGFzc2l2ZTogcGFzc2l2ZSB9XG4gICAgICAgIDogY2FwdHVyZVxuICAgICk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmUkMiAoXG4gICAgbmFtZSxcbiAgICBoYW5kbGVyLFxuICAgIGNhcHR1cmUsXG4gICAgX3RhcmdldFxuICApIHtcbiAgICAoX3RhcmdldCB8fCB0YXJnZXQkMSkucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgIG5hbWUsXG4gICAgICBoYW5kbGVyLl93cmFwcGVyIHx8IGhhbmRsZXIsXG4gICAgICBjYXB0dXJlXG4gICAgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZURPTUxpc3RlbmVycyAob2xkVm5vZGUsIHZub2RlKSB7XG4gICAgaWYgKGlzVW5kZWYob2xkVm5vZGUuZGF0YS5vbikgJiYgaXNVbmRlZih2bm9kZS5kYXRhLm9uKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZhciBvbiA9IHZub2RlLmRhdGEub24gfHwge307XG4gICAgdmFyIG9sZE9uID0gb2xkVm5vZGUuZGF0YS5vbiB8fCB7fTtcbiAgICB0YXJnZXQkMSA9IHZub2RlLmVsbTtcbiAgICBub3JtYWxpemVFdmVudHMob24pO1xuICAgIHVwZGF0ZUxpc3RlbmVycyhvbiwgb2xkT24sIGFkZCQxLCByZW1vdmUkMiwgY3JlYXRlT25jZUhhbmRsZXIkMSwgdm5vZGUuY29udGV4dCk7XG4gICAgdGFyZ2V0JDEgPSB1bmRlZmluZWQ7XG4gIH1cblxuICB2YXIgZXZlbnRzID0ge1xuICAgIGNyZWF0ZTogdXBkYXRlRE9NTGlzdGVuZXJzLFxuICAgIHVwZGF0ZTogdXBkYXRlRE9NTGlzdGVuZXJzXG4gIH07XG5cbiAgLyogICovXG5cbiAgdmFyIHN2Z0NvbnRhaW5lcjtcblxuICBmdW5jdGlvbiB1cGRhdGVET01Qcm9wcyAob2xkVm5vZGUsIHZub2RlKSB7XG4gICAgaWYgKGlzVW5kZWYob2xkVm5vZGUuZGF0YS5kb21Qcm9wcykgJiYgaXNVbmRlZih2bm9kZS5kYXRhLmRvbVByb3BzKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZhciBrZXksIGN1cjtcbiAgICB2YXIgZWxtID0gdm5vZGUuZWxtO1xuICAgIHZhciBvbGRQcm9wcyA9IG9sZFZub2RlLmRhdGEuZG9tUHJvcHMgfHwge307XG4gICAgdmFyIHByb3BzID0gdm5vZGUuZGF0YS5kb21Qcm9wcyB8fCB7fTtcbiAgICAvLyBjbG9uZSBvYnNlcnZlZCBvYmplY3RzLCBhcyB0aGUgdXNlciBwcm9iYWJseSB3YW50cyB0byBtdXRhdGUgaXRcbiAgICBpZiAoaXNEZWYocHJvcHMuX19vYl9fKSkge1xuICAgICAgcHJvcHMgPSB2bm9kZS5kYXRhLmRvbVByb3BzID0gZXh0ZW5kKHt9LCBwcm9wcyk7XG4gICAgfVxuXG4gICAgZm9yIChrZXkgaW4gb2xkUHJvcHMpIHtcbiAgICAgIGlmICghKGtleSBpbiBwcm9wcykpIHtcbiAgICAgICAgZWxtW2tleV0gPSAnJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGtleSBpbiBwcm9wcykge1xuICAgICAgY3VyID0gcHJvcHNba2V5XTtcbiAgICAgIC8vIGlnbm9yZSBjaGlsZHJlbiBpZiB0aGUgbm9kZSBoYXMgdGV4dENvbnRlbnQgb3IgaW5uZXJIVE1MLFxuICAgICAgLy8gYXMgdGhlc2Ugd2lsbCB0aHJvdyBhd2F5IGV4aXN0aW5nIERPTSBub2RlcyBhbmQgY2F1c2UgcmVtb3ZhbCBlcnJvcnNcbiAgICAgIC8vIG9uIHN1YnNlcXVlbnQgcGF0Y2hlcyAoIzMzNjApXG4gICAgICBpZiAoa2V5ID09PSAndGV4dENvbnRlbnQnIHx8IGtleSA9PT0gJ2lubmVySFRNTCcpIHtcbiAgICAgICAgaWYgKHZub2RlLmNoaWxkcmVuKSB7IHZub2RlLmNoaWxkcmVuLmxlbmd0aCA9IDA7IH1cbiAgICAgICAgaWYgKGN1ciA9PT0gb2xkUHJvcHNba2V5XSkgeyBjb250aW51ZSB9XG4gICAgICAgIC8vICM2NjAxIHdvcmsgYXJvdW5kIENocm9tZSB2ZXJzaW9uIDw9IDU1IGJ1ZyB3aGVyZSBzaW5nbGUgdGV4dE5vZGVcbiAgICAgICAgLy8gcmVwbGFjZWQgYnkgaW5uZXJIVE1ML3RleHRDb250ZW50IHJldGFpbnMgaXRzIHBhcmVudE5vZGUgcHJvcGVydHlcbiAgICAgICAgaWYgKGVsbS5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIGVsbS5yZW1vdmVDaGlsZChlbG0uY2hpbGROb2Rlc1swXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGtleSA9PT0gJ3ZhbHVlJyAmJiBlbG0udGFnTmFtZSAhPT0gJ1BST0dSRVNTJykge1xuICAgICAgICAvLyBzdG9yZSB2YWx1ZSBhcyBfdmFsdWUgYXMgd2VsbCBzaW5jZVxuICAgICAgICAvLyBub24tc3RyaW5nIHZhbHVlcyB3aWxsIGJlIHN0cmluZ2lmaWVkXG4gICAgICAgIGVsbS5fdmFsdWUgPSBjdXI7XG4gICAgICAgIC8vIGF2b2lkIHJlc2V0dGluZyBjdXJzb3IgcG9zaXRpb24gd2hlbiB2YWx1ZSBpcyB0aGUgc2FtZVxuICAgICAgICB2YXIgc3RyQ3VyID0gaXNVbmRlZihjdXIpID8gJycgOiBTdHJpbmcoY3VyKTtcbiAgICAgICAgaWYgKHNob3VsZFVwZGF0ZVZhbHVlKGVsbSwgc3RyQ3VyKSkge1xuICAgICAgICAgIGVsbS52YWx1ZSA9IHN0ckN1cjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdpbm5lckhUTUwnICYmIGlzU1ZHKGVsbS50YWdOYW1lKSAmJiBpc1VuZGVmKGVsbS5pbm5lckhUTUwpKSB7XG4gICAgICAgIC8vIElFIGRvZXNuJ3Qgc3VwcG9ydCBpbm5lckhUTUwgZm9yIFNWRyBlbGVtZW50c1xuICAgICAgICBzdmdDb250YWluZXIgPSBzdmdDb250YWluZXIgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHN2Z0NvbnRhaW5lci5pbm5lckhUTUwgPSBcIjxzdmc+XCIgKyBjdXIgKyBcIjwvc3ZnPlwiO1xuICAgICAgICB2YXIgc3ZnID0gc3ZnQ29udGFpbmVyLmZpcnN0Q2hpbGQ7XG4gICAgICAgIHdoaWxlIChlbG0uZmlyc3RDaGlsZCkge1xuICAgICAgICAgIGVsbS5yZW1vdmVDaGlsZChlbG0uZmlyc3RDaGlsZCk7XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKHN2Zy5maXJzdENoaWxkKSB7XG4gICAgICAgICAgZWxtLmFwcGVuZENoaWxkKHN2Zy5maXJzdENoaWxkKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgLy8gc2tpcCB0aGUgdXBkYXRlIGlmIG9sZCBhbmQgbmV3IFZET00gc3RhdGUgaXMgdGhlIHNhbWUuXG4gICAgICAgIC8vIGB2YWx1ZWAgaXMgaGFuZGxlZCBzZXBhcmF0ZWx5IGJlY2F1c2UgdGhlIERPTSB2YWx1ZSBtYXkgYmUgdGVtcG9yYXJpbHlcbiAgICAgICAgLy8gb3V0IG9mIHN5bmMgd2l0aCBWRE9NIHN0YXRlIGR1ZSB0byBmb2N1cywgY29tcG9zaXRpb24gYW5kIG1vZGlmaWVycy5cbiAgICAgICAgLy8gVGhpcyAgIzQ1MjEgYnkgc2tpcHBpbmcgdGhlIHVubmVjZXNzYXJ5IGBjaGVja2VkYCB1cGRhdGUuXG4gICAgICAgIGN1ciAhPT0gb2xkUHJvcHNba2V5XVxuICAgICAgKSB7XG4gICAgICAgIC8vIHNvbWUgcHJvcGVydHkgdXBkYXRlcyBjYW4gdGhyb3dcbiAgICAgICAgLy8gZS5nLiBgdmFsdWVgIG9uIDxwcm9ncmVzcz4gdy8gbm9uLWZpbml0ZSB2YWx1ZVxuICAgICAgICB0cnkge1xuICAgICAgICAgIGVsbVtrZXldID0gY3VyO1xuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIGNoZWNrIHBsYXRmb3Jtcy93ZWIvdXRpbC9hdHRycy5qcyBhY2NlcHRWYWx1ZVxuXG5cbiAgZnVuY3Rpb24gc2hvdWxkVXBkYXRlVmFsdWUgKGVsbSwgY2hlY2tWYWwpIHtcbiAgICByZXR1cm4gKCFlbG0uY29tcG9zaW5nICYmIChcbiAgICAgIGVsbS50YWdOYW1lID09PSAnT1BUSU9OJyB8fFxuICAgICAgaXNOb3RJbkZvY3VzQW5kRGlydHkoZWxtLCBjaGVja1ZhbCkgfHxcbiAgICAgIGlzRGlydHlXaXRoTW9kaWZpZXJzKGVsbSwgY2hlY2tWYWwpXG4gICAgKSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzTm90SW5Gb2N1c0FuZERpcnR5IChlbG0sIGNoZWNrVmFsKSB7XG4gICAgLy8gcmV0dXJuIHRydWUgd2hlbiB0ZXh0Ym94ICgubnVtYmVyIGFuZCAudHJpbSkgbG9zZXMgZm9jdXMgYW5kIGl0cyB2YWx1ZSBpc1xuICAgIC8vIG5vdCBlcXVhbCB0byB0aGUgdXBkYXRlZCB2YWx1ZVxuICAgIHZhciBub3RJbkZvY3VzID0gdHJ1ZTtcbiAgICAvLyAjNjE1N1xuICAgIC8vIHdvcmsgYXJvdW5kIElFIGJ1ZyB3aGVuIGFjY2Vzc2luZyBkb2N1bWVudC5hY3RpdmVFbGVtZW50IGluIGFuIGlmcmFtZVxuICAgIHRyeSB7IG5vdEluRm9jdXMgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBlbG07IH0gY2F0Y2ggKGUpIHt9XG4gICAgcmV0dXJuIG5vdEluRm9jdXMgJiYgZWxtLnZhbHVlICE9PSBjaGVja1ZhbFxuICB9XG5cbiAgZnVuY3Rpb24gaXNEaXJ0eVdpdGhNb2RpZmllcnMgKGVsbSwgbmV3VmFsKSB7XG4gICAgdmFyIHZhbHVlID0gZWxtLnZhbHVlO1xuICAgIHZhciBtb2RpZmllcnMgPSBlbG0uX3ZNb2RpZmllcnM7IC8vIGluamVjdGVkIGJ5IHYtbW9kZWwgcnVudGltZVxuICAgIGlmIChpc0RlZihtb2RpZmllcnMpKSB7XG4gICAgICBpZiAobW9kaWZpZXJzLm51bWJlcikge1xuICAgICAgICByZXR1cm4gdG9OdW1iZXIodmFsdWUpICE9PSB0b051bWJlcihuZXdWYWwpXG4gICAgICB9XG4gICAgICBpZiAobW9kaWZpZXJzLnRyaW0pIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLnRyaW0oKSAhPT0gbmV3VmFsLnRyaW0oKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWUgIT09IG5ld1ZhbFxuICB9XG5cbiAgdmFyIGRvbVByb3BzID0ge1xuICAgIGNyZWF0ZTogdXBkYXRlRE9NUHJvcHMsXG4gICAgdXBkYXRlOiB1cGRhdGVET01Qcm9wc1xuICB9O1xuXG4gIC8qICAqL1xuXG4gIHZhciBwYXJzZVN0eWxlVGV4dCA9IGNhY2hlZChmdW5jdGlvbiAoY3NzVGV4dCkge1xuICAgIHZhciByZXMgPSB7fTtcbiAgICB2YXIgbGlzdERlbGltaXRlciA9IC87KD8hW14oXSpcXCkpL2c7XG4gICAgdmFyIHByb3BlcnR5RGVsaW1pdGVyID0gLzooLispLztcbiAgICBjc3NUZXh0LnNwbGl0KGxpc3REZWxpbWl0ZXIpLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIGlmIChpdGVtKSB7XG4gICAgICAgIHZhciB0bXAgPSBpdGVtLnNwbGl0KHByb3BlcnR5RGVsaW1pdGVyKTtcbiAgICAgICAgdG1wLmxlbmd0aCA+IDEgJiYgKHJlc1t0bXBbMF0udHJpbSgpXSA9IHRtcFsxXS50cmltKCkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXNcbiAgfSk7XG5cbiAgLy8gbWVyZ2Ugc3RhdGljIGFuZCBkeW5hbWljIHN0eWxlIGRhdGEgb24gdGhlIHNhbWUgdm5vZGVcbiAgZnVuY3Rpb24gbm9ybWFsaXplU3R5bGVEYXRhIChkYXRhKSB7XG4gICAgdmFyIHN0eWxlID0gbm9ybWFsaXplU3R5bGVCaW5kaW5nKGRhdGEuc3R5bGUpO1xuICAgIC8vIHN0YXRpYyBzdHlsZSBpcyBwcmUtcHJvY2Vzc2VkIGludG8gYW4gb2JqZWN0IGR1cmluZyBjb21waWxhdGlvblxuICAgIC8vIGFuZCBpcyBhbHdheXMgYSBmcmVzaCBvYmplY3QsIHNvIGl0J3Mgc2FmZSB0byBtZXJnZSBpbnRvIGl0XG4gICAgcmV0dXJuIGRhdGEuc3RhdGljU3R5bGVcbiAgICAgID8gZXh0ZW5kKGRhdGEuc3RhdGljU3R5bGUsIHN0eWxlKVxuICAgICAgOiBzdHlsZVxuICB9XG5cbiAgLy8gbm9ybWFsaXplIHBvc3NpYmxlIGFycmF5IC8gc3RyaW5nIHZhbHVlcyBpbnRvIE9iamVjdFxuICBmdW5jdGlvbiBub3JtYWxpemVTdHlsZUJpbmRpbmcgKGJpbmRpbmdTdHlsZSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGJpbmRpbmdTdHlsZSkpIHtcbiAgICAgIHJldHVybiB0b09iamVjdChiaW5kaW5nU3R5bGUpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgYmluZGluZ1N0eWxlID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHBhcnNlU3R5bGVUZXh0KGJpbmRpbmdTdHlsZSlcbiAgICB9XG4gICAgcmV0dXJuIGJpbmRpbmdTdHlsZVxuICB9XG5cbiAgLyoqXG4gICAqIHBhcmVudCBjb21wb25lbnQgc3R5bGUgc2hvdWxkIGJlIGFmdGVyIGNoaWxkJ3NcbiAgICogc28gdGhhdCBwYXJlbnQgY29tcG9uZW50J3Mgc3R5bGUgY291bGQgb3ZlcnJpZGUgaXRcbiAgICovXG4gIGZ1bmN0aW9uIGdldFN0eWxlICh2bm9kZSwgY2hlY2tDaGlsZCkge1xuICAgIHZhciByZXMgPSB7fTtcbiAgICB2YXIgc3R5bGVEYXRhO1xuXG4gICAgaWYgKGNoZWNrQ2hpbGQpIHtcbiAgICAgIHZhciBjaGlsZE5vZGUgPSB2bm9kZTtcbiAgICAgIHdoaWxlIChjaGlsZE5vZGUuY29tcG9uZW50SW5zdGFuY2UpIHtcbiAgICAgICAgY2hpbGROb2RlID0gY2hpbGROb2RlLmNvbXBvbmVudEluc3RhbmNlLl92bm9kZTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGNoaWxkTm9kZSAmJiBjaGlsZE5vZGUuZGF0YSAmJlxuICAgICAgICAgIChzdHlsZURhdGEgPSBub3JtYWxpemVTdHlsZURhdGEoY2hpbGROb2RlLmRhdGEpKVxuICAgICAgICApIHtcbiAgICAgICAgICBleHRlbmQocmVzLCBzdHlsZURhdGEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKChzdHlsZURhdGEgPSBub3JtYWxpemVTdHlsZURhdGEodm5vZGUuZGF0YSkpKSB7XG4gICAgICBleHRlbmQocmVzLCBzdHlsZURhdGEpO1xuICAgIH1cblxuICAgIHZhciBwYXJlbnROb2RlID0gdm5vZGU7XG4gICAgd2hpbGUgKChwYXJlbnROb2RlID0gcGFyZW50Tm9kZS5wYXJlbnQpKSB7XG4gICAgICBpZiAocGFyZW50Tm9kZS5kYXRhICYmIChzdHlsZURhdGEgPSBub3JtYWxpemVTdHlsZURhdGEocGFyZW50Tm9kZS5kYXRhKSkpIHtcbiAgICAgICAgZXh0ZW5kKHJlcywgc3R5bGVEYXRhKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgLyogICovXG5cbiAgdmFyIGNzc1ZhclJFID0gL14tLS87XG4gIHZhciBpbXBvcnRhbnRSRSA9IC9cXHMqIWltcG9ydGFudCQvO1xuICB2YXIgc2V0UHJvcCA9IGZ1bmN0aW9uIChlbCwgbmFtZSwgdmFsKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKGNzc1ZhclJFLnRlc3QobmFtZSkpIHtcbiAgICAgIGVsLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpbXBvcnRhbnRSRS50ZXN0KHZhbCkpIHtcbiAgICAgIGVsLnN0eWxlLnNldFByb3BlcnR5KGh5cGhlbmF0ZShuYW1lKSwgdmFsLnJlcGxhY2UoaW1wb3J0YW50UkUsICcnKSwgJ2ltcG9ydGFudCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgbm9ybWFsaXplZE5hbWUgPSBub3JtYWxpemUobmFtZSk7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIC8vIFN1cHBvcnQgdmFsdWVzIGFycmF5IGNyZWF0ZWQgYnkgYXV0b3ByZWZpeGVyLCBlLmcuXG4gICAgICAgIC8vIHtkaXNwbGF5OiBbXCItd2Via2l0LWJveFwiLCBcIi1tcy1mbGV4Ym94XCIsIFwiZmxleFwiXX1cbiAgICAgICAgLy8gU2V0IHRoZW0gb25lIGJ5IG9uZSwgYW5kIHRoZSBicm93c2VyIHdpbGwgb25seSBzZXQgdGhvc2UgaXQgY2FuIHJlY29nbml6ZVxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdmFsLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgZWwuc3R5bGVbbm9ybWFsaXplZE5hbWVdID0gdmFsW2ldO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbC5zdHlsZVtub3JtYWxpemVkTmFtZV0gPSB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHZhciB2ZW5kb3JOYW1lcyA9IFsnV2Via2l0JywgJ01veicsICdtcyddO1xuXG4gIHZhciBlbXB0eVN0eWxlO1xuICB2YXIgbm9ybWFsaXplID0gY2FjaGVkKGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgZW1wdHlTdHlsZSA9IGVtcHR5U3R5bGUgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jykuc3R5bGU7XG4gICAgcHJvcCA9IGNhbWVsaXplKHByb3ApO1xuICAgIGlmIChwcm9wICE9PSAnZmlsdGVyJyAmJiAocHJvcCBpbiBlbXB0eVN0eWxlKSkge1xuICAgICAgcmV0dXJuIHByb3BcbiAgICB9XG4gICAgdmFyIGNhcE5hbWUgPSBwcm9wLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcC5zbGljZSgxKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZlbmRvck5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbmFtZSA9IHZlbmRvck5hbWVzW2ldICsgY2FwTmFtZTtcbiAgICAgIGlmIChuYW1lIGluIGVtcHR5U3R5bGUpIHtcbiAgICAgICAgcmV0dXJuIG5hbWVcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHVwZGF0ZVN0eWxlIChvbGRWbm9kZSwgdm5vZGUpIHtcbiAgICB2YXIgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgdmFyIG9sZERhdGEgPSBvbGRWbm9kZS5kYXRhO1xuXG4gICAgaWYgKGlzVW5kZWYoZGF0YS5zdGF0aWNTdHlsZSkgJiYgaXNVbmRlZihkYXRhLnN0eWxlKSAmJlxuICAgICAgaXNVbmRlZihvbGREYXRhLnN0YXRpY1N0eWxlKSAmJiBpc1VuZGVmKG9sZERhdGEuc3R5bGUpXG4gICAgKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB2YXIgY3VyLCBuYW1lO1xuICAgIHZhciBlbCA9IHZub2RlLmVsbTtcbiAgICB2YXIgb2xkU3RhdGljU3R5bGUgPSBvbGREYXRhLnN0YXRpY1N0eWxlO1xuICAgIHZhciBvbGRTdHlsZUJpbmRpbmcgPSBvbGREYXRhLm5vcm1hbGl6ZWRTdHlsZSB8fCBvbGREYXRhLnN0eWxlIHx8IHt9O1xuXG4gICAgLy8gaWYgc3RhdGljIHN0eWxlIGV4aXN0cywgc3R5bGViaW5kaW5nIGFscmVhZHkgbWVyZ2VkIGludG8gaXQgd2hlbiBkb2luZyBub3JtYWxpemVTdHlsZURhdGFcbiAgICB2YXIgb2xkU3R5bGUgPSBvbGRTdGF0aWNTdHlsZSB8fCBvbGRTdHlsZUJpbmRpbmc7XG5cbiAgICB2YXIgc3R5bGUgPSBub3JtYWxpemVTdHlsZUJpbmRpbmcodm5vZGUuZGF0YS5zdHlsZSkgfHwge307XG5cbiAgICAvLyBzdG9yZSBub3JtYWxpemVkIHN0eWxlIHVuZGVyIGEgZGlmZmVyZW50IGtleSBmb3IgbmV4dCBkaWZmXG4gICAgLy8gbWFrZSBzdXJlIHRvIGNsb25lIGl0IGlmIGl0J3MgcmVhY3RpdmUsIHNpbmNlIHRoZSB1c2VyIGxpa2VseSB3YW50c1xuICAgIC8vIHRvIG11dGF0ZSBpdC5cbiAgICB2bm9kZS5kYXRhLm5vcm1hbGl6ZWRTdHlsZSA9IGlzRGVmKHN0eWxlLl9fb2JfXylcbiAgICAgID8gZXh0ZW5kKHt9LCBzdHlsZSlcbiAgICAgIDogc3R5bGU7XG5cbiAgICB2YXIgbmV3U3R5bGUgPSBnZXRTdHlsZSh2bm9kZSwgdHJ1ZSk7XG5cbiAgICBmb3IgKG5hbWUgaW4gb2xkU3R5bGUpIHtcbiAgICAgIGlmIChpc1VuZGVmKG5ld1N0eWxlW25hbWVdKSkge1xuICAgICAgICBzZXRQcm9wKGVsLCBuYW1lLCAnJyk7XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAobmFtZSBpbiBuZXdTdHlsZSkge1xuICAgICAgY3VyID0gbmV3U3R5bGVbbmFtZV07XG4gICAgICBpZiAoY3VyICE9PSBvbGRTdHlsZVtuYW1lXSkge1xuICAgICAgICAvLyBpZTkgc2V0dGluZyB0byBudWxsIGhhcyBubyBlZmZlY3QsIG11c3QgdXNlIGVtcHR5IHN0cmluZ1xuICAgICAgICBzZXRQcm9wKGVsLCBuYW1lLCBjdXIgPT0gbnVsbCA/ICcnIDogY3VyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB2YXIgc3R5bGUgPSB7XG4gICAgY3JlYXRlOiB1cGRhdGVTdHlsZSxcbiAgICB1cGRhdGU6IHVwZGF0ZVN0eWxlXG4gIH07XG5cbiAgLyogICovXG5cbiAgdmFyIHdoaXRlc3BhY2VSRSA9IC9cXHMrLztcblxuICAvKipcbiAgICogQWRkIGNsYXNzIHdpdGggY29tcGF0aWJpbGl0eSBmb3IgU1ZHIHNpbmNlIGNsYXNzTGlzdCBpcyBub3Qgc3VwcG9ydGVkIG9uXG4gICAqIFNWRyBlbGVtZW50cyBpbiBJRVxuICAgKi9cbiAgZnVuY3Rpb24gYWRkQ2xhc3MgKGVsLCBjbHMpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoIWNscyB8fCAhKGNscyA9IGNscy50cmltKCkpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgIGlmIChlbC5jbGFzc0xpc3QpIHtcbiAgICAgIGlmIChjbHMuaW5kZXhPZignICcpID4gLTEpIHtcbiAgICAgICAgY2xzLnNwbGl0KHdoaXRlc3BhY2VSRSkuZm9yRWFjaChmdW5jdGlvbiAoYykgeyByZXR1cm4gZWwuY2xhc3NMaXN0LmFkZChjKTsgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKGNscyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBjdXIgPSBcIiBcIiArIChlbC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykgfHwgJycpICsgXCIgXCI7XG4gICAgICBpZiAoY3VyLmluZGV4T2YoJyAnICsgY2xzICsgJyAnKSA8IDApIHtcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKCdjbGFzcycsIChjdXIgKyBjbHMpLnRyaW0oKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBjbGFzcyB3aXRoIGNvbXBhdGliaWxpdHkgZm9yIFNWRyBzaW5jZSBjbGFzc0xpc3QgaXMgbm90IHN1cHBvcnRlZCBvblxuICAgKiBTVkcgZWxlbWVudHMgaW4gSUVcbiAgICovXG4gIGZ1bmN0aW9uIHJlbW92ZUNsYXNzIChlbCwgY2xzKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKCFjbHMgfHwgIShjbHMgPSBjbHMudHJpbSgpKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICBpZiAoZWwuY2xhc3NMaXN0KSB7XG4gICAgICBpZiAoY2xzLmluZGV4T2YoJyAnKSA+IC0xKSB7XG4gICAgICAgIGNscy5zcGxpdCh3aGl0ZXNwYWNlUkUpLmZvckVhY2goZnVuY3Rpb24gKGMpIHsgcmV0dXJuIGVsLmNsYXNzTGlzdC5yZW1vdmUoYyk7IH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZShjbHMpO1xuICAgICAgfVxuICAgICAgaWYgKCFlbC5jbGFzc0xpc3QubGVuZ3RoKSB7XG4gICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSgnY2xhc3MnKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGN1ciA9IFwiIFwiICsgKGVsLmdldEF0dHJpYnV0ZSgnY2xhc3MnKSB8fCAnJykgKyBcIiBcIjtcbiAgICAgIHZhciB0YXIgPSAnICcgKyBjbHMgKyAnICc7XG4gICAgICB3aGlsZSAoY3VyLmluZGV4T2YodGFyKSA+PSAwKSB7XG4gICAgICAgIGN1ciA9IGN1ci5yZXBsYWNlKHRhciwgJyAnKTtcbiAgICAgIH1cbiAgICAgIGN1ciA9IGN1ci50cmltKCk7XG4gICAgICBpZiAoY3VyKSB7XG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBjdXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKCdjbGFzcycpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qICAqL1xuXG4gIGZ1bmN0aW9uIHJlc29sdmVUcmFuc2l0aW9uIChkZWYkJDEpIHtcbiAgICBpZiAoIWRlZiQkMSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgaWYgKHR5cGVvZiBkZWYkJDEgPT09ICdvYmplY3QnKSB7XG4gICAgICB2YXIgcmVzID0ge307XG4gICAgICBpZiAoZGVmJCQxLmNzcyAhPT0gZmFsc2UpIHtcbiAgICAgICAgZXh0ZW5kKHJlcywgYXV0b0Nzc1RyYW5zaXRpb24oZGVmJCQxLm5hbWUgfHwgJ3YnKSk7XG4gICAgICB9XG4gICAgICBleHRlbmQocmVzLCBkZWYkJDEpO1xuICAgICAgcmV0dXJuIHJlc1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZiQkMSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBhdXRvQ3NzVHJhbnNpdGlvbihkZWYkJDEpXG4gICAgfVxuICB9XG5cbiAgdmFyIGF1dG9Dc3NUcmFuc2l0aW9uID0gY2FjaGVkKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGVudGVyQ2xhc3M6IChuYW1lICsgXCItZW50ZXJcIiksXG4gICAgICBlbnRlclRvQ2xhc3M6IChuYW1lICsgXCItZW50ZXItdG9cIiksXG4gICAgICBlbnRlckFjdGl2ZUNsYXNzOiAobmFtZSArIFwiLWVudGVyLWFjdGl2ZVwiKSxcbiAgICAgIGxlYXZlQ2xhc3M6IChuYW1lICsgXCItbGVhdmVcIiksXG4gICAgICBsZWF2ZVRvQ2xhc3M6IChuYW1lICsgXCItbGVhdmUtdG9cIiksXG4gICAgICBsZWF2ZUFjdGl2ZUNsYXNzOiAobmFtZSArIFwiLWxlYXZlLWFjdGl2ZVwiKVxuICAgIH1cbiAgfSk7XG5cbiAgdmFyIGhhc1RyYW5zaXRpb24gPSBpbkJyb3dzZXIgJiYgIWlzSUU5O1xuICB2YXIgVFJBTlNJVElPTiA9ICd0cmFuc2l0aW9uJztcbiAgdmFyIEFOSU1BVElPTiA9ICdhbmltYXRpb24nO1xuXG4gIC8vIFRyYW5zaXRpb24gcHJvcGVydHkvZXZlbnQgc25pZmZpbmdcbiAgdmFyIHRyYW5zaXRpb25Qcm9wID0gJ3RyYW5zaXRpb24nO1xuICB2YXIgdHJhbnNpdGlvbkVuZEV2ZW50ID0gJ3RyYW5zaXRpb25lbmQnO1xuICB2YXIgYW5pbWF0aW9uUHJvcCA9ICdhbmltYXRpb24nO1xuICB2YXIgYW5pbWF0aW9uRW5kRXZlbnQgPSAnYW5pbWF0aW9uZW5kJztcbiAgaWYgKGhhc1RyYW5zaXRpb24pIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAod2luZG93Lm9udHJhbnNpdGlvbmVuZCA9PT0gdW5kZWZpbmVkICYmXG4gICAgICB3aW5kb3cub253ZWJraXR0cmFuc2l0aW9uZW5kICE9PSB1bmRlZmluZWRcbiAgICApIHtcbiAgICAgIHRyYW5zaXRpb25Qcm9wID0gJ1dlYmtpdFRyYW5zaXRpb24nO1xuICAgICAgdHJhbnNpdGlvbkVuZEV2ZW50ID0gJ3dlYmtpdFRyYW5zaXRpb25FbmQnO1xuICAgIH1cbiAgICBpZiAod2luZG93Lm9uYW5pbWF0aW9uZW5kID09PSB1bmRlZmluZWQgJiZcbiAgICAgIHdpbmRvdy5vbndlYmtpdGFuaW1hdGlvbmVuZCAhPT0gdW5kZWZpbmVkXG4gICAgKSB7XG4gICAgICBhbmltYXRpb25Qcm9wID0gJ1dlYmtpdEFuaW1hdGlvbic7XG4gICAgICBhbmltYXRpb25FbmRFdmVudCA9ICd3ZWJraXRBbmltYXRpb25FbmQnO1xuICAgIH1cbiAgfVxuXG4gIC8vIGJpbmRpbmcgdG8gd2luZG93IGlzIG5lY2Vzc2FyeSB0byBtYWtlIGhvdCByZWxvYWQgd29yayBpbiBJRSBpbiBzdHJpY3QgbW9kZVxuICB2YXIgcmFmID0gaW5Ccm93c2VyXG4gICAgPyB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICA/IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUuYmluZCh3aW5kb3cpXG4gICAgICA6IHNldFRpbWVvdXRcbiAgICA6IC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovIGZ1bmN0aW9uIChmbikgeyByZXR1cm4gZm4oKTsgfTtcblxuICBmdW5jdGlvbiBuZXh0RnJhbWUgKGZuKSB7XG4gICAgcmFmKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJhZihmbik7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRUcmFuc2l0aW9uQ2xhc3MgKGVsLCBjbHMpIHtcbiAgICB2YXIgdHJhbnNpdGlvbkNsYXNzZXMgPSBlbC5fdHJhbnNpdGlvbkNsYXNzZXMgfHwgKGVsLl90cmFuc2l0aW9uQ2xhc3NlcyA9IFtdKTtcbiAgICBpZiAodHJhbnNpdGlvbkNsYXNzZXMuaW5kZXhPZihjbHMpIDwgMCkge1xuICAgICAgdHJhbnNpdGlvbkNsYXNzZXMucHVzaChjbHMpO1xuICAgICAgYWRkQ2xhc3MoZWwsIGNscyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlVHJhbnNpdGlvbkNsYXNzIChlbCwgY2xzKSB7XG4gICAgaWYgKGVsLl90cmFuc2l0aW9uQ2xhc3Nlcykge1xuICAgICAgcmVtb3ZlKGVsLl90cmFuc2l0aW9uQ2xhc3NlcywgY2xzKTtcbiAgICB9XG4gICAgcmVtb3ZlQ2xhc3MoZWwsIGNscyk7XG4gIH1cblxuICBmdW5jdGlvbiB3aGVuVHJhbnNpdGlvbkVuZHMgKFxuICAgIGVsLFxuICAgIGV4cGVjdGVkVHlwZSxcbiAgICBjYlxuICApIHtcbiAgICB2YXIgcmVmID0gZ2V0VHJhbnNpdGlvbkluZm8oZWwsIGV4cGVjdGVkVHlwZSk7XG4gICAgdmFyIHR5cGUgPSByZWYudHlwZTtcbiAgICB2YXIgdGltZW91dCA9IHJlZi50aW1lb3V0O1xuICAgIHZhciBwcm9wQ291bnQgPSByZWYucHJvcENvdW50O1xuICAgIGlmICghdHlwZSkgeyByZXR1cm4gY2IoKSB9XG4gICAgdmFyIGV2ZW50ID0gdHlwZSA9PT0gVFJBTlNJVElPTiA/IHRyYW5zaXRpb25FbmRFdmVudCA6IGFuaW1hdGlvbkVuZEV2ZW50O1xuICAgIHZhciBlbmRlZCA9IDA7XG4gICAgdmFyIGVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIG9uRW5kKTtcbiAgICAgIGNiKCk7XG4gICAgfTtcbiAgICB2YXIgb25FbmQgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgaWYgKGUudGFyZ2V0ID09PSBlbCkge1xuICAgICAgICBpZiAoKytlbmRlZCA+PSBwcm9wQ291bnQpIHtcbiAgICAgICAgICBlbmQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoZW5kZWQgPCBwcm9wQ291bnQpIHtcbiAgICAgICAgZW5kKCk7XG4gICAgICB9XG4gICAgfSwgdGltZW91dCArIDEpO1xuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIG9uRW5kKTtcbiAgfVxuXG4gIHZhciB0cmFuc2Zvcm1SRSA9IC9cXGIodHJhbnNmb3JtfGFsbCkoLHwkKS87XG5cbiAgZnVuY3Rpb24gZ2V0VHJhbnNpdGlvbkluZm8gKGVsLCBleHBlY3RlZFR5cGUpIHtcbiAgICB2YXIgc3R5bGVzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpO1xuICAgIC8vIEpTRE9NIG1heSByZXR1cm4gdW5kZWZpbmVkIGZvciB0cmFuc2l0aW9uIHByb3BlcnRpZXNcbiAgICB2YXIgdHJhbnNpdGlvbkRlbGF5cyA9IChzdHlsZXNbdHJhbnNpdGlvblByb3AgKyAnRGVsYXknXSB8fCAnJykuc3BsaXQoJywgJyk7XG4gICAgdmFyIHRyYW5zaXRpb25EdXJhdGlvbnMgPSAoc3R5bGVzW3RyYW5zaXRpb25Qcm9wICsgJ0R1cmF0aW9uJ10gfHwgJycpLnNwbGl0KCcsICcpO1xuICAgIHZhciB0cmFuc2l0aW9uVGltZW91dCA9IGdldFRpbWVvdXQodHJhbnNpdGlvbkRlbGF5cywgdHJhbnNpdGlvbkR1cmF0aW9ucyk7XG4gICAgdmFyIGFuaW1hdGlvbkRlbGF5cyA9IChzdHlsZXNbYW5pbWF0aW9uUHJvcCArICdEZWxheSddIHx8ICcnKS5zcGxpdCgnLCAnKTtcbiAgICB2YXIgYW5pbWF0aW9uRHVyYXRpb25zID0gKHN0eWxlc1thbmltYXRpb25Qcm9wICsgJ0R1cmF0aW9uJ10gfHwgJycpLnNwbGl0KCcsICcpO1xuICAgIHZhciBhbmltYXRpb25UaW1lb3V0ID0gZ2V0VGltZW91dChhbmltYXRpb25EZWxheXMsIGFuaW1hdGlvbkR1cmF0aW9ucyk7XG5cbiAgICB2YXIgdHlwZTtcbiAgICB2YXIgdGltZW91dCA9IDA7XG4gICAgdmFyIHByb3BDb3VudCA9IDA7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKGV4cGVjdGVkVHlwZSA9PT0gVFJBTlNJVElPTikge1xuICAgICAgaWYgKHRyYW5zaXRpb25UaW1lb3V0ID4gMCkge1xuICAgICAgICB0eXBlID0gVFJBTlNJVElPTjtcbiAgICAgICAgdGltZW91dCA9IHRyYW5zaXRpb25UaW1lb3V0O1xuICAgICAgICBwcm9wQ291bnQgPSB0cmFuc2l0aW9uRHVyYXRpb25zLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGV4cGVjdGVkVHlwZSA9PT0gQU5JTUFUSU9OKSB7XG4gICAgICBpZiAoYW5pbWF0aW9uVGltZW91dCA+IDApIHtcbiAgICAgICAgdHlwZSA9IEFOSU1BVElPTjtcbiAgICAgICAgdGltZW91dCA9IGFuaW1hdGlvblRpbWVvdXQ7XG4gICAgICAgIHByb3BDb3VudCA9IGFuaW1hdGlvbkR1cmF0aW9ucy5sZW5ndGg7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRpbWVvdXQgPSBNYXRoLm1heCh0cmFuc2l0aW9uVGltZW91dCwgYW5pbWF0aW9uVGltZW91dCk7XG4gICAgICB0eXBlID0gdGltZW91dCA+IDBcbiAgICAgICAgPyB0cmFuc2l0aW9uVGltZW91dCA+IGFuaW1hdGlvblRpbWVvdXRcbiAgICAgICAgICA/IFRSQU5TSVRJT05cbiAgICAgICAgICA6IEFOSU1BVElPTlxuICAgICAgICA6IG51bGw7XG4gICAgICBwcm9wQ291bnQgPSB0eXBlXG4gICAgICAgID8gdHlwZSA9PT0gVFJBTlNJVElPTlxuICAgICAgICAgID8gdHJhbnNpdGlvbkR1cmF0aW9ucy5sZW5ndGhcbiAgICAgICAgICA6IGFuaW1hdGlvbkR1cmF0aW9ucy5sZW5ndGhcbiAgICAgICAgOiAwO1xuICAgIH1cbiAgICB2YXIgaGFzVHJhbnNmb3JtID1cbiAgICAgIHR5cGUgPT09IFRSQU5TSVRJT04gJiZcbiAgICAgIHRyYW5zZm9ybVJFLnRlc3Qoc3R5bGVzW3RyYW5zaXRpb25Qcm9wICsgJ1Byb3BlcnR5J10pO1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgdGltZW91dDogdGltZW91dCxcbiAgICAgIHByb3BDb3VudDogcHJvcENvdW50LFxuICAgICAgaGFzVHJhbnNmb3JtOiBoYXNUcmFuc2Zvcm1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBnZXRUaW1lb3V0IChkZWxheXMsIGR1cmF0aW9ucykge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgd2hpbGUgKGRlbGF5cy5sZW5ndGggPCBkdXJhdGlvbnMubGVuZ3RoKSB7XG4gICAgICBkZWxheXMgPSBkZWxheXMuY29uY2F0KGRlbGF5cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIE1hdGgubWF4LmFwcGx5KG51bGwsIGR1cmF0aW9ucy5tYXAoZnVuY3Rpb24gKGQsIGkpIHtcbiAgICAgIHJldHVybiB0b01zKGQpICsgdG9NcyhkZWxheXNbaV0pXG4gICAgfSkpXG4gIH1cblxuICAvLyBPbGQgdmVyc2lvbnMgb2YgQ2hyb21pdW0gKGJlbG93IDYxLjAuMzE2My4xMDApIGZvcm1hdHMgZmxvYXRpbmcgcG9pbnRlciBudW1iZXJzXG4gIC8vIGluIGEgbG9jYWxlLWRlcGVuZGVudCB3YXksIHVzaW5nIGEgY29tbWEgaW5zdGVhZCBvZiBhIGRvdC5cbiAgLy8gSWYgY29tbWEgaXMgbm90IHJlcGxhY2VkIHdpdGggYSBkb3QsIHRoZSBpbnB1dCB3aWxsIGJlIHJvdW5kZWQgZG93biAoaS5lLiBhY3RpbmdcbiAgLy8gYXMgYSBmbG9vciBmdW5jdGlvbikgY2F1c2luZyB1bmV4cGVjdGVkIGJlaGF2aW9yc1xuICBmdW5jdGlvbiB0b01zIChzKSB7XG4gICAgcmV0dXJuIE51bWJlcihzLnNsaWNlKDAsIC0xKS5yZXBsYWNlKCcsJywgJy4nKSkgKiAxMDAwXG4gIH1cblxuICAvKiAgKi9cblxuICBmdW5jdGlvbiBlbnRlciAodm5vZGUsIHRvZ2dsZURpc3BsYXkpIHtcbiAgICB2YXIgZWwgPSB2bm9kZS5lbG07XG5cbiAgICAvLyBjYWxsIGxlYXZlIGNhbGxiYWNrIG5vd1xuICAgIGlmIChpc0RlZihlbC5fbGVhdmVDYikpIHtcbiAgICAgIGVsLl9sZWF2ZUNiLmNhbmNlbGxlZCA9IHRydWU7XG4gICAgICBlbC5fbGVhdmVDYigpO1xuICAgIH1cblxuICAgIHZhciBkYXRhID0gcmVzb2x2ZVRyYW5zaXRpb24odm5vZGUuZGF0YS50cmFuc2l0aW9uKTtcbiAgICBpZiAoaXNVbmRlZihkYXRhKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKGlzRGVmKGVsLl9lbnRlckNiKSB8fCBlbC5ub2RlVHlwZSAhPT0gMSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdmFyIGNzcyA9IGRhdGEuY3NzO1xuICAgIHZhciB0eXBlID0gZGF0YS50eXBlO1xuICAgIHZhciBlbnRlckNsYXNzID0gZGF0YS5lbnRlckNsYXNzO1xuICAgIHZhciBlbnRlclRvQ2xhc3MgPSBkYXRhLmVudGVyVG9DbGFzcztcbiAgICB2YXIgZW50ZXJBY3RpdmVDbGFzcyA9IGRhdGEuZW50ZXJBY3RpdmVDbGFzcztcbiAgICB2YXIgYXBwZWFyQ2xhc3MgPSBkYXRhLmFwcGVhckNsYXNzO1xuICAgIHZhciBhcHBlYXJUb0NsYXNzID0gZGF0YS5hcHBlYXJUb0NsYXNzO1xuICAgIHZhciBhcHBlYXJBY3RpdmVDbGFzcyA9IGRhdGEuYXBwZWFyQWN0aXZlQ2xhc3M7XG4gICAgdmFyIGJlZm9yZUVudGVyID0gZGF0YS5iZWZvcmVFbnRlcjtcbiAgICB2YXIgZW50ZXIgPSBkYXRhLmVudGVyO1xuICAgIHZhciBhZnRlckVudGVyID0gZGF0YS5hZnRlckVudGVyO1xuICAgIHZhciBlbnRlckNhbmNlbGxlZCA9IGRhdGEuZW50ZXJDYW5jZWxsZWQ7XG4gICAgdmFyIGJlZm9yZUFwcGVhciA9IGRhdGEuYmVmb3JlQXBwZWFyO1xuICAgIHZhciBhcHBlYXIgPSBkYXRhLmFwcGVhcjtcbiAgICB2YXIgYWZ0ZXJBcHBlYXIgPSBkYXRhLmFmdGVyQXBwZWFyO1xuICAgIHZhciBhcHBlYXJDYW5jZWxsZWQgPSBkYXRhLmFwcGVhckNhbmNlbGxlZDtcbiAgICB2YXIgZHVyYXRpb24gPSBkYXRhLmR1cmF0aW9uO1xuXG4gICAgLy8gYWN0aXZlSW5zdGFuY2Ugd2lsbCBhbHdheXMgYmUgdGhlIDx0cmFuc2l0aW9uPiBjb21wb25lbnQgbWFuYWdpbmcgdGhpc1xuICAgIC8vIHRyYW5zaXRpb24uIE9uZSBlZGdlIGNhc2UgdG8gY2hlY2sgaXMgd2hlbiB0aGUgPHRyYW5zaXRpb24+IGlzIHBsYWNlZFxuICAgIC8vIGFzIHRoZSByb290IG5vZGUgb2YgYSBjaGlsZCBjb21wb25lbnQuIEluIHRoYXQgY2FzZSB3ZSBuZWVkIHRvIGNoZWNrXG4gICAgLy8gPHRyYW5zaXRpb24+J3MgcGFyZW50IGZvciBhcHBlYXIgY2hlY2suXG4gICAgdmFyIGNvbnRleHQgPSBhY3RpdmVJbnN0YW5jZTtcbiAgICB2YXIgdHJhbnNpdGlvbk5vZGUgPSBhY3RpdmVJbnN0YW5jZS4kdm5vZGU7XG4gICAgd2hpbGUgKHRyYW5zaXRpb25Ob2RlICYmIHRyYW5zaXRpb25Ob2RlLnBhcmVudCkge1xuICAgICAgY29udGV4dCA9IHRyYW5zaXRpb25Ob2RlLmNvbnRleHQ7XG4gICAgICB0cmFuc2l0aW9uTm9kZSA9IHRyYW5zaXRpb25Ob2RlLnBhcmVudDtcbiAgICB9XG5cbiAgICB2YXIgaXNBcHBlYXIgPSAhY29udGV4dC5faXNNb3VudGVkIHx8ICF2bm9kZS5pc1Jvb3RJbnNlcnQ7XG5cbiAgICBpZiAoaXNBcHBlYXIgJiYgIWFwcGVhciAmJiBhcHBlYXIgIT09ICcnKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB2YXIgc3RhcnRDbGFzcyA9IGlzQXBwZWFyICYmIGFwcGVhckNsYXNzXG4gICAgICA/IGFwcGVhckNsYXNzXG4gICAgICA6IGVudGVyQ2xhc3M7XG4gICAgdmFyIGFjdGl2ZUNsYXNzID0gaXNBcHBlYXIgJiYgYXBwZWFyQWN0aXZlQ2xhc3NcbiAgICAgID8gYXBwZWFyQWN0aXZlQ2xhc3NcbiAgICAgIDogZW50ZXJBY3RpdmVDbGFzcztcbiAgICB2YXIgdG9DbGFzcyA9IGlzQXBwZWFyICYmIGFwcGVhclRvQ2xhc3NcbiAgICAgID8gYXBwZWFyVG9DbGFzc1xuICAgICAgOiBlbnRlclRvQ2xhc3M7XG5cbiAgICB2YXIgYmVmb3JlRW50ZXJIb29rID0gaXNBcHBlYXJcbiAgICAgID8gKGJlZm9yZUFwcGVhciB8fCBiZWZvcmVFbnRlcilcbiAgICAgIDogYmVmb3JlRW50ZXI7XG4gICAgdmFyIGVudGVySG9vayA9IGlzQXBwZWFyXG4gICAgICA/ICh0eXBlb2YgYXBwZWFyID09PSAnZnVuY3Rpb24nID8gYXBwZWFyIDogZW50ZXIpXG4gICAgICA6IGVudGVyO1xuICAgIHZhciBhZnRlckVudGVySG9vayA9IGlzQXBwZWFyXG4gICAgICA/IChhZnRlckFwcGVhciB8fCBhZnRlckVudGVyKVxuICAgICAgOiBhZnRlckVudGVyO1xuICAgIHZhciBlbnRlckNhbmNlbGxlZEhvb2sgPSBpc0FwcGVhclxuICAgICAgPyAoYXBwZWFyQ2FuY2VsbGVkIHx8IGVudGVyQ2FuY2VsbGVkKVxuICAgICAgOiBlbnRlckNhbmNlbGxlZDtcblxuICAgIHZhciBleHBsaWNpdEVudGVyRHVyYXRpb24gPSB0b051bWJlcihcbiAgICAgIGlzT2JqZWN0KGR1cmF0aW9uKVxuICAgICAgICA/IGR1cmF0aW9uLmVudGVyXG4gICAgICAgIDogZHVyYXRpb25cbiAgICApO1xuXG4gICAgaWYgKGV4cGxpY2l0RW50ZXJEdXJhdGlvbiAhPSBudWxsKSB7XG4gICAgICBjaGVja0R1cmF0aW9uKGV4cGxpY2l0RW50ZXJEdXJhdGlvbiwgJ2VudGVyJywgdm5vZGUpO1xuICAgIH1cblxuICAgIHZhciBleHBlY3RzQ1NTID0gY3NzICE9PSBmYWxzZSAmJiAhaXNJRTk7XG4gICAgdmFyIHVzZXJXYW50c0NvbnRyb2wgPSBnZXRIb29rQXJndW1lbnRzTGVuZ3RoKGVudGVySG9vayk7XG5cbiAgICB2YXIgY2IgPSBlbC5fZW50ZXJDYiA9IG9uY2UoZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKGV4cGVjdHNDU1MpIHtcbiAgICAgICAgcmVtb3ZlVHJhbnNpdGlvbkNsYXNzKGVsLCB0b0NsYXNzKTtcbiAgICAgICAgcmVtb3ZlVHJhbnNpdGlvbkNsYXNzKGVsLCBhY3RpdmVDbGFzcyk7XG4gICAgICB9XG4gICAgICBpZiAoY2IuY2FuY2VsbGVkKSB7XG4gICAgICAgIGlmIChleHBlY3RzQ1NTKSB7XG4gICAgICAgICAgcmVtb3ZlVHJhbnNpdGlvbkNsYXNzKGVsLCBzdGFydENsYXNzKTtcbiAgICAgICAgfVxuICAgICAgICBlbnRlckNhbmNlbGxlZEhvb2sgJiYgZW50ZXJDYW5jZWxsZWRIb29rKGVsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFmdGVyRW50ZXJIb29rICYmIGFmdGVyRW50ZXJIb29rKGVsKTtcbiAgICAgIH1cbiAgICAgIGVsLl9lbnRlckNiID0gbnVsbDtcbiAgICB9KTtcblxuICAgIGlmICghdm5vZGUuZGF0YS5zaG93KSB7XG4gICAgICAvLyByZW1vdmUgcGVuZGluZyBsZWF2ZSBlbGVtZW50IG9uIGVudGVyIGJ5IGluamVjdGluZyBhbiBpbnNlcnQgaG9va1xuICAgICAgbWVyZ2VWTm9kZUhvb2sodm5vZGUsICdpbnNlcnQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnROb2RlO1xuICAgICAgICB2YXIgcGVuZGluZ05vZGUgPSBwYXJlbnQgJiYgcGFyZW50Ll9wZW5kaW5nICYmIHBhcmVudC5fcGVuZGluZ1t2bm9kZS5rZXldO1xuICAgICAgICBpZiAocGVuZGluZ05vZGUgJiZcbiAgICAgICAgICBwZW5kaW5nTm9kZS50YWcgPT09IHZub2RlLnRhZyAmJlxuICAgICAgICAgIHBlbmRpbmdOb2RlLmVsbS5fbGVhdmVDYlxuICAgICAgICApIHtcbiAgICAgICAgICBwZW5kaW5nTm9kZS5lbG0uX2xlYXZlQ2IoKTtcbiAgICAgICAgfVxuICAgICAgICBlbnRlckhvb2sgJiYgZW50ZXJIb29rKGVsLCBjYik7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBzdGFydCBlbnRlciB0cmFuc2l0aW9uXG4gICAgYmVmb3JlRW50ZXJIb29rICYmIGJlZm9yZUVudGVySG9vayhlbCk7XG4gICAgaWYgKGV4cGVjdHNDU1MpIHtcbiAgICAgIGFkZFRyYW5zaXRpb25DbGFzcyhlbCwgc3RhcnRDbGFzcyk7XG4gICAgICBhZGRUcmFuc2l0aW9uQ2xhc3MoZWwsIGFjdGl2ZUNsYXNzKTtcbiAgICAgIG5leHRGcmFtZShmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJlbW92ZVRyYW5zaXRpb25DbGFzcyhlbCwgc3RhcnRDbGFzcyk7XG4gICAgICAgIGlmICghY2IuY2FuY2VsbGVkKSB7XG4gICAgICAgICAgYWRkVHJhbnNpdGlvbkNsYXNzKGVsLCB0b0NsYXNzKTtcbiAgICAgICAgICBpZiAoIXVzZXJXYW50c0NvbnRyb2wpIHtcbiAgICAgICAgICAgIGlmIChpc1ZhbGlkRHVyYXRpb24oZXhwbGljaXRFbnRlckR1cmF0aW9uKSkge1xuICAgICAgICAgICAgICBzZXRUaW1lb3V0KGNiLCBleHBsaWNpdEVudGVyRHVyYXRpb24pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgd2hlblRyYW5zaXRpb25FbmRzKGVsLCB0eXBlLCBjYik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodm5vZGUuZGF0YS5zaG93KSB7XG4gICAgICB0b2dnbGVEaXNwbGF5ICYmIHRvZ2dsZURpc3BsYXkoKTtcbiAgICAgIGVudGVySG9vayAmJiBlbnRlckhvb2soZWwsIGNiKTtcbiAgICB9XG5cbiAgICBpZiAoIWV4cGVjdHNDU1MgJiYgIXVzZXJXYW50c0NvbnRyb2wpIHtcbiAgICAgIGNiKCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbGVhdmUgKHZub2RlLCBybSkge1xuICAgIHZhciBlbCA9IHZub2RlLmVsbTtcblxuICAgIC8vIGNhbGwgZW50ZXIgY2FsbGJhY2sgbm93XG4gICAgaWYgKGlzRGVmKGVsLl9lbnRlckNiKSkge1xuICAgICAgZWwuX2VudGVyQ2IuY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICAgIGVsLl9lbnRlckNiKCk7XG4gICAgfVxuXG4gICAgdmFyIGRhdGEgPSByZXNvbHZlVHJhbnNpdGlvbih2bm9kZS5kYXRhLnRyYW5zaXRpb24pO1xuICAgIGlmIChpc1VuZGVmKGRhdGEpIHx8IGVsLm5vZGVUeXBlICE9PSAxKSB7XG4gICAgICByZXR1cm4gcm0oKVxuICAgIH1cblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmIChpc0RlZihlbC5fbGVhdmVDYikpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHZhciBjc3MgPSBkYXRhLmNzcztcbiAgICB2YXIgdHlwZSA9IGRhdGEudHlwZTtcbiAgICB2YXIgbGVhdmVDbGFzcyA9IGRhdGEubGVhdmVDbGFzcztcbiAgICB2YXIgbGVhdmVUb0NsYXNzID0gZGF0YS5sZWF2ZVRvQ2xhc3M7XG4gICAgdmFyIGxlYXZlQWN0aXZlQ2xhc3MgPSBkYXRhLmxlYXZlQWN0aXZlQ2xhc3M7XG4gICAgdmFyIGJlZm9yZUxlYXZlID0gZGF0YS5iZWZvcmVMZWF2ZTtcbiAgICB2YXIgbGVhdmUgPSBkYXRhLmxlYXZlO1xuICAgIHZhciBhZnRlckxlYXZlID0gZGF0YS5hZnRlckxlYXZlO1xuICAgIHZhciBsZWF2ZUNhbmNlbGxlZCA9IGRhdGEubGVhdmVDYW5jZWxsZWQ7XG4gICAgdmFyIGRlbGF5TGVhdmUgPSBkYXRhLmRlbGF5TGVhdmU7XG4gICAgdmFyIGR1cmF0aW9uID0gZGF0YS5kdXJhdGlvbjtcblxuICAgIHZhciBleHBlY3RzQ1NTID0gY3NzICE9PSBmYWxzZSAmJiAhaXNJRTk7XG4gICAgdmFyIHVzZXJXYW50c0NvbnRyb2wgPSBnZXRIb29rQXJndW1lbnRzTGVuZ3RoKGxlYXZlKTtcblxuICAgIHZhciBleHBsaWNpdExlYXZlRHVyYXRpb24gPSB0b051bWJlcihcbiAgICAgIGlzT2JqZWN0KGR1cmF0aW9uKVxuICAgICAgICA/IGR1cmF0aW9uLmxlYXZlXG4gICAgICAgIDogZHVyYXRpb25cbiAgICApO1xuXG4gICAgaWYgKGlzRGVmKGV4cGxpY2l0TGVhdmVEdXJhdGlvbikpIHtcbiAgICAgIGNoZWNrRHVyYXRpb24oZXhwbGljaXRMZWF2ZUR1cmF0aW9uLCAnbGVhdmUnLCB2bm9kZSk7XG4gICAgfVxuXG4gICAgdmFyIGNiID0gZWwuX2xlYXZlQ2IgPSBvbmNlKGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChlbC5wYXJlbnROb2RlICYmIGVsLnBhcmVudE5vZGUuX3BlbmRpbmcpIHtcbiAgICAgICAgZWwucGFyZW50Tm9kZS5fcGVuZGluZ1t2bm9kZS5rZXldID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmIChleHBlY3RzQ1NTKSB7XG4gICAgICAgIHJlbW92ZVRyYW5zaXRpb25DbGFzcyhlbCwgbGVhdmVUb0NsYXNzKTtcbiAgICAgICAgcmVtb3ZlVHJhbnNpdGlvbkNsYXNzKGVsLCBsZWF2ZUFjdGl2ZUNsYXNzKTtcbiAgICAgIH1cbiAgICAgIGlmIChjYi5jYW5jZWxsZWQpIHtcbiAgICAgICAgaWYgKGV4cGVjdHNDU1MpIHtcbiAgICAgICAgICByZW1vdmVUcmFuc2l0aW9uQ2xhc3MoZWwsIGxlYXZlQ2xhc3MpO1xuICAgICAgICB9XG4gICAgICAgIGxlYXZlQ2FuY2VsbGVkICYmIGxlYXZlQ2FuY2VsbGVkKGVsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJtKCk7XG4gICAgICAgIGFmdGVyTGVhdmUgJiYgYWZ0ZXJMZWF2ZShlbCk7XG4gICAgICB9XG4gICAgICBlbC5fbGVhdmVDYiA9IG51bGw7XG4gICAgfSk7XG5cbiAgICBpZiAoZGVsYXlMZWF2ZSkge1xuICAgICAgZGVsYXlMZWF2ZShwZXJmb3JtTGVhdmUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwZXJmb3JtTGVhdmUoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwZXJmb3JtTGVhdmUgKCkge1xuICAgICAgLy8gdGhlIGRlbGF5ZWQgbGVhdmUgbWF5IGhhdmUgYWxyZWFkeSBiZWVuIGNhbmNlbGxlZFxuICAgICAgaWYgKGNiLmNhbmNlbGxlZCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIC8vIHJlY29yZCBsZWF2aW5nIGVsZW1lbnRcbiAgICAgIGlmICghdm5vZGUuZGF0YS5zaG93ICYmIGVsLnBhcmVudE5vZGUpIHtcbiAgICAgICAgKGVsLnBhcmVudE5vZGUuX3BlbmRpbmcgfHwgKGVsLnBhcmVudE5vZGUuX3BlbmRpbmcgPSB7fSkpWyh2bm9kZS5rZXkpXSA9IHZub2RlO1xuICAgICAgfVxuICAgICAgYmVmb3JlTGVhdmUgJiYgYmVmb3JlTGVhdmUoZWwpO1xuICAgICAgaWYgKGV4cGVjdHNDU1MpIHtcbiAgICAgICAgYWRkVHJhbnNpdGlvbkNsYXNzKGVsLCBsZWF2ZUNsYXNzKTtcbiAgICAgICAgYWRkVHJhbnNpdGlvbkNsYXNzKGVsLCBsZWF2ZUFjdGl2ZUNsYXNzKTtcbiAgICAgICAgbmV4dEZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZW1vdmVUcmFuc2l0aW9uQ2xhc3MoZWwsIGxlYXZlQ2xhc3MpO1xuICAgICAgICAgIGlmICghY2IuY2FuY2VsbGVkKSB7XG4gICAgICAgICAgICBhZGRUcmFuc2l0aW9uQ2xhc3MoZWwsIGxlYXZlVG9DbGFzcyk7XG4gICAgICAgICAgICBpZiAoIXVzZXJXYW50c0NvbnRyb2wpIHtcbiAgICAgICAgICAgICAgaWYgKGlzVmFsaWREdXJhdGlvbihleHBsaWNpdExlYXZlRHVyYXRpb24pKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChjYiwgZXhwbGljaXRMZWF2ZUR1cmF0aW9uKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3aGVuVHJhbnNpdGlvbkVuZHMoZWwsIHR5cGUsIGNiKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBsZWF2ZSAmJiBsZWF2ZShlbCwgY2IpO1xuICAgICAgaWYgKCFleHBlY3RzQ1NTICYmICF1c2VyV2FudHNDb250cm9sKSB7XG4gICAgICAgIGNiKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gb25seSB1c2VkIGluIGRldiBtb2RlXG4gIGZ1bmN0aW9uIGNoZWNrRHVyYXRpb24gKHZhbCwgbmFtZSwgdm5vZGUpIHtcbiAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ251bWJlcicpIHtcbiAgICAgIHdhcm4oXG4gICAgICAgIFwiPHRyYW5zaXRpb24+IGV4cGxpY2l0IFwiICsgbmFtZSArIFwiIGR1cmF0aW9uIGlzIG5vdCBhIHZhbGlkIG51bWJlciAtIFwiICtcbiAgICAgICAgXCJnb3QgXCIgKyAoSlNPTi5zdHJpbmdpZnkodmFsKSkgKyBcIi5cIixcbiAgICAgICAgdm5vZGUuY29udGV4dFxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKGlzTmFOKHZhbCkpIHtcbiAgICAgIHdhcm4oXG4gICAgICAgIFwiPHRyYW5zaXRpb24+IGV4cGxpY2l0IFwiICsgbmFtZSArIFwiIGR1cmF0aW9uIGlzIE5hTiAtIFwiICtcbiAgICAgICAgJ3RoZSBkdXJhdGlvbiBleHByZXNzaW9uIG1pZ2h0IGJlIGluY29ycmVjdC4nLFxuICAgICAgICB2bm9kZS5jb250ZXh0XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzVmFsaWREdXJhdGlvbiAodmFsKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdudW1iZXInICYmICFpc05hTih2YWwpXG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplIGEgdHJhbnNpdGlvbiBob29rJ3MgYXJndW1lbnQgbGVuZ3RoLiBUaGUgaG9vayBtYXkgYmU6XG4gICAqIC0gYSBtZXJnZWQgaG9vayAoaW52b2tlcikgd2l0aCB0aGUgb3JpZ2luYWwgaW4gLmZuc1xuICAgKiAtIGEgd3JhcHBlZCBjb21wb25lbnQgbWV0aG9kIChjaGVjayAuX2xlbmd0aClcbiAgICogLSBhIHBsYWluIGZ1bmN0aW9uICgubGVuZ3RoKVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0SG9va0FyZ3VtZW50c0xlbmd0aCAoZm4pIHtcbiAgICBpZiAoaXNVbmRlZihmbikpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICB2YXIgaW52b2tlckZucyA9IGZuLmZucztcbiAgICBpZiAoaXNEZWYoaW52b2tlckZucykpIHtcbiAgICAgIC8vIGludm9rZXJcbiAgICAgIHJldHVybiBnZXRIb29rQXJndW1lbnRzTGVuZ3RoKFxuICAgICAgICBBcnJheS5pc0FycmF5KGludm9rZXJGbnMpXG4gICAgICAgICAgPyBpbnZva2VyRm5zWzBdXG4gICAgICAgICAgOiBpbnZva2VyRm5zXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAoZm4uX2xlbmd0aCB8fCBmbi5sZW5ndGgpID4gMVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIF9lbnRlciAoXywgdm5vZGUpIHtcbiAgICBpZiAodm5vZGUuZGF0YS5zaG93ICE9PSB0cnVlKSB7XG4gICAgICBlbnRlcih2bm9kZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIHRyYW5zaXRpb24gPSBpbkJyb3dzZXIgPyB7XG4gICAgY3JlYXRlOiBfZW50ZXIsXG4gICAgYWN0aXZhdGU6IF9lbnRlcixcbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSQkMSAodm5vZGUsIHJtKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgICAgaWYgKHZub2RlLmRhdGEuc2hvdyAhPT0gdHJ1ZSkge1xuICAgICAgICBsZWF2ZSh2bm9kZSwgcm0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcm0oKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gOiB7fTtcblxuICB2YXIgcGxhdGZvcm1Nb2R1bGVzID0gW1xuICAgIGF0dHJzLFxuICAgIGtsYXNzLFxuICAgIGV2ZW50cyxcbiAgICBkb21Qcm9wcyxcbiAgICBzdHlsZSxcbiAgICB0cmFuc2l0aW9uXG4gIF07XG5cbiAgLyogICovXG5cbiAgLy8gdGhlIGRpcmVjdGl2ZSBtb2R1bGUgc2hvdWxkIGJlIGFwcGxpZWQgbGFzdCwgYWZ0ZXIgYWxsXG4gIC8vIGJ1aWx0LWluIG1vZHVsZXMgaGF2ZSBiZWVuIGFwcGxpZWQuXG4gIHZhciBtb2R1bGVzID0gcGxhdGZvcm1Nb2R1bGVzLmNvbmNhdChiYXNlTW9kdWxlcyk7XG5cbiAgdmFyIHBhdGNoID0gY3JlYXRlUGF0Y2hGdW5jdGlvbih7IG5vZGVPcHM6IG5vZGVPcHMsIG1vZHVsZXM6IG1vZHVsZXMgfSk7XG5cbiAgLyoqXG4gICAqIE5vdCB0eXBlIGNoZWNraW5nIHRoaXMgZmlsZSBiZWNhdXNlIGZsb3cgZG9lc24ndCBsaWtlIGF0dGFjaGluZ1xuICAgKiBwcm9wZXJ0aWVzIHRvIEVsZW1lbnRzLlxuICAgKi9cblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKGlzSUU5KSB7XG4gICAgLy8gaHR0cDovL3d3dy5tYXR0czQxMS5jb20vcG9zdC9pbnRlcm5ldC1leHBsb3Jlci05LW9uaW5wdXQvXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc2VsZWN0aW9uY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGVsID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgICAgIGlmIChlbCAmJiBlbC52bW9kZWwpIHtcbiAgICAgICAgdHJpZ2dlcihlbCwgJ2lucHV0Jyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICB2YXIgZGlyZWN0aXZlID0ge1xuICAgIGluc2VydGVkOiBmdW5jdGlvbiBpbnNlcnRlZCAoZWwsIGJpbmRpbmcsIHZub2RlLCBvbGRWbm9kZSkge1xuICAgICAgaWYgKHZub2RlLnRhZyA9PT0gJ3NlbGVjdCcpIHtcbiAgICAgICAgLy8gIzY5MDNcbiAgICAgICAgaWYgKG9sZFZub2RlLmVsbSAmJiAhb2xkVm5vZGUuZWxtLl92T3B0aW9ucykge1xuICAgICAgICAgIG1lcmdlVk5vZGVIb29rKHZub2RlLCAncG9zdHBhdGNoJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZGlyZWN0aXZlLmNvbXBvbmVudFVwZGF0ZWQoZWwsIGJpbmRpbmcsIHZub2RlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZXRTZWxlY3RlZChlbCwgYmluZGluZywgdm5vZGUuY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgZWwuX3ZPcHRpb25zID0gW10ubWFwLmNhbGwoZWwub3B0aW9ucywgZ2V0VmFsdWUpO1xuICAgICAgfSBlbHNlIGlmICh2bm9kZS50YWcgPT09ICd0ZXh0YXJlYScgfHwgaXNUZXh0SW5wdXRUeXBlKGVsLnR5cGUpKSB7XG4gICAgICAgIGVsLl92TW9kaWZpZXJzID0gYmluZGluZy5tb2RpZmllcnM7XG4gICAgICAgIGlmICghYmluZGluZy5tb2RpZmllcnMubGF6eSkge1xuICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbXBvc2l0aW9uc3RhcnQnLCBvbkNvbXBvc2l0aW9uU3RhcnQpO1xuICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbXBvc2l0aW9uZW5kJywgb25Db21wb3NpdGlvbkVuZCk7XG4gICAgICAgICAgLy8gU2FmYXJpIDwgMTAuMiAmIFVJV2ViVmlldyBkb2Vzbid0IGZpcmUgY29tcG9zaXRpb25lbmQgd2hlblxuICAgICAgICAgIC8vIHN3aXRjaGluZyBmb2N1cyBiZWZvcmUgY29uZmlybWluZyBjb21wb3NpdGlvbiBjaG9pY2VcbiAgICAgICAgICAvLyB0aGlzIGFsc28gZml4ZXMgdGhlIGlzc3VlIHdoZXJlIHNvbWUgYnJvd3NlcnMgZS5nLiBpT1MgQ2hyb21lXG4gICAgICAgICAgLy8gZmlyZXMgXCJjaGFuZ2VcIiBpbnN0ZWFkIG9mIFwiaW5wdXRcIiBvbiBhdXRvY29tcGxldGUuXG4gICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgb25Db21wb3NpdGlvbkVuZCk7XG4gICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgaWYgKGlzSUU5KSB7XG4gICAgICAgICAgICBlbC52bW9kZWwgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRVcGRhdGVkOiBmdW5jdGlvbiBjb21wb25lbnRVcGRhdGVkIChlbCwgYmluZGluZywgdm5vZGUpIHtcbiAgICAgIGlmICh2bm9kZS50YWcgPT09ICdzZWxlY3QnKSB7XG4gICAgICAgIHNldFNlbGVjdGVkKGVsLCBiaW5kaW5nLCB2bm9kZS5jb250ZXh0KTtcbiAgICAgICAgLy8gaW4gY2FzZSB0aGUgb3B0aW9ucyByZW5kZXJlZCBieSB2LWZvciBoYXZlIGNoYW5nZWQsXG4gICAgICAgIC8vIGl0J3MgcG9zc2libGUgdGhhdCB0aGUgdmFsdWUgaXMgb3V0LW9mLXN5bmMgd2l0aCB0aGUgcmVuZGVyZWQgb3B0aW9ucy5cbiAgICAgICAgLy8gZGV0ZWN0IHN1Y2ggY2FzZXMgYW5kIGZpbHRlciBvdXQgdmFsdWVzIHRoYXQgbm8gbG9uZ2VyIGhhcyBhIG1hdGNoaW5nXG4gICAgICAgIC8vIG9wdGlvbiBpbiB0aGUgRE9NLlxuICAgICAgICB2YXIgcHJldk9wdGlvbnMgPSBlbC5fdk9wdGlvbnM7XG4gICAgICAgIHZhciBjdXJPcHRpb25zID0gZWwuX3ZPcHRpb25zID0gW10ubWFwLmNhbGwoZWwub3B0aW9ucywgZ2V0VmFsdWUpO1xuICAgICAgICBpZiAoY3VyT3B0aW9ucy5zb21lKGZ1bmN0aW9uIChvLCBpKSB7IHJldHVybiAhbG9vc2VFcXVhbChvLCBwcmV2T3B0aW9uc1tpXSk7IH0pKSB7XG4gICAgICAgICAgLy8gdHJpZ2dlciBjaGFuZ2UgZXZlbnQgaWZcbiAgICAgICAgICAvLyBubyBtYXRjaGluZyBvcHRpb24gZm91bmQgZm9yIGF0IGxlYXN0IG9uZSB2YWx1ZVxuICAgICAgICAgIHZhciBuZWVkUmVzZXQgPSBlbC5tdWx0aXBsZVxuICAgICAgICAgICAgPyBiaW5kaW5nLnZhbHVlLnNvbWUoZnVuY3Rpb24gKHYpIHsgcmV0dXJuIGhhc05vTWF0Y2hpbmdPcHRpb24odiwgY3VyT3B0aW9ucyk7IH0pXG4gICAgICAgICAgICA6IGJpbmRpbmcudmFsdWUgIT09IGJpbmRpbmcub2xkVmFsdWUgJiYgaGFzTm9NYXRjaGluZ09wdGlvbihiaW5kaW5nLnZhbHVlLCBjdXJPcHRpb25zKTtcbiAgICAgICAgICBpZiAobmVlZFJlc2V0KSB7XG4gICAgICAgICAgICB0cmlnZ2VyKGVsLCAnY2hhbmdlJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIHNldFNlbGVjdGVkIChlbCwgYmluZGluZywgdm0pIHtcbiAgICBhY3R1YWxseVNldFNlbGVjdGVkKGVsLCBiaW5kaW5nLCB2bSk7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKGlzSUUgfHwgaXNFZGdlKSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYWN0dWFsbHlTZXRTZWxlY3RlZChlbCwgYmluZGluZywgdm0pO1xuICAgICAgfSwgMCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYWN0dWFsbHlTZXRTZWxlY3RlZCAoZWwsIGJpbmRpbmcsIHZtKSB7XG4gICAgdmFyIHZhbHVlID0gYmluZGluZy52YWx1ZTtcbiAgICB2YXIgaXNNdWx0aXBsZSA9IGVsLm11bHRpcGxlO1xuICAgIGlmIChpc011bHRpcGxlICYmICFBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgd2FybihcbiAgICAgICAgXCI8c2VsZWN0IG11bHRpcGxlIHYtbW9kZWw9XFxcIlwiICsgKGJpbmRpbmcuZXhwcmVzc2lvbikgKyBcIlxcXCI+IFwiICtcbiAgICAgICAgXCJleHBlY3RzIGFuIEFycmF5IHZhbHVlIGZvciBpdHMgYmluZGluZywgYnV0IGdvdCBcIiArIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLnNsaWNlKDgsIC0xKSksXG4gICAgICAgIHZtXG4gICAgICApO1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZhciBzZWxlY3RlZCwgb3B0aW9uO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gZWwub3B0aW9ucy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIG9wdGlvbiA9IGVsLm9wdGlvbnNbaV07XG4gICAgICBpZiAoaXNNdWx0aXBsZSkge1xuICAgICAgICBzZWxlY3RlZCA9IGxvb3NlSW5kZXhPZih2YWx1ZSwgZ2V0VmFsdWUob3B0aW9uKSkgPiAtMTtcbiAgICAgICAgaWYgKG9wdGlvbi5zZWxlY3RlZCAhPT0gc2VsZWN0ZWQpIHtcbiAgICAgICAgICBvcHRpb24uc2VsZWN0ZWQgPSBzZWxlY3RlZDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGxvb3NlRXF1YWwoZ2V0VmFsdWUob3B0aW9uKSwgdmFsdWUpKSB7XG4gICAgICAgICAgaWYgKGVsLnNlbGVjdGVkSW5kZXggIT09IGkpIHtcbiAgICAgICAgICAgIGVsLnNlbGVjdGVkSW5kZXggPSBpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWlzTXVsdGlwbGUpIHtcbiAgICAgIGVsLnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBoYXNOb01hdGNoaW5nT3B0aW9uICh2YWx1ZSwgb3B0aW9ucykge1xuICAgIHJldHVybiBvcHRpb25zLmV2ZXJ5KGZ1bmN0aW9uIChvKSB7IHJldHVybiAhbG9vc2VFcXVhbChvLCB2YWx1ZSk7IH0pXG4gIH1cblxuICBmdW5jdGlvbiBnZXRWYWx1ZSAob3B0aW9uKSB7XG4gICAgcmV0dXJuICdfdmFsdWUnIGluIG9wdGlvblxuICAgICAgPyBvcHRpb24uX3ZhbHVlXG4gICAgICA6IG9wdGlvbi52YWx1ZVxuICB9XG5cbiAgZnVuY3Rpb24gb25Db21wb3NpdGlvblN0YXJ0IChlKSB7XG4gICAgZS50YXJnZXQuY29tcG9zaW5nID0gdHJ1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uQ29tcG9zaXRpb25FbmQgKGUpIHtcbiAgICAvLyBwcmV2ZW50IHRyaWdnZXJpbmcgYW4gaW5wdXQgZXZlbnQgZm9yIG5vIHJlYXNvblxuICAgIGlmICghZS50YXJnZXQuY29tcG9zaW5nKSB7IHJldHVybiB9XG4gICAgZS50YXJnZXQuY29tcG9zaW5nID0gZmFsc2U7XG4gICAgdHJpZ2dlcihlLnRhcmdldCwgJ2lucHV0Jyk7XG4gIH1cblxuICBmdW5jdGlvbiB0cmlnZ2VyIChlbCwgdHlwZSkge1xuICAgIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0hUTUxFdmVudHMnKTtcbiAgICBlLmluaXRFdmVudCh0eXBlLCB0cnVlLCB0cnVlKTtcbiAgICBlbC5kaXNwYXRjaEV2ZW50KGUpO1xuICB9XG5cbiAgLyogICovXG5cbiAgLy8gcmVjdXJzaXZlbHkgc2VhcmNoIGZvciBwb3NzaWJsZSB0cmFuc2l0aW9uIGRlZmluZWQgaW5zaWRlIHRoZSBjb21wb25lbnQgcm9vdFxuICBmdW5jdGlvbiBsb2NhdGVOb2RlICh2bm9kZSkge1xuICAgIHJldHVybiB2bm9kZS5jb21wb25lbnRJbnN0YW5jZSAmJiAoIXZub2RlLmRhdGEgfHwgIXZub2RlLmRhdGEudHJhbnNpdGlvbilcbiAgICAgID8gbG9jYXRlTm9kZSh2bm9kZS5jb21wb25lbnRJbnN0YW5jZS5fdm5vZGUpXG4gICAgICA6IHZub2RlXG4gIH1cblxuICB2YXIgc2hvdyA9IHtcbiAgICBiaW5kOiBmdW5jdGlvbiBiaW5kIChlbCwgcmVmLCB2bm9kZSkge1xuICAgICAgdmFyIHZhbHVlID0gcmVmLnZhbHVlO1xuXG4gICAgICB2bm9kZSA9IGxvY2F0ZU5vZGUodm5vZGUpO1xuICAgICAgdmFyIHRyYW5zaXRpb24kJDEgPSB2bm9kZS5kYXRhICYmIHZub2RlLmRhdGEudHJhbnNpdGlvbjtcbiAgICAgIHZhciBvcmlnaW5hbERpc3BsYXkgPSBlbC5fX3ZPcmlnaW5hbERpc3BsYXkgPVxuICAgICAgICBlbC5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZScgPyAnJyA6IGVsLnN0eWxlLmRpc3BsYXk7XG4gICAgICBpZiAodmFsdWUgJiYgdHJhbnNpdGlvbiQkMSkge1xuICAgICAgICB2bm9kZS5kYXRhLnNob3cgPSB0cnVlO1xuICAgICAgICBlbnRlcih2bm9kZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSBvcmlnaW5hbERpc3BsYXk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9IHZhbHVlID8gb3JpZ2luYWxEaXNwbGF5IDogJ25vbmUnO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSAoZWwsIHJlZiwgdm5vZGUpIHtcbiAgICAgIHZhciB2YWx1ZSA9IHJlZi52YWx1ZTtcbiAgICAgIHZhciBvbGRWYWx1ZSA9IHJlZi5vbGRWYWx1ZTtcblxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICBpZiAoIXZhbHVlID09PSAhb2xkVmFsdWUpIHsgcmV0dXJuIH1cbiAgICAgIHZub2RlID0gbG9jYXRlTm9kZSh2bm9kZSk7XG4gICAgICB2YXIgdHJhbnNpdGlvbiQkMSA9IHZub2RlLmRhdGEgJiYgdm5vZGUuZGF0YS50cmFuc2l0aW9uO1xuICAgICAgaWYgKHRyYW5zaXRpb24kJDEpIHtcbiAgICAgICAgdm5vZGUuZGF0YS5zaG93ID0gdHJ1ZTtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgZW50ZXIodm5vZGUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSBlbC5fX3ZPcmlnaW5hbERpc3BsYXk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGVhdmUodm5vZGUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSB2YWx1ZSA/IGVsLl9fdk9yaWdpbmFsRGlzcGxheSA6ICdub25lJztcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgdW5iaW5kOiBmdW5jdGlvbiB1bmJpbmQgKFxuICAgICAgZWwsXG4gICAgICBiaW5kaW5nLFxuICAgICAgdm5vZGUsXG4gICAgICBvbGRWbm9kZSxcbiAgICAgIGlzRGVzdHJveVxuICAgICkge1xuICAgICAgaWYgKCFpc0Rlc3Ryb3kpIHtcbiAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9IGVsLl9fdk9yaWdpbmFsRGlzcGxheTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgdmFyIHBsYXRmb3JtRGlyZWN0aXZlcyA9IHtcbiAgICBtb2RlbDogZGlyZWN0aXZlLFxuICAgIHNob3c6IHNob3dcbiAgfTtcblxuICAvKiAgKi9cblxuICB2YXIgdHJhbnNpdGlvblByb3BzID0ge1xuICAgIG5hbWU6IFN0cmluZyxcbiAgICBhcHBlYXI6IEJvb2xlYW4sXG4gICAgY3NzOiBCb29sZWFuLFxuICAgIG1vZGU6IFN0cmluZyxcbiAgICB0eXBlOiBTdHJpbmcsXG4gICAgZW50ZXJDbGFzczogU3RyaW5nLFxuICAgIGxlYXZlQ2xhc3M6IFN0cmluZyxcbiAgICBlbnRlclRvQ2xhc3M6IFN0cmluZyxcbiAgICBsZWF2ZVRvQ2xhc3M6IFN0cmluZyxcbiAgICBlbnRlckFjdGl2ZUNsYXNzOiBTdHJpbmcsXG4gICAgbGVhdmVBY3RpdmVDbGFzczogU3RyaW5nLFxuICAgIGFwcGVhckNsYXNzOiBTdHJpbmcsXG4gICAgYXBwZWFyQWN0aXZlQ2xhc3M6IFN0cmluZyxcbiAgICBhcHBlYXJUb0NsYXNzOiBTdHJpbmcsXG4gICAgZHVyYXRpb246IFtOdW1iZXIsIFN0cmluZywgT2JqZWN0XVxuICB9O1xuXG4gIC8vIGluIGNhc2UgdGhlIGNoaWxkIGlzIGFsc28gYW4gYWJzdHJhY3QgY29tcG9uZW50LCBlLmcuIDxrZWVwLWFsaXZlPlxuICAvLyB3ZSB3YW50IHRvIHJlY3Vyc2l2ZWx5IHJldHJpZXZlIHRoZSByZWFsIGNvbXBvbmVudCB0byBiZSByZW5kZXJlZFxuICBmdW5jdGlvbiBnZXRSZWFsQ2hpbGQgKHZub2RlKSB7XG4gICAgdmFyIGNvbXBPcHRpb25zID0gdm5vZGUgJiYgdm5vZGUuY29tcG9uZW50T3B0aW9ucztcbiAgICBpZiAoY29tcE9wdGlvbnMgJiYgY29tcE9wdGlvbnMuQ3Rvci5vcHRpb25zLmFic3RyYWN0KSB7XG4gICAgICByZXR1cm4gZ2V0UmVhbENoaWxkKGdldEZpcnN0Q29tcG9uZW50Q2hpbGQoY29tcE9wdGlvbnMuY2hpbGRyZW4pKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdm5vZGVcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBleHRyYWN0VHJhbnNpdGlvbkRhdGEgKGNvbXApIHtcbiAgICB2YXIgZGF0YSA9IHt9O1xuICAgIHZhciBvcHRpb25zID0gY29tcC4kb3B0aW9ucztcbiAgICAvLyBwcm9wc1xuICAgIGZvciAodmFyIGtleSBpbiBvcHRpb25zLnByb3BzRGF0YSkge1xuICAgICAgZGF0YVtrZXldID0gY29tcFtrZXldO1xuICAgIH1cbiAgICAvLyBldmVudHMuXG4gICAgLy8gZXh0cmFjdCBsaXN0ZW5lcnMgYW5kIHBhc3MgdGhlbSBkaXJlY3RseSB0byB0aGUgdHJhbnNpdGlvbiBtZXRob2RzXG4gICAgdmFyIGxpc3RlbmVycyA9IG9wdGlvbnMuX3BhcmVudExpc3RlbmVycztcbiAgICBmb3IgKHZhciBrZXkkMSBpbiBsaXN0ZW5lcnMpIHtcbiAgICAgIGRhdGFbY2FtZWxpemUoa2V5JDEpXSA9IGxpc3RlbmVyc1trZXkkMV07XG4gICAgfVxuICAgIHJldHVybiBkYXRhXG4gIH1cblxuICBmdW5jdGlvbiBwbGFjZWhvbGRlciAoaCwgcmF3Q2hpbGQpIHtcbiAgICBpZiAoL1xcZC1rZWVwLWFsaXZlJC8udGVzdChyYXdDaGlsZC50YWcpKSB7XG4gICAgICByZXR1cm4gaCgna2VlcC1hbGl2ZScsIHtcbiAgICAgICAgcHJvcHM6IHJhd0NoaWxkLmNvbXBvbmVudE9wdGlvbnMucHJvcHNEYXRhXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGhhc1BhcmVudFRyYW5zaXRpb24gKHZub2RlKSB7XG4gICAgd2hpbGUgKCh2bm9kZSA9IHZub2RlLnBhcmVudCkpIHtcbiAgICAgIGlmICh2bm9kZS5kYXRhLnRyYW5zaXRpb24pIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpc1NhbWVDaGlsZCAoY2hpbGQsIG9sZENoaWxkKSB7XG4gICAgcmV0dXJuIG9sZENoaWxkLmtleSA9PT0gY2hpbGQua2V5ICYmIG9sZENoaWxkLnRhZyA9PT0gY2hpbGQudGFnXG4gIH1cblxuICB2YXIgaXNOb3RUZXh0Tm9kZSA9IGZ1bmN0aW9uIChjKSB7IHJldHVybiBjLnRhZyB8fCBpc0FzeW5jUGxhY2Vob2xkZXIoYyk7IH07XG5cbiAgdmFyIGlzVlNob3dEaXJlY3RpdmUgPSBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5uYW1lID09PSAnc2hvdyc7IH07XG5cbiAgdmFyIFRyYW5zaXRpb24gPSB7XG4gICAgbmFtZTogJ3RyYW5zaXRpb24nLFxuICAgIHByb3BzOiB0cmFuc2l0aW9uUHJvcHMsXG4gICAgYWJzdHJhY3Q6IHRydWUsXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlciAoaCkge1xuICAgICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMuJHNsb3RzLmRlZmF1bHQ7XG4gICAgICBpZiAoIWNoaWxkcmVuKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICAvLyBmaWx0ZXIgb3V0IHRleHQgbm9kZXMgKHBvc3NpYmxlIHdoaXRlc3BhY2VzKVxuICAgICAgY2hpbGRyZW4gPSBjaGlsZHJlbi5maWx0ZXIoaXNOb3RUZXh0Tm9kZSk7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmICghY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICAvLyB3YXJuIG11bHRpcGxlIGVsZW1lbnRzXG4gICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gMSkge1xuICAgICAgICB3YXJuKFxuICAgICAgICAgICc8dHJhbnNpdGlvbj4gY2FuIG9ubHkgYmUgdXNlZCBvbiBhIHNpbmdsZSBlbGVtZW50LiBVc2UgJyArXG4gICAgICAgICAgJzx0cmFuc2l0aW9uLWdyb3VwPiBmb3IgbGlzdHMuJyxcbiAgICAgICAgICB0aGlzLiRwYXJlbnRcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgdmFyIG1vZGUgPSB0aGlzLm1vZGU7XG5cbiAgICAgIC8vIHdhcm4gaW52YWxpZCBtb2RlXG4gICAgICBpZiAobW9kZSAmJiBtb2RlICE9PSAnaW4tb3V0JyAmJiBtb2RlICE9PSAnb3V0LWluJ1xuICAgICAgKSB7XG4gICAgICAgIHdhcm4oXG4gICAgICAgICAgJ2ludmFsaWQgPHRyYW5zaXRpb24+IG1vZGU6ICcgKyBtb2RlLFxuICAgICAgICAgIHRoaXMuJHBhcmVudFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmF3Q2hpbGQgPSBjaGlsZHJlblswXTtcblxuICAgICAgLy8gaWYgdGhpcyBpcyBhIGNvbXBvbmVudCByb290IG5vZGUgYW5kIHRoZSBjb21wb25lbnQnc1xuICAgICAgLy8gcGFyZW50IGNvbnRhaW5lciBub2RlIGFsc28gaGFzIHRyYW5zaXRpb24sIHNraXAuXG4gICAgICBpZiAoaGFzUGFyZW50VHJhbnNpdGlvbih0aGlzLiR2bm9kZSkpIHtcbiAgICAgICAgcmV0dXJuIHJhd0NoaWxkXG4gICAgICB9XG5cbiAgICAgIC8vIGFwcGx5IHRyYW5zaXRpb24gZGF0YSB0byBjaGlsZFxuICAgICAgLy8gdXNlIGdldFJlYWxDaGlsZCgpIHRvIGlnbm9yZSBhYnN0cmFjdCBjb21wb25lbnRzIGUuZy4ga2VlcC1hbGl2ZVxuICAgICAgdmFyIGNoaWxkID0gZ2V0UmVhbENoaWxkKHJhd0NoaWxkKTtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgaWYgKCFjaGlsZCkge1xuICAgICAgICByZXR1cm4gcmF3Q2hpbGRcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2xlYXZpbmcpIHtcbiAgICAgICAgcmV0dXJuIHBsYWNlaG9sZGVyKGgsIHJhd0NoaWxkKVxuICAgICAgfVxuXG4gICAgICAvLyBlbnN1cmUgYSBrZXkgdGhhdCBpcyB1bmlxdWUgdG8gdGhlIHZub2RlIHR5cGUgYW5kIHRvIHRoaXMgdHJhbnNpdGlvblxuICAgICAgLy8gY29tcG9uZW50IGluc3RhbmNlLiBUaGlzIGtleSB3aWxsIGJlIHVzZWQgdG8gcmVtb3ZlIHBlbmRpbmcgbGVhdmluZyBub2Rlc1xuICAgICAgLy8gZHVyaW5nIGVudGVyaW5nLlxuICAgICAgdmFyIGlkID0gXCJfX3RyYW5zaXRpb24tXCIgKyAodGhpcy5fdWlkKSArIFwiLVwiO1xuICAgICAgY2hpbGQua2V5ID0gY2hpbGQua2V5ID09IG51bGxcbiAgICAgICAgPyBjaGlsZC5pc0NvbW1lbnRcbiAgICAgICAgICA/IGlkICsgJ2NvbW1lbnQnXG4gICAgICAgICAgOiBpZCArIGNoaWxkLnRhZ1xuICAgICAgICA6IGlzUHJpbWl0aXZlKGNoaWxkLmtleSlcbiAgICAgICAgICA/IChTdHJpbmcoY2hpbGQua2V5KS5pbmRleE9mKGlkKSA9PT0gMCA/IGNoaWxkLmtleSA6IGlkICsgY2hpbGQua2V5KVxuICAgICAgICAgIDogY2hpbGQua2V5O1xuXG4gICAgICB2YXIgZGF0YSA9IChjaGlsZC5kYXRhIHx8IChjaGlsZC5kYXRhID0ge30pKS50cmFuc2l0aW9uID0gZXh0cmFjdFRyYW5zaXRpb25EYXRhKHRoaXMpO1xuICAgICAgdmFyIG9sZFJhd0NoaWxkID0gdGhpcy5fdm5vZGU7XG4gICAgICB2YXIgb2xkQ2hpbGQgPSBnZXRSZWFsQ2hpbGQob2xkUmF3Q2hpbGQpO1xuXG4gICAgICAvLyBtYXJrIHYtc2hvd1xuICAgICAgLy8gc28gdGhhdCB0aGUgdHJhbnNpdGlvbiBtb2R1bGUgY2FuIGhhbmQgb3ZlciB0aGUgY29udHJvbCB0byB0aGUgZGlyZWN0aXZlXG4gICAgICBpZiAoY2hpbGQuZGF0YS5kaXJlY3RpdmVzICYmIGNoaWxkLmRhdGEuZGlyZWN0aXZlcy5zb21lKGlzVlNob3dEaXJlY3RpdmUpKSB7XG4gICAgICAgIGNoaWxkLmRhdGEuc2hvdyA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChcbiAgICAgICAgb2xkQ2hpbGQgJiZcbiAgICAgICAgb2xkQ2hpbGQuZGF0YSAmJlxuICAgICAgICAhaXNTYW1lQ2hpbGQoY2hpbGQsIG9sZENoaWxkKSAmJlxuICAgICAgICAhaXNBc3luY1BsYWNlaG9sZGVyKG9sZENoaWxkKSAmJlxuICAgICAgICAvLyAjNjY4NyBjb21wb25lbnQgcm9vdCBpcyBhIGNvbW1lbnQgbm9kZVxuICAgICAgICAhKG9sZENoaWxkLmNvbXBvbmVudEluc3RhbmNlICYmIG9sZENoaWxkLmNvbXBvbmVudEluc3RhbmNlLl92bm9kZS5pc0NvbW1lbnQpXG4gICAgICApIHtcbiAgICAgICAgLy8gcmVwbGFjZSBvbGQgY2hpbGQgdHJhbnNpdGlvbiBkYXRhIHdpdGggZnJlc2ggb25lXG4gICAgICAgIC8vIGltcG9ydGFudCBmb3IgZHluYW1pYyB0cmFuc2l0aW9ucyFcbiAgICAgICAgdmFyIG9sZERhdGEgPSBvbGRDaGlsZC5kYXRhLnRyYW5zaXRpb24gPSBleHRlbmQoe30sIGRhdGEpO1xuICAgICAgICAvLyBoYW5kbGUgdHJhbnNpdGlvbiBtb2RlXG4gICAgICAgIGlmIChtb2RlID09PSAnb3V0LWluJykge1xuICAgICAgICAgIC8vIHJldHVybiBwbGFjZWhvbGRlciBub2RlIGFuZCBxdWV1ZSB1cGRhdGUgd2hlbiBsZWF2ZSBmaW5pc2hlc1xuICAgICAgICAgIHRoaXMuX2xlYXZpbmcgPSB0cnVlO1xuICAgICAgICAgIG1lcmdlVk5vZGVIb29rKG9sZERhdGEsICdhZnRlckxlYXZlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcyQxLl9sZWF2aW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzJDEuJGZvcmNlVXBkYXRlKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHBsYWNlaG9sZGVyKGgsIHJhd0NoaWxkKVxuICAgICAgICB9IGVsc2UgaWYgKG1vZGUgPT09ICdpbi1vdXQnKSB7XG4gICAgICAgICAgaWYgKGlzQXN5bmNQbGFjZWhvbGRlcihjaGlsZCkpIHtcbiAgICAgICAgICAgIHJldHVybiBvbGRSYXdDaGlsZFxuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgZGVsYXllZExlYXZlO1xuICAgICAgICAgIHZhciBwZXJmb3JtTGVhdmUgPSBmdW5jdGlvbiAoKSB7IGRlbGF5ZWRMZWF2ZSgpOyB9O1xuICAgICAgICAgIG1lcmdlVk5vZGVIb29rKGRhdGEsICdhZnRlckVudGVyJywgcGVyZm9ybUxlYXZlKTtcbiAgICAgICAgICBtZXJnZVZOb2RlSG9vayhkYXRhLCAnZW50ZXJDYW5jZWxsZWQnLCBwZXJmb3JtTGVhdmUpO1xuICAgICAgICAgIG1lcmdlVk5vZGVIb29rKG9sZERhdGEsICdkZWxheUxlYXZlJywgZnVuY3Rpb24gKGxlYXZlKSB7IGRlbGF5ZWRMZWF2ZSA9IGxlYXZlOyB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmF3Q2hpbGRcbiAgICB9XG4gIH07XG5cbiAgLyogICovXG5cbiAgdmFyIHByb3BzID0gZXh0ZW5kKHtcbiAgICB0YWc6IFN0cmluZyxcbiAgICBtb3ZlQ2xhc3M6IFN0cmluZ1xuICB9LCB0cmFuc2l0aW9uUHJvcHMpO1xuXG4gIGRlbGV0ZSBwcm9wcy5tb2RlO1xuXG4gIHZhciBUcmFuc2l0aW9uR3JvdXAgPSB7XG4gICAgcHJvcHM6IHByb3BzLFxuXG4gICAgYmVmb3JlTW91bnQ6IGZ1bmN0aW9uIGJlZm9yZU1vdW50ICgpIHtcbiAgICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gICAgICB2YXIgdXBkYXRlID0gdGhpcy5fdXBkYXRlO1xuICAgICAgdGhpcy5fdXBkYXRlID0gZnVuY3Rpb24gKHZub2RlLCBoeWRyYXRpbmcpIHtcbiAgICAgICAgdmFyIHJlc3RvcmVBY3RpdmVJbnN0YW5jZSA9IHNldEFjdGl2ZUluc3RhbmNlKHRoaXMkMSk7XG4gICAgICAgIC8vIGZvcmNlIHJlbW92aW5nIHBhc3NcbiAgICAgICAgdGhpcyQxLl9fcGF0Y2hfXyhcbiAgICAgICAgICB0aGlzJDEuX3Zub2RlLFxuICAgICAgICAgIHRoaXMkMS5rZXB0LFxuICAgICAgICAgIGZhbHNlLCAvLyBoeWRyYXRpbmdcbiAgICAgICAgICB0cnVlIC8vIHJlbW92ZU9ubHkgKCFpbXBvcnRhbnQsIGF2b2lkcyB1bm5lY2Vzc2FyeSBtb3ZlcylcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcyQxLl92bm9kZSA9IHRoaXMkMS5rZXB0O1xuICAgICAgICByZXN0b3JlQWN0aXZlSW5zdGFuY2UoKTtcbiAgICAgICAgdXBkYXRlLmNhbGwodGhpcyQxLCB2bm9kZSwgaHlkcmF0aW5nKTtcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyIChoKSB7XG4gICAgICB2YXIgdGFnID0gdGhpcy50YWcgfHwgdGhpcy4kdm5vZGUuZGF0YS50YWcgfHwgJ3NwYW4nO1xuICAgICAgdmFyIG1hcCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICB2YXIgcHJldkNoaWxkcmVuID0gdGhpcy5wcmV2Q2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuO1xuICAgICAgdmFyIHJhd0NoaWxkcmVuID0gdGhpcy4kc2xvdHMuZGVmYXVsdCB8fCBbXTtcbiAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW4gPSBbXTtcbiAgICAgIHZhciB0cmFuc2l0aW9uRGF0YSA9IGV4dHJhY3RUcmFuc2l0aW9uRGF0YSh0aGlzKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYXdDaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYyA9IHJhd0NoaWxkcmVuW2ldO1xuICAgICAgICBpZiAoYy50YWcpIHtcbiAgICAgICAgICBpZiAoYy5rZXkgIT0gbnVsbCAmJiBTdHJpbmcoYy5rZXkpLmluZGV4T2YoJ19fdmxpc3QnKSAhPT0gMCkge1xuICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChjKTtcbiAgICAgICAgICAgIG1hcFtjLmtleV0gPSBjXG4gICAgICAgICAgICA7KGMuZGF0YSB8fCAoYy5kYXRhID0ge30pKS50cmFuc2l0aW9uID0gdHJhbnNpdGlvbkRhdGE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBvcHRzID0gYy5jb21wb25lbnRPcHRpb25zO1xuICAgICAgICAgICAgdmFyIG5hbWUgPSBvcHRzID8gKG9wdHMuQ3Rvci5vcHRpb25zLm5hbWUgfHwgb3B0cy50YWcgfHwgJycpIDogYy50YWc7XG4gICAgICAgICAgICB3YXJuKChcIjx0cmFuc2l0aW9uLWdyb3VwPiBjaGlsZHJlbiBtdXN0IGJlIGtleWVkOiA8XCIgKyBuYW1lICsgXCI+XCIpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHByZXZDaGlsZHJlbikge1xuICAgICAgICB2YXIga2VwdCA9IFtdO1xuICAgICAgICB2YXIgcmVtb3ZlZCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpJDEgPSAwOyBpJDEgPCBwcmV2Q2hpbGRyZW4ubGVuZ3RoOyBpJDErKykge1xuICAgICAgICAgIHZhciBjJDEgPSBwcmV2Q2hpbGRyZW5baSQxXTtcbiAgICAgICAgICBjJDEuZGF0YS50cmFuc2l0aW9uID0gdHJhbnNpdGlvbkRhdGE7XG4gICAgICAgICAgYyQxLmRhdGEucG9zID0gYyQxLmVsbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICBpZiAobWFwW2MkMS5rZXldKSB7XG4gICAgICAgICAgICBrZXB0LnB1c2goYyQxKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVtb3ZlZC5wdXNoKGMkMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMua2VwdCA9IGgodGFnLCBudWxsLCBrZXB0KTtcbiAgICAgICAgdGhpcy5yZW1vdmVkID0gcmVtb3ZlZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGgodGFnLCBudWxsLCBjaGlsZHJlbilcbiAgICB9LFxuXG4gICAgdXBkYXRlZDogZnVuY3Rpb24gdXBkYXRlZCAoKSB7XG4gICAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLnByZXZDaGlsZHJlbjtcbiAgICAgIHZhciBtb3ZlQ2xhc3MgPSB0aGlzLm1vdmVDbGFzcyB8fCAoKHRoaXMubmFtZSB8fCAndicpICsgJy1tb3ZlJyk7XG4gICAgICBpZiAoIWNoaWxkcmVuLmxlbmd0aCB8fCAhdGhpcy5oYXNNb3ZlKGNoaWxkcmVuWzBdLmVsbSwgbW92ZUNsYXNzKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgLy8gd2UgZGl2aWRlIHRoZSB3b3JrIGludG8gdGhyZWUgbG9vcHMgdG8gYXZvaWQgbWl4aW5nIERPTSByZWFkcyBhbmQgd3JpdGVzXG4gICAgICAvLyBpbiBlYWNoIGl0ZXJhdGlvbiAtIHdoaWNoIGhlbHBzIHByZXZlbnQgbGF5b3V0IHRocmFzaGluZy5cbiAgICAgIGNoaWxkcmVuLmZvckVhY2goY2FsbFBlbmRpbmdDYnMpO1xuICAgICAgY2hpbGRyZW4uZm9yRWFjaChyZWNvcmRQb3NpdGlvbik7XG4gICAgICBjaGlsZHJlbi5mb3JFYWNoKGFwcGx5VHJhbnNsYXRpb24pO1xuXG4gICAgICAvLyBmb3JjZSByZWZsb3cgdG8gcHV0IGV2ZXJ5dGhpbmcgaW4gcG9zaXRpb25cbiAgICAgIC8vIGFzc2lnbiB0byB0aGlzIHRvIGF2b2lkIGJlaW5nIHJlbW92ZWQgaW4gdHJlZS1zaGFraW5nXG4gICAgICAvLyAkZmxvdy1kaXNhYmxlLWxpbmVcbiAgICAgIHRoaXMuX3JlZmxvdyA9IGRvY3VtZW50LmJvZHkub2Zmc2V0SGVpZ2h0O1xuXG4gICAgICBjaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgIGlmIChjLmRhdGEubW92ZWQpIHtcbiAgICAgICAgICB2YXIgZWwgPSBjLmVsbTtcbiAgICAgICAgICB2YXIgcyA9IGVsLnN0eWxlO1xuICAgICAgICAgIGFkZFRyYW5zaXRpb25DbGFzcyhlbCwgbW92ZUNsYXNzKTtcbiAgICAgICAgICBzLnRyYW5zZm9ybSA9IHMuV2Via2l0VHJhbnNmb3JtID0gcy50cmFuc2l0aW9uRHVyYXRpb24gPSAnJztcbiAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKHRyYW5zaXRpb25FbmRFdmVudCwgZWwuX21vdmVDYiA9IGZ1bmN0aW9uIGNiIChlKSB7XG4gICAgICAgICAgICBpZiAoZSAmJiBlLnRhcmdldCAhPT0gZWwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWUgfHwgL3RyYW5zZm9ybSQvLnRlc3QoZS5wcm9wZXJ0eU5hbWUpKSB7XG4gICAgICAgICAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIodHJhbnNpdGlvbkVuZEV2ZW50LCBjYik7XG4gICAgICAgICAgICAgIGVsLl9tb3ZlQ2IgPSBudWxsO1xuICAgICAgICAgICAgICByZW1vdmVUcmFuc2l0aW9uQ2xhc3MoZWwsIG1vdmVDbGFzcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBtZXRob2RzOiB7XG4gICAgICBoYXNNb3ZlOiBmdW5jdGlvbiBoYXNNb3ZlIChlbCwgbW92ZUNsYXNzKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAoIWhhc1RyYW5zaXRpb24pIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgaWYgKHRoaXMuX2hhc01vdmUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5faGFzTW92ZVxuICAgICAgICB9XG4gICAgICAgIC8vIERldGVjdCB3aGV0aGVyIGFuIGVsZW1lbnQgd2l0aCB0aGUgbW92ZSBjbGFzcyBhcHBsaWVkIGhhc1xuICAgICAgICAvLyBDU1MgdHJhbnNpdGlvbnMuIFNpbmNlIHRoZSBlbGVtZW50IG1heSBiZSBpbnNpZGUgYW4gZW50ZXJpbmdcbiAgICAgICAgLy8gdHJhbnNpdGlvbiBhdCB0aGlzIHZlcnkgbW9tZW50LCB3ZSBtYWtlIGEgY2xvbmUgb2YgaXQgYW5kIHJlbW92ZVxuICAgICAgICAvLyBhbGwgb3RoZXIgdHJhbnNpdGlvbiBjbGFzc2VzIGFwcGxpZWQgdG8gZW5zdXJlIG9ubHkgdGhlIG1vdmUgY2xhc3NcbiAgICAgICAgLy8gaXMgYXBwbGllZC5cbiAgICAgICAgdmFyIGNsb25lID0gZWwuY2xvbmVOb2RlKCk7XG4gICAgICAgIGlmIChlbC5fdHJhbnNpdGlvbkNsYXNzZXMpIHtcbiAgICAgICAgICBlbC5fdHJhbnNpdGlvbkNsYXNzZXMuZm9yRWFjaChmdW5jdGlvbiAoY2xzKSB7IHJlbW92ZUNsYXNzKGNsb25lLCBjbHMpOyB9KTtcbiAgICAgICAgfVxuICAgICAgICBhZGRDbGFzcyhjbG9uZSwgbW92ZUNsYXNzKTtcbiAgICAgICAgY2xvbmUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgdGhpcy4kZWwuYXBwZW5kQ2hpbGQoY2xvbmUpO1xuICAgICAgICB2YXIgaW5mbyA9IGdldFRyYW5zaXRpb25JbmZvKGNsb25lKTtcbiAgICAgICAgdGhpcy4kZWwucmVtb3ZlQ2hpbGQoY2xvbmUpO1xuICAgICAgICByZXR1cm4gKHRoaXMuX2hhc01vdmUgPSBpbmZvLmhhc1RyYW5zZm9ybSlcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gY2FsbFBlbmRpbmdDYnMgKGMpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoYy5lbG0uX21vdmVDYikge1xuICAgICAgYy5lbG0uX21vdmVDYigpO1xuICAgIH1cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoYy5lbG0uX2VudGVyQ2IpIHtcbiAgICAgIGMuZWxtLl9lbnRlckNiKCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVjb3JkUG9zaXRpb24gKGMpIHtcbiAgICBjLmRhdGEubmV3UG9zID0gYy5lbG0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIH1cblxuICBmdW5jdGlvbiBhcHBseVRyYW5zbGF0aW9uIChjKSB7XG4gICAgdmFyIG9sZFBvcyA9IGMuZGF0YS5wb3M7XG4gICAgdmFyIG5ld1BvcyA9IGMuZGF0YS5uZXdQb3M7XG4gICAgdmFyIGR4ID0gb2xkUG9zLmxlZnQgLSBuZXdQb3MubGVmdDtcbiAgICB2YXIgZHkgPSBvbGRQb3MudG9wIC0gbmV3UG9zLnRvcDtcbiAgICBpZiAoZHggfHwgZHkpIHtcbiAgICAgIGMuZGF0YS5tb3ZlZCA9IHRydWU7XG4gICAgICB2YXIgcyA9IGMuZWxtLnN0eWxlO1xuICAgICAgcy50cmFuc2Zvcm0gPSBzLldlYmtpdFRyYW5zZm9ybSA9IFwidHJhbnNsYXRlKFwiICsgZHggKyBcInB4LFwiICsgZHkgKyBcInB4KVwiO1xuICAgICAgcy50cmFuc2l0aW9uRHVyYXRpb24gPSAnMHMnO1xuICAgIH1cbiAgfVxuXG4gIHZhciBwbGF0Zm9ybUNvbXBvbmVudHMgPSB7XG4gICAgVHJhbnNpdGlvbjogVHJhbnNpdGlvbixcbiAgICBUcmFuc2l0aW9uR3JvdXA6IFRyYW5zaXRpb25Hcm91cFxuICB9O1xuXG4gIC8qICAqL1xuXG4gIC8vIGluc3RhbGwgcGxhdGZvcm0gc3BlY2lmaWMgdXRpbHNcbiAgVnVlLmNvbmZpZy5tdXN0VXNlUHJvcCA9IG11c3RVc2VQcm9wO1xuICBWdWUuY29uZmlnLmlzUmVzZXJ2ZWRUYWcgPSBpc1Jlc2VydmVkVGFnO1xuICBWdWUuY29uZmlnLmlzUmVzZXJ2ZWRBdHRyID0gaXNSZXNlcnZlZEF0dHI7XG4gIFZ1ZS5jb25maWcuZ2V0VGFnTmFtZXNwYWNlID0gZ2V0VGFnTmFtZXNwYWNlO1xuICBWdWUuY29uZmlnLmlzVW5rbm93bkVsZW1lbnQgPSBpc1Vua25vd25FbGVtZW50O1xuXG4gIC8vIGluc3RhbGwgcGxhdGZvcm0gcnVudGltZSBkaXJlY3RpdmVzICYgY29tcG9uZW50c1xuICBleHRlbmQoVnVlLm9wdGlvbnMuZGlyZWN0aXZlcywgcGxhdGZvcm1EaXJlY3RpdmVzKTtcbiAgZXh0ZW5kKFZ1ZS5vcHRpb25zLmNvbXBvbmVudHMsIHBsYXRmb3JtQ29tcG9uZW50cyk7XG5cbiAgLy8gaW5zdGFsbCBwbGF0Zm9ybSBwYXRjaCBmdW5jdGlvblxuICBWdWUucHJvdG90eXBlLl9fcGF0Y2hfXyA9IGluQnJvd3NlciA/IHBhdGNoIDogbm9vcDtcblxuICAvLyBwdWJsaWMgbW91bnQgbWV0aG9kXG4gIFZ1ZS5wcm90b3R5cGUuJG1vdW50ID0gZnVuY3Rpb24gKFxuICAgIGVsLFxuICAgIGh5ZHJhdGluZ1xuICApIHtcbiAgICBlbCA9IGVsICYmIGluQnJvd3NlciA/IHF1ZXJ5KGVsKSA6IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gbW91bnRDb21wb25lbnQodGhpcywgZWwsIGh5ZHJhdGluZylcbiAgfTtcblxuICAvLyBkZXZ0b29scyBnbG9iYWwgaG9va1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBpZiAoaW5Ccm93c2VyKSB7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoY29uZmlnLmRldnRvb2xzKSB7XG4gICAgICAgIGlmIChkZXZ0b29scykge1xuICAgICAgICAgIGRldnRvb2xzLmVtaXQoJ2luaXQnLCBWdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGVbY29uc29sZS5pbmZvID8gJ2luZm8nIDogJ2xvZyddKFxuICAgICAgICAgICAgJ0Rvd25sb2FkIHRoZSBWdWUgRGV2dG9vbHMgZXh0ZW5zaW9uIGZvciBhIGJldHRlciBkZXZlbG9wbWVudCBleHBlcmllbmNlOlxcbicgK1xuICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS92dWVqcy92dWUtZGV2dG9vbHMnXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGNvbmZpZy5wcm9kdWN0aW9uVGlwICE9PSBmYWxzZSAmJlxuICAgICAgICB0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlW2NvbnNvbGUuaW5mbyA/ICdpbmZvJyA6ICdsb2cnXShcbiAgICAgICAgICBcIllvdSBhcmUgcnVubmluZyBWdWUgaW4gZGV2ZWxvcG1lbnQgbW9kZS5cXG5cIiArXG4gICAgICAgICAgXCJNYWtlIHN1cmUgdG8gdHVybiBvbiBwcm9kdWN0aW9uIG1vZGUgd2hlbiBkZXBsb3lpbmcgZm9yIHByb2R1Y3Rpb24uXFxuXCIgK1xuICAgICAgICAgIFwiU2VlIG1vcmUgdGlwcyBhdCBodHRwczovL3Z1ZWpzLm9yZy9ndWlkZS9kZXBsb3ltZW50Lmh0bWxcIlxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0sIDApO1xuICB9XG5cbiAgLyogICovXG5cbiAgdmFyIGRlZmF1bHRUYWdSRSA9IC9cXHtcXHsoKD86LnxcXHI/XFxuKSs/KVxcfVxcfS9nO1xuICB2YXIgcmVnZXhFc2NhcGVSRSA9IC9bLS4qKz9eJHt9KCl8W1xcXVxcL1xcXFxdL2c7XG5cbiAgdmFyIGJ1aWxkUmVnZXggPSBjYWNoZWQoZnVuY3Rpb24gKGRlbGltaXRlcnMpIHtcbiAgICB2YXIgb3BlbiA9IGRlbGltaXRlcnNbMF0ucmVwbGFjZShyZWdleEVzY2FwZVJFLCAnXFxcXCQmJyk7XG4gICAgdmFyIGNsb3NlID0gZGVsaW1pdGVyc1sxXS5yZXBsYWNlKHJlZ2V4RXNjYXBlUkUsICdcXFxcJCYnKTtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChvcGVuICsgJygoPzoufFxcXFxuKSs/KScgKyBjbG9zZSwgJ2cnKVxuICB9KTtcblxuXG5cbiAgZnVuY3Rpb24gcGFyc2VUZXh0IChcbiAgICB0ZXh0LFxuICAgIGRlbGltaXRlcnNcbiAgKSB7XG4gICAgdmFyIHRhZ1JFID0gZGVsaW1pdGVycyA/IGJ1aWxkUmVnZXgoZGVsaW1pdGVycykgOiBkZWZhdWx0VGFnUkU7XG4gICAgaWYgKCF0YWdSRS50ZXN0KHRleHQpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdmFyIHRva2VucyA9IFtdO1xuICAgIHZhciByYXdUb2tlbnMgPSBbXTtcbiAgICB2YXIgbGFzdEluZGV4ID0gdGFnUkUubGFzdEluZGV4ID0gMDtcbiAgICB2YXIgbWF0Y2gsIGluZGV4LCB0b2tlblZhbHVlO1xuICAgIHdoaWxlICgobWF0Y2ggPSB0YWdSRS5leGVjKHRleHQpKSkge1xuICAgICAgaW5kZXggPSBtYXRjaC5pbmRleDtcbiAgICAgIC8vIHB1c2ggdGV4dCB0b2tlblxuICAgICAgaWYgKGluZGV4ID4gbGFzdEluZGV4KSB7XG4gICAgICAgIHJhd1Rva2Vucy5wdXNoKHRva2VuVmFsdWUgPSB0ZXh0LnNsaWNlKGxhc3RJbmRleCwgaW5kZXgpKTtcbiAgICAgICAgdG9rZW5zLnB1c2goSlNPTi5zdHJpbmdpZnkodG9rZW5WYWx1ZSkpO1xuICAgICAgfVxuICAgICAgLy8gdGFnIHRva2VuXG4gICAgICB2YXIgZXhwID0gcGFyc2VGaWx0ZXJzKG1hdGNoWzFdLnRyaW0oKSk7XG4gICAgICB0b2tlbnMucHVzaCgoXCJfcyhcIiArIGV4cCArIFwiKVwiKSk7XG4gICAgICByYXdUb2tlbnMucHVzaCh7ICdAYmluZGluZyc6IGV4cCB9KTtcbiAgICAgIGxhc3RJbmRleCA9IGluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoO1xuICAgIH1cbiAgICBpZiAobGFzdEluZGV4IDwgdGV4dC5sZW5ndGgpIHtcbiAgICAgIHJhd1Rva2Vucy5wdXNoKHRva2VuVmFsdWUgPSB0ZXh0LnNsaWNlKGxhc3RJbmRleCkpO1xuICAgICAgdG9rZW5zLnB1c2goSlNPTi5zdHJpbmdpZnkodG9rZW5WYWx1ZSkpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgZXhwcmVzc2lvbjogdG9rZW5zLmpvaW4oJysnKSxcbiAgICAgIHRva2VuczogcmF3VG9rZW5zXG4gICAgfVxuICB9XG5cbiAgLyogICovXG5cbiAgZnVuY3Rpb24gdHJhbnNmb3JtTm9kZSAoZWwsIG9wdGlvbnMpIHtcbiAgICB2YXIgd2FybiA9IG9wdGlvbnMud2FybiB8fCBiYXNlV2FybjtcbiAgICB2YXIgc3RhdGljQ2xhc3MgPSBnZXRBbmRSZW1vdmVBdHRyKGVsLCAnY2xhc3MnKTtcbiAgICBpZiAoc3RhdGljQ2xhc3MpIHtcbiAgICAgIHZhciByZXMgPSBwYXJzZVRleHQoc3RhdGljQ2xhc3MsIG9wdGlvbnMuZGVsaW1pdGVycyk7XG4gICAgICBpZiAocmVzKSB7XG4gICAgICAgIHdhcm4oXG4gICAgICAgICAgXCJjbGFzcz1cXFwiXCIgKyBzdGF0aWNDbGFzcyArIFwiXFxcIjogXCIgK1xuICAgICAgICAgICdJbnRlcnBvbGF0aW9uIGluc2lkZSBhdHRyaWJ1dGVzIGhhcyBiZWVuIHJlbW92ZWQuICcgK1xuICAgICAgICAgICdVc2Ugdi1iaW5kIG9yIHRoZSBjb2xvbiBzaG9ydGhhbmQgaW5zdGVhZC4gRm9yIGV4YW1wbGUsICcgK1xuICAgICAgICAgICdpbnN0ZWFkIG9mIDxkaXYgY2xhc3M9XCJ7eyB2YWwgfX1cIj4sIHVzZSA8ZGl2IDpjbGFzcz1cInZhbFwiPi4nLFxuICAgICAgICAgIGVsLnJhd0F0dHJzTWFwWydjbGFzcyddXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzdGF0aWNDbGFzcykge1xuICAgICAgZWwuc3RhdGljQ2xhc3MgPSBKU09OLnN0cmluZ2lmeShzdGF0aWNDbGFzcyk7XG4gICAgfVxuICAgIHZhciBjbGFzc0JpbmRpbmcgPSBnZXRCaW5kaW5nQXR0cihlbCwgJ2NsYXNzJywgZmFsc2UgLyogZ2V0U3RhdGljICovKTtcbiAgICBpZiAoY2xhc3NCaW5kaW5nKSB7XG4gICAgICBlbC5jbGFzc0JpbmRpbmcgPSBjbGFzc0JpbmRpbmc7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2VuRGF0YSAoZWwpIHtcbiAgICB2YXIgZGF0YSA9ICcnO1xuICAgIGlmIChlbC5zdGF0aWNDbGFzcykge1xuICAgICAgZGF0YSArPSBcInN0YXRpY0NsYXNzOlwiICsgKGVsLnN0YXRpY0NsYXNzKSArIFwiLFwiO1xuICAgIH1cbiAgICBpZiAoZWwuY2xhc3NCaW5kaW5nKSB7XG4gICAgICBkYXRhICs9IFwiY2xhc3M6XCIgKyAoZWwuY2xhc3NCaW5kaW5nKSArIFwiLFwiO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YVxuICB9XG5cbiAgdmFyIGtsYXNzJDEgPSB7XG4gICAgc3RhdGljS2V5czogWydzdGF0aWNDbGFzcyddLFxuICAgIHRyYW5zZm9ybU5vZGU6IHRyYW5zZm9ybU5vZGUsXG4gICAgZ2VuRGF0YTogZ2VuRGF0YVxuICB9O1xuXG4gIC8qICAqL1xuXG4gIGZ1bmN0aW9uIHRyYW5zZm9ybU5vZGUkMSAoZWwsIG9wdGlvbnMpIHtcbiAgICB2YXIgd2FybiA9IG9wdGlvbnMud2FybiB8fCBiYXNlV2FybjtcbiAgICB2YXIgc3RhdGljU3R5bGUgPSBnZXRBbmRSZW1vdmVBdHRyKGVsLCAnc3R5bGUnKTtcbiAgICBpZiAoc3RhdGljU3R5bGUpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAge1xuICAgICAgICB2YXIgcmVzID0gcGFyc2VUZXh0KHN0YXRpY1N0eWxlLCBvcHRpb25zLmRlbGltaXRlcnMpO1xuICAgICAgICBpZiAocmVzKSB7XG4gICAgICAgICAgd2FybihcbiAgICAgICAgICAgIFwic3R5bGU9XFxcIlwiICsgc3RhdGljU3R5bGUgKyBcIlxcXCI6IFwiICtcbiAgICAgICAgICAgICdJbnRlcnBvbGF0aW9uIGluc2lkZSBhdHRyaWJ1dGVzIGhhcyBiZWVuIHJlbW92ZWQuICcgK1xuICAgICAgICAgICAgJ1VzZSB2LWJpbmQgb3IgdGhlIGNvbG9uIHNob3J0aGFuZCBpbnN0ZWFkLiBGb3IgZXhhbXBsZSwgJyArXG4gICAgICAgICAgICAnaW5zdGVhZCBvZiA8ZGl2IHN0eWxlPVwie3sgdmFsIH19XCI+LCB1c2UgPGRpdiA6c3R5bGU9XCJ2YWxcIj4uJyxcbiAgICAgICAgICAgIGVsLnJhd0F0dHJzTWFwWydzdHlsZSddXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWwuc3RhdGljU3R5bGUgPSBKU09OLnN0cmluZ2lmeShwYXJzZVN0eWxlVGV4dChzdGF0aWNTdHlsZSkpO1xuICAgIH1cblxuICAgIHZhciBzdHlsZUJpbmRpbmcgPSBnZXRCaW5kaW5nQXR0cihlbCwgJ3N0eWxlJywgZmFsc2UgLyogZ2V0U3RhdGljICovKTtcbiAgICBpZiAoc3R5bGVCaW5kaW5nKSB7XG4gICAgICBlbC5zdHlsZUJpbmRpbmcgPSBzdHlsZUJpbmRpbmc7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2VuRGF0YSQxIChlbCkge1xuICAgIHZhciBkYXRhID0gJyc7XG4gICAgaWYgKGVsLnN0YXRpY1N0eWxlKSB7XG4gICAgICBkYXRhICs9IFwic3RhdGljU3R5bGU6XCIgKyAoZWwuc3RhdGljU3R5bGUpICsgXCIsXCI7XG4gICAgfVxuICAgIGlmIChlbC5zdHlsZUJpbmRpbmcpIHtcbiAgICAgIGRhdGEgKz0gXCJzdHlsZTooXCIgKyAoZWwuc3R5bGVCaW5kaW5nKSArIFwiKSxcIjtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGFcbiAgfVxuXG4gIHZhciBzdHlsZSQxID0ge1xuICAgIHN0YXRpY0tleXM6IFsnc3RhdGljU3R5bGUnXSxcbiAgICB0cmFuc2Zvcm1Ob2RlOiB0cmFuc2Zvcm1Ob2RlJDEsXG4gICAgZ2VuRGF0YTogZ2VuRGF0YSQxXG4gIH07XG5cbiAgLyogICovXG5cbiAgdmFyIGRlY29kZXI7XG5cbiAgdmFyIGhlID0ge1xuICAgIGRlY29kZTogZnVuY3Rpb24gZGVjb2RlIChodG1sKSB7XG4gICAgICBkZWNvZGVyID0gZGVjb2RlciB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGRlY29kZXIuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgIHJldHVybiBkZWNvZGVyLnRleHRDb250ZW50XG4gICAgfVxuICB9O1xuXG4gIC8qICAqL1xuXG4gIHZhciBpc1VuYXJ5VGFnID0gbWFrZU1hcChcbiAgICAnYXJlYSxiYXNlLGJyLGNvbCxlbWJlZCxmcmFtZSxocixpbWcsaW5wdXQsaXNpbmRleCxrZXlnZW4sJyArXG4gICAgJ2xpbmssbWV0YSxwYXJhbSxzb3VyY2UsdHJhY2ssd2JyJ1xuICApO1xuXG4gIC8vIEVsZW1lbnRzIHRoYXQgeW91IGNhbiwgaW50ZW50aW9uYWxseSwgbGVhdmUgb3BlblxuICAvLyAoYW5kIHdoaWNoIGNsb3NlIHRoZW1zZWx2ZXMpXG4gIHZhciBjYW5CZUxlZnRPcGVuVGFnID0gbWFrZU1hcChcbiAgICAnY29sZ3JvdXAsZGQsZHQsbGksb3B0aW9ucyxwLHRkLHRmb290LHRoLHRoZWFkLHRyLHNvdXJjZSdcbiAgKTtcblxuICAvLyBIVE1MNSB0YWdzIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2luZGljZXMuaHRtbCNlbGVtZW50cy0zXG4gIC8vIFBocmFzaW5nIENvbnRlbnQgaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvZG9tLmh0bWwjcGhyYXNpbmctY29udGVudFxuICB2YXIgaXNOb25QaHJhc2luZ1RhZyA9IG1ha2VNYXAoXG4gICAgJ2FkZHJlc3MsYXJ0aWNsZSxhc2lkZSxiYXNlLGJsb2NrcXVvdGUsYm9keSxjYXB0aW9uLGNvbCxjb2xncm91cCxkZCwnICtcbiAgICAnZGV0YWlscyxkaWFsb2csZGl2LGRsLGR0LGZpZWxkc2V0LGZpZ2NhcHRpb24sZmlndXJlLGZvb3Rlcixmb3JtLCcgK1xuICAgICdoMSxoMixoMyxoNCxoNSxoNixoZWFkLGhlYWRlcixoZ3JvdXAsaHIsaHRtbCxsZWdlbmQsbGksbWVudWl0ZW0sbWV0YSwnICtcbiAgICAnb3B0Z3JvdXAsb3B0aW9uLHBhcmFtLHJwLHJ0LHNvdXJjZSxzdHlsZSxzdW1tYXJ5LHRib2R5LHRkLHRmb290LHRoLHRoZWFkLCcgK1xuICAgICd0aXRsZSx0cix0cmFjaydcbiAgKTtcblxuICAvKipcbiAgICogTm90IHR5cGUtY2hlY2tpbmcgdGhpcyBmaWxlIGJlY2F1c2UgaXQncyBtb3N0bHkgdmVuZG9yIGNvZGUuXG4gICAqL1xuXG4gIC8vIFJlZ3VsYXIgRXhwcmVzc2lvbnMgZm9yIHBhcnNpbmcgdGFncyBhbmQgYXR0cmlidXRlc1xuICB2YXIgYXR0cmlidXRlID0gL15cXHMqKFteXFxzXCInPD5cXC89XSspKD86XFxzKig9KVxccyooPzpcIihbXlwiXSopXCIrfCcoW14nXSopJyt8KFteXFxzXCInPTw+YF0rKSkpPy87XG4gIHZhciBkeW5hbWljQXJnQXR0cmlidXRlID0gL15cXHMqKCg/OnYtW1xcdy1dKzp8QHw6fCMpXFxbW149XSs/XFxdW15cXHNcIic8PlxcLz1dKikoPzpcXHMqKD0pXFxzKig/OlwiKFteXCJdKilcIit8JyhbXiddKiknK3woW15cXHNcIic9PD5gXSspKSk/LztcbiAgdmFyIG5jbmFtZSA9IFwiW2EtekEtWl9dW1xcXFwtXFxcXC4wLTlfYS16QS1aXCIgKyAodW5pY29kZVJlZ0V4cC5zb3VyY2UpICsgXCJdKlwiO1xuICB2YXIgcW5hbWVDYXB0dXJlID0gXCIoKD86XCIgKyBuY25hbWUgKyBcIlxcXFw6KT9cIiArIG5jbmFtZSArIFwiKVwiO1xuICB2YXIgc3RhcnRUYWdPcGVuID0gbmV3IFJlZ0V4cCgoXCJePFwiICsgcW5hbWVDYXB0dXJlKSk7XG4gIHZhciBzdGFydFRhZ0Nsb3NlID0gL15cXHMqKFxcLz8pPi87XG4gIHZhciBlbmRUYWcgPSBuZXcgUmVnRXhwKChcIl48XFxcXC9cIiArIHFuYW1lQ2FwdHVyZSArIFwiW14+XSo+XCIpKTtcbiAgdmFyIGRvY3R5cGUgPSAvXjwhRE9DVFlQRSBbXj5dKz4vaTtcbiAgLy8gIzcyOTg6IGVzY2FwZSAtIHRvIGF2b2lkIGJlaW5nIHBhc3NlZCBhcyBIVE1MIGNvbW1lbnQgd2hlbiBpbmxpbmVkIGluIHBhZ2VcbiAgdmFyIGNvbW1lbnQgPSAvXjwhXFwtLS87XG4gIHZhciBjb25kaXRpb25hbENvbW1lbnQgPSAvXjwhXFxbLztcblxuICAvLyBTcGVjaWFsIEVsZW1lbnRzIChjYW4gY29udGFpbiBhbnl0aGluZylcbiAgdmFyIGlzUGxhaW5UZXh0RWxlbWVudCA9IG1ha2VNYXAoJ3NjcmlwdCxzdHlsZSx0ZXh0YXJlYScsIHRydWUpO1xuICB2YXIgcmVDYWNoZSA9IHt9O1xuXG4gIHZhciBkZWNvZGluZ01hcCA9IHtcbiAgICAnJmx0Oyc6ICc8JyxcbiAgICAnJmd0Oyc6ICc+JyxcbiAgICAnJnF1b3Q7JzogJ1wiJyxcbiAgICAnJmFtcDsnOiAnJicsXG4gICAgJyYjMTA7JzogJ1xcbicsXG4gICAgJyYjOTsnOiAnXFx0JyxcbiAgICAnJiMzOTsnOiBcIidcIlxuICB9O1xuICB2YXIgZW5jb2RlZEF0dHIgPSAvJig/Omx0fGd0fHF1b3R8YW1wfCMzOSk7L2c7XG4gIHZhciBlbmNvZGVkQXR0cldpdGhOZXdMaW5lcyA9IC8mKD86bHR8Z3R8cXVvdHxhbXB8IzM5fCMxMHwjOSk7L2c7XG5cbiAgLy8gIzU5OTJcbiAgdmFyIGlzSWdub3JlTmV3bGluZVRhZyA9IG1ha2VNYXAoJ3ByZSx0ZXh0YXJlYScsIHRydWUpO1xuICB2YXIgc2hvdWxkSWdub3JlRmlyc3ROZXdsaW5lID0gZnVuY3Rpb24gKHRhZywgaHRtbCkgeyByZXR1cm4gdGFnICYmIGlzSWdub3JlTmV3bGluZVRhZyh0YWcpICYmIGh0bWxbMF0gPT09ICdcXG4nOyB9O1xuXG4gIGZ1bmN0aW9uIGRlY29kZUF0dHIgKHZhbHVlLCBzaG91bGREZWNvZGVOZXdsaW5lcykge1xuICAgIHZhciByZSA9IHNob3VsZERlY29kZU5ld2xpbmVzID8gZW5jb2RlZEF0dHJXaXRoTmV3TGluZXMgOiBlbmNvZGVkQXR0cjtcbiAgICByZXR1cm4gdmFsdWUucmVwbGFjZShyZSwgZnVuY3Rpb24gKG1hdGNoKSB7IHJldHVybiBkZWNvZGluZ01hcFttYXRjaF07IH0pXG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUhUTUwgKGh0bWwsIG9wdGlvbnMpIHtcbiAgICB2YXIgc3RhY2sgPSBbXTtcbiAgICB2YXIgZXhwZWN0SFRNTCA9IG9wdGlvbnMuZXhwZWN0SFRNTDtcbiAgICB2YXIgaXNVbmFyeVRhZyQkMSA9IG9wdGlvbnMuaXNVbmFyeVRhZyB8fCBubztcbiAgICB2YXIgY2FuQmVMZWZ0T3BlblRhZyQkMSA9IG9wdGlvbnMuY2FuQmVMZWZ0T3BlblRhZyB8fCBubztcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBsYXN0LCBsYXN0VGFnO1xuICAgIHdoaWxlIChodG1sKSB7XG4gICAgICBsYXN0ID0gaHRtbDtcbiAgICAgIC8vIE1ha2Ugc3VyZSB3ZSdyZSBub3QgaW4gYSBwbGFpbnRleHQgY29udGVudCBlbGVtZW50IGxpa2Ugc2NyaXB0L3N0eWxlXG4gICAgICBpZiAoIWxhc3RUYWcgfHwgIWlzUGxhaW5UZXh0RWxlbWVudChsYXN0VGFnKSkge1xuICAgICAgICB2YXIgdGV4dEVuZCA9IGh0bWwuaW5kZXhPZignPCcpO1xuICAgICAgICBpZiAodGV4dEVuZCA9PT0gMCkge1xuICAgICAgICAgIC8vIENvbW1lbnQ6XG4gICAgICAgICAgaWYgKGNvbW1lbnQudGVzdChodG1sKSkge1xuICAgICAgICAgICAgdmFyIGNvbW1lbnRFbmQgPSBodG1sLmluZGV4T2YoJy0tPicpO1xuXG4gICAgICAgICAgICBpZiAoY29tbWVudEVuZCA+PSAwKSB7XG4gICAgICAgICAgICAgIGlmIChvcHRpb25zLnNob3VsZEtlZXBDb21tZW50KSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5jb21tZW50KGh0bWwuc3Vic3RyaW5nKDQsIGNvbW1lbnRFbmQpLCBpbmRleCwgaW5kZXggKyBjb21tZW50RW5kICsgMyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYWR2YW5jZShjb21tZW50RW5kICsgMyk7XG4gICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Db25kaXRpb25hbF9jb21tZW50I0Rvd25sZXZlbC1yZXZlYWxlZF9jb25kaXRpb25hbF9jb21tZW50XG4gICAgICAgICAgaWYgKGNvbmRpdGlvbmFsQ29tbWVudC50ZXN0KGh0bWwpKSB7XG4gICAgICAgICAgICB2YXIgY29uZGl0aW9uYWxFbmQgPSBodG1sLmluZGV4T2YoJ10+Jyk7XG5cbiAgICAgICAgICAgIGlmIChjb25kaXRpb25hbEVuZCA+PSAwKSB7XG4gICAgICAgICAgICAgIGFkdmFuY2UoY29uZGl0aW9uYWxFbmQgKyAyKTtcbiAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBEb2N0eXBlOlxuICAgICAgICAgIHZhciBkb2N0eXBlTWF0Y2ggPSBodG1sLm1hdGNoKGRvY3R5cGUpO1xuICAgICAgICAgIGlmIChkb2N0eXBlTWF0Y2gpIHtcbiAgICAgICAgICAgIGFkdmFuY2UoZG9jdHlwZU1hdGNoWzBdLmxlbmd0aCk7XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEVuZCB0YWc6XG4gICAgICAgICAgdmFyIGVuZFRhZ01hdGNoID0gaHRtbC5tYXRjaChlbmRUYWcpO1xuICAgICAgICAgIGlmIChlbmRUYWdNYXRjaCkge1xuICAgICAgICAgICAgdmFyIGN1ckluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICBhZHZhbmNlKGVuZFRhZ01hdGNoWzBdLmxlbmd0aCk7XG4gICAgICAgICAgICBwYXJzZUVuZFRhZyhlbmRUYWdNYXRjaFsxXSwgY3VySW5kZXgsIGluZGV4KTtcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gU3RhcnQgdGFnOlxuICAgICAgICAgIHZhciBzdGFydFRhZ01hdGNoID0gcGFyc2VTdGFydFRhZygpO1xuICAgICAgICAgIGlmIChzdGFydFRhZ01hdGNoKSB7XG4gICAgICAgICAgICBoYW5kbGVTdGFydFRhZyhzdGFydFRhZ01hdGNoKTtcbiAgICAgICAgICAgIGlmIChzaG91bGRJZ25vcmVGaXJzdE5ld2xpbmUoc3RhcnRUYWdNYXRjaC50YWdOYW1lLCBodG1sKSkge1xuICAgICAgICAgICAgICBhZHZhbmNlKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdGV4dCA9ICh2b2lkIDApLCByZXN0ID0gKHZvaWQgMCksIG5leHQgPSAodm9pZCAwKTtcbiAgICAgICAgaWYgKHRleHRFbmQgPj0gMCkge1xuICAgICAgICAgIHJlc3QgPSBodG1sLnNsaWNlKHRleHRFbmQpO1xuICAgICAgICAgIHdoaWxlIChcbiAgICAgICAgICAgICFlbmRUYWcudGVzdChyZXN0KSAmJlxuICAgICAgICAgICAgIXN0YXJ0VGFnT3Blbi50ZXN0KHJlc3QpICYmXG4gICAgICAgICAgICAhY29tbWVudC50ZXN0KHJlc3QpICYmXG4gICAgICAgICAgICAhY29uZGl0aW9uYWxDb21tZW50LnRlc3QocmVzdClcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIC8vIDwgaW4gcGxhaW4gdGV4dCwgYmUgZm9yZ2l2aW5nIGFuZCB0cmVhdCBpdCBhcyB0ZXh0XG4gICAgICAgICAgICBuZXh0ID0gcmVzdC5pbmRleE9mKCc8JywgMSk7XG4gICAgICAgICAgICBpZiAobmV4dCA8IDApIHsgYnJlYWsgfVxuICAgICAgICAgICAgdGV4dEVuZCArPSBuZXh0O1xuICAgICAgICAgICAgcmVzdCA9IGh0bWwuc2xpY2UodGV4dEVuZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRleHQgPSBodG1sLnN1YnN0cmluZygwLCB0ZXh0RW5kKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0ZXh0RW5kIDwgMCkge1xuICAgICAgICAgIHRleHQgPSBodG1sO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRleHQpIHtcbiAgICAgICAgICBhZHZhbmNlKHRleHQubGVuZ3RoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLmNoYXJzICYmIHRleHQpIHtcbiAgICAgICAgICBvcHRpb25zLmNoYXJzKHRleHQsIGluZGV4IC0gdGV4dC5sZW5ndGgsIGluZGV4KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGVuZFRhZ0xlbmd0aCA9IDA7XG4gICAgICAgIHZhciBzdGFja2VkVGFnID0gbGFzdFRhZy50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB2YXIgcmVTdGFja2VkVGFnID0gcmVDYWNoZVtzdGFja2VkVGFnXSB8fCAocmVDYWNoZVtzdGFja2VkVGFnXSA9IG5ldyBSZWdFeHAoJyhbXFxcXHNcXFxcU10qPykoPC8nICsgc3RhY2tlZFRhZyArICdbXj5dKj4pJywgJ2knKSk7XG4gICAgICAgIHZhciByZXN0JDEgPSBodG1sLnJlcGxhY2UocmVTdGFja2VkVGFnLCBmdW5jdGlvbiAoYWxsLCB0ZXh0LCBlbmRUYWcpIHtcbiAgICAgICAgICBlbmRUYWdMZW5ndGggPSBlbmRUYWcubGVuZ3RoO1xuICAgICAgICAgIGlmICghaXNQbGFpblRleHRFbGVtZW50KHN0YWNrZWRUYWcpICYmIHN0YWNrZWRUYWcgIT09ICdub3NjcmlwdCcpIHtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0XG4gICAgICAgICAgICAgIC5yZXBsYWNlKC88IVxcLS0oW1xcc1xcU10qPyktLT4vZywgJyQxJykgLy8gIzcyOThcbiAgICAgICAgICAgICAgLnJlcGxhY2UoLzwhXFxbQ0RBVEFcXFsoW1xcc1xcU10qPyldXT4vZywgJyQxJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzaG91bGRJZ25vcmVGaXJzdE5ld2xpbmUoc3RhY2tlZFRhZywgdGV4dCkpIHtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnNsaWNlKDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAob3B0aW9ucy5jaGFycykge1xuICAgICAgICAgICAgb3B0aW9ucy5jaGFycyh0ZXh0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuICcnXG4gICAgICAgIH0pO1xuICAgICAgICBpbmRleCArPSBodG1sLmxlbmd0aCAtIHJlc3QkMS5sZW5ndGg7XG4gICAgICAgIGh0bWwgPSByZXN0JDE7XG4gICAgICAgIHBhcnNlRW5kVGFnKHN0YWNrZWRUYWcsIGluZGV4IC0gZW5kVGFnTGVuZ3RoLCBpbmRleCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChodG1sID09PSBsYXN0KSB7XG4gICAgICAgIG9wdGlvbnMuY2hhcnMgJiYgb3B0aW9ucy5jaGFycyhodG1sKTtcbiAgICAgICAgaWYgKCFzdGFjay5sZW5ndGggJiYgb3B0aW9ucy53YXJuKSB7XG4gICAgICAgICAgb3B0aW9ucy53YXJuKChcIk1hbC1mb3JtYXR0ZWQgdGFnIGF0IGVuZCBvZiB0ZW1wbGF0ZTogXFxcIlwiICsgaHRtbCArIFwiXFxcIlwiKSwgeyBzdGFydDogaW5kZXggKyBodG1sLmxlbmd0aCB9KTtcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENsZWFuIHVwIGFueSByZW1haW5pbmcgdGFnc1xuICAgIHBhcnNlRW5kVGFnKCk7XG5cbiAgICBmdW5jdGlvbiBhZHZhbmNlIChuKSB7XG4gICAgICBpbmRleCArPSBuO1xuICAgICAgaHRtbCA9IGh0bWwuc3Vic3RyaW5nKG4pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlU3RhcnRUYWcgKCkge1xuICAgICAgdmFyIHN0YXJ0ID0gaHRtbC5tYXRjaChzdGFydFRhZ09wZW4pO1xuICAgICAgaWYgKHN0YXJ0KSB7XG4gICAgICAgIHZhciBtYXRjaCA9IHtcbiAgICAgICAgICB0YWdOYW1lOiBzdGFydFsxXSxcbiAgICAgICAgICBhdHRyczogW10sXG4gICAgICAgICAgc3RhcnQ6IGluZGV4XG4gICAgICAgIH07XG4gICAgICAgIGFkdmFuY2Uoc3RhcnRbMF0ubGVuZ3RoKTtcbiAgICAgICAgdmFyIGVuZCwgYXR0cjtcbiAgICAgICAgd2hpbGUgKCEoZW5kID0gaHRtbC5tYXRjaChzdGFydFRhZ0Nsb3NlKSkgJiYgKGF0dHIgPSBodG1sLm1hdGNoKGR5bmFtaWNBcmdBdHRyaWJ1dGUpIHx8IGh0bWwubWF0Y2goYXR0cmlidXRlKSkpIHtcbiAgICAgICAgICBhdHRyLnN0YXJ0ID0gaW5kZXg7XG4gICAgICAgICAgYWR2YW5jZShhdHRyWzBdLmxlbmd0aCk7XG4gICAgICAgICAgYXR0ci5lbmQgPSBpbmRleDtcbiAgICAgICAgICBtYXRjaC5hdHRycy5wdXNoKGF0dHIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbmQpIHtcbiAgICAgICAgICBtYXRjaC51bmFyeVNsYXNoID0gZW5kWzFdO1xuICAgICAgICAgIGFkdmFuY2UoZW5kWzBdLmxlbmd0aCk7XG4gICAgICAgICAgbWF0Y2guZW5kID0gaW5kZXg7XG4gICAgICAgICAgcmV0dXJuIG1hdGNoXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVTdGFydFRhZyAobWF0Y2gpIHtcbiAgICAgIHZhciB0YWdOYW1lID0gbWF0Y2gudGFnTmFtZTtcbiAgICAgIHZhciB1bmFyeVNsYXNoID0gbWF0Y2gudW5hcnlTbGFzaDtcblxuICAgICAgaWYgKGV4cGVjdEhUTUwpIHtcbiAgICAgICAgaWYgKGxhc3RUYWcgPT09ICdwJyAmJiBpc05vblBocmFzaW5nVGFnKHRhZ05hbWUpKSB7XG4gICAgICAgICAgcGFyc2VFbmRUYWcobGFzdFRhZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhbkJlTGVmdE9wZW5UYWckJDEodGFnTmFtZSkgJiYgbGFzdFRhZyA9PT0gdGFnTmFtZSkge1xuICAgICAgICAgIHBhcnNlRW5kVGFnKHRhZ05hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciB1bmFyeSA9IGlzVW5hcnlUYWckJDEodGFnTmFtZSkgfHwgISF1bmFyeVNsYXNoO1xuXG4gICAgICB2YXIgbCA9IG1hdGNoLmF0dHJzLmxlbmd0aDtcbiAgICAgIHZhciBhdHRycyA9IG5ldyBBcnJheShsKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBhcmdzID0gbWF0Y2guYXR0cnNbaV07XG4gICAgICAgIHZhciB2YWx1ZSA9IGFyZ3NbM10gfHwgYXJnc1s0XSB8fCBhcmdzWzVdIHx8ICcnO1xuICAgICAgICB2YXIgc2hvdWxkRGVjb2RlTmV3bGluZXMgPSB0YWdOYW1lID09PSAnYScgJiYgYXJnc1sxXSA9PT0gJ2hyZWYnXG4gICAgICAgICAgPyBvcHRpb25zLnNob3VsZERlY29kZU5ld2xpbmVzRm9ySHJlZlxuICAgICAgICAgIDogb3B0aW9ucy5zaG91bGREZWNvZGVOZXdsaW5lcztcbiAgICAgICAgYXR0cnNbaV0gPSB7XG4gICAgICAgICAgbmFtZTogYXJnc1sxXSxcbiAgICAgICAgICB2YWx1ZTogZGVjb2RlQXR0cih2YWx1ZSwgc2hvdWxkRGVjb2RlTmV3bGluZXMpXG4gICAgICAgIH07XG4gICAgICAgIGlmIChvcHRpb25zLm91dHB1dFNvdXJjZVJhbmdlKSB7XG4gICAgICAgICAgYXR0cnNbaV0uc3RhcnQgPSBhcmdzLnN0YXJ0ICsgYXJnc1swXS5tYXRjaCgvXlxccyovKS5sZW5ndGg7XG4gICAgICAgICAgYXR0cnNbaV0uZW5kID0gYXJncy5lbmQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCF1bmFyeSkge1xuICAgICAgICBzdGFjay5wdXNoKHsgdGFnOiB0YWdOYW1lLCBsb3dlckNhc2VkVGFnOiB0YWdOYW1lLnRvTG93ZXJDYXNlKCksIGF0dHJzOiBhdHRycywgc3RhcnQ6IG1hdGNoLnN0YXJ0LCBlbmQ6IG1hdGNoLmVuZCB9KTtcbiAgICAgICAgbGFzdFRhZyA9IHRhZ05hbWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLnN0YXJ0KSB7XG4gICAgICAgIG9wdGlvbnMuc3RhcnQodGFnTmFtZSwgYXR0cnMsIHVuYXJ5LCBtYXRjaC5zdGFydCwgbWF0Y2guZW5kKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZUVuZFRhZyAodGFnTmFtZSwgc3RhcnQsIGVuZCkge1xuICAgICAgdmFyIHBvcywgbG93ZXJDYXNlZFRhZ05hbWU7XG4gICAgICBpZiAoc3RhcnQgPT0gbnVsbCkgeyBzdGFydCA9IGluZGV4OyB9XG4gICAgICBpZiAoZW5kID09IG51bGwpIHsgZW5kID0gaW5kZXg7IH1cblxuICAgICAgLy8gRmluZCB0aGUgY2xvc2VzdCBvcGVuZWQgdGFnIG9mIHRoZSBzYW1lIHR5cGVcbiAgICAgIGlmICh0YWdOYW1lKSB7XG4gICAgICAgIGxvd2VyQ2FzZWRUYWdOYW1lID0gdGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBmb3IgKHBvcyA9IHN0YWNrLmxlbmd0aCAtIDE7IHBvcyA+PSAwOyBwb3MtLSkge1xuICAgICAgICAgIGlmIChzdGFja1twb3NdLmxvd2VyQ2FzZWRUYWcgPT09IGxvd2VyQ2FzZWRUYWdOYW1lKSB7XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSWYgbm8gdGFnIG5hbWUgaXMgcHJvdmlkZWQsIGNsZWFuIHNob3BcbiAgICAgICAgcG9zID0gMDtcbiAgICAgIH1cblxuICAgICAgaWYgKHBvcyA+PSAwKSB7XG4gICAgICAgIC8vIENsb3NlIGFsbCB0aGUgb3BlbiBlbGVtZW50cywgdXAgdGhlIHN0YWNrXG4gICAgICAgIGZvciAodmFyIGkgPSBzdGFjay5sZW5ndGggLSAxOyBpID49IHBvczsgaS0tKSB7XG4gICAgICAgICAgaWYgKGkgPiBwb3MgfHwgIXRhZ05hbWUgJiZcbiAgICAgICAgICAgIG9wdGlvbnMud2FyblxuICAgICAgICAgICkge1xuICAgICAgICAgICAgb3B0aW9ucy53YXJuKFxuICAgICAgICAgICAgICAoXCJ0YWcgPFwiICsgKHN0YWNrW2ldLnRhZykgKyBcIj4gaGFzIG5vIG1hdGNoaW5nIGVuZCB0YWcuXCIpLFxuICAgICAgICAgICAgICB7IHN0YXJ0OiBzdGFja1tpXS5zdGFydCwgZW5kOiBzdGFja1tpXS5lbmQgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG9wdGlvbnMuZW5kKSB7XG4gICAgICAgICAgICBvcHRpb25zLmVuZChzdGFja1tpXS50YWcsIHN0YXJ0LCBlbmQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgb3BlbiBlbGVtZW50cyBmcm9tIHRoZSBzdGFja1xuICAgICAgICBzdGFjay5sZW5ndGggPSBwb3M7XG4gICAgICAgIGxhc3RUYWcgPSBwb3MgJiYgc3RhY2tbcG9zIC0gMV0udGFnO1xuICAgICAgfSBlbHNlIGlmIChsb3dlckNhc2VkVGFnTmFtZSA9PT0gJ2JyJykge1xuICAgICAgICBpZiAob3B0aW9ucy5zdGFydCkge1xuICAgICAgICAgIG9wdGlvbnMuc3RhcnQodGFnTmFtZSwgW10sIHRydWUsIHN0YXJ0LCBlbmQpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGxvd2VyQ2FzZWRUYWdOYW1lID09PSAncCcpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuc3RhcnQpIHtcbiAgICAgICAgICBvcHRpb25zLnN0YXJ0KHRhZ05hbWUsIFtdLCBmYWxzZSwgc3RhcnQsIGVuZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMuZW5kKSB7XG4gICAgICAgICAgb3B0aW9ucy5lbmQodGFnTmFtZSwgc3RhcnQsIGVuZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiAgKi9cblxuICB2YXIgb25SRSA9IC9eQHxedi1vbjovO1xuICB2YXIgZGlyUkUgPSAvXnYtfF5AfF46fF4jLztcbiAgdmFyIGZvckFsaWFzUkUgPSAvKFtcXHNcXFNdKj8pXFxzKyg/OmlufG9mKVxccysoW1xcc1xcU10qKS87XG4gIHZhciBmb3JJdGVyYXRvclJFID0gLywoW14sXFx9XFxdXSopKD86LChbXixcXH1cXF1dKikpPyQvO1xuICB2YXIgc3RyaXBQYXJlbnNSRSA9IC9eXFwofFxcKSQvZztcbiAgdmFyIGR5bmFtaWNBcmdSRSA9IC9eXFxbLipcXF0kLztcblxuICB2YXIgYXJnUkUgPSAvOiguKikkLztcbiAgdmFyIGJpbmRSRSA9IC9eOnxeXFwufF52LWJpbmQ6LztcbiAgdmFyIG1vZGlmaWVyUkUgPSAvXFwuW14uXFxdXSsoPz1bXlxcXV0qJCkvZztcblxuICB2YXIgc2xvdFJFID0gL152LXNsb3QoOnwkKXxeIy87XG5cbiAgdmFyIGxpbmVCcmVha1JFID0gL1tcXHJcXG5dLztcbiAgdmFyIHdoaXRlc3BhY2VSRSQxID0gL1sgXFxmXFx0XFxyXFxuXSsvZztcblxuICB2YXIgaW52YWxpZEF0dHJpYnV0ZVJFID0gL1tcXHNcIic8PlxcLz1dLztcblxuICB2YXIgZGVjb2RlSFRNTENhY2hlZCA9IGNhY2hlZChoZS5kZWNvZGUpO1xuXG4gIHZhciBlbXB0eVNsb3RTY29wZVRva2VuID0gXCJfZW1wdHlfXCI7XG5cbiAgLy8gY29uZmlndXJhYmxlIHN0YXRlXG4gIHZhciB3YXJuJDI7XG4gIHZhciBkZWxpbWl0ZXJzO1xuICB2YXIgdHJhbnNmb3JtcztcbiAgdmFyIHByZVRyYW5zZm9ybXM7XG4gIHZhciBwb3N0VHJhbnNmb3JtcztcbiAgdmFyIHBsYXRmb3JtSXNQcmVUYWc7XG4gIHZhciBwbGF0Zm9ybU11c3RVc2VQcm9wO1xuICB2YXIgcGxhdGZvcm1HZXRUYWdOYW1lc3BhY2U7XG4gIHZhciBtYXliZUNvbXBvbmVudDtcblxuICBmdW5jdGlvbiBjcmVhdGVBU1RFbGVtZW50IChcbiAgICB0YWcsXG4gICAgYXR0cnMsXG4gICAgcGFyZW50XG4gICkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAxLFxuICAgICAgdGFnOiB0YWcsXG4gICAgICBhdHRyc0xpc3Q6IGF0dHJzLFxuICAgICAgYXR0cnNNYXA6IG1ha2VBdHRyc01hcChhdHRycyksXG4gICAgICByYXdBdHRyc01hcDoge30sXG4gICAgICBwYXJlbnQ6IHBhcmVudCxcbiAgICAgIGNoaWxkcmVuOiBbXVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IEhUTUwgc3RyaW5nIHRvIEFTVC5cbiAgICovXG4gIGZ1bmN0aW9uIHBhcnNlIChcbiAgICB0ZW1wbGF0ZSxcbiAgICBvcHRpb25zXG4gICkge1xuICAgIHdhcm4kMiA9IG9wdGlvbnMud2FybiB8fCBiYXNlV2FybjtcblxuICAgIHBsYXRmb3JtSXNQcmVUYWcgPSBvcHRpb25zLmlzUHJlVGFnIHx8IG5vO1xuICAgIHBsYXRmb3JtTXVzdFVzZVByb3AgPSBvcHRpb25zLm11c3RVc2VQcm9wIHx8IG5vO1xuICAgIHBsYXRmb3JtR2V0VGFnTmFtZXNwYWNlID0gb3B0aW9ucy5nZXRUYWdOYW1lc3BhY2UgfHwgbm87XG4gICAgdmFyIGlzUmVzZXJ2ZWRUYWcgPSBvcHRpb25zLmlzUmVzZXJ2ZWRUYWcgfHwgbm87XG4gICAgbWF5YmVDb21wb25lbnQgPSBmdW5jdGlvbiAoZWwpIHsgcmV0dXJuICEhKFxuICAgICAgZWwuY29tcG9uZW50IHx8XG4gICAgICBlbC5hdHRyc01hcFsnOmlzJ10gfHxcbiAgICAgIGVsLmF0dHJzTWFwWyd2LWJpbmQ6aXMnXSB8fFxuICAgICAgIShlbC5hdHRyc01hcC5pcyA/IGlzUmVzZXJ2ZWRUYWcoZWwuYXR0cnNNYXAuaXMpIDogaXNSZXNlcnZlZFRhZyhlbC50YWcpKVxuICAgICk7IH07XG4gICAgdHJhbnNmb3JtcyA9IHBsdWNrTW9kdWxlRnVuY3Rpb24ob3B0aW9ucy5tb2R1bGVzLCAndHJhbnNmb3JtTm9kZScpO1xuICAgIHByZVRyYW5zZm9ybXMgPSBwbHVja01vZHVsZUZ1bmN0aW9uKG9wdGlvbnMubW9kdWxlcywgJ3ByZVRyYW5zZm9ybU5vZGUnKTtcbiAgICBwb3N0VHJhbnNmb3JtcyA9IHBsdWNrTW9kdWxlRnVuY3Rpb24ob3B0aW9ucy5tb2R1bGVzLCAncG9zdFRyYW5zZm9ybU5vZGUnKTtcblxuICAgIGRlbGltaXRlcnMgPSBvcHRpb25zLmRlbGltaXRlcnM7XG5cbiAgICB2YXIgc3RhY2sgPSBbXTtcbiAgICB2YXIgcHJlc2VydmVXaGl0ZXNwYWNlID0gb3B0aW9ucy5wcmVzZXJ2ZVdoaXRlc3BhY2UgIT09IGZhbHNlO1xuICAgIHZhciB3aGl0ZXNwYWNlT3B0aW9uID0gb3B0aW9ucy53aGl0ZXNwYWNlO1xuICAgIHZhciByb290O1xuICAgIHZhciBjdXJyZW50UGFyZW50O1xuICAgIHZhciBpblZQcmUgPSBmYWxzZTtcbiAgICB2YXIgaW5QcmUgPSBmYWxzZTtcbiAgICB2YXIgd2FybmVkID0gZmFsc2U7XG5cbiAgICBmdW5jdGlvbiB3YXJuT25jZSAobXNnLCByYW5nZSkge1xuICAgICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICAgICAgd2FybiQyKG1zZywgcmFuZ2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsb3NlRWxlbWVudCAoZWxlbWVudCkge1xuICAgICAgdHJpbUVuZGluZ1doaXRlc3BhY2UoZWxlbWVudCk7XG4gICAgICBpZiAoIWluVlByZSAmJiAhZWxlbWVudC5wcm9jZXNzZWQpIHtcbiAgICAgICAgZWxlbWVudCA9IHByb2Nlc3NFbGVtZW50KGVsZW1lbnQsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgICAgLy8gdHJlZSBtYW5hZ2VtZW50XG4gICAgICBpZiAoIXN0YWNrLmxlbmd0aCAmJiBlbGVtZW50ICE9PSByb290KSB7XG4gICAgICAgIC8vIGFsbG93IHJvb3QgZWxlbWVudHMgd2l0aCB2LWlmLCB2LWVsc2UtaWYgYW5kIHYtZWxzZVxuICAgICAgICBpZiAocm9vdC5pZiAmJiAoZWxlbWVudC5lbHNlaWYgfHwgZWxlbWVudC5lbHNlKSkge1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNoZWNrUm9vdENvbnN0cmFpbnRzKGVsZW1lbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhZGRJZkNvbmRpdGlvbihyb290LCB7XG4gICAgICAgICAgICBleHA6IGVsZW1lbnQuZWxzZWlmLFxuICAgICAgICAgICAgYmxvY2s6IGVsZW1lbnRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3YXJuT25jZShcbiAgICAgICAgICAgIFwiQ29tcG9uZW50IHRlbXBsYXRlIHNob3VsZCBjb250YWluIGV4YWN0bHkgb25lIHJvb3QgZWxlbWVudC4gXCIgK1xuICAgICAgICAgICAgXCJJZiB5b3UgYXJlIHVzaW5nIHYtaWYgb24gbXVsdGlwbGUgZWxlbWVudHMsIFwiICtcbiAgICAgICAgICAgIFwidXNlIHYtZWxzZS1pZiB0byBjaGFpbiB0aGVtIGluc3RlYWQuXCIsXG4gICAgICAgICAgICB7IHN0YXJ0OiBlbGVtZW50LnN0YXJ0IH1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudFBhcmVudCAmJiAhZWxlbWVudC5mb3JiaWRkZW4pIHtcbiAgICAgICAgaWYgKGVsZW1lbnQuZWxzZWlmIHx8IGVsZW1lbnQuZWxzZSkge1xuICAgICAgICAgIHByb2Nlc3NJZkNvbmRpdGlvbnMoZWxlbWVudCwgY3VycmVudFBhcmVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGVsZW1lbnQuc2xvdFNjb3BlKSB7XG4gICAgICAgICAgICAvLyBzY29wZWQgc2xvdFxuICAgICAgICAgICAgLy8ga2VlcCBpdCBpbiB0aGUgY2hpbGRyZW4gbGlzdCBzbyB0aGF0IHYtZWxzZSgtaWYpIGNvbmRpdGlvbnMgY2FuXG4gICAgICAgICAgICAvLyBmaW5kIGl0IGFzIHRoZSBwcmV2IG5vZGUuXG4gICAgICAgICAgICB2YXIgbmFtZSA9IGVsZW1lbnQuc2xvdFRhcmdldCB8fCAnXCJkZWZhdWx0XCInXG4gICAgICAgICAgICA7KGN1cnJlbnRQYXJlbnQuc2NvcGVkU2xvdHMgfHwgKGN1cnJlbnRQYXJlbnQuc2NvcGVkU2xvdHMgPSB7fSkpW25hbWVdID0gZWxlbWVudDtcbiAgICAgICAgICB9XG4gICAgICAgICAgY3VycmVudFBhcmVudC5jaGlsZHJlbi5wdXNoKGVsZW1lbnQpO1xuICAgICAgICAgIGVsZW1lbnQucGFyZW50ID0gY3VycmVudFBhcmVudDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBmaW5hbCBjaGlsZHJlbiBjbGVhbnVwXG4gICAgICAvLyBmaWx0ZXIgb3V0IHNjb3BlZCBzbG90c1xuICAgICAgZWxlbWVudC5jaGlsZHJlbiA9IGVsZW1lbnQuY2hpbGRyZW4uZmlsdGVyKGZ1bmN0aW9uIChjKSB7IHJldHVybiAhKGMpLnNsb3RTY29wZTsgfSk7XG4gICAgICAvLyByZW1vdmUgdHJhaWxpbmcgd2hpdGVzcGFjZSBub2RlIGFnYWluXG4gICAgICB0cmltRW5kaW5nV2hpdGVzcGFjZShlbGVtZW50KTtcblxuICAgICAgLy8gY2hlY2sgcHJlIHN0YXRlXG4gICAgICBpZiAoZWxlbWVudC5wcmUpIHtcbiAgICAgICAgaW5WUHJlID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAocGxhdGZvcm1Jc1ByZVRhZyhlbGVtZW50LnRhZykpIHtcbiAgICAgICAgaW5QcmUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vIGFwcGx5IHBvc3QtdHJhbnNmb3Jtc1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwb3N0VHJhbnNmb3Jtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBwb3N0VHJhbnNmb3Jtc1tpXShlbGVtZW50LCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmltRW5kaW5nV2hpdGVzcGFjZSAoZWwpIHtcbiAgICAgIC8vIHJlbW92ZSB0cmFpbGluZyB3aGl0ZXNwYWNlIG5vZGVcbiAgICAgIGlmICghaW5QcmUpIHtcbiAgICAgICAgdmFyIGxhc3ROb2RlO1xuICAgICAgICB3aGlsZSAoXG4gICAgICAgICAgKGxhc3ROb2RlID0gZWwuY2hpbGRyZW5bZWwuY2hpbGRyZW4ubGVuZ3RoIC0gMV0pICYmXG4gICAgICAgICAgbGFzdE5vZGUudHlwZSA9PT0gMyAmJlxuICAgICAgICAgIGxhc3ROb2RlLnRleHQgPT09ICcgJ1xuICAgICAgICApIHtcbiAgICAgICAgICBlbC5jaGlsZHJlbi5wb3AoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoZWNrUm9vdENvbnN0cmFpbnRzIChlbCkge1xuICAgICAgaWYgKGVsLnRhZyA9PT0gJ3Nsb3QnIHx8IGVsLnRhZyA9PT0gJ3RlbXBsYXRlJykge1xuICAgICAgICB3YXJuT25jZShcbiAgICAgICAgICBcIkNhbm5vdCB1c2UgPFwiICsgKGVsLnRhZykgKyBcIj4gYXMgY29tcG9uZW50IHJvb3QgZWxlbWVudCBiZWNhdXNlIGl0IG1heSBcIiArXG4gICAgICAgICAgJ2NvbnRhaW4gbXVsdGlwbGUgbm9kZXMuJyxcbiAgICAgICAgICB7IHN0YXJ0OiBlbC5zdGFydCB9XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBpZiAoZWwuYXR0cnNNYXAuaGFzT3duUHJvcGVydHkoJ3YtZm9yJykpIHtcbiAgICAgICAgd2Fybk9uY2UoXG4gICAgICAgICAgJ0Nhbm5vdCB1c2Ugdi1mb3Igb24gc3RhdGVmdWwgY29tcG9uZW50IHJvb3QgZWxlbWVudCBiZWNhdXNlICcgK1xuICAgICAgICAgICdpdCByZW5kZXJzIG11bHRpcGxlIGVsZW1lbnRzLicsXG4gICAgICAgICAgZWwucmF3QXR0cnNNYXBbJ3YtZm9yJ11cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwYXJzZUhUTUwodGVtcGxhdGUsIHtcbiAgICAgIHdhcm46IHdhcm4kMixcbiAgICAgIGV4cGVjdEhUTUw6IG9wdGlvbnMuZXhwZWN0SFRNTCxcbiAgICAgIGlzVW5hcnlUYWc6IG9wdGlvbnMuaXNVbmFyeVRhZyxcbiAgICAgIGNhbkJlTGVmdE9wZW5UYWc6IG9wdGlvbnMuY2FuQmVMZWZ0T3BlblRhZyxcbiAgICAgIHNob3VsZERlY29kZU5ld2xpbmVzOiBvcHRpb25zLnNob3VsZERlY29kZU5ld2xpbmVzLFxuICAgICAgc2hvdWxkRGVjb2RlTmV3bGluZXNGb3JIcmVmOiBvcHRpb25zLnNob3VsZERlY29kZU5ld2xpbmVzRm9ySHJlZixcbiAgICAgIHNob3VsZEtlZXBDb21tZW50OiBvcHRpb25zLmNvbW1lbnRzLFxuICAgICAgb3V0cHV0U291cmNlUmFuZ2U6IG9wdGlvbnMub3V0cHV0U291cmNlUmFuZ2UsXG4gICAgICBzdGFydDogZnVuY3Rpb24gc3RhcnQgKHRhZywgYXR0cnMsIHVuYXJ5LCBzdGFydCQxLCBlbmQpIHtcbiAgICAgICAgLy8gY2hlY2sgbmFtZXNwYWNlLlxuICAgICAgICAvLyBpbmhlcml0IHBhcmVudCBucyBpZiB0aGVyZSBpcyBvbmVcbiAgICAgICAgdmFyIG5zID0gKGN1cnJlbnRQYXJlbnQgJiYgY3VycmVudFBhcmVudC5ucykgfHwgcGxhdGZvcm1HZXRUYWdOYW1lc3BhY2UodGFnKTtcblxuICAgICAgICAvLyBoYW5kbGUgSUUgc3ZnIGJ1Z1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgaWYgKGlzSUUgJiYgbnMgPT09ICdzdmcnKSB7XG4gICAgICAgICAgYXR0cnMgPSBndWFyZElFU1ZHQnVnKGF0dHJzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBlbGVtZW50ID0gY3JlYXRlQVNURWxlbWVudCh0YWcsIGF0dHJzLCBjdXJyZW50UGFyZW50KTtcbiAgICAgICAgaWYgKG5zKSB7XG4gICAgICAgICAgZWxlbWVudC5ucyA9IG5zO1xuICAgICAgICB9XG5cbiAgICAgICAge1xuICAgICAgICAgIGlmIChvcHRpb25zLm91dHB1dFNvdXJjZVJhbmdlKSB7XG4gICAgICAgICAgICBlbGVtZW50LnN0YXJ0ID0gc3RhcnQkMTtcbiAgICAgICAgICAgIGVsZW1lbnQuZW5kID0gZW5kO1xuICAgICAgICAgICAgZWxlbWVudC5yYXdBdHRyc01hcCA9IGVsZW1lbnQuYXR0cnNMaXN0LnJlZHVjZShmdW5jdGlvbiAoY3VtdWxhdGVkLCBhdHRyKSB7XG4gICAgICAgICAgICAgIGN1bXVsYXRlZFthdHRyLm5hbWVdID0gYXR0cjtcbiAgICAgICAgICAgICAgcmV0dXJuIGN1bXVsYXRlZFxuICAgICAgICAgICAgfSwge30pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhdHRycy5mb3JFYWNoKGZ1bmN0aW9uIChhdHRyKSB7XG4gICAgICAgICAgICBpZiAoaW52YWxpZEF0dHJpYnV0ZVJFLnRlc3QoYXR0ci5uYW1lKSkge1xuICAgICAgICAgICAgICB3YXJuJDIoXG4gICAgICAgICAgICAgICAgXCJJbnZhbGlkIGR5bmFtaWMgYXJndW1lbnQgZXhwcmVzc2lvbjogYXR0cmlidXRlIG5hbWVzIGNhbm5vdCBjb250YWluIFwiICtcbiAgICAgICAgICAgICAgICBcInNwYWNlcywgcXVvdGVzLCA8LCA+LCAvIG9yID0uXCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgc3RhcnQ6IGF0dHIuc3RhcnQgKyBhdHRyLm5hbWUuaW5kZXhPZihcIltcIiksXG4gICAgICAgICAgICAgICAgICBlbmQ6IGF0dHIuc3RhcnQgKyBhdHRyLm5hbWUubGVuZ3RoXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzRm9yYmlkZGVuVGFnKGVsZW1lbnQpICYmICFpc1NlcnZlclJlbmRlcmluZygpKSB7XG4gICAgICAgICAgZWxlbWVudC5mb3JiaWRkZW4gPSB0cnVlO1xuICAgICAgICAgIHdhcm4kMihcbiAgICAgICAgICAgICdUZW1wbGF0ZXMgc2hvdWxkIG9ubHkgYmUgcmVzcG9uc2libGUgZm9yIG1hcHBpbmcgdGhlIHN0YXRlIHRvIHRoZSAnICtcbiAgICAgICAgICAgICdVSS4gQXZvaWQgcGxhY2luZyB0YWdzIHdpdGggc2lkZS1lZmZlY3RzIGluIHlvdXIgdGVtcGxhdGVzLCBzdWNoIGFzICcgK1xuICAgICAgICAgICAgXCI8XCIgKyB0YWcgKyBcIj5cIiArICcsIGFzIHRoZXkgd2lsbCBub3QgYmUgcGFyc2VkLicsXG4gICAgICAgICAgICB7IHN0YXJ0OiBlbGVtZW50LnN0YXJ0IH1cbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYXBwbHkgcHJlLXRyYW5zZm9ybXNcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcmVUcmFuc2Zvcm1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgZWxlbWVudCA9IHByZVRyYW5zZm9ybXNbaV0oZWxlbWVudCwgb3B0aW9ucykgfHwgZWxlbWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaW5WUHJlKSB7XG4gICAgICAgICAgcHJvY2Vzc1ByZShlbGVtZW50KTtcbiAgICAgICAgICBpZiAoZWxlbWVudC5wcmUpIHtcbiAgICAgICAgICAgIGluVlByZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChwbGF0Zm9ybUlzUHJlVGFnKGVsZW1lbnQudGFnKSkge1xuICAgICAgICAgIGluUHJlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5WUHJlKSB7XG4gICAgICAgICAgcHJvY2Vzc1Jhd0F0dHJzKGVsZW1lbnQpO1xuICAgICAgICB9IGVsc2UgaWYgKCFlbGVtZW50LnByb2Nlc3NlZCkge1xuICAgICAgICAgIC8vIHN0cnVjdHVyYWwgZGlyZWN0aXZlc1xuICAgICAgICAgIHByb2Nlc3NGb3IoZWxlbWVudCk7XG4gICAgICAgICAgcHJvY2Vzc0lmKGVsZW1lbnQpO1xuICAgICAgICAgIHByb2Nlc3NPbmNlKGVsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFyb290KSB7XG4gICAgICAgICAgcm9vdCA9IGVsZW1lbnQ7XG4gICAgICAgICAge1xuICAgICAgICAgICAgY2hlY2tSb290Q29uc3RyYWludHMocm9vdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF1bmFyeSkge1xuICAgICAgICAgIGN1cnJlbnRQYXJlbnQgPSBlbGVtZW50O1xuICAgICAgICAgIHN0YWNrLnB1c2goZWxlbWVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2xvc2VFbGVtZW50KGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBlbmQ6IGZ1bmN0aW9uIGVuZCAodGFnLCBzdGFydCwgZW5kJDEpIHtcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcbiAgICAgICAgLy8gcG9wIHN0YWNrXG4gICAgICAgIHN0YWNrLmxlbmd0aCAtPSAxO1xuICAgICAgICBjdXJyZW50UGFyZW50ID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChvcHRpb25zLm91dHB1dFNvdXJjZVJhbmdlKSB7XG4gICAgICAgICAgZWxlbWVudC5lbmQgPSBlbmQkMTtcbiAgICAgICAgfVxuICAgICAgICBjbG9zZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgICB9LFxuXG4gICAgICBjaGFyczogZnVuY3Rpb24gY2hhcnMgKHRleHQsIHN0YXJ0LCBlbmQpIHtcbiAgICAgICAgaWYgKCFjdXJyZW50UGFyZW50KSB7XG4gICAgICAgICAge1xuICAgICAgICAgICAgaWYgKHRleHQgPT09IHRlbXBsYXRlKSB7XG4gICAgICAgICAgICAgIHdhcm5PbmNlKFxuICAgICAgICAgICAgICAgICdDb21wb25lbnQgdGVtcGxhdGUgcmVxdWlyZXMgYSByb290IGVsZW1lbnQsIHJhdGhlciB0aGFuIGp1c3QgdGV4dC4nLFxuICAgICAgICAgICAgICAgIHsgc3RhcnQ6IHN0YXJ0IH1cbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKHRleHQgPSB0ZXh0LnRyaW0oKSkpIHtcbiAgICAgICAgICAgICAgd2Fybk9uY2UoXG4gICAgICAgICAgICAgICAgKFwidGV4dCBcXFwiXCIgKyB0ZXh0ICsgXCJcXFwiIG91dHNpZGUgcm9vdCBlbGVtZW50IHdpbGwgYmUgaWdub3JlZC5cIiksXG4gICAgICAgICAgICAgICAgeyBzdGFydDogc3RhcnQgfVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICAvLyBJRSB0ZXh0YXJlYSBwbGFjZWhvbGRlciBidWdcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgIGlmIChpc0lFICYmXG4gICAgICAgICAgY3VycmVudFBhcmVudC50YWcgPT09ICd0ZXh0YXJlYScgJiZcbiAgICAgICAgICBjdXJyZW50UGFyZW50LmF0dHJzTWFwLnBsYWNlaG9sZGVyID09PSB0ZXh0XG4gICAgICAgICkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IGN1cnJlbnRQYXJlbnQuY2hpbGRyZW47XG4gICAgICAgIGlmIChpblByZSB8fCB0ZXh0LnRyaW0oKSkge1xuICAgICAgICAgIHRleHQgPSBpc1RleHRUYWcoY3VycmVudFBhcmVudCkgPyB0ZXh0IDogZGVjb2RlSFRNTENhY2hlZCh0ZXh0KTtcbiAgICAgICAgfSBlbHNlIGlmICghY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgLy8gcmVtb3ZlIHRoZSB3aGl0ZXNwYWNlLW9ubHkgbm9kZSByaWdodCBhZnRlciBhbiBvcGVuaW5nIHRhZ1xuICAgICAgICAgIHRleHQgPSAnJztcbiAgICAgICAgfSBlbHNlIGlmICh3aGl0ZXNwYWNlT3B0aW9uKSB7XG4gICAgICAgICAgaWYgKHdoaXRlc3BhY2VPcHRpb24gPT09ICdjb25kZW5zZScpIHtcbiAgICAgICAgICAgIC8vIGluIGNvbmRlbnNlIG1vZGUsIHJlbW92ZSB0aGUgd2hpdGVzcGFjZSBub2RlIGlmIGl0IGNvbnRhaW5zXG4gICAgICAgICAgICAvLyBsaW5lIGJyZWFrLCBvdGhlcndpc2UgY29uZGVuc2UgdG8gYSBzaW5nbGUgc3BhY2VcbiAgICAgICAgICAgIHRleHQgPSBsaW5lQnJlYWtSRS50ZXN0KHRleHQpID8gJycgOiAnICc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRleHQgPSAnICc7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRleHQgPSBwcmVzZXJ2ZVdoaXRlc3BhY2UgPyAnICcgOiAnJztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGV4dCkge1xuICAgICAgICAgIGlmICghaW5QcmUgJiYgd2hpdGVzcGFjZU9wdGlvbiA9PT0gJ2NvbmRlbnNlJykge1xuICAgICAgICAgICAgLy8gY29uZGVuc2UgY29uc2VjdXRpdmUgd2hpdGVzcGFjZXMgaW50byBzaW5nbGUgc3BhY2VcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2Uod2hpdGVzcGFjZVJFJDEsICcgJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciByZXM7XG4gICAgICAgICAgdmFyIGNoaWxkO1xuICAgICAgICAgIGlmICghaW5WUHJlICYmIHRleHQgIT09ICcgJyAmJiAocmVzID0gcGFyc2VUZXh0KHRleHQsIGRlbGltaXRlcnMpKSkge1xuICAgICAgICAgICAgY2hpbGQgPSB7XG4gICAgICAgICAgICAgIHR5cGU6IDIsXG4gICAgICAgICAgICAgIGV4cHJlc3Npb246IHJlcy5leHByZXNzaW9uLFxuICAgICAgICAgICAgICB0b2tlbnM6IHJlcy50b2tlbnMsXG4gICAgICAgICAgICAgIHRleHQ6IHRleHRcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSBlbHNlIGlmICh0ZXh0ICE9PSAnICcgfHwgIWNoaWxkcmVuLmxlbmd0aCB8fCBjaGlsZHJlbltjaGlsZHJlbi5sZW5ndGggLSAxXS50ZXh0ICE9PSAnICcpIHtcbiAgICAgICAgICAgIGNoaWxkID0ge1xuICAgICAgICAgICAgICB0eXBlOiAzLFxuICAgICAgICAgICAgICB0ZXh0OiB0ZXh0XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY2hpbGQpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLm91dHB1dFNvdXJjZVJhbmdlKSB7XG4gICAgICAgICAgICAgIGNoaWxkLnN0YXJ0ID0gc3RhcnQ7XG4gICAgICAgICAgICAgIGNoaWxkLmVuZCA9IGVuZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNvbW1lbnQ6IGZ1bmN0aW9uIGNvbW1lbnQgKHRleHQsIHN0YXJ0LCBlbmQpIHtcbiAgICAgICAgLy8gYWRkaW5nIGFueXRoaW5nIGFzIGEgc2libGluZyB0byB0aGUgcm9vdCBub2RlIGlzIGZvcmJpZGRlblxuICAgICAgICAvLyBjb21tZW50cyBzaG91bGQgc3RpbGwgYmUgYWxsb3dlZCwgYnV0IGlnbm9yZWRcbiAgICAgICAgaWYgKGN1cnJlbnRQYXJlbnQpIHtcbiAgICAgICAgICB2YXIgY2hpbGQgPSB7XG4gICAgICAgICAgICB0eXBlOiAzLFxuICAgICAgICAgICAgdGV4dDogdGV4dCxcbiAgICAgICAgICAgIGlzQ29tbWVudDogdHJ1ZVxuICAgICAgICAgIH07XG4gICAgICAgICAgaWYgKG9wdGlvbnMub3V0cHV0U291cmNlUmFuZ2UpIHtcbiAgICAgICAgICAgIGNoaWxkLnN0YXJ0ID0gc3RhcnQ7XG4gICAgICAgICAgICBjaGlsZC5lbmQgPSBlbmQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGN1cnJlbnRQYXJlbnQuY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcm9vdFxuICB9XG5cbiAgZnVuY3Rpb24gcHJvY2Vzc1ByZSAoZWwpIHtcbiAgICBpZiAoZ2V0QW5kUmVtb3ZlQXR0cihlbCwgJ3YtcHJlJykgIT0gbnVsbCkge1xuICAgICAgZWwucHJlID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwcm9jZXNzUmF3QXR0cnMgKGVsKSB7XG4gICAgdmFyIGxpc3QgPSBlbC5hdHRyc0xpc3Q7XG4gICAgdmFyIGxlbiA9IGxpc3QubGVuZ3RoO1xuICAgIGlmIChsZW4pIHtcbiAgICAgIHZhciBhdHRycyA9IGVsLmF0dHJzID0gbmV3IEFycmF5KGxlbik7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGF0dHJzW2ldID0ge1xuICAgICAgICAgIG5hbWU6IGxpc3RbaV0ubmFtZSxcbiAgICAgICAgICB2YWx1ZTogSlNPTi5zdHJpbmdpZnkobGlzdFtpXS52YWx1ZSlcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGxpc3RbaV0uc3RhcnQgIT0gbnVsbCkge1xuICAgICAgICAgIGF0dHJzW2ldLnN0YXJ0ID0gbGlzdFtpXS5zdGFydDtcbiAgICAgICAgICBhdHRyc1tpXS5lbmQgPSBsaXN0W2ldLmVuZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIWVsLnByZSkge1xuICAgICAgLy8gbm9uIHJvb3Qgbm9kZSBpbiBwcmUgYmxvY2tzIHdpdGggbm8gYXR0cmlidXRlc1xuICAgICAgZWwucGxhaW4gPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHByb2Nlc3NFbGVtZW50IChcbiAgICBlbGVtZW50LFxuICAgIG9wdGlvbnNcbiAgKSB7XG4gICAgcHJvY2Vzc0tleShlbGVtZW50KTtcblxuICAgIC8vIGRldGVybWluZSB3aGV0aGVyIHRoaXMgaXMgYSBwbGFpbiBlbGVtZW50IGFmdGVyXG4gICAgLy8gcmVtb3Zpbmcgc3RydWN0dXJhbCBhdHRyaWJ1dGVzXG4gICAgZWxlbWVudC5wbGFpbiA9IChcbiAgICAgICFlbGVtZW50LmtleSAmJlxuICAgICAgIWVsZW1lbnQuc2NvcGVkU2xvdHMgJiZcbiAgICAgICFlbGVtZW50LmF0dHJzTGlzdC5sZW5ndGhcbiAgICApO1xuXG4gICAgcHJvY2Vzc1JlZihlbGVtZW50KTtcbiAgICBwcm9jZXNzU2xvdENvbnRlbnQoZWxlbWVudCk7XG4gICAgcHJvY2Vzc1Nsb3RPdXRsZXQoZWxlbWVudCk7XG4gICAgcHJvY2Vzc0NvbXBvbmVudChlbGVtZW50KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRyYW5zZm9ybXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGVsZW1lbnQgPSB0cmFuc2Zvcm1zW2ldKGVsZW1lbnQsIG9wdGlvbnMpIHx8IGVsZW1lbnQ7XG4gICAgfVxuICAgIHByb2Nlc3NBdHRycyhlbGVtZW50KTtcbiAgICByZXR1cm4gZWxlbWVudFxuICB9XG5cbiAgZnVuY3Rpb24gcHJvY2Vzc0tleSAoZWwpIHtcbiAgICB2YXIgZXhwID0gZ2V0QmluZGluZ0F0dHIoZWwsICdrZXknKTtcbiAgICBpZiAoZXhwKSB7XG4gICAgICB7XG4gICAgICAgIGlmIChlbC50YWcgPT09ICd0ZW1wbGF0ZScpIHtcbiAgICAgICAgICB3YXJuJDIoXG4gICAgICAgICAgICBcIjx0ZW1wbGF0ZT4gY2Fubm90IGJlIGtleWVkLiBQbGFjZSB0aGUga2V5IG9uIHJlYWwgZWxlbWVudHMgaW5zdGVhZC5cIixcbiAgICAgICAgICAgIGdldFJhd0JpbmRpbmdBdHRyKGVsLCAna2V5JylcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbC5mb3IpIHtcbiAgICAgICAgICB2YXIgaXRlcmF0b3IgPSBlbC5pdGVyYXRvcjIgfHwgZWwuaXRlcmF0b3IxO1xuICAgICAgICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnQ7XG4gICAgICAgICAgaWYgKGl0ZXJhdG9yICYmIGl0ZXJhdG9yID09PSBleHAgJiYgcGFyZW50ICYmIHBhcmVudC50YWcgPT09ICd0cmFuc2l0aW9uLWdyb3VwJykge1xuICAgICAgICAgICAgd2FybiQyKFxuICAgICAgICAgICAgICBcIkRvIG5vdCB1c2Ugdi1mb3IgaW5kZXggYXMga2V5IG9uIDx0cmFuc2l0aW9uLWdyb3VwPiBjaGlsZHJlbiwgXCIgK1xuICAgICAgICAgICAgICBcInRoaXMgaXMgdGhlIHNhbWUgYXMgbm90IHVzaW5nIGtleXMuXCIsXG4gICAgICAgICAgICAgIGdldFJhd0JpbmRpbmdBdHRyKGVsLCAna2V5JyksXG4gICAgICAgICAgICAgIHRydWUgLyogdGlwICovXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWwua2V5ID0gZXhwO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHByb2Nlc3NSZWYgKGVsKSB7XG4gICAgdmFyIHJlZiA9IGdldEJpbmRpbmdBdHRyKGVsLCAncmVmJyk7XG4gICAgaWYgKHJlZikge1xuICAgICAgZWwucmVmID0gcmVmO1xuICAgICAgZWwucmVmSW5Gb3IgPSBjaGVja0luRm9yKGVsKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwcm9jZXNzRm9yIChlbCkge1xuICAgIHZhciBleHA7XG4gICAgaWYgKChleHAgPSBnZXRBbmRSZW1vdmVBdHRyKGVsLCAndi1mb3InKSkpIHtcbiAgICAgIHZhciByZXMgPSBwYXJzZUZvcihleHApO1xuICAgICAgaWYgKHJlcykge1xuICAgICAgICBleHRlbmQoZWwsIHJlcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3YXJuJDIoXG4gICAgICAgICAgKFwiSW52YWxpZCB2LWZvciBleHByZXNzaW9uOiBcIiArIGV4cCksXG4gICAgICAgICAgZWwucmF3QXR0cnNNYXBbJ3YtZm9yJ11cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG5cbiAgZnVuY3Rpb24gcGFyc2VGb3IgKGV4cCkge1xuICAgIHZhciBpbk1hdGNoID0gZXhwLm1hdGNoKGZvckFsaWFzUkUpO1xuICAgIGlmICghaW5NYXRjaCkgeyByZXR1cm4gfVxuICAgIHZhciByZXMgPSB7fTtcbiAgICByZXMuZm9yID0gaW5NYXRjaFsyXS50cmltKCk7XG4gICAgdmFyIGFsaWFzID0gaW5NYXRjaFsxXS50cmltKCkucmVwbGFjZShzdHJpcFBhcmVuc1JFLCAnJyk7XG4gICAgdmFyIGl0ZXJhdG9yTWF0Y2ggPSBhbGlhcy5tYXRjaChmb3JJdGVyYXRvclJFKTtcbiAgICBpZiAoaXRlcmF0b3JNYXRjaCkge1xuICAgICAgcmVzLmFsaWFzID0gYWxpYXMucmVwbGFjZShmb3JJdGVyYXRvclJFLCAnJykudHJpbSgpO1xuICAgICAgcmVzLml0ZXJhdG9yMSA9IGl0ZXJhdG9yTWF0Y2hbMV0udHJpbSgpO1xuICAgICAgaWYgKGl0ZXJhdG9yTWF0Y2hbMl0pIHtcbiAgICAgICAgcmVzLml0ZXJhdG9yMiA9IGl0ZXJhdG9yTWF0Y2hbMl0udHJpbSgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXMuYWxpYXMgPSBhbGlhcztcbiAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgZnVuY3Rpb24gcHJvY2Vzc0lmIChlbCkge1xuICAgIHZhciBleHAgPSBnZXRBbmRSZW1vdmVBdHRyKGVsLCAndi1pZicpO1xuICAgIGlmIChleHApIHtcbiAgICAgIGVsLmlmID0gZXhwO1xuICAgICAgYWRkSWZDb25kaXRpb24oZWwsIHtcbiAgICAgICAgZXhwOiBleHAsXG4gICAgICAgIGJsb2NrOiBlbFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChnZXRBbmRSZW1vdmVBdHRyKGVsLCAndi1lbHNlJykgIT0gbnVsbCkge1xuICAgICAgICBlbC5lbHNlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHZhciBlbHNlaWYgPSBnZXRBbmRSZW1vdmVBdHRyKGVsLCAndi1lbHNlLWlmJyk7XG4gICAgICBpZiAoZWxzZWlmKSB7XG4gICAgICAgIGVsLmVsc2VpZiA9IGVsc2VpZjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwcm9jZXNzSWZDb25kaXRpb25zIChlbCwgcGFyZW50KSB7XG4gICAgdmFyIHByZXYgPSBmaW5kUHJldkVsZW1lbnQocGFyZW50LmNoaWxkcmVuKTtcbiAgICBpZiAocHJldiAmJiBwcmV2LmlmKSB7XG4gICAgICBhZGRJZkNvbmRpdGlvbihwcmV2LCB7XG4gICAgICAgIGV4cDogZWwuZWxzZWlmLFxuICAgICAgICBibG9jazogZWxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB3YXJuJDIoXG4gICAgICAgIFwidi1cIiArIChlbC5lbHNlaWYgPyAoJ2Vsc2UtaWY9XCInICsgZWwuZWxzZWlmICsgJ1wiJykgOiAnZWxzZScpICsgXCIgXCIgK1xuICAgICAgICBcInVzZWQgb24gZWxlbWVudCA8XCIgKyAoZWwudGFnKSArIFwiPiB3aXRob3V0IGNvcnJlc3BvbmRpbmcgdi1pZi5cIixcbiAgICAgICAgZWwucmF3QXR0cnNNYXBbZWwuZWxzZWlmID8gJ3YtZWxzZS1pZicgOiAndi1lbHNlJ11cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZmluZFByZXZFbGVtZW50IChjaGlsZHJlbikge1xuICAgIHZhciBpID0gY2hpbGRyZW4ubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGlmIChjaGlsZHJlbltpXS50eXBlID09PSAxKSB7XG4gICAgICAgIHJldHVybiBjaGlsZHJlbltpXVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGNoaWxkcmVuW2ldLnRleHQgIT09ICcgJykge1xuICAgICAgICAgIHdhcm4kMihcbiAgICAgICAgICAgIFwidGV4dCBcXFwiXCIgKyAoY2hpbGRyZW5baV0udGV4dC50cmltKCkpICsgXCJcXFwiIGJldHdlZW4gdi1pZiBhbmQgdi1lbHNlKC1pZikgXCIgK1xuICAgICAgICAgICAgXCJ3aWxsIGJlIGlnbm9yZWQuXCIsXG4gICAgICAgICAgICBjaGlsZHJlbltpXVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgY2hpbGRyZW4ucG9wKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYWRkSWZDb25kaXRpb24gKGVsLCBjb25kaXRpb24pIHtcbiAgICBpZiAoIWVsLmlmQ29uZGl0aW9ucykge1xuICAgICAgZWwuaWZDb25kaXRpb25zID0gW107XG4gICAgfVxuICAgIGVsLmlmQ29uZGl0aW9ucy5wdXNoKGNvbmRpdGlvbik7XG4gIH1cblxuICBmdW5jdGlvbiBwcm9jZXNzT25jZSAoZWwpIHtcbiAgICB2YXIgb25jZSQkMSA9IGdldEFuZFJlbW92ZUF0dHIoZWwsICd2LW9uY2UnKTtcbiAgICBpZiAob25jZSQkMSAhPSBudWxsKSB7XG4gICAgICBlbC5vbmNlID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvLyBoYW5kbGUgY29udGVudCBiZWluZyBwYXNzZWQgdG8gYSBjb21wb25lbnQgYXMgc2xvdCxcbiAgLy8gZS5nLiA8dGVtcGxhdGUgc2xvdD1cInh4eFwiPiwgPGRpdiBzbG90LXNjb3BlPVwieHh4XCI+XG4gIGZ1bmN0aW9uIHByb2Nlc3NTbG90Q29udGVudCAoZWwpIHtcbiAgICB2YXIgc2xvdFNjb3BlO1xuICAgIGlmIChlbC50YWcgPT09ICd0ZW1wbGF0ZScpIHtcbiAgICAgIHNsb3RTY29wZSA9IGdldEFuZFJlbW92ZUF0dHIoZWwsICdzY29wZScpO1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICBpZiAoc2xvdFNjb3BlKSB7XG4gICAgICAgIHdhcm4kMihcbiAgICAgICAgICBcInRoZSBcXFwic2NvcGVcXFwiIGF0dHJpYnV0ZSBmb3Igc2NvcGVkIHNsb3RzIGhhdmUgYmVlbiBkZXByZWNhdGVkIGFuZCBcIiArXG4gICAgICAgICAgXCJyZXBsYWNlZCBieSBcXFwic2xvdC1zY29wZVxcXCIgc2luY2UgMi41LiBUaGUgbmV3IFxcXCJzbG90LXNjb3BlXFxcIiBhdHRyaWJ1dGUgXCIgK1xuICAgICAgICAgIFwiY2FuIGFsc28gYmUgdXNlZCBvbiBwbGFpbiBlbGVtZW50cyBpbiBhZGRpdGlvbiB0byA8dGVtcGxhdGU+IHRvIFwiICtcbiAgICAgICAgICBcImRlbm90ZSBzY29wZWQgc2xvdHMuXCIsXG4gICAgICAgICAgZWwucmF3QXR0cnNNYXBbJ3Njb3BlJ10sXG4gICAgICAgICAgdHJ1ZVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgZWwuc2xvdFNjb3BlID0gc2xvdFNjb3BlIHx8IGdldEFuZFJlbW92ZUF0dHIoZWwsICdzbG90LXNjb3BlJyk7XG4gICAgfSBlbHNlIGlmICgoc2xvdFNjb3BlID0gZ2V0QW5kUmVtb3ZlQXR0cihlbCwgJ3Nsb3Qtc2NvcGUnKSkpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgaWYgKGVsLmF0dHJzTWFwWyd2LWZvciddKSB7XG4gICAgICAgIHdhcm4kMihcbiAgICAgICAgICBcIkFtYmlndW91cyBjb21iaW5lZCB1c2FnZSBvZiBzbG90LXNjb3BlIGFuZCB2LWZvciBvbiA8XCIgKyAoZWwudGFnKSArIFwiPiBcIiArXG4gICAgICAgICAgXCIodi1mb3IgdGFrZXMgaGlnaGVyIHByaW9yaXR5KS4gVXNlIGEgd3JhcHBlciA8dGVtcGxhdGU+IGZvciB0aGUgXCIgK1xuICAgICAgICAgIFwic2NvcGVkIHNsb3QgdG8gbWFrZSBpdCBjbGVhcmVyLlwiLFxuICAgICAgICAgIGVsLnJhd0F0dHJzTWFwWydzbG90LXNjb3BlJ10sXG4gICAgICAgICAgdHJ1ZVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgZWwuc2xvdFNjb3BlID0gc2xvdFNjb3BlO1xuICAgIH1cblxuICAgIC8vIHNsb3Q9XCJ4eHhcIlxuICAgIHZhciBzbG90VGFyZ2V0ID0gZ2V0QmluZGluZ0F0dHIoZWwsICdzbG90Jyk7XG4gICAgaWYgKHNsb3RUYXJnZXQpIHtcbiAgICAgIGVsLnNsb3RUYXJnZXQgPSBzbG90VGFyZ2V0ID09PSAnXCJcIicgPyAnXCJkZWZhdWx0XCInIDogc2xvdFRhcmdldDtcbiAgICAgIGVsLnNsb3RUYXJnZXREeW5hbWljID0gISEoZWwuYXR0cnNNYXBbJzpzbG90J10gfHwgZWwuYXR0cnNNYXBbJ3YtYmluZDpzbG90J10pO1xuICAgICAgLy8gcHJlc2VydmUgc2xvdCBhcyBhbiBhdHRyaWJ1dGUgZm9yIG5hdGl2ZSBzaGFkb3cgRE9NIGNvbXBhdFxuICAgICAgLy8gb25seSBmb3Igbm9uLXNjb3BlZCBzbG90cy5cbiAgICAgIGlmIChlbC50YWcgIT09ICd0ZW1wbGF0ZScgJiYgIWVsLnNsb3RTY29wZSkge1xuICAgICAgICBhZGRBdHRyKGVsLCAnc2xvdCcsIHNsb3RUYXJnZXQsIGdldFJhd0JpbmRpbmdBdHRyKGVsLCAnc2xvdCcpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAyLjYgdi1zbG90IHN5bnRheFxuICAgIHtcbiAgICAgIGlmIChlbC50YWcgPT09ICd0ZW1wbGF0ZScpIHtcbiAgICAgICAgLy8gdi1zbG90IG9uIDx0ZW1wbGF0ZT5cbiAgICAgICAgdmFyIHNsb3RCaW5kaW5nID0gZ2V0QW5kUmVtb3ZlQXR0ckJ5UmVnZXgoZWwsIHNsb3RSRSk7XG4gICAgICAgIGlmIChzbG90QmluZGluZykge1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGlmIChlbC5zbG90VGFyZ2V0IHx8IGVsLnNsb3RTY29wZSkge1xuICAgICAgICAgICAgICB3YXJuJDIoXG4gICAgICAgICAgICAgICAgXCJVbmV4cGVjdGVkIG1peGVkIHVzYWdlIG9mIGRpZmZlcmVudCBzbG90IHN5bnRheGVzLlwiLFxuICAgICAgICAgICAgICAgIGVsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZWwucGFyZW50ICYmICFtYXliZUNvbXBvbmVudChlbC5wYXJlbnQpKSB7XG4gICAgICAgICAgICAgIHdhcm4kMihcbiAgICAgICAgICAgICAgICBcIjx0ZW1wbGF0ZSB2LXNsb3Q+IGNhbiBvbmx5IGFwcGVhciBhdCB0aGUgcm9vdCBsZXZlbCBpbnNpZGUgXCIgK1xuICAgICAgICAgICAgICAgIFwidGhlIHJlY2VpdmluZyBjb21wb25lbnRcIixcbiAgICAgICAgICAgICAgICBlbFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgcmVmID0gZ2V0U2xvdE5hbWUoc2xvdEJpbmRpbmcpO1xuICAgICAgICAgIHZhciBuYW1lID0gcmVmLm5hbWU7XG4gICAgICAgICAgdmFyIGR5bmFtaWMgPSByZWYuZHluYW1pYztcbiAgICAgICAgICBlbC5zbG90VGFyZ2V0ID0gbmFtZTtcbiAgICAgICAgICBlbC5zbG90VGFyZ2V0RHluYW1pYyA9IGR5bmFtaWM7XG4gICAgICAgICAgZWwuc2xvdFNjb3BlID0gc2xvdEJpbmRpbmcudmFsdWUgfHwgZW1wdHlTbG90U2NvcGVUb2tlbjsgLy8gZm9yY2UgaXQgaW50byBhIHNjb3BlZCBzbG90IGZvciBwZXJmXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHYtc2xvdCBvbiBjb21wb25lbnQsIGRlbm90ZXMgZGVmYXVsdCBzbG90XG4gICAgICAgIHZhciBzbG90QmluZGluZyQxID0gZ2V0QW5kUmVtb3ZlQXR0ckJ5UmVnZXgoZWwsIHNsb3RSRSk7XG4gICAgICAgIGlmIChzbG90QmluZGluZyQxKSB7XG4gICAgICAgICAge1xuICAgICAgICAgICAgaWYgKCFtYXliZUNvbXBvbmVudChlbCkpIHtcbiAgICAgICAgICAgICAgd2FybiQyKFxuICAgICAgICAgICAgICAgIFwidi1zbG90IGNhbiBvbmx5IGJlIHVzZWQgb24gY29tcG9uZW50cyBvciA8dGVtcGxhdGU+LlwiLFxuICAgICAgICAgICAgICAgIHNsb3RCaW5kaW5nJDFcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlbC5zbG90U2NvcGUgfHwgZWwuc2xvdFRhcmdldCkge1xuICAgICAgICAgICAgICB3YXJuJDIoXG4gICAgICAgICAgICAgICAgXCJVbmV4cGVjdGVkIG1peGVkIHVzYWdlIG9mIGRpZmZlcmVudCBzbG90IHN5bnRheGVzLlwiLFxuICAgICAgICAgICAgICAgIGVsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZWwuc2NvcGVkU2xvdHMpIHtcbiAgICAgICAgICAgICAgd2FybiQyKFxuICAgICAgICAgICAgICAgIFwiVG8gYXZvaWQgc2NvcGUgYW1iaWd1aXR5LCB0aGUgZGVmYXVsdCBzbG90IHNob3VsZCBhbHNvIHVzZSBcIiArXG4gICAgICAgICAgICAgICAgXCI8dGVtcGxhdGU+IHN5bnRheCB3aGVuIHRoZXJlIGFyZSBvdGhlciBuYW1lZCBzbG90cy5cIixcbiAgICAgICAgICAgICAgICBzbG90QmluZGluZyQxXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGFkZCB0aGUgY29tcG9uZW50J3MgY2hpbGRyZW4gdG8gaXRzIGRlZmF1bHQgc2xvdFxuICAgICAgICAgIHZhciBzbG90cyA9IGVsLnNjb3BlZFNsb3RzIHx8IChlbC5zY29wZWRTbG90cyA9IHt9KTtcbiAgICAgICAgICB2YXIgcmVmJDEgPSBnZXRTbG90TmFtZShzbG90QmluZGluZyQxKTtcbiAgICAgICAgICB2YXIgbmFtZSQxID0gcmVmJDEubmFtZTtcbiAgICAgICAgICB2YXIgZHluYW1pYyQxID0gcmVmJDEuZHluYW1pYztcbiAgICAgICAgICB2YXIgc2xvdENvbnRhaW5lciA9IHNsb3RzW25hbWUkMV0gPSBjcmVhdGVBU1RFbGVtZW50KCd0ZW1wbGF0ZScsIFtdLCBlbCk7XG4gICAgICAgICAgc2xvdENvbnRhaW5lci5zbG90VGFyZ2V0ID0gbmFtZSQxO1xuICAgICAgICAgIHNsb3RDb250YWluZXIuc2xvdFRhcmdldER5bmFtaWMgPSBkeW5hbWljJDE7XG4gICAgICAgICAgc2xvdENvbnRhaW5lci5jaGlsZHJlbiA9IGVsLmNoaWxkcmVuLmZpbHRlcihmdW5jdGlvbiAoYykge1xuICAgICAgICAgICAgaWYgKCFjLnNsb3RTY29wZSkge1xuICAgICAgICAgICAgICBjLnBhcmVudCA9IHNsb3RDb250YWluZXI7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgc2xvdENvbnRhaW5lci5zbG90U2NvcGUgPSBzbG90QmluZGluZyQxLnZhbHVlIHx8IGVtcHR5U2xvdFNjb3BlVG9rZW47XG4gICAgICAgICAgLy8gcmVtb3ZlIGNoaWxkcmVuIGFzIHRoZXkgYXJlIHJldHVybmVkIGZyb20gc2NvcGVkU2xvdHMgbm93XG4gICAgICAgICAgZWwuY2hpbGRyZW4gPSBbXTtcbiAgICAgICAgICAvLyBtYXJrIGVsIG5vbi1wbGFpbiBzbyBkYXRhIGdldHMgZ2VuZXJhdGVkXG4gICAgICAgICAgZWwucGxhaW4gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFNsb3ROYW1lIChiaW5kaW5nKSB7XG4gICAgdmFyIG5hbWUgPSBiaW5kaW5nLm5hbWUucmVwbGFjZShzbG90UkUsICcnKTtcbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgIGlmIChiaW5kaW5nLm5hbWVbMF0gIT09ICcjJykge1xuICAgICAgICBuYW1lID0gJ2RlZmF1bHQnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2FybiQyKFxuICAgICAgICAgIFwidi1zbG90IHNob3J0aGFuZCBzeW50YXggcmVxdWlyZXMgYSBzbG90IG5hbWUuXCIsXG4gICAgICAgICAgYmluZGluZ1xuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZHluYW1pY0FyZ1JFLnRlc3QobmFtZSlcbiAgICAgIC8vIGR5bmFtaWMgW25hbWVdXG4gICAgICA/IHsgbmFtZTogbmFtZS5zbGljZSgxLCAtMSksIGR5bmFtaWM6IHRydWUgfVxuICAgICAgLy8gc3RhdGljIG5hbWVcbiAgICAgIDogeyBuYW1lOiAoXCJcXFwiXCIgKyBuYW1lICsgXCJcXFwiXCIpLCBkeW5hbWljOiBmYWxzZSB9XG4gIH1cblxuICAvLyBoYW5kbGUgPHNsb3QvPiBvdXRsZXRzXG4gIGZ1bmN0aW9uIHByb2Nlc3NTbG90T3V0bGV0IChlbCkge1xuICAgIGlmIChlbC50YWcgPT09ICdzbG90Jykge1xuICAgICAgZWwuc2xvdE5hbWUgPSBnZXRCaW5kaW5nQXR0cihlbCwgJ25hbWUnKTtcbiAgICAgIGlmIChlbC5rZXkpIHtcbiAgICAgICAgd2FybiQyKFxuICAgICAgICAgIFwiYGtleWAgZG9lcyBub3Qgd29yayBvbiA8c2xvdD4gYmVjYXVzZSBzbG90cyBhcmUgYWJzdHJhY3Qgb3V0bGV0cyBcIiArXG4gICAgICAgICAgXCJhbmQgY2FuIHBvc3NpYmx5IGV4cGFuZCBpbnRvIG11bHRpcGxlIGVsZW1lbnRzLiBcIiArXG4gICAgICAgICAgXCJVc2UgdGhlIGtleSBvbiBhIHdyYXBwaW5nIGVsZW1lbnQgaW5zdGVhZC5cIixcbiAgICAgICAgICBnZXRSYXdCaW5kaW5nQXR0cihlbCwgJ2tleScpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcHJvY2Vzc0NvbXBvbmVudCAoZWwpIHtcbiAgICB2YXIgYmluZGluZztcbiAgICBpZiAoKGJpbmRpbmcgPSBnZXRCaW5kaW5nQXR0cihlbCwgJ2lzJykpKSB7XG4gICAgICBlbC5jb21wb25lbnQgPSBiaW5kaW5nO1xuICAgIH1cbiAgICBpZiAoZ2V0QW5kUmVtb3ZlQXR0cihlbCwgJ2lubGluZS10ZW1wbGF0ZScpICE9IG51bGwpIHtcbiAgICAgIGVsLmlubGluZVRlbXBsYXRlID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwcm9jZXNzQXR0cnMgKGVsKSB7XG4gICAgdmFyIGxpc3QgPSBlbC5hdHRyc0xpc3Q7XG4gICAgdmFyIGksIGwsIG5hbWUsIHJhd05hbWUsIHZhbHVlLCBtb2RpZmllcnMsIHN5bmNHZW4sIGlzRHluYW1pYztcbiAgICBmb3IgKGkgPSAwLCBsID0gbGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIG5hbWUgPSByYXdOYW1lID0gbGlzdFtpXS5uYW1lO1xuICAgICAgdmFsdWUgPSBsaXN0W2ldLnZhbHVlO1xuICAgICAgaWYgKGRpclJFLnRlc3QobmFtZSkpIHtcbiAgICAgICAgLy8gbWFyayBlbGVtZW50IGFzIGR5bmFtaWNcbiAgICAgICAgZWwuaGFzQmluZGluZ3MgPSB0cnVlO1xuICAgICAgICAvLyBtb2RpZmllcnNcbiAgICAgICAgbW9kaWZpZXJzID0gcGFyc2VNb2RpZmllcnMobmFtZS5yZXBsYWNlKGRpclJFLCAnJykpO1xuICAgICAgICAvLyBzdXBwb3J0IC5mb28gc2hvcnRoYW5kIHN5bnRheCBmb3IgdGhlIC5wcm9wIG1vZGlmaWVyXG4gICAgICAgIGlmIChtb2RpZmllcnMpIHtcbiAgICAgICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKG1vZGlmaWVyUkUsICcnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYmluZFJFLnRlc3QobmFtZSkpIHsgLy8gdi1iaW5kXG4gICAgICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZShiaW5kUkUsICcnKTtcbiAgICAgICAgICB2YWx1ZSA9IHBhcnNlRmlsdGVycyh2YWx1ZSk7XG4gICAgICAgICAgaXNEeW5hbWljID0gZHluYW1pY0FyZ1JFLnRlc3QobmFtZSk7XG4gICAgICAgICAgaWYgKGlzRHluYW1pYykge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUuc2xpY2UoMSwgLTEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICB2YWx1ZS50cmltKCkubGVuZ3RoID09PSAwXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICB3YXJuJDIoXG4gICAgICAgICAgICAgIChcIlRoZSB2YWx1ZSBmb3IgYSB2LWJpbmQgZXhwcmVzc2lvbiBjYW5ub3QgYmUgZW1wdHkuIEZvdW5kIGluIFxcXCJ2LWJpbmQ6XCIgKyBuYW1lICsgXCJcXFwiXCIpXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobW9kaWZpZXJzKSB7XG4gICAgICAgICAgICBpZiAobW9kaWZpZXJzLnByb3AgJiYgIWlzRHluYW1pYykge1xuICAgICAgICAgICAgICBuYW1lID0gY2FtZWxpemUobmFtZSk7XG4gICAgICAgICAgICAgIGlmIChuYW1lID09PSAnaW5uZXJIdG1sJykgeyBuYW1lID0gJ2lubmVySFRNTCc7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtb2RpZmllcnMuY2FtZWwgJiYgIWlzRHluYW1pYykge1xuICAgICAgICAgICAgICBuYW1lID0gY2FtZWxpemUobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobW9kaWZpZXJzLnN5bmMpIHtcbiAgICAgICAgICAgICAgc3luY0dlbiA9IGdlbkFzc2lnbm1lbnRDb2RlKHZhbHVlLCBcIiRldmVudFwiKTtcbiAgICAgICAgICAgICAgaWYgKCFpc0R5bmFtaWMpIHtcbiAgICAgICAgICAgICAgICBhZGRIYW5kbGVyKFxuICAgICAgICAgICAgICAgICAgZWwsXG4gICAgICAgICAgICAgICAgICAoXCJ1cGRhdGU6XCIgKyAoY2FtZWxpemUobmFtZSkpKSxcbiAgICAgICAgICAgICAgICAgIHN5bmNHZW4sXG4gICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICB3YXJuJDIsXG4gICAgICAgICAgICAgICAgICBsaXN0W2ldXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBpZiAoaHlwaGVuYXRlKG5hbWUpICE9PSBjYW1lbGl6ZShuYW1lKSkge1xuICAgICAgICAgICAgICAgICAgYWRkSGFuZGxlcihcbiAgICAgICAgICAgICAgICAgICAgZWwsXG4gICAgICAgICAgICAgICAgICAgIChcInVwZGF0ZTpcIiArIChoeXBoZW5hdGUobmFtZSkpKSxcbiAgICAgICAgICAgICAgICAgICAgc3luY0dlbixcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHdhcm4kMixcbiAgICAgICAgICAgICAgICAgICAgbGlzdFtpXVxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gaGFuZGxlciB3LyBkeW5hbWljIGV2ZW50IG5hbWVcbiAgICAgICAgICAgICAgICBhZGRIYW5kbGVyKFxuICAgICAgICAgICAgICAgICAgZWwsXG4gICAgICAgICAgICAgICAgICAoXCJcXFwidXBkYXRlOlxcXCIrKFwiICsgbmFtZSArIFwiKVwiKSxcbiAgICAgICAgICAgICAgICAgIHN5bmNHZW4sXG4gICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICB3YXJuJDIsXG4gICAgICAgICAgICAgICAgICBsaXN0W2ldLFxuICAgICAgICAgICAgICAgICAgdHJ1ZSAvLyBkeW5hbWljXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoKG1vZGlmaWVycyAmJiBtb2RpZmllcnMucHJvcCkgfHwgKFxuICAgICAgICAgICAgIWVsLmNvbXBvbmVudCAmJiBwbGF0Zm9ybU11c3RVc2VQcm9wKGVsLnRhZywgZWwuYXR0cnNNYXAudHlwZSwgbmFtZSlcbiAgICAgICAgICApKSB7XG4gICAgICAgICAgICBhZGRQcm9wKGVsLCBuYW1lLCB2YWx1ZSwgbGlzdFtpXSwgaXNEeW5hbWljKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWRkQXR0cihlbCwgbmFtZSwgdmFsdWUsIGxpc3RbaV0sIGlzRHluYW1pYyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKG9uUkUudGVzdChuYW1lKSkgeyAvLyB2LW9uXG4gICAgICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZShvblJFLCAnJyk7XG4gICAgICAgICAgaXNEeW5hbWljID0gZHluYW1pY0FyZ1JFLnRlc3QobmFtZSk7XG4gICAgICAgICAgaWYgKGlzRHluYW1pYykge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUuc2xpY2UoMSwgLTEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhZGRIYW5kbGVyKGVsLCBuYW1lLCB2YWx1ZSwgbW9kaWZpZXJzLCBmYWxzZSwgd2FybiQyLCBsaXN0W2ldLCBpc0R5bmFtaWMpO1xuICAgICAgICB9IGVsc2UgeyAvLyBub3JtYWwgZGlyZWN0aXZlc1xuICAgICAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoZGlyUkUsICcnKTtcbiAgICAgICAgICAvLyBwYXJzZSBhcmdcbiAgICAgICAgICB2YXIgYXJnTWF0Y2ggPSBuYW1lLm1hdGNoKGFyZ1JFKTtcbiAgICAgICAgICB2YXIgYXJnID0gYXJnTWF0Y2ggJiYgYXJnTWF0Y2hbMV07XG4gICAgICAgICAgaXNEeW5hbWljID0gZmFsc2U7XG4gICAgICAgICAgaWYgKGFyZykge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUuc2xpY2UoMCwgLShhcmcubGVuZ3RoICsgMSkpO1xuICAgICAgICAgICAgaWYgKGR5bmFtaWNBcmdSRS50ZXN0KGFyZykpIHtcbiAgICAgICAgICAgICAgYXJnID0gYXJnLnNsaWNlKDEsIC0xKTtcbiAgICAgICAgICAgICAgaXNEeW5hbWljID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYWRkRGlyZWN0aXZlKGVsLCBuYW1lLCByYXdOYW1lLCB2YWx1ZSwgYXJnLCBpc0R5bmFtaWMsIG1vZGlmaWVycywgbGlzdFtpXSk7XG4gICAgICAgICAgaWYgKG5hbWUgPT09ICdtb2RlbCcpIHtcbiAgICAgICAgICAgIGNoZWNrRm9yQWxpYXNNb2RlbChlbCwgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbGl0ZXJhbCBhdHRyaWJ1dGVcbiAgICAgICAge1xuICAgICAgICAgIHZhciByZXMgPSBwYXJzZVRleHQodmFsdWUsIGRlbGltaXRlcnMpO1xuICAgICAgICAgIGlmIChyZXMpIHtcbiAgICAgICAgICAgIHdhcm4kMihcbiAgICAgICAgICAgICAgbmFtZSArIFwiPVxcXCJcIiArIHZhbHVlICsgXCJcXFwiOiBcIiArXG4gICAgICAgICAgICAgICdJbnRlcnBvbGF0aW9uIGluc2lkZSBhdHRyaWJ1dGVzIGhhcyBiZWVuIHJlbW92ZWQuICcgK1xuICAgICAgICAgICAgICAnVXNlIHYtYmluZCBvciB0aGUgY29sb24gc2hvcnRoYW5kIGluc3RlYWQuIEZvciBleGFtcGxlLCAnICtcbiAgICAgICAgICAgICAgJ2luc3RlYWQgb2YgPGRpdiBpZD1cInt7IHZhbCB9fVwiPiwgdXNlIDxkaXYgOmlkPVwidmFsXCI+LicsXG4gICAgICAgICAgICAgIGxpc3RbaV1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGFkZEF0dHIoZWwsIG5hbWUsIEpTT04uc3RyaW5naWZ5KHZhbHVlKSwgbGlzdFtpXSk7XG4gICAgICAgIC8vICM2ODg3IGZpcmVmb3ggZG9lc24ndCB1cGRhdGUgbXV0ZWQgc3RhdGUgaWYgc2V0IHZpYSBhdHRyaWJ1dGVcbiAgICAgICAgLy8gZXZlbiBpbW1lZGlhdGVseSBhZnRlciBlbGVtZW50IGNyZWF0aW9uXG4gICAgICAgIGlmICghZWwuY29tcG9uZW50ICYmXG4gICAgICAgICAgICBuYW1lID09PSAnbXV0ZWQnICYmXG4gICAgICAgICAgICBwbGF0Zm9ybU11c3RVc2VQcm9wKGVsLnRhZywgZWwuYXR0cnNNYXAudHlwZSwgbmFtZSkpIHtcbiAgICAgICAgICBhZGRQcm9wKGVsLCBuYW1lLCAndHJ1ZScsIGxpc3RbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tJbkZvciAoZWwpIHtcbiAgICB2YXIgcGFyZW50ID0gZWw7XG4gICAgd2hpbGUgKHBhcmVudCkge1xuICAgICAgaWYgKHBhcmVudC5mb3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZU1vZGlmaWVycyAobmFtZSkge1xuICAgIHZhciBtYXRjaCA9IG5hbWUubWF0Y2gobW9kaWZpZXJSRSk7XG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICB2YXIgcmV0ID0ge307XG4gICAgICBtYXRjaC5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7IHJldFttLnNsaWNlKDEpXSA9IHRydWU7IH0pO1xuICAgICAgcmV0dXJuIHJldFxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG1ha2VBdHRyc01hcCAoYXR0cnMpIHtcbiAgICB2YXIgbWFwID0ge307XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhdHRycy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmIChcbiAgICAgICAgbWFwW2F0dHJzW2ldLm5hbWVdICYmICFpc0lFICYmICFpc0VkZ2VcbiAgICAgICkge1xuICAgICAgICB3YXJuJDIoJ2R1cGxpY2F0ZSBhdHRyaWJ1dGU6ICcgKyBhdHRyc1tpXS5uYW1lLCBhdHRyc1tpXSk7XG4gICAgICB9XG4gICAgICBtYXBbYXR0cnNbaV0ubmFtZV0gPSBhdHRyc1tpXS52YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG1hcFxuICB9XG5cbiAgLy8gZm9yIHNjcmlwdCAoZS5nLiB0eXBlPVwieC90ZW1wbGF0ZVwiKSBvciBzdHlsZSwgZG8gbm90IGRlY29kZSBjb250ZW50XG4gIGZ1bmN0aW9uIGlzVGV4dFRhZyAoZWwpIHtcbiAgICByZXR1cm4gZWwudGFnID09PSAnc2NyaXB0JyB8fCBlbC50YWcgPT09ICdzdHlsZSdcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRm9yYmlkZGVuVGFnIChlbCkge1xuICAgIHJldHVybiAoXG4gICAgICBlbC50YWcgPT09ICdzdHlsZScgfHxcbiAgICAgIChlbC50YWcgPT09ICdzY3JpcHQnICYmIChcbiAgICAgICAgIWVsLmF0dHJzTWFwLnR5cGUgfHxcbiAgICAgICAgZWwuYXR0cnNNYXAudHlwZSA9PT0gJ3RleHQvamF2YXNjcmlwdCdcbiAgICAgICkpXG4gICAgKVxuICB9XG5cbiAgdmFyIGllTlNCdWcgPSAvXnhtbG5zOk5TXFxkKy87XG4gIHZhciBpZU5TUHJlZml4ID0gL15OU1xcZCs6LztcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBmdW5jdGlvbiBndWFyZElFU1ZHQnVnIChhdHRycykge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgYXR0ciA9IGF0dHJzW2ldO1xuICAgICAgaWYgKCFpZU5TQnVnLnRlc3QoYXR0ci5uYW1lKSkge1xuICAgICAgICBhdHRyLm5hbWUgPSBhdHRyLm5hbWUucmVwbGFjZShpZU5TUHJlZml4LCAnJyk7XG4gICAgICAgIHJlcy5wdXNoKGF0dHIpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICBmdW5jdGlvbiBjaGVja0ZvckFsaWFzTW9kZWwgKGVsLCB2YWx1ZSkge1xuICAgIHZhciBfZWwgPSBlbDtcbiAgICB3aGlsZSAoX2VsKSB7XG4gICAgICBpZiAoX2VsLmZvciAmJiBfZWwuYWxpYXMgPT09IHZhbHVlKSB7XG4gICAgICAgIHdhcm4kMihcbiAgICAgICAgICBcIjxcIiArIChlbC50YWcpICsgXCIgdi1tb2RlbD1cXFwiXCIgKyB2YWx1ZSArIFwiXFxcIj46IFwiICtcbiAgICAgICAgICBcIllvdSBhcmUgYmluZGluZyB2LW1vZGVsIGRpcmVjdGx5IHRvIGEgdi1mb3IgaXRlcmF0aW9uIGFsaWFzLiBcIiArXG4gICAgICAgICAgXCJUaGlzIHdpbGwgbm90IGJlIGFibGUgdG8gbW9kaWZ5IHRoZSB2LWZvciBzb3VyY2UgYXJyYXkgYmVjYXVzZSBcIiArXG4gICAgICAgICAgXCJ3cml0aW5nIHRvIHRoZSBhbGlhcyBpcyBsaWtlIG1vZGlmeWluZyBhIGZ1bmN0aW9uIGxvY2FsIHZhcmlhYmxlLiBcIiArXG4gICAgICAgICAgXCJDb25zaWRlciB1c2luZyBhbiBhcnJheSBvZiBvYmplY3RzIGFuZCB1c2Ugdi1tb2RlbCBvbiBhbiBvYmplY3QgcHJvcGVydHkgaW5zdGVhZC5cIixcbiAgICAgICAgICBlbC5yYXdBdHRyc01hcFsndi1tb2RlbCddXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBfZWwgPSBfZWwucGFyZW50O1xuICAgIH1cbiAgfVxuXG4gIC8qICAqL1xuXG4gIGZ1bmN0aW9uIHByZVRyYW5zZm9ybU5vZGUgKGVsLCBvcHRpb25zKSB7XG4gICAgaWYgKGVsLnRhZyA9PT0gJ2lucHV0Jykge1xuICAgICAgdmFyIG1hcCA9IGVsLmF0dHJzTWFwO1xuICAgICAgaWYgKCFtYXBbJ3YtbW9kZWwnXSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgdmFyIHR5cGVCaW5kaW5nO1xuICAgICAgaWYgKG1hcFsnOnR5cGUnXSB8fCBtYXBbJ3YtYmluZDp0eXBlJ10pIHtcbiAgICAgICAgdHlwZUJpbmRpbmcgPSBnZXRCaW5kaW5nQXR0cihlbCwgJ3R5cGUnKTtcbiAgICAgIH1cbiAgICAgIGlmICghbWFwLnR5cGUgJiYgIXR5cGVCaW5kaW5nICYmIG1hcFsndi1iaW5kJ10pIHtcbiAgICAgICAgdHlwZUJpbmRpbmcgPSBcIihcIiArIChtYXBbJ3YtYmluZCddKSArIFwiKS50eXBlXCI7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlQmluZGluZykge1xuICAgICAgICB2YXIgaWZDb25kaXRpb24gPSBnZXRBbmRSZW1vdmVBdHRyKGVsLCAndi1pZicsIHRydWUpO1xuICAgICAgICB2YXIgaWZDb25kaXRpb25FeHRyYSA9IGlmQ29uZGl0aW9uID8gKFwiJiYoXCIgKyBpZkNvbmRpdGlvbiArIFwiKVwiKSA6IFwiXCI7XG4gICAgICAgIHZhciBoYXNFbHNlID0gZ2V0QW5kUmVtb3ZlQXR0cihlbCwgJ3YtZWxzZScsIHRydWUpICE9IG51bGw7XG4gICAgICAgIHZhciBlbHNlSWZDb25kaXRpb24gPSBnZXRBbmRSZW1vdmVBdHRyKGVsLCAndi1lbHNlLWlmJywgdHJ1ZSk7XG4gICAgICAgIC8vIDEuIGNoZWNrYm94XG4gICAgICAgIHZhciBicmFuY2gwID0gY2xvbmVBU1RFbGVtZW50KGVsKTtcbiAgICAgICAgLy8gcHJvY2VzcyBmb3Igb24gdGhlIG1haW4gbm9kZVxuICAgICAgICBwcm9jZXNzRm9yKGJyYW5jaDApO1xuICAgICAgICBhZGRSYXdBdHRyKGJyYW5jaDAsICd0eXBlJywgJ2NoZWNrYm94Jyk7XG4gICAgICAgIHByb2Nlc3NFbGVtZW50KGJyYW5jaDAsIG9wdGlvbnMpO1xuICAgICAgICBicmFuY2gwLnByb2Nlc3NlZCA9IHRydWU7IC8vIHByZXZlbnQgaXQgZnJvbSBkb3VibGUtcHJvY2Vzc2VkXG4gICAgICAgIGJyYW5jaDAuaWYgPSBcIihcIiArIHR5cGVCaW5kaW5nICsgXCIpPT09J2NoZWNrYm94J1wiICsgaWZDb25kaXRpb25FeHRyYTtcbiAgICAgICAgYWRkSWZDb25kaXRpb24oYnJhbmNoMCwge1xuICAgICAgICAgIGV4cDogYnJhbmNoMC5pZixcbiAgICAgICAgICBibG9jazogYnJhbmNoMFxuICAgICAgICB9KTtcbiAgICAgICAgLy8gMi4gYWRkIHJhZGlvIGVsc2UtaWYgY29uZGl0aW9uXG4gICAgICAgIHZhciBicmFuY2gxID0gY2xvbmVBU1RFbGVtZW50KGVsKTtcbiAgICAgICAgZ2V0QW5kUmVtb3ZlQXR0cihicmFuY2gxLCAndi1mb3InLCB0cnVlKTtcbiAgICAgICAgYWRkUmF3QXR0cihicmFuY2gxLCAndHlwZScsICdyYWRpbycpO1xuICAgICAgICBwcm9jZXNzRWxlbWVudChicmFuY2gxLCBvcHRpb25zKTtcbiAgICAgICAgYWRkSWZDb25kaXRpb24oYnJhbmNoMCwge1xuICAgICAgICAgIGV4cDogXCIoXCIgKyB0eXBlQmluZGluZyArIFwiKT09PSdyYWRpbydcIiArIGlmQ29uZGl0aW9uRXh0cmEsXG4gICAgICAgICAgYmxvY2s6IGJyYW5jaDFcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIDMuIG90aGVyXG4gICAgICAgIHZhciBicmFuY2gyID0gY2xvbmVBU1RFbGVtZW50KGVsKTtcbiAgICAgICAgZ2V0QW5kUmVtb3ZlQXR0cihicmFuY2gyLCAndi1mb3InLCB0cnVlKTtcbiAgICAgICAgYWRkUmF3QXR0cihicmFuY2gyLCAnOnR5cGUnLCB0eXBlQmluZGluZyk7XG4gICAgICAgIHByb2Nlc3NFbGVtZW50KGJyYW5jaDIsIG9wdGlvbnMpO1xuICAgICAgICBhZGRJZkNvbmRpdGlvbihicmFuY2gwLCB7XG4gICAgICAgICAgZXhwOiBpZkNvbmRpdGlvbixcbiAgICAgICAgICBibG9jazogYnJhbmNoMlxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoaGFzRWxzZSkge1xuICAgICAgICAgIGJyYW5jaDAuZWxzZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoZWxzZUlmQ29uZGl0aW9uKSB7XG4gICAgICAgICAgYnJhbmNoMC5lbHNlaWYgPSBlbHNlSWZDb25kaXRpb247XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYnJhbmNoMFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb25lQVNURWxlbWVudCAoZWwpIHtcbiAgICByZXR1cm4gY3JlYXRlQVNURWxlbWVudChlbC50YWcsIGVsLmF0dHJzTGlzdC5zbGljZSgpLCBlbC5wYXJlbnQpXG4gIH1cblxuICB2YXIgbW9kZWwkMSA9IHtcbiAgICBwcmVUcmFuc2Zvcm1Ob2RlOiBwcmVUcmFuc2Zvcm1Ob2RlXG4gIH07XG5cbiAgdmFyIG1vZHVsZXMkMSA9IFtcbiAgICBrbGFzcyQxLFxuICAgIHN0eWxlJDEsXG4gICAgbW9kZWwkMVxuICBdO1xuXG4gIC8qICAqL1xuXG4gIGZ1bmN0aW9uIHRleHQgKGVsLCBkaXIpIHtcbiAgICBpZiAoZGlyLnZhbHVlKSB7XG4gICAgICBhZGRQcm9wKGVsLCAndGV4dENvbnRlbnQnLCAoXCJfcyhcIiArIChkaXIudmFsdWUpICsgXCIpXCIpLCBkaXIpO1xuICAgIH1cbiAgfVxuXG4gIC8qICAqL1xuXG4gIGZ1bmN0aW9uIGh0bWwgKGVsLCBkaXIpIHtcbiAgICBpZiAoZGlyLnZhbHVlKSB7XG4gICAgICBhZGRQcm9wKGVsLCAnaW5uZXJIVE1MJywgKFwiX3MoXCIgKyAoZGlyLnZhbHVlKSArIFwiKVwiKSwgZGlyKTtcbiAgICB9XG4gIH1cblxuICB2YXIgZGlyZWN0aXZlcyQxID0ge1xuICAgIG1vZGVsOiBtb2RlbCxcbiAgICB0ZXh0OiB0ZXh0LFxuICAgIGh0bWw6IGh0bWxcbiAgfTtcblxuICAvKiAgKi9cblxuICB2YXIgYmFzZU9wdGlvbnMgPSB7XG4gICAgZXhwZWN0SFRNTDogdHJ1ZSxcbiAgICBtb2R1bGVzOiBtb2R1bGVzJDEsXG4gICAgZGlyZWN0aXZlczogZGlyZWN0aXZlcyQxLFxuICAgIGlzUHJlVGFnOiBpc1ByZVRhZyxcbiAgICBpc1VuYXJ5VGFnOiBpc1VuYXJ5VGFnLFxuICAgIG11c3RVc2VQcm9wOiBtdXN0VXNlUHJvcCxcbiAgICBjYW5CZUxlZnRPcGVuVGFnOiBjYW5CZUxlZnRPcGVuVGFnLFxuICAgIGlzUmVzZXJ2ZWRUYWc6IGlzUmVzZXJ2ZWRUYWcsXG4gICAgZ2V0VGFnTmFtZXNwYWNlOiBnZXRUYWdOYW1lc3BhY2UsXG4gICAgc3RhdGljS2V5czogZ2VuU3RhdGljS2V5cyhtb2R1bGVzJDEpXG4gIH07XG5cbiAgLyogICovXG5cbiAgdmFyIGlzU3RhdGljS2V5O1xuICB2YXIgaXNQbGF0Zm9ybVJlc2VydmVkVGFnO1xuXG4gIHZhciBnZW5TdGF0aWNLZXlzQ2FjaGVkID0gY2FjaGVkKGdlblN0YXRpY0tleXMkMSk7XG5cbiAgLyoqXG4gICAqIEdvYWwgb2YgdGhlIG9wdGltaXplcjogd2FsayB0aGUgZ2VuZXJhdGVkIHRlbXBsYXRlIEFTVCB0cmVlXG4gICAqIGFuZCBkZXRlY3Qgc3ViLXRyZWVzIHRoYXQgYXJlIHB1cmVseSBzdGF0aWMsIGkuZS4gcGFydHMgb2ZcbiAgICogdGhlIERPTSB0aGF0IG5ldmVyIG5lZWRzIHRvIGNoYW5nZS5cbiAgICpcbiAgICogT25jZSB3ZSBkZXRlY3QgdGhlc2Ugc3ViLXRyZWVzLCB3ZSBjYW46XG4gICAqXG4gICAqIDEuIEhvaXN0IHRoZW0gaW50byBjb25zdGFudHMsIHNvIHRoYXQgd2Ugbm8gbG9uZ2VyIG5lZWQgdG9cbiAgICogICAgY3JlYXRlIGZyZXNoIG5vZGVzIGZvciB0aGVtIG9uIGVhY2ggcmUtcmVuZGVyO1xuICAgKiAyLiBDb21wbGV0ZWx5IHNraXAgdGhlbSBpbiB0aGUgcGF0Y2hpbmcgcHJvY2Vzcy5cbiAgICovXG4gIGZ1bmN0aW9uIG9wdGltaXplIChyb290LCBvcHRpb25zKSB7XG4gICAgaWYgKCFyb290KSB7IHJldHVybiB9XG4gICAgaXNTdGF0aWNLZXkgPSBnZW5TdGF0aWNLZXlzQ2FjaGVkKG9wdGlvbnMuc3RhdGljS2V5cyB8fCAnJyk7XG4gICAgaXNQbGF0Zm9ybVJlc2VydmVkVGFnID0gb3B0aW9ucy5pc1Jlc2VydmVkVGFnIHx8IG5vO1xuICAgIC8vIGZpcnN0IHBhc3M6IG1hcmsgYWxsIG5vbi1zdGF0aWMgbm9kZXMuXG4gICAgbWFya1N0YXRpYyQxKHJvb3QpO1xuICAgIC8vIHNlY29uZCBwYXNzOiBtYXJrIHN0YXRpYyByb290cy5cbiAgICBtYXJrU3RhdGljUm9vdHMocm9vdCwgZmFsc2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuU3RhdGljS2V5cyQxIChrZXlzKSB7XG4gICAgcmV0dXJuIG1ha2VNYXAoXG4gICAgICAndHlwZSx0YWcsYXR0cnNMaXN0LGF0dHJzTWFwLHBsYWluLHBhcmVudCxjaGlsZHJlbixhdHRycyxzdGFydCxlbmQscmF3QXR0cnNNYXAnICtcbiAgICAgIChrZXlzID8gJywnICsga2V5cyA6ICcnKVxuICAgIClcbiAgfVxuXG4gIGZ1bmN0aW9uIG1hcmtTdGF0aWMkMSAobm9kZSkge1xuICAgIG5vZGUuc3RhdGljID0gaXNTdGF0aWMobm9kZSk7XG4gICAgaWYgKG5vZGUudHlwZSA9PT0gMSkge1xuICAgICAgLy8gZG8gbm90IG1ha2UgY29tcG9uZW50IHNsb3QgY29udGVudCBzdGF0aWMuIHRoaXMgYXZvaWRzXG4gICAgICAvLyAxLiBjb21wb25lbnRzIG5vdCBhYmxlIHRvIG11dGF0ZSBzbG90IG5vZGVzXG4gICAgICAvLyAyLiBzdGF0aWMgc2xvdCBjb250ZW50IGZhaWxzIGZvciBob3QtcmVsb2FkaW5nXG4gICAgICBpZiAoXG4gICAgICAgICFpc1BsYXRmb3JtUmVzZXJ2ZWRUYWcobm9kZS50YWcpICYmXG4gICAgICAgIG5vZGUudGFnICE9PSAnc2xvdCcgJiZcbiAgICAgICAgbm9kZS5hdHRyc01hcFsnaW5saW5lLXRlbXBsYXRlJ10gPT0gbnVsbFxuICAgICAgKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xuICAgICAgICBtYXJrU3RhdGljJDEoY2hpbGQpO1xuICAgICAgICBpZiAoIWNoaWxkLnN0YXRpYykge1xuICAgICAgICAgIG5vZGUuc3RhdGljID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChub2RlLmlmQ29uZGl0aW9ucykge1xuICAgICAgICBmb3IgKHZhciBpJDEgPSAxLCBsJDEgPSBub2RlLmlmQ29uZGl0aW9ucy5sZW5ndGg7IGkkMSA8IGwkMTsgaSQxKyspIHtcbiAgICAgICAgICB2YXIgYmxvY2sgPSBub2RlLmlmQ29uZGl0aW9uc1tpJDFdLmJsb2NrO1xuICAgICAgICAgIG1hcmtTdGF0aWMkMShibG9jayk7XG4gICAgICAgICAgaWYgKCFibG9jay5zdGF0aWMpIHtcbiAgICAgICAgICAgIG5vZGUuc3RhdGljID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbWFya1N0YXRpY1Jvb3RzIChub2RlLCBpc0luRm9yKSB7XG4gICAgaWYgKG5vZGUudHlwZSA9PT0gMSkge1xuICAgICAgaWYgKG5vZGUuc3RhdGljIHx8IG5vZGUub25jZSkge1xuICAgICAgICBub2RlLnN0YXRpY0luRm9yID0gaXNJbkZvcjtcbiAgICAgIH1cbiAgICAgIC8vIEZvciBhIG5vZGUgdG8gcXVhbGlmeSBhcyBhIHN0YXRpYyByb290LCBpdCBzaG91bGQgaGF2ZSBjaGlsZHJlbiB0aGF0XG4gICAgICAvLyBhcmUgbm90IGp1c3Qgc3RhdGljIHRleHQuIE90aGVyd2lzZSB0aGUgY29zdCBvZiBob2lzdGluZyBvdXQgd2lsbFxuICAgICAgLy8gb3V0d2VpZ2ggdGhlIGJlbmVmaXRzIGFuZCBpdCdzIGJldHRlciBvZmYgdG8ganVzdCBhbHdheXMgcmVuZGVyIGl0IGZyZXNoLlxuICAgICAgaWYgKG5vZGUuc3RhdGljICYmIG5vZGUuY2hpbGRyZW4ubGVuZ3RoICYmICEoXG4gICAgICAgIG5vZGUuY2hpbGRyZW4ubGVuZ3RoID09PSAxICYmXG4gICAgICAgIG5vZGUuY2hpbGRyZW5bMF0udHlwZSA9PT0gM1xuICAgICAgKSkge1xuICAgICAgICBub2RlLnN0YXRpY1Jvb3QgPSB0cnVlO1xuICAgICAgICByZXR1cm5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGUuc3RhdGljUm9vdCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIG1hcmtTdGF0aWNSb290cyhub2RlLmNoaWxkcmVuW2ldLCBpc0luRm9yIHx8ICEhbm9kZS5mb3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobm9kZS5pZkNvbmRpdGlvbnMpIHtcbiAgICAgICAgZm9yICh2YXIgaSQxID0gMSwgbCQxID0gbm9kZS5pZkNvbmRpdGlvbnMubGVuZ3RoOyBpJDEgPCBsJDE7IGkkMSsrKSB7XG4gICAgICAgICAgbWFya1N0YXRpY1Jvb3RzKG5vZGUuaWZDb25kaXRpb25zW2kkMV0uYmxvY2ssIGlzSW5Gb3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaXNTdGF0aWMgKG5vZGUpIHtcbiAgICBpZiAobm9kZS50eXBlID09PSAyKSB7IC8vIGV4cHJlc3Npb25cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBpZiAobm9kZS50eXBlID09PSAzKSB7IC8vIHRleHRcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIHJldHVybiAhIShub2RlLnByZSB8fCAoXG4gICAgICAhbm9kZS5oYXNCaW5kaW5ncyAmJiAvLyBubyBkeW5hbWljIGJpbmRpbmdzXG4gICAgICAhbm9kZS5pZiAmJiAhbm9kZS5mb3IgJiYgLy8gbm90IHYtaWYgb3Igdi1mb3Igb3Igdi1lbHNlXG4gICAgICAhaXNCdWlsdEluVGFnKG5vZGUudGFnKSAmJiAvLyBub3QgYSBidWlsdC1pblxuICAgICAgaXNQbGF0Zm9ybVJlc2VydmVkVGFnKG5vZGUudGFnKSAmJiAvLyBub3QgYSBjb21wb25lbnRcbiAgICAgICFpc0RpcmVjdENoaWxkT2ZUZW1wbGF0ZUZvcihub2RlKSAmJlxuICAgICAgT2JqZWN0LmtleXMobm9kZSkuZXZlcnkoaXNTdGF0aWNLZXkpXG4gICAgKSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRGlyZWN0Q2hpbGRPZlRlbXBsYXRlRm9yIChub2RlKSB7XG4gICAgd2hpbGUgKG5vZGUucGFyZW50KSB7XG4gICAgICBub2RlID0gbm9kZS5wYXJlbnQ7XG4gICAgICBpZiAobm9kZS50YWcgIT09ICd0ZW1wbGF0ZScpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICBpZiAobm9kZS5mb3IpIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvKiAgKi9cblxuICB2YXIgZm5FeHBSRSA9IC9eKFtcXHckX10rfFxcKFteKV0qP1xcKSlcXHMqPT58XmZ1bmN0aW9uKD86XFxzK1tcXHckXSspP1xccypcXCgvO1xuICB2YXIgZm5JbnZva2VSRSA9IC9cXChbXildKj9cXCk7KiQvO1xuICB2YXIgc2ltcGxlUGF0aFJFID0gL15bQS1aYS16XyRdW1xcdyRdKig/OlxcLltBLVphLXpfJF1bXFx3JF0qfFxcWydbXiddKj8nXXxcXFtcIlteXCJdKj9cIl18XFxbXFxkK118XFxbW0EtWmEtel8kXVtcXHckXSpdKSokLztcblxuICAvLyBLZXlib2FyZEV2ZW50LmtleUNvZGUgYWxpYXNlc1xuICB2YXIga2V5Q29kZXMgPSB7XG4gICAgZXNjOiAyNyxcbiAgICB0YWI6IDksXG4gICAgZW50ZXI6IDEzLFxuICAgIHNwYWNlOiAzMixcbiAgICB1cDogMzgsXG4gICAgbGVmdDogMzcsXG4gICAgcmlnaHQ6IDM5LFxuICAgIGRvd246IDQwLFxuICAgICdkZWxldGUnOiBbOCwgNDZdXG4gIH07XG5cbiAgLy8gS2V5Ym9hcmRFdmVudC5rZXkgYWxpYXNlc1xuICB2YXIga2V5TmFtZXMgPSB7XG4gICAgLy8gIzc4ODA6IElFMTEgYW5kIEVkZ2UgdXNlIGBFc2NgIGZvciBFc2NhcGUga2V5IG5hbWUuXG4gICAgZXNjOiBbJ0VzYycsICdFc2NhcGUnXSxcbiAgICB0YWI6ICdUYWInLFxuICAgIGVudGVyOiAnRW50ZXInLFxuICAgIC8vICM5MTEyOiBJRTExIHVzZXMgYFNwYWNlYmFyYCBmb3IgU3BhY2Uga2V5IG5hbWUuXG4gICAgc3BhY2U6IFsnICcsICdTcGFjZWJhciddLFxuICAgIC8vICM3ODA2OiBJRTExIHVzZXMga2V5IG5hbWVzIHdpdGhvdXQgYEFycm93YCBwcmVmaXggZm9yIGFycm93IGtleXMuXG4gICAgdXA6IFsnVXAnLCAnQXJyb3dVcCddLFxuICAgIGxlZnQ6IFsnTGVmdCcsICdBcnJvd0xlZnQnXSxcbiAgICByaWdodDogWydSaWdodCcsICdBcnJvd1JpZ2h0J10sXG4gICAgZG93bjogWydEb3duJywgJ0Fycm93RG93biddLFxuICAgIC8vICM5MTEyOiBJRTExIHVzZXMgYERlbGAgZm9yIERlbGV0ZSBrZXkgbmFtZS5cbiAgICAnZGVsZXRlJzogWydCYWNrc3BhY2UnLCAnRGVsZXRlJywgJ0RlbCddXG4gIH07XG5cbiAgLy8gIzQ4Njg6IG1vZGlmaWVycyB0aGF0IHByZXZlbnQgdGhlIGV4ZWN1dGlvbiBvZiB0aGUgbGlzdGVuZXJcbiAgLy8gbmVlZCB0byBleHBsaWNpdGx5IHJldHVybiBudWxsIHNvIHRoYXQgd2UgY2FuIGRldGVybWluZSB3aGV0aGVyIHRvIHJlbW92ZVxuICAvLyB0aGUgbGlzdGVuZXIgZm9yIC5vbmNlXG4gIHZhciBnZW5HdWFyZCA9IGZ1bmN0aW9uIChjb25kaXRpb24pIHsgcmV0dXJuIChcImlmKFwiICsgY29uZGl0aW9uICsgXCIpcmV0dXJuIG51bGw7XCIpOyB9O1xuXG4gIHZhciBtb2RpZmllckNvZGUgPSB7XG4gICAgc3RvcDogJyRldmVudC5zdG9wUHJvcGFnYXRpb24oKTsnLFxuICAgIHByZXZlbnQ6ICckZXZlbnQucHJldmVudERlZmF1bHQoKTsnLFxuICAgIHNlbGY6IGdlbkd1YXJkKFwiJGV2ZW50LnRhcmdldCAhPT0gJGV2ZW50LmN1cnJlbnRUYXJnZXRcIiksXG4gICAgY3RybDogZ2VuR3VhcmQoXCIhJGV2ZW50LmN0cmxLZXlcIiksXG4gICAgc2hpZnQ6IGdlbkd1YXJkKFwiISRldmVudC5zaGlmdEtleVwiKSxcbiAgICBhbHQ6IGdlbkd1YXJkKFwiISRldmVudC5hbHRLZXlcIiksXG4gICAgbWV0YTogZ2VuR3VhcmQoXCIhJGV2ZW50Lm1ldGFLZXlcIiksXG4gICAgbGVmdDogZ2VuR3VhcmQoXCInYnV0dG9uJyBpbiAkZXZlbnQgJiYgJGV2ZW50LmJ1dHRvbiAhPT0gMFwiKSxcbiAgICBtaWRkbGU6IGdlbkd1YXJkKFwiJ2J1dHRvbicgaW4gJGV2ZW50ICYmICRldmVudC5idXR0b24gIT09IDFcIiksXG4gICAgcmlnaHQ6IGdlbkd1YXJkKFwiJ2J1dHRvbicgaW4gJGV2ZW50ICYmICRldmVudC5idXR0b24gIT09IDJcIilcbiAgfTtcblxuICBmdW5jdGlvbiBnZW5IYW5kbGVycyAoXG4gICAgZXZlbnRzLFxuICAgIGlzTmF0aXZlXG4gICkge1xuICAgIHZhciBwcmVmaXggPSBpc05hdGl2ZSA/ICduYXRpdmVPbjonIDogJ29uOic7XG4gICAgdmFyIHN0YXRpY0hhbmRsZXJzID0gXCJcIjtcbiAgICB2YXIgZHluYW1pY0hhbmRsZXJzID0gXCJcIjtcbiAgICBmb3IgKHZhciBuYW1lIGluIGV2ZW50cykge1xuICAgICAgdmFyIGhhbmRsZXJDb2RlID0gZ2VuSGFuZGxlcihldmVudHNbbmFtZV0pO1xuICAgICAgaWYgKGV2ZW50c1tuYW1lXSAmJiBldmVudHNbbmFtZV0uZHluYW1pYykge1xuICAgICAgICBkeW5hbWljSGFuZGxlcnMgKz0gbmFtZSArIFwiLFwiICsgaGFuZGxlckNvZGUgKyBcIixcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXRpY0hhbmRsZXJzICs9IFwiXFxcIlwiICsgbmFtZSArIFwiXFxcIjpcIiArIGhhbmRsZXJDb2RlICsgXCIsXCI7XG4gICAgICB9XG4gICAgfVxuICAgIHN0YXRpY0hhbmRsZXJzID0gXCJ7XCIgKyAoc3RhdGljSGFuZGxlcnMuc2xpY2UoMCwgLTEpKSArIFwifVwiO1xuICAgIGlmIChkeW5hbWljSGFuZGxlcnMpIHtcbiAgICAgIHJldHVybiBwcmVmaXggKyBcIl9kKFwiICsgc3RhdGljSGFuZGxlcnMgKyBcIixbXCIgKyAoZHluYW1pY0hhbmRsZXJzLnNsaWNlKDAsIC0xKSkgKyBcIl0pXCJcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHByZWZpeCArIHN0YXRpY0hhbmRsZXJzXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2VuSGFuZGxlciAoaGFuZGxlcikge1xuICAgIGlmICghaGFuZGxlcikge1xuICAgICAgcmV0dXJuICdmdW5jdGlvbigpe30nXG4gICAgfVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoaGFuZGxlcikpIHtcbiAgICAgIHJldHVybiAoXCJbXCIgKyAoaGFuZGxlci5tYXAoZnVuY3Rpb24gKGhhbmRsZXIpIHsgcmV0dXJuIGdlbkhhbmRsZXIoaGFuZGxlcik7IH0pLmpvaW4oJywnKSkgKyBcIl1cIilcbiAgICB9XG5cbiAgICB2YXIgaXNNZXRob2RQYXRoID0gc2ltcGxlUGF0aFJFLnRlc3QoaGFuZGxlci52YWx1ZSk7XG4gICAgdmFyIGlzRnVuY3Rpb25FeHByZXNzaW9uID0gZm5FeHBSRS50ZXN0KGhhbmRsZXIudmFsdWUpO1xuICAgIHZhciBpc0Z1bmN0aW9uSW52b2NhdGlvbiA9IHNpbXBsZVBhdGhSRS50ZXN0KGhhbmRsZXIudmFsdWUucmVwbGFjZShmbkludm9rZVJFLCAnJykpO1xuXG4gICAgaWYgKCFoYW5kbGVyLm1vZGlmaWVycykge1xuICAgICAgaWYgKGlzTWV0aG9kUGF0aCB8fCBpc0Z1bmN0aW9uRXhwcmVzc2lvbikge1xuICAgICAgICByZXR1cm4gaGFuZGxlci52YWx1ZVxuICAgICAgfVxuICAgICAgcmV0dXJuIChcImZ1bmN0aW9uKCRldmVudCl7XCIgKyAoaXNGdW5jdGlvbkludm9jYXRpb24gPyAoXCJyZXR1cm4gXCIgKyAoaGFuZGxlci52YWx1ZSkpIDogaGFuZGxlci52YWx1ZSkgKyBcIn1cIikgLy8gaW5saW5lIHN0YXRlbWVudFxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgY29kZSA9ICcnO1xuICAgICAgdmFyIGdlbk1vZGlmaWVyQ29kZSA9ICcnO1xuICAgICAgdmFyIGtleXMgPSBbXTtcbiAgICAgIGZvciAodmFyIGtleSBpbiBoYW5kbGVyLm1vZGlmaWVycykge1xuICAgICAgICBpZiAobW9kaWZpZXJDb2RlW2tleV0pIHtcbiAgICAgICAgICBnZW5Nb2RpZmllckNvZGUgKz0gbW9kaWZpZXJDb2RlW2tleV07XG4gICAgICAgICAgLy8gbGVmdC9yaWdodFxuICAgICAgICAgIGlmIChrZXlDb2Rlc1trZXldKSB7XG4gICAgICAgICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnZXhhY3QnKSB7XG4gICAgICAgICAgdmFyIG1vZGlmaWVycyA9IChoYW5kbGVyLm1vZGlmaWVycyk7XG4gICAgICAgICAgZ2VuTW9kaWZpZXJDb2RlICs9IGdlbkd1YXJkKFxuICAgICAgICAgICAgWydjdHJsJywgJ3NoaWZ0JywgJ2FsdCcsICdtZXRhJ11cbiAgICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbiAoa2V5TW9kaWZpZXIpIHsgcmV0dXJuICFtb2RpZmllcnNba2V5TW9kaWZpZXJdOyB9KVxuICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uIChrZXlNb2RpZmllcikgeyByZXR1cm4gKFwiJGV2ZW50LlwiICsga2V5TW9kaWZpZXIgKyBcIktleVwiKTsgfSlcbiAgICAgICAgICAgICAgLmpvaW4oJ3x8JylcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGtleXMucHVzaChrZXkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgY29kZSArPSBnZW5LZXlGaWx0ZXIoa2V5cyk7XG4gICAgICB9XG4gICAgICAvLyBNYWtlIHN1cmUgbW9kaWZpZXJzIGxpa2UgcHJldmVudCBhbmQgc3RvcCBnZXQgZXhlY3V0ZWQgYWZ0ZXIga2V5IGZpbHRlcmluZ1xuICAgICAgaWYgKGdlbk1vZGlmaWVyQ29kZSkge1xuICAgICAgICBjb2RlICs9IGdlbk1vZGlmaWVyQ29kZTtcbiAgICAgIH1cbiAgICAgIHZhciBoYW5kbGVyQ29kZSA9IGlzTWV0aG9kUGF0aFxuICAgICAgICA/IChcInJldHVybiBcIiArIChoYW5kbGVyLnZhbHVlKSArIFwiLmFwcGx5KG51bGwsIGFyZ3VtZW50cylcIilcbiAgICAgICAgOiBpc0Z1bmN0aW9uRXhwcmVzc2lvblxuICAgICAgICAgID8gKFwicmV0dXJuIChcIiArIChoYW5kbGVyLnZhbHVlKSArIFwiKS5hcHBseShudWxsLCBhcmd1bWVudHMpXCIpXG4gICAgICAgICAgOiBpc0Z1bmN0aW9uSW52b2NhdGlvblxuICAgICAgICAgICAgPyAoXCJyZXR1cm4gXCIgKyAoaGFuZGxlci52YWx1ZSkpXG4gICAgICAgICAgICA6IGhhbmRsZXIudmFsdWU7XG4gICAgICByZXR1cm4gKFwiZnVuY3Rpb24oJGV2ZW50KXtcIiArIGNvZGUgKyBoYW5kbGVyQ29kZSArIFwifVwiKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbktleUZpbHRlciAoa2V5cykge1xuICAgIHJldHVybiAoXG4gICAgICAvLyBtYWtlIHN1cmUgdGhlIGtleSBmaWx0ZXJzIG9ubHkgYXBwbHkgdG8gS2V5Ym9hcmRFdmVudHNcbiAgICAgIC8vICM5NDQxOiBjYW4ndCB1c2UgJ2tleUNvZGUnIGluICRldmVudCBiZWNhdXNlIENocm9tZSBhdXRvZmlsbCBmaXJlcyBmYWtlXG4gICAgICAvLyBrZXkgZXZlbnRzIHRoYXQgZG8gbm90IGhhdmUga2V5Q29kZSBwcm9wZXJ0eS4uLlxuICAgICAgXCJpZighJGV2ZW50LnR5cGUuaW5kZXhPZigna2V5JykmJlwiICtcbiAgICAgIChrZXlzLm1hcChnZW5GaWx0ZXJDb2RlKS5qb2luKCcmJicpKSArIFwiKXJldHVybiBudWxsO1wiXG4gICAgKVxuICB9XG5cbiAgZnVuY3Rpb24gZ2VuRmlsdGVyQ29kZSAoa2V5KSB7XG4gICAgdmFyIGtleVZhbCA9IHBhcnNlSW50KGtleSwgMTApO1xuICAgIGlmIChrZXlWYWwpIHtcbiAgICAgIHJldHVybiAoXCIkZXZlbnQua2V5Q29kZSE9PVwiICsga2V5VmFsKVxuICAgIH1cbiAgICB2YXIga2V5Q29kZSA9IGtleUNvZGVzW2tleV07XG4gICAgdmFyIGtleU5hbWUgPSBrZXlOYW1lc1trZXldO1xuICAgIHJldHVybiAoXG4gICAgICBcIl9rKCRldmVudC5rZXlDb2RlLFwiICtcbiAgICAgIChKU09OLnN0cmluZ2lmeShrZXkpKSArIFwiLFwiICtcbiAgICAgIChKU09OLnN0cmluZ2lmeShrZXlDb2RlKSkgKyBcIixcIiArXG4gICAgICBcIiRldmVudC5rZXksXCIgK1xuICAgICAgXCJcIiArIChKU09OLnN0cmluZ2lmeShrZXlOYW1lKSkgK1xuICAgICAgXCIpXCJcbiAgICApXG4gIH1cblxuICAvKiAgKi9cblxuICBmdW5jdGlvbiBvbiAoZWwsIGRpcikge1xuICAgIGlmIChkaXIubW9kaWZpZXJzKSB7XG4gICAgICB3YXJuKFwidi1vbiB3aXRob3V0IGFyZ3VtZW50IGRvZXMgbm90IHN1cHBvcnQgbW9kaWZpZXJzLlwiKTtcbiAgICB9XG4gICAgZWwud3JhcExpc3RlbmVycyA9IGZ1bmN0aW9uIChjb2RlKSB7IHJldHVybiAoXCJfZyhcIiArIGNvZGUgKyBcIixcIiArIChkaXIudmFsdWUpICsgXCIpXCIpOyB9O1xuICB9XG5cbiAgLyogICovXG5cbiAgZnVuY3Rpb24gYmluZCQxIChlbCwgZGlyKSB7XG4gICAgZWwud3JhcERhdGEgPSBmdW5jdGlvbiAoY29kZSkge1xuICAgICAgcmV0dXJuIChcIl9iKFwiICsgY29kZSArIFwiLCdcIiArIChlbC50YWcpICsgXCInLFwiICsgKGRpci52YWx1ZSkgKyBcIixcIiArIChkaXIubW9kaWZpZXJzICYmIGRpci5tb2RpZmllcnMucHJvcCA/ICd0cnVlJyA6ICdmYWxzZScpICsgKGRpci5tb2RpZmllcnMgJiYgZGlyLm1vZGlmaWVycy5zeW5jID8gJyx0cnVlJyA6ICcnKSArIFwiKVwiKVxuICAgIH07XG4gIH1cblxuICAvKiAgKi9cblxuICB2YXIgYmFzZURpcmVjdGl2ZXMgPSB7XG4gICAgb246IG9uLFxuICAgIGJpbmQ6IGJpbmQkMSxcbiAgICBjbG9hazogbm9vcFxuICB9O1xuXG4gIC8qICAqL1xuXG5cblxuXG5cbiAgdmFyIENvZGVnZW5TdGF0ZSA9IGZ1bmN0aW9uIENvZGVnZW5TdGF0ZSAob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy53YXJuID0gb3B0aW9ucy53YXJuIHx8IGJhc2VXYXJuO1xuICAgIHRoaXMudHJhbnNmb3JtcyA9IHBsdWNrTW9kdWxlRnVuY3Rpb24ob3B0aW9ucy5tb2R1bGVzLCAndHJhbnNmb3JtQ29kZScpO1xuICAgIHRoaXMuZGF0YUdlbkZucyA9IHBsdWNrTW9kdWxlRnVuY3Rpb24ob3B0aW9ucy5tb2R1bGVzLCAnZ2VuRGF0YScpO1xuICAgIHRoaXMuZGlyZWN0aXZlcyA9IGV4dGVuZChleHRlbmQoe30sIGJhc2VEaXJlY3RpdmVzKSwgb3B0aW9ucy5kaXJlY3RpdmVzKTtcbiAgICB2YXIgaXNSZXNlcnZlZFRhZyA9IG9wdGlvbnMuaXNSZXNlcnZlZFRhZyB8fCBubztcbiAgICB0aGlzLm1heWJlQ29tcG9uZW50ID0gZnVuY3Rpb24gKGVsKSB7IHJldHVybiAhIWVsLmNvbXBvbmVudCB8fCAhaXNSZXNlcnZlZFRhZyhlbC50YWcpOyB9O1xuICAgIHRoaXMub25jZUlkID0gMDtcbiAgICB0aGlzLnN0YXRpY1JlbmRlckZucyA9IFtdO1xuICAgIHRoaXMucHJlID0gZmFsc2U7XG4gIH07XG5cblxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlIChcbiAgICBhc3QsXG4gICAgb3B0aW9uc1xuICApIHtcbiAgICB2YXIgc3RhdGUgPSBuZXcgQ29kZWdlblN0YXRlKG9wdGlvbnMpO1xuICAgIC8vIGZpeCAjMTE0ODMsIFJvb3QgbGV2ZWwgPHNjcmlwdD4gdGFncyBzaG91bGQgbm90IGJlIHJlbmRlcmVkLlxuICAgIHZhciBjb2RlID0gYXN0ID8gKGFzdC50YWcgPT09ICdzY3JpcHQnID8gJ251bGwnIDogZ2VuRWxlbWVudChhc3QsIHN0YXRlKSkgOiAnX2MoXCJkaXZcIiknO1xuICAgIHJldHVybiB7XG4gICAgICByZW5kZXI6IChcIndpdGgodGhpcyl7cmV0dXJuIFwiICsgY29kZSArIFwifVwiKSxcbiAgICAgIHN0YXRpY1JlbmRlckZuczogc3RhdGUuc3RhdGljUmVuZGVyRm5zXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2VuRWxlbWVudCAoZWwsIHN0YXRlKSB7XG4gICAgaWYgKGVsLnBhcmVudCkge1xuICAgICAgZWwucHJlID0gZWwucHJlIHx8IGVsLnBhcmVudC5wcmU7XG4gICAgfVxuXG4gICAgaWYgKGVsLnN0YXRpY1Jvb3QgJiYgIWVsLnN0YXRpY1Byb2Nlc3NlZCkge1xuICAgICAgcmV0dXJuIGdlblN0YXRpYyhlbCwgc3RhdGUpXG4gICAgfSBlbHNlIGlmIChlbC5vbmNlICYmICFlbC5vbmNlUHJvY2Vzc2VkKSB7XG4gICAgICByZXR1cm4gZ2VuT25jZShlbCwgc3RhdGUpXG4gICAgfSBlbHNlIGlmIChlbC5mb3IgJiYgIWVsLmZvclByb2Nlc3NlZCkge1xuICAgICAgcmV0dXJuIGdlbkZvcihlbCwgc3RhdGUpXG4gICAgfSBlbHNlIGlmIChlbC5pZiAmJiAhZWwuaWZQcm9jZXNzZWQpIHtcbiAgICAgIHJldHVybiBnZW5JZihlbCwgc3RhdGUpXG4gICAgfSBlbHNlIGlmIChlbC50YWcgPT09ICd0ZW1wbGF0ZScgJiYgIWVsLnNsb3RUYXJnZXQgJiYgIXN0YXRlLnByZSkge1xuICAgICAgcmV0dXJuIGdlbkNoaWxkcmVuKGVsLCBzdGF0ZSkgfHwgJ3ZvaWQgMCdcbiAgICB9IGVsc2UgaWYgKGVsLnRhZyA9PT0gJ3Nsb3QnKSB7XG4gICAgICByZXR1cm4gZ2VuU2xvdChlbCwgc3RhdGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGNvbXBvbmVudCBvciBlbGVtZW50XG4gICAgICB2YXIgY29kZTtcbiAgICAgIGlmIChlbC5jb21wb25lbnQpIHtcbiAgICAgICAgY29kZSA9IGdlbkNvbXBvbmVudChlbC5jb21wb25lbnQsIGVsLCBzdGF0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgZGF0YTtcbiAgICAgICAgaWYgKCFlbC5wbGFpbiB8fCAoZWwucHJlICYmIHN0YXRlLm1heWJlQ29tcG9uZW50KGVsKSkpIHtcbiAgICAgICAgICBkYXRhID0gZ2VuRGF0YSQyKGVsLCBzdGF0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY2hpbGRyZW4gPSBlbC5pbmxpbmVUZW1wbGF0ZSA/IG51bGwgOiBnZW5DaGlsZHJlbihlbCwgc3RhdGUsIHRydWUpO1xuICAgICAgICBjb2RlID0gXCJfYygnXCIgKyAoZWwudGFnKSArIFwiJ1wiICsgKGRhdGEgPyAoXCIsXCIgKyBkYXRhKSA6ICcnKSArIChjaGlsZHJlbiA/IChcIixcIiArIGNoaWxkcmVuKSA6ICcnKSArIFwiKVwiO1xuICAgICAgfVxuICAgICAgLy8gbW9kdWxlIHRyYW5zZm9ybXNcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhdGUudHJhbnNmb3Jtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb2RlID0gc3RhdGUudHJhbnNmb3Jtc1tpXShlbCwgY29kZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29kZVxuICAgIH1cbiAgfVxuXG4gIC8vIGhvaXN0IHN0YXRpYyBzdWItdHJlZXMgb3V0XG4gIGZ1bmN0aW9uIGdlblN0YXRpYyAoZWwsIHN0YXRlKSB7XG4gICAgZWwuc3RhdGljUHJvY2Vzc2VkID0gdHJ1ZTtcbiAgICAvLyBTb21lIGVsZW1lbnRzICh0ZW1wbGF0ZXMpIG5lZWQgdG8gYmVoYXZlIGRpZmZlcmVudGx5IGluc2lkZSBvZiBhIHYtcHJlXG4gICAgLy8gbm9kZS4gIEFsbCBwcmUgbm9kZXMgYXJlIHN0YXRpYyByb290cywgc28gd2UgY2FuIHVzZSB0aGlzIGFzIGEgbG9jYXRpb24gdG9cbiAgICAvLyB3cmFwIGEgc3RhdGUgY2hhbmdlIGFuZCByZXNldCBpdCB1cG9uIGV4aXRpbmcgdGhlIHByZSBub2RlLlxuICAgIHZhciBvcmlnaW5hbFByZVN0YXRlID0gc3RhdGUucHJlO1xuICAgIGlmIChlbC5wcmUpIHtcbiAgICAgIHN0YXRlLnByZSA9IGVsLnByZTtcbiAgICB9XG4gICAgc3RhdGUuc3RhdGljUmVuZGVyRm5zLnB1c2goKFwid2l0aCh0aGlzKXtyZXR1cm4gXCIgKyAoZ2VuRWxlbWVudChlbCwgc3RhdGUpKSArIFwifVwiKSk7XG4gICAgc3RhdGUucHJlID0gb3JpZ2luYWxQcmVTdGF0ZTtcbiAgICByZXR1cm4gKFwiX20oXCIgKyAoc3RhdGUuc3RhdGljUmVuZGVyRm5zLmxlbmd0aCAtIDEpICsgKGVsLnN0YXRpY0luRm9yID8gJyx0cnVlJyA6ICcnKSArIFwiKVwiKVxuICB9XG5cbiAgLy8gdi1vbmNlXG4gIGZ1bmN0aW9uIGdlbk9uY2UgKGVsLCBzdGF0ZSkge1xuICAgIGVsLm9uY2VQcm9jZXNzZWQgPSB0cnVlO1xuICAgIGlmIChlbC5pZiAmJiAhZWwuaWZQcm9jZXNzZWQpIHtcbiAgICAgIHJldHVybiBnZW5JZihlbCwgc3RhdGUpXG4gICAgfSBlbHNlIGlmIChlbC5zdGF0aWNJbkZvcikge1xuICAgICAgdmFyIGtleSA9ICcnO1xuICAgICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudDtcbiAgICAgIHdoaWxlIChwYXJlbnQpIHtcbiAgICAgICAgaWYgKHBhcmVudC5mb3IpIHtcbiAgICAgICAgICBrZXkgPSBwYXJlbnQua2V5O1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcbiAgICAgIH1cbiAgICAgIGlmICgha2V5KSB7XG4gICAgICAgIHN0YXRlLndhcm4oXG4gICAgICAgICAgXCJ2LW9uY2UgY2FuIG9ubHkgYmUgdXNlZCBpbnNpZGUgdi1mb3IgdGhhdCBpcyBrZXllZC4gXCIsXG4gICAgICAgICAgZWwucmF3QXR0cnNNYXBbJ3Ytb25jZSddXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBnZW5FbGVtZW50KGVsLCBzdGF0ZSlcbiAgICAgIH1cbiAgICAgIHJldHVybiAoXCJfbyhcIiArIChnZW5FbGVtZW50KGVsLCBzdGF0ZSkpICsgXCIsXCIgKyAoc3RhdGUub25jZUlkKyspICsgXCIsXCIgKyBrZXkgKyBcIilcIilcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGdlblN0YXRpYyhlbCwgc3RhdGUpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2VuSWYgKFxuICAgIGVsLFxuICAgIHN0YXRlLFxuICAgIGFsdEdlbixcbiAgICBhbHRFbXB0eVxuICApIHtcbiAgICBlbC5pZlByb2Nlc3NlZCA9IHRydWU7IC8vIGF2b2lkIHJlY3Vyc2lvblxuICAgIHJldHVybiBnZW5JZkNvbmRpdGlvbnMoZWwuaWZDb25kaXRpb25zLnNsaWNlKCksIHN0YXRlLCBhbHRHZW4sIGFsdEVtcHR5KVxuICB9XG5cbiAgZnVuY3Rpb24gZ2VuSWZDb25kaXRpb25zIChcbiAgICBjb25kaXRpb25zLFxuICAgIHN0YXRlLFxuICAgIGFsdEdlbixcbiAgICBhbHRFbXB0eVxuICApIHtcbiAgICBpZiAoIWNvbmRpdGlvbnMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gYWx0RW1wdHkgfHwgJ19lKCknXG4gICAgfVxuXG4gICAgdmFyIGNvbmRpdGlvbiA9IGNvbmRpdGlvbnMuc2hpZnQoKTtcbiAgICBpZiAoY29uZGl0aW9uLmV4cCkge1xuICAgICAgcmV0dXJuIChcIihcIiArIChjb25kaXRpb24uZXhwKSArIFwiKT9cIiArIChnZW5UZXJuYXJ5RXhwKGNvbmRpdGlvbi5ibG9jaykpICsgXCI6XCIgKyAoZ2VuSWZDb25kaXRpb25zKGNvbmRpdGlvbnMsIHN0YXRlLCBhbHRHZW4sIGFsdEVtcHR5KSkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAoXCJcIiArIChnZW5UZXJuYXJ5RXhwKGNvbmRpdGlvbi5ibG9jaykpKVxuICAgIH1cblxuICAgIC8vIHYtaWYgd2l0aCB2LW9uY2Ugc2hvdWxkIGdlbmVyYXRlIGNvZGUgbGlrZSAoYSk/X20oMCk6X20oMSlcbiAgICBmdW5jdGlvbiBnZW5UZXJuYXJ5RXhwIChlbCkge1xuICAgICAgcmV0dXJuIGFsdEdlblxuICAgICAgICA/IGFsdEdlbihlbCwgc3RhdGUpXG4gICAgICAgIDogZWwub25jZVxuICAgICAgICAgID8gZ2VuT25jZShlbCwgc3RhdGUpXG4gICAgICAgICAgOiBnZW5FbGVtZW50KGVsLCBzdGF0ZSlcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBnZW5Gb3IgKFxuICAgIGVsLFxuICAgIHN0YXRlLFxuICAgIGFsdEdlbixcbiAgICBhbHRIZWxwZXJcbiAgKSB7XG4gICAgdmFyIGV4cCA9IGVsLmZvcjtcbiAgICB2YXIgYWxpYXMgPSBlbC5hbGlhcztcbiAgICB2YXIgaXRlcmF0b3IxID0gZWwuaXRlcmF0b3IxID8gKFwiLFwiICsgKGVsLml0ZXJhdG9yMSkpIDogJyc7XG4gICAgdmFyIGl0ZXJhdG9yMiA9IGVsLml0ZXJhdG9yMiA/IChcIixcIiArIChlbC5pdGVyYXRvcjIpKSA6ICcnO1xuXG4gICAgaWYgKHN0YXRlLm1heWJlQ29tcG9uZW50KGVsKSAmJlxuICAgICAgZWwudGFnICE9PSAnc2xvdCcgJiZcbiAgICAgIGVsLnRhZyAhPT0gJ3RlbXBsYXRlJyAmJlxuICAgICAgIWVsLmtleVxuICAgICkge1xuICAgICAgc3RhdGUud2FybihcbiAgICAgICAgXCI8XCIgKyAoZWwudGFnKSArIFwiIHYtZm9yPVxcXCJcIiArIGFsaWFzICsgXCIgaW4gXCIgKyBleHAgKyBcIlxcXCI+OiBjb21wb25lbnQgbGlzdHMgcmVuZGVyZWQgd2l0aCBcIiArXG4gICAgICAgIFwidi1mb3Igc2hvdWxkIGhhdmUgZXhwbGljaXQga2V5cy4gXCIgK1xuICAgICAgICBcIlNlZSBodHRwczovL3Z1ZWpzLm9yZy9ndWlkZS9saXN0Lmh0bWwja2V5IGZvciBtb3JlIGluZm8uXCIsXG4gICAgICAgIGVsLnJhd0F0dHJzTWFwWyd2LWZvciddLFxuICAgICAgICB0cnVlIC8qIHRpcCAqL1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBlbC5mb3JQcm9jZXNzZWQgPSB0cnVlOyAvLyBhdm9pZCByZWN1cnNpb25cbiAgICByZXR1cm4gKGFsdEhlbHBlciB8fCAnX2wnKSArIFwiKChcIiArIGV4cCArIFwiKSxcIiArXG4gICAgICBcImZ1bmN0aW9uKFwiICsgYWxpYXMgKyBpdGVyYXRvcjEgKyBpdGVyYXRvcjIgKyBcIil7XCIgK1xuICAgICAgICBcInJldHVybiBcIiArICgoYWx0R2VuIHx8IGdlbkVsZW1lbnQpKGVsLCBzdGF0ZSkpICtcbiAgICAgICd9KSdcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbkRhdGEkMiAoZWwsIHN0YXRlKSB7XG4gICAgdmFyIGRhdGEgPSAneyc7XG5cbiAgICAvLyBkaXJlY3RpdmVzIGZpcnN0LlxuICAgIC8vIGRpcmVjdGl2ZXMgbWF5IG11dGF0ZSB0aGUgZWwncyBvdGhlciBwcm9wZXJ0aWVzIGJlZm9yZSB0aGV5IGFyZSBnZW5lcmF0ZWQuXG4gICAgdmFyIGRpcnMgPSBnZW5EaXJlY3RpdmVzKGVsLCBzdGF0ZSk7XG4gICAgaWYgKGRpcnMpIHsgZGF0YSArPSBkaXJzICsgJywnOyB9XG5cbiAgICAvLyBrZXlcbiAgICBpZiAoZWwua2V5KSB7XG4gICAgICBkYXRhICs9IFwia2V5OlwiICsgKGVsLmtleSkgKyBcIixcIjtcbiAgICB9XG4gICAgLy8gcmVmXG4gICAgaWYgKGVsLnJlZikge1xuICAgICAgZGF0YSArPSBcInJlZjpcIiArIChlbC5yZWYpICsgXCIsXCI7XG4gICAgfVxuICAgIGlmIChlbC5yZWZJbkZvcikge1xuICAgICAgZGF0YSArPSBcInJlZkluRm9yOnRydWUsXCI7XG4gICAgfVxuICAgIC8vIHByZVxuICAgIGlmIChlbC5wcmUpIHtcbiAgICAgIGRhdGEgKz0gXCJwcmU6dHJ1ZSxcIjtcbiAgICB9XG4gICAgLy8gcmVjb3JkIG9yaWdpbmFsIHRhZyBuYW1lIGZvciBjb21wb25lbnRzIHVzaW5nIFwiaXNcIiBhdHRyaWJ1dGVcbiAgICBpZiAoZWwuY29tcG9uZW50KSB7XG4gICAgICBkYXRhICs9IFwidGFnOlxcXCJcIiArIChlbC50YWcpICsgXCJcXFwiLFwiO1xuICAgIH1cbiAgICAvLyBtb2R1bGUgZGF0YSBnZW5lcmF0aW9uIGZ1bmN0aW9uc1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhdGUuZGF0YUdlbkZucy5sZW5ndGg7IGkrKykge1xuICAgICAgZGF0YSArPSBzdGF0ZS5kYXRhR2VuRm5zW2ldKGVsKTtcbiAgICB9XG4gICAgLy8gYXR0cmlidXRlc1xuICAgIGlmIChlbC5hdHRycykge1xuICAgICAgZGF0YSArPSBcImF0dHJzOlwiICsgKGdlblByb3BzKGVsLmF0dHJzKSkgKyBcIixcIjtcbiAgICB9XG4gICAgLy8gRE9NIHByb3BzXG4gICAgaWYgKGVsLnByb3BzKSB7XG4gICAgICBkYXRhICs9IFwiZG9tUHJvcHM6XCIgKyAoZ2VuUHJvcHMoZWwucHJvcHMpKSArIFwiLFwiO1xuICAgIH1cbiAgICAvLyBldmVudCBoYW5kbGVyc1xuICAgIGlmIChlbC5ldmVudHMpIHtcbiAgICAgIGRhdGEgKz0gKGdlbkhhbmRsZXJzKGVsLmV2ZW50cywgZmFsc2UpKSArIFwiLFwiO1xuICAgIH1cbiAgICBpZiAoZWwubmF0aXZlRXZlbnRzKSB7XG4gICAgICBkYXRhICs9IChnZW5IYW5kbGVycyhlbC5uYXRpdmVFdmVudHMsIHRydWUpKSArIFwiLFwiO1xuICAgIH1cbiAgICAvLyBzbG90IHRhcmdldFxuICAgIC8vIG9ubHkgZm9yIG5vbi1zY29wZWQgc2xvdHNcbiAgICBpZiAoZWwuc2xvdFRhcmdldCAmJiAhZWwuc2xvdFNjb3BlKSB7XG4gICAgICBkYXRhICs9IFwic2xvdDpcIiArIChlbC5zbG90VGFyZ2V0KSArIFwiLFwiO1xuICAgIH1cbiAgICAvLyBzY29wZWQgc2xvdHNcbiAgICBpZiAoZWwuc2NvcGVkU2xvdHMpIHtcbiAgICAgIGRhdGEgKz0gKGdlblNjb3BlZFNsb3RzKGVsLCBlbC5zY29wZWRTbG90cywgc3RhdGUpKSArIFwiLFwiO1xuICAgIH1cbiAgICAvLyBjb21wb25lbnQgdi1tb2RlbFxuICAgIGlmIChlbC5tb2RlbCkge1xuICAgICAgZGF0YSArPSBcIm1vZGVsOnt2YWx1ZTpcIiArIChlbC5tb2RlbC52YWx1ZSkgKyBcIixjYWxsYmFjazpcIiArIChlbC5tb2RlbC5jYWxsYmFjaykgKyBcIixleHByZXNzaW9uOlwiICsgKGVsLm1vZGVsLmV4cHJlc3Npb24pICsgXCJ9LFwiO1xuICAgIH1cbiAgICAvLyBpbmxpbmUtdGVtcGxhdGVcbiAgICBpZiAoZWwuaW5saW5lVGVtcGxhdGUpIHtcbiAgICAgIHZhciBpbmxpbmVUZW1wbGF0ZSA9IGdlbklubGluZVRlbXBsYXRlKGVsLCBzdGF0ZSk7XG4gICAgICBpZiAoaW5saW5lVGVtcGxhdGUpIHtcbiAgICAgICAgZGF0YSArPSBpbmxpbmVUZW1wbGF0ZSArIFwiLFwiO1xuICAgICAgfVxuICAgIH1cbiAgICBkYXRhID0gZGF0YS5yZXBsYWNlKC8sJC8sICcnKSArICd9JztcbiAgICAvLyB2LWJpbmQgZHluYW1pYyBhcmd1bWVudCB3cmFwXG4gICAgLy8gdi1iaW5kIHdpdGggZHluYW1pYyBhcmd1bWVudHMgbXVzdCBiZSBhcHBsaWVkIHVzaW5nIHRoZSBzYW1lIHYtYmluZCBvYmplY3RcbiAgICAvLyBtZXJnZSBoZWxwZXIgc28gdGhhdCBjbGFzcy9zdHlsZS9tdXN0VXNlUHJvcCBhdHRycyBhcmUgaGFuZGxlZCBjb3JyZWN0bHkuXG4gICAgaWYgKGVsLmR5bmFtaWNBdHRycykge1xuICAgICAgZGF0YSA9IFwiX2IoXCIgKyBkYXRhICsgXCIsXFxcIlwiICsgKGVsLnRhZykgKyBcIlxcXCIsXCIgKyAoZ2VuUHJvcHMoZWwuZHluYW1pY0F0dHJzKSkgKyBcIilcIjtcbiAgICB9XG4gICAgLy8gdi1iaW5kIGRhdGEgd3JhcFxuICAgIGlmIChlbC53cmFwRGF0YSkge1xuICAgICAgZGF0YSA9IGVsLndyYXBEYXRhKGRhdGEpO1xuICAgIH1cbiAgICAvLyB2LW9uIGRhdGEgd3JhcFxuICAgIGlmIChlbC53cmFwTGlzdGVuZXJzKSB7XG4gICAgICBkYXRhID0gZWwud3JhcExpc3RlbmVycyhkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGFcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbkRpcmVjdGl2ZXMgKGVsLCBzdGF0ZSkge1xuICAgIHZhciBkaXJzID0gZWwuZGlyZWN0aXZlcztcbiAgICBpZiAoIWRpcnMpIHsgcmV0dXJuIH1cbiAgICB2YXIgcmVzID0gJ2RpcmVjdGl2ZXM6Wyc7XG4gICAgdmFyIGhhc1J1bnRpbWUgPSBmYWxzZTtcbiAgICB2YXIgaSwgbCwgZGlyLCBuZWVkUnVudGltZTtcbiAgICBmb3IgKGkgPSAwLCBsID0gZGlycy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGRpciA9IGRpcnNbaV07XG4gICAgICBuZWVkUnVudGltZSA9IHRydWU7XG4gICAgICB2YXIgZ2VuID0gc3RhdGUuZGlyZWN0aXZlc1tkaXIubmFtZV07XG4gICAgICBpZiAoZ2VuKSB7XG4gICAgICAgIC8vIGNvbXBpbGUtdGltZSBkaXJlY3RpdmUgdGhhdCBtYW5pcHVsYXRlcyBBU1QuXG4gICAgICAgIC8vIHJldHVybnMgdHJ1ZSBpZiBpdCBhbHNvIG5lZWRzIGEgcnVudGltZSBjb3VudGVycGFydC5cbiAgICAgICAgbmVlZFJ1bnRpbWUgPSAhIWdlbihlbCwgZGlyLCBzdGF0ZS53YXJuKTtcbiAgICAgIH1cbiAgICAgIGlmIChuZWVkUnVudGltZSkge1xuICAgICAgICBoYXNSdW50aW1lID0gdHJ1ZTtcbiAgICAgICAgcmVzICs9IFwie25hbWU6XFxcIlwiICsgKGRpci5uYW1lKSArIFwiXFxcIixyYXdOYW1lOlxcXCJcIiArIChkaXIucmF3TmFtZSkgKyBcIlxcXCJcIiArIChkaXIudmFsdWUgPyAoXCIsdmFsdWU6KFwiICsgKGRpci52YWx1ZSkgKyBcIiksZXhwcmVzc2lvbjpcIiArIChKU09OLnN0cmluZ2lmeShkaXIudmFsdWUpKSkgOiAnJykgKyAoZGlyLmFyZyA/IChcIixhcmc6XCIgKyAoZGlyLmlzRHluYW1pY0FyZyA/IGRpci5hcmcgOiAoXCJcXFwiXCIgKyAoZGlyLmFyZykgKyBcIlxcXCJcIikpKSA6ICcnKSArIChkaXIubW9kaWZpZXJzID8gKFwiLG1vZGlmaWVyczpcIiArIChKU09OLnN0cmluZ2lmeShkaXIubW9kaWZpZXJzKSkpIDogJycpICsgXCJ9LFwiO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaGFzUnVudGltZSkge1xuICAgICAgcmV0dXJuIHJlcy5zbGljZSgwLCAtMSkgKyAnXSdcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBnZW5JbmxpbmVUZW1wbGF0ZSAoZWwsIHN0YXRlKSB7XG4gICAgdmFyIGFzdCA9IGVsLmNoaWxkcmVuWzBdO1xuICAgIGlmIChlbC5jaGlsZHJlbi5sZW5ndGggIT09IDEgfHwgYXN0LnR5cGUgIT09IDEpIHtcbiAgICAgIHN0YXRlLndhcm4oXG4gICAgICAgICdJbmxpbmUtdGVtcGxhdGUgY29tcG9uZW50cyBtdXN0IGhhdmUgZXhhY3RseSBvbmUgY2hpbGQgZWxlbWVudC4nLFxuICAgICAgICB7IHN0YXJ0OiBlbC5zdGFydCB9XG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoYXN0ICYmIGFzdC50eXBlID09PSAxKSB7XG4gICAgICB2YXIgaW5saW5lUmVuZGVyRm5zID0gZ2VuZXJhdGUoYXN0LCBzdGF0ZS5vcHRpb25zKTtcbiAgICAgIHJldHVybiAoXCJpbmxpbmVUZW1wbGF0ZTp7cmVuZGVyOmZ1bmN0aW9uKCl7XCIgKyAoaW5saW5lUmVuZGVyRm5zLnJlbmRlcikgKyBcIn0sc3RhdGljUmVuZGVyRm5zOltcIiArIChpbmxpbmVSZW5kZXJGbnMuc3RhdGljUmVuZGVyRm5zLm1hcChmdW5jdGlvbiAoY29kZSkgeyByZXR1cm4gKFwiZnVuY3Rpb24oKXtcIiArIGNvZGUgKyBcIn1cIik7IH0pLmpvaW4oJywnKSkgKyBcIl19XCIpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2VuU2NvcGVkU2xvdHMgKFxuICAgIGVsLFxuICAgIHNsb3RzLFxuICAgIHN0YXRlXG4gICkge1xuICAgIC8vIGJ5IGRlZmF1bHQgc2NvcGVkIHNsb3RzIGFyZSBjb25zaWRlcmVkIFwic3RhYmxlXCIsIHRoaXMgYWxsb3dzIGNoaWxkXG4gICAgLy8gY29tcG9uZW50cyB3aXRoIG9ubHkgc2NvcGVkIHNsb3RzIHRvIHNraXAgZm9yY2VkIHVwZGF0ZXMgZnJvbSBwYXJlbnQuXG4gICAgLy8gYnV0IGluIHNvbWUgY2FzZXMgd2UgaGF2ZSB0byBiYWlsLW91dCBvZiB0aGlzIG9wdGltaXphdGlvblxuICAgIC8vIGZvciBleGFtcGxlIGlmIHRoZSBzbG90IGNvbnRhaW5zIGR5bmFtaWMgbmFtZXMsIGhhcyB2LWlmIG9yIHYtZm9yIG9uIHRoZW0uLi5cbiAgICB2YXIgbmVlZHNGb3JjZVVwZGF0ZSA9IGVsLmZvciB8fCBPYmplY3Qua2V5cyhzbG90cykuc29tZShmdW5jdGlvbiAoa2V5KSB7XG4gICAgICB2YXIgc2xvdCA9IHNsb3RzW2tleV07XG4gICAgICByZXR1cm4gKFxuICAgICAgICBzbG90LnNsb3RUYXJnZXREeW5hbWljIHx8XG4gICAgICAgIHNsb3QuaWYgfHxcbiAgICAgICAgc2xvdC5mb3IgfHxcbiAgICAgICAgY29udGFpbnNTbG90Q2hpbGQoc2xvdCkgLy8gaXMgcGFzc2luZyBkb3duIHNsb3QgZnJvbSBwYXJlbnQgd2hpY2ggbWF5IGJlIGR5bmFtaWNcbiAgICAgIClcbiAgICB9KTtcblxuICAgIC8vICM5NTM0OiBpZiBhIGNvbXBvbmVudCB3aXRoIHNjb3BlZCBzbG90cyBpcyBpbnNpZGUgYSBjb25kaXRpb25hbCBicmFuY2gsXG4gICAgLy8gaXQncyBwb3NzaWJsZSBmb3IgdGhlIHNhbWUgY29tcG9uZW50IHRvIGJlIHJldXNlZCBidXQgd2l0aCBkaWZmZXJlbnRcbiAgICAvLyBjb21waWxlZCBzbG90IGNvbnRlbnQuIFRvIGF2b2lkIHRoYXQsIHdlIGdlbmVyYXRlIGEgdW5pcXVlIGtleSBiYXNlZCBvblxuICAgIC8vIHRoZSBnZW5lcmF0ZWQgY29kZSBvZiBhbGwgdGhlIHNsb3QgY29udGVudHMuXG4gICAgdmFyIG5lZWRzS2V5ID0gISFlbC5pZjtcblxuICAgIC8vIE9SIHdoZW4gaXQgaXMgaW5zaWRlIGFub3RoZXIgc2NvcGVkIHNsb3Qgb3Igdi1mb3IgKHRoZSByZWFjdGl2aXR5IG1heSBiZVxuICAgIC8vIGRpc2Nvbm5lY3RlZCBkdWUgdG8gdGhlIGludGVybWVkaWF0ZSBzY29wZSB2YXJpYWJsZSlcbiAgICAvLyAjOTQzOCwgIzk1MDZcbiAgICAvLyBUT0RPOiB0aGlzIGNhbiBiZSBmdXJ0aGVyIG9wdGltaXplZCBieSBwcm9wZXJseSBhbmFseXppbmcgaW4tc2NvcGUgYmluZGluZ3NcbiAgICAvLyBhbmQgc2tpcCBmb3JjZSB1cGRhdGluZyBvbmVzIHRoYXQgZG8gbm90IGFjdHVhbGx5IHVzZSBzY29wZSB2YXJpYWJsZXMuXG4gICAgaWYgKCFuZWVkc0ZvcmNlVXBkYXRlKSB7XG4gICAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50O1xuICAgICAgd2hpbGUgKHBhcmVudCkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgKHBhcmVudC5zbG90U2NvcGUgJiYgcGFyZW50LnNsb3RTY29wZSAhPT0gZW1wdHlTbG90U2NvcGVUb2tlbikgfHxcbiAgICAgICAgICBwYXJlbnQuZm9yXG4gICAgICAgICkge1xuICAgICAgICAgIG5lZWRzRm9yY2VVcGRhdGUgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcmVudC5pZikge1xuICAgICAgICAgIG5lZWRzS2V5ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBnZW5lcmF0ZWRTbG90cyA9IE9iamVjdC5rZXlzKHNsb3RzKVxuICAgICAgLm1hcChmdW5jdGlvbiAoa2V5KSB7IHJldHVybiBnZW5TY29wZWRTbG90KHNsb3RzW2tleV0sIHN0YXRlKTsgfSlcbiAgICAgIC5qb2luKCcsJyk7XG5cbiAgICByZXR1cm4gKFwic2NvcGVkU2xvdHM6X3UoW1wiICsgZ2VuZXJhdGVkU2xvdHMgKyBcIl1cIiArIChuZWVkc0ZvcmNlVXBkYXRlID8gXCIsbnVsbCx0cnVlXCIgOiBcIlwiKSArICghbmVlZHNGb3JjZVVwZGF0ZSAmJiBuZWVkc0tleSA/IChcIixudWxsLGZhbHNlLFwiICsgKGhhc2goZ2VuZXJhdGVkU2xvdHMpKSkgOiBcIlwiKSArIFwiKVwiKVxuICB9XG5cbiAgZnVuY3Rpb24gaGFzaChzdHIpIHtcbiAgICB2YXIgaGFzaCA9IDUzODE7XG4gICAgdmFyIGkgPSBzdHIubGVuZ3RoO1xuICAgIHdoaWxlKGkpIHtcbiAgICAgIGhhc2ggPSAoaGFzaCAqIDMzKSBeIHN0ci5jaGFyQ29kZUF0KC0taSk7XG4gICAgfVxuICAgIHJldHVybiBoYXNoID4+PiAwXG4gIH1cblxuICBmdW5jdGlvbiBjb250YWluc1Nsb3RDaGlsZCAoZWwpIHtcbiAgICBpZiAoZWwudHlwZSA9PT0gMSkge1xuICAgICAgaWYgKGVsLnRhZyA9PT0gJ3Nsb3QnKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICByZXR1cm4gZWwuY2hpbGRyZW4uc29tZShjb250YWluc1Nsb3RDaGlsZClcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBmdW5jdGlvbiBnZW5TY29wZWRTbG90IChcbiAgICBlbCxcbiAgICBzdGF0ZVxuICApIHtcbiAgICB2YXIgaXNMZWdhY3lTeW50YXggPSBlbC5hdHRyc01hcFsnc2xvdC1zY29wZSddO1xuICAgIGlmIChlbC5pZiAmJiAhZWwuaWZQcm9jZXNzZWQgJiYgIWlzTGVnYWN5U3ludGF4KSB7XG4gICAgICByZXR1cm4gZ2VuSWYoZWwsIHN0YXRlLCBnZW5TY29wZWRTbG90LCBcIm51bGxcIilcbiAgICB9XG4gICAgaWYgKGVsLmZvciAmJiAhZWwuZm9yUHJvY2Vzc2VkKSB7XG4gICAgICByZXR1cm4gZ2VuRm9yKGVsLCBzdGF0ZSwgZ2VuU2NvcGVkU2xvdClcbiAgICB9XG4gICAgdmFyIHNsb3RTY29wZSA9IGVsLnNsb3RTY29wZSA9PT0gZW1wdHlTbG90U2NvcGVUb2tlblxuICAgICAgPyBcIlwiXG4gICAgICA6IFN0cmluZyhlbC5zbG90U2NvcGUpO1xuICAgIHZhciBmbiA9IFwiZnVuY3Rpb24oXCIgKyBzbG90U2NvcGUgKyBcIil7XCIgK1xuICAgICAgXCJyZXR1cm4gXCIgKyAoZWwudGFnID09PSAndGVtcGxhdGUnXG4gICAgICAgID8gZWwuaWYgJiYgaXNMZWdhY3lTeW50YXhcbiAgICAgICAgICA/IChcIihcIiArIChlbC5pZikgKyBcIik/XCIgKyAoZ2VuQ2hpbGRyZW4oZWwsIHN0YXRlKSB8fCAndW5kZWZpbmVkJykgKyBcIjp1bmRlZmluZWRcIilcbiAgICAgICAgICA6IGdlbkNoaWxkcmVuKGVsLCBzdGF0ZSkgfHwgJ3VuZGVmaW5lZCdcbiAgICAgICAgOiBnZW5FbGVtZW50KGVsLCBzdGF0ZSkpICsgXCJ9XCI7XG4gICAgLy8gcmV2ZXJzZSBwcm94eSB2LXNsb3Qgd2l0aG91dCBzY29wZSBvbiB0aGlzLiRzbG90c1xuICAgIHZhciByZXZlcnNlUHJveHkgPSBzbG90U2NvcGUgPyBcIlwiIDogXCIscHJveHk6dHJ1ZVwiO1xuICAgIHJldHVybiAoXCJ7a2V5OlwiICsgKGVsLnNsb3RUYXJnZXQgfHwgXCJcXFwiZGVmYXVsdFxcXCJcIikgKyBcIixmbjpcIiArIGZuICsgcmV2ZXJzZVByb3h5ICsgXCJ9XCIpXG4gIH1cblxuICBmdW5jdGlvbiBnZW5DaGlsZHJlbiAoXG4gICAgZWwsXG4gICAgc3RhdGUsXG4gICAgY2hlY2tTa2lwLFxuICAgIGFsdEdlbkVsZW1lbnQsXG4gICAgYWx0R2VuTm9kZVxuICApIHtcbiAgICB2YXIgY2hpbGRyZW4gPSBlbC5jaGlsZHJlbjtcbiAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICB2YXIgZWwkMSA9IGNoaWxkcmVuWzBdO1xuICAgICAgLy8gb3B0aW1pemUgc2luZ2xlIHYtZm9yXG4gICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID09PSAxICYmXG4gICAgICAgIGVsJDEuZm9yICYmXG4gICAgICAgIGVsJDEudGFnICE9PSAndGVtcGxhdGUnICYmXG4gICAgICAgIGVsJDEudGFnICE9PSAnc2xvdCdcbiAgICAgICkge1xuICAgICAgICB2YXIgbm9ybWFsaXphdGlvblR5cGUgPSBjaGVja1NraXBcbiAgICAgICAgICA/IHN0YXRlLm1heWJlQ29tcG9uZW50KGVsJDEpID8gXCIsMVwiIDogXCIsMFwiXG4gICAgICAgICAgOiBcIlwiO1xuICAgICAgICByZXR1cm4gKFwiXCIgKyAoKGFsdEdlbkVsZW1lbnQgfHwgZ2VuRWxlbWVudCkoZWwkMSwgc3RhdGUpKSArIG5vcm1hbGl6YXRpb25UeXBlKVxuICAgICAgfVxuICAgICAgdmFyIG5vcm1hbGl6YXRpb25UeXBlJDEgPSBjaGVja1NraXBcbiAgICAgICAgPyBnZXROb3JtYWxpemF0aW9uVHlwZShjaGlsZHJlbiwgc3RhdGUubWF5YmVDb21wb25lbnQpXG4gICAgICAgIDogMDtcbiAgICAgIHZhciBnZW4gPSBhbHRHZW5Ob2RlIHx8IGdlbk5vZGU7XG4gICAgICByZXR1cm4gKFwiW1wiICsgKGNoaWxkcmVuLm1hcChmdW5jdGlvbiAoYykgeyByZXR1cm4gZ2VuKGMsIHN0YXRlKTsgfSkuam9pbignLCcpKSArIFwiXVwiICsgKG5vcm1hbGl6YXRpb25UeXBlJDEgPyAoXCIsXCIgKyBub3JtYWxpemF0aW9uVHlwZSQxKSA6ICcnKSlcbiAgICB9XG4gIH1cblxuICAvLyBkZXRlcm1pbmUgdGhlIG5vcm1hbGl6YXRpb24gbmVlZGVkIGZvciB0aGUgY2hpbGRyZW4gYXJyYXkuXG4gIC8vIDA6IG5vIG5vcm1hbGl6YXRpb24gbmVlZGVkXG4gIC8vIDE6IHNpbXBsZSBub3JtYWxpemF0aW9uIG5lZWRlZCAocG9zc2libGUgMS1sZXZlbCBkZWVwIG5lc3RlZCBhcnJheSlcbiAgLy8gMjogZnVsbCBub3JtYWxpemF0aW9uIG5lZWRlZFxuICBmdW5jdGlvbiBnZXROb3JtYWxpemF0aW9uVHlwZSAoXG4gICAgY2hpbGRyZW4sXG4gICAgbWF5YmVDb21wb25lbnRcbiAgKSB7XG4gICAgdmFyIHJlcyA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGVsID0gY2hpbGRyZW5baV07XG4gICAgICBpZiAoZWwudHlwZSAhPT0gMSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgaWYgKG5lZWRzTm9ybWFsaXphdGlvbihlbCkgfHxcbiAgICAgICAgICAoZWwuaWZDb25kaXRpb25zICYmIGVsLmlmQ29uZGl0aW9ucy5zb21lKGZ1bmN0aW9uIChjKSB7IHJldHVybiBuZWVkc05vcm1hbGl6YXRpb24oYy5ibG9jayk7IH0pKSkge1xuICAgICAgICByZXMgPSAyO1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgaWYgKG1heWJlQ29tcG9uZW50KGVsKSB8fFxuICAgICAgICAgIChlbC5pZkNvbmRpdGlvbnMgJiYgZWwuaWZDb25kaXRpb25zLnNvbWUoZnVuY3Rpb24gKGMpIHsgcmV0dXJuIG1heWJlQ29tcG9uZW50KGMuYmxvY2spOyB9KSkpIHtcbiAgICAgICAgcmVzID0gMTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgZnVuY3Rpb24gbmVlZHNOb3JtYWxpemF0aW9uIChlbCkge1xuICAgIHJldHVybiBlbC5mb3IgIT09IHVuZGVmaW5lZCB8fCBlbC50YWcgPT09ICd0ZW1wbGF0ZScgfHwgZWwudGFnID09PSAnc2xvdCdcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbk5vZGUgKG5vZGUsIHN0YXRlKSB7XG4gICAgaWYgKG5vZGUudHlwZSA9PT0gMSkge1xuICAgICAgcmV0dXJuIGdlbkVsZW1lbnQobm9kZSwgc3RhdGUpXG4gICAgfSBlbHNlIGlmIChub2RlLnR5cGUgPT09IDMgJiYgbm9kZS5pc0NvbW1lbnQpIHtcbiAgICAgIHJldHVybiBnZW5Db21tZW50KG5vZGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBnZW5UZXh0KG5vZGUpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2VuVGV4dCAodGV4dCkge1xuICAgIHJldHVybiAoXCJfdihcIiArICh0ZXh0LnR5cGUgPT09IDJcbiAgICAgID8gdGV4dC5leHByZXNzaW9uIC8vIG5vIG5lZWQgZm9yICgpIGJlY2F1c2UgYWxyZWFkeSB3cmFwcGVkIGluIF9zKClcbiAgICAgIDogdHJhbnNmb3JtU3BlY2lhbE5ld2xpbmVzKEpTT04uc3RyaW5naWZ5KHRleHQudGV4dCkpKSArIFwiKVwiKVxuICB9XG5cbiAgZnVuY3Rpb24gZ2VuQ29tbWVudCAoY29tbWVudCkge1xuICAgIHJldHVybiAoXCJfZShcIiArIChKU09OLnN0cmluZ2lmeShjb21tZW50LnRleHQpKSArIFwiKVwiKVxuICB9XG5cbiAgZnVuY3Rpb24gZ2VuU2xvdCAoZWwsIHN0YXRlKSB7XG4gICAgdmFyIHNsb3ROYW1lID0gZWwuc2xvdE5hbWUgfHwgJ1wiZGVmYXVsdFwiJztcbiAgICB2YXIgY2hpbGRyZW4gPSBnZW5DaGlsZHJlbihlbCwgc3RhdGUpO1xuICAgIHZhciByZXMgPSBcIl90KFwiICsgc2xvdE5hbWUgKyAoY2hpbGRyZW4gPyAoXCIsZnVuY3Rpb24oKXtyZXR1cm4gXCIgKyBjaGlsZHJlbiArIFwifVwiKSA6ICcnKTtcbiAgICB2YXIgYXR0cnMgPSBlbC5hdHRycyB8fCBlbC5keW5hbWljQXR0cnNcbiAgICAgID8gZ2VuUHJvcHMoKGVsLmF0dHJzIHx8IFtdKS5jb25jYXQoZWwuZHluYW1pY0F0dHJzIHx8IFtdKS5tYXAoZnVuY3Rpb24gKGF0dHIpIHsgcmV0dXJuICh7XG4gICAgICAgICAgLy8gc2xvdCBwcm9wcyBhcmUgY2FtZWxpemVkXG4gICAgICAgICAgbmFtZTogY2FtZWxpemUoYXR0ci5uYW1lKSxcbiAgICAgICAgICB2YWx1ZTogYXR0ci52YWx1ZSxcbiAgICAgICAgICBkeW5hbWljOiBhdHRyLmR5bmFtaWNcbiAgICAgICAgfSk7IH0pKVxuICAgICAgOiBudWxsO1xuICAgIHZhciBiaW5kJCQxID0gZWwuYXR0cnNNYXBbJ3YtYmluZCddO1xuICAgIGlmICgoYXR0cnMgfHwgYmluZCQkMSkgJiYgIWNoaWxkcmVuKSB7XG4gICAgICByZXMgKz0gXCIsbnVsbFwiO1xuICAgIH1cbiAgICBpZiAoYXR0cnMpIHtcbiAgICAgIHJlcyArPSBcIixcIiArIGF0dHJzO1xuICAgIH1cbiAgICBpZiAoYmluZCQkMSkge1xuICAgICAgcmVzICs9IChhdHRycyA/ICcnIDogJyxudWxsJykgKyBcIixcIiArIGJpbmQkJDE7XG4gICAgfVxuICAgIHJldHVybiByZXMgKyAnKSdcbiAgfVxuXG4gIC8vIGNvbXBvbmVudE5hbWUgaXMgZWwuY29tcG9uZW50LCB0YWtlIGl0IGFzIGFyZ3VtZW50IHRvIHNodW4gZmxvdydzIHBlc3NpbWlzdGljIHJlZmluZW1lbnRcbiAgZnVuY3Rpb24gZ2VuQ29tcG9uZW50IChcbiAgICBjb21wb25lbnROYW1lLFxuICAgIGVsLFxuICAgIHN0YXRlXG4gICkge1xuICAgIHZhciBjaGlsZHJlbiA9IGVsLmlubGluZVRlbXBsYXRlID8gbnVsbCA6IGdlbkNoaWxkcmVuKGVsLCBzdGF0ZSwgdHJ1ZSk7XG4gICAgcmV0dXJuIChcIl9jKFwiICsgY29tcG9uZW50TmFtZSArIFwiLFwiICsgKGdlbkRhdGEkMihlbCwgc3RhdGUpKSArIChjaGlsZHJlbiA/IChcIixcIiArIGNoaWxkcmVuKSA6ICcnKSArIFwiKVwiKVxuICB9XG5cbiAgZnVuY3Rpb24gZ2VuUHJvcHMgKHByb3BzKSB7XG4gICAgdmFyIHN0YXRpY1Byb3BzID0gXCJcIjtcbiAgICB2YXIgZHluYW1pY1Byb3BzID0gXCJcIjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcHJvcCA9IHByb3BzW2ldO1xuICAgICAgdmFyIHZhbHVlID0gdHJhbnNmb3JtU3BlY2lhbE5ld2xpbmVzKHByb3AudmFsdWUpO1xuICAgICAgaWYgKHByb3AuZHluYW1pYykge1xuICAgICAgICBkeW5hbWljUHJvcHMgKz0gKHByb3AubmFtZSkgKyBcIixcIiArIHZhbHVlICsgXCIsXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0aWNQcm9wcyArPSBcIlxcXCJcIiArIChwcm9wLm5hbWUpICsgXCJcXFwiOlwiICsgdmFsdWUgKyBcIixcIjtcbiAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljUHJvcHMgPSBcIntcIiArIChzdGF0aWNQcm9wcy5zbGljZSgwLCAtMSkpICsgXCJ9XCI7XG4gICAgaWYgKGR5bmFtaWNQcm9wcykge1xuICAgICAgcmV0dXJuIChcIl9kKFwiICsgc3RhdGljUHJvcHMgKyBcIixbXCIgKyAoZHluYW1pY1Byb3BzLnNsaWNlKDAsIC0xKSkgKyBcIl0pXCIpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzdGF0aWNQcm9wc1xuICAgIH1cbiAgfVxuXG4gIC8vICMzODk1LCAjNDI2OFxuICBmdW5jdGlvbiB0cmFuc2Zvcm1TcGVjaWFsTmV3bGluZXMgKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dFxuICAgICAgLnJlcGxhY2UoL1xcdTIwMjgvZywgJ1xcXFx1MjAyOCcpXG4gICAgICAucmVwbGFjZSgvXFx1MjAyOS9nLCAnXFxcXHUyMDI5JylcbiAgfVxuXG4gIC8qICAqL1xuXG5cblxuICAvLyB0aGVzZSBrZXl3b3JkcyBzaG91bGQgbm90IGFwcGVhciBpbnNpZGUgZXhwcmVzc2lvbnMsIGJ1dCBvcGVyYXRvcnMgbGlrZVxuICAvLyB0eXBlb2YsIGluc3RhbmNlb2YgYW5kIGluIGFyZSBhbGxvd2VkXG4gIHZhciBwcm9oaWJpdGVkS2V5d29yZFJFID0gbmV3IFJlZ0V4cCgnXFxcXGInICsgKFxuICAgICdkbyxpZixmb3IsbGV0LG5ldyx0cnksdmFyLGNhc2UsZWxzZSx3aXRoLGF3YWl0LGJyZWFrLGNhdGNoLGNsYXNzLGNvbnN0LCcgK1xuICAgICdzdXBlcix0aHJvdyx3aGlsZSx5aWVsZCxkZWxldGUsZXhwb3J0LGltcG9ydCxyZXR1cm4sc3dpdGNoLGRlZmF1bHQsJyArXG4gICAgJ2V4dGVuZHMsZmluYWxseSxjb250aW51ZSxkZWJ1Z2dlcixmdW5jdGlvbixhcmd1bWVudHMnXG4gICkuc3BsaXQoJywnKS5qb2luKCdcXFxcYnxcXFxcYicpICsgJ1xcXFxiJyk7XG5cbiAgLy8gdGhlc2UgdW5hcnkgb3BlcmF0b3JzIHNob3VsZCBub3QgYmUgdXNlZCBhcyBwcm9wZXJ0eS9tZXRob2QgbmFtZXNcbiAgdmFyIHVuYXJ5T3BlcmF0b3JzUkUgPSBuZXcgUmVnRXhwKCdcXFxcYicgKyAoXG4gICAgJ2RlbGV0ZSx0eXBlb2Ysdm9pZCdcbiAgKS5zcGxpdCgnLCcpLmpvaW4oJ1xcXFxzKlxcXFwoW15cXFxcKV0qXFxcXCl8XFxcXGInKSArICdcXFxccypcXFxcKFteXFxcXCldKlxcXFwpJyk7XG5cbiAgLy8gc3RyaXAgc3RyaW5ncyBpbiBleHByZXNzaW9uc1xuICB2YXIgc3RyaXBTdHJpbmdSRSA9IC8nKD86W14nXFxcXF18XFxcXC4pKid8XCIoPzpbXlwiXFxcXF18XFxcXC4pKlwifGAoPzpbXmBcXFxcXXxcXFxcLikqXFwkXFx7fFxcfSg/OlteYFxcXFxdfFxcXFwuKSpgfGAoPzpbXmBcXFxcXXxcXFxcLikqYC9nO1xuXG4gIC8vIGRldGVjdCBwcm9ibGVtYXRpYyBleHByZXNzaW9ucyBpbiBhIHRlbXBsYXRlXG4gIGZ1bmN0aW9uIGRldGVjdEVycm9ycyAoYXN0LCB3YXJuKSB7XG4gICAgaWYgKGFzdCkge1xuICAgICAgY2hlY2tOb2RlKGFzdCwgd2Fybik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tOb2RlIChub2RlLCB3YXJuKSB7XG4gICAgaWYgKG5vZGUudHlwZSA9PT0gMSkge1xuICAgICAgZm9yICh2YXIgbmFtZSBpbiBub2RlLmF0dHJzTWFwKSB7XG4gICAgICAgIGlmIChkaXJSRS50ZXN0KG5hbWUpKSB7XG4gICAgICAgICAgdmFyIHZhbHVlID0gbm9kZS5hdHRyc01hcFtuYW1lXTtcbiAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciByYW5nZSA9IG5vZGUucmF3QXR0cnNNYXBbbmFtZV07XG4gICAgICAgICAgICBpZiAobmFtZSA9PT0gJ3YtZm9yJykge1xuICAgICAgICAgICAgICBjaGVja0Zvcihub2RlLCAoXCJ2LWZvcj1cXFwiXCIgKyB2YWx1ZSArIFwiXFxcIlwiKSwgd2FybiwgcmFuZ2UpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuYW1lID09PSAndi1zbG90JyB8fCBuYW1lWzBdID09PSAnIycpIHtcbiAgICAgICAgICAgICAgY2hlY2tGdW5jdGlvblBhcmFtZXRlckV4cHJlc3Npb24odmFsdWUsIChuYW1lICsgXCI9XFxcIlwiICsgdmFsdWUgKyBcIlxcXCJcIiksIHdhcm4sIHJhbmdlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob25SRS50ZXN0KG5hbWUpKSB7XG4gICAgICAgICAgICAgIGNoZWNrRXZlbnQodmFsdWUsIChuYW1lICsgXCI9XFxcIlwiICsgdmFsdWUgKyBcIlxcXCJcIiksIHdhcm4sIHJhbmdlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNoZWNrRXhwcmVzc2lvbih2YWx1ZSwgKG5hbWUgKyBcIj1cXFwiXCIgKyB2YWx1ZSArIFwiXFxcIlwiKSwgd2FybiwgcmFuZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY2hlY2tOb2RlKG5vZGUuY2hpbGRyZW5baV0sIHdhcm4pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChub2RlLnR5cGUgPT09IDIpIHtcbiAgICAgIGNoZWNrRXhwcmVzc2lvbihub2RlLmV4cHJlc3Npb24sIG5vZGUudGV4dCwgd2Fybiwgbm9kZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tFdmVudCAoZXhwLCB0ZXh0LCB3YXJuLCByYW5nZSkge1xuICAgIHZhciBzdHJpcHBlZCA9IGV4cC5yZXBsYWNlKHN0cmlwU3RyaW5nUkUsICcnKTtcbiAgICB2YXIga2V5d29yZE1hdGNoID0gc3RyaXBwZWQubWF0Y2godW5hcnlPcGVyYXRvcnNSRSk7XG4gICAgaWYgKGtleXdvcmRNYXRjaCAmJiBzdHJpcHBlZC5jaGFyQXQoa2V5d29yZE1hdGNoLmluZGV4IC0gMSkgIT09ICckJykge1xuICAgICAgd2FybihcbiAgICAgICAgXCJhdm9pZCB1c2luZyBKYXZhU2NyaXB0IHVuYXJ5IG9wZXJhdG9yIGFzIHByb3BlcnR5IG5hbWU6IFwiICtcbiAgICAgICAgXCJcXFwiXCIgKyAoa2V5d29yZE1hdGNoWzBdKSArIFwiXFxcIiBpbiBleHByZXNzaW9uIFwiICsgKHRleHQudHJpbSgpKSxcbiAgICAgICAgcmFuZ2VcbiAgICAgICk7XG4gICAgfVxuICAgIGNoZWNrRXhwcmVzc2lvbihleHAsIHRleHQsIHdhcm4sIHJhbmdlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrRm9yIChub2RlLCB0ZXh0LCB3YXJuLCByYW5nZSkge1xuICAgIGNoZWNrRXhwcmVzc2lvbihub2RlLmZvciB8fCAnJywgdGV4dCwgd2FybiwgcmFuZ2UpO1xuICAgIGNoZWNrSWRlbnRpZmllcihub2RlLmFsaWFzLCAndi1mb3IgYWxpYXMnLCB0ZXh0LCB3YXJuLCByYW5nZSk7XG4gICAgY2hlY2tJZGVudGlmaWVyKG5vZGUuaXRlcmF0b3IxLCAndi1mb3IgaXRlcmF0b3InLCB0ZXh0LCB3YXJuLCByYW5nZSk7XG4gICAgY2hlY2tJZGVudGlmaWVyKG5vZGUuaXRlcmF0b3IyLCAndi1mb3IgaXRlcmF0b3InLCB0ZXh0LCB3YXJuLCByYW5nZSk7XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja0lkZW50aWZpZXIgKFxuICAgIGlkZW50LFxuICAgIHR5cGUsXG4gICAgdGV4dCxcbiAgICB3YXJuLFxuICAgIHJhbmdlXG4gICkge1xuICAgIGlmICh0eXBlb2YgaWRlbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBuZXcgRnVuY3Rpb24oKFwidmFyIFwiICsgaWRlbnQgKyBcIj1fXCIpKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgd2FybigoXCJpbnZhbGlkIFwiICsgdHlwZSArIFwiIFxcXCJcIiArIGlkZW50ICsgXCJcXFwiIGluIGV4cHJlc3Npb246IFwiICsgKHRleHQudHJpbSgpKSksIHJhbmdlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja0V4cHJlc3Npb24gKGV4cCwgdGV4dCwgd2FybiwgcmFuZ2UpIHtcbiAgICB0cnkge1xuICAgICAgbmV3IEZ1bmN0aW9uKChcInJldHVybiBcIiArIGV4cCkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHZhciBrZXl3b3JkTWF0Y2ggPSBleHAucmVwbGFjZShzdHJpcFN0cmluZ1JFLCAnJykubWF0Y2gocHJvaGliaXRlZEtleXdvcmRSRSk7XG4gICAgICBpZiAoa2V5d29yZE1hdGNoKSB7XG4gICAgICAgIHdhcm4oXG4gICAgICAgICAgXCJhdm9pZCB1c2luZyBKYXZhU2NyaXB0IGtleXdvcmQgYXMgcHJvcGVydHkgbmFtZTogXCIgK1xuICAgICAgICAgIFwiXFxcIlwiICsgKGtleXdvcmRNYXRjaFswXSkgKyBcIlxcXCJcXG4gIFJhdyBleHByZXNzaW9uOiBcIiArICh0ZXh0LnRyaW0oKSksXG4gICAgICAgICAgcmFuZ2VcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdhcm4oXG4gICAgICAgICAgXCJpbnZhbGlkIGV4cHJlc3Npb246IFwiICsgKGUubWVzc2FnZSkgKyBcIiBpblxcblxcblwiICtcbiAgICAgICAgICBcIiAgICBcIiArIGV4cCArIFwiXFxuXFxuXCIgK1xuICAgICAgICAgIFwiICBSYXcgZXhwcmVzc2lvbjogXCIgKyAodGV4dC50cmltKCkpICsgXCJcXG5cIixcbiAgICAgICAgICByYW5nZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrRnVuY3Rpb25QYXJhbWV0ZXJFeHByZXNzaW9uIChleHAsIHRleHQsIHdhcm4sIHJhbmdlKSB7XG4gICAgdHJ5IHtcbiAgICAgIG5ldyBGdW5jdGlvbihleHAsICcnKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB3YXJuKFxuICAgICAgICBcImludmFsaWQgZnVuY3Rpb24gcGFyYW1ldGVyIGV4cHJlc3Npb246IFwiICsgKGUubWVzc2FnZSkgKyBcIiBpblxcblxcblwiICtcbiAgICAgICAgXCIgICAgXCIgKyBleHAgKyBcIlxcblxcblwiICtcbiAgICAgICAgXCIgIFJhdyBleHByZXNzaW9uOiBcIiArICh0ZXh0LnRyaW0oKSkgKyBcIlxcblwiLFxuICAgICAgICByYW5nZVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKiAgKi9cblxuICB2YXIgcmFuZ2UgPSAyO1xuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlQ29kZUZyYW1lIChcbiAgICBzb3VyY2UsXG4gICAgc3RhcnQsXG4gICAgZW5kXG4gICkge1xuICAgIGlmICggc3RhcnQgPT09IHZvaWQgMCApIHN0YXJ0ID0gMDtcbiAgICBpZiAoIGVuZCA9PT0gdm9pZCAwICkgZW5kID0gc291cmNlLmxlbmd0aDtcblxuICAgIHZhciBsaW5lcyA9IHNvdXJjZS5zcGxpdCgvXFxyP1xcbi8pO1xuICAgIHZhciBjb3VudCA9IDA7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvdW50ICs9IGxpbmVzW2ldLmxlbmd0aCArIDE7XG4gICAgICBpZiAoY291bnQgPj0gc3RhcnQpIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IGkgLSByYW5nZTsgaiA8PSBpICsgcmFuZ2UgfHwgZW5kID4gY291bnQ7IGorKykge1xuICAgICAgICAgIGlmIChqIDwgMCB8fCBqID49IGxpbmVzLmxlbmd0aCkgeyBjb250aW51ZSB9XG4gICAgICAgICAgcmVzLnB1c2goKFwiXCIgKyAoaiArIDEpICsgKHJlcGVhdCQxKFwiIFwiLCAzIC0gU3RyaW5nKGogKyAxKS5sZW5ndGgpKSArIFwifCAgXCIgKyAobGluZXNbal0pKSk7XG4gICAgICAgICAgdmFyIGxpbmVMZW5ndGggPSBsaW5lc1tqXS5sZW5ndGg7XG4gICAgICAgICAgaWYgKGogPT09IGkpIHtcbiAgICAgICAgICAgIC8vIHB1c2ggdW5kZXJsaW5lXG4gICAgICAgICAgICB2YXIgcGFkID0gc3RhcnQgLSAoY291bnQgLSBsaW5lTGVuZ3RoKSArIDE7XG4gICAgICAgICAgICB2YXIgbGVuZ3RoID0gZW5kID4gY291bnQgPyBsaW5lTGVuZ3RoIC0gcGFkIDogZW5kIC0gc3RhcnQ7XG4gICAgICAgICAgICByZXMucHVzaChcIiAgIHwgIFwiICsgcmVwZWF0JDEoXCIgXCIsIHBhZCkgKyByZXBlYXQkMShcIl5cIiwgbGVuZ3RoKSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChqID4gaSkge1xuICAgICAgICAgICAgaWYgKGVuZCA+IGNvdW50KSB7XG4gICAgICAgICAgICAgIHZhciBsZW5ndGgkMSA9IE1hdGgubWluKGVuZCAtIGNvdW50LCBsaW5lTGVuZ3RoKTtcbiAgICAgICAgICAgICAgcmVzLnB1c2goXCIgICB8ICBcIiArIHJlcGVhdCQxKFwiXlwiLCBsZW5ndGgkMSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY291bnQgKz0gbGluZUxlbmd0aCArIDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXMuam9pbignXFxuJylcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlcGVhdCQxIChzdHIsIG4pIHtcbiAgICB2YXIgcmVzdWx0ID0gJyc7XG4gICAgaWYgKG4gPiAwKSB7XG4gICAgICB3aGlsZSAodHJ1ZSkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgIGlmIChuICYgMSkgeyByZXN1bHQgKz0gc3RyOyB9XG4gICAgICAgIG4gPj4+PSAxO1xuICAgICAgICBpZiAobiA8PSAwKSB7IGJyZWFrIH1cbiAgICAgICAgc3RyICs9IHN0cjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgLyogICovXG5cblxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUZ1bmN0aW9uIChjb2RlLCBlcnJvcnMpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIG5ldyBGdW5jdGlvbihjb2RlKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgZXJyb3JzLnB1c2goeyBlcnI6IGVyciwgY29kZTogY29kZSB9KTtcbiAgICAgIHJldHVybiBub29wXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ29tcGlsZVRvRnVuY3Rpb25GbiAoY29tcGlsZSkge1xuICAgIHZhciBjYWNoZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gY29tcGlsZVRvRnVuY3Rpb25zIChcbiAgICAgIHRlbXBsYXRlLFxuICAgICAgb3B0aW9ucyxcbiAgICAgIHZtXG4gICAgKSB7XG4gICAgICBvcHRpb25zID0gZXh0ZW5kKHt9LCBvcHRpb25zKTtcbiAgICAgIHZhciB3YXJuJCQxID0gb3B0aW9ucy53YXJuIHx8IHdhcm47XG4gICAgICBkZWxldGUgb3B0aW9ucy53YXJuO1xuXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIHtcbiAgICAgICAgLy8gZGV0ZWN0IHBvc3NpYmxlIENTUCByZXN0cmljdGlvblxuICAgICAgICB0cnkge1xuICAgICAgICAgIG5ldyBGdW5jdGlvbigncmV0dXJuIDEnKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGlmIChlLnRvU3RyaW5nKCkubWF0Y2goL3Vuc2FmZS1ldmFsfENTUC8pKSB7XG4gICAgICAgICAgICB3YXJuJCQxKFxuICAgICAgICAgICAgICAnSXQgc2VlbXMgeW91IGFyZSB1c2luZyB0aGUgc3RhbmRhbG9uZSBidWlsZCBvZiBWdWUuanMgaW4gYW4gJyArXG4gICAgICAgICAgICAgICdlbnZpcm9ubWVudCB3aXRoIENvbnRlbnQgU2VjdXJpdHkgUG9saWN5IHRoYXQgcHJvaGliaXRzIHVuc2FmZS1ldmFsLiAnICtcbiAgICAgICAgICAgICAgJ1RoZSB0ZW1wbGF0ZSBjb21waWxlciBjYW5ub3Qgd29yayBpbiB0aGlzIGVudmlyb25tZW50LiBDb25zaWRlciAnICtcbiAgICAgICAgICAgICAgJ3JlbGF4aW5nIHRoZSBwb2xpY3kgdG8gYWxsb3cgdW5zYWZlLWV2YWwgb3IgcHJlLWNvbXBpbGluZyB5b3VyICcgK1xuICAgICAgICAgICAgICAndGVtcGxhdGVzIGludG8gcmVuZGVyIGZ1bmN0aW9ucy4nXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBjaGVjayBjYWNoZVxuICAgICAgdmFyIGtleSA9IG9wdGlvbnMuZGVsaW1pdGVyc1xuICAgICAgICA/IFN0cmluZyhvcHRpb25zLmRlbGltaXRlcnMpICsgdGVtcGxhdGVcbiAgICAgICAgOiB0ZW1wbGF0ZTtcbiAgICAgIGlmIChjYWNoZVtrZXldKSB7XG4gICAgICAgIHJldHVybiBjYWNoZVtrZXldXG4gICAgICB9XG5cbiAgICAgIC8vIGNvbXBpbGVcbiAgICAgIHZhciBjb21waWxlZCA9IGNvbXBpbGUodGVtcGxhdGUsIG9wdGlvbnMpO1xuXG4gICAgICAvLyBjaGVjayBjb21waWxhdGlvbiBlcnJvcnMvdGlwc1xuICAgICAge1xuICAgICAgICBpZiAoY29tcGlsZWQuZXJyb3JzICYmIGNvbXBpbGVkLmVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgICBpZiAob3B0aW9ucy5vdXRwdXRTb3VyY2VSYW5nZSkge1xuICAgICAgICAgICAgY29tcGlsZWQuZXJyb3JzLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgd2FybiQkMShcbiAgICAgICAgICAgICAgICBcIkVycm9yIGNvbXBpbGluZyB0ZW1wbGF0ZTpcXG5cXG5cIiArIChlLm1zZykgKyBcIlxcblxcblwiICtcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZUNvZGVGcmFtZSh0ZW1wbGF0ZSwgZS5zdGFydCwgZS5lbmQpLFxuICAgICAgICAgICAgICAgIHZtXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2FybiQkMShcbiAgICAgICAgICAgICAgXCJFcnJvciBjb21waWxpbmcgdGVtcGxhdGU6XFxuXFxuXCIgKyB0ZW1wbGF0ZSArIFwiXFxuXFxuXCIgK1xuICAgICAgICAgICAgICBjb21waWxlZC5lcnJvcnMubWFwKGZ1bmN0aW9uIChlKSB7IHJldHVybiAoXCItIFwiICsgZSk7IH0pLmpvaW4oJ1xcbicpICsgJ1xcbicsXG4gICAgICAgICAgICAgIHZtXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tcGlsZWQudGlwcyAmJiBjb21waWxlZC50aXBzLmxlbmd0aCkge1xuICAgICAgICAgIGlmIChvcHRpb25zLm91dHB1dFNvdXJjZVJhbmdlKSB7XG4gICAgICAgICAgICBjb21waWxlZC50aXBzLmZvckVhY2goZnVuY3Rpb24gKGUpIHsgcmV0dXJuIHRpcChlLm1zZywgdm0pOyB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29tcGlsZWQudGlwcy5mb3JFYWNoKGZ1bmN0aW9uIChtc2cpIHsgcmV0dXJuIHRpcChtc2csIHZtKTsgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHR1cm4gY29kZSBpbnRvIGZ1bmN0aW9uc1xuICAgICAgdmFyIHJlcyA9IHt9O1xuICAgICAgdmFyIGZuR2VuRXJyb3JzID0gW107XG4gICAgICByZXMucmVuZGVyID0gY3JlYXRlRnVuY3Rpb24oY29tcGlsZWQucmVuZGVyLCBmbkdlbkVycm9ycyk7XG4gICAgICByZXMuc3RhdGljUmVuZGVyRm5zID0gY29tcGlsZWQuc3RhdGljUmVuZGVyRm5zLm1hcChmdW5jdGlvbiAoY29kZSkge1xuICAgICAgICByZXR1cm4gY3JlYXRlRnVuY3Rpb24oY29kZSwgZm5HZW5FcnJvcnMpXG4gICAgICB9KTtcblxuICAgICAgLy8gY2hlY2sgZnVuY3Rpb24gZ2VuZXJhdGlvbiBlcnJvcnMuXG4gICAgICAvLyB0aGlzIHNob3VsZCBvbmx5IGhhcHBlbiBpZiB0aGVyZSBpcyBhIGJ1ZyBpbiB0aGUgY29tcGlsZXIgaXRzZWxmLlxuICAgICAgLy8gbW9zdGx5IGZvciBjb2RlZ2VuIGRldmVsb3BtZW50IHVzZVxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICB7XG4gICAgICAgIGlmICgoIWNvbXBpbGVkLmVycm9ycyB8fCAhY29tcGlsZWQuZXJyb3JzLmxlbmd0aCkgJiYgZm5HZW5FcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgd2FybiQkMShcbiAgICAgICAgICAgIFwiRmFpbGVkIHRvIGdlbmVyYXRlIHJlbmRlciBmdW5jdGlvbjpcXG5cXG5cIiArXG4gICAgICAgICAgICBmbkdlbkVycm9ycy5tYXAoZnVuY3Rpb24gKHJlZikge1xuICAgICAgICAgICAgICB2YXIgZXJyID0gcmVmLmVycjtcbiAgICAgICAgICAgICAgdmFyIGNvZGUgPSByZWYuY29kZTtcblxuICAgICAgICAgICAgICByZXR1cm4gKChlcnIudG9TdHJpbmcoKSkgKyBcIiBpblxcblxcblwiICsgY29kZSArIFwiXFxuXCIpO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpLFxuICAgICAgICAgICAgdm1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoY2FjaGVba2V5XSA9IHJlcylcbiAgICB9XG4gIH1cblxuICAvKiAgKi9cblxuICBmdW5jdGlvbiBjcmVhdGVDb21waWxlckNyZWF0b3IgKGJhc2VDb21waWxlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIGNyZWF0ZUNvbXBpbGVyIChiYXNlT3B0aW9ucykge1xuICAgICAgZnVuY3Rpb24gY29tcGlsZSAoXG4gICAgICAgIHRlbXBsYXRlLFxuICAgICAgICBvcHRpb25zXG4gICAgICApIHtcbiAgICAgICAgdmFyIGZpbmFsT3B0aW9ucyA9IE9iamVjdC5jcmVhdGUoYmFzZU9wdGlvbnMpO1xuICAgICAgICB2YXIgZXJyb3JzID0gW107XG4gICAgICAgIHZhciB0aXBzID0gW107XG5cbiAgICAgICAgdmFyIHdhcm4gPSBmdW5jdGlvbiAobXNnLCByYW5nZSwgdGlwKSB7XG4gICAgICAgICAgKHRpcCA/IHRpcHMgOiBlcnJvcnMpLnB1c2gobXNnKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAob3B0aW9ucykge1xuICAgICAgICAgIGlmIChvcHRpb25zLm91dHB1dFNvdXJjZVJhbmdlKSB7XG4gICAgICAgICAgICAvLyAkZmxvdy1kaXNhYmxlLWxpbmVcbiAgICAgICAgICAgIHZhciBsZWFkaW5nU3BhY2VMZW5ndGggPSB0ZW1wbGF0ZS5tYXRjaCgvXlxccyovKVswXS5sZW5ndGg7XG5cbiAgICAgICAgICAgIHdhcm4gPSBmdW5jdGlvbiAobXNnLCByYW5nZSwgdGlwKSB7XG4gICAgICAgICAgICAgIHZhciBkYXRhID0geyBtc2c6IG1zZyB9O1xuICAgICAgICAgICAgICBpZiAocmFuZ2UpIHtcbiAgICAgICAgICAgICAgICBpZiAocmFuZ2Uuc3RhcnQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgZGF0YS5zdGFydCA9IHJhbmdlLnN0YXJ0ICsgbGVhZGluZ1NwYWNlTGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocmFuZ2UuZW5kICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgIGRhdGEuZW5kID0gcmFuZ2UuZW5kICsgbGVhZGluZ1NwYWNlTGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAodGlwID8gdGlwcyA6IGVycm9ycykucHVzaChkYXRhKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIG1lcmdlIGN1c3RvbSBtb2R1bGVzXG4gICAgICAgICAgaWYgKG9wdGlvbnMubW9kdWxlcykge1xuICAgICAgICAgICAgZmluYWxPcHRpb25zLm1vZHVsZXMgPVxuICAgICAgICAgICAgICAoYmFzZU9wdGlvbnMubW9kdWxlcyB8fCBbXSkuY29uY2F0KG9wdGlvbnMubW9kdWxlcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIG1lcmdlIGN1c3RvbSBkaXJlY3RpdmVzXG4gICAgICAgICAgaWYgKG9wdGlvbnMuZGlyZWN0aXZlcykge1xuICAgICAgICAgICAgZmluYWxPcHRpb25zLmRpcmVjdGl2ZXMgPSBleHRlbmQoXG4gICAgICAgICAgICAgIE9iamVjdC5jcmVhdGUoYmFzZU9wdGlvbnMuZGlyZWN0aXZlcyB8fCBudWxsKSxcbiAgICAgICAgICAgICAgb3B0aW9ucy5kaXJlY3RpdmVzXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBjb3B5IG90aGVyIG9wdGlvbnNcbiAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKGtleSAhPT0gJ21vZHVsZXMnICYmIGtleSAhPT0gJ2RpcmVjdGl2ZXMnKSB7XG4gICAgICAgICAgICAgIGZpbmFsT3B0aW9uc1trZXldID0gb3B0aW9uc1trZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZpbmFsT3B0aW9ucy53YXJuID0gd2FybjtcblxuICAgICAgICB2YXIgY29tcGlsZWQgPSBiYXNlQ29tcGlsZSh0ZW1wbGF0ZS50cmltKCksIGZpbmFsT3B0aW9ucyk7XG4gICAgICAgIHtcbiAgICAgICAgICBkZXRlY3RFcnJvcnMoY29tcGlsZWQuYXN0LCB3YXJuKTtcbiAgICAgICAgfVxuICAgICAgICBjb21waWxlZC5lcnJvcnMgPSBlcnJvcnM7XG4gICAgICAgIGNvbXBpbGVkLnRpcHMgPSB0aXBzO1xuICAgICAgICByZXR1cm4gY29tcGlsZWRcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29tcGlsZTogY29tcGlsZSxcbiAgICAgICAgY29tcGlsZVRvRnVuY3Rpb25zOiBjcmVhdGVDb21waWxlVG9GdW5jdGlvbkZuKGNvbXBpbGUpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyogICovXG5cbiAgLy8gYGNyZWF0ZUNvbXBpbGVyQ3JlYXRvcmAgYWxsb3dzIGNyZWF0aW5nIGNvbXBpbGVycyB0aGF0IHVzZSBhbHRlcm5hdGl2ZVxuICAvLyBwYXJzZXIvb3B0aW1pemVyL2NvZGVnZW4sIGUuZyB0aGUgU1NSIG9wdGltaXppbmcgY29tcGlsZXIuXG4gIC8vIEhlcmUgd2UganVzdCBleHBvcnQgYSBkZWZhdWx0IGNvbXBpbGVyIHVzaW5nIHRoZSBkZWZhdWx0IHBhcnRzLlxuICB2YXIgY3JlYXRlQ29tcGlsZXIgPSBjcmVhdGVDb21waWxlckNyZWF0b3IoZnVuY3Rpb24gYmFzZUNvbXBpbGUgKFxuICAgIHRlbXBsYXRlLFxuICAgIG9wdGlvbnNcbiAgKSB7XG4gICAgdmFyIGFzdCA9IHBhcnNlKHRlbXBsYXRlLnRyaW0oKSwgb3B0aW9ucyk7XG4gICAgaWYgKG9wdGlvbnMub3B0aW1pemUgIT09IGZhbHNlKSB7XG4gICAgICBvcHRpbWl6ZShhc3QsIG9wdGlvbnMpO1xuICAgIH1cbiAgICB2YXIgY29kZSA9IGdlbmVyYXRlKGFzdCwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGFzdDogYXN0LFxuICAgICAgcmVuZGVyOiBjb2RlLnJlbmRlcixcbiAgICAgIHN0YXRpY1JlbmRlckZuczogY29kZS5zdGF0aWNSZW5kZXJGbnNcbiAgICB9XG4gIH0pO1xuXG4gIC8qICAqL1xuXG4gIHZhciByZWYkMSA9IGNyZWF0ZUNvbXBpbGVyKGJhc2VPcHRpb25zKTtcbiAgdmFyIGNvbXBpbGUgPSByZWYkMS5jb21waWxlO1xuICB2YXIgY29tcGlsZVRvRnVuY3Rpb25zID0gcmVmJDEuY29tcGlsZVRvRnVuY3Rpb25zO1xuXG4gIC8qICAqL1xuXG4gIC8vIGNoZWNrIHdoZXRoZXIgY3VycmVudCBicm93c2VyIGVuY29kZXMgYSBjaGFyIGluc2lkZSBhdHRyaWJ1dGUgdmFsdWVzXG4gIHZhciBkaXY7XG4gIGZ1bmN0aW9uIGdldFNob3VsZERlY29kZSAoaHJlZikge1xuICAgIGRpdiA9IGRpdiB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYuaW5uZXJIVE1MID0gaHJlZiA/IFwiPGEgaHJlZj1cXFwiXFxuXFxcIi8+XCIgOiBcIjxkaXYgYT1cXFwiXFxuXFxcIi8+XCI7XG4gICAgcmV0dXJuIGRpdi5pbm5lckhUTUwuaW5kZXhPZignJiMxMDsnKSA+IDBcbiAgfVxuXG4gIC8vICMzNjYzOiBJRSBlbmNvZGVzIG5ld2xpbmVzIGluc2lkZSBhdHRyaWJ1dGUgdmFsdWVzIHdoaWxlIG90aGVyIGJyb3dzZXJzIGRvbid0XG4gIHZhciBzaG91bGREZWNvZGVOZXdsaW5lcyA9IGluQnJvd3NlciA/IGdldFNob3VsZERlY29kZShmYWxzZSkgOiBmYWxzZTtcbiAgLy8gIzY4Mjg6IGNocm9tZSBlbmNvZGVzIGNvbnRlbnQgaW4gYVtocmVmXVxuICB2YXIgc2hvdWxkRGVjb2RlTmV3bGluZXNGb3JIcmVmID0gaW5Ccm93c2VyID8gZ2V0U2hvdWxkRGVjb2RlKHRydWUpIDogZmFsc2U7XG5cbiAgLyogICovXG5cbiAgdmFyIGlkVG9UZW1wbGF0ZSA9IGNhY2hlZChmdW5jdGlvbiAoaWQpIHtcbiAgICB2YXIgZWwgPSBxdWVyeShpZCk7XG4gICAgcmV0dXJuIGVsICYmIGVsLmlubmVySFRNTFxuICB9KTtcblxuICB2YXIgbW91bnQgPSBWdWUucHJvdG90eXBlLiRtb3VudDtcbiAgVnVlLnByb3RvdHlwZS4kbW91bnQgPSBmdW5jdGlvbiAoXG4gICAgZWwsXG4gICAgaHlkcmF0aW5nXG4gICkge1xuICAgIGVsID0gZWwgJiYgcXVlcnkoZWwpO1xuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKGVsID09PSBkb2N1bWVudC5ib2R5IHx8IGVsID09PSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpIHtcbiAgICAgIHdhcm4oXG4gICAgICAgIFwiRG8gbm90IG1vdW50IFZ1ZSB0byA8aHRtbD4gb3IgPGJvZHk+IC0gbW91bnQgdG8gbm9ybWFsIGVsZW1lbnRzIGluc3RlYWQuXCJcbiAgICAgICk7XG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxuICAgIHZhciBvcHRpb25zID0gdGhpcy4kb3B0aW9ucztcbiAgICAvLyByZXNvbHZlIHRlbXBsYXRlL2VsIGFuZCBjb252ZXJ0IHRvIHJlbmRlciBmdW5jdGlvblxuICAgIGlmICghb3B0aW9ucy5yZW5kZXIpIHtcbiAgICAgIHZhciB0ZW1wbGF0ZSA9IG9wdGlvbnMudGVtcGxhdGU7XG4gICAgICBpZiAodGVtcGxhdGUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0ZW1wbGF0ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBpZiAodGVtcGxhdGUuY2hhckF0KDApID09PSAnIycpIHtcbiAgICAgICAgICAgIHRlbXBsYXRlID0gaWRUb1RlbXBsYXRlKHRlbXBsYXRlKTtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgICB3YXJuKFxuICAgICAgICAgICAgICAgIChcIlRlbXBsYXRlIGVsZW1lbnQgbm90IGZvdW5kIG9yIGlzIGVtcHR5OiBcIiArIChvcHRpb25zLnRlbXBsYXRlKSksXG4gICAgICAgICAgICAgICAgdGhpc1xuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0ZW1wbGF0ZS5ub2RlVHlwZSkge1xuICAgICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGUuaW5uZXJIVE1MO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHdhcm4oJ2ludmFsaWQgdGVtcGxhdGUgb3B0aW9uOicgKyB0ZW1wbGF0ZSwgdGhpcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZWwpIHtcbiAgICAgICAgdGVtcGxhdGUgPSBnZXRPdXRlckhUTUwoZWwpO1xuICAgICAgfVxuICAgICAgaWYgKHRlbXBsYXRlKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAoY29uZmlnLnBlcmZvcm1hbmNlICYmIG1hcmspIHtcbiAgICAgICAgICBtYXJrKCdjb21waWxlJyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVmID0gY29tcGlsZVRvRnVuY3Rpb25zKHRlbXBsYXRlLCB7XG4gICAgICAgICAgb3V0cHV0U291cmNlUmFuZ2U6IFwiZGV2ZWxvcG1lbnRcIiAhPT0gJ3Byb2R1Y3Rpb24nLFxuICAgICAgICAgIHNob3VsZERlY29kZU5ld2xpbmVzOiBzaG91bGREZWNvZGVOZXdsaW5lcyxcbiAgICAgICAgICBzaG91bGREZWNvZGVOZXdsaW5lc0ZvckhyZWY6IHNob3VsZERlY29kZU5ld2xpbmVzRm9ySHJlZixcbiAgICAgICAgICBkZWxpbWl0ZXJzOiBvcHRpb25zLmRlbGltaXRlcnMsXG4gICAgICAgICAgY29tbWVudHM6IG9wdGlvbnMuY29tbWVudHNcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHZhciByZW5kZXIgPSByZWYucmVuZGVyO1xuICAgICAgICB2YXIgc3RhdGljUmVuZGVyRm5zID0gcmVmLnN0YXRpY1JlbmRlckZucztcbiAgICAgICAgb3B0aW9ucy5yZW5kZXIgPSByZW5kZXI7XG4gICAgICAgIG9wdGlvbnMuc3RhdGljUmVuZGVyRm5zID0gc3RhdGljUmVuZGVyRm5zO1xuXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAoY29uZmlnLnBlcmZvcm1hbmNlICYmIG1hcmspIHtcbiAgICAgICAgICBtYXJrKCdjb21waWxlIGVuZCcpO1xuICAgICAgICAgIG1lYXN1cmUoKFwidnVlIFwiICsgKHRoaXMuX25hbWUpICsgXCIgY29tcGlsZVwiKSwgJ2NvbXBpbGUnLCAnY29tcGlsZSBlbmQnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbW91bnQuY2FsbCh0aGlzLCBlbCwgaHlkcmF0aW5nKVxuICB9O1xuXG4gIC8qKlxuICAgKiBHZXQgb3V0ZXJIVE1MIG9mIGVsZW1lbnRzLCB0YWtpbmcgY2FyZVxuICAgKiBvZiBTVkcgZWxlbWVudHMgaW4gSUUgYXMgd2VsbC5cbiAgICovXG4gIGZ1bmN0aW9uIGdldE91dGVySFRNTCAoZWwpIHtcbiAgICBpZiAoZWwub3V0ZXJIVE1MKSB7XG4gICAgICByZXR1cm4gZWwub3V0ZXJIVE1MXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChlbC5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgICAgcmV0dXJuIGNvbnRhaW5lci5pbm5lckhUTUxcbiAgICB9XG4gIH1cblxuICBWdWUuY29tcGlsZSA9IGNvbXBpbGVUb0Z1bmN0aW9ucztcblxuICByZXR1cm4gVnVlO1xuXG59KSk7XG4iXX0=
