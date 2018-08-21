# vuex-loading
简化vuex中异步请求，不得不维护loading state的问题,支持代理异步回调与promise

## Installing

Using npm:

```bash
$ npm install vuex-loadings -s
```

## Example


```js
//product.js
import vxl from 'vuex-loadings'
const api = {
  listProduct (cb,errorCb) {
    fetch('/api/listProduct').then((result) => {
      cb(result)
    }).catch(error => {
      errorCb(error)
    })
  },
  productDetail (id) {
    return fetch(`/api/productDetail?id=${id}`)
  }
}
const state = {
  products: [],
  productDetail: {}
}

const getters = {
  products (state) {
    return state.products
  }
}

//aopLoading(commit,loadingName, fn, isPromise)
//有两种fn可以代理，第一种fn是一个promise，第二种fn是接受两个回调函数参数->成功回调和失败回调,设置isPromise可以选择指定方式代理。
const actions = {
  listProduct ({{commit}}) {
    let request = vxl.aopLoading(commit, 'productsLoading',api.listProduct)
    request((result) => {
      commit('setProducts', result)
    }, error => {
    })
  },
  productDetail ({{commit}}) {
    let request = vxl.aopLoading(commit, 'productDetail', api.productDetail,true)
    request(1).then((result) => {
         commit('setProducts', result)
    }).catch(error => {
      console.info(error)
    })
  }
}

const mutations = {
  setProducts (state, item) {
    state.products = item
  },
  setProductDetail(state, item) {
    state.productDetail = item
  }
}

//使用vxl.mixin将productsLoading相关操作注入state,getters,mutations中，这样我们不需要手写大堆的代码
vxl.mixin({state,getters,mutations}, ['products','productDetail'])
//或者可以指定loading名字
vxl.mixin({state,getters,mutations}, [{'products':'productsLoading'},'productDetail'])

export {
  state,getters,actions,mutations
}
```
### 另一种方式

```js
import {aopLoading, mapLoadingMutations, mapLoadingState, mapLoadingGetters} from '../vuex-loading'
const api = {
  listProduct (cb,errorCb) {
    fetch('/api/listProduct').then((result) => {
      cb(result)
    }).catch(error => {
      errorCb(error)
    })
  }
}
const state = {
  //为clues绑定loading，这种方法不支持自定义loading name，默认规则是clues -> cluesLoading
  ...mapLoadingState({
    clues: {},
  })
}


const getters = {
  clues(state) {
    return state.clues
  },
  ...mapLoadingGetters(['cluesLoading'])
  //或者是自定义getters名
  ...mapLoadingGetters({'cluesLoading': 'getCluesLoading'})
}

const actions = {
  listClue({commit}) {
    //同上
    let request = aopLoading(commit, 'cluesLoading', marketApi.listClue)
    request(items => {
          commit('setClues', {items})
        },
        error => {
        })
  },
}

const mutations = {
  setClues(state, {items}) {
    state.clues = items
  },
  //绑定mutations方法
  ...mapLoadingMutations(['cluesLoading'])
}


export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
```

```vue
//product.vue
<template>
    <div>{{productsLoading}}</div>
</template>
import {mapGetters} from 'vuex'
<script>
    export default {
      computed: {
        ...mapGetters ('product', ['productsLoading'])
      }
      data () {
        return {
          
        }
      },
      
    }
</script>

```

