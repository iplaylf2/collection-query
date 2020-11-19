"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.last = exports.first = exports.some = exports.every = exports.include = exports.count = exports.reduce = exports.zip = exports.concatAll = exports.concat = exports.flatten = exports.partitionBy = exports.partition = exports.skipWhile = exports.skip = exports.takeWhile = exports.take = exports.remove = exports.filter = exports.map = exports.forEach = exports.createFrom = void 0;
const core = require("./pull/core");
function createFrom(i) {
    return function* () {
        for (const x of i) {
            yield x;
        }
    };
}
exports.createFrom = createFrom;
function forEach(s, f) {
    for (const x of s()) {
        f(x);
    }
}
exports.forEach = forEach;
function map(f) {
    return (s) => () => core.map(s(), f);
}
exports.map = map;
function filter(f) {
    return (s) => () => core.filter(s(), f);
}
exports.filter = filter;
function remove(f) {
    return (s) => () => core.remove(s(), f);
}
exports.remove = remove;
function take(n) {
    return (s) => () => core.take(s(), n);
}
exports.take = take;
function takeWhile(f) {
    return (s) => () => core.takeWhile(s(), f);
}
exports.takeWhile = takeWhile;
function* skip(n) {
    return (s) => () => core.skip(s(), n);
}
exports.skip = skip;
function skipWhile(f) {
    return (s) => () => core.skipWhile(s(), f);
}
exports.skipWhile = skipWhile;
function partition(n) {
    return (s) => () => core.partition(s(), n);
}
exports.partition = partition;
function partitionBy(f) {
    return (s) => () => core.partitionBy(s(), f);
}
exports.partitionBy = partitionBy;
function flatten(s) {
    return () => core.flatten(s());
}
exports.flatten = flatten;
function concat(s1, s2) {
    return () => core.concat(s1, s2);
}
exports.concat = concat;
function concatAll([s, ...ss]) {
    return ss.reduce((r, s) => concat(r, s), s);
}
exports.concatAll = concatAll;
function zip(ss) {
    return () => core.zip(ss);
}
exports.zip = zip;
function reduce(s, f, v) {
    let r = v;
    for (const x of s()) {
        r = f(r, x);
    }
    return r;
}
exports.reduce = reduce;
function count(s) {
    let n = 0;
    for (const _x of s()) {
        n++;
    }
    return n;
}
exports.count = count;
function include(s, x) {
    for (const y of s()) {
        if (x === y) {
            return true;
        }
    }
    return false;
}
exports.include = include;
function every(s, f) {
    for (const x of s()) {
        if (!f(x)) {
            return false;
        }
    }
    return true;
}
exports.every = every;
function some(s, f) {
    for (const x of s()) {
        if (f(x)) {
            return true;
        }
    }
    return false;
}
exports.some = some;
function first(s) {
    const [value] = s();
    return value;
}
exports.first = first;
function last(s) {
    let last;
    for (const x of s()) {
        last = x;
    }
    return last;
}
exports.last = last;
