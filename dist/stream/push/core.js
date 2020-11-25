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
exports.last = exports.first = exports.some = exports.every = exports.include = exports.count = exports.reduce = exports.race = exports.concat = exports.incubate = exports.flatten = exports.partitionBy = exports.partition = exports.skipWhile = exports.skip = exports.takeWhile = exports.take = exports.remove = exports.filter = exports.map = void 0;
const type_1 = require("./type");
const partition_collector_1 = require("../common/partition-collector");
const partition_by_collector_1 = require("../common/partition-by-collector/partition-by-collector");
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
        if (0 < n) {
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
            if (0 < n) {
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
function partition(emitter, emit, expose, n) {
    if (!(0 < n)) {
        expose(() => { });
        emit(type_1.EmitType.Complete);
    }
    const collector = new partition_collector_1.PartitionCollector(n);
    emitter((t, x) => {
        switch (t) {
            case type_1.EmitType.Next:
                {
                    const [full, partition] = collector.collect(x);
                    if (full) {
                        emit(type_1.EmitType.Next, partition);
                    }
                }
                break;
            case type_1.EmitType.Complete:
                {
                    const [rest, partition] = collector.getRest();
                    if (rest) {
                        emit(type_1.EmitType.Next, partition);
                    }
                    emit(type_1.EmitType.Complete);
                }
                break;
            case type_1.EmitType.Error:
                emit(type_1.EmitType.Error, x);
        }
    }, expose);
}
exports.partition = partition;
function partitionBy(emitter, emit, expose, f) {
    const collector = new partition_by_collector_1.PartitionByCollector(f);
    emitter((t, x) => {
        switch (t) {
            case type_1.EmitType.Next:
                {
                    const [full, partition] = collector.collect(x);
                    if (full) {
                        emit(type_1.EmitType.Next, partition);
                    }
                }
                break;
            case type_1.EmitType.Complete:
                {
                    const [rest, partition] = collector.getRest();
                    if (rest) {
                        emit(type_1.EmitType.Next, partition);
                    }
                    emit(type_1.EmitType.Complete);
                }
                break;
            case type_1.EmitType.Error:
                emit(type_1.EmitType.Error, x);
        }
    }, expose);
}
exports.partitionBy = partitionBy;
function flatten(emit) {
    return (xx) => {
        for (const x of xx) {
            emit(type_1.EmitType.Next, x);
        }
    };
}
exports.flatten = flatten;
__exportStar(require("./core/group-by"), exports);
function incubate(emitter, emit, expose) {
    let exhausted = false, count = 0;
    emitter((t, x) => {
        switch (t) {
            case type_1.EmitType.Next:
                count++;
                const p = x;
                (async () => {
                    try {
                        const x = await p;
                        emit(type_1.EmitType.Next, x);
                        count--;
                        if (exhausted && 0 === count) {
                            emit(type_1.EmitType.Complete);
                        }
                    }
                    catch (e) {
                        emit(type_1.EmitType.Error, e);
                    }
                })();
                break;
            case type_1.EmitType.Complete:
                exhausted = true;
                if (0 === count) {
                    emit(type_1.EmitType.Complete);
                }
                break;
            case type_1.EmitType.Error:
                emit(type_1.EmitType.Error, x);
                break;
        }
    }, expose);
}
exports.incubate = incubate;
function concat(emitter1, emitter2, emit, expose) {
    let cancel1;
    let cancel2 = function () { };
    const cancel = function () {
        cancel1();
        cancel2();
    };
    expose(cancel);
    emitter1((t, x) => {
        switch (t) {
            case type_1.EmitType.Next:
                emit(type_1.EmitType.Next, x);
                break;
            case type_1.EmitType.Complete:
                emitter2(emit, (c) => (cancel2 = c));
                break;
            case type_1.EmitType.Error:
                emit(type_1.EmitType.Error, x);
                break;
        }
    }, (c) => (cancel1 = c));
}
exports.concat = concat;
__exportStar(require("./core/zip"), exports);
function race(ee, emit, expose) {
    let count = ee.length;
    if (!(0 < count)) {
        expose(() => { });
        emit(type_1.EmitType.Complete);
    }
    let isCancel = false;
    const cancel_list = [];
    const cancel = function () {
        isCancel = true;
        for (const c of cancel_list) {
            c();
        }
    };
    expose(cancel);
    for (const emitter of ee) {
        if (isCancel) {
            break;
        }
        emitter((t, x) => {
            switch (t) {
                case type_1.EmitType.Next:
                    emit(type_1.EmitType.Next, x);
                    break;
                case type_1.EmitType.Complete:
                    count--;
                    if (!(0 < count)) {
                        emit(type_1.EmitType.Complete);
                    }
                    break;
                case type_1.EmitType.Error:
                    emit(type_1.EmitType.Error, x);
                    break;
            }
        }, (c) => cancel_list.push(c));
    }
}
exports.race = race;
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
