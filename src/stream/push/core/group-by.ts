import { EmitForm, Emitter, EmitType } from "../type";
import { Selector } from "../../../type";
import { Channel } from "../../../async-tool/channel";
import { create } from "../create";

export function groupBy<T, K>(
  emitter: Emitter<T, any>,
  emit: EmitForm<[K, Emitter<T, any>], any>,
  f: Selector<T, K>
) {
  const channel_dispatch = new Map<K, Channel<[boolean, any]>>();

  return emitter((t, x?) => {
    switch (t) {
      case EmitType.Next:
        const k = f(x);
        const channel = channel_dispatch.get(k);
        if (channel) {
          channel.put([true, x]);
        } else {
          const channel = new Channel<[boolean, any]>();
          channel.put([true, x]);
          channel_dispatch.set(k, channel);

          const group_emitter = create<T, any>(async (emit) => {
            while (true) {
              const [end, x] = await channel.take();
              if (end) {
                emit(EmitType.Complete);
                break;
              } else {
                const [ok, value] = x!;
                if (ok) {
                  emit(EmitType.Next, value);
                } else {
                  emit(EmitType.Error, value);
                  break;
                }
              }
            }
          });
          emit(EmitType.Next, [k, group_emitter] as [K, Emitter<T, any>]);
        }
        break;
      case EmitType.Complete:
        for (const channel of channel_dispatch.values()) {
          channel.close();
        }
        break;
      case EmitType.Error:
        for (const channel of channel_dispatch.values()) {
          channel.put([false, x]);
        }
        break;
    }
  });
}
