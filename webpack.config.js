const webpack = require('webpack');
const path = require('path');

module.exports = {
	mode: 'production',
	devtool: 'inline-source-map',
	entry: [
		'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr',
		"./src/app.js"
	],
	output: {
		path: path.resolve('./dist'),
		filename: "bundle.js",
		// Need to set publicPath to local host to update changes in both local and electron
		publicPath: 'http://localhost:3000/static/'
	},
	plugins: [
		new webpack.optimize.OccurrenceOrderPlugin(),
    	new webpack.HotModuleReplacementPlugin(),
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
    	])
	]
};