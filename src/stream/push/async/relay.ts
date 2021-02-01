import { Emitter, EmitForm } from "./type";
import { Action } from "../../../type";
import { create } from "./create";
import { Cancel } from "../type";

export interface RelayHandler<T> {
  (emit: EmitForm<T>, expose: Action<Cancel>): void;
}

export function relay<T>(handler: RelayHandler<T>): Emitter<T> {
  return (receiver, expose) => {
    const relay_emitter = create<T>((emit) => {
      let source_cancel!: Cancel;

      handler(emit, (c) => {
        source_cancel = c;
      });

      return source_cancel;
    });

    return relay_emitter(receiver, (c) => {
      if (expose) {
        expose(c);
      }
    });
  };
}
