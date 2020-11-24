import { EmitForm, Emitter, EmitType } from "./type";
import { Action } from "../../type";
import { create } from "./create";
import { PreCancel } from "./pre-cancel";

export interface RelayHandler<T> {
  (emit: EmitForm<T, any>): Action<void>;
}

export function relay<T>(handler: RelayHandler<T>): Emitter<T, any> {
  return (receiver: EmitForm<T, any>) => {
    let source_cancel: Action<void>;

    const source_pre_cancel = new PreCancel(() => source_cancel);

    const relay_emitter = create<T, any>((emit) => {
      source_cancel = handler(emit);
      
      source_pre_cancel.tryCancel();
    });

    const relay_receiver: EmitForm<T, any> = function (t, x?) {
      if (t !== EmitType.Next) {
        source_pre_cancel.cancel();
      }
      receiver(t as any, x);
    };

    const relay_cancel = relay_emitter(relay_receiver);

    const cancel = function () {
      relay_cancel();
      source_cancel();
    };

    return cancel;
  };
}
