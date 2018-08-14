/**
 * 生成loading action
 * @param commit
 * @param loading
 * @param fn
 * @returns {function(*=, *=)}
 */
function aopLoading(commit, loading, fn) {
  loading = normalizeMutationName(loading)
  return (success, error, ...otherArg) => {
    commit(loading, true)
    success = pointer(commit, loading, success)
    error = pointer(commit, loading, error)
    fn.call(null,
        (...arg) => success.apply(null, arg),
        (...arg) => error.apply(null, arg),
        otherArg)
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
 * 生成loading mutation
 * @param nameArray mutation name数组
 * @returns {Array} 返回mutation方法数组
 */
function mapLoadingMutation(nameArray = []) {
  let res = {}
  nameArray.forEach(name => {
    let fnName = normalizeMutationName(name)
    res[fnName] = (state, loading) => {
      state[name] = loading
    }
  })
  return res
}

/**
 * 生成loading getters
 * @param nameArray loading state name array
 * @returns {{}}
 */
function mapLoadingGetter(nameArray = []) {
  let res = {}
  normalizeMap(nameArray).forEach(item => {
    res[item['key']] = (state) => {
      return state[item['val']]
    }
  })
  return res
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

export {
  aopLoading,
  mapLoadingMutation,
  mapLoadingState,
  mapLoadingGetter
}