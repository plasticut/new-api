module.exports = function(grunt) {

    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);


    grunt.initConfig({

        pkg: grunt.file.readJSON('./package.json'),

        server: {
            host: 'localhost',
            docs: 9090
        },

        paths: {
            coverage: 'coverage',
            docs: 'docs'
        },

        jshint: {
            options: {
                reporter: 'node_modules/jshint-stylish/stylish.js',
                jshintrc: true
            },
            dev: {
                src: [
                    'src/**/*.js',
                    'test/**/*.js',
                    'index.js',
                    'Gruntfile.js'
                ]
            }
        },

        copy: {
            coverage: {
                files: [
                    {
                        expand: true,
                        filter: 'isFile',
                        dest: '<%= paths.coverage %>/test',
                        cwd: 'test',
                        src: [
                            '**/*.js'
                        ]
                    }
                ]
            }
        },

        watch: {
            options: {
                nospawn: true
            },
            scripts: {
                files: [
                    'src/app/**/*.js'
                ],
                tasks: [
                    'jshint',
                    'notify:jshint'
                ]
            }
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    colors: true,
                    timeout: 5000,
                    debug: true,
                    growl: false
                    // require: '<%= paths.coverage %>/**/*.js'
                },
                src: [
                    'test/cases/**/*.js'
                ]
            },
            testcov: {
                options: {
                    reporter: 'spec',
                    colors: true,
                    timeout: 5000,
                    debug: true,
                    growl: false
                    // require: '<%= paths.coverage %>/**/*.js'
                },
                src: [
                    '<%= paths.coverage %>/test/cases/**/*.js'
                ]
            },
            coverage: {
                options: {
                    reporter: 'html-cov',
                    quiet: true,
                    captureFile: '<%= paths.coverage %>/test/coverage.html'
                },
                src: [
                    '<%= paths.coverage %>/test/cases/**/*.js'
                ]
            }
        },

        blanket: {
            coverage: {
                options: {
                },
                files: {
                    '<%= paths.coverage %>/src': 'src/'
                }
            }
        },

        /*

            UTILS

        */
        notify_hooks: {
            options: {
                enabled: true,
                max_jshint_notifications: 5 // maximum number of notifications from jshint output
            }
        },

        notify: {
            jshint: {
                options: {
                    message: 'JS: ok!'
                }
            }
        },

        clean: {
            docs: ['<%= paths.docs %>'],
            coverage: ['<%= paths.coverage %>']
        },

        connect: {
            docs: {
                options: {
                    hostname: '<%= server.host %>',
                    port: '<%= server.docs %>',
                    open: true,
                    keepalive: true,
                    base: [
                        'docs'
                    ]
                }
            }
        },

        jsdoc: {
            docs: {
                src: ['src/**/*.js', 'test/**/*.js'],
                options: {
                    destination: 'docs'
                }
            }
        }
    });

    /*
        Main tasks
    */
    grunt.registerTask('default', [
        'jshint:dev',
        'watch:scripts'
    ]);

    grunt.registerTask('test', [
        'clean:coverage',
        'blanket',
        'copy:coverage',
        'mochaTest:testcov',
        'mochaTest:coverage'
    ]);

    grunt.registerTask('test-no-cov', [
        'mochaTest:test'
    ]);

    grunt.registerTask('docs', [
        'jsdoc',
        'connect:docs'
    ]);

    // grunt.registerTask('dist', [
    //     'jshint',
    //     'clean:dist',
    //     'copy:dist'
    // ]);


    grunt.task.run('notify_hooks');
};
