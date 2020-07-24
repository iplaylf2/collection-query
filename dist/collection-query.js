"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pipe = void 0;
function pipe(list) {
    return (s) => list.reduce((r, f) => f(r), s);
}
exports.pipe = pipe;
