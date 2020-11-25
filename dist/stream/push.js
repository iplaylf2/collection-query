"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.last = exports.first = exports.some = exports.every = exports.include = exports.count = exports.reduce = exports.race = exports.zip = exports.concatAll = exports.concat = exports.incubate = exports.groupBy = exports.flatten = exports.partitionBy = exports.partition = exports.skipWhile = exports.skip = exports.takeWhile = exports.take = exports.remove = exports.filter = exports.map = exports.forEach = exports.createFrom = exports.create = void 0;
const relay_next_1 = require("./push/relay-next");
const core = require("./push/core");
const relay_1 = require("./push/relay");
const reduce_1 = require("./push/reduce");
const type_1 = require("./push/type");
const create_1 = require("./push/create");
const create_from_1 = require("./push/create-from");
const relay_next = relay_next_1.relayNext;
exports.create = create_1.create;
exports.createFrom = create_from_1.createFrom;
function forEach(s, f) {
    s((t, x) => {
        if (t === type_1.EmitType.Next) {
            f(x);
        }
    });
}
exports.forEach = forEach;
function map(f) {
    return relay_next((emit) => core.map(emit, f));
}
exports.map = map;
function filter(f) {
    return relay_next((emit) => core.filter(emit, f));
}
exports.filter = filter;
function remove(f) {
    return relay_next((emit) => core.remove(emit, f));
}
exports.remove = remove;
function take(n) {
    return relay_next((emit) => core.take(emit, n));
}
exports.take = take;
function takeWhile(f) {
    return relay_next((emit) => core.takeWhile(emit, f));
}
exports.takeWhile = takeWhile;
function skip(n) {
    return relay_next((emit) => core.skip(emit, n));
}
exports.skip = skip;
function skipWhile(f) {
    return relay_next((emit) => core.skipWhile(emit, f));
}
exports.skipWhile = skipWhile;
function partition(n) {
    return (s) => relay_1.relay((emit, expose) => core.partition(s, emit, expose, n));
}
exports.partition = partition;
function partitionBy(f) {
    return (s) => relay_1.relay((emit, expose) => core.partitionBy(s, emit, expose, f));
}
exports.partitionBy = partitionBy;
exports.flatten = relay_next((emit) => core.flatten(emit));
function groupBy(f) {
    return (s) => relay_1.relay((emit, expose) => core.groupBy(s, emit, expose, f));
}
exports.groupBy = groupBy;
function incubate(s) {
    return relay_1.relay((emit, expose) => core.incubate(s, emit, expose));
}
exports.incubate = incubate;
function concat(s1, s2) {
    return relay_1.relay((emit, expose) => core.concat(s1, s2, emit, expose));
}
exports.concat = concat;
function concatAll([s, ...ss]) {
    return ss.reduce((r, s) => concat(r, s), s);
}
exports.concatAll = concatAll;
function zip(ss) {
    return relay_1.relay((emit, expose) => core.zip(ss, emit, expose));
}
exports.zip = zip;
function race(ss) {
    return relay_1.relay((emit, expose) => core.race(ss, emit, expose));
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
