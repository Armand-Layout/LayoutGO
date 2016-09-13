var gulp = require('gulp'),
	jade = require('gulp-jade'),
	less = require('gulp-less'),
	gutil = require('gulp-util'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	fontello = require('gulp-fontello'),
	path = require('path'),
	runSequence = require('run-sequence').use(gulp),
	rimraf = require('rimraf'),
	plugins = require('gulp-load-plugins')({
		rename: {
			'gulp-live-server': 'server'
		}
	});

gulp.task('clean', function () {
	rimraf('./public', function () {
	});
});

gulp.task('jade', function () {
	gulp.src('./src/**/*.jade')
		.pipe(jade({pretty: true}))
		.on('error', function (err) {
			gutil.log(gutil.colors.yellow(err));
			if (typeof notifer !== 'undefined') {
				notifier.notify({title: 'JADE не cобран :(', message: '' + err.message + '', sound: true, wait: true});
			}
			this.emit('end');
		})
		.pipe(gulp.dest('./public/'))
		.on('end', function () {
			if (typeof notifer !== 'undefined') {
				notifier.notify({title: 'JADE cобран!', message: 'Profit!'});
			}
		});
});

gulp.task('less', function () {
	gulp.src(['./src/**/*.less'])

		.pipe(less({
			paths: ['./node_modules/bootstrap-less', '.']
		}))
		.on('error', function (err) {
			gutil.log(gutil.colors.yellow(err));
			if (typeof notifer !== 'undefined') {
				notifier.notify({title: 'LESS не cобран :(', message: '' + err.message + '', sound: true, wait: true});
			}
			this.emit('end');
		})
		.pipe(plugins.autoprefixer({
			browsers: ['> 1%', 'last 2 versions', 'firefox >= 4', 'safari 7', 'safari 8', 'IE 8', 'IE 9', 'IE 10', 'IE 11'],
			cascade: false
		}))
		.pipe(gulp.dest('./public/'))
		.on('end', function () {
			if (typeof notifer !== 'undefined') {
				notifier.notify({title: 'LESS cобран!', message: 'Profit!'});
			}
		});
});

gulp.task('image', function () {
	gulp.src('./src/**/*.*{png,jpg,gif,ico}')
		.pipe(gulp.dest('./public/'));
});

gulp.task('js', function () {

	gulp.src([
		'./src/**/*.js'
	])
	.pipe(plugins.jshint())
	.pipe(plugins.jshint.reporter('jshint-stylish'))
	.pipe(plugins.uglify({
		output: {
			'ascii_only': true
		}
	}))
	.pipe(concat('leomax-landings.js'))
	.pipe(gulp.dest('./public/js/'));

});

gulp.task('font', function () {
	return gulp.src(['./src/fonts/glyphicons/config.json'])
	.pipe(fontello({
		css: 'sty',
		font: 'fonts'
	}))
	.pipe(gulp.dest('./src/fonts/glyphicons/')).on('end', function () {
		gulp.src(['./src/fonts/glyphicons/sty/glyphicons-halflings-regular-codes.css'])
		.pipe(rename('glyphicons-halflings-regular-codes.less'))
		.pipe(gulp.dest('./src/fonts/glyphicons/sty/')).on('end', function () {
			gulp.src(['./src/fonts/glyphicons/fonts/*.*{eot,svg,ttf,woff,woff2}'])
			.pipe(gulp.dest('./public/fonts/glyphicons/')).on('end', function () {
				gulp.src(['./src/fonts/**/*.*'])
				.pipe(gulp.dest('./public/fonts/'));
			});
		});
	});
});

gulp.task('watch', function () {

	notifier = require('node-notifier');

	gulp.watch('./src/**/*.jade', ['jade'])
		.on('change', function (file) {
			gutil.log(gutil.colors.gray(file.path));
			notifier.notify({title: 'Cобираем JADE: ', message: '' + file.path + '', wait: false});
		});

	gulp.watch('./src/**/*.less', ['less'])
		.on('change', function (file) {
			gutil.log(gutil.colors.gray(file.path));
			notifier.notify({title: 'Cобираем LESS: ', message: '' + file.path + '', wait: false});
		});

	gulp.watch('./src/**/*.js', ['js'])
		.on('change', function (file) {
			gutil.log(gutil.colors.gray(file.path));
			notifier.notify({title: 'Cобираем JS: ', message: '' + file.path + '', wait: false});
		});

	gulp.watch('./src/**/*.png', ['image'])
		.on('change', function (file) {
			gutil.log(gutil.colors.gray(file.path));
			notifier.notify({title: 'Cобираем картинки: ', message: '' + file.path + '', wait: false});
		});

});

gulp.task('server', ['watch'], function () {

	notifier = require('node-notifier');

	var server = plugins.server.static('public/', 8080);
	server.start();

	gulp.watch(['./public/**/*'], function (file) {
		server.notify.apply(server, [file]);
	})

});


gulp.task('default', ['font'], function (callback) {
	runSequence('jade', 'js', 'image', 'less', callback);
});
