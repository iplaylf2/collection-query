"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sync = exports.last = exports.first = exports.some = exports.every = exports.include = exports.count = exports.reduce = exports.race = exports.zip = exports.concatAll = exports.concat = exports.skipWhile = exports.skip = exports.takeWhile = exports.take = exports.remove = exports.filter = exports.map = void 0;
const relay_next_1 = require("./push/async/relay-next");
const core = require("./push/async/core");
const relay_1 = require("./push/async/relay");
const reduce_1 = require("./push/async/reduce");
const relay_2 = require("./push/relay");
function map(f) {
    return relay_next_1.relayNext((emit) => core.map(emit, f));
}
exports.map = map;
function filter(f) {
    return relay_next_1.relayNext((emit) => core.filter(emit, f));
}
exports.filter = filter;
function remove(f) {
    return relay_next_1.relayNext((emit) => core.remove(emit, f));
}
exports.remove = remove;
function take(n) {
    return relay_next_1.relayNext((emit) => core.take(emit, n));
}
exports.take = take;
function takeWhile(f) {
    return relay_next_1.relayNext((emit) => core.takeWhile(emit, f));
}
exports.takeWhile = takeWhile;
function skip(n) {
    return relay_next_1.relayNext((emit) => core.skip(emit, n));
}
exports.skip = skip;
function skipWhile(f) {
    return relay_next_1.relayNext((emit) => core.skipWhile(emit, f));
}
exports.skipWhile = skipWhile;
function concat(s1, s2) {
    return relay_1.relay((emit) => core.concat(s1, s2, emit));
}
exports.concat = concat;
function concatAll([s, ...ss]) {
    return ss.reduce((r, s) => concat(r, s), s);
}
exports.concatAll = concatAll;
function zip(ss) {
    return relay_1.relay((emit) => core.zip(ss, emit));
}
exports.zip = zip;
function race(ss) {
    return relay_1.relay((emit) => core.race(ss, emit));
}
exports.race = race;
function reduce(s, f, v) {
    return reduce_1.reduce((x, j) => core.reduce(x, j, f, v))(s);
}
exports.reduce = reduce;
function count(s) {
    return reduce_1.reduce(core.count)(s);
}
exports.count = count;
function include(s, v) {
    return reduce_1.reduce((x, j) => core.include(x, j, v))(s);
}
exports.include = include;
function every(s, f) {
    return reduce_1.reduce((x, j) => core.every(x, j, f))(s);
}
exports.every = every;
function some(s, f) {
    return reduce_1.reduce((x, j) => core.some(x, j, f))(s);
}
exports.some = some;
function first(s) {
    return reduce_1.reduce(core.first)(s);
}
exports.first = first;
function last(s) {
    return reduce_1.reduce(core.last)(s);
}
exports.last = last;
function sync(s) {
    return relay_2.relay(s);
}
exports.sync = sync;
