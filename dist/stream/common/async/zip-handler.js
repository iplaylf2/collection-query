"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipHandler = void 0;
const controlled_iterator_1 = require("./controlled-iterator");
const async_block_1 = require("../../../async-tool/async-block");
const lazy_channel_1 = require("../../../async-tool/lazy-channel");
class ZipHandler extends controlled_iterator_1.ControlledIterator {
    constructor(total) {
        super();
        this.total = total;
        this.count = 0;
        this.content = new Array(total);
        this.channel = new lazy_channel_1.LazyChannel();
        this.zipBlock = new async_block_1.AsyncBlock();
    }
    async zip(i, x) {
        if (this.status === controlled_iterator_1.IteratorStatus.Running) {
            if (this.count === 0) {
                this.zipBlock.block();
            }
            this.count++;
            this.content[i] = x;
            if (this.count === this.total) {
                this.count = 0;
                await this.channel.put(this.content);
                this.zipBlock.unblock();
            }
            else {
                await this.zipBlock.wait;
            }
            return this.status === controlled_iterator_1.IteratorStatus.Running;
        }
        else {
            return false;
        }
    }
    async getNext() {
        const [, x] = await this.channel.take();
        return x;
    }
    onDispose() {
        this.channel.close();
        this.zipBlock.unblock();
    }
}
exports.ZipHandler = ZipHandler;
