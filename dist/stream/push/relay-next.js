"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relayNext = void 0;
const type_1 = require("./type");
const relay_1 = require("./relay");
function relayNext(handler) {
    return (emitter) => relay_1.relay((emit) => {
        const handle_next = handler(emit);
        return emitter((t, x) => {
            switch (t) {
                case type_1.EmitType.Next:
                    handle_next(x);
                    break;
                case type_1.EmitType.Complete:
                    emit(t);
                    break;
                case type_1.EmitType.Error:
                    emit(t, x);
                    break;
            }
        });
    });
}
exports.relayNext = relayNext;
