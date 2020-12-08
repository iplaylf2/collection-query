import { Cancel, EmitForm, EmitItem, Emitter, EmitType } from "../type";
import { Action, Selector } from "../../../type";
import { create } from "../create";
import { LinkedList } from "../../../tool/linked-list";

export function groupBy<T, K>(
  emitter: Emitter<T>,
  emit: EmitForm<[K, Emitter<T>]>,
  expose: Action<Cancel>,
  f: Selector<T, K>
) {
  const group_dispatch = new Map<K, EmitForm<T>>();

  emitter((t, x?) => {
    switch (t) {
      case EmitType.Next:
        const k = f(x);
        const dispatch_emit = group_dispatch.get(k);
        if (dispatch_emit) {
          dispatch_emit(EmitType.Next, x);
        } else {
          let dispatch_emit!: EmitForm<T>;
          const cancel_dispatch = create<T>((emit) => {
            dispatch_emit = emit;
          })((...x) => {
            if (group_emit) {
              const open = group_emit(...x);
              if (!open) {
                cancel_dispatch();
              }
            } else {
              buffer.put(x);
            }
          });

          group_dispatch.set(k, dispatch_emit);

          const buffer = new LinkedList<EmitItem<T>>();
          buffer.put([EmitType.Next, x]);

          let group_emit: EmitForm<T>;
          const group_emitter = create<T>((emit) => {
            group_emit = emit;
            for (const x of buffer.dump()) {
              const open = group_emit(...x);
              if (!open) {
                cancel_dispatch();
                break;
              }
            }
          });

          emit(EmitType.Next, [k, group_emitter] as [K, Emitter<T>]);
        }
        break;
      case EmitType.Complete:
        for (const emit of group_dispatch.values()) {
          emit(EmitType.Complete);
        }
        break;
      case EmitType.Error:
        for (const emit of group_dispatch.values()) {
          emit(EmitType.Error, x);
        }
        break;
    }
  }, expose);
}
