"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncPartitionByCollector = void 0;
const partition_by_collector_base_1 = require("./partition-by-collector-base");
class AsyncPartitionByCollector extends partition_by_collector_base_1.PartitionByCollectorBase {
    constructor(f) {
        super();
        this.f = f;
    }
    async collect(x) {
        const key = await this.f(x);
        return this.dispatch(key, x);
    }
}
exports.AsyncPartitionByCollector = AsyncPartitionByCollector;
