# vuex-loading
Simplify vuex loading state management

## Installing

Using npm:

```bash
$ npm install vuex-loadings -s
```
## Know
Simplify vuex loading state management need two step:
1.use ```vxl.aopLoading(commit,loadingName,fn,isPromise)``` to proxy fn, simplify loading state change                              
2.use ```vxl.mixin({state,getters,mutations},stateObj)``` to automatic set loading state,loading getter,loading mutation for stateObj

## Example
```js
//product.js
import vxl from 'vuex-loadings'
const api = {
  //callback
  listProduct (cb,errorCb) {
    fetch('/api/listProduct').then((result) => {
      cb(result)
    }).catch(error => {
      errorCb(error)
    })
  },
  //promise
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

//vxl.aopLoading(commit, loadingName, fn, isPromise)
//isPromise = true, fn must be a promise
// isPromise = false, fn must be receiver two argument, cb and errorCb function
const actions = {
  listProduct ({{commit}}) {
    //proxy callback
    let request = vxl.aopLoading(commit, 'productsLoading',api.listProduct)
    request((result) => {
      commit('setProducts', result)
    }, error => {
    })
    //it equal
    //commit('setProductsLoading',true)
    //api.listProduct((result) => {
    //        commit('setProductsLoading',false)
    //        commit('setProducts', result)
    //      }, error => {
    //        commit('setProductsLoading',false)
    //      })
  },
  productDetail ({{commit}}) {
    //proxy promise
    let request = vxl.aopLoading(commit, 'productDetail', api.productDetail,true)
    request(1).then((result) => {
         commit('setProducts', result)
    }).catch(error => {
      console.info(error)
    })
    
    //it equal
    //commit('setProductDetailLoading',true)
    //api.productDetail(1)
    //      .then(result => {
    //            commit('setProductDetailLoading',false)
    //            commit('setProducts', result)})    
    //      .catch(error => {
    //            commit('setProductDetailLoading',false)
    //            console.info(error)
    //            })
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

//it will be set loading state,loading getter,loading mutation for products,productDetail
//default loading name is productsLoading,productDetailLoading
vxl.mixin({state,getters,mutations}, ['products','productDetail'])

//or custom loading state name
vxl.mixin({state,getters,mutations}, [{'products':'productsLoading'},'productDetail'])

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
```
### other way

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
  ...mapLoadingState({
    clues: {},
  })
  //it will be -> {
  // clues: {}
  // cluesLoading: {}
  //}
}


const getters = {
  clues(state) {
    return state.clues
  },
  
  // set getter function for cluesLoading
  ...mapLoadingGetters(['cluesLoading'])
  //or custom getter function name
  ...mapLoadingGetters({'cluesLoading': 'getCluesLoading'})
}

const actions = {
  listClue({commit}) {
    //the same
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
  //set mutation function for cluesLoading
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

