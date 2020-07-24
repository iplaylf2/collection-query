"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.concat = exports.skipWhile = exports.skip = exports.takeWhile = exports.take = exports.remove = exports.filter = exports.map = void 0;
async function* map(iterator, f) {
    for await (const x of iterator) {
        yield await f(x);
    }
}
exports.map = map;
async function* filter(iterator, f) {
    for await (const x of iterator) {
        const p = await f(x);
        if (p) {
            yield x;
        }
    }
}
exports.filter = filter;
async function* remove(iterator, f) {
    for await (const x of iterator) {
        const p = await f(x);
        if (!p) {
            yield x;
        }
    }
}
exports.remove = remove;
async function* take(iterator, n) {
    for await (const x of iterator) {
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
async function* takeWhile(iterator, f) {
    for await (const x of iterator) {
        const p = await f(x);
        if (p) {
            yield x;
        }
        else {
            break;
        }
    }
}
exports.takeWhile = takeWhile;
async function* skip(iterator, n) {
    while (true) {
        if (n > 0) {
            const { done } = await iterator.next();
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
async function* skipWhile(iterator, f) {
    while (true) {
        const { value, done } = await iterator.next();
        const p = await f(value);
        if (done || !p) {
            break;
        }
    }
    yield* iterator;
}
exports.skipWhile = skipWhile;
async function* concat(s1, s2) {
    for await (const x of s1()) {
        yield x;
    }
    for await (const x of s2()) {
        yield x;
    }
}
exports.concat = concat;
__exportStar(require("./core/zip"), exports);
__exportStar(require("./core/race"), exports);
