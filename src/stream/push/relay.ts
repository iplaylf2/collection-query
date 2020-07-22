import { EmitForm, Emitter } from "./type";
import { Action } from "../../type";
import { create } from "./create";

interface RelayHandler<T, Te> {
  (emit: EmitForm<T, Te>): Action<void>;
}

export function relay<T, Te>(handler: RelayHandler<T, Te>): Emitter<T, Te> {
  return (receiver: EmitForm<T, Te>) => {
    let cancelEarly = false;
    let sourceCancel: Action<void> = function () {
      cancelEarly = true;
    };

    const relayEmitter = create<T, Te>((emit) => {
      if (cancelEarly) {
        return;
      }

      sourceCancel = handler(emit);
    });

    const relayCancel = relayEmitter(receiver);

    const cancel = function () {
      relayCancel();
      sourceCancel();
    };

    return cancel;
  };
}
