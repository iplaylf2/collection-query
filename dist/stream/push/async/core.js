"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.last = exports.first = exports.some = exports.every = exports.include = exports.count = exports.reduce = exports.race = exports.zip = exports.concat = exports.incubate = exports.flatten = exports.partitionBy = exports.partition = exports.skipWhile = exports.skip = exports.takeWhile = exports.take = exports.remove = exports.filter = exports.map = void 0;
const type_1 = require("../type");
const partition_collector_1 = require("../../common/partition-collector");
const async_partition_by_collector_1 = require("../../common/partition-by-collector/async-partition-by-collector");
const zip_handler_1 = require("../../common/async/zip-handler");
const race_handler_1 = require("../../common/async/race-handler");
const controlled_iterator_1 = require("../../common/async/controlled-iterator");
function map(emit, f) {
    return async (x) => {
        const r = await f(x);
        await emit(type_1.EmitType.Next, r);
    };
}
exports.map = map;
function filter(emit, f) {
    return async (x) => {
        const p = await f(x);
        if (p) {
            await emit(type_1.EmitType.Next, x);
        }
    };
}
exports.filter = filter;
function remove(emit, f) {
    return async (x) => {
        const p = await f(x);
        if (!p) {
            await emit(type_1.EmitType.Next, x);
        }
    };
}
exports.remove = remove;
function take(emit, n) {
    return async (x) => {
        if (0 < n) {
            n--;
            await emit(type_1.EmitType.Next, x);
        }
        else {
            emit(type_1.EmitType.Complete);
        }
    };
}
exports.take = take;
function takeWhile(emit, f) {
    return async (x) => {
        const p = await f(x);
        if (p) {
            await emit(type_1.EmitType.Next, x);
        }
        else {
            emit(type_1.EmitType.Complete);
        }
    };
}
exports.takeWhile = takeWhile;
function skip(emit, n) {
    let skip = true;
    return async (x) => {
        if (skip) {
            if (0 < n) {
                n--;
            }
            else {
                skip = false;
                await emit(type_1.EmitType.Next, x);
            }
        }
        else {
            await emit(type_1.EmitType.Next, x);
        }
    };
}
exports.skip = skip;
function skipWhile(emit, f) {
    let skip = true;
    return async (x) => {
        if (skip) {
            const p = await f(x);
            if (!p) {
                skip = false;
                await emit(type_1.EmitType.Next, x);
            }
        }
        else {
            await emit(type_1.EmitType.Next, x);
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
    emitter(async (t, x) => {
        switch (t) {
            case type_1.EmitType.Next:
                {
                    const [full, partition] = collector.collect(x);
                    if (full) {
                        await emit(type_1.EmitType.Next, partition);
                    }
                }
                break;
            case type_1.EmitType.Complete:
                {
                    const [rest, partition] = collector.getRest();
                    if (rest) {
                        await emit(type_1.EmitType.Next, partition);
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
    const collector = new async_partition_by_collector_1.AsyncPartitionByCollector(f);
    emitter(async (t, x) => {
        switch (t) {
            case type_1.EmitType.Next:
                {
                    const [full, partition] = await collector.collect(x);
                    if (full) {
                        await emit(type_1.EmitType.Next, partition);
                    }
                }
                break;
            case type_1.EmitType.Complete:
                {
                    const [rest, partition] = collector.getRest();
                    if (rest) {
                        await emit(type_1.EmitType.Next, partition);
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
    return async (xx) => {
        for (const x of xx) {
            await emit(type_1.EmitType.Next, x);
        }
    };
}
exports.flatten = flatten;
function incubate(emitter, emit, expose) {
    let exhausted = false, count = 0;
    emitter(async (t, x) => {
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
    emitter1(async (t, x) => {
        switch (t) {
            case type_1.EmitType.Next:
                await emit(type_1.EmitType.Next, x);
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
function zip(ee, emit, expose) {
    const total = ee.length;
    if (!(0 < total)) {
        expose(() => { });
        emit(type_1.EmitType.Complete);
    }
    const handler = new zip_handler_1.ZipHandler(total);
    const cancel_list = [];
    const cancel = function () {
        for (const c of cancel_list) {
            c();
        }
        handler.end();
    };
    expose(cancel);
    let index = 0;
    for (const emitter of ee) {
        if (handler.status !== controlled_iterator_1.IteratorStatus.Running) {
            break;
        }
        const _index = index;
        emitter(async (t, x) => {
            switch (t) {
                case type_1.EmitType.Next:
                    await handler.zip(_index, x);
                    break;
                case type_1.EmitType.Complete:
                    handler.end();
                    break;
                case type_1.EmitType.Error:
                    handler.crash(x);
                    break;
            }
        }, (c) => cancel_list.push(c));
        index++;
    }
    (async function () {
        try {
            for await (const x of handler) {
                await emit(type_1.EmitType.Next, x);
            }
            emit(type_1.EmitType.Complete);
        }
        catch (e) {
            emit(type_1.EmitType.Error, e);
        }
    })();
}
exports.zip = zip;
function race(ee, emit, expose) {
    const total = ee.length;
    if (!(0 < total)) {
        expose(() => { });
        emit(type_1.EmitType.Complete);
    }
    const handler = new race_handler_1.RaceHandler(total);
    const cancel_list = [];
    const cancel = function () {
        for (const c of cancel_list) {
            c();
        }
        handler.end();
    };
    expose(cancel);
    for (const emitter of ee) {
        if (handler.status !== controlled_iterator_1.IteratorStatus.Running) {
            break;
        }
        emitter(async (t, x) => {
            switch (t) {
                case type_1.EmitType.Next:
                    await handler.race(x);
                    break;
                case type_1.EmitType.Complete:
                    handler.leave();
                    break;
                case type_1.EmitType.Error:
                    handler.crash(x);
                    break;
            }
        }, (c) => cancel_list.push(c));
    }
    (async function () {
        try {
            for await (const x of handler) {
                await emit(type_1.EmitType.Next, x);
            }
            emit(type_1.EmitType.Complete);
        }
        catch (e) {
            emit(type_1.EmitType.Error, e);
        }
    })();
}
exports.race = race;
function reduce(resolve, reject, f, v) {
    let r = v;
    return async (...[t, x]) => {
        switch (t) {
            case type_1.EmitType.Next:
                r = await f(r, x);
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
    return async (...[t, x]) => {
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
    return async (...[t, x]) => {
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
    return async (...[t, x]) => {
        switch (t) {
            case type_1.EmitType.Next:
                const p = await f(x);
                if (!p) {
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
    return async (...[t, x]) => {
        switch (t) {
            case type_1.EmitType.Next:
                const p = await f(x);
                if (p) {
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
    return async (...[t, x]) => {
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
    return async (...[t, x]) => {
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
