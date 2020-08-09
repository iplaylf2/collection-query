"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reduce = void 0;
function reduce(handler) {
    return (emitter) => new Promise((resolve, reject) => {
        const resolve_handle = function (x) {
            cancel();
            resolve(x);
        };
        const reject_handle = function (x) {
            cancel();
            reject(x);
        };
        const receiver = handler(resolve_handle, reject_handle);
        const cancel = emitter(receiver);
    });
}
exports.reduce = reduce;
