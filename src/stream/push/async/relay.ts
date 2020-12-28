import { Emitter, EmitForm } from "./type";
import { Action } from "../../../type";
import { create } from "./create";
import { Cancel } from "../type";

export interface RelayHandler<T> {
  (emit: EmitForm<T>, expose: Action<Cancel>): void;
}

export function relay<T>(handler: RelayHandler<T>): Emitter<T> {
  return (receiver, expose) => {
    const cancel = function () {
      relay_cancel();
      source_cancel();
    };

    let source_cancel!: Cancel;

    const relay_emitter = create<T>((emit) => {
      handler(
        async (...x) => {
          const open = await emit(...x);

          if (!open) {
            source_cancel();
          }
          return open;
        },
        (c) => {
          source_cancel = c;
        }
      );
    });

    let relay_cancel!: Cancel;
    relay_emitter(receiver, (c) => {
      relay_cancel = c;

      if (expose) {
        expose(cancel);
      }
    });

    return cancel;
  };
}
