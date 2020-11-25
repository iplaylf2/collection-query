"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupBy = void 0;
const type_1 = require("../type");
const channel_1 = require("../../../async-tool/channel");
const create_1 = require("../create");
function groupBy(emitter, emit, expose, f) {
    const channel_dispatch = new Map();
    emitter((t, x) => {
        switch (t) {
            case type_1.EmitType.Next:
                const k = f(x);
                const channel = channel_dispatch.get(k);
                if (channel) {
                    channel.put([true, x]);
                }
                else {
                    const channel = new channel_1.Channel();
                    channel.put([true, x]);
                    channel_dispatch.set(k, channel);
                    const group_emitter = create_1.create(async (emit) => {
                        while (true) {
                            const [end, x] = await channel.take();
                            if (end) {
                                emit(type_1.EmitType.Complete);
                                break;
                            }
                            else {
                                const [ok, value] = x;
                                if (ok) {
                                    emit(type_1.EmitType.Next, value);
                                }
                                else {
                                    emit(type_1.EmitType.Error, value);
                                    break;
                                }
                            }
                        }
                    });
                    emit(type_1.EmitType.Next, [k, group_emitter]);
                }
                break;
            case type_1.EmitType.Complete:
                for (const channel of channel_dispatch.values()) {
                    channel.close();
                }
                break;
            case type_1.EmitType.Error:
                for (const channel of channel_dispatch.values()) {
                    channel.put([false, x]);
                }
                break;
        }
    }, expose);
}
exports.groupBy = groupBy;
