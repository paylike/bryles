# Bryles

A highly opinionated package for compiling css (from
[Stylus](https://github.com/stylus/stylus)) in node and inlining it using
browserify.

Apart from Stylus also [Autoprefixer](https://github.com/postcss/autoprefixer)
and [clean-css](https://github.com/jakubpawlowicz/clean-css) (with the
`compress` flag) are applied.

```js
var bryles = require('bryles');
var insertCss = require('insert-css');

bryles.compile(__dirname + '/index.styl', function( err, css ){
	if (err)
		return console.error(err);

	// browser context?
	if (typeof window !== 'undefined')
		insertCss(css);
});
```

An optional argument before the callback is allowed for configuration. So far
the only option is `compress` which will minify your styles using [clean-
css](https://github.com/jakubpawlowicz/clean-css).

```js
bryles.compile(__dirname + '/index.styl', {
	compress: true,
}, cb);
```

```js
var bryles = require('bryles');
var browserify = require('browserify');

browserify()
	.transform(bryles, {
		compress: true,
	})
	.add('index.js')
	.bundle()
	.pipe(fs.createWriteStream('bundle.js'));
```

If you need anything else (sass support?) or more flexibility, send a pull
request.

You might also be interested in [brjade](https://github.com/jadejs/brjade).
