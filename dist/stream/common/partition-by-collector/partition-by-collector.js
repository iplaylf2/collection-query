"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionByCollector = void 0;
const partition_by_collector_base_1 = require("./partition-by-collector-base");
class PartitionByCollector extends partition_by_collector_base_1.PartitionByCollectorBase {
    constructor(f) {
        super();
        this.f = f;
    }
    collect(x) {
        const key = this.f(x);
        return this.dispatch(key, x);
    }
}
exports.PartitionByCollector = PartitionByCollector;
