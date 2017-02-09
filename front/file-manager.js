var fs = require('fs'), path = require('path');
var async = require('async');
var mime = require('mime');
var express = require('express');
var optionsave = require('./file-settings');

module.exports = function(browseDir,options) {
	var app = express();
	app.use('/static', express.static('public'));
	app.set('views', __dirname + '/views/file-manager');
	app.set('view engine', 'ejs');
	/*
	browseDir = '/';
	options = {};
	*/
	options = options || {};
	options.hideDot = (options.hideDot !== false);
	options.textExtensions = [].concat(options.textExtensions || [
		'gitignore'
	]);
	options.textTypes = [].concat(options.textTypes || [
		/^[^/]+\/([^/]+\+)*json($|;|\s)/i,
		/^[^/]+\/([^/]+\+)*xml($|;|\s)/i,
		/^[^/]+\/([^/]+\+)*javascript($|;|\s)/i,
		/^charset="?utf-8"?/i
	]);
	optionsave.options = options;
	optionsave.browseDir = browseDir;
	var router_file = require('./routes/file-manager')(app);
	return app;
}
