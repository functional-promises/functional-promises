import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
// import { sizeSnapshot } from 'rollup-plugin-size-snapshot'
import { uglify } from 'rollup-plugin-uglify'
// import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const input = 'src/index.js'
const globalName = 'FP'

// console.log('PATHS:', require.main.paths)

// function external(id) {
//   const isExt = id !== 'src/index.js' && !id.startsWith('./') && !id.startsWith('/')
//   console.log('external:', isExt, id)
//   return isExt
// }
function external(id) {
  return id in pkg.devDependencies || id.startsWith('@babel/runtime');
}


const cjs = [
  {
    input,
    output: { file: `dist/cjs.js`, format: 'cjs', sourcemap: true, exports: 'auto' },
    external,
    plugins: [
      babel({ exclude: /node_modules/ }),
      replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
    ],
  },
  {
    input,
    output: { file: `dist/cjs.min.js`, format: 'cjs', sourcemap: true, exports: 'auto' },
    external,
    plugins: [
      babel({ exclude: /node_modules/ }),
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      uglify(),
    ],
  },
]

const esm = [
  {
    input,
    output: { file: `dist/esm.js`, format: 'esm', sourcemap: true },
    external,
    plugins: [
      babel({
        exclude: /node_modules/,
        runtimeHelpers: true,
        plugins: [['@babel/transform-runtime', { useESModules: true }]],
      }),
      // sizeSnapshot(),
    ],
  },
  {
    input,
    output: { file: `dist/esm.min.js`, format: 'esm', sourcemap: true },
    external,
    plugins: [
      babel({
        exclude: /node_modules/,
        runtimeHelpers: true,
        plugins: [['@babel/transform-runtime', { useESModules: true }]],
      }),
      // sizeSnapshot(),
      // terser(),
    ],
  }
]


const umd = [
  {
    input,
    output: {
      file: `dist/umd.js`,
      format: 'umd',
      name: globalName,
      globals: {
        [globalName]: 'FP'
      },
      sourcemap: true,
    },
    // external: Object.keys(globals),
    plugins: [
      babel({
        exclude: /node_modules/,
        runtimeHelpers: true,
        plugins: [['@babel/transform-runtime', { useESModules: true }]],
      }),
      nodeResolve(),
      commonjs({

        include: /node_modules/,
        namedExports: {
          // './modules/errors': ['FunctionalError', 'FPInputError' ]
          // 'node_modules/react-is/index.js': ['isValidElementType'],
        },
      }),
      replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
      // sizeSnapshot(),
    ],
  },
  {
    input,
    output: {
      file: `dist/umd.min.js`,
      format: 'umd',
      name: globalName,
      globals: {
        [globalName]: 'FP'
      },
      sourcemap: true,
    },
    // external: Object.keys(globals),
    plugins: [
      babel({
        exclude: /node_modules/,
        runtimeHelpers: true,

        plugins: [['@babel/transform-runtime', { useESModules: true }]],
      }),
      nodeResolve(),
      commonjs({
        include: /node_modules/,
        namedExports: {
          // './modules/errors': ['FunctionalError', 'FPInputError' ]
          // 'node_modules/react-is/index.js': ['isValidElementType'],
        },
      }),
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      // sizeSnapshot(),
      uglify(),
    ],
  },
]

let config
switch (process.env.BUILD_ENV) {
case 'cjs':
  config = cjs
  break
case 'esm':
  config = esm
  break
case 'umd':
  config = umd
  break
default:
  config = cjs.concat(esm).concat(umd)
}

export default config
