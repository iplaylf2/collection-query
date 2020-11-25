"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Channel = void 0;
const async_block_1 = require("./async-block");
const linked_list_1 = require("./linked-list");
class Channel {
    constructor(limit = Infinity) {
        this._limit = 0 < limit ? limit : 1;
        this.buffer = new linked_list_1.LinkedList();
        this.takeBlock = new async_block_1.AsyncBlock();
        this.takeBlock.block();
        this._isClose = false;
    }
    put(x) {
        if (this.buffer.length < this._limit) {
            this.buffer.put(x);
            if (1 === this.buffer.length) {
                this.takeBlock.unblock();
            }
            return true;
        }
        else {
            return false;
        }
    }
    async take() {
        while (true) {
            await this.takeBlock.wait;
            if (this._isClose) {
                if (0 < this.buffer.length) {
                    return [false, this.buffer.take()];
                }
                else {
                    return [true];
                }
            }
            else {
                if (0 < this.buffer.length) {
                    const x = this.buffer.take();
                    if (0 === this.buffer.length) {
                        this.takeBlock.block();
                    }
                    return [false, x];
                }
                else {
                    continue;
                }
            }
        }
    }
    close() {
        if (!this.isClose) {
            this.takeBlock.unblock();
            this._isClose = true;
        }
    }
    get limit() {
        return this._limit;
    }
    get length() {
        return this.buffer.length;
    }
    get isClose() {
        return this._isClose;
    }
}
exports.Channel = Channel;
