var path = require('path');

module.exports = function(grunt) {
  var pkg = require('./package.json');
  pkg.spm = pkg.spm || {};
  pkg.spm.sourcedir = 'tmp/src';
  pkg.spm.output = ['editor.js'];

  grunt.initConfig({
    pkg: pkg,
    jshint: {
      all: [
        'Gruntfile.js',
        'src/*.js'
      ],
      options: {
        "eqeqeq": true,
        "forin": false,
        "latedef": false,
        "newcap": true,
        "quotmark": false,
        "undef": false,
        "unused": false,
        "trailing": true,
        "lastsemic": true,
        "asi": false,
        "boss": true,
        "expr": true,
        "strict": false,
        "funcscope": true,
        "loopfunc": true,
        "multistr": true,
        "proto": false,
        "smarttabs": true,
        "shadow": false,
        "sub": true,
        "passfail": false,
        "node": true,
        "white": false
      }
    },
    connect: {
      livereload: {
        options: {
          port: 8000,
          middleware: function(connect) {
            return [
              require('connect-livereload')(),
              connect.static(path.resolve('build')),
              connect.directory(path.resolve('build'))
            ];
          }
        }
      },
    },
    watch: {
      editor: {
        files: ['src/*'],
        tasks: ['transport'],
        options: {
          livereload: true
        }
      }
    },
    generate: {
      seajs: {
        options: {
          buildir: 'tmp/src',
          header: 'define(function(require, exports, module) {',
          footer: [
            'module.exports = Editor',
            '});'
          ].join('\n')
        },
        filename: 'editor.js'
      },
      window: {
        filename: 'js/editor.js'
      }
    }
  });

  grunt.registerTask('concat', function() {
    var data = grunt.file.read('codemirror/codemirror.js');
    data = data.replace('window.CodeMirror', 'var CodeMirror');
    ['continuelist', 'xml', 'markdown'].forEach(function(name) {
      data += '\n' + grunt.file.read('codemirror/' + name + '.js');
    });
    data += '\n' + grunt.file.read('src/editor.js');
    grunt.file.write('tmp/editor.js', data);
  });

  grunt.registerMultiTask('generate', function() {
    var options = this.options({
      buildir: 'build',
      header: '(function(global) {',
      footer: 'global.Editor = Editor;\n})(this);'
    });
    var data = grunt.file.read('tmp/editor.js');
    data = [options.header, data, options.footer].join('\n');
    grunt.file.write(path.join(options.buildir, this.data.filename), data);
  });

  grunt.registerTask('copy', function() {
    var dir = 'icomoon/fonts';
    grunt.file.recurse(dir, function(fpath) {
      var fname = path.relative(dir, fpath);
      grunt.file.copy(fpath, path.join('build', 'css', 'fonts', fname));
    });
    var data = grunt.file.read('icomoon/style.css');
    data += grunt.file.read('src/paper.css');
    data += grunt.file.read('src/editor.css');
    grunt.file.write('build/css/editor.css', data);
    grunt.file.copy('docs/index.html', 'build/index.html');
    grunt.file.copy('docs/markdown.html', 'build/markdown.html');
    grunt.file.copy('docs/yue.css', 'build/yue.css');
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('transport', ['concat', 'generate:window', 'copy']);
  grunt.registerTask('server', ['transport', 'connect', 'watch']);
  grunt.registerTask('default', ['jshint', 'server']);
};
