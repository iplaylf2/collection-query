"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const type_1 = require("./type");
function create(executor) {
    return (receiver, expose) => {
        const handler = new EmitterHandler(receiver);
        const cancel = handler.cancel.bind(handler);
        if (expose) {
            expose(cancel);
        }
        handler.start(executor);
        return cancel;
    };
}
exports.create = create;
class EmitterHandler {
    constructor(receiver) {
        this.receive = receiver;
        this.open = true;
    }
    start(executor) {
        const receiver = this.handle.bind(this);
        try {
            executor(receiver);
        }
        catch (e) {
            this.cancel();
            throw e;
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
        return this.open;
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
