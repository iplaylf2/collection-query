"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaceDispatcher = exports.RaceDispatcherStatus = void 0;
var RaceDispatcherStatus;
(function (RaceDispatcherStatus) {
    RaceDispatcherStatus[RaceDispatcherStatus["Active"] = 0] = "Active";
    RaceDispatcherStatus[RaceDispatcherStatus["Pending"] = 1] = "Pending";
    RaceDispatcherStatus[RaceDispatcherStatus["Crash"] = 2] = "Crash";
})(RaceDispatcherStatus = exports.RaceDispatcherStatus || (exports.RaceDispatcherStatus = {}));
class RaceDispatcher {
    constructor(total) {
        this.count = total;
        this.pending();
    }
    async race(x) {
        begin: switch (this.status) {
            case RaceDispatcherStatus.Active:
                this.pending();
                this.setNextResult([false, x]);
                return this.blockPromise;
            case RaceDispatcherStatus.Pending:
                await this.blockPromise;
                break begin;
            case RaceDispatcherStatus.Crash:
                this.alreadyCrash();
        }
    }
    leave() {
        switch (this.status) {
            case RaceDispatcherStatus.Active:
                this.count--;
                if (!(this.count > 0)) {
                    this.setNextResult([true]);
                }
                break;
            case RaceDispatcherStatus.Pending:
                throw "never";
            case RaceDispatcherStatus.Crash:
                this.alreadyCrash();
        }
    }
    crash(e) {
        switch (this.status) {
            case RaceDispatcherStatus.Active:
                this.status = RaceDispatcherStatus.Crash;
                this.setNextError(e);
                break;
            case RaceDispatcherStatus.Pending:
                this.status = RaceDispatcherStatus.Crash;
                this.error = e;
                break;
            case RaceDispatcherStatus.Crash:
                this.alreadyCrash();
        }
    }
    async next() {
        switch (this.status) {
            case RaceDispatcherStatus.Active:
                throw "never";
            case RaceDispatcherStatus.Pending:
                this.status = RaceDispatcherStatus.Active;
                this.nextPromise = new Promise((resolve, reject) => ((this.setNextResult = resolve), (this.setNextError = reject)));
                this.unblock();
                return this.nextPromise;
            case RaceDispatcherStatus.Crash:
                throw this.error;
        }
    }
    getStatus() {
        return this.status;
    }
    pending() {
        this.status = RaceDispatcherStatus.Pending;
        this.blockPromise = new Promise((resolve) => (this.unblock = resolve));
    }
    alreadyCrash() {
        throw "race dispatcher crash";
    }
}
exports.RaceDispatcher = RaceDispatcher;
