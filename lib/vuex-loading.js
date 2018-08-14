'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * 生成loading action
 * @param commit
 * @param loading
 * @param fn
 * @returns {function(*=, *=)}
 */
function aopLoading(commit, loading, fn) {
  loading = normalizeMutationName(loading);
  return function (success, error) {
    for (var _len = arguments.length, otherArg = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      otherArg[_key - 2] = arguments[_key];
    }

    commit(loading, true);
    success = pointer(commit, loading, success);
    error = pointer(commit, loading, error);
    fn.call(null, function () {
      for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        arg[_key2] = arguments[_key2];
      }

      return success.apply(null, arg);
    }, function () {
      for (var _len3 = arguments.length, arg = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        arg[_key3] = arguments[_key3];
      }

      return error.apply(null, arg);
    }, otherArg);
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
 * 生成loading mutation
 * @param nameArray mutation name数组
 * @returns {Array} 返回mutation方法数组
 */
function mapLoadingMutation() {
  var nameArray = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  var res = {};
  nameArray.forEach(function (name) {
    var fnName = normalizeMutationName(name);
    res[fnName] = function (state, loading) {
      state[name] = loading;
    };
  });
  return res;
}

/**
 * 生成loading getters
 * @param nameArray loading state name array
 * @returns {{}}
 */
function mapLoadingGetter() {
  var nameArray = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  var res = {};
  normalizeMap(nameArray).forEach(function (item) {
    res[item['key']] = function (state) {
      return state[item['val']];
    };
  });
  return res;
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

    for (var _len4 = arguments.length, arg = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      arg[_key4] = arguments[_key4];
    }

    fn.apply(null, arg);
  };
}

exports.aopLoading = aopLoading;
exports.mapLoadingMutation = mapLoadingMutation;
exports.mapLoadingState = mapLoadingState;
exports.mapLoadingGetter = mapLoadingGetter;
