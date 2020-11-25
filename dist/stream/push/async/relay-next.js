"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relayNext = void 0;
const relay_1 = require("./relay");
const type_1 = require("../type");
function relayNext(handler) {
    return (emitter) => relay_1.relay((emit, expose) => {
        const handle_next = handler(emit);
        emitter(async (t, x) => {
            switch (t) {
                case type_1.EmitType.Next:
                    await handle_next(x);
                    break;
                case type_1.EmitType.Complete:
                    emit(t);
                    break;
                case type_1.EmitType.Error:
                    emit(t, x);
                    break;
            }
        }, expose);
    });
}
exports.relayNext = relayNext;
