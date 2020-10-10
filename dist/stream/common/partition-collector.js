"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionCollector = void 0;
class PartitionCollector {
    constructor(n) {
        this.n = n;
        this.partition = [];
    }
    collect(x) {
        this.partition.push(x);
        if (this.partition.length === this.n) {
            const result = this.partition;
            this.partition = [];
            return [true, result];
        }
        else {
            return [false];
        }
    }
    getRest() {
        return [(0 < this.partition.length), this.partition];
    }
}
exports.PartitionCollector = PartitionCollector;
