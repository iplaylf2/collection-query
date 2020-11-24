import { EmitForm, Emitter } from "./type";
import { Action } from "../../../type";
import { create } from "./create";
import { Cancel, EmitType } from "../type";

export interface RelayHandler<T> {
  (emit: EmitForm<T, any>, expose: Action<Cancel>): void;
}

export function relay<T>(handler: RelayHandler<T>): Emitter<T, any> {
  return (receiver, expose) => {
    let source_cancel!: Cancel;

    const relay_emitter = create<T, any>((emit) => {
      handler(emit, (c) => {
        source_cancel = c;
      });
    });

    const relay_receiver: EmitForm<T, any> = async function (t, x?) {
      if (t !== EmitType.Next) {
        source_cancel();
      }
      await receiver(t as any, x);
    };

    let relay_cancel!: Cancel;

    const cancel = function () {
      relay_cancel();
      source_cancel();
    };

    if (expose) {
      expose(cancel);
    }
    relay_emitter(relay_receiver, (c) => {
      relay_cancel = c;
    });

    return cancel;
  };
}
