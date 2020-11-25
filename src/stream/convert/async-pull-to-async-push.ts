import { AsyncPullStream, AsyncPushStream } from "../type";
import { relay } from "../push/async/relay";
import { EmitType, EmitItem } from "../push/type";
import { LazyChannel } from "../../async-tool/lazy-channel";

export function push<T>(s: AsyncPullStream<T>): AsyncPushStream<T, any> {
  return relay((emit, expose) => {
    const channel = new LazyChannel<EmitItem<T, any>>();

    expose(() => channel.close());

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

        await emit(...x!);
      }
    })();
  });
}
