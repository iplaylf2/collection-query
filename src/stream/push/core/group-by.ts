import {
  Cancel,
  EmitForm,
  EmitItem,
  Emitter,
  EmitType,
  ReceiveForm,
} from "../type";
import { Action, Selector } from "../../../type";
import { create } from "../create";
import { LinkedList } from "../../../tool/linked-list";

export function groupBy<T, K>(
  emitter: Emitter<T>,
  emit: EmitForm<[K, Emitter<T>]>,
  expose: Action<Cancel>,
  f: Selector<T, K>
) {
  const group_dispatch = new Map<K, ReceiveForm<T>>();

  emitter((t, x?) => {
    switch (t) {
      case EmitType.Next:
        const k = f(x);
        const dispatch = group_dispatch.get(k);
        if (dispatch) {
          dispatch(EmitType.Next, x);
        } else {
          const dispatch: ReceiveForm<T> = function (...x) {
            if (group_emit) {
              const open = group_emit(...x);
              if (!open) {
                group_dispatch.set(k, () => {});
              }
            } else {
              buffer.put(x);
            }
          };

          group_dispatch.set(k, dispatch);

          const buffer = new LinkedList<EmitItem<T>>();
          buffer.put([EmitType.Next, x]);

          let group_emit: EmitForm<T>;
          const group_emitter = create<T>((emit) => {
            group_emit = emit;
            for (const x of buffer.dump()) {
              const open = group_emit(...x);
              if (!open) {
                group_dispatch.set(k, () => {});
                break;
              }
            }
          });

          emit(EmitType.Next, [k, group_emitter] as [K, Emitter<T>]);
        }
        break;
      case EmitType.Complete:
        for (const dispatch of group_dispatch.values()) {
          dispatch(EmitType.Complete);
        }
        break;
      case EmitType.Error:
        for (const dispatch of group_dispatch.values()) {
          dispatch(EmitType.Error, x);
        }
        break;
    }
  }, expose);
}
