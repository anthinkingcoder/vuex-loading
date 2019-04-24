/**
 * 自动为绑定loading的state属性生成loading的相关操作方法
 * @param state
 * @param getters
 * @param mutations
 * @param stateNameArray 要绑定loading的state属性数组
 */
function mixin({state, getters, mutations}, stateNameArray = []) {
  stateNameArray.forEach(name => {
    let loadingName;
    if (typeof name === 'object') {
      let stateName = Object.keys(name)[0]
      if (Array.isArray(stateName) && !name[stateName]) {
        throw new Error('When multiple state share a loading, the loading name not be null')
      }
      loadingName = name[stateName]
    } else {
      loadingName = normalizeLoadingName(name)
    }
    if (loadingName) {
      state[loadingName] = false
      getters[loadingName] = getLoadingGetter(loadingName)
      mutations[normalizeMutationName(loadingName)] = getLoadingMutation(loadingName)
    }
  })
}

/**
 * 代理loading
 * @param commit vuex commit
 * @param loading loading name
 * @param fn be proxy function
 * @param isPromise fn是否返回promise，false表示fn不返回promise， 而是以回调的形式返回
 */

function aopLoading(commit, loading, fn, isPromise = false) {
  loading = normalizeMutationName(loading)
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
  return (success, error, ...otherArg) => {
    commit(loading, true)
    success = pointer(commit, loading, success)
    error = pointer(commit, loading, error)
    fn.call(null,
        (...arg) => success.apply(null, arg),
        (...arg) => error.apply(null, arg),
        ...otherArg)
  }
}

/**
 * 生成loading action(promise式)
 * @param commit vuex commit
 * @param loading loading name
 * @param fn be proxy function
 * @returns {function(*=, *=)} proxy function
 */
function aopPromise(commit, loading, fn) {
  let showLoading = () => {
    commit(loading, true)
  }
  let hideLoading = (result) => {
    commit(loading, false)
    return result
  }
  let errorHandler = (fn) => {
    return function (error) {
      fn()
      return Promise.reject(error)
    }
  }

  return (...arg) => {
    let promise = Promise.resolve(loading)
    let chain = [showLoading, undefined, fn.bind(null, ...arg), undefined, hideLoading, errorHandler(hideLoading)]
    while (chain.length > 0) {
      promise = promise.then(chain.shift(), chain.shift())
    }
    return promise
  }
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
  let res = {}
  Object.keys(stateObj).forEach(key => {
    res[key] = stateObj[key]
    if (!totalLoadingName) {
      res[normalizeLoadingName(key)] = false
    }
  })
  if (totalLoadingName) {
    res[totalLoadingName] = false
  }
  return res
}

/**
 * 生成loading mutation集合
 * @param nameArray mutation name数组
 * @returns {Array} 返回mutation方法数组
 */
function mapLoadingMutations(nameArray = []) {
  let res = {}
  nameArray.forEach(name => {
    let fnName = normalizeMutationName(name)
    res[fnName] = getLoadingMutation(name)
  })
  return res
}


/**
 * 生成loading getters集合
 * @param nameArray loading state name array
 * @returns {{}} 返回getters方法数组
 */
function mapLoadingGetters(nameArray = []) {
  let res = {}
  normalizeMap(nameArray).forEach(item => {
    res[item['key']] = getLoadingGetter(item['val'])
  })
  return res
}

/**
 * 生成一个loading mutation
 * @param name state的属性名称
 * @returns {function(*, *)}
 */
function getLoadingMutation(name) {
  return (state, loading) => {
    state[name] = loading
  }
}


/**
 * 生成一个loading getter
 * @param val state的属性名称
 * @returns {function(*, *)}
 */
function getLoadingGetter(val) {
  return (state) => {
    return state[val]
  }
}

/**
 * 初始化变更函数名 loading -> setLoading
 * @param name
 * @returns {string}
 */
function normalizeMutationName(name) {
  name = name.replace(/^([a-zA-Z])/, (ar1) => ar1.toUpperCase())
  return `set${name}`
}

/**
 * 默认loading name为数据源state name + Loading
 * @param name
 * @returns {string}
 */
function normalizeLoadingName(name) {
  return `${name}Loading`
}

/**
 * [1,2,3] => [{key:1,val:1},{key:2,val:2},{key:3,val:3}]
 * {a:1,b:2,c:3} => [{key:a,val:1},{key:b,val:2},{key:c,val:3}]
 * @param map
 * @returns {Array}
 */
function normalizeMap(map) {
  return Array.isArray(map) ? map.map(key => {
        return {key, val: key}
      })
      : Object.keys(map).map(key => {
        return {key, val: map[key]}
      })
}

/**
 * 切点，切入loading=false的commit
 * @param commit
 * @param loading
 * @param fn
 * @returns {Function}
 */
function pointer(commit, loading, fn) {
  return function (...arg) {
    commit(loading, false)
    fn.apply(null, arg)
  }
}


export default {
  mixin,
  aopLoading
}
export {
  mixin,
  aopLoading,
  mapLoadingMutations,
  mapLoadingState,
  mapLoadingGetters
}