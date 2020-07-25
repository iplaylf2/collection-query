"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reduce = void 0;
function reduce(handler) {
    return (emitter) => new Promise((resolve, reject) => {
        const resolveHandle = function (x) {
            cancel();
            resolve(x);
        };
        const rejectHandle = function (x) {
            cancel();
            reject(x);
        };
        const receiver = handler(resolveHandle, rejectHandle);
        const cancel = emitter(receiver);
    });
}
exports.reduce = reduce;
