"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlledIterator = exports.IteratorStatus = void 0;
var IteratorStatus;
(function (IteratorStatus) {
    IteratorStatus[IteratorStatus["Running"] = 0] = "Running";
    IteratorStatus[IteratorStatus["End"] = 1] = "End";
    IteratorStatus[IteratorStatus["Crash"] = 2] = "Crash";
})(IteratorStatus = exports.IteratorStatus || (exports.IteratorStatus = {}));
class ControlledIterator {
    constructor() {
        this._status = IteratorStatus.Running;
    }
    [Symbol.asyncIterator]() {
        return this;
    }
    async next() {
        const x = await this.getNext();
        switch (this._status) {
            case IteratorStatus.Running:
                return { done: false, value: x };
            case IteratorStatus.End:
                return { done: true, value: undefined };
            case IteratorStatus.Crash:
                this._status = IteratorStatus.End;
                throw this.error;
        }
    }
    async return() {
        this.end();
        return { done: true, value: undefined };
    }
    end() {
        if (this._status === IteratorStatus.Running) {
            this.onDispose();
            this._status = IteratorStatus.End;
        }
    }
    crash(error) {
        if (this._status === IteratorStatus.Running) {
            this.onDispose();
            this.error = error;
            this._status = IteratorStatus.Crash;
        }
    }
    get status() {
        return this._status;
    }
}
exports.ControlledIterator = ControlledIterator;
