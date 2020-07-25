"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pipe = void 0;
var type_1 = require("./stream/push/type");
Object.defineProperty(exports, "EmitType", { enumerable: true, get: function () { return type_1.EmitType; } });
function pipe(list) {
    return (s) => list.reduce((r, f) => f(r), s);
}
exports.pipe = pipe;
