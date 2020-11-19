import { EmitForm, Emitter } from "./type";
import { Action } from "../../../type";
import { create } from "./create";

export interface RelayHandler<T> {
  (emit: EmitForm<T, any>): Action<void>;
}

export function relay<T>(handler: RelayHandler<T>): Emitter<T, any> {
  return (receiver: EmitForm<T, any>) => {
    let cancel_early = false;
    let source_cancel: Action<void> = function () {
      cancel_early = true;
    };

    const relay_emitter = create<T, any>((emit) => {
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
