"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionByCollectorBase = void 0;
class PartitionByCollectorBase {
    constructor() {
        this.partition = [];
        this.start = false;
    }
    getRest() {
        return [(this.partition.length > 0), this.partition];
    }
    dispatch(key, x) {
        if (!this.start) {
            this.start = true;
            this.key = key;
        }
        if (key === this.key) {
            this.partition.push(x);
            return [false];
        }
        else {
            this.key = key;
            const result = this.partition;
            this.partition = [x];
            return [true, result];
        }
    }
}
exports.PartitionByCollectorBase = PartitionByCollectorBase;
