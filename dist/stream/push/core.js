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
exports.last = exports.first = exports.some = exports.every = exports.include = exports.count = exports.reduce = exports.concat = exports.skipWhile = exports.skip = exports.takeWhile = exports.take = exports.remove = exports.filter = exports.map = void 0;
const type_1 = require("./type");
function map(emit, f) {
    return (x) => {
        emit(type_1.EmitType.Next, f(x));
    };
}
exports.map = map;
function filter(emit, f) {
    return (x) => {
        if (f(x)) {
            emit(type_1.EmitType.Next, x);
        }
    };
}
exports.filter = filter;
function remove(emit, f) {
    return (x) => {
        if (!f(x)) {
            emit(type_1.EmitType.Next, x);
        }
    };
}
exports.remove = remove;
function take(emit, n) {
    return (x) => {
        if (n > 0) {
            n--;
            emit(type_1.EmitType.Next, x);
        }
        else {
            emit(type_1.EmitType.Complete);
        }
    };
}
exports.take = take;
function takeWhile(emit, f) {
    return (x) => {
        if (f(x)) {
            emit(type_1.EmitType.Next, x);
        }
        else {
            emit(type_1.EmitType.Complete);
        }
    };
}
exports.takeWhile = takeWhile;
function skip(emit, n) {
    let skip = true;
    return (x) => {
        if (skip) {
            if (n > 0) {
                n--;
            }
            else {
                skip = false;
                emit(type_1.EmitType.Next, x);
            }
        }
        else {
            emit(type_1.EmitType.Next, x);
        }
    };
}
exports.skip = skip;
function skipWhile(emit, f) {
    let skip = true;
    return (x) => {
        if (skip) {
            if (!f(x)) {
                skip = false;
                emit(type_1.EmitType.Next, x);
            }
        }
        else {
            emit(type_1.EmitType.Next, x);
        }
    };
}
exports.skipWhile = skipWhile;
function concat(emitter1, emitter2, emit) {
    let cancel2 = function () { };
    const cancel1 = emitter1((t, x) => {
        switch (t) {
            case type_1.EmitType.Next:
                emit(type_1.EmitType.Next, x);
                break;
            case type_1.EmitType.Complete:
                cancel2 = emitter2(emit);
                break;
            case type_1.EmitType.Error:
                emit(type_1.EmitType.Error, x);
                break;
        }
    });
    const cancel = function () {
        cancel1();
        cancel2();
    };
    return cancel;
}
exports.concat = concat;
__exportStar(require("./core/zip"), exports);
__exportStar(require("./core/race"), exports);
function reduce(resolve, reject, f, v) {
    let r = v;
    return (...[t, x]) => {
        switch (t) {
            case type_1.EmitType.Next:
                r = f(r, x);
                break;
            case type_1.EmitType.Complete:
                resolve(r);
                break;
            case type_1.EmitType.Error:
                reject(x);
                break;
        }
    };
}
exports.reduce = reduce;
function count(resolve, reject) {
    let n = 0;
    return (...[t, x]) => {
        switch (t) {
            case type_1.EmitType.Next:
                n++;
                break;
            case type_1.EmitType.Complete:
                resolve(n);
                break;
            case type_1.EmitType.Error:
                reject(x);
                break;
        }
    };
}
exports.count = count;
function include(resolve, reject, v) {
    return (...[t, x]) => {
        switch (t) {
            case type_1.EmitType.Next:
                if (x === v) {
                    resolve(true);
                }
                break;
            case type_1.EmitType.Complete:
                resolve(false);
                break;
            case type_1.EmitType.Error:
                reject(x);
                break;
        }
    };
}
exports.include = include;
function every(resolve, reject, f) {
    return (...[t, x]) => {
        switch (t) {
            case type_1.EmitType.Next:
                if (!f(x)) {
                    resolve(false);
                }
                break;
            case type_1.EmitType.Complete:
                resolve(true);
                break;
            case type_1.EmitType.Error:
                reject(x);
                break;
        }
    };
}
exports.every = every;
function some(resolve, reject, f) {
    return (...[t, x]) => {
        switch (t) {
            case type_1.EmitType.Next:
                if (f(x)) {
                    resolve(true);
                }
                break;
            case type_1.EmitType.Complete:
                resolve(false);
                break;
            case type_1.EmitType.Error:
                reject(x);
                break;
        }
    };
}
exports.some = some;
function first(resolve, reject) {
    return (...[t, x]) => {
        switch (t) {
            case type_1.EmitType.Next:
                resolve(x);
                break;
            case type_1.EmitType.Complete:
                resolve();
                break;
            case type_1.EmitType.Error:
                reject(x);
                break;
        }
    };
}
exports.first = first;
function last(resolve, reject) {
    let last;
    return (...[t, x]) => {
        switch (t) {
            case type_1.EmitType.Next:
                last = x;
                break;
            case type_1.EmitType.Complete:
                resolve(last);
                break;
            case type_1.EmitType.Error:
                reject(x);
                break;
        }
    };
}
exports.last = last;