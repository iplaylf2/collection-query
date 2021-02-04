import { Cancel, EmitForm, Emitter } from "./type";
import { Action } from "../../type";
import { create } from "./create";

export interface RelayHandler<T> {
  (emit: EmitForm<T>, expose: Action<Cancel>): void;
}

export function relay<T>(handler: RelayHandler<T>): Emitter<T> {
  return (receiver, expose) => {
    let relay_emit!: EmitForm<T>;
    let _source_cancel: Cancel;
    const source_cancel = function () {
      _source_cancel();
    };

    const relay_emitter = create<T>((emit) => {
      relay_emit = emit;
      return source_cancel;
    });

    const cancel = relay_emitter(receiver, (c) => {
      if (expose) {
        expose(c);
      }
    });

    handler(relay_emit, (c) => {
      _source_cancel = c;
    });

    return cancel;
  };
}
