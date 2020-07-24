"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relay = void 0;
const create_1 = require("./create");
function relay(handler) {
    return (receiver) => {
        let cancelEarly = false;
        let sourceCancel = function () {
            cancelEarly = true;
        };
        const relayEmitter = create_1.create((emit) => {
            if (cancelEarly) {
                return;
            }
            sourceCancel = handler(emit);
        });
        const relayCancel = relayEmitter(receiver);
        const cancel = function () {
            relayCancel();
            sourceCancel();
        };
        return cancel;
    };
}
exports.relay = relay;
