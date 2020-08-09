import { EmitForm, Emitter } from "./type";
import { Action } from "../../type";
import { create } from "./create";

export interface RelayHandler<T, Te> {
  (emit: EmitForm<T, Te>): Action<void>;
}

export function relay<T, Te>(handler: RelayHandler<T, Te>): Emitter<T, Te> {
  return (receiver: EmitForm<T, Te>) => {
    let cancel_early = false;
    let source_cancel: Action<void> = function () {
      cancel_early = true;
    };

    const relay_emitter = create<T, Te>((emit) => {
      if (cancel_early) {
        return;
      }

      source_cancel = handler(emit);
    });

    const relay_cancel = relay_emitter(receiver);

    const cancel = function () {
      relay_cancel();
      source_cancel();
    };

    return cancel;
  };
}
