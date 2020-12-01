const { task, src, dest, parallel, series } = require("gulp");
const fs = require("fs");
const ts = require("gulp-typescript");

const package = "package";
const project = ts.createProject("tsconfig.json");
const code_dist = project.config.compilerOptions.outDir;
const attached = ["LICENSE", "README.md"];

function cleanDir(name, cb) {
  fs.rmdir(name, { recursive: true, force: true }, cb);
}

function cleanCodeDist(cb) {
  cleanDir(code_dist, cb);
}

function compile() {
  return project.src().pipe(project()).pipe(dest(code_dist));
}

function copyConfig() {
  return src("package.json").pipe(dest(code_dist));
}

task("build", series(cleanCodeDist, compile, copyConfig));

function cleanPackage(cb) {
  cleanDir(package, cb);
}

function dumpLibrary() {
  return src(`${code_dist}/**/*`).pipe(dest(package));
}

function fillPackage() {
  return src(attached).pipe(dest(package));
}

task(
  "pack",
  series(
    cleanPackage,
    parallel(series(task("build"), dumpLibrary), fillPackage)
  )
);
