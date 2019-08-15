/* eslint-disable flowtype/require-valid-file-annotation */
import babel from 'rollup-plugin-babel';
import flow from 'rollup-plugin-flow';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';

export default [
  {
    input: 'src/index.js',
    plugins: [
      flow(),
      babel({
        exclude: 'node_modules/**',
      }),
    ],
    output: {
      file: 'lib/index.js',
      format: 'cjs',
    },
  },
  {
    input: 'src/server.js',
    plugins: [
      flow(),
      babel({
        exclude: 'node_modules/**',
      }),
    ],
    output: {
      file: 'lib/server.js',
      format: 'cjs',
    },
  },
  {
    input: 'src/train.js',
    plugins: [
      flow(),
      babel({
        exclude: 'node_modules/**',
      }),
    ],
    output: {
      file: 'lib/train.js',
      format: 'cjs',
    },
  },
  {
    input: 'src/trial.js',
    plugins: [
      flow(),
      babel({
        exclude: 'node_modules/**',
      }),
    ],
    output: {
      file: 'lib/trial.js',
      format: 'cjs',
    },
  },
  {
    input: 'src/webui/index.js',
    plugins: [
      resolve({
        preferBuiltins: true,
        browser: true,
      }),
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        plugins: [
          '@babel/plugin-syntax-dynamic-import',
          '@babel/plugin-proposal-export-default-from',
        ],
        presets: ['@babel/preset-react', '@babel/preset-flow'],
      }),
      commonjs({
        namedExports: {
          react: ['useState', 'useEffect', 'useRef'],
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
              targets: 'defaults',
            },
          ],
        ],
      }),
      globals(),
    ],
    output: {
      file: 'lib/webui/bundle.js',
      format: 'es',
    },
  },
];
