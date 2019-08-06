/**
 * Dependencies
 */
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const {terser} = require('rollup-plugin-terser');
const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');

/**
 * @const isProduction is a argument in "npm run build" script
 * from package.json and is used for rollup-js config conditionals.
 */
const isProduction = process.env.production ? true : false;

/**
 * Gets necessary package.json's properties for.
 */
const {
  input,
  output,
  cssOutput,
  mainNodeModulesPath,
  useBrowserSync,
  browserSyncServer,
  proxy,
  server,
} = require('./package.json');

/**
 * Postcss Options
 */
const postcssOptions = {
  extract: cssOutput,
  plugins: [autoprefixer()],
  minimize: isProduction,
  sourceMap: !isProduction,
  use: [
    ['sass', {
      includePaths: [mainNodeModulesPath],
    }],
  ],
};

/**
 * Babel Options
 */
const babelOptions = {
  babelrc: false,
  presets: [
    ['@babel/env', {modules: false}],
  ],
  exclude: `${mainNodeModulesPath}/**`,
};

/**
 * Use BrowserSync
 */
let browserSync = undefined;

if (useBrowserSync) {
  browserSync = require('browser-sync').create();

  /**
   * BrowserSync Options
   */
  const browserSyncOptions = {
    ui: false,
    notify: false,
    watch: true,
    files: [output],
  };

  switch (browserSyncServer) {
    case 'Use proxy':
      browserSyncOptions.proxy = proxy;
      break;

    case 'Use server':
      browserSyncOptions.server = server;
      break;
  }

  /**
   * Start browser-sync
   */
  if (!isProduction) browserSync.init(browserSyncOptions);
}

/**
 * Rollup-js config
 */
module.exports = {
  input: input,
  output: {
    file: output,
    format: 'es',
    sourcemap: !isProduction,
  },
  watch: {exclude: `${mainNodeModulesPath}/**`},
  plugins: [
    resolve(),
    commonjs(),
    babel(babelOptions),
     isProduction ? terser() : '',
     postcss(postcssOptions),
  ],
};
