"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.last = exports.first = exports.some = exports.every = exports.include = exports.count = exports.reduce = exports.race = exports.zip = exports.concat = exports.partitionBy = exports.partition = exports.skipWhile = exports.skip = exports.takeWhile = exports.take = exports.remove = exports.filter = exports.map = void 0;
const type_1 = require("../type");
const partition_collector_1 = require("../../common/partition-collector");
const async_partition_by_collector_1 = require("../../common/partition-by-collector/async-partition-by-collector");
const zip_handler_1 = require("../../common/async/zip-handler");
const race_handler_1 = require("../../common/async/race-handler");
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
function partition(emitter, emit, n) {
    if (!(0 < n)) {
        emit(type_1.EmitType.Complete);
        return () => { };
    }
    const collector = new partition_collector_1.PartitionCollector(n);
    return emitter(async (t, x) => {
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
    });
}
exports.partition = partition;
function partitionBy(emitter, emit, f) {
    const collector = new async_partition_by_collector_1.AsyncPartitionByCollector(f);
    return emitter(async (t, x) => {
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
    });
}
exports.partitionBy = partitionBy;
function concat(emitter1, emitter2, emit) {
    let cancel2 = function () { };
    const cancel1 = emitter1(async (t, x) => {
        switch (t) {
            case type_1.EmitType.Next:
                await emit(type_1.EmitType.Next, x);
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
function zip(ee, emit) {
    const total = ee.length;
    if (!(0 < total)) {
        emit(type_1.EmitType.Complete);
        return () => { };
    }
    const handler = new zip_handler_1.ZipHandler(total);
    let index = 0;
    const cancel_list = ee.map((emitter) => {
        const _index = index;
        index++;
        const cancel = emitter(async (t, x) => {
            switch (t) {
                case type_1.EmitType.Next:
                    (await handler.zip(_index, x)) || cancel();
                    break;
                case type_1.EmitType.Complete:
                    handler.end();
                    break;
                case type_1.EmitType.Error:
                    handler.crash(x);
                    break;
            }
        });
        return cancel;
    });
    const cancel = function () {
        for (const c of cancel_list) {
            c();
        }
        handler.end();
    };
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
    return cancel;
}
exports.zip = zip;
function race(ee, emit) {
    const total = ee.length;
    if (!(0 < total)) {
        emit(type_1.EmitType.Complete);
        return () => { };
    }
    const handler = new race_handler_1.RaceHandler(total);
    const cancel_list = ee.map((emitter) => {
        const cancel = emitter(async (t, x) => {
            switch (t) {
                case type_1.EmitType.Next:
                    (await handler.race(x)) || cancel();
                    break;
                case type_1.EmitType.Complete:
                    handler.leave();
                    break;
                case type_1.EmitType.Error:
                    handler.crash(x);
                    break;
            }
        });
        return cancel;
    });
    const cancel = function () {
        for (const c of cancel_list) {
            c();
        }
        handler.end();
    };
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
    return cancel;
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
