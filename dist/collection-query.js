"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transfer = exports.EmitType = void 0;
var type_1 = require("./stream/push/type");
Object.defineProperty(exports, "EmitType", { enumerable: true, get: function () { return type_1.EmitType; } });
function transfer(s, list) {
    return list.reduce((r, f) => f(r), s);
}
exports.transfer = transfer;
