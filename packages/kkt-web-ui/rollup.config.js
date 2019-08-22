/* eslint-disable flowtype/require-valid-file-annotation */
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';

export default [
  {
    input: 'src/index.js',
    plugins: [
      builtins(),
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
              targets: 'defaults',
            },
          ],
        ],
      }),
      globals(),
    ],
    output: {
      file: 'lib/bundle.js',
      format: 'es',
    },
  },
];
