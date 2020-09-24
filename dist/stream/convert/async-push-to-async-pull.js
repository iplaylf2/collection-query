"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pull = void 0;
const type_1 = require("../push/type");
const race_handler_1 = require("../common/async/race-handler");
function pull(s) {
    return async function* () {
        const handler = new race_handler_1.RaceHandler(1);
        const cancel = s(async (t, x) => {
            switch (t) {
                case type_1.EmitType.Next:
                    (await handler.race(x)) || cancel();
                    break;
                case type_1.EmitType.Complete:
                    handler.end();
                    break;
                case type_1.EmitType.Error:
                    handler.crash(x);
                    break;
            }
        });
        yield* handler;
    };
}
exports.pull = pull;
