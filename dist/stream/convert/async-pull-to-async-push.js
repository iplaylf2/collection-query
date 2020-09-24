"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.push = void 0;
const relay_1 = require("../push/async/relay");
const type_1 = require("../push/type");
const lazy_channel_1 = require("../../async-tool/lazy-channel");
function push(s) {
    return relay_1.relay((emit) => {
        const channel = new lazy_channel_1.LazyChannel();
        (async () => {
            try {
                for await (const x of s()) {
                    await channel.put([type_1.EmitType.Next, x]);
                }
                channel.put([type_1.EmitType.Complete]);
            }
            catch (e) {
                channel.put([type_1.EmitType.Error, e]);
            }
            channel.close();
        })();
        (async () => {
            while (true) {
                const [done, x] = await channel.take();
                if (done) {
                    break;
                }
                await emit(...x);
            }
        })();
        return channel.close.bind(channel);
    });
}
exports.push = push;
