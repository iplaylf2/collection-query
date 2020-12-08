import { Cancel, EmitForm, Emitter, EmitType } from "../type";
import { Action, Selector } from "../../../type";
import { Channel } from "../../../tool/channel";
import { create } from "../create";

export function groupBy<T, K>(
  emitter: Emitter<T>,
  emit: EmitForm<[K, Emitter<T>]>,
  expose: Action<Cancel>,
  f: Selector<T, K>
) {
  const channel_dispatch = new Map<K, Channel<[boolean, any]>>();

  emitter((t, x?) => {
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

          const group_emitter = create<T>(async (emit) => {
            while (true) {
              const [end, x] = await channel.dump();
              if (end) {
                emit(EmitType.Complete);
                return;
              } else {
                for (const [ok, value] of x!) {
                  if (ok) {
                    emit(EmitType.Next, value);
                  } else {
                    emit(EmitType.Error, value);
                    return;
                  }
                }
              }
            }
          });
          emit(EmitType.Next, [k, group_emitter] as [K, Emitter<T>]);
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
  }, expose);
}
