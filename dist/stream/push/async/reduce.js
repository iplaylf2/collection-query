"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reduce = void 0;
function reduce(handler) {
    return (emitter) => new Promise((resolve, reject) => {
        let cancel;
        const resolve_handle = function (x) {
            cancel();
            resolve(x);
        };
        const reject_handle = function (x) {
            cancel();
            reject(x);
        };
        const receiver = handler(resolve_handle, reject_handle);
        emitter(receiver, (c) => {
            cancel = c;
        });
    });
}
exports.reduce = reduce;
