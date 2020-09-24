"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const type_1 = require("../type");
function create(executor) {
    return (receiver) => {
        const handler = new EmitterHandler(receiver);
        handler.start(executor);
        const cancel = handler.cancel.bind(handler);
        return cancel;
    };
}
exports.create = create;
class EmitterHandler {
    constructor(receiver) {
        this.receive = receiver;
        this.open = true;
        this.queueBlock = Promise.resolve();
    }
    async start(executor) {
        await Promise.resolve();
        const receiver = this.handle.bind(this);
        try {
            executor(receiver);
        }
        catch {
            this.cancel();
        }
    }
    cancel() {
        this.receive = null;
        this.open = false;
    }
    async handle(...item) {
        const block = this.queueBlock;
        let unblock;
        this.queueBlock = new Promise((resolve) => (unblock = resolve));
        await block;
        await this.handleReceive(...item);
        unblock();
    }
    async handleReceive(...[t, x]) {
        if (this.open) {
            switch (t) {
                case type_1.EmitType.Next:
                    await this.next(x);
                    break;
                case type_1.EmitType.Complete:
                    this.complete();
                    break;
                case type_1.EmitType.Error:
                    this.error(x);
                    break;
            }
        }
    }
    async next(x) {
        try {
            await this.receive(type_1.EmitType.Next, x);
        }
        catch (e) {
            this.cancel();
            throw e;
        }
    }
    complete() {
        const receive = this.receive;
        this.cancel();
        receive(type_1.EmitType.Complete);
    }
    error(x) {
        const receive = this.receive;
        this.cancel();
        receive(type_1.EmitType.Error, x);
    }
}
