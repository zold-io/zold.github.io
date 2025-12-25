// SPDX-FileCopyrightText: Copyright (c) 2024-2025 Yegor Bugayenko
// SPDX-License-Identifier: MIT

module.exports = function(grunt) {
  var buildDir = grunt.option('buildDir') ? grunt.option('buildDir') : 'build';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    htmlbuild: {
      dist: {
        src: [ 'html/*.html' ],
        dest: buildDir + '/',
        options: {
          relative: true,
          sections: {
            layout: {
              head: 'html/_head.html',
              tail: 'html/_tail.html',
              footnotes: 'html/_footnotes.html'
            }
          },
          data: {
            version: '<%= pkg.version %>',
          },
        }
      }
    },
    eslint: {
      options: {
        configFile: '.eslintrc.json'
      },
      target: ['js/**/*.js']
    },
    jshint: {
      code: {
        options: { },
        src: ['js/**/*.js'],
      },
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: [ 'js/**/*.js' ],
        dest: buildDir + '/<%= pkg.version %>/js/<%= pkg.name %>.min.js'
      }
    },
    watch: {
      test : {
        files: ['js/**/*.js', 'sass/**/*.scss', 'html/**/*.html'],
        tasks: 'build'
      }
    },
    sass: {
      options: {
        outputStyle: 'expanded',
        errLogToConsole: true,
        check: true,
        sourceMap: true
      },
      dist: {
        options: {
          sourceMap: true,
          outputStyle: 'compressed',
          implementation: require('sass')
        },
        files: [
          {
            expand: true,
            cwd: 'sass',
            src: ['**/*.{scss,sass}'],
            dest: buildDir + '/<%= pkg.version %>/css',
            ext: '.min.css'
          }
        ]
      }
    },
    jslint: {
      main: {
        src: [
          'js/*.js',
        ],
        directives: {
          this: true,
          for: true,
          devel: true,
          white: true,
          getset: true,
          fudge: true,
          browser: true
        },
        options: {
          edition: 'latest',
          log: 'temp/jslint.log',
          jslintXml: 'temp/jslint.xml',
          errorsOnly: false,
          failOnError: true
        }
      }
    },
    stylelint: {
      options: {
        configFile: '.stylelintrc.json',
        formatter: 'string',
        failOnError: true
      },
      src: ['sass/**/*.scss']
    },
    robotstxt: {
      dist: {
        dest: 'build/'
      }
    },
    copy: {
      dist: {
        files: [
          {
            expand: true,
            cwd: 'images',
            src: [ '**/*' ],
            dest: buildDir + '/images',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'js',
            src: [ '*' ],
            dest: buildDir + '/<%= pkg.version %>/js',
            filter: 'isFile'
          }
        ]
      }
    }
  });
  grunt.loadNpmTasks('grunt-robots-txt');
  grunt.loadNpmTasks('grunt-html-build');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-stylelint');
  grunt.loadNpmTasks('grunt-replace');
  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['htmlbuild', 'robotstxt', 'copy', 'uglify', 'jshint', 'eslint', 'jslint', 'stylelint', 'sass']);
};
