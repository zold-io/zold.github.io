module.exports = function(grunt) {
  var buildDir = grunt.option('buildDir') ? grunt.option('buildDir') : 'build';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    replace: {
      dist: {
        options: {
          patterns: [
            {
              match: 'VERSION',
              replacement: '<%= pkg.version %>'
            }
          ]
        },
        files: [
          {
            expand: true,
            cwd: 'html',
            src: [
              '**/*'
            ],
            dest: buildDir,
            filter: 'isFile'
          }
        ]
      }
    },
    karma: {
      unit: {
        configFile: "karma.conf.js"
      }
    },
    jshint: {
      code: {
        options: {
        },
        src: ['js/**/*.js'],
      },
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: [
          'js/map.js'
        ],
        dest: buildDir + '/<%= pkg.version %>/<%= pkg.name %>.min.js'
      }
    },
    watch: {
      test : {
        files: ['js/**/*.js', 'sass/**/*.sass'],
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
          outputStyle: 'compressed',
          sourceMap: false
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
    sasslint: {
      options: {
        configFile: '.sass-lint.yml'
      },
      target: ['sass/**/*.scss']
    },
    copy: {
      dist: {
        files: [
          {
            expand: true,
            cwd: 'images',
            src: [
              '*'
            ],
            dest: buildDir + '/images',
            filter: 'isFile'
          }
        ]
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-sass-lint');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('default', ['jshint', 'copy', 'replace', 'uglify', 'sasslint', 'sass']);
  grunt.registerTask('build',   ['jshint', 'copy', 'replace', 'uglify', 'sasslint', 'sass']);
};
