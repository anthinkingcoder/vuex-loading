'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

/**
 * 自动为绑定loading的state属性生成loading的相关操作方法
 * @param state
 * @param getters
 * @param mutations
 * @param stateNameArray 要绑定loading的state属性数组
 */
function mixin(_ref) {
  var state = _ref.state,
      getters = _ref.getters,
      mutations = _ref.mutations;
  var stateNameArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  stateNameArray.forEach(function (name) {
    var loadingName = void 0;
    if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') {
      var stateName = Object.keys(name)[0];
      if (Array.isArray(stateName) && !name[stateName]) {
        throw new Error('When multiple state share a loading, the loading name not be null');
      }
      loadingName = name[stateName];
    } else {
      loadingName = normalizeLoadingName(name);
    }
    if (loadingName) {
      state[loadingName] = false;
      getters[loadingName] = getLoadingGetter(loadingName);
      mutations[normalizeMutationName(loadingName)] = getLoadingMutation(loadingName);
    }
  });
}

/**
 * 代理loading
 * @param commit vuex commit
 * @param loading loading name
 * @param fn be proxy function
 * @param isPromise fn是否返回promise，false表示fn不返回promise， 而是以回调的形式返回
 */

function aopLoading(commit, loading, fn) {
  var isPromise = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  loading = normalizeMutationName(loading);
  return isPromise ? aopPromise(commit, loading, fn) : aopCallback(commit, loading, fn);
}

/**
 * 生成loading action(回调式)
 * @param commit vuex commit
 * @param loading loading name
 * @param fn be proxy function
 * @returns {function(*=, *=)} proxy function
 */
function aopCallback(commit, loading, fn) {
  return function (success, error) {
    for (var _len = arguments.length, otherArg = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      otherArg[_key - 2] = arguments[_key];
    }

    commit(loading, true);
    success = pointer(commit, loading, success);
    error = pointer(commit, loading, error);
    fn.call.apply(fn, [null, function () {
      for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        arg[_key2] = arguments[_key2];
      }

      return success.apply(null, arg);
    }, function () {
      for (var _len3 = arguments.length, arg = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        arg[_key3] = arguments[_key3];
      }

      return error.apply(null, arg);
    }].concat(otherArg));
  };
}

/**
 * 生成loading action(promise式)
 * @param commit vuex commit
 * @param loading loading name
 * @param fn be proxy function
 * @returns {function(*=, *=)} proxy function
 */
function aopPromise(commit, loading, fn) {
  var showLoading = function showLoading() {
    commit(loading, true);
  };
  var hideLoading = function hideLoading(result) {
    commit(loading, false);
    return result;
  };
  return function () {
    for (var _len4 = arguments.length, arg = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      arg[_key4] = arguments[_key4];
    }

    var promise = Promise.resolve(loading);
    var chain = [showLoading, undefined, fn.bind.apply(fn, [null].concat(arg)), undefined, hideLoading, hideLoading];
    while (chain.length > 0) {
      promise = promise.then(chain.shift(), chain.shift());
    }
    return promise;
  };
}

/**
 * 生成loading state
 * mapLoadingState({datasA:[],datasB:[]}) => {datasA:[],datasLoading:false,datasB:[],datasBLoading:false}
 * mapLoadingState({datasA:[],datasB:[]},'loading') => {datasA:[],datasB:[],loading:false}
 * @param stateObj
 * @param totalLoadingName 整个stateObj共有的loading，如果不为空，stateObj将共享这个loading，不再生成自己的loading
 * @returns {{}}
 */
function mapLoadingState(stateObj, totalLoadingName) {
  var res = {};
  Object.keys(stateObj).forEach(function (key) {
    res[key] = stateObj[key];
    if (!totalLoadingName) {
      res[normalizeLoadingName(key)] = false;
    }
  });
  if (totalLoadingName) {
    res[totalLoadingName] = false;
  }
  return res;
}

/**
 * 生成loading mutation集合
 * @param nameArray mutation name数组
 * @returns {Array} 返回mutation方法数组
 */
function mapLoadingMutations() {
  var nameArray = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  var res = {};
  nameArray.forEach(function (name) {
    var fnName = normalizeMutationName(name);
    res[fnName] = getLoadingMutation(name);
  });
  return res;
}

/**
 * 生成loading getters集合
 * @param nameArray loading state name array
 * @returns {{}} 返回getters方法数组
 */
function mapLoadingGetters() {
  var nameArray = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  var res = {};
  normalizeMap(nameArray).forEach(function (item) {
    res[item['key']] = getLoadingGetter(item['val']);
  });
  return res;
}

/**
 * 生成一个loading mutation
 * @param name state的属性名称
 * @returns {function(*, *)}
 */
function getLoadingMutation(name) {
  return function (state, loading) {
    state[name] = loading;
  };
}

/**
 * 生成一个loading getter
 * @param val state的属性名称
 * @returns {function(*, *)}
 */
function getLoadingGetter(val) {
  return function (state) {
    return state[val];
  };
}

/**
 * 初始化变更函数名 loading -> setLoading
 * @param name
 * @returns {string}
 */
function normalizeMutationName(name) {
  name = name.replace(/^([a-zA-Z])/, function (ar1) {
    return ar1.toUpperCase();
  });
  return 'set' + name;
}

/**
 * 默认loading name为数据源state name + Loading
 * @param name
 * @returns {string}
 */
function normalizeLoadingName(name) {
  return name + 'Loading';
}

/**
 * [1,2,3] => [{key:1,val:1},{key:2,val:2},{key:3,val:3}]
 * {a:1,b:2,c:3} => [{key:a,val:1},{key:b,val:2},{key:c,val:3}]
 * @param map
 * @returns {Array}
 */
function normalizeMap(map) {
  return Array.isArray(map) ? map.map(function (key) {
    return { key: key, val: key };
  }) : Object.keys(map).map(function (key) {
    return { key: key, val: map[key] };
  });
}

/**
 * 切点，切入loading=false的commit
 * @param commit
 * @param loading
 * @param fn
 * @returns {Function}
 */
function pointer(commit, loading, fn) {
  return function () {
    commit(loading, false);

    for (var _len5 = arguments.length, arg = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      arg[_key5] = arguments[_key5];
    }

    fn.apply(null, arg);
  };
}

var index = {
  mixin: mixin,
  aopLoading: aopLoading
};

exports.default = index;
exports.mixin = mixin;
exports.aopLoading = aopLoading;
exports.mapLoadingMutations = mapLoadingMutations;
exports.mapLoadingState = mapLoadingState;
exports.mapLoadingGetters = mapLoadingGetters;
