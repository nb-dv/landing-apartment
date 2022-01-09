const { src, dest, parallel, series, watch } = require("gulp"),
  sass = require("gulp-sass"),
  notify = require("gulp-notify"),
  sourcemaps = require("gulp-sourcemaps"),
  rename = require("gulp-rename"),
  autoprefixer = require("gulp-autoprefixer"),
  cleanCSS = require("gulp-clean-css"),
  browserSync = require("browser-sync").create(),
  fileinclude = require("gulp-file-include"),
  svgSprite = require("gulp-svg-sprite"),
  ttf2woff = require("gulp-ttf2woff"),
  ttf2woff2 = require("gulp-ttf2woff2"),
  del = require("del"),
  webpack = require("webpack"),
  webpackStream = require("webpack-stream"),
  uglify = require("gulp-uglify-es").default,
  htmlmin = require("gulp-htmlmin");

const htmlInclude = () => {
  return src(["./src/*.html"])
    .pipe(fileinclude({ prefix: "@", basepath: "@file" }))
    .pipe(dest("./build"))
    .pipe(browserSync.stream());
};

const styles = () => {
  return src("./src/scss/**/*.scss")
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: "expanded" }).on("error", notify.onError()))
    .pipe(rename({ suffix: ".min" }))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(cleanCSS({ level: 2 }))
    .pipe(sourcemaps.write("."))
    .pipe(dest("./build/css/"))
    .pipe(browserSync.stream());
};

const scripts = () => {
  return src("./src/js/main.js")
    .pipe(
      webpackStream({
        output: {
          filename: "main.js",
        },
        module: {
          rules: [
            {
              test: /\.m?js$/,
              exclude: /(node_modules|bower_components)/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: [["@babel/preset-env", { targets: "defaults" }]],
                },
              },
            },
          ],
        },
      })
    )
    .pipe(sourcemaps.init())
    .pipe(
      uglify().on("error", function (err) {
        console.error("WEBPACK ERROR", err);
        this.emit("end");
      })
    )
    .pipe(sourcemaps.write("."))
    .pipe(dest("./build/js"))
    .pipe(browserSync.stream());
};

const fonts = () => {
  src("./src/fonts/**.ttf").pipe(ttf2woff()).pipe(dest("./build/fonts"));
  return src("./src/fonts/**.ttf")
    .pipe(ttf2woff2())
    .pipe(dest("./build/fonts"));
};

const resources = () => {
  return src("./src/resources/**").pipe(dest("./build"));
};

const imgToBuild = () => {
  return src([
    "./src/img/**.jpg",
    "./src/img/**.png",
    "./src/img/**.jpeg",
  ]).pipe(dest("./build/img"));
};

const svgSprites = () => {
  return src("./src/img/svg/**.svg")
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg",
          },
        },
      })
    )
    .pipe(dest("./build/img"));
};

const clean = () => {
  return del(["build/**"]);
};

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: "./build",
    },
  });
  watch("./src/scss/**/*.scss", styles);
  watch("./src/*.html", htmlInclude);
  watch("./src/html/*.html", htmlInclude);
  watch("./src/img/**.jpg", imgToBuild);
  watch("./src/img/**.png", imgToBuild);
  watch("./src/img/**.jpeg", imgToBuild);
  watch("./src/img/**.svg", svgSprites);
  watch("./src/resources/**", resources);
  watch("./src/fonts/**.ttf", fonts);
  watch("./src/js/**/*.js", scripts);
};

exports.styles = styles;
exports.watchFiles = watchFiles;
exports.htmlInclude = htmlInclude;
exports.imgToBuild = imgToBuild;
exports.svgSprites = svgSprites;

// BUILD

const htmlMinify = () => {
  return src("build/**/*.html")
    .pipe(
      htmlmin({
        collapseWhitespace: true,
      })
    )
    .pipe(dest("build"));
};

const stylesBuild = () => {
  return src("./src/scss/**/*.scss")
    .pipe(sass({ outputStyle: "expanded" }).on("error", notify.onError()))
    .pipe(rename({ suffix: ".min" }))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(cleanCSS({ level: 2 }))
    .pipe(dest("./build/css/"));
};

const scriptsBuild = () => {
  return src("./src/js/main.js")
    .pipe(
      webpackStream({
        output: {
          filename: "main.js",
        },
        module: {
          rules: [
            {
              test: /\.m?js$/,
              exclude: /(node_modules|bower_components)/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: [["@babel/preset-env", { targets: "defaults" }]],
                },
              },
            },
          ],
        },
      })
    )
    .pipe(
      uglify().on("error", function (err) {
        console.error("WEBPACK ERROR", err);
        this.emit("end");
      })
    )
    .pipe(dest("./build/js"));
};

exports.default = series(
  clean,
  parallel(htmlInclude, scripts, styles, fonts, imgToBuild, svgSprites, resources),
  watchFiles
);

exports.build = series(
  clean,
  parallel(htmlInclude, scriptsBuild, fonts, imgToBuild, svgSprites, resources, htmlMinify),
  stylesBuild
);
