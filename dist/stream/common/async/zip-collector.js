"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipCollector = exports.ZipCollectorStatus = void 0;
var ZipCollectorStatus;
(function (ZipCollectorStatus) {
    ZipCollectorStatus[ZipCollectorStatus["Active"] = 0] = "Active";
    ZipCollectorStatus[ZipCollectorStatus["Pending"] = 1] = "Pending";
    ZipCollectorStatus[ZipCollectorStatus["End"] = 2] = "End";
    ZipCollectorStatus[ZipCollectorStatus["Crash"] = 3] = "Crash";
})(ZipCollectorStatus = exports.ZipCollectorStatus || (exports.ZipCollectorStatus = {}));
class ZipCollector {
    constructor(total) {
        this.total = total;
        this.count = 0;
        this.content = new Array(total);
        this.status = ZipCollectorStatus.Pending;
        this.blockPromise = new Promise((resolve) => (this.unblock = resolve));
    }
    async zip(i, x) {
        begin: switch (this.status) {
            case ZipCollectorStatus.Active:
                this.count++;
                this.content[i] = x;
                if (this.count === this.total) {
                    this.count = 0;
                    this.status = ZipCollectorStatus.Pending;
                    this.setNextResult([false, this.content]);
                }
                return this.blockPromise;
            case ZipCollectorStatus.Pending:
                await this.blockPromise;
                break begin;
            case ZipCollectorStatus.End:
                break;
            case ZipCollectorStatus.Crash:
                this.alreadyCrash();
        }
    }
    leave() {
        switch (this.status) {
            case ZipCollectorStatus.Active:
                this.status = ZipCollectorStatus.End;
                this.content = null;
                this.setNextResult([true]);
                break;
            case ZipCollectorStatus.Pending:
                this.status = ZipCollectorStatus.End;
                this.content = null;
                break;
            case ZipCollectorStatus.End:
                break;
            case ZipCollectorStatus.Crash:
                this.alreadyCrash();
        }
    }
    crash(e) {
        switch (this.status) {
            case ZipCollectorStatus.Active:
                this.status = ZipCollectorStatus.Crash;
                this.content = null;
                this.setNextError(e);
                break;
            case ZipCollectorStatus.Pending:
                this.status = ZipCollectorStatus.Crash;
                this.content = null;
                this.error = e;
                break;
            case ZipCollectorStatus.End:
                throw "never";
            case ZipCollectorStatus.Crash:
                this.alreadyCrash();
        }
    }
    async next() {
        switch (this.status) {
            case ZipCollectorStatus.Active:
                throw "never";
            case ZipCollectorStatus.Pending:
                this.status = ZipCollectorStatus.Active;
                this.unblock();
                this.blockPromise = new Promise((resolve) => (this.unblock = resolve));
                this.nextPromise = new Promise((resolve, reject) => ((this.setNextResult = resolve), (this.setNextError = reject)));
                return this.nextPromise;
            case ZipCollectorStatus.End:
                return [true];
            case ZipCollectorStatus.Crash:
                throw this.error;
        }
    }
    getStatus() {
        return this.status;
    }
    alreadyCrash() {
        throw "zip collector crash";
    }
}
exports.ZipCollector = ZipCollector;
