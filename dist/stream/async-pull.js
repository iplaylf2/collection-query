"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.last = exports.first = exports.some = exports.every = exports.include = exports.count = exports.reduce = exports.race = exports.zip = exports.concatAll = exports.concat = exports.flatten = exports.partitionBy = exports.partition = exports.skipWhile = exports.skip = exports.takeWhile = exports.take = exports.remove = exports.filter = exports.map = exports.forEach = exports.createFrom = void 0;
const core = require("./pull/async/core");
function createFrom(i) {
    return async function* () {
        for (const x of i) {
            yield x;
        }
    };
}
exports.createFrom = createFrom;
async function forEach(s, f) {
    for await (const x of s()) {
        await f(x);
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
function skip(n) {
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
function race(ss) {
    return () => core.race(ss);
}
exports.race = race;
async function reduce(s, f, v) {
    let r = v;
    for await (const x of s()) {
        r = await f(r, x);
    }
    return r;
}
exports.reduce = reduce;
async function count(s) {
    let n = 0;
    for await (const _x of s()) {
        n++;
    }
    return n;
}
exports.count = count;
async function include(s, x) {
    for await (const y of s()) {
        if (x === y) {
            return true;
        }
    }
    return false;
}
exports.include = include;
async function every(s, f) {
    for await (const x of s()) {
        const p = await f(x);
        if (!p) {
            return false;
        }
    }
    return true;
}
exports.every = every;
async function some(s, f) {
    for await (const x of s()) {
        const p = await f(x);
        if (p) {
            return true;
        }
    }
    return false;
}
exports.some = some;
async function first(s) {
    const { value } = await s().next();
    return value;
}
exports.first = first;
async function last(s) {
    let last;
    for await (const x of s()) {
        last = x;
    }
    return last;
}
exports.last = last;
