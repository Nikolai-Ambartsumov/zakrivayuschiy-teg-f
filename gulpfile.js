const gulp = require('gulp');
const concat = require('gulp-concat-css');
const plumber = require('gulp-plumber');
const del = require('del');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mediaquery = require('postcss-combine-media-query');
const cssnano = require('cssnano');
const replace = require('gulp-replace');
const htmlMinify = require('html-minifier');

// Локальный сервер
function serve() {
  browserSync.init({
    server: {
      baseDir: './dist',
    },
  });
}

// Минификация HTML и замена путей
function html() {
  const minifyOptions = {
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortClassName: true,
    useShortDoctype: true,
    collapseWhitespace: true,
    minifyCSS: true,
    keepClosingSlash: true,
  };

  return gulp.src('src/**/*.html')
    .pipe(plumber())
    // Замена всех ссылок на CSS на bundle.css
    .pipe(replace(/<link rel="stylesheet" href=".*?\.css" \/>/g, '<link rel="stylesheet" href="bundle.css">'))
    // Минификация HTML
    .on('data', function (file) {
      const bufferFile = Buffer.from(htmlMinify.minify(file.contents.toString(), minifyOptions));
      file.contents = bufferFile;
    })
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.reload({ stream: true }));
}

// Обработка CSS
function css() {
  const plugins = [
    autoprefixer(),
    mediaquery(),
    cssnano({
      preset: ['default', { discardComments: { removeAll: true } }],
    }),
  ];
  return gulp.src('src/**/*.css')
    .pipe(plumber())
    .pipe(concat('bundle.css'))
    .pipe(postcss(plugins))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.reload({ stream: true }));
}

// Копирование изображений
function images() {
  return gulp.src('src/images/**/*.{jpg,png,svg,gif,ico,webp,avif}') // Берём все изображения из src/images
    .pipe(gulp.dest('dist/images')) // Копируем их в dist/images
    .pipe(browserSync.reload({ stream: true })); // Обновляем сервер
}


// Очистка папки dist
function clean() {
  return del('dist');
}

// Отслеживание изменений
function watchFiles() {
  gulp.watch(['src/**/*.html'], html);
  gulp.watch(['src/**/*.css'], css);
  gulp.watch(['src/images/**/*.{jpg,png,svg,gif,ico,webp,avif}'], images);
}

// Основные задачи
const build = gulp.series(clean, gulp.parallel(html, css, images));
const watchapp = gulp.parallel(build, watchFiles, serve);

// Экспорт задач
exports.html = html;
exports.css = css;
exports.images = images;
exports.clean = clean;
exports.build = build;
exports.watchapp = watchapp;
exports.serve = serve;
exports.default = watchapp;
