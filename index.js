'use strict';

var fs = require('fs');
var path = require('path');
var assign = require('object-assign');
var staticModule = require('static-module');
var quote = require('quote-stream');
var through = require('through2');
var resolve = require('resolve');
var stylus = require('stylus');
var autoprefixer = require('autoprefixer');
var CC = require('clean-css');

var cc = new CC();

module.exports = transform;

transform.compile = compile;

function transform( file, opts ){
	if (/\.json$/.test(file))
		return through();

	if (!opts)
		opts = {};

	var vars = {
		__filename: file,
		__dirname: path.dirname(file),
		require: { resolve: resolver }
	};

	if (opts.vars)
		Object.keys(opts.vars).forEach(function( key ){
			vars[key] = opts.vars[key];
		});

	var sm = staticModule({
		bryles: {
			compile: staticCompile,
		},
	}, {
		vars: vars,
		varModules: { path: path },
	});

	function resolver(p){
		return resolve.sync(p, { basedir: path.dirname(file) });
	}

	return sm;

	function staticCompile( file, ropts, cb ){
		if (typeof ropts === 'function') {
			cb = ropts;
			ropts = {};
		}

		var stream = through(write, end);
		stream.push('process.nextTick(function(){(' + cb + ')(null,');

		var styles = quote();
		styles.pipe(stream);

		compile(file, assign({
			compress: opts.compress,
		}, ropts), function( err, css ){
			styles.end(css);
		});

		return stream;

		function write( buf, enc, next ){
			this.push(buf);
			next();
		}

		function end( next ){
			this.push(')})');
			this.push(null);
			sm.emit('file', file);
			next();
		}
	}
};

function compile( file, opts, cb ){
	if (typeof opts === 'function') {
		cb = opts;
		opts = {};
	} else if (!opts) {
		opts = {};
	}

	stylus(fs.readFileSync(file, 'utf8'), assign({
		filename: file,
	}, opts))
		.render(function( err, css ){
			if (err)
				return cb(err);

			css = autoprefixer.process(css).css;

			if (opts.compress)
				css = cc.minify(css).styles;

			cb(null, css);
		});
}
