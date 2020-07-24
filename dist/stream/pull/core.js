"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zip = exports.concat = exports.skipWhile = exports.skip = exports.takeWhile = exports.take = exports.remove = exports.filter = exports.map = void 0;
function* map(iterator, f) {
    for (const x of iterator) {
        yield f(x);
    }
}
exports.map = map;
function* filter(iterator, f) {
    for (const x of iterator) {
        if (f(x)) {
            yield x;
        }
    }
}
exports.filter = filter;
function* remove(iterator, f) {
    for (const x of iterator) {
        if (!f(x)) {
            yield x;
        }
    }
}
exports.remove = remove;
function* take(iterator, n) {
    for (const x of iterator) {
        if (n > 0) {
            n--;
            yield x;
        }
        else {
            break;
        }
    }
}
exports.take = take;
function* takeWhile(iterator, f) {
    for (const x of iterator) {
        if (f(x)) {
            yield x;
        }
        else {
            break;
        }
    }
}
exports.takeWhile = takeWhile;
function* skip(iterator, n) {
    while (true) {
        if (n > 0) {
            const { done } = iterator.next();
            if (done) {
                break;
            }
            else {
                n--;
            }
        }
        else {
            break;
        }
    }
    yield* iterator;
}
exports.skip = skip;
function* skipWhile(iterator, f) {
    while (true) {
        const { value, done } = iterator.next();
        if (done || !f(value)) {
            break;
        }
    }
    yield* iterator;
}
exports.skipWhile = skipWhile;
function* concat(s1, s2) {
    for (const x of s1()) {
        yield x;
    }
    for (const x of s2()) {
        yield x;
    }
}
exports.concat = concat;
function* zip(ss) {
    if (ss.length === 0) {
        return;
    }
    const ii = ss.map((s) => s());
    while (true) {
        const iiResult = ii.map((i) => i.next());
        const done = iiResult.some(({ done }) => done);
        if (done) {
            break;
        }
        else {
            const result = iiResult.map(({ value }) => value);
            yield result;
        }
    }
}
exports.zip = zip;
