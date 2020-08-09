"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.race = exports.zip = exports.concat = exports.partitionBy = exports.partition = exports.skipWhile = exports.skip = exports.takeWhile = exports.take = exports.remove = exports.filter = exports.map = void 0;
const partition_collector_1 = require("../../common/partition-collector");
const async_partition_by_collector_1 = require("../../common/partition-by-collector/async-partition-by-collector");
const zip_collector_1 = require("../../common/async/zip-collector");
const race_dispatcher_1 = require("../../common/async/race-dispatcher");
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
async function* partition(iterator, n) {
    const collector = new partition_collector_1.PartitionCollector(n);
    for await (const x of iterator) {
        const [full, partition] = collector.collect(x);
        if (full) {
            yield partition;
        }
    }
    const [rest, partition] = collector.getRest();
    if (rest) {
        yield partition;
    }
}
exports.partition = partition;
async function* partitionBy(iterator, f) {
    const collector = new async_partition_by_collector_1.AsyncPartitionByCollector(f);
    for await (const x of iterator) {
        const [full, partition] = await collector.collect(x);
        if (full) {
            yield partition;
        }
    }
    const [rest, partition] = collector.getRest();
    if (rest) {
        yield partition;
    }
}
exports.partitionBy = partitionBy;
async function* concat(s1, s2) {
    for await (const x of s1()) {
        yield x;
    }
    for await (const x of s2()) {
        yield x;
    }
}
exports.concat = concat;
async function* zip(ss) {
    const total = ss.length;
    if (!(total > 0)) {
        return;
    }
    const collector = new zip_collector_1.ZipCollector(total);
    let index = 0;
    ss.map((s) => [s(), index++]).forEach(async ([i, index]) => {
        while (true) {
            try {
                var { done, value } = await i.next();
            }
            catch (e) {
                collector.crash(e);
                return;
            }
            switch (collector.getStatus()) {
                case zip_collector_1.ZipCollectorStatus.Active:
                    break;
                default:
                    return;
            }
            if (done) {
                break;
            }
            await collector.zip(index, value);
        }
        collector.leave();
    });
    while (true) {
        const [done, x] = await collector.next();
        if (done) {
            break;
        }
        yield x;
    }
}
exports.zip = zip;
async function* race(ss) {
    const total = ss.length;
    if (!(total > 0)) {
        return;
    }
    const dispatcher = new race_dispatcher_1.RaceDispatcher(total);
    ss.map((s) => s()).forEach(async (i) => {
        while (true) {
            try {
                var { done, value } = await i.next();
            }
            catch (e) {
                dispatcher.crash(e);
                return;
            }
            if (dispatcher.getStatus() === race_dispatcher_1.RaceDispatcherStatus.Crash) {
                return;
            }
            if (done) {
                break;
            }
            await dispatcher.race(value);
        }
        dispatcher.leave();
    });
    while (true) {
        const [done, x] = await dispatcher.next();
        if (done) {
            break;
        }
        yield x;
    }
}
exports.race = race;
