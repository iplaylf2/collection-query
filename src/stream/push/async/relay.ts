import { Emitter, EmitForm } from "./type";
import { Action } from "../../../type";
import { create } from "./create";
import { Cancel } from "../type";

export interface RelayHandler<T> {
  (emit: EmitForm<T>, expose: Action<Cancel>): void;
}

export function relay<T>(handler: RelayHandler<T>): Emitter<T> {
  return (receiver, expose) => {
    let _source_cancel!: Cancel;
    const source_cancel = function () {
      _source_cancel();
    };

    const relay_emitter = create<T>((emit) => {
      handler(emit, (c) => {
        _source_cancel = c;
      });
    });
    return relay_emitter(receiver, (c) => {
      if (expose) {
        const dispose = expose(c);
        if (dispose) {
          return () => {
            try {
              source_cancel();
            } finally {
              dispose();
            }
          };
        }
      }

      return source_cancel;
    });
  };
}
