/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: ['/**\n',
      ' * <%= pkg.title || pkg.name %> <%= pkg.version %>',
      ' (<%= grunt.template.today("yyyy-mm-dd") %>)',
      ' - <%= pkg.description %>\n',
      ' * <%= pkg.author.name %> - <%= pkg.homepage %>\n',
      ' * Free to use under terms of <%= pkg.license.type %> license\n',
      ' */\n\n'].join(''),
     
    
    autoprefixer: {
      single_file: {
        src: 'src/selectbox.css',
        dest: 'src/selectbox.pfx.css'
      }
    },
    concat: {
      options: {
        banner: '<%= banner %>'
      },
      css: {
        src: ['src/selectbox.pfx.css'],
        dest: 'dist/selectbox.css'
      },
      js: {
        src: ['src/selectbox.js'],
        dest: 'dist/selectbox.js',
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: 'src/selectbox.js',
        dest: 'dist/selectbox.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {}
      },
      gruntfile: {
        src: 'Gruntfile.js'
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-autoprefixer');

  // Default task.
  grunt.registerTask('default', ['jshint', 'autoprefixer', 'concat', 'uglify']);

};
