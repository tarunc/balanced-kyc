/*jshint camelcase: false */
/*global module:false */
module.exports = function(grunt) {

	grunt.initConfig({
		clean: {
			files: {
				src: ['build/', 'dist/', 'report/', 'contants/']
			}
		},

		// We're using the template here to construct an array of functions
		// that sets up Balanced so we can destroy and reconstruct the
		// entire app while running tests.
		neuter: {
			testfixtures: {
				options: {
					template: '{%= src %};'
				},
				src: ['test/support/fixtures/fixtures.js'],
				dest: 'build/test/static/js/test-fixtures.js'
			}
		},

		bower: {
			install: {
				options: {
					copy: false
				}
			}
		},

		concat: {
			options: {
				separator: ';\n'
			},
			kyc: {
				src: [
					'static/js/jquery.parseParams.js',
					'static/js/jquery.serializeObject.js',
					'static/js/kyc.js'
				],
				dest: 'build/static/js/kyc.js'
			},
			tests: {
				src: [
					'build/static/js/kyc.min.js',
					'build/test/static/js/test-fixtures.js',
					'test/support/lib/**/*.js',
					'test/unit/**/*.js',
					'test/integration/**/*.js'
				],
				dest: 'build/test/static/js/kyc.min.js'
			},
			testCss: {
				options: {
					separator: '\n\n'
				},
				src: [
					'build/static/css/root.css',
					'test/static/**/*.css'
				],
				dest: 'build/test/static/css/root.css'
			}
		},

		uglify: {
			kyc: {
				files: {
					'build/static/js/kyc.min.js': [
						'build/static/js/kyc.js'
					]
				}
			}
		},

		jshint: {
			all: [
				'Gruntfile.js',
				'static/js/**/*.js'
			],
			options: {
				jshintrc: '.jshintrc'
			},
			test: {
				files: {
					src: [
						'test/**/*.js',
						'!test/support/lib/*.*',
						'!test/support/*.js'
					],
				},
				options: {
					jshintrc: 'test/.jshintrc'
				}
			}
		},

		jsbeautifier: {
			options: {
				config: '.jsbeautifyrc'
			},
			verify: {
				options: {
					mode: 'VERIFY_ONLY'
				},
				src: [
					'Gruntfile.js',
					'static/js/**/*.js',
					'test/**/*.js',
					'!test/support/lib/*.js'
				],
			},
			update: {
				options: {
					mode: 'VERIFY_AND_WRITE'
				},
				src: [
					'Gruntfile.js',
					'static/js/**/*.js',
					'test/**/*.js',
					'!test/support/lib/*.js'
				],
			}
		},

		less: {
			development: {
				options: {
					paths: ['static/less']
				},
				files: {
					'build/static/css/root.css': 'static/less/root.less'
				}
			},

			production: {
				options: {
					paths: ['static/less'],
					yuicompress: true
				},
				files: {
					'build/static/css/root.css': 'static/less/root.less'
				}
			}
		},

		copy: {
			fonts: {
				files: [{
					cwd: 'static/fonts/',
					expand: true,
					src: ['**'],
					dest: 'build/static/css/fonts'
				}]
			},
			images: {
				files: [{
					cwd: 'static/images/',
					expand: true,
					src: ['**'],
					dest: 'build/images'
				}, {
					cwd: 'static/images/',
					expand: true,
					src: ['favicon.ico'],
					dest: 'build/'
				}]
			},
			test: {
				files: [{
					cwd: 'test/support/static/',
					expand: true,
					src: ['**'],
					dest: 'build/test/'
				}, {
					cwd: 'test/support/lib/',
					expand: true,
					src: ['**'],
					dest: 'build/test/static/js'
				}, {
					cwd: 'build/static/',
					expand: true,
					src: ['**'],
					dest: 'build/test/static/'
				}, {
					cwd: 'build/images/',
					expand: true,
					src: ['**'],
					dest: 'build/test/images/'
				}]
			}
		},

		watch: {
			js: {
				files: [
					'static/js/*'
				],
				tasks: ['concat', 'uglify'],
				options: {
					livereload: true
				}
			},
			fonts: {
				files: [
					'static/fonts/*'
				],
				tasks: ['copy:fonts'],
				options: {
					livereload: true
				}
			},
			images: {
				files: [
					'static/images/*'
				],
				tasks: ['copy:images'],
				options: {
					livereload: true
				}
			},
			css: {
				files: [
					'static/less/*'
				],
				tasks: ['less:development'],
				options: {
					livereload: true
				}
			},
			templates: {
				files: [
					'templates/*'
				],
				tasks: ['tasty_swig:development'],
				options: {
					livereload: true
				}
			}
		},

		open: {
			dev: {
				path: 'http://localhost:8080/kyc.html'
			},
		},

		connect: {
			server: {
				options: {
					port: 8080,
					base: './build/'
				}
			},
			test: {
				options: {
					port: 8080,
					base: './build/test'
				}
			}
		},

		qunit: {
			all: {
				options: {
					urls: [
						'http://localhost:8080/kyc.html?redirect_uri=foo'
					]
				}
			}
		},

		hashres: {
			options: {
				fileNameFormat: '${name}-${hash}.${ext}'
			},
			css: {
				src: ['build/static/css/*.css'],
				dest: ['build/**/*.html']
			},
			js: {
				src: ['build/static/js/*.js'],
				dest: ['build/**/*.html']
			},
			images: {
				src: ['build/images/**/*.png', 'build/images/**/*.jpg', 'build/images/**/*.jpeg', 'build/static/images/**/*.png'],
				dest: ['build/**/*.html', 'build/static/css/*.css', 'build/static/js/*.js']
			},
			fonts: {
				src: ['build/static/fonts/**/*'],
				dest: ['build/**/*.html', 'build/static/css/*.css', 'build/static/js/*.js']
			}
		},

		img: {
			crush_them: {
				src: ['build/images/**/*.png', 'build/static/images/**/*.png']
			}
		},

		tasty_swig: {
			options: {
				extension: '.html',
				dest: 'build/',
				src: ['templates/**/*.html', 'templates/**.html', '!templates/partials/**/*.html'],
			},

			development: {
				production: false,
				dest: 'build/',
				src: ['templates/**/*.html', 'templates/**.html', '!templates/partials/**/*.html'],
			},
			production: {
				production: true,
				dest: 'build/',
				src: ['templates/**/*.html', 'templates/**.html', '!templates/partials/**/*.html'],
			},
			test: {
				context: {
					TEST: true
				},
				production: true,
				dest: 'build/test/',
				src: ['templates/**/*.html', 'templates/**.html', '!templates/partials/**/*.html'],
			}
		},

		s3: {
			options: {
				access: 'public-read',
				region: 'us-west-1',
				gzip: true,
				gzipExclude: ['.jpg', '.jpeg', '.png', '.ico', '.gif']
			},
			previewCached: {
				options: {
					bucket: 'balanced-kyc-preview',
				},
				headers: {
					'Cache-Control': 'public, max-age=86400'
				},
				upload: [{
					src: 'build/images/**/*',
					dest: 'images/',
					rel: 'build/images'
				}, {
					src: 'build/static/**/*',
					dest: 'static/',
					rel: 'build/static'
				}, {
					src: 'build/*.{xml,txt,ico}',
					dest: '',
					rel: 'build'
				}]
			},
			previewUncached: {
				options: {
					bucket: 'balanced-kyc-preview',
				},
				headers: {
					'Cache-Control': 'max-age=60',
					'Content-Type': 'text/html'
				},
				upload: [{
					src: 'build/*',
					dest: '',
					rel: 'build'
				}]
			},
			productionCached: {
				options: {
					bucket: 'balanced-kyc',
				},
				headers: {
					'Cache-Control': 'public, max-age=86400'
				},
				upload: [{
					src: 'build/images/**/*',
					dest: 'images/',
					rel: 'build/images'
				}, {
					src: 'build/static/**/*',
					dest: 'static/',
					rel: 'build/static'
				}, {
					src: 'build/*.{xml,txt,ico}',
					dest: '',
					rel: 'build'
				}]
			},
			productionUncached: {
				options: {
					bucket: 'balanced-kyc',
				},
				headers: {
					'Cache-Control': 'max-age=60',
					'Content-Type': 'text/html'
				},
				upload: [{
					src: 'build/*',
					dest: '',
					rel: 'build'
				}]
			}
		}
	});

	// Loads all grunt based plugins
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	// Clean task
	grunt.registerMultiTask('clean', 'Deletes files', function() {
		this.files.forEach(function(file) {
			file.orig.src.forEach(function(f) {
				if (grunt.file.exists(f)) {
					grunt.file.delete(f);
				}
			});
		});
	});

	// Subtasks
	grunt.registerTask('_devBuild', ['clean', 'concat:kyc', 'uglify', 'less:development', 'copy:fonts', 'copy:images', 'tasty_swig:development']);
	grunt.registerTask('_prodBuild', ['clean', 'concat:kyc', 'uglify', 'less:production', 'copy:fonts', 'copy:images', 'tasty_swig:production', 'img']);

	grunt.registerTask('format', ['jsbeautifier:update']);
	grunt.registerTask('verify', ['jshint:all', 'jsbeautifier:verify']);

	// Uploads to s3. Requires environment variables to be set if the bucket
	// you're uploading to doesn't have public write access.
	grunt.registerTask('deploy', ['build', 's3:productionCached', 's3:productionUncached']);
	grunt.registerTask('deployPreview', ['build', 's3:previewCached', 's3:previewUncached']);

	grunt.registerTask('build', ['_prodBuild', 'hashres']);
	grunt.registerTask('dev', ['_devBuild', 'connect:server', 'open', 'watch']);

	grunt.registerTask('test', ['_devBuild', 'tasty_swig:test', 'neuter:testfixtures', 'concat:tests', 'concat:testCss', 'connect:test', 'qunit']);

	// The Default task
	grunt.registerTask('default', ['dev']);
};
