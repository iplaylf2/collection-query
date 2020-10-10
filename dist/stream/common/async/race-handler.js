"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaceHandler = void 0;
const controlled_iterator_1 = require("./controlled-iterator");
const lazy_channel_1 = require("../../../async-tool/lazy-channel");
class RaceHandler extends controlled_iterator_1.ControlledIterator {
    constructor(total) {
        super();
        this.count = total;
        this.channel = new lazy_channel_1.LazyChannel();
    }
    async race(x) {
        if (this.status === controlled_iterator_1.IteratorStatus.Running) {
            await this.channel.put(x);
            return this.status === controlled_iterator_1.IteratorStatus.Running;
        }
        else {
            return false;
        }
    }
    leave() {
        if (this.status === controlled_iterator_1.IteratorStatus.Running) {
            this.count--;
            if (!(0 < this.count)) {
                this.end();
            }
        }
    }
    async getNext() {
        const [, x] = await this.channel.take();
        return x;
    }
    onDispose() {
        this.channel.close();
    }
}
exports.RaceHandler = RaceHandler;
