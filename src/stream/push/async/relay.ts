import { EmitForm, Emitter } from "./type";
import { Action } from "../../../type";
import { create } from "./create";
import { EmitType } from "../type";

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

    const relay_receiver: EmitForm<T, any> = async function (t, x?) {
      if (t !== EmitType.Next) {
        source_cancel();
      }
      await receiver(t as any, x);
    };

    const relay_cancel = relay_emitter(relay_receiver);

    const cancel = function () {
      relay_cancel();
      source_cancel();
    };

    return cancel;
  };
}
