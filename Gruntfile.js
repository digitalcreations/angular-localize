/* global module */

module.exports = function (grunt) {
    'use strict';
    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'angular-localize.js',
                'angular-localize-spec.js'
            ]
        },
        karma: {
            unit: {
                options: {
                    files: [
                        'bower_components/angular/angular.js',
                        'bower_components/angular-sanitize/angular-sanitize.js',
                        'angular-localize.js',
                        'bower_components/angular-mocks/angular-mocks.js',
                        'angular-localize-spec.js'
                    ],
                    browsers: ['PhantomJS']
                },
                frameworks: ['jasmine'],
                reporters: ['progress', 'coverage'],
                preprocessors: {
                    'angular-localize.js': ['coverage']
                },
                singleRun: true
            }
        },
        uglify: {
            dist: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'angular-localize.min.js.map'
                },
                files: {
                    'angular-localize.min.js': ['angular-localize.js']
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-bump-build-git');
    grunt.loadNpmTasks('grunt-karma');
    grunt.registerTask('test', ['jshint', 'karma']);
    grunt.registerTask('default', ['test', 'uglify']);
};
