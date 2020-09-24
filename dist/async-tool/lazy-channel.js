"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyChannel = void 0;
const async_block_1 = require("./async-block");
const linked_list_1 = require("./linked-list");
class LazyChannel {
    constructor() {
        this.buffer = new linked_list_1.LinkedList();
        this.putBlock = new async_block_1.AsyncBlock();
        this.takeBlock = new async_block_1.AsyncBlock();
        this._isClose = false;
    }
    async put(x) {
        if (this._isClose) {
            return false;
        }
        this.buffer.put(x);
        if (!this.putBlock.isBlock) {
            this.putBlock.block();
        }
        this.takeBlock.unblock();
        while (true) {
            await this.putBlock.wait;
            if (!this._isClose && 0 < this.buffer.length) {
                continue;
            }
            return this._isClose;
        }
    }
    async take() {
        while (true) {
            await this.takeBlock.wait;
            if (0 < this.buffer.length) {
                const result = this.buffer.take();
                return [false, result];
            }
            else {
                if (this._isClose) {
                    return [true];
                }
                else {
                    if (!this.takeBlock.isBlock) {
                        this.takeBlock.block();
                    }
                    this.putBlock.unblock();
                    continue;
                }
            }
        }
    }
    close() {
        if (!this._isClose) {
            this.putBlock.unblock();
            this.takeBlock.unblock();
            this._isClose = true;
        }
    }
}
exports.LazyChannel = LazyChannel;
