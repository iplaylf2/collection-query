"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zip = exports.concat = exports.flatten = exports.partitionBy = exports.partition = exports.skipWhile = exports.skip = exports.takeWhile = exports.take = exports.remove = exports.filter = exports.map = void 0;
const partition_collector_1 = require("../common/partition-collector");
const partition_by_collector_1 = require("../common/partition-by-collector/partition-by-collector");
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
        if (0 < n) {
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
        if (0 < n) {
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
function* partition(iterator, n) {
    const collector = new partition_collector_1.PartitionCollector(n);
    for (const x of iterator) {
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
function* partitionBy(iterator, f) {
    const collector = new partition_by_collector_1.PartitionByCollector(f);
    for (const x of iterator) {
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
exports.partitionBy = partitionBy;
function* flatten(iterator) {
    for (const xx of iterator) {
        for (const x of xx) {
            yield x;
        }
    }
}
exports.flatten = flatten;
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
        const ii_result = ii.map((i) => i.next());
        const done = ii_result.some(({ done }) => done);
        if (done) {
            break;
        }
        else {
            const result = ii_result.map(({ value }) => value);
            yield result;
        }
    }
}
exports.zip = zip;
