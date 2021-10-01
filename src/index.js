const paths = require('react-scripts/config/paths');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

const defaultMinify = {
  removeComments: true,
  collapseWhitespace: true,
  removeRedundantAttributes: true,
  useShortDoctype: true,
  removeEmptyAttributes: true,
  removeStyleLinkTypeAttributes: true,
  keepClosingSlash: true,
  minifyJS: true,
  minifyCSS: true,
  minifyURLs: true,
};

function capitalize(str) {
  return str ? str[0].toUpperCase() + str.substr(1, str.length) : '';
}

const replacePlugin = (plugins, nameMatcher, newPlugin) => {
  const pluginIndex = plugins.findIndex((plugin) => {
    return plugin.constructor && plugin.constructor.name && nameMatcher(plugin.constructor.name);
  });

  if (-1 === pluginIndex) {
    return plugins;
  }

  const nextPlugins = plugins.slice(0, pluginIndex).concat(newPlugin).concat(plugins.slice(pluginIndex + 1));

  return nextPlugins;
};

function createRewire(config, env, params) {
  if (!params.entry || !params.entry.length) return; // todo: checkme!

  const isProd = env !== 'development';

  const entries = [].concat(params.entry);
  const bundles = entries.map(entry => {
    const ext = entry.split('.').pop();
    return entry.replace('.' + ext, '');
  });

  bundles.forEach((bundle, idx) => {
    paths[`app${capitalize(bundle)}Js`] = `${paths.appSrc}/${entries[idx]}`;
  });

  function getHtmlPlugin(bundle, isProd) {
    const opts = Object.assign({
      inject: true,
      template: paths.appHtml,
      // note: 2.x adds optimization with 'vendors' and 'runtime~bundle' in chunks
      chunks: ['vendors', 'runtime~' + bundle, bundle],
      filename: bundle + '.html',
    }, isProd ? { minify: Object.assign(defaultMinify, params.minify) } : {});

    return new HtmlWebpackPlugin(opts);
  }

  config.entry = bundles.reduce((acc, bundle) => {
    acc[bundle] = [].concat(
      isProd ? [] : require.resolve('react-dev-utils/webpackHotDevClient'),
      paths[`app${capitalize(bundle)}Js`]
    );
    return acc;
  }, {});

  config.output.filename = isProd ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].bundle.js';

  // initial HtmlWebpackPlugin for `index.html`
  config.plugins = replacePlugin(config.plugins, (name) => /HtmlWebpackPlugin/i.test(name), getHtmlPlugin(bundles[0], isProd));
  // HtmlWebpackPlugin for other *.html
  bundles.slice(1).forEach(bundle => {
    config.plugins.push(getHtmlPlugin(bundle, isProd));
  });

  // fix manifest, see https://github.com/timarney/react-app-rewired/issues/421
  const multiEntryManifestPlugin = new ManifestPlugin({
    fileName: 'asset-manifest.json',
    publicPath: isProd ? paths.servedPath : '/',
    generate: (seed, files, entrypoints) => {
      const manifestFiles = files.reduce((manifest, file) => {
        manifest[file.name] = file.path;
        return manifest;
      }, seed);

      const entrypointFiles = {};
      Object.keys(entrypoints).forEach(entrypoint => {
        entrypointFiles[entrypoint] = entrypoints[entrypoint].filter(fileName => !fileName.endsWith('.map'));
      });

      return {
        files: manifestFiles,
        entrypoints: entrypointFiles,
      };
    },
  });

  config.plugins = replacePlugin(config.plugins, (name) => /ManifestPlugin/i.test(name), multiEntryManifestPlugin);

  return config;
}

module.exports = createRewire;
