"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFrom = void 0;
const create_1 = require("./create");
const type_1 = require("../type");
function createFrom(i) {
    return create_1.create(async function (emit) {
        try {
            for (const x of i) {
                await emit(type_1.EmitType.Next, x);
            }
            emit(type_1.EmitType.Complete);
        }
        catch (e) {
            emit(type_1.EmitType.Error, e);
        }
    });
}
exports.createFrom = createFrom;
