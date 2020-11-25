"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relay = void 0;
const create_1 = require("./create");
const type_1 = require("../type");
function relay(handler) {
    return (receiver, expose) => {
        let source_cancel;
        const relay_emitter = create_1.create((emit) => {
            handler(emit, (c) => {
                source_cancel = c;
            });
        });
        const relay_receiver = async function (t, x) {
            if (t !== type_1.EmitType.Next) {
                source_cancel();
            }
            await receiver(t, x);
        };
        let relay_cancel;
        const cancel = function () {
            relay_cancel();
            source_cancel();
        };
        if (expose) {
            expose(cancel);
        }
        relay_emitter(relay_receiver, (c) => {
            relay_cancel = c;
        });
        return cancel;
    };
}
exports.relay = relay;
