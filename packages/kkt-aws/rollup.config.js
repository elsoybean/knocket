/* eslint-disable flowtype/require-valid-file-annotation */
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import { terser } from 'rollup-plugin-terser';

const plugins = [
  builtins(),
  resolve({
    preferBuiltins: true,
    browser: false,
  }),
  terser(),
  babel({
    exclude: 'node_modules/**',
    babelrc: false,
    plugins: [
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-proposal-export-default-from',
    ],
    presets: ['@babel/preset-flow'],
  }),
  commonjs({
    namedExports: {
      'kkt-battle': ['start'],
      'kkt-battle-events': ['applyToState'],
    },
  }),
  babel({
    exclude: 'node_modules/**',
    runtimeHelpers: true,
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          targets: {
            node: true,
          },
        },
      ],
    ],
  }),
  globals(),
];

export default [
  {
    input: 'src/movebot/app.js',
    plugins,
    output: {
      file: 'lib/movebot/app.js',
      format: 'cjs',
    },
  },
  {
    input: 'src/onconnect/app.js',
    plugins,
    output: {
      file: 'lib/onconnect/app.js',
      format: 'cjs',
    },
  },
  {
    input: 'src/ondisconnect/app.js',
    plugins,
    output: {
      file: 'lib/ondisconnect/app.js',
      format: 'cjs',
    },
  },
  {
    input: 'src/startbattle/app.js',
    plugins,
    output: {
      file: 'lib/startbattle/app.js',
      format: 'cjs',
    },
  },
];
