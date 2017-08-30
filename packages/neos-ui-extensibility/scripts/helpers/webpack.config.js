const sharedWebPackConfig = require('@neos-project/build-essentials/src/webpack.config.js');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function(neosPackageJson) {

    return Object.assign({}, sharedWebPackConfig, {
        module: {
            loaders: sharedWebPackConfig.module.loaders.map(loaderConfig => {
                if (loaderConfig.loader === 'babel') {
                    loaderConfig.query = {
                        babelrc: false,
                        presets: [
                            require.resolve("babel-preset-react"),
                            require.resolve("babel-preset-es2015"),
                            require.resolve("babel-preset-stage-0")
                        ],
                        plugins: [
                            require.resolve("babel-plugin-transform-decorators-legacy"),
                            require.resolve("babel-plugin-transform-object-rest-spread")
                        ]
                    };
                }

                return loaderConfig;
            })
        },
        entry: {
            Plugin: './src/index.js'
        },
        plugins: [
            new ExtractTextPlugin('./[name].css', {allChunks: true})
        ],
        output: {
            path: neosPackageJson.buildTargetDirectory,
            filename: 'Plugin.js'
        },
        resolveLoader: {
            modulesDirectories: [
                // not sure if we need this path still.
                path.resolve(__dirname, '../../node_modules'),

                // this path is the correct one when building an external Neos Module.
                path.resolve(__dirname, '../../../../../node_modules')
            ]
        },
        resolve: { // override config!
            alias: {
                'react': '@neos-project/neos-ui-extensibility/src/shims/vendor/react/index',
                'react-dom': '@neos-project/neos-ui-extensibility/src/shims/vendor/react-dom/index',
                'immutable': '@neos-project/neos-ui-extensibility/src/shims/vendor/immutable/index',
                'plow-js': '@neos-project/neos-ui-extensibility/src/shims/vendor/plow-js/index',
                'classnames': '@neos-project/neos-ui-extensibility/src/shims/vendor/classnames/index',
                'react-immutable-proptypes': '@neos-project/neos-ui-extensibility/src/shims/vendor/react-immutable-proptypes/index',
                'react-redux': '@neos-project/neos-ui-extensibility/src/shims/vendor/react-redux/index',
                'redux-actions': '@neos-project/neos-ui-extensibility/src/shims/vendor/redux-actions/index',
                'redux-saga/effects': '@neos-project/neos-ui-extensibility/src/shims/vendor/redux-saga-effects/index',
                'redux-saga': '@neos-project/neos-ui-extensibility/src/shims/vendor/redux-saga/index',
                'reselect': '@neos-project/neos-ui-extensibility/src/shims/vendor/reselect/index',
                'react-css-themr': '@neos-project/neos-ui-extensibility/src/shims/vendor/react-css-themr/index',

                '@neos-project/react-ui-components': '@neos-project/neos-ui-extensibility/src/shims/neosProjectPackages/react-ui-components/index',
                '@neos-project/neos-ui-decorators': '@neos-project/neos-ui-extensibility/src/shims/neosProjectPackages/neos-ui-decorators/index',
                '@neos-project/neos-ui-i18n': '@neos-project/neos-ui-extensibility/src/shims/neosProjectPackages/neos-ui-i18n/index',
                '@neos-project/neos-ui-redux-store': '@neos-project/neos-ui-extensibility/src/shims/neosProjectPackages/neos-ui-redux-store/index'
            }
        }
    });
};
