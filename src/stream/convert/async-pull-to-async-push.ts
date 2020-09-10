import { AsyncPullStream, AsyncPushStream } from "../type";
import { relay } from "../push/async/relay";
import { EmitType, EmitItem } from "../push/type";
import { Channel } from "../../channel";

export function push<T>(s: AsyncPullStream<T>): AsyncPushStream<T, any> {
  return relay((emit) => {
    const channel = new Channel<EmitItem<T, any>>();

    (async () => {
      try {
        for await (const x of s()) {
          await channel.put([EmitType.Next, x]);
        }
        channel.put([EmitType.Complete]);
      } catch (e) {
        channel.put([EmitType.Error, e]);
      }

      channel.close();
    })();

    (async () => {
      while (true) {
        const [done, x] = await channel.take();
        if (done) {
          break;
        }

        emit(...x!);
      }
    })();

    return channel.close.bind(channel);
  });
}
