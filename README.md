# vuex-loading
简化vuex中异步请求，不得不维护loading state的问题，这不是一个loading ui插件，仅仅只是一个简化。

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
  }
}
const state = {
  products: []
}

const getters = {
  products (state) {
    return state.products
  }
}

const actions = {
  //aopLoading会代理api.listProduct，然后返回一个被代理的api.listProduct
  listProduct ({{commit}}) {
    let request = vxl.aopLoading(commit, 'productsLoading',api.listProduct)
    //代理函数调用的时候，会先执行commit('productsLoading',true),在异步请求执行完成后，会在成功回调和失败回调调用前执行commit('productsLoading',false)
    request((result) => {
      commit('setProducts', result)
    }, error => {
      
    })
  }
}

const mutations = {
  setProducts (state, item) {
    state.products = item
  }
}

//使用vxl.mixin将productsLoading相关操作注入state,getters,mutations中，这样我们不需要手写大堆的代码
vxl.mixin({state,getters,mutations}, ['products'])
//或者可以指定loading名字
vxl.mixin({state,getters,mutations}, [{'products':'productsLoading'}])

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

