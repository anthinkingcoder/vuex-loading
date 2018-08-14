import babel from 'rollup-plugin-babel'
export default {
  input: './index.js',
  output: {
    file: './lib/vuex-loading.js',
    format: 'cjs'
  },
  plugins:[   babel({
    exclude: 'node_modules/**'
  })]
}