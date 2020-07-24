"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const type_1 = require("./type");
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
    handle(...[t, x]) {
        if (this.open) {
            switch (t) {
                case type_1.EmitType.Next:
                    this.next(x);
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
    next(x) {
        try {
            this.receive(type_1.EmitType.Next, x);
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
