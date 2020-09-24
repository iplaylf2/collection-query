"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncBlock = void 0;
class AsyncBlock {
    constructor() {
        this._isBlock = false;
    }
    block() {
        if (this._isBlock) {
            throw "it was blocked";
        }
        this.blockPromise = new Promise((r) => (this.resolveBlock = r));
        this._isBlock = true;
    }
    unblock(x) {
        if (this._isBlock) {
            this._isBlock = false;
            this.resolveBlock(x);
        }
    }
    get isBlock() {
        return this._isBlock;
    }
    get wait() {
        return this.blockPromise;
    }
}
exports.AsyncBlock = AsyncBlock;
