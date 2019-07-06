import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import browsersync from 'rollup-plugin-browsersync'
import { uglify } from "rollup-plugin-uglify";
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';

const MODE = process.env.BUILDMODE;

export default {
  input: MODE == 'dev' ? 'js/demo.js' : 'js/main.js',
  output: {
    file: MODE == 'dev' ? 'test/demo.js' : 'dist/bundle.js',
    format: 'cjs'
  },
  watch: {
    exclude: 'node_modules/**'
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    }),
    MODE == 'prod' ? uglify() : '',
    postcss({
      extract: true,
      plugins: [
        autoprefixer()
      ],
      minimize: MODE == 'prod',
      sourceMap: MODE != 'prod'
    }),
    MODE == 'dev' ? browsersync({server: 'test'}) : ''
  ]
};
