const webpack = require('webpack');

module.exports = {
    mode: 'production',
	output:{
	  path: './build',
	  publicPath: './build',
	  filename: 'bundle.js'
	},
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.DefinePlugin({
          'process.env': {
            'NODE_ENV': "'production'"
          }
        }),
    //externalsPlugin added to allow Webpack to compile native electron modules
		new webpack.ExternalsPlugin('commonjs', [
        		'desktop-capturer',
        		'electron',
        		'ipc',
        		'ipc-renderer',
        		'native-image',
        		'remote',
            		'web-frame',
            		'clipboard',
        		'crash-reporter',
        		'screen',
        		'shell'
        	]),
        new webpack.optimize.UglifyJsPlugin({
          compressor: {
            warnings: false
          }
        })
	]
};
