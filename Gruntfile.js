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
					template: "{%= src %} ;"
				},
				src: ['test/support/fixtures/fixtures.js'],
				dest: 'build/test/js/test-fixtures.js'
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
					'test/lib/*.js',
					'test/unit/**/*.js',
					'test/integration/**/*.js'
				],
				dest: 'build/test/js/tests.js'
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

		karma: {
			unit: {
				configFile: 'karma.conf.js'
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
					dest: 'build/test/js'
				}, {
					src: 'test/support/testconfig.js',
					dest: 'build/test/js/testconfig.js'
				}, {
					src: 'test/support/testenv.js',
					dest: 'build/test/js/testenv.js'
				}, {
					src: 'test/support/fixturebrowserconfig.js',
					dest: 'build/test/js/fixturebrowserconfig.js'
				}]
			}
		},

		watch: {
			js: {
				files: [
					'static/js/*'
				],
				tasks: ['concat'],
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
	grunt.registerTask('_devBuild', ['clean', 'concat', 'less:development', 'copy', 'tasty_swig:production']);
	grunt.registerTask('_prodBuild', ['clean', 'concat', 'uglify', 'less:production', 'copy', 'tasty_swig:development']);

	grunt.registerTask('format', ['jsbeautifier:update']);
	grunt.registerTask('verify', ['jshint', 'jsbeautifier:verify']);

	grunt.registerTask('build', ['_prodBuild', 'hashres']);
	grunt.registerTask('dev', ['_devBuild', 'connect', 'open', 'watch']);

	grunt.registerTask('test', ['_devBuild', 'neuter:testfixtures', 'karma']);

	// The Default task
	grunt.registerTask('default', ['dev']);
};
